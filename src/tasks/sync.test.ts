import { describe, expect, it } from "vitest";
import {
  buildInitialSyncState,
  createSyncMutation,
  flushPendingMutations,
  queueMutation
} from "./sync";

describe("sync queue", () => {
  it("queues mutations in creation order", () => {
    const initial = buildInitialSyncState();
    const next = queueMutation(
      queueMutation(
        initial,
        createSyncMutation("create-template", "template-1", "Create task")
      ),
      createSyncMutation("complete-task", "template-1", "Complete task")
    );

    expect(next.pendingMutations).toHaveLength(2);
    expect(next.pendingMutations[0]?.type).toBe("create-template");
    expect(next.pendingMutations[1]?.type).toBe("complete-task");
  });

  it("flushes queued mutations and records the sync time", () => {
    const queued = queueMutation(
      buildInitialSyncState(),
      createSyncMutation("miss-task", "template-2", "Mark task missed")
    );
    const now = new Date("2026-03-07T20:15:00.000Z");
    const flushed = flushPendingMutations(queued, now);

    expect(flushed.pendingMutations).toHaveLength(0);
    expect(flushed.lastSyncedAt).toBe(now.toISOString());
  });
});
