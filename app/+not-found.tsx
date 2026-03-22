import { router } from "expo-router";
import { ActionButton, EmptyState, Screen } from "../src/mobile/primitives";

export default function NotFoundScreen() {
  return (
    <Screen>
      <EmptyState
        body="The route you opened does not exist in this Expo app."
        title="Not found"
      />
      <ActionButton label="Go home" onPress={() => router.replace("/")} />
    </Screen>
  );
}
