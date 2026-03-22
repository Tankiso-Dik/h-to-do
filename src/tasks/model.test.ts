import { describe, expect, it } from "vitest";
import { shiftDate, toDateKey } from "../lib/date";
import {
  buildInitialState,
  completeTaskInState,
  dismissReminderInState,
  ensureTodayInstances,
  getDueReminders,
  getMissedTasks,
  getTodayTasks,
  markReminderNotifiedInState,
  missTaskInState,
  rescheduleTaskInState
} from "./model";

describe("task model", () => {
  it("adds today instances for active templates that do not have one", () => {
    const state = buildInitialState();
    const tomorrow = toDateKey(shiftDate(new Date(), 1));
    const clearedToday = {
      ...state,
      instances: state.instances.filter((instance) => instance.date !== tomorrow)
    };

    const withTomorrow = ensureTodayInstances(clearedToday, tomorrow);
    const tomorrowInstances = withTomorrow.instances.filter((instance) => instance.date === tomorrow);

    expect(tomorrowInstances.length).toBe(4);
  });

  it("marks a task completed with comment and reflection", () => {
    const state = buildInitialState();
    const next = completeTaskInState(state, "template-plan-tomorrow", {
      comment: "Wrapped the day before dinner.",
      reflection: "Planning earlier lowers the evening drag.",
      now: new Date(`${toDateKey(new Date())}T18:10:00`)
    });

    const instance = next.instances.find(
      (entry) =>
        entry.templateId === "template-plan-tomorrow" && entry.date === toDateKey(new Date())
    );

    expect(instance?.status).toBe("completed");
    expect(instance?.completionComment).toBe("Wrapped the day before dinner.");
    expect(instance?.reflection).toBe("Planning earlier lowers the evening drag.");
  });

  it("ships with seeded today and missed history for previewing the flows", () => {
    const state = buildInitialState();
    const todayTasks = getTodayTasks(state);
    const missedItems = getMissedTasks(state);
    const dueReminders = getDueReminders(state);

    expect(todayTasks.length).toBe(4);
    expect(todayTasks.some((task) => task.instance.status === "completed")).toBe(true);
    expect(todayTasks.some((task) => task.instance.status === "rescheduled")).toBe(true);
    expect(missedItems.length).toBe(2);
    expect(missedItems[0]?.template.title).toBe("Deep work block");
    expect(dueReminders.length).toBeGreaterThanOrEqual(1);
    expect(dueReminders.some((entry) => entry.template.title === "Plan tomorrow")).toBe(true);
  });

  it("reschedules and misses instances with visible history ordering", () => {
    const state = buildInitialState();
    const rescheduled = rescheduleTaskInState(state, "template-walk", {
      scheduledTime: "14:00",
      reason: "Lunch overran."
    });
    const missed = missTaskInState(rescheduled, "template-plan-tomorrow", {
      reason: "Energy cratered before shutdown.",
      reflection: "Needs to happen before 17:30."
    });

    const todayPlan = missed.instances.find(
      (entry) =>
        entry.templateId === "template-plan-tomorrow" && entry.date === toDateKey(new Date())
    );
    const todayWalk = missed.instances.find(
      (entry) => entry.templateId === "template-walk" && entry.date === toDateKey(new Date())
    );
    const missedItems = getMissedTasks(missed);

    expect(todayWalk?.status).toBe("rescheduled");
    expect(todayWalk?.scheduledTime).toBe("14:00");
    expect(todayPlan?.status).toBe("missed");
    expect(missedItems[0]?.instance.templateId).toBe("template-plan-tomorrow");
  });

  it("can notify and dismiss reminder instances without changing the task itself", () => {
    const state = buildInitialState();
    const notified = markReminderNotifiedInState(state, "template-plan-tomorrow");
    const dismissed = dismissReminderInState(notified, "template-plan-tomorrow");

    const instance = dismissed.instances.find(
      (entry) =>
        entry.templateId === "template-plan-tomorrow" && entry.date === toDateKey(new Date())
    );

    expect(instance?.status).toBe("scheduled");
    expect(instance?.reminderNotifiedAt).toBeTruthy();
    expect(instance?.reminderDismissedAt).toBeTruthy();
  });
});
