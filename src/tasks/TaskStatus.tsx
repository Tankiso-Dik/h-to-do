import { StyleSheet, Text } from "react-native";
import { useTheme } from "../ui/theme";
import type { TaskInstanceStatus } from "./types";

const labelMap: Record<TaskInstanceStatus, string> = {
  scheduled: "Planned",
  completed: "Completed",
  missed: "Missed",
  rescheduled: "Rescheduled",
  cancelled: "Cancelled"
};

export function TaskStatusPill({ status }: { status: TaskInstanceStatus }) {
  const { colors } = useTheme();
  const textColor =
    status === "completed"
      ? colors.accent
      : status === "missed"
        ? colors.warning
        : status === "rescheduled"
          ? colors.text
          : colors.textMuted;

  return <Text style={[styles.pillLabel, { color: textColor }]}>{labelMap[status]}</Text>;
}

export function taskStatusDetail(
  status: TaskInstanceStatus,
  meta: {
    scheduledTime: string;
    actualCompletionTime: string | null;
    rescheduleReason: string;
    missedReason: string;
    completionComment: string;
  }
) {
  if (status === "completed" && meta.completionComment) {
    return meta.completionComment;
  }

  if (status === "completed" && meta.actualCompletionTime) {
    return `Completed at ${meta.actualCompletionTime}`;
  }

  if (status === "rescheduled" && meta.rescheduleReason) {
    return `Moved to ${meta.scheduledTime}: ${meta.rescheduleReason}`;
  }

  if (status === "missed" && meta.missedReason) {
    return meta.missedReason;
  }

  return null;
}

const styles = StyleSheet.create({
  pillLabel: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
    letterSpacing: 0.2
  }
});
