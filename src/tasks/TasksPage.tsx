import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { EmptyState, Header, Screen, SectionLabel, UtilityBar } from "../mobile/primitives";
import { useTheme } from "../ui/theme";
import { QuickAddCard } from "./QuickAddCard";
import { SortMenuButton } from "./SortMenuButton";
import { sortTaskEntries, type TaskSort } from "./sort";
import { useTaskStore } from "./store";
import { TaskRow } from "./TaskRow";

export function TasksPage() {
  const { colors } = useTheme();
  const { getTodayTasks, completeTask } = useTaskStore();
  const [sortBy, setSortBy] = useState<TaskSort>("time");
  const tasks = getTodayTasks();
  const sortedTasks = useMemo(() => sortTaskEntries(tasks, sortBy), [sortBy, tasks]);
  const activeTasks = sortedTasks.filter((task) => task.instance.status !== "completed");
  const completedTasks = sortedTasks.filter((task) => task.instance.status === "completed");

  return (
    <Screen>
      <UtilityBar />
      <Header
        icon="checkbox-outline"
        title="Tasks"
        subtitle="All active task instances for today."
        right={<SortMenuButton value={sortBy} onChange={setSortBy} />}
      />

      <QuickAddCard />

      {activeTasks.length > 0 ? (
        <View style={styles.stack}>
          {activeTasks.map((task) => (
            <TaskRow key={task.template.id} onComplete={completeTask} task={task} />
          ))}
        </View>
      ) : (
        <EmptyState
          body="Everything active is already finished or hasn’t been created yet."
          title="No active tasks"
        />
      )}

      {completedTasks.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SectionLabel>Completed</SectionLabel>
            <Text style={[styles.sectionMeta, { color: colors.textMuted }]}>
              {completedTasks.length} finished in this view
            </Text>
          </View>
          <View style={styles.stack}>
            {completedTasks.map((task) => (
              <TaskRow key={task.template.id} onComplete={completeTask} task={task} />
            ))}
          </View>
        </View>
      ) : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 10
  },
  section: {
    gap: 10
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  sectionMeta: {
    fontSize: 13,
    fontWeight: "600"
  }
});
