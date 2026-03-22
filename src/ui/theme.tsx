import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  type PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { Appearance, type ColorSchemeName } from "react-native";

type Theme = "light" | "dark";

type Palette = {
  background: string;
  surface: string;
  surfaceMuted: string;
  surfaceTint: string;
  text: string;
  textMuted: string;
  line: string;
  accent: string;
  accentMuted: string;
  success: string;
  warning: string;
  danger: string;
};

type ThemeContextValue = {
  theme: Theme;
  colors: Palette;
  toggleTheme: () => void;
  hydrated: boolean;
};

const STORAGE_KEY = "task-journal.theme";

const lightPalette: Palette = {
  background: "#f6f6f3",
  surface: "#ffffff",
  surfaceMuted: "#f0f0eb",
  surfaceTint: "#fafaf7",
  text: "#111111",
  textMuted: "#6e6e68",
  line: "#ddddd5",
  accent: "#111111",
  accentMuted: "#ecece6",
  success: "#111111",
  warning: "#454545",
  danger: "#6a6a6a"
};

const darkPalette: Palette = {
  background: "#0b0b0b",
  surface: "#121212",
  surfaceMuted: "#181818",
  surfaceTint: "#101010",
  text: "#f5f5f1",
  textMuted: "#999991",
  line: "#2a2a2a",
  accent: "#ffffff",
  accentMuted: "#1d1d1d",
  success: "#ffffff",
  warning: "#b8b8b2",
  danger: "#8f8f89"
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function normalizeScheme(value: ColorSchemeName | null | undefined) {
  return value === "dark" ? "dark" : "light";
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const [theme, setTheme] = useState<Theme>(normalizeScheme(Appearance.getColorScheme()));
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let cancelled = false;

    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (cancelled) {
          return;
        }

        if (stored === "light" || stored === "dark") {
          setTheme(stored);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setHydrated(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, theme).catch(() => {
      // Ignore storage errors and keep the in-memory theme.
    });
  }, [hydrated, theme]);

  const value = useMemo<ThemeContextValue>(
    () => ({
      theme,
      colors: theme === "dark" ? darkPalette : lightPalette,
      toggleTheme: () =>
        setTheme((current) => (current === "light" ? "dark" : "light")),
      hydrated
    }),
    [hydrated, theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used inside ThemeProvider");
  }

  return context;
}
