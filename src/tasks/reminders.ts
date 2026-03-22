import type { ReminderPreset } from "./types";

export const reminderOptions: Array<{ value: ReminderPreset; label: string }> = [
  { value: "task-time", label: "At task time" },
  { value: "before-15", label: "15 min before" },
  { value: "before-60", label: "1 hour before" },
  { value: "none", label: "Off" }
];

export function reminderLabelForPreset(preset: ReminderPreset) {
  const option = reminderOptions.find((entry) => entry.value === preset);
  return option?.label ?? "Custom";
}

export function buildReminderState(
  dateKey: string,
  scheduledTime: string,
  preset: ReminderPreset,
  label = reminderLabelForPreset(preset)
) {
  return {
    reminderPreset: preset,
    reminderLabel: label,
    reminderAt: resolveReminderAt(dateKey, scheduledTime, preset),
    reminderDismissedAt: null,
    reminderNotifiedAt: null
  };
}

export function resolveReminderAt(
  dateKey: string,
  scheduledTime: string,
  preset: ReminderPreset
) {
  if (preset === "none") {
    return null;
  }

  const scheduledDate = combineDateAndTime(dateKey, scheduledTime);
  const offsetMinutes =
    preset === "task-time" ? 0 : preset === "before-15" ? -15 : preset === "before-60" ? -60 : 0;

  scheduledDate.setMinutes(scheduledDate.getMinutes() + offsetMinutes);
  return scheduledDate.toISOString();
}

export function combineDateAndTime(dateKey: string, time: string) {
  return new Date(`${dateKey}T${time}:00`);
}

export function formatReminderTimestamp(reminderAt: string | null) {
  if (!reminderAt) {
    return "No reminder";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(reminderAt));
}
