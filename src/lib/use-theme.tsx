"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type ThemeContextValue = { dark: boolean; toggle: () => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const next = localStorage.getItem("amanahkas-theme") === "dark";
    setDark(next);
    document.documentElement.dataset.shell = "light";
    if (next) document.documentElement.dataset.theme = "dark";
  }, []);
  const toggle = useCallback(
    () =>
      setDark((current) => {
        const next = !current;
        if (next) document.documentElement.dataset.theme = "dark";
        else document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("amanahkas-theme", next ? "dark" : "light");
        return next;
      }),
    [],
  );
  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme requires ThemeProvider");
  return value;
}
