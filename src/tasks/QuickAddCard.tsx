import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { ActionButton, Card, ChoiceChip, Field, SectionLabel } from "../mobile/primitives";
import { useTheme } from "../ui/theme";
import { reminderOptions } from "./reminders";
import { useTaskStore } from "./store";
import type { TaskDraft, TaskTemplate } from "./types";

type Panel = "time" | "reminder" | "repeat" | null;

const quickTimes = ["07:30", "09:00", "11:30", "13:00", "18:00"];
const recurrenceOptions: Array<{ value: TaskTemplate["recurrence"]; label: string }> = [
  { value: "daily", label: "Every day" },
  { value: "weekdays", label: "Weekdays" },
  { value: "custom", label: "Custom rhythm" }
];

export function QuickAddCard() {
  const router = useRouter();
  const { colors } = useTheme();
  const { createTaskTemplate, defaultDraft } = useTaskStore();
  const [draft, setDraft] = useState<TaskDraft>(() => defaultDraft());
  const [activePanel, setActivePanel] = useState<Panel>(null);
  const [customTime, setCustomTime] = useState(draft.preferredTime);

  const canSubmit = draft.title.trim().length > 0;
  const summary = useMemo(
    () => [draft.preferredTime, draft.reminderLabel, draft.recurrenceLabel].join(" · "),
    [draft.preferredTime, draft.recurrenceLabel, draft.reminderLabel]
  );

  return (
    <>
      <Card>
        <View style={[styles.inputRow, { borderColor: colors.line }]}>
          <View style={[styles.circle, { borderColor: colors.accent }]} />
          <TextInput
            onChangeText={(title) => setDraft((current) => ({ ...current, title }))}
            placeholder="Add a task"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, { color: colors.text }]}
            value={draft.title}
          />
        </View>

        <Text style={[styles.summary, { color: colors.textMuted }]}>{summary}</Text>

        <View style={[styles.footerRow, { borderColor: colors.line }]}>
          <IconTrigger icon="calendar-outline" onPress={() => setActivePanel("time")} />
          <IconTrigger icon="notifications-outline" onPress={() => setActivePanel("reminder")} />
          <IconTrigger icon="repeat-outline" onPress={() => setActivePanel("repeat")} />
          <Pressable
            disabled={!canSubmit}
            onPress={() => {
              if (!canSubmit) {
                return;
              }

              const templateId = createTaskTemplate({
                ...draft,
                title: draft.title.trim(),
                note: draft.note.trim()
              });

              setDraft(defaultDraft());
              setCustomTime(defaultDraft().preferredTime);
              router.push(`/task/${templateId}`);
            }}
            style={({ pressed }) => [
              styles.addButton,
              {
                borderColor: colors.line,
                backgroundColor: colors.surfaceMuted,
                opacity: !canSubmit ? 0.45 : pressed ? 0.82 : 1
              }
            ]}
          >
            <Text style={[styles.addLabel, { color: colors.text }]}>Add</Text>
          </Pressable>
        </View>
      </Card>

      <Modal animationType="fade" onRequestClose={() => setActivePanel(null)} transparent visible={activePanel !== null}>
        <View style={styles.modalRoot}>
          <Pressable onPress={() => setActivePanel(null)} style={styles.overlay} />
          <View
            style={[
              styles.sheet,
              {
                backgroundColor: colors.surface,
                borderColor: colors.line
              }
            ]}
          >
            {activePanel === "time" ? (
              <>
                <SectionLabel>Time</SectionLabel>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Choose when this task happens</Text>
                <View style={styles.optionRow}>
                  {quickTimes.map((time) => (
                    <ChoiceChip
                      key={time}
                      label={time}
                      onPress={() => {
                        setDraft((current) => ({ ...current, preferredTime: time }));
                        setCustomTime(time);
                      }}
                      selected={draft.preferredTime === time}
                    />
                  ))}
                </View>
                <Field
                  label="Custom time"
                  onChangeText={setCustomTime}
                  placeholder="HH:MM"
                  value={customTime}
                />
                <ActionButton
                  label="Use time"
                  onPress={() => {
                    setDraft((current) => ({ ...current, preferredTime: customTime.trim() || current.preferredTime }));
                    setActivePanel(null);
                  }}
                  tone="primary"
                />
              </>
            ) : null}

            {activePanel === "reminder" ? (
              <>
                <SectionLabel>Reminder</SectionLabel>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Choose a reminder</Text>
                <View style={styles.optionRow}>
                  {reminderOptions.map((option) => (
                    <ChoiceChip
                      key={option.value}
                      label={option.label}
                      onPress={() =>
                        setDraft((current) => ({
                          ...current,
                          reminderPreset: option.value,
                          reminderLabel: option.label
                        }))
                      }
                      selected={draft.reminderPreset === option.value}
                    />
                  ))}
                </View>
                <ActionButton label="Done" onPress={() => setActivePanel(null)} tone="primary" />
              </>
            ) : null}

            {activePanel === "repeat" ? (
              <>
                <SectionLabel>Repeat</SectionLabel>
                <Text style={[styles.sheetTitle, { color: colors.text }]}>Choose the rhythm</Text>
                <View style={styles.optionRow}>
                  {recurrenceOptions.map((option) => (
                    <ChoiceChip
                      key={option.value}
                      label={option.label}
                      onPress={() =>
                        setDraft((current) => ({
                          ...current,
                          recurrence: option.value,
                          recurrenceLabel: option.label
                        }))
                      }
                      selected={draft.recurrence === option.value}
                    />
                  ))}
                </View>
                <ActionButton label="Done" onPress={() => setActivePanel(null)} tone="primary" />
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
}

function IconTrigger({
  icon,
  onPress
}: {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconTrigger,
        {
          opacity: pressed ? 0.7 : 1
        }
      ]}
    >
      <Ionicons color={colors.textMuted} name={icon} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 12,
    borderBottomWidth: 1
  },
  circle: {
    width: 18,
    height: 18,
    borderRadius: 999,
    borderWidth: 2
  },
  input: {
    flex: 1,
    fontSize: 17,
    fontWeight: "500",
    paddingVertical: 0
  },
  summary: {
    fontSize: 14,
    lineHeight: 20
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderTopWidth: 1,
    paddingTop: 10
  },
  iconTrigger: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center"
  },
  addButton: {
    marginLeft: "auto",
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  addLabel: {
    fontSize: 14,
    fontWeight: "600"
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end"
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.4)"
  },
  sheet: {
    borderTopWidth: 1,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 14
  },
  sheetTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700"
  },
  optionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  }
});
