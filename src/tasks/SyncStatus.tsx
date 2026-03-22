import { StyleSheet, Text, View } from "react-native";
import { ActionButton, BodyText, Card, SectionLabel } from "../mobile/primitives";
import { useTheme } from "../ui/theme";
import { formatSyncTimestamp } from "./sync";
import { useTaskStore } from "./store";

export function SyncStatusBadge() {
  const { colors } = useTheme();
  const { isOnline, pendingMutations } = useTaskStore();

  const copy = isOnline
    ? pendingMutations.length > 0
      ? `${pendingMutations.length} queued`
      : "Synced"
    : `${pendingMutations.length} queued offline`;

  return (
    <View
      style={[
        styles.badge,
        {
          borderColor: colors.line
        }
      ]}
    >
      <View
        style={[
          styles.dot,
          {
            backgroundColor: isOnline ? colors.success : colors.warning
          }
        ]}
      />
      <Text style={[styles.badgeText, { color: colors.text }]}>{copy}</Text>
    </View>
  );
}

export function SyncPanel() {
  const { colors } = useTheme();
  const { isOnline, pendingMutations, lastSyncedAt, flushPendingMutations } = useTaskStore();

  return (
    <Card>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <SectionLabel>Offline ready</SectionLabel>
          <Text style={[styles.title, { color: colors.text }]}>
            {isOnline ? "Changes sync automatically when connected" : "Working locally while offline"}
          </Text>
        </View>
        <ActionButton
          disabled={!isOnline || pendingMutations.length === 0}
          label="Sync now"
          onPress={flushPendingMutations}
        />
      </View>

      <BodyText muted>
        {isOnline
          ? pendingMutations.length > 0
            ? `${pendingMutations.length} change${pendingMutations.length === 1 ? "" : "s"} waiting to sync.`
            : `All local changes are synced. Last sync ${formatSyncTimestamp(lastSyncedAt)}.`
          : `${pendingMutations.length} local change${pendingMutations.length === 1 ? "" : "s"} queued until the connection returns.`}
      </BodyText>

      {pendingMutations.length > 0 ? (
        <View style={styles.queue}>
          {pendingMutations.slice(-4).reverse().map((mutation) => (
            <View
              key={mutation.id}
              style={[
                styles.row,
                {
                  borderColor: colors.line
                }
              ]}
            >
              <Text style={[styles.rowTitle, { color: colors.text }]}>{mutation.summary}</Text>
              <Text style={[styles.rowMeta, { color: colors.textMuted }]}>
                {formatSyncTimestamp(mutation.createdAt)}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 999,
    paddingHorizontal: 0,
    paddingVertical: 6
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 999
  },
  badgeText: {
    fontSize: 13,
    fontWeight: "700"
  },
  header: {
    gap: 10
  },
  headerCopy: {
    gap: 6
  },
  title: {
    fontSize: 18,
    fontWeight: "700"
  },
  queue: {
    gap: 10
  },
  row: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    gap: 4
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: "600"
  },
  rowMeta: {
    fontSize: 13
  }
});
