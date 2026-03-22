import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { buildSuggestionsDigest } from "./insights";
import { requestOpenRouterSuggestions } from "./openrouter";
import { useTaskStore } from "./store";

type SuggestionsState = {
  summary: string;
  cards: ReturnType<typeof buildSuggestionsDigest>["cards"];
  source: "local" | "ai";
  status: "idle" | "loading" | "ready" | "error";
  error: string | null;
};

export function useSuggestions() {
  const { lists, templates, instances, isOnline } = useTaskStore();
  const digest = useMemo(
    () => buildSuggestionsDigest({ lists, templates, instances }),
    [instances, lists, templates]
  );
  const [state, setState] = useState<SuggestionsState>({
    summary: digest.summary,
    cards: digest.cards,
    source: "local",
    status: "idle",
    error: null
  });
  const apiKey = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY;
  const cacheKey = useMemo(
    () =>
      `task-journal.suggestions.${JSON.stringify({
        metrics: digest.metrics,
        snapshot: digest.snapshot
      })}`,
    [digest.metrics, digest.snapshot]
  );

  useEffect(() => {
    setState((current) => ({
      summary: digest.summary,
      cards: digest.cards,
      source: current.source === "ai" ? current.source : "local",
      status: apiKey && isOnline ? "loading" : "ready",
      error: null
    }));

    if (!apiKey || !isOnline) {
      return;
    }

    let cancelled = false;

    AsyncStorage.getItem(cacheKey)
      .then((cached) => {
        if (cancelled || !cached) {
          return null;
        }

        try {
          const parsed = JSON.parse(cached) as {
            summary: string;
            cards: SuggestionsState["cards"];
          };
          setState({
            summary: parsed.summary,
            cards: parsed.cards,
            source: "ai",
            status: "ready",
            error: null
          });
          return parsed;
        } catch {
          return AsyncStorage.removeItem(cacheKey).then(() => null);
        }
      })
      .then((cached) => {
        if (cancelled || cached) {
          return;
        }

        return requestOpenRouterSuggestions(digest)
          .then(async (result) => {
            if (cancelled) {
              return;
            }

            await AsyncStorage.setItem(cacheKey, JSON.stringify(result));
            setState({
              summary: result.summary,
              cards: result.cards,
              source: "ai",
              status: "ready",
              error: null
            });
          })
          .catch((error: unknown) => {
            if (cancelled) {
              return;
            }

            setState({
              summary: digest.summary,
              cards: digest.cards,
              source: "local",
              status: "error",
              error: error instanceof Error ? error.message : "Suggestions request failed"
            });
          });
      });

    return () => {
      cancelled = true;
    };
  }, [apiKey, cacheKey, digest, isOnline]);

  return {
    ...state,
    metrics: digest.metrics,
    snapshot: digest.snapshot
  };
}
