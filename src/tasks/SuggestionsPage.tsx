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
  const { getMissedTasks, getTodayTasks } = useTaskStore();
  const { summary, cards, source, status, error, metrics, snapshot } = useSuggestions();
  const todayTasks = getTodayTasks();
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

  return (
    <Screen>
      <UtilityBar />
      <Header
        icon="pulse-outline"
        title="Analytics"
        subtitle="Patterns, pressure points, and quiet signals from the way your tasks are moving."
      />

      <Card>
        <View style={styles.summaryHeader}>
          <View style={styles.summaryCopy}>
            <SectionLabel>Current read</SectionLabel>
            <Text style={[styles.summaryText, { color: colors.text }]}>{summary}</Text>
          </View>
          <View
            style={[
              styles.sourcePill,
              {
                borderColor: colors.line
              }
            ]}
          >
            <Text style={[styles.sourceText, { color: source === "ai" ? colors.accent : colors.textMuted }]}>
              {status === "loading"
                ? "Refreshing"
                : status === "error"
                  ? "Fallback"
                  : source === "ai"
                    ? "AI summary"
                    : "Local summary"}
            </Text>
          </View>
        </View>
        {error ? <BodyText muted>{error}</BodyText> : null}
      </Card>

      <View style={styles.metricGrid}>
        <MetricCard label="Completion rate" value={`${Math.round(metrics.completionRate * 100)}%`} />
        <MetricCard label="Open today" value={`${metrics.dueTodayCount}`} />
        <MetricCard label="Completed today" value={`${metrics.completedTodayCount}`} />
        <MetricCard label="Recent misses" value={`${metrics.missedCount}`} />
      </View>

      <View style={styles.stack}>
        {cards.map((card) => (
          <Card key={card.id}>
            <SectionLabel>Signal</SectionLabel>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{card.title}</Text>
            <BodyText muted>{card.body}</BodyText>
          </Card>
        ))}
      </View>

      <Card>
        <SectionLabel>Issues</SectionLabel>
        <Text style={[styles.blockTitle, { color: colors.text }]}>Pressure points worth fixing</Text>
        <View style={styles.stack}>
          {issues.map((issue) => (
            <InfoRow
              detail={issue.detail}
              key={issue.id}
              label={issue.label}
              value={issue.title}
            />
          ))}
        </View>
      </Card>

      <Card>
        <SectionLabel>Pattern signals</SectionLabel>
        <Text style={[styles.blockTitle, { color: colors.text }]}>What the app can already see</Text>
        <View style={styles.stack}>
          <InfoRow
            detail="When completions land most reliably"
            label="Best window"
            value={snapshot.bestWindow ?? "Still learning"}
          />
          <InfoRow
            detail="The task most often missed or moved"
            label="Slipping task"
            value={snapshot.slippingTask ?? "None yet"}
          />
          <InfoRow
            detail="The day that carried the heaviest load"
            label="Overloaded day"
            value={snapshot.overloadedDate ? formatShortDate(snapshot.overloadedDate) : "No spike"}
          />
        </View>
      </Card>

      <Card>
        <SectionLabel>Recent misses</SectionLabel>
        <Text style={[styles.blockTitle, { color: colors.text }]}>What needs redesign, not guilt</Text>
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

function MetricCard({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();

  return (
    <View style={styles.metricCard}>
      <Card>
        <SectionLabel>{label}</SectionLabel>
        <Text style={[styles.metricValue, { color: colors.text }]}>{value}</Text>
      </Card>
    </View>
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
    <View
      style={[
        styles.infoRow,
        {
          borderColor: colors.line
        }
      ]}
    >
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
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "700"
  },
  sourcePill: {
    alignSelf: "flex-start",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 0,
    paddingVertical: 4
  },
  sourceText: {
    fontSize: 12,
    fontWeight: "700"
  },
  metricGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  stack: {
    gap: 10
  },
  metricCard: {
    width: "48%"
  },
  metricValue: {
    fontSize: 28,
    fontWeight: "800"
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  blockTitle: {
    fontSize: 20,
    fontWeight: "700"
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
    fontSize: 13,
    fontWeight: "600"
  }
});
