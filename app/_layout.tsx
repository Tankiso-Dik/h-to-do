import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { TaskStoreProvider } from "../src/tasks/store";
import { ReminderNotifications } from "../src/tasks/ReminderCenter";
import { ThemeProvider, useTheme } from "../src/ui/theme";

export default function RootLayout() {
  return (
    <ThemeProvider>
      <TaskStoreProvider>
        <ReminderNotifications />
        <Navigator />
      </TaskStoreProvider>
    </ThemeProvider>
  );
}

function Navigator() {
  const { theme } = useTheme();

  return (
    <>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="preview"
          options={{
            headerShown: false,
            presentation: "card"
          }}
        />
        <Stack.Screen
          name="task/[taskId]"
          options={{
            headerShown: false,
            presentation: "card"
          }}
        />
      </Stack>
    </>
  );
}
