import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "../ui/theme";
import type { TaskWithInstance } from "./model";
import { TaskStatusPill, taskStatusDetail } from "./TaskStatus";

type TaskRowProps = {
  task: TaskWithInstance;
  onComplete: (templateId: string) => void;
};

export function TaskRow({ task, onComplete }: TaskRowProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const isCompleted = task.instance.status === "completed";
  const supportNote = taskStatusDetail(task.instance.status, task.instance);
  const meta = [task.instance.scheduledTime, task.template.recurrenceLabel];

  return (
    <View style={[styles.row, { borderColor: colors.line }]}>
      <View style={styles.contentRow}>
        <Pressable
          accessibilityLabel={isCompleted ? `${task.template.title} completed` : `Complete ${task.template.title}`}
          disabled={isCompleted}
          onPress={() => onComplete(task.template.id)}
          style={({ pressed }) => [
            styles.checkButton,
            {
              borderColor: isCompleted ? colors.accent : colors.line,
              backgroundColor: isCompleted ? colors.accentMuted : "transparent",
              opacity: pressed ? 0.82 : 1
            }
          ]}
        >
          <Text style={[styles.checkLabel, { color: isCompleted ? colors.accent : colors.textMuted }]}>
            {isCompleted ? "✓" : ""}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => router.push(`/task/${task.template.id}`)}
          style={({ pressed }) => [styles.copyWrap, { opacity: pressed ? 0.82 : 1 }]}
        >
          <Text style={[styles.title, { color: colors.text }]}>{task.template.title}</Text>
          <View style={styles.metaRow}>
            <Text style={[styles.meta, { color: colors.textMuted }]}>{meta.join("  ·  ")}</Text>
            <TaskStatusPill status={task.instance.status} />
          </View>
          {supportNote ? <Text style={[styles.note, { color: colors.textMuted }]}>{supportNote}</Text> : null}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 12
  },
  contentRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12
  },
  checkButton: {
    width: 24,
    height: 24,
    borderRadius: 999,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1
  },
  checkLabel: {
    fontSize: 14,
    fontWeight: "800"
  },
  copyWrap: {
    gap: 3,
    flex: 1,
    paddingRight: 6
  },
  title: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "600"
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8
  },
  meta: {
    fontSize: 13,
    lineHeight: 18,
    letterSpacing: 0.1
  },
  note: {
    fontSize: 13,
    lineHeight: 18,
    paddingTop: 2
  }
});
