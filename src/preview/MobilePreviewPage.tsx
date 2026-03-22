import { useRouter } from "expo-router";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../ui/theme";

export function MobilePreviewPage() {
  const router = useRouter();
  const { colors, theme } = useTheme();
  const frameUrl = "/";

  return (
    <SafeAreaView
      edges={["top", "left", "right", "bottom"]}
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <View style={styles.page}>
        <View style={styles.copy}>
          <Text style={[styles.eyebrow, { color: colors.textMuted }]}>DEV PREVIEW</Text>
          <Text style={[styles.title, { color: colors.text }]}>Mobile web frame</Text>
          <Text style={[styles.body, { color: colors.textMuted }]}>
            Use this route to test the app inside a phone-sized frame without leaving the desktop browser.
          </Text>
        </View>

        <Pressable
          onPress={() => router.replace("/")}
          style={({ pressed }) => [
            styles.primaryButton,
            {
              borderColor: colors.line,
              opacity: pressed ? 0.82 : 1
            }
          ]}
        >
          <Text style={[styles.primaryButtonLabel, { color: colors.text }]}>Open the real app</Text>
        </Pressable>

        <View style={styles.frameWrap}>
          <View style={[styles.phoneShell, { backgroundColor: theme === "dark" ? "#060606" : "#0d1320" }]}>
            {Platform.OS === "web" ? (
              <iframe
                src={frameUrl}
                style={iframeStyle}
                title="Mobile app preview"
              />
            ) : (
              <View style={[styles.nativeFallback, { backgroundColor: colors.surface }]}>
                <Text style={[styles.nativeFallbackTitle, { color: colors.text }]}>Preview is web-only</Text>
                <Text style={[styles.nativeFallbackBody, { color: colors.textMuted }]}>
                  Open `/preview` in the browser to use the framed mobile preview route.
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const iframeStyle: React.CSSProperties = {
  width: "100%",
  height: "100%",
  border: "0",
  borderRadius: "28px",
  backgroundColor: "#ffffff"
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1
  },
  page: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 28,
    gap: 18
  },
  copy: {
    width: "100%",
    maxWidth: 420,
    gap: 6
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8
  },
  title: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: "800",
    letterSpacing: -0.6
  },
  body: {
    fontSize: 16,
    lineHeight: 24
  },
  primaryButton: {
    width: "100%",
    maxWidth: 420,
    minHeight: 44,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 14
  },
  primaryButtonLabel: {
    fontSize: 16,
    fontWeight: "600"
  },
  frameWrap: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "flex-start"
  },
  phoneShell: {
    width: 340,
    maxWidth: "100%",
    height: 720,
    borderRadius: 34,
    padding: 10
  },
  nativeFallback: {
    flex: 1,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 8
  },
  nativeFallbackTitle: {
    fontSize: 18,
    fontWeight: "700"
  },
  nativeFallbackBody: {
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center"
  }
});
