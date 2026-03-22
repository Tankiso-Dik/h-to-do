import { describe, expect, it } from "vitest";
import { buildInitialState } from "./model";
import { buildSuggestionsDigest } from "./insights";

describe("suggestion insights", () => {
  it("builds a usable summary and cards from recent task history", () => {
    const digest = buildSuggestionsDigest(buildInitialState());

    expect(digest.summary.length).toBeGreaterThan(20);
    expect(digest.cards.length).toBeGreaterThan(0);
    expect(digest.metrics.missedCount).toBeGreaterThan(0);
    expect(digest.snapshot.bestWindow).toBeTruthy();
  });

  it("surfaces repeated slipping tasks when misses and reschedules stack up", () => {
    const digest = buildSuggestionsDigest(buildInitialState());
    const slippingCard = digest.cards.find((card) => card.id === "slipping-task");

    expect(slippingCard?.title).toContain("Deep work block");
  });
});
