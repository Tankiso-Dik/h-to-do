import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import type { PropsWithChildren, ReactNode } from "react";
import {
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
  const { colors, theme, toggleTheme } = useTheme();
  const supportCopy = compact
    ? "Plan realistically"
    : "Plan, notice, and adjust without backlog pressure.";

  return (
    <View style={styles.utilityRow}>
      <View style={styles.utilityCopy}>
        <SectionLabel>Task journal</SectionLabel>
        <Text numberOfLines={1} style={[styles.utilityHint, { color: colors.textMuted }]}>
          {supportCopy}
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
        accessibilityLabel="Open more"
        onPress={() => router.push("/lists")}
        style={({ pressed }) => [styles.utilityIconButton, { opacity: pressed ? 0.72 : 1 }]}
      >
        <Ionicons color={colors.text} name="ellipsis-horizontal" size={compact ? 18 : 20} />
      </Pressable>
    </View>
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
          <Text style={[styles.headerLeadText, { color: colors.textMuted }]}>Task journal</Text>
        </View>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{title}</Text>
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
          textColor: colors.background
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
    gap: 22
  },
  utilityRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  utilityCopy: {
    flex: 1,
    gap: 3
  },
  utilityHint: {
    fontSize: 13,
    lineHeight: 18
  },
  utilityIconButton: {
    width: 26,
    height: 26,
    alignItems: "center",
    justifyContent: "center"
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 12
  },
  headerCopy: {
    flex: 1,
    gap: 6
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
  headerTitle: {
    fontSize: 32,
    lineHeight: 36,
    fontWeight: "800",
    letterSpacing: -1
  },
  headerSubtitle: {
    fontSize: 15,
    lineHeight: 22,
    maxWidth: 540
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
    lineHeight: 23
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
    fontSize: 14,
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
    fontWeight: "600",
    letterSpacing: 0.2
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
