import { shiftDate, toDateKey } from "../lib/date";
import type { TaskStoreState } from "./model";

export type SuggestionCard = {
  id: string;
  title: string;
  body: string;
  tone: "steady" | "warning" | "opportunity";
};

export type SuggestionsDigest = {
  summary: string;
  cards: SuggestionCard[];
  metrics: {
    completionRate: number;
    dueTodayCount: number;
    completedTodayCount: number;
    missedCount: number;
    rescheduledCount: number;
  };
  snapshot: {
    bestWindow: string | null;
    overloadedDate: string | null;
    slippingTask: string | null;
    neglectedList: string | null;
  };
};

type TimeBucket = "morning" | "afternoon" | "evening";

export function buildSuggestionsDigest(
  state: TaskStoreState,
  todayKey = toDateKey(new Date())
): SuggestionsDigest {
  const recentThreshold = toDateKey(shiftDate(new Date(), -6));
  const recentInstances = state.instances.filter((instance) => instance.date >= recentThreshold);
  const activeToday = state.instances.filter((instance) => instance.date === todayKey);
  const relevantRecent = recentInstances.filter((instance) => instance.status !== "cancelled");
  const completedRecent = relevantRecent.filter((instance) => instance.status === "completed");
  const completionRate = relevantRecent.length
    ? completedRecent.length / relevantRecent.length
    : 0;

  const bucketStats = buildBucketStats(relevantRecent);
  const bestWindow = pickBestWindow(bucketStats);
  const slippingTask = pickSlippingTaskTitle(state, recentInstances);
  const overloadedDate = pickOverloadedDate(recentInstances);
  const neglectedList = pickNeglectedListName(state, recentInstances);
  const dueTodayCount = activeToday.filter(
    (instance) => instance.status === "scheduled" || instance.status === "rescheduled"
  ).length;
  const completedTodayCount = activeToday.filter((instance) => instance.status === "completed").length;
  const missedCount = recentInstances.filter((instance) => instance.status === "missed").length;
  const rescheduledCount = recentInstances.filter((instance) => instance.status === "rescheduled").length;

  const cards: SuggestionCard[] = [];

  if (bestWindow) {
    cards.push({
      id: "best-window",
      title: `${capitalize(bestWindow)} is your steadiest window`,
      body: `Completions are landing more reliably there, so protect that block for work that matters.`,
      tone: "steady"
    });
  }

  if (slippingTask) {
    cards.push({
      id: "slipping-task",
      title: `${slippingTask} keeps slipping`,
      body: `That task has been missed or moved more than once recently, so it probably needs a lighter setup or an earlier slot.`,
      tone: "warning"
    });
  }

  if (overloadedDate) {
    cards.push({
      id: "overloaded-day",
      title: "One recent day carried too much",
      body: `${overloadedDate} absorbed the most task pressure. Spreading one or two items out would likely make the week calmer.`,
      tone: "warning"
    });
  }

  if (neglectedList) {
    cards.push({
      id: "neglected-list",
      title: `${neglectedList} is going quiet`,
      body: `That area has active tasks but no recent completions, which usually means it needs a smaller first step.`,
      tone: "opportunity"
    });
  }

  if (cards.length === 0) {
    cards.push({
      id: "steady-baseline",
      title: "The pattern is still small",
      body: "Keep logging completions, misses, and reschedules for a few more days and the suggestions will sharpen.",
      tone: "steady"
    });
  }

  return {
    summary: buildSummary({
      completionRate,
      dueTodayCount,
      completedTodayCount,
      bestWindow,
      slippingTask
    }),
    cards: cards.slice(0, 4),
    metrics: {
      completionRate,
      dueTodayCount,
      completedTodayCount,
      missedCount,
      rescheduledCount
    },
    snapshot: {
      bestWindow,
      overloadedDate,
      slippingTask,
      neglectedList
    }
  };
}

function buildBucketStats(instances: TaskStoreState["instances"]) {
  const stats: Record<TimeBucket, { total: number; completed: number }> = {
    morning: { total: 0, completed: 0 },
    afternoon: { total: 0, completed: 0 },
    evening: { total: 0, completed: 0 }
  };

  instances.forEach((instance) => {
    const bucket = bucketForTime(instance.scheduledTime);
    stats[bucket].total += 1;
    if (instance.status === "completed") {
      stats[bucket].completed += 1;
    }
  });

  return stats;
}

function pickBestWindow(stats: Record<TimeBucket, { total: number; completed: number }>) {
  const ranked = (Object.entries(stats) as Array<[TimeBucket, { total: number; completed: number }]>)
    .filter(([, value]) => value.total > 0)
    .sort((left, right) => {
      const leftRate = left[1].completed / left[1].total;
      const rightRate = right[1].completed / right[1].total;
      return rightRate - leftRate;
    });

  return ranked[0]?.[0] ?? null;
}

function pickSlippingTaskTitle(state: TaskStoreState, instances: TaskStoreState["instances"]) {
  const counts = new Map<string, number>();

  instances.forEach((instance) => {
    if (instance.status === "missed" || instance.status === "rescheduled") {
      counts.set(instance.templateId, (counts.get(instance.templateId) ?? 0) + 1);
    }
  });

  const ranked = [...counts.entries()].sort((left, right) => right[1] - left[1]);
  if (!ranked[0] || ranked[0][1] < 2) {
    return null;
  }

  return state.templates.find((template) => template.id === ranked[0][0])?.title ?? null;
}

function pickOverloadedDate(instances: TaskStoreState["instances"]) {
  const counts = new Map<string, number>();

  instances.forEach((instance) => {
    counts.set(instance.date, (counts.get(instance.date) ?? 0) + 1);
  });

  const ranked = [...counts.entries()].sort((left, right) => right[1] - left[1]);
  if (!ranked[0] || ranked[0][1] < 4) {
    return null;
  }

  return ranked[0][0];
}

function pickNeglectedListName(state: TaskStoreState, instances: TaskStoreState["instances"]) {
  const completionByList = new Map<string, number>();

  instances.forEach((instance) => {
    if (instance.status !== "completed") {
      return;
    }

    const template = state.templates.find((entry) => entry.id === instance.templateId);
    if (!template) {
      return;
    }

    completionByList.set(template.listId, (completionByList.get(template.listId) ?? 0) + 1);
  });

  const neglected = state.lists.find((list) => {
    const hasActiveTemplates = state.templates.some(
      (template) => template.listId === list.id && !template.archivedAt
    );

    return hasActiveTemplates && !completionByList.get(list.id);
  });

  return neglected?.name ?? null;
}

function buildSummary(input: {
  completionRate: number;
  dueTodayCount: number;
  completedTodayCount: number;
  bestWindow: string | null;
  slippingTask: string | null;
}) {
  const completionPercent = Math.round(input.completionRate * 100);

  if (input.slippingTask) {
    return `${input.completedTodayCount} done today, ${input.dueTodayCount} still open. ${input.slippingTask} is the main pattern to tighten next.`;
  }

  if (input.bestWindow) {
    return `${completionPercent}% of recent task instances were completed, and ${input.bestWindow} looks like your most dependable window.`;
  }

  return `${input.completedTodayCount} done today, ${input.dueTodayCount} still open. The app needs a little more history before the patterns get sharper.`;
}

function bucketForTime(time: string): TimeBucket {
  if (time < "12:00") {
    return "morning";
  }

  if (time < "17:00") {
    return "afternoon";
  }

  return "evening";
}

function capitalize(value: string) {
  return `${value.slice(0, 1).toUpperCase()}${value.slice(1)}`;
}
