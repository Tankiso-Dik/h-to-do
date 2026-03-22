export type ListTone = "forest" | "sky" | "amber" | "rose";

export type ReminderPreset =
  | "none"
  | "task-time"
  | "before-15"
  | "before-60"
  | "custom";

export type TaskTemplate = {
  id: string;
  title: string;
  note: string;
  listId: string;
  preferredTime: string;
  reminderPreset: ReminderPreset;
  reminderLabel: string;
  recurrence: "daily" | "weekdays" | "custom";
  recurrenceLabel: string;
  active: boolean;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskInstanceStatus =
  | "scheduled"
  | "completed"
  | "missed"
  | "rescheduled"
  | "cancelled";

export type TaskInstance = {
  id: string;
  templateId: string;
  date: string;
  scheduledTime: string;
  actualCompletionTime: string | null;
  status: TaskInstanceStatus;
  rescheduleReason: string;
  missedReason: string;
  completionComment: string;
  reflection: string;
  reminderPreset: ReminderPreset;
  reminderLabel: string;
  reminderAt: string | null;
  reminderDismissedAt: string | null;
  reminderNotifiedAt: string | null;
};

export type TaskList = {
  id: string;
  name: string;
  description: string;
  tone: ListTone;
  archived: boolean;
};

export type TaskDraft = {
  title: string;
  note: string;
  listId: string;
  preferredTime: string;
  reminderPreset: ReminderPreset;
  reminderLabel: string;
  recurrence: TaskTemplate["recurrence"];
  recurrenceLabel: string;
};
