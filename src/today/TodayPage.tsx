import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
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
      <Header icon="sunny-outline" title="My Day" subtitle={formatLongDate(new Date())} />

      <QuickAddCard />

      <View style={styles.guidanceRow}>
        <BodyText muted>
          {tasks.length > 0
            ? `${morningCount} scheduled before noon. ${completedCount} already landed. Keep the next step light enough to finish.`
            : "Start with one small task that deserves a real place in the day."}
        </BodyText>
        <Pressable
          accessibilityLabel="Toggle task sorting"
          onPress={() => setSortBy(sortBy === "time" ? "alphabetical" : "time")}
          style={({ pressed }) => [styles.sortLink, { opacity: pressed ? 0.72 : 1 }]}
        >
          <Text style={[styles.sortLabel, { color: colors.textMuted }]}> 
            {sortBy === "time" ? "Sort by time" : "Sort A-Z"}
          </Text>
        </Pressable>
      </View>

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
  guidanceRow: {
    gap: 8
  },
  sortLink: {
    alignSelf: "flex-start"
  },
  sortLabel: {
    fontSize: 13,
    fontWeight: "600"
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
