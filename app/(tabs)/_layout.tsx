import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { View } from "react-native";
import { useTheme } from "../../src/ui/theme";

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: {
          backgroundColor: colors.background
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.line,
          borderTopWidth: 1,
          height: 72,
          paddingBottom: 10,
          paddingTop: 10
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon color={color} focused={focused} name="sunny-outline" size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon color={color} focused={focused} name="checkbox-outline" size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="missed"
        options={{
          title: "Missed",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon color={color} focused={focused} name="time-outline" size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon color={color} focused={focused} name="pulse-outline" size={size} />
          )
        }}
      />
      <Tabs.Screen
        name="lists"
        options={{
          title: "Settings",
          tabBarIcon: ({ color, size, focused }) => (
            <TabIcon color={color} focused={focused} name="settings-outline" size={size} />
          )
        }}
      />
    </Tabs>
  );
}

function TabIcon({
  color,
  focused,
  name,
  size
}: {
  color: string;
  focused: boolean;
  name: keyof typeof Ionicons.glyphMap;
  size: number;
}) {
  const { colors } = useTheme();

  return (
    <View
      style={{
        minWidth: 42,
        minHeight: 34,
        borderRadius: 6,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: focused ? colors.accentMuted : "transparent"
      }}
    >
      <Ionicons color={color} name={name} size={size} />
    </View>
  );
}
