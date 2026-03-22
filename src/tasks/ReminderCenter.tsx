import * as Notifications from "expo-notifications";
import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { ActionButton } from "../mobile/primitives";
import { useTaskStore } from "./store";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

type PermissionState = "undetermined" | "denied" | "granted";

function reminderKey(input: { templateId: string; date: string }) {
  return `${input.templateId}:${input.date}`;
}

async function ensureAndroidChannel() {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync("default", {
    name: "Task reminders",
    importance: Notifications.AndroidImportance.MAX
  });
}

async function getPermissionState(): Promise<PermissionState> {
  const permission = await Notifications.getPermissionsAsync();
  if (permission.granted) {
    return "granted";
  }

  if (permission.canAskAgain === false) {
    return "denied";
  }

  return "undetermined";
}

export function ReminderPermissionButton() {
  const [permission, setPermission] = useState<PermissionState>("undetermined");

  useEffect(() => {
    getPermissionState().then(setPermission).catch(() => {
      setPermission("denied");
    });
  }, []);

  if (permission === "granted") {
    return null;
  }

  return (
    <ActionButton
      label={permission === "denied" ? "Alerts denied" : "Enable alerts"}
      onPress={async () => {
        await ensureAndroidChannel();
        const response = await Notifications.requestPermissionsAsync();
        setPermission(response.granted ? "granted" : "denied");
      }}
    />
  );
}

export function ReminderNotifications() {
  const { instances, getTemplateById, markReminderNotified, isHydrated } = useTaskStore();
  const activeReminders = useMemo(
    () =>
      instances
        .filter((instance) => {
          if (!instance.reminderAt || instance.reminderDismissedAt) {
            return false;
          }

          return instance.status === "scheduled" || instance.status === "rescheduled";
        })
        .map((instance) => {
          const template = getTemplateById(instance.templateId);
          return template
            ? {
                instance,
                template
              }
            : null;
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    [getTemplateById, instances]
  );

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    let cancelled = false;

    async function syncNotifications() {
      await ensureAndroidChannel();

      const permission = await Notifications.getPermissionsAsync();
      if (!permission.granted) {
        return;
      }

      const now = Date.now();
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const activeKeys = new Set(
        activeReminders.map((reminder) =>
          reminderKey({
            templateId: reminder.template.id,
            date: reminder.instance.date
          })
        )
      );

      await Promise.all(
        scheduled
          .filter((entry) => {
            const templateId = entry.content.data?.templateId;
            const date = entry.content.data?.date;

            if (typeof templateId !== "string" || typeof date !== "string") {
              return false;
            }

            return !activeKeys.has(reminderKey({ templateId, date }));
          })
          .map((entry) => Notifications.cancelScheduledNotificationAsync(entry.identifier))
      );

      const scheduledKeys = new Set(
        scheduled
          .map((entry) => {
            const templateId = entry.content.data?.templateId;
            const date = entry.content.data?.date;

            return typeof templateId === "string" && typeof date === "string"
              ? reminderKey({ templateId, date })
              : null;
          })
          .filter((entry): entry is string => Boolean(entry))
      );

      await Promise.all(
        activeReminders.map(async (reminder) => {
          const key = reminderKey({
            templateId: reminder.template.id,
            date: reminder.instance.date
          });

          if (scheduledKeys.has(key)) {
            return;
          }

          const reminderAt = new Date(reminder.instance.reminderAt ?? "");
          const triggerDate = reminderAt.getTime() <= now ? new Date(now + 1000) : reminderAt;

          await Notifications.scheduleNotificationAsync({
            content: {
              title: reminder.template.title,
              body: reminder.instance.reminderLabel,
              data: {
                templateId: reminder.template.id,
                date: reminder.instance.date
              }
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.DATE,
              date: triggerDate
            }
          });
        })
      );
    }

    syncNotifications().catch(() => {
      if (!cancelled) {
        // Ignore scheduling errors in the prototype shell.
      }
    });

    const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      const templateId = notification.request.content.data?.templateId;
      const date = notification.request.content.data?.date;

      if (typeof templateId === "string") {
        markReminderNotified(templateId, { date: typeof date === "string" ? date : undefined });
      }
    });

    const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const templateId = response.notification.request.content.data?.templateId;
      const date = response.notification.request.content.data?.date;

      if (typeof templateId === "string") {
        markReminderNotified(templateId, { date: typeof date === "string" ? date : undefined });
      }
    });

    return () => {
      cancelled = true;
      receivedSubscription.remove();
      responseSubscription.remove();
    };
  }, [activeReminders, isHydrated, markReminderNotified]);

  return null;
}
