import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  BodyText,
  Card,
  Header,
  Screen,
  SectionLabel,
  UtilityBar
} from "../mobile/primitives";
import { formatShortDate } from "../lib/date";
import { useTheme } from "../ui/theme";
import { useSuggestions } from "./useSuggestions";
import { useTaskStore } from "./store";

export function SuggestionsPage() {
  const { colors } = useTheme();
  const { getMissedTasks } = useTaskStore();
  const { summary, cards, source, status, error, metrics, snapshot } = useSuggestions();
  const missedTasks = getMissedTasks().slice(0, 4);

  const issues = useMemo(() => {
    const nextIssues: Array<{
      id: string;
      label: string;
      title: string;
      detail: string;
    }> = [];

    if (snapshot.slippingTask) {
      nextIssues.push({
        id: "slipping-task",
        label: "Slipping task",
        title: snapshot.slippingTask,
        detail: "Repeated misses or reschedules suggest the task needs a lighter version or an earlier slot."
      });
    }

    if (snapshot.overloadedDate) {
      nextIssues.push({
        id: "overloaded-day",
        label: "Overloaded day",
        title: formatShortDate(snapshot.overloadedDate),
        detail: "That day carried the heaviest task load in the recent window."
      });
    }

    if (metrics.missedCount > 0) {
      nextIssues.push({
        id: "recent-misses",
        label: "Miss pressure",
        title: `${metrics.missedCount} recent missed instance${metrics.missedCount === 1 ? "" : "s"}`,
        detail: "Misses are signal, not backlog, and they should shape future scheduling."
      });
    }

    if (metrics.rescheduledCount > 0) {
      nextIssues.push({
        id: "reschedules",
        label: "Reschedule pressure",
        title: `${metrics.rescheduledCount} recent reschedule${metrics.rescheduledCount === 1 ? "" : "s"}`,
        detail: "Repeated movement usually means the original schedule is asking for the wrong time or task size."
      });
    }

    if (nextIssues.length === 0) {
      nextIssues.push({
        id: "no-major-issues",
        label: "Issue scan",
        title: "No major pressure point yet",
        detail: "Keep logging outcomes for a few more days and the issue patterns will sharpen."
      });
    }

    return nextIssues.slice(0, 4);
  }, [
    metrics.missedCount,
    metrics.rescheduledCount,
    snapshot.overloadedDate,
    snapshot.slippingTask
  ]);

  const coachingSignals = useMemo(
    () => [
      {
        id: "best-window",
        label: "Best window",
        title: snapshot.bestWindow ?? "Still learning",
        detail: "The time range where completions are landing most reliably."
      },
      {
        id: "load-shape",
        label: "Today's load",
        title: `${metrics.dueTodayCount} open, ${metrics.completedTodayCount} done`,
        detail: "A quick read on how heavy today feels right now."
      },
      {
        id: "confidence",
        label: "Read quality",
        title: source === "ai" ? "AI-assisted" : "Local pattern read",
        detail:
          status === "error"
            ? "The app fell back to local guidance and is being transparent about it."
            : "The summary is grounded in recent behavior rather than generic advice."
      }
    ],
    [metrics.completedTodayCount, metrics.dueTodayCount, snapshot.bestWindow, source, status]
  );

  return (
    <Screen>
      <UtilityBar />
      <Header
        icon="sparkles-outline"
        title="Suggestions"
        subtitle="A practical read on what to adjust next, not a report card."
      />

      <Card>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryCopy}>
            <SectionLabel>Today's read</SectionLabel>
            <Text style={[styles.summaryText, { color: colors.text }]}>{summary}</Text>
          </View>
          <View style={[styles.sourcePill, { borderColor: colors.line }]}> 
            <Text style={[styles.sourceText, { color: source === "ai" ? colors.accent : colors.textMuted }]}> 
              {status === "loading"
                ? "Refreshing"
                : status === "error"
                  ? "Fallback"
                  : source === "ai"
                    ? "AI guidance"
                    : "Local guidance"}
            </Text>
          </View>
        </View>
        {error ? <BodyText muted>{error}</BodyText> : null}
      </Card>

      <Card>
        <SectionLabel>What to try</SectionLabel>
        <Text style={[styles.blockTitle, { color: colors.text }]}>Start with the next practical shift</Text>
        <View style={styles.stack}>
          {cards.slice(0, 2).map((card) => (
            <View key={card.id} style={[styles.guidanceRow, { borderColor: colors.line }]}> 
              <Text style={[styles.cardTitle, { color: colors.text }]}>{card.title}</Text>
              <BodyText muted>{card.body}</BodyText>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <SectionLabel>Signals backing it up</SectionLabel>
        <Text style={[styles.blockTitle, { color: colors.text }]}>Why this read is showing up</Text>
        <View style={styles.stack}>
          {coachingSignals.map((signal) => (
            <InfoRow key={signal.id} detail={signal.detail} label={signal.label} value={signal.title} />
          ))}
        </View>
      </Card>

      <Card>
        <SectionLabel>Pressure points</SectionLabel>
        <Text style={[styles.blockTitle, { color: colors.text }]}>Patterns worth reshaping</Text>
        <View style={styles.stack}>
          {issues.map((issue) => (
            <InfoRow key={issue.id} detail={issue.detail} label={issue.label} value={issue.title} />
          ))}
        </View>
      </Card>

      <Card>
        <SectionLabel>Recent misses</SectionLabel>
        <Text style={[styles.blockTitle, { color: colors.text }]}>Signal for redesign, not guilt</Text>
        <View style={styles.stack}>
          {missedTasks.length > 0 ? (
            missedTasks.map((entry) => (
              <InfoRow
                detail={entry.instance.missedReason || "No reason logged"}
                key={entry.instance.id}
                label={entry.template.title}
                value={`${formatShortDate(entry.instance.date)} · ${entry.instance.scheduledTime}`}
              />
            ))
          ) : (
            <BodyText muted>No missed task instances yet.</BodyText>
          )}
        </View>
      </Card>
    </Screen>
  );
}

function InfoRow({
  label,
  detail,
  value
}: {
  label: string;
  detail: string;
  value: string;
}) {
  const { colors } = useTheme();

  return (
    <View style={[styles.infoRow, { borderColor: colors.line }]}> 
      <View style={styles.infoCopy}>
        <Text style={[styles.infoLabel, { color: colors.text }]}>{label}</Text>
        <Text style={[styles.infoDetail, { color: colors.textMuted }]}>{detail}</Text>
      </View>
      <Text style={[styles.infoValue, { color: colors.textMuted }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  summaryHeader: {
    gap: 10
  },
  summaryCopy: {
    gap: 8
  },
  summaryText: {
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700"
  },
  sourcePill: {
    alignSelf: "flex-start",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingVertical: 4
  },
  sourceText: {
    fontSize: 12,
    fontWeight: "700"
  },
  stack: {
    gap: 10
  },
  cardTitle: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "700"
  },
  blockTitle: {
    fontSize: 20,
    fontWeight: "700"
  },
  guidanceRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    gap: 6
  },
  infoRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    gap: 8
  },
  infoCopy: {
    gap: 4
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: "700"
  },
  infoDetail: {
    fontSize: 14,
    lineHeight: 20
  },
  infoValue: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "600"
  }
});
