import { useTheme } from "next-themes";

export function useThemeMode() {
  const { resolvedTheme, setTheme, theme } = useTheme();

  const activeTheme =
    resolvedTheme ?? (theme === "dark" || theme === "light" ? theme : "light");

  return {
    theme: activeTheme,
    darkMode: activeTheme === "dark",
    toggleDarkMode: () => {
      setTheme(activeTheme === "dark" ? "light" : "dark");
    },
  };
}
