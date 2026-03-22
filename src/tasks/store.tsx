import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  type PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { Platform } from "react-native";
import { defaultQuickAdd } from "./seed";
import {
  archiveTaskTemplateInState,
  buildInitialState,
  completeTaskInState,
  createTaskTemplateInState,
  dismissReminderInState,
  ensureTodayInstances,
  getDueReminders,
  getListById,
  getMissedTasks,
  getTemplateById,
  getTodayTasks,
  markReminderNotifiedInState,
  missTaskInState,
  rescheduleTaskInState,
  snoozeReminderInState,
  type TaskStoreState,
  updateInstanceReflectionInState,
  updateTaskTemplateInState
} from "./model";
import type { TaskDraft, TaskInstance, TaskList, TaskTemplate } from "./types";
import {
  buildInitialSyncState,
  createSyncMutation,
  flushPendingMutations,
  queueMutation,
  type SyncMutation,
  type SyncState
} from "./sync";

type TaskStoreContextValue = TaskStoreState & {
  createList: (
    input: Pick<import("./types").TaskList, "name" | "description" | "tone">
  ) => void;
  createTaskTemplate: (draft: TaskDraft) => string;
  updateTaskTemplate: (
    templateId: string,
    updates: Partial<Omit<TaskTemplate, "id" | "createdAt">>
  ) => void;
  archiveTaskTemplate: (templateId: string) => void;
  updateInstanceReflection: (templateId: string, reflection: string, date?: string) => void;
  completeTask: (
    templateId: string,
    input?: { comment?: string; reflection?: string; now?: Date; date?: string }
  ) => void;
  rescheduleTask: (
    templateId: string,
    input: { scheduledTime: string; reason?: string; reflection?: string; date?: string }
  ) => void;
  missTask: (templateId: string, input?: { reason?: string; reflection?: string; date?: string }) => void;
  dismissReminder: (templateId: string, input?: { date?: string; now?: Date }) => void;
  snoozeReminder: (
    templateId: string,
    minutes: number,
    input?: { date?: string; now?: Date }
  ) => void;
  markReminderNotified: (templateId: string, input?: { date?: string; now?: Date }) => void;
  getTemplateById: (templateId: string) => TaskTemplate | undefined;
  getListById: (listId: string) => import("./types").TaskList | undefined;
  getTodayTasks: () => ReturnType<typeof getTodayTasks>;
  getMissedTasks: () => ReturnType<typeof getMissedTasks>;
  getDueReminders: (now?: Date) => ReturnType<typeof getDueReminders>;
  getArchivedTemplates: () => TaskTemplate[];
  defaultDraft: () => TaskDraft;
  isOnline: boolean;
  isHydrated: boolean;
  pendingMutations: SyncMutation[];
  lastSyncedAt: string | null;
  flushPendingMutations: () => void;
};

const STORAGE_KEY = "task-journal.store";
const LEGACY_STORAGE_KEYS = ["example.phase3.store", "example.phase2.store"];
const SYNC_STORAGE_KEY = "task-journal.sync";

const TaskStoreContext = createContext<TaskStoreContextValue | null>(null);

function safeParseState(raw: string | null): TaskStoreState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<TaskStoreState>;
    if (
      !parsed ||
      !Array.isArray(parsed.lists) ||
      !Array.isArray(parsed.templates) ||
      !Array.isArray(parsed.instances)
    ) {
      return null;
    }

    return {
      lists: parsed.lists as TaskList[],
      templates: parsed.templates as TaskTemplate[],
      instances: parsed.instances as TaskInstance[]
    };
  } catch {
    return null;
  }
}

function safeParseSyncState(raw: string | null): SyncState | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SyncState>;
    if (!parsed || !Array.isArray(parsed.pendingMutations)) {
      return null;
    }

    return {
      pendingMutations: parsed.pendingMutations as SyncMutation[],
      lastSyncedAt:
        typeof parsed.lastSyncedAt === "string" || parsed.lastSyncedAt === null
          ? parsed.lastSyncedAt
          : null
    };
  } catch {
    return null;
  }
}

export function TaskStoreProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<TaskStoreState>(buildInitialState);
  const [syncState, setSyncState] = useState<SyncState>(buildInitialSyncState);
  const [isHydrated, setIsHydrated] = useState(false);
  const [isOnline, setIsOnline] = useState(() =>
    Platform.OS === "web" && typeof navigator !== "undefined" ? navigator.onLine : true
  );
  const flushTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let cancelled = false;

    Promise.all([
      AsyncStorage.getItem(STORAGE_KEY),
      AsyncStorage.getItem(SYNC_STORAGE_KEY)
    ])
      .then(([storedState, storedSyncState]) => {
        if (cancelled) {
          return;
        }

        setState(ensureTodayInstances(safeParseState(storedState) ?? buildInitialState()));
        setSyncState(safeParseSyncState(storedSyncState) ?? buildInitialSyncState());
      })
      .finally(() => {
        if (!cancelled) {
          setIsHydrated(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {
      // Ignore persistence failures in the optimistic local prototype.
    });
    LEGACY_STORAGE_KEYS.forEach((key) => {
      AsyncStorage.removeItem(key).catch(() => {
        // Ignore cleanup failures.
      });
    });
  }, [isHydrated, state]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(SYNC_STORAGE_KEY, JSON.stringify(syncState)).catch(() => {
      // Ignore persistence failures in the optimistic local prototype.
    });
  }, [isHydrated, syncState]);

  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined") {
      setIsOnline(true);
      return;
    }

    function handleOnline() {
      setIsOnline(true);
    }

    function handleOffline() {
      setIsOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isOnline || syncState.pendingMutations.length === 0) {
      return;
    }

    if (flushTimerRef.current) {
      clearTimeout(flushTimerRef.current);
    }

    flushTimerRef.current = setTimeout(() => {
      setSyncState((current) => flushPendingMutations(current));
      flushTimerRef.current = null;
    }, 350);

    return () => {
      if (flushTimerRef.current) {
        clearTimeout(flushTimerRef.current);
        flushTimerRef.current = null;
      }
    };
  }, [isOnline, syncState.pendingMutations.length]);

  const value = useMemo<TaskStoreContextValue>(() => {
    const queueUserMutation = (
      type: Parameters<typeof createSyncMutation>[0],
      entityId: string,
      summary: string
    ) => {
      setSyncState((current) =>
        queueMutation(current, createSyncMutation(type, entityId, summary))
      );
    };

    const createList: TaskStoreContextValue["createList"] = (input) => {
      const listId = `list-${Math.random().toString(36).slice(2, 10)}`;
      setState((current) => ({
        ...current,
        lists: [
          ...current.lists,
          {
            id: listId,
            archived: false,
            ...input
          }
        ]
      }));
      queueUserMutation("create-list", listId, `Create list "${input.name}"`);
    };

    const createTaskTemplate: TaskStoreContextValue["createTaskTemplate"] = (draft) => {
      let templateId = "";
      setState((current) => {
        const result = createTaskTemplateInState(current, draft);
        templateId = result.templateId;
        return result.state;
      });
      queueUserMutation("create-template", templateId, `Create task "${draft.title.trim()}"`);
      return templateId;
    };

    const updateTaskTemplate: TaskStoreContextValue["updateTaskTemplate"] = (
      templateId,
      updates
    ) => {
      setState((current) => updateTaskTemplateInState(current, templateId, updates));
      queueUserMutation("update-template", templateId, "Update task template");
    };

    const archiveTaskTemplate: TaskStoreContextValue["archiveTaskTemplate"] = (templateId) => {
      setState((current) => archiveTaskTemplateInState(current, templateId));
      queueUserMutation("archive-template", templateId, "Archive task template");
    };

    const updateInstanceReflection: TaskStoreContextValue["updateInstanceReflection"] = (
      templateId,
      reflection,
      date
    ) => {
      setState((current) => updateInstanceReflectionInState(current, templateId, reflection, date));
      queueUserMutation("update-reflection", templateId, "Update instance reflection");
    };

    const completeTask: TaskStoreContextValue["completeTask"] = (templateId, input) => {
      setState((current) => completeTaskInState(current, templateId, input));
      queueUserMutation("complete-task", templateId, "Complete task");
    };

    const rescheduleTask: TaskStoreContextValue["rescheduleTask"] = (templateId, input) => {
      setState((current) => rescheduleTaskInState(current, templateId, input));
      queueUserMutation("reschedule-task", templateId, `Reschedule task to ${input.scheduledTime}`);
    };

    const missTask: TaskStoreContextValue["missTask"] = (templateId, input) => {
      setState((current) => missTaskInState(current, templateId, input));
      queueUserMutation("miss-task", templateId, "Mark task missed");
    };

    const dismissReminder: TaskStoreContextValue["dismissReminder"] = (templateId, input) => {
      setState((current) => dismissReminderInState(current, templateId, input));
      queueUserMutation("dismiss-reminder", templateId, "Dismiss reminder");
    };

    const snoozeReminder: TaskStoreContextValue["snoozeReminder"] = (
      templateId,
      minutes,
      input
    ) => {
      setState((current) => snoozeReminderInState(current, templateId, minutes, input));
      queueUserMutation("snooze-reminder", templateId, `Snooze reminder by ${minutes} min`);
    };

    const markReminderNotified: TaskStoreContextValue["markReminderNotified"] = (
      templateId,
      input
    ) => {
      setState((current) => markReminderNotifiedInState(current, templateId, input));
    };

    const findTemplateById = (templateId: string) => getTemplateById(state, templateId);
    const findListById = (listId: string) => getListById(state, listId);
    const getTodayTaskList = () => getTodayTasks(state);
    const getMissedTaskList = () => getMissedTasks(state);
    const getDueReminderList = (now = new Date()) => getDueReminders(state, now);

    const getArchivedTemplates = () =>
      [...state.templates]
        .filter((template) => Boolean(template.archivedAt))
        .sort((left, right) => (right.archivedAt ?? "").localeCompare(left.archivedAt ?? ""));

    const defaultDraft = () => defaultQuickAdd(state.lists[0]?.id ?? "");
    const flushNow = () => {
      if (!isOnline) {
        return;
      }

      setSyncState((current) => flushPendingMutations(current));
    };

    return {
      ...state,
      createList,
      createTaskTemplate,
      updateTaskTemplate,
      archiveTaskTemplate,
      updateInstanceReflection,
      completeTask,
      rescheduleTask,
      missTask,
      dismissReminder,
      snoozeReminder,
      markReminderNotified,
      getTemplateById: findTemplateById,
      getListById: findListById,
      getTodayTasks: getTodayTaskList,
      getMissedTasks: getMissedTaskList,
      getDueReminders: getDueReminderList,
      getArchivedTemplates,
      defaultDraft,
      isOnline,
      isHydrated,
      pendingMutations: syncState.pendingMutations,
      lastSyncedAt: syncState.lastSyncedAt,
      flushPendingMutations: flushNow
    };
  }, [isHydrated, isOnline, state, syncState.lastSyncedAt, syncState.pendingMutations]);

  return <TaskStoreContext.Provider value={value}>{children}</TaskStoreContext.Provider>;
}

export function useTaskStore() {
  const context = useContext(TaskStoreContext);
  if (!context) {
    throw new Error("useTaskStore must be used inside TaskStoreProvider");
  }

  return context;
}
