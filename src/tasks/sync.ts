export type SyncMutationType =
  | "create-list"
  | "create-template"
  | "update-template"
  | "archive-template"
  | "update-reflection"
  | "complete-task"
  | "reschedule-task"
  | "miss-task"
  | "dismiss-reminder"
  | "snooze-reminder";

export type SyncMutation = {
  id: string;
  type: SyncMutationType;
  entityId: string;
  summary: string;
  createdAt: string;
};

export type SyncState = {
  pendingMutations: SyncMutation[];
  lastSyncedAt: string | null;
};

export function buildInitialSyncState(): SyncState {
  return {
    pendingMutations: [],
    lastSyncedAt: null
  };
}

export function createSyncMutation(
  type: SyncMutationType,
  entityId: string,
  summary: string,
  now = new Date()
): SyncMutation {
  return {
    id: `mutation-${Math.random().toString(36).slice(2, 10)}`,
    type,
    entityId,
    summary,
    createdAt: now.toISOString()
  };
}

export function queueMutation(
  syncState: SyncState,
  mutation: SyncMutation
): SyncState {
  return {
    ...syncState,
    pendingMutations: [...syncState.pendingMutations, mutation]
  };
}

export function flushPendingMutations(
  syncState: SyncState,
  now = new Date()
): SyncState {
  if (syncState.pendingMutations.length === 0) {
    return syncState;
  }

  return {
    pendingMutations: [],
    lastSyncedAt: now.toISOString()
  };
}

export function formatSyncTimestamp(timestamp: string | null) {
  if (!timestamp) {
    return "Not synced yet";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(timestamp));
}
