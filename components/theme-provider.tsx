"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface ThemeCtx {
  dark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeCtx>({ dark: true, toggleTheme: () => {} });

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [dark, setDark] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("itoolbox_theme");
    const isDark =
      saved === "dark"
        ? true
        : saved === "light"
          ? false
          : window.matchMedia("(prefers-color-scheme: dark)").matches;
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    localStorage.setItem("itoolbox_theme", next ? "dark" : "light");
    document.documentElement.classList.toggle("dark", next);
  }

  return (
    <ThemeContext.Provider value={{ dark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
