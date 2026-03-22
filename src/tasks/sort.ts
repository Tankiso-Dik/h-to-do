import type { TaskWithInstance } from "./model";

export type TaskSort = "time" | "alphabetical";

export function sortTaskEntries(tasks: TaskWithInstance[], sortBy: TaskSort) {
  const entries = [...tasks];

  if (sortBy === "alphabetical") {
    return entries.sort((left, right) => left.template.title.localeCompare(right.template.title));
  }

  return entries.sort((left, right) => left.instance.scheduledTime.localeCompare(right.instance.scheduledTime));
}
