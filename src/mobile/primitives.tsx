import Ionicons from "@expo/vector-icons/Ionicons";
import { usePathname, useRouter } from "expo-router";
import type { PropsWithChildren, ReactNode } from "react";
import { useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ui/theme";

type ButtonTone = "primary" | "secondary" | "ghost";

export function Screen({ children }: PropsWithChildren) {
  const { colors } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <View style={styles.backdrop} pointerEvents="none">
        <View
          style={[
            styles.backdropOrb,
            styles.backdropOrbLeft,
            { backgroundColor: colors.accentMuted }
          ]}
        />
        <View
          style={[
            styles.backdropOrb,
            styles.backdropOrbRight,
            { backgroundColor: colors.surfaceTint }
          ]}
        />
      </View>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        style={{ backgroundColor: colors.background }}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

export function UtilityBar({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const pathname = usePathname();
  const { colors, theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems: Array<{
    href: "/" | "/tasks" | "/missed" | "/analytics" | "/lists";
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
  }> = [
    { href: "/", icon: "sunny-outline", label: "My Day" },
    { href: "/tasks", icon: "checkbox-outline", label: "Tasks" },
    { href: "/missed", icon: "time-outline", label: "Missed" },
    { href: "/analytics", icon: "pulse-outline", label: "Analytics" },
    { href: "/lists", icon: "settings-outline", label: "Settings" }
  ];

  return (
    <>
      <View style={styles.utilityRow}>
        <Pressable
          accessibilityLabel="Open sidebar"
          onPress={() => setSidebarOpen(true)}
          style={({ pressed }) => [styles.utilityIconButton, { opacity: pressed ? 0.72 : 1 }]}
        >
          <Ionicons color={colors.text} name="menu-outline" size={compact ? 19 : 21} />
        </Pressable>

        <View
          style={[
            styles.searchShell,
            {
              borderColor: colors.line
            }
          ]}
        >
          <Ionicons color={colors.textMuted} name="search-outline" size={16} />
          <Text numberOfLines={1} style={[styles.searchLabel, { color: colors.textMuted }]}>
            Search tasks and reflections
          </Text>
        </View>

        <Pressable
          accessibilityLabel="Toggle theme"
          onPress={toggleTheme}
          style={({ pressed }) => [styles.utilityIconButton, { opacity: pressed ? 0.72 : 1 }]}
        >
          <Ionicons
            color={colors.text}
            name={theme === "dark" ? "sunny-outline" : "moon-outline"}
            size={compact ? 18 : 20}
          />
        </Pressable>

        <Pressable
          accessibilityLabel="Open settings"
          onPress={() => router.push("/lists")}
          style={({ pressed }) => [styles.utilityIconButton, { opacity: pressed ? 0.72 : 1 }]}
        >
          <Ionicons color={colors.text} name="settings-outline" size={compact ? 18 : 20} />
        </Pressable>
      </View>

      <Modal
        animationType="fade"
        onRequestClose={() => setSidebarOpen(false)}
        transparent
        visible={sidebarOpen}
      >
        <View style={styles.sidebarRoot}>
          <Pressable onPress={() => setSidebarOpen(false)} style={styles.sidebarOverlay} />
          <View
            style={[
              styles.sidebarPanel,
              {
                backgroundColor: colors.surface,
                borderColor: colors.line
              }
            ]}
          >
            <View style={styles.sidebarHeader}>
              <SectionLabel>Navigation</SectionLabel>
              <Text style={[styles.sidebarTitle, { color: colors.text }]}>Sidebar</Text>
            </View>

            <View style={styles.sidebarStack}>
              {navItems.map((item) => {
                const selected =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Pressable
                    key={item.href}
                    onPress={() => {
                      setSidebarOpen(false);
                      router.push(item.href);
                    }}
                    style={({ pressed }) => [
                      styles.sidebarItem,
                      {
                        borderColor: selected ? colors.text : colors.line,
                        opacity: pressed ? 0.8 : 1
                      }
                    ]}
                  >
                    <Ionicons
                      color={selected ? colors.text : colors.textMuted}
                      name={item.icon}
                      size={18}
                    />
                    <Text
                      style={[
                        styles.sidebarLabel,
                        { color: selected ? colors.text : colors.textMuted }
                      ]}
                    >
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

export function Header({
  title,
  subtitle,
  right,
  icon = "sparkles-outline"
}: {
  title: string;
  subtitle?: string;
  right?: ReactNode;
  icon?: keyof typeof Ionicons.glyphMap;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.headerRow}>
      <View style={styles.headerCopy}>
        <View style={styles.headerLead}>
          <Ionicons color={colors.accent} name={icon} size={18} />
          <Text style={[styles.headerLeadText, { color: colors.textMuted }]}>Journal</Text>
        </View>
        <View style={styles.titleRow}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
          <Text style={[styles.ellipsis, { color: colors.textMuted }]}>...</Text>
        </View>
        {subtitle ? (
          <Text style={[styles.headerSubtitle, { color: colors.textMuted }]}>{subtitle}</Text>
        ) : null}
      </View>
      {right ? <View style={styles.headerRight}>{right}</View> : null}
    </View>
  );
}

export function Card({ children }: PropsWithChildren) {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.card,
        {
          borderColor: colors.line
        }
      ]}
    >
      {children}
    </View>
  );
}

export function SectionLabel({ children }: PropsWithChildren) {
  const { colors } = useTheme();
  return <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>{children}</Text>;
}

export function BodyText({
  children,
  muted = false
}: PropsWithChildren<{ muted?: boolean }>) {
  const { colors } = useTheme();
  return (
    <Text style={[styles.bodyText, { color: muted ? colors.textMuted : colors.text }]}>
      {children}
    </Text>
  );
}

export function ActionButton({
  label,
  onPress,
  tone = "secondary",
  disabled = false
}: {
  label: string;
  onPress: () => void;
  tone?: ButtonTone;
  disabled?: boolean;
}) {
  const { colors } = useTheme();

  const toneStyle =
    tone === "primary"
      ? {
          backgroundColor: colors.accent,
          borderColor: colors.accent,
          textColor: "#ffffff"
        }
      : tone === "ghost"
        ? {
            backgroundColor: "transparent",
            borderColor: colors.line,
            textColor: colors.text
          }
        : {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.line,
            textColor: colors.text
          };

  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: toneStyle.backgroundColor,
          borderColor: toneStyle.borderColor,
          opacity: disabled ? 0.45 : pressed ? 0.82 : 1
        }
      ]}
    >
      <Text style={[styles.buttonLabel, { color: toneStyle.textColor }]}>{label}</Text>
    </Pressable>
  );
}

export function ChoiceChip({
  label,
  selected,
  onPress
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? colors.accentMuted : colors.surfaceMuted,
          borderColor: selected ? colors.accent : colors.line,
          opacity: pressed ? 0.8 : 1
        }
      ]}
    >
      <Text style={[styles.chipLabel, { color: selected ? colors.accent : colors.textMuted }]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const { colors } = useTheme();

  return (
    <View style={styles.field}>
      <SectionLabel>{label}</SectionLabel>
      <TextInput
        multiline={multiline}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        style={[
          styles.input,
          {
            backgroundColor: colors.surfaceMuted,
            borderColor: colors.line,
            color: colors.text,
            minHeight: multiline ? 104 : 46,
            textAlignVertical: multiline ? "top" : "center"
          }
        ]}
        value={value}
      />
    </View>
  );
}

export function EmptyState({
  title,
  body
}: {
  title: string;
  body: string;
}) {
  const { colors } = useTheme();

  return (
    <Card>
      <Text style={[styles.emptyTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.emptyBody, { color: colors.textMuted }]}>{body}</Text>
    </Card>
  );
}

export function Divider() {
  const { colors } = useTheme();
  return <View style={[styles.divider, { backgroundColor: colors.line }]} />;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject
  },
  backdropOrb: {
    position: "absolute",
    borderRadius: 999
  },
  backdropOrbLeft: {
    width: 240,
    height: 240,
    top: -84,
    left: -72,
    opacity: 0.82
  },
  backdropOrbRight: {
    width: 180,
    height: 180,
    top: 120,
    right: -48,
    opacity: 0.7
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 120,
    gap: 18
  },
  utilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  utilityIconButton: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center"
  },
  searchShell: {
    flex: 1,
    minHeight: 42,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  sidebarRoot: {
    flex: 1,
    flexDirection: "row"
  },
  sidebarOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.32)"
  },
  sidebarPanel: {
    width: 250,
    borderRightWidth: 1,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 24,
    gap: 16
  },
  sidebarHeader: {
    gap: 6
  },
  sidebarTitle: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.4
  },
  sidebarStack: {
    gap: 8
  },
  sidebarItem: {
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 4,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  sidebarLabel: {
    fontSize: 15,
    fontWeight: "600"
  },
  searchLabel: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600"
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
  },
  headerCopy: {
    flex: 1,
    gap: 4
  },
  headerLead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  headerLeadText: {
    fontSize: 13,
    fontWeight: "700",
    letterSpacing: 0.3
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.8
  },
  ellipsis: {
    fontSize: 22,
    lineHeight: 34,
    fontWeight: "600"
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22
  },
  headerRight: {
    paddingTop: 2
  },
  card: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingTop: 4,
    paddingBottom: 16,
    gap: 14
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.7,
    textTransform: "uppercase"
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22
  },
  button: {
    minHeight: 40,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  buttonLabel: {
    fontSize: 15,
    fontWeight: "600"
  },
  chip: {
    minHeight: 32,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center"
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: "600"
  },
  field: {
    gap: 8
  },
  input: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  emptyBody: {
    fontSize: 15,
    lineHeight: 22
  },
  divider: {
    height: 1,
    width: "100%"
  }
});
