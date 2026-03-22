import { ActionButton } from "../mobile/primitives";
import type { TaskSort } from "./sort";

export function SortMenuButton({
  value,
  onChange
}: {
  value: TaskSort;
  onChange: (value: TaskSort) => void;
}) {
  return (
    <ActionButton
      label={value === "time" ? "Sort by time" : "Sort A-Z"}
      onPress={() => onChange(value === "time" ? "alphabetical" : "time")}
    />
  );
}
