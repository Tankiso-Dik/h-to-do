import { defaultInstances, defaultLists, defaultTemplates } from "./seed";
import type { TaskDraft, TaskInstance, TaskList, TaskTemplate } from "./types";
import { toDateKey } from "../lib/date";
import { buildReminderState } from "./reminders";

export type TaskStoreState = {
  lists: TaskList[];
  templates: TaskTemplate[];
  instances: TaskInstance[];
};

export type TaskWithInstance = {
  template: TaskTemplate;
  list: TaskList | undefined;
  instance: TaskInstance;
};

type CompleteTaskInput = {
  comment?: string;
  reflection?: string;
  now?: Date;
  date?: string;
};

type RescheduleTaskInput = {
  scheduledTime: string;
  reason?: string;
  reflection?: string;
  date?: string;
};

type MissTaskInput = {
  reason?: string;
  reflection?: string;
  date?: string;
};

type ReminderInput = {
  date?: string;
  now?: Date;
};

export function buildInitialState(): TaskStoreState {
  return {
    lists: defaultLists,
    templates: defaultTemplates,
    instances: defaultInstances
  };
}

export function generateId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

export function ensureTodayInstances(
  state: TaskStoreState,
  currentDateKey = toDateKey(new Date())
) {
  const existing = new Map(
    state.instances
      .filter((instance) => instance.date === currentDateKey)
      .map((instance) => [instance.templateId, instance])
  );

  const nextInstances = [...state.instances];

  state.templates.forEach((template) => {
    if (!template.active || template.archivedAt) {
      return;
    }

    if (!existing.has(template.id)) {
      nextInstances.push(createInstanceForTemplate(template, currentDateKey));
    }
  });

  if (nextInstances.length === state.instances.length) {
    return state;
  }

  return {
    ...state,
    instances: nextInstances
  };
}

export function createInstanceForTemplate(template: TaskTemplate, date: string): TaskInstance {
  return {
    id: `instance-${template.id}-${date}`,
    templateId: template.id,
    date,
    scheduledTime: template.preferredTime,
    actualCompletionTime: null,
    status: "scheduled",
    rescheduleReason: "",
    missedReason: "",
    completionComment: "",
    reflection: "",
    ...buildReminderState(
      date,
      template.preferredTime,
      template.reminderPreset,
      template.reminderLabel
    )
  };
}

export function createTaskTemplateInState(state: TaskStoreState, draft: TaskDraft) {
  const now = new Date().toISOString();
  const templateId = generateId("template");
  const today = toDateKey(new Date());
  const template: TaskTemplate = {
    id: templateId,
    title: draft.title,
    note: draft.note,
    listId: draft.listId,
    preferredTime: draft.preferredTime,
    reminderPreset: draft.reminderPreset,
    reminderLabel: draft.reminderLabel,
    recurrence: draft.recurrence,
    recurrenceLabel: draft.recurrenceLabel,
    active: true,
    archivedAt: null,
    createdAt: now,
    updatedAt: now
  };

  return {
    templateId,
    state: {
      ...state,
      templates: [...state.templates, template],
      instances: [...state.instances, createInstanceForTemplate(template, today)]
    }
  };
}

export function updateTaskTemplateInState(
  state: TaskStoreState,
  templateId: string,
  updates: Partial<Omit<TaskTemplate, "id" | "createdAt">>
) {
  const today = toDateKey(new Date());
  const existingTemplate = getTemplateById(state, templateId);

  return {
    ...state,
    templates: state.templates.map((template) =>
      template.id === templateId
        ? {
            ...template,
            ...updates,
            updatedAt: new Date().toISOString()
          }
        : template
    ),
    instances: state.instances.map((instance) =>
      instance.templateId === templateId && instance.date === today
        ? {
            ...instance,
            scheduledTime: updates.preferredTime ?? instance.scheduledTime,
            ...buildReminderState(
              today,
              updates.preferredTime ?? instance.scheduledTime,
              updates.reminderPreset ?? existingTemplate?.reminderPreset ?? instance.reminderPreset,
              updates.reminderLabel ?? existingTemplate?.reminderLabel ?? instance.reminderLabel
            )
          }
        : instance
    )
  };
}

export function archiveTaskTemplateInState(state: TaskStoreState, templateId: string) {
  return {
    ...state,
    templates: state.templates.map((template) =>
      template.id === templateId
        ? {
            ...template,
            active: false,
            archivedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        : template
    )
  };
}

export function updateInstanceReflectionInState(
  state: TaskStoreState,
  templateId: string,
  reflection: string,
  date = toDateKey(new Date())
) {
  return updateInstance(state, templateId, date, (instance) => ({
    ...instance,
    reflection
  }));
}

export function completeTaskInState(
  state: TaskStoreState,
  templateId: string,
  input: CompleteTaskInput = {}
) {
  const now = input.now ?? new Date();
  const date = input.date ?? toDateKey(now);
  const completionTime = now.toTimeString().slice(0, 5);

  return updateInstance(state, templateId, date, (instance) => ({
    ...instance,
    status: "completed",
    actualCompletionTime: completionTime,
    completionComment: input.comment?.trim() ?? instance.completionComment,
    reflection: input.reflection?.trim() || instance.reflection,
    missedReason: "",
    rescheduleReason: "",
    reminderDismissedAt: now.toISOString()
  }));
}

export function rescheduleTaskInState(
  state: TaskStoreState,
  templateId: string,
  input: RescheduleTaskInput
) {
  const date = input.date ?? toDateKey(new Date());
  const template = getTemplateById(state, templateId);

  return updateInstance(state, templateId, date, (instance) => ({
    ...instance,
    status: "rescheduled",
    scheduledTime: input.scheduledTime,
    rescheduleReason: input.reason?.trim() ?? instance.rescheduleReason,
    reflection: input.reflection?.trim() || instance.reflection,
    actualCompletionTime: null,
    ...buildReminderState(
      date,
      input.scheduledTime,
      template?.reminderPreset ?? instance.reminderPreset,
      template?.reminderLabel ?? instance.reminderLabel
    )
  }));
}

export function missTaskInState(state: TaskStoreState, templateId: string, input: MissTaskInput = {}) {
  const date = input.date ?? toDateKey(new Date());
  const now = new Date();

  return updateInstance(state, templateId, date, (instance) => ({
    ...instance,
    status: "missed",
    missedReason: input.reason?.trim() ?? instance.missedReason,
    reflection: input.reflection?.trim() || instance.reflection,
    actualCompletionTime: null,
    reminderDismissedAt: now.toISOString()
  }));
}

export function getListById(state: TaskStoreState, listId: string) {
  return state.lists.find((list) => list.id === listId);
}

export function getTemplateById(state: TaskStoreState, templateId: string) {
  return state.templates.find((template) => template.id === templateId);
}

export function getTodayTasks(state: TaskStoreState, currentDateKey = toDateKey(new Date())) {
  return state.templates
    .filter((template) => template.active && !template.archivedAt)
    .map((template) => {
      const instance = state.instances.find(
        (entry) => entry.templateId === template.id && entry.date === currentDateKey
      );

      if (!instance) {
        return null;
      }

      return {
        template,
        list: getListById(state, template.listId),
        instance
      };
    })
    .filter((entry): entry is TaskWithInstance => Boolean(entry))
    .sort((left, right) => left.instance.scheduledTime.localeCompare(right.instance.scheduledTime));
}

export function getMissedTasks(state: TaskStoreState) {
  return state.instances
    .filter((instance) => instance.status === "missed")
    .map((instance) => {
      const template = getTemplateById(state, instance.templateId);
      if (!template) {
        return null;
      }

      return {
        template,
        list: getListById(state, template.listId),
        instance
      };
    })
    .filter((entry): entry is TaskWithInstance => Boolean(entry))
    .sort((left, right) => {
      const dateDiff = right.instance.date.localeCompare(left.instance.date);
      if (dateDiff !== 0) {
        return dateDiff;
      }

      return right.instance.scheduledTime.localeCompare(left.instance.scheduledTime);
    });
}

export function getDueReminders(state: TaskStoreState, now = new Date()) {
  return state.instances
    .filter((instance) => {
      if (!instance.reminderAt || instance.reminderDismissedAt) {
        return false;
      }

      if (instance.status !== "scheduled" && instance.status !== "rescheduled") {
        return false;
      }

      return new Date(instance.reminderAt).getTime() <= now.getTime();
    })
    .map((instance) => {
      const template = getTemplateById(state, instance.templateId);
      if (!template) {
        return null;
      }

      return {
        template,
        list: getListById(state, template.listId),
        instance
      };
    })
    .filter((entry): entry is TaskWithInstance => Boolean(entry))
    .sort((left, right) => (left.instance.reminderAt ?? "").localeCompare(right.instance.reminderAt ?? ""));
}

export function dismissReminderInState(
  state: TaskStoreState,
  templateId: string,
  input: ReminderInput = {}
) {
  const now = input.now ?? new Date();
  const date = input.date ?? toDateKey(now);

  return updateInstance(state, templateId, date, (instance) => ({
    ...instance,
    reminderDismissedAt: now.toISOString()
  }));
}

export function snoozeReminderInState(
  state: TaskStoreState,
  templateId: string,
  minutes: number,
  input: ReminderInput = {}
) {
  const now = input.now ?? new Date();
  const date = input.date ?? toDateKey(now);
  const nextReminderAt = new Date(now.getTime() + minutes * 60_000).toISOString();

  return updateInstance(state, templateId, date, (instance) => ({
    ...instance,
    reminderPreset: "custom",
    reminderLabel: `Snoozed ${minutes} min`,
    reminderAt: nextReminderAt,
    reminderDismissedAt: null,
    reminderNotifiedAt: null
  }));
}

export function markReminderNotifiedInState(
  state: TaskStoreState,
  templateId: string,
  input: ReminderInput = {}
) {
  const now = input.now ?? new Date();
  const date = input.date ?? toDateKey(now);

  return updateInstance(state, templateId, date, (instance) => ({
    ...instance,
    reminderNotifiedAt: now.toISOString()
  }));
}

function updateInstance(
  state: TaskStoreState,
  templateId: string,
  date: string,
  updater: (instance: TaskInstance) => TaskInstance
) {
  return {
    ...state,
    instances: state.instances.map((instance) =>
      instance.templateId === templateId && instance.date === date ? updater(instance) : instance
    )
  };
}
