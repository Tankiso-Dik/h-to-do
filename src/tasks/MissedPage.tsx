import { StyleSheet, Text, View } from "react-native";
import {
  BodyText,
  Card,
  EmptyState,
  Header,
  Screen,
  SectionLabel,
  UtilityBar
} from "../mobile/primitives";
import { formatShortDate } from "../lib/date";
import { useTheme } from "../ui/theme";
import { useTaskStore } from "./store";

export function MissedPage() {
  const { colors } = useTheme();
  const { getMissedTasks } = useTaskStore();
  const missed = getMissedTasks();

  return (
    <Screen>
      <UtilityBar />
      <Header
        icon="time-outline"
        title="Missed"
        subtitle={`Historical review, not punishment. ${missed.length} missed instance${missed.length === 1 ? "" : "s"} logged so far.`}
      />

      {missed.length === 0 ? (
        <EmptyState
          body="Missed task instances will show up here as data, not as permanent overdue clutter."
          title="No missed instances"
        />
      ) : (
        <View style={styles.stack}>
          {missed.map((entry) => (
            <Card key={entry.instance.id}>
              <View style={styles.headerCopy}>
                <Text style={[styles.title, { color: colors.text }]}>{entry.template.title}</Text>
                <Text style={[styles.meta, { color: colors.textMuted }]}>
                  {formatShortDate(entry.instance.date)} · {entry.instance.scheduledTime}
                </Text>
              </View>

              <View style={styles.reasonBlock}>
                <SectionLabel>What got in the way</SectionLabel>
                <BodyText>{entry.instance.missedReason || "No reason logged."}</BodyText>
              </View>

              {entry.instance.reflection ? (
                <View style={styles.reasonBlock}>
                  <SectionLabel>What to notice next time</SectionLabel>
                  <BodyText muted>{entry.instance.reflection}</BodyText>
                </View>
              ) : null}
            </Card>
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 10
  },
  headerCopy: {
    gap: 4
  },
  title: {
    fontSize: 18,
    fontWeight: "700"
  },
  meta: {
    fontSize: 13
  },
  reasonBlock: {
    gap: 6
  }
});
