import Ionicons from "@expo/vector-icons/Ionicons";
import { StyleSheet, Text, View } from "react-native";
import {
  BodyText,
  Card,
  Header,
  Screen,
  SectionLabel,
  UtilityBar
} from "../mobile/primitives";
import { useTheme } from "../ui/theme";

const prompts = [
  "Help me lighten today if I planned too much.",
  "What pattern from my missed tasks matters most right now?",
  "Rewrite this afternoon into a more realistic sequence."
];

export function ChatPage() {
  const { colors } = useTheme();

  return (
    <Screen>
      <UtilityBar />
      <Header
        icon="chatbubble-ellipses-outline"
        title="Chat"
        subtitle="Talk through today, pressure points, and smaller next moves."
      />

      <Card>
        <SectionLabel>Planning assistant</SectionLabel>
        <Text style={[styles.title, { color: colors.text }]}>A calm place to reshape the day</Text>
        <BodyText muted>
          This first pass sets the conversational shell for planning. The assistant will help
          review recent behavior, rewrite unrealistic schedules, and surface smaller, more
          usable next steps.
        </BodyText>
      </Card>

      <Card>
        <SectionLabel>Try asking</SectionLabel>
        <View style={styles.stack}>
          {prompts.map((prompt) => (
            <View key={prompt} style={[styles.promptRow, { borderColor: colors.line }]}>
              <Ionicons color={colors.textMuted} name="return-up-forward-outline" size={16} />
              <Text style={[styles.promptText, { color: colors.text }]}>{prompt}</Text>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <SectionLabel>Current scope</SectionLabel>
        <BodyText muted>
          The conversational shell is in place so navigation matches the product promise. The
          next implementation pass can wire this screen to the suggestion and history context
          already present in the app.
        </BodyText>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "700"
  },
  stack: {
    gap: 8
  },
  promptRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    borderBottomWidth: StyleSheet.hairlineWidth,
    paddingVertical: 10
  },
  promptText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22
  }
});
