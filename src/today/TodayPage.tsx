import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Header,
  Screen,
  BodyText,
  EmptyState,
  SectionLabel,
  UtilityBar
} from "../mobile/primitives";
import { formatLongDate } from "../lib/date";
import { QuickAddCard } from "../tasks/QuickAddCard";
import { SortMenuButton } from "../tasks/SortMenuButton";
import { sortTaskEntries, type TaskSort } from "../tasks/sort";
import { useTaskStore } from "../tasks/store";
import { TaskRow } from "../tasks/TaskRow";
import { useTheme } from "../ui/theme";

export function TodayPage() {
  const { colors } = useTheme();
  const { getTodayTasks, completeTask } = useTaskStore();
  const [sortBy, setSortBy] = useState<TaskSort>("time");
  const tasks = getTodayTasks();
  const morningCount = tasks.filter((task) => task.instance.scheduledTime < "12:00").length;
  const completedCount = tasks.filter((task) => task.instance.status === "completed").length;
  const sortedTasks = useMemo(() => sortTaskEntries(tasks, sortBy), [sortBy, tasks]);
  const activeTasks = sortedTasks.filter((task) => task.instance.status !== "completed");
  const completedTasks = sortedTasks.filter((task) => task.instance.status === "completed");

  return (
    <Screen>
      <UtilityBar />
      <Header
        icon="sunny-outline"
        title="My Day"
        subtitle={formatLongDate(new Date())}
        right={<SortMenuButton value={sortBy} onChange={setSortBy} />}
      />

      <BodyText muted>
        {tasks.length > 0
          ? `${morningCount} front-loaded before noon, ${completedCount} already completed today.`
          : "No tasks yet. Start with one small commitment you can actually keep."}
      </BodyText>

      <QuickAddCard />

      {activeTasks.length > 0 ? (
        <View style={styles.stack}>
          {activeTasks.map((task) => (
            <TaskRow key={task.template.id} onComplete={completeTask} task={task} />
          ))}
        </View>
      ) : (
        <EmptyState
          body="The board is clear. Add a single task that deserves a real place in the day."
          title="No open tasks"
        />
      )}

      {completedTasks.length > 0 ? (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <SectionLabel>Completed</SectionLabel>
            <Text style={[styles.sectionMeta, { color: colors.textMuted }]}>
              {completedTasks.length} finished today
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
