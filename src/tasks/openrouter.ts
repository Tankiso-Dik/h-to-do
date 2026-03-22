import { Platform } from "react-native";
import type { SuggestionCard, SuggestionsDigest } from "./insights";

export type AiSuggestionsResult = {
  summary: string;
  cards: SuggestionCard[];
};

export async function requestOpenRouterSuggestions(
  digest: SuggestionsDigest
): Promise<AiSuggestionsResult> {
  const content = await requestOpenRouter({
    system:
      "You write calm, concise productivity observations. Return strict JSON with keys summary and cards. cards must be an array of 2 to 4 items, each with title, body, and tone where tone is steady, warning, or opportunity.",
    payload: {
      product: "A reflective task journal inspired by Microsoft To Do",
      localSummary: digest.summary,
      metrics: digest.metrics,
      snapshot: digest.snapshot,
      localCards: digest.cards
    },
    json: true
  });

  const parsed = JSON.parse(content) as {
    summary?: string;
    cards?: Array<{ title?: string; body?: string; tone?: SuggestionCard["tone"] }>;
  };

  if (!parsed.summary || !Array.isArray(parsed.cards)) {
    throw new Error("OpenRouter returned invalid suggestion JSON");
  }

  return {
    summary: parsed.summary,
    cards: parsed.cards
      .filter((card) => card.title && card.body)
      .slice(0, 4)
      .map((card, index) => ({
        id: `ai-${index}`,
        title: card.title ?? "Suggestion",
        body: card.body ?? "",
        tone:
          card.tone === "steady" || card.tone === "warning" || card.tone === "opportunity"
            ? card.tone
            : "steady"
      }))
  };
}

async function requestOpenRouter(input: { system: string; payload: unknown; json: boolean }) {
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  const model = process.env.EXPO_PUBLIC_OPENROUTER_MODEL || "openai/gpt-oss-20b:free";

  if (!apiKey) {
    throw new Error("Missing EXPO_PUBLIC_OPENROUTER_API_KEY");
  }

  const headers: Record<string, string> = {
    Authorization: `Bearer ${apiKey}`,
    "Content-Type": "application/json",
    "X-Title": "Task Journal"
  };

  if (Platform.OS === "web" && typeof location !== "undefined") {
    headers["HTTP-Referer"] = location.origin;
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model,
      ...(input.json ? { response_format: { type: "json_object" } } : {}),
      messages: [
        {
          role: "system",
          content: input.system
        },
        {
          role: "user",
          content: JSON.stringify(input.payload)
        }
      ]
    })
  });

  if (!response.ok) {
    try {
      const errorPayload = (await response.json()) as {
        error?: { message?: string };
      };
      throw new Error(
        errorPayload.error?.message ?? `OpenRouter request failed with ${response.status}`
      );
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }

      throw new Error(`OpenRouter request failed with ${response.status}`);
    }
  }

  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const rawContent = payload.choices?.[0]?.message?.content;

  if (!rawContent) {
    throw new Error("OpenRouter returned no content");
  }

  return rawContent;
}
