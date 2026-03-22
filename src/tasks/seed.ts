import type { TaskDraft, TaskInstance, TaskList, TaskTemplate } from "./types";
import { shiftDate, toDateKey } from "../lib/date";
import { buildReminderState, reminderLabelForPreset } from "./reminders";

const todayKey = toDateKey(new Date());
const yesterdayKey = toDateKey(shiftDate(new Date(), -1));
const twoDaysAgoKey = toDateKey(shiftDate(new Date(), -2));
const reminderDueNowIso = new Date(Date.now() - 5 * 60 * 1000).toISOString();

export const defaultLists: TaskList[] = [
  {
    id: "list-personal",
    name: "Personal",
    description: "The quiet maintenance work that keeps the day stable.",
    tone: "forest",
    archived: false
  },
  {
    id: "list-work",
    name: "Work",
    description: "The tasks that need a deliberate output, not just attention.",
    tone: "sky",
    archived: false
  },
  {
    id: "list-health",
    name: "Health",
    description: "Energy, breaks, and recovery deserve explicit room.",
    tone: "amber",
    archived: false
  }
];

export const defaultTemplates: TaskTemplate[] = [
  {
    id: "template-morning-check",
    title: "Morning systems check",
    note: "Review what matters before opening anything noisy.",
    listId: "list-personal",
    preferredTime: "08:15",
    reminderPreset: "before-15",
    reminderLabel: reminderLabelForPreset("before-15"),
    recurrence: "daily",
    recurrenceLabel: "Every day",
    active: true,
    archivedAt: null,
    createdAt: `${todayKey}T08:00:00.000Z`,
    updatedAt: `${todayKey}T08:00:00.000Z`
  },
  {
    id: "template-deep-work",
    title: "Deep work block",
    note: "Ship one concrete outcome before lunch.",
    listId: "list-work",
    preferredTime: "10:00",
    reminderPreset: "before-60",
    reminderLabel: reminderLabelForPreset("before-60"),
    recurrence: "weekdays",
    recurrenceLabel: "Weekdays",
    active: true,
    archivedAt: null,
    createdAt: `${todayKey}T08:00:00.000Z`,
    updatedAt: `${todayKey}T08:00:00.000Z`
  },
  {
    id: "template-walk",
    title: "Walk and reset",
    note: "Protect the break instead of pretending you'll take one later.",
    listId: "list-health",
    preferredTime: "13:10",
    reminderPreset: "before-15",
    reminderLabel: reminderLabelForPreset("before-15"),
    recurrence: "daily",
    recurrenceLabel: "Every day",
    active: true,
    archivedAt: null,
    createdAt: `${todayKey}T08:00:00.000Z`,
    updatedAt: `${todayKey}T08:00:00.000Z`
  },
  {
    id: "template-plan-tomorrow",
    title: "Plan tomorrow",
    note: "Close the loop while the day is still fresh.",
    listId: "list-personal",
    preferredTime: "18:00",
    reminderPreset: "before-15",
    reminderLabel: reminderLabelForPreset("before-15"),
    recurrence: "daily",
    recurrenceLabel: "Every day",
    active: true,
    archivedAt: null,
    createdAt: `${todayKey}T08:00:00.000Z`,
    updatedAt: `${todayKey}T08:00:00.000Z`
  }
];

export const defaultInstances: TaskInstance[] = [
  {
    id: `instance-template-morning-check-${todayKey}`,
    templateId: "template-morning-check",
    date: todayKey,
    scheduledTime: "08:15",
    actualCompletionTime: "08:21",
    status: "completed",
    rescheduleReason: "",
    missedReason: "",
    completionComment: "Done before notifications turned noisy.",
    reflection: "Usually easy when the phone stays closed until after planning.",
    ...buildReminderState(todayKey, "08:15", "before-15"),
    reminderDismissedAt: `${todayKey}T08:21:00.000Z`
  },
  {
    id: `instance-template-deep-work-${todayKey}`,
    templateId: "template-deep-work",
    date: todayKey,
    scheduledTime: "11:30",
    actualCompletionTime: null,
    status: "rescheduled",
    rescheduleReason: "Morning admin ate the first slot.",
    missedReason: "",
    completionComment: "",
    reflection: "The first block keeps getting stolen by setup work.",
    ...buildReminderState(todayKey, "11:30", "before-60")
  },
  {
    id: `instance-template-walk-${todayKey}`,
    templateId: "template-walk",
    date: todayKey,
    scheduledTime: "13:10",
    actualCompletionTime: null,
    status: "scheduled",
    rescheduleReason: "",
    missedReason: "",
    completionComment: "",
    reflection: "A short walk makes the afternoon less fragile.",
    ...buildReminderState(todayKey, "13:10", "before-15")
  },
  {
    id: `instance-template-plan-tomorrow-${todayKey}`,
    templateId: "template-plan-tomorrow",
    date: todayKey,
    scheduledTime: "18:00",
    actualCompletionTime: null,
    status: "scheduled",
    rescheduleReason: "",
    missedReason: "",
    completionComment: "",
    reflection: "",
    reminderPreset: "custom",
    reminderLabel: "Due now",
    reminderAt: reminderDueNowIso,
    reminderDismissedAt: null,
    reminderNotifiedAt: null
  },
  {
    id: `instance-template-deep-work-${yesterdayKey}`,
    templateId: "template-deep-work",
    date: yesterdayKey,
    scheduledTime: "10:00",
    actualCompletionTime: null,
    status: "missed",
    rescheduleReason: "",
    missedReason: "A long meeting broke the morning block.",
    completionComment: "",
    reflection: "This keeps happening when I don't protect the block the night before.",
    ...buildReminderState(yesterdayKey, "10:00", "before-60")
  },
  {
    id: `instance-template-plan-tomorrow-${yesterdayKey}`,
    templateId: "template-plan-tomorrow",
    date: yesterdayKey,
    scheduledTime: "18:00",
    actualCompletionTime: "18:12",
    status: "completed",
    rescheduleReason: "",
    missedReason: "",
    completionComment: "Only took ten calm minutes.",
    reflection: "",
    ...buildReminderState(yesterdayKey, "18:00", "before-15"),
    reminderDismissedAt: `${yesterdayKey}T18:12:00.000Z`
  },
  {
    id: `instance-template-walk-${twoDaysAgoKey}`,
    templateId: "template-walk",
    date: twoDaysAgoKey,
    scheduledTime: "13:10",
    actualCompletionTime: null,
    status: "missed",
    rescheduleReason: "",
    missedReason: "Stayed glued to the desk through lunch.",
    completionComment: "",
    reflection: "Energy crashed hard in the afternoon.",
    ...buildReminderState(twoDaysAgoKey, "13:10", "before-15")
  }
];

export const defaultQuickAdd = (listId: string): TaskDraft => ({
  title: "",
  note: "",
  listId,
  preferredTime: "09:00",
  reminderPreset: "task-time",
  reminderLabel: reminderLabelForPreset("task-time"),
  recurrence: "daily",
  recurrenceLabel: "Every day"
});
