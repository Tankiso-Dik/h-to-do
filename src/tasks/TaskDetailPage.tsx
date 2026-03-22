import Ionicons from "@expo/vector-icons/Ionicons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  ActionButton,
  BodyText,
  Card,
  ChoiceChip,
  EmptyState,
  Field,
  Screen,
  SectionLabel,
  UtilityBar
} from "../mobile/primitives";
import { formatLongDate, toDateKey } from "../lib/date";
import { useTheme } from "../ui/theme";
import { formatReminderTimestamp, reminderOptions } from "./reminders";
import { useTaskStore } from "./store";
import { TaskStatusPill, taskStatusDetail } from "./TaskStatus";
import type { TaskTemplate } from "./types";

function buildEditableState(template: TaskTemplate) {
  return {
    title: template.title,
    note: template.note,
    listId: template.listId,
    preferredTime: template.preferredTime,
    reminderPreset: template.reminderPreset,
    reminderLabel: template.reminderLabel,
    recurrence: template.recurrence,
    recurrenceLabel: template.recurrenceLabel
  };
}

type ActionMode = "complete" | "reschedule" | "missed" | null;

const recurrenceOptions: Array<{ value: TaskTemplate["recurrence"]; label: string }> = [
  { value: "daily", label: "Every day" },
  { value: "weekdays", label: "Weekdays" },
  { value: "custom", label: "Custom rhythm" }
];

export function TaskDetailPage() {
  const { colors } = useTheme();
  const { taskId } = useLocalSearchParams<{ taskId: string }>();
  const router = useRouter();
  const {
    getTemplateById,
    instances,
    updateTaskTemplate,
    updateInstanceReflection,
    archiveTaskTemplate,
    completeTask,
    rescheduleTask,
    missTask,
    dismissReminder,
    snoozeReminder
  } = useTaskStore();

  const template = taskId ? getTemplateById(taskId) : undefined;
  const todayKey = toDateKey(new Date());
  const instance = instances.find(
    (entry) => entry.templateId === template?.id && entry.date === todayKey
  );

  const [reflection, setReflection] = useState(instance?.reflection ?? "");
  const [actionMode, setActionMode] = useState<ActionMode>(null);
  const [showEditor, setShowEditor] = useState(false);
  const [editState, setEditState] = useState(() => (template ? buildEditableState(template) : null));
  const [completeForm, setCompleteForm] = useState({ comment: "", reflection: "" });
  const [rescheduleForm, setRescheduleForm] = useState({
    scheduledTime: instance?.scheduledTime ?? "09:00",
    reason: "",
    reflection: ""
  });
  const [missForm, setMissForm] = useState({ reason: "", reflection: "" });

  const detailMeta = useMemo(
    () => [
      { label: "Today", value: formatLongDate(new Date()) },
      { label: "Preferred time", value: template?.preferredTime ?? "Not set" },
      { label: "Recurs", value: template?.recurrenceLabel ?? "Not set" },
      { label: "Reminder", value: template?.reminderLabel ?? "Off" }
    ],
    [template?.preferredTime, template?.recurrenceLabel, template?.reminderLabel]
  );

  useEffect(() => {
    setReflection(instance?.reflection ?? "");
    setRescheduleForm((current) => ({
      ...current,
      scheduledTime: instance?.scheduledTime ?? current.scheduledTime
    }));
  }, [instance?.reflection, instance?.scheduledTime, taskId]);

  useEffect(() => {
    setEditState(template ? buildEditableState(template) : null);
    setActionMode(null);
    setShowEditor(false);
  }, [taskId, template]);

  if (!template || !editState || !instance) {
    return (
      <Screen>
        <UtilityBar compact />
        <EmptyState
          body="That task template does not exist in local storage or today’s instances."
          title="Task not found"
        />
        <ActionButton label="Back" onPress={() => router.back()} />
      </Screen>
    );
  }

  const outcomeDetail = taskStatusDetail(instance.status, instance);

  return (
    <Screen>
      <UtilityBar compact />

      <Card>
        <View style={styles.heroLead}>
          <Ionicons color={colors.accent} name="list-outline" size={16} />
          <SectionLabel>Task template</SectionLabel>
        </View>

        <Text style={[styles.heroTitle, { color: colors.text }]}>{template.title}</Text>

        <View style={styles.heroActions}>
          <TaskStatusPill status={instance.status} />
          <ActionButton
            label={showEditor ? "Close editor" : "Edit task"}
            onPress={() => setShowEditor((current) => !current)}
          />
          <ActionButton
            label="Archive"
            onPress={() => {
              archiveTaskTemplate(template.id);
              router.replace("/tasks");
            }}
            tone="ghost"
          />
        </View>
      </Card>

      <View style={styles.metaGrid}>
        {detailMeta.map((item) => (
          <DetailInfoCard key={item.label} label={item.label} value={item.value} />
        ))}
      </View>

      <Card>
        <SectionLabel>Daily outcome</SectionLabel>
        <Text style={[styles.blockTitle, { color: colors.text }]}>Update today&apos;s instance</Text>
        {outcomeDetail ? <BodyText muted>{outcomeDetail}</BodyText> : null}

        <View style={styles.chipRow}>
          <ChoiceChip
            label="Complete"
            onPress={() => setActionMode((current) => (current === "complete" ? null : "complete"))}
            selected={actionMode === "complete"}
          />
          <ChoiceChip
            label="Reschedule"
            onPress={() =>
              setActionMode((current) => (current === "reschedule" ? null : "reschedule"))
            }
            selected={actionMode === "reschedule"}
          />
          <ChoiceChip
            label="Missed"
            onPress={() => setActionMode((current) => (current === "missed" ? null : "missed"))}
            selected={actionMode === "missed"}
          />
        </View>

        {actionMode === "complete" ? (
          <View style={styles.formStack}>
            <Field
              label="Completion note"
              multiline
              onChangeText={(comment) => setCompleteForm((current) => ({ ...current, comment }))}
              placeholder="What got it done?"
              value={completeForm.comment}
            />
            <Field
              label="Reflection"
              multiline
              onChangeText={(formReflection) =>
                setCompleteForm((current) => ({ ...current, reflection: formReflection }))
              }
              placeholder="Optional note for this occurrence."
              value={completeForm.reflection}
            />
            <ActionButton
              label="Save completion"
              onPress={() => {
                completeTask(template.id, completeForm);
                setCompleteForm({ comment: "", reflection: "" });
                setActionMode(null);
              }}
              tone="primary"
            />
          </View>
        ) : null}

        {actionMode === "reschedule" ? (
          <View style={styles.formStack}>
            <Field
              label="New time"
              onChangeText={(scheduledTime) =>
                setRescheduleForm((current) => ({ ...current, scheduledTime }))
              }
              placeholder="HH:MM"
              value={rescheduleForm.scheduledTime}
            />
            <Field
              label="Reason"
              multiline
              onChangeText={(reason) => setRescheduleForm((current) => ({ ...current, reason }))}
              placeholder="Why did this move?"
              value={rescheduleForm.reason}
            />
            <Field
              label="Reflection"
              multiline
              onChangeText={(formReflection) =>
                setRescheduleForm((current) => ({ ...current, reflection: formReflection }))
              }
              placeholder="Optional note about the friction."
              value={rescheduleForm.reflection}
            />
            <ActionButton
              label="Save reschedule"
              onPress={() => {
                rescheduleTask(template.id, rescheduleForm);
                setActionMode(null);
              }}
              tone="primary"
            />
          </View>
        ) : null}

        {actionMode === "missed" ? (
          <View style={styles.formStack}>
            <Field
              label="What got in the way?"
              multiline
              onChangeText={(reason) => setMissForm((current) => ({ ...current, reason }))}
              placeholder="Optional reason for the missed instance."
              value={missForm.reason}
            />
            <Field
              label="Reflection"
              multiline
              onChangeText={(formReflection) =>
                setMissForm((current) => ({ ...current, reflection: formReflection }))
              }
              placeholder="Anything useful to notice for next time?"
              value={missForm.reflection}
            />
            <ActionButton
              label="Save missed note"
              onPress={() => {
                missTask(template.id, missForm);
                setActionMode(null);
              }}
              tone="primary"
            />
          </View>
        ) : null}
      </Card>

      {template.note ? (
        <Card>
          <SectionLabel>Task note</SectionLabel>
          <Text style={[styles.blockTitle, { color: colors.text }]}>Persistent context</Text>
          <BodyText>{template.note}</BodyText>
        </Card>
      ) : null}

      <Card>
        <SectionLabel>Reminder</SectionLabel>
        <Text style={[styles.blockTitle, { color: colors.text }]}>Today&apos;s notification timing</Text>
        <BodyText>
          {instance.reminderAt
            ? `${instance.reminderLabel} · ${formatReminderTimestamp(instance.reminderAt)}`
            : "No reminder scheduled for this task."}
        </BodyText>
        {instance.reminderDismissedAt ? (
          <BodyText muted>Today&apos;s reminder has been dismissed.</BodyText>
        ) : null}
        {(instance.status === "scheduled" || instance.status === "rescheduled") &&
        instance.reminderAt ? (
          <View style={styles.actionRow}>
            <ActionButton label="Snooze 10 min" onPress={() => snoozeReminder(template.id, 10)} />
            <ActionButton
              label="Dismiss reminder"
              onPress={() => dismissReminder(template.id)}
              tone="ghost"
            />
          </View>
        ) : null}
      </Card>

      {showEditor ? (
        <Card>
          <SectionLabel>Template settings</SectionLabel>
          <Text style={[styles.blockTitle, { color: colors.text }]}>Edit the recurring task</Text>
          <Field
            label="Title"
            onChangeText={(title) =>
              setEditState((current) => (current ? { ...current, title } : current))
            }
            value={editState.title}
          />
          <Field
            label="Task note"
            multiline
            onChangeText={(note) =>
              setEditState((current) => (current ? { ...current, note } : current))
            }
            value={editState.note}
          />
          <Field
            label="Preferred time"
            onChangeText={(preferredTime) =>
              setEditState((current) => (current ? { ...current, preferredTime } : current))
            }
            placeholder="HH:MM"
            value={editState.preferredTime}
          />
          <View style={styles.formStack}>
            <SectionLabel>Recurrence</SectionLabel>
            <View style={styles.chipRow}>
              {recurrenceOptions.map((option) => (
                <ChoiceChip
                  key={option.value}
                  label={option.label}
                  onPress={() =>
                    setEditState((current) =>
                      current
                        ? {
                            ...current,
                            recurrence: option.value,
                            recurrenceLabel: option.label
                          }
                        : current
                    )
                  }
                  selected={editState.recurrence === option.value}
                />
              ))}
            </View>
          </View>
          <View style={styles.formStack}>
            <SectionLabel>Reminder</SectionLabel>
            <View style={styles.chipRow}>
              {reminderOptions.map((option) => (
                <ChoiceChip
                  key={option.value}
                  label={option.label}
                  onPress={() =>
                    setEditState((current) =>
                      current
                        ? {
                            ...current,
                            reminderPreset: option.value,
                            reminderLabel: option.label
                          }
                        : current
                    )
                  }
                  selected={editState.reminderPreset === option.value}
                />
              ))}
            </View>
          </View>
          <ActionButton
            label="Save template changes"
            onPress={() =>
              updateTaskTemplate(template.id, {
                title: editState.title.trim(),
                note: editState.note.trim(),
                listId: editState.listId,
                preferredTime: editState.preferredTime,
                reminderPreset: editState.reminderPreset,
                reminderLabel: editState.reminderLabel,
                recurrence: editState.recurrence,
                recurrenceLabel: editState.recurrenceLabel
              })
            }
            tone="primary"
          />
        </Card>
      ) : null}

      <Card>
        <SectionLabel>Instance reflection</SectionLabel>
        <Text style={[styles.blockTitle, { color: colors.text }]}>Today&apos;s note</Text>
        <BodyText muted>
          This belongs to the occurrence on {formatLongDate(new Date())}, not to the template itself.
        </BodyText>
        <Field
          label="Reflection"
          multiline
          onChangeText={setReflection}
          placeholder="Log what made this task easier, harder, or worth adjusting."
          value={reflection}
        />
        <ActionButton
          label="Save today's reflection"
          onPress={() => updateInstanceReflection(template.id, reflection, todayKey)}
        />
      </Card>
    </Screen>
  );
}

function DetailInfoCard({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.metaCard,
        {
          backgroundColor: colors.surface,
          borderColor: colors.line
        }
      ]}
    >
      <Text style={[styles.metaLabel, { color: colors.textMuted }]}>{label}</Text>
      <Text style={[styles.metaValue, { color: colors.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  heroLead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  heroTitle: {
    fontSize: 26,
    lineHeight: 32,
    fontWeight: "800",
    letterSpacing: -0.8
  },
  heroActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 8
  },
  metaGrid: {
    gap: 10
  },
  metaCard: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    gap: 6
  },
  metaLabel: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase"
  },
  metaValue: {
    fontSize: 17,
    lineHeight: 23,
    fontWeight: "700"
  },
  blockTitle: {
    fontSize: 20,
    fontWeight: "700"
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  formStack: {
    gap: 10
  },
  actionRow: {
    gap: 8
  }
});
