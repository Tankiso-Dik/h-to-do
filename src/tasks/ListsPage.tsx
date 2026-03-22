import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  BodyText,
  Card,
  Header,
  Screen,
  SectionLabel,
  UtilityBar
} from "../mobile/primitives";
import { useTheme } from "../ui/theme";
import { ReminderPermissionButton } from "./ReminderCenter";
import { SyncPanel, SyncStatusBadge } from "./SyncStatus";
import { useTaskStore } from "./store";

export function ListsPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const { getArchivedTemplates } = useTaskStore();
  const archivedTemplates = getArchivedTemplates();

  return (
    <Screen>
      <UtilityBar />
      <Header
        icon="settings-outline"
        title="More"
        subtitle="Support controls, archived tasks, and notification access."
        right={<SyncStatusBadge />}
      />

      <Card>
        <SectionLabel>Notifications</SectionLabel>
        <Text style={[styles.cardTitle, { color: colors.text }]}>Phone reminders</Text>
        <BodyText muted>
          Reminders stay out of the page and arrive as native notifications instead.
        </BodyText>
        <ReminderPermissionButton />
      </Card>

      <SyncPanel />

      <Card>
        <SectionLabel>Archived tasks</SectionLabel>
        {archivedTemplates.length === 0 ? (
          <BodyText muted>Archived tasks stay here without cluttering the daily views.</BodyText>
        ) : (
          <View style={styles.stack}>
            {archivedTemplates.map((template) => (
              <Pressable
                key={template.id}
                onPress={() => router.push(`/task/${template.id}`)}
                style={({ pressed }) => [
                  styles.archiveRow,
                  {
                    borderColor: colors.line,
                    opacity: pressed ? 0.82 : 1
                  }
                ]}
              >
                <Text style={[styles.archiveTitle, { color: colors.text }]}>{template.title}</Text>
              </Pressable>
            ))}
          </View>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  stack: {
    gap: 10
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  archiveRow: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10,
    gap: 4
  },
  archiveTitle: {
    fontSize: 16,
    fontWeight: "700"
  }
});
