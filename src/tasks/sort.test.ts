import { describe, expect, it } from "vitest";
import { buildInitialState, getTodayTasks } from "./model";
import { sortTaskEntries } from "./sort";

describe("task sorting", () => {
  it("can sort visible tasks alphabetically", () => {
    const tasks = getTodayTasks(buildInitialState());
    const sorted = sortTaskEntries(tasks, "alphabetical");

    expect(sorted[0]?.template.title).toBe("Deep work block");
    expect(sorted.at(-1)?.template.title).toBe("Walk and reset");
  });

  it("can sort visible tasks by time", () => {
    const tasks = getTodayTasks(buildInitialState());
    const sorted = sortTaskEntries(tasks, "time");

    expect(sorted[0]?.instance.scheduledTime).toBe("08:15");
    expect(sorted.at(-1)?.instance.scheduledTime).toBe("18:00");
  });
});
