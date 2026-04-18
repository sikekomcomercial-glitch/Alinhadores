"use client";

import { useEffect } from "react";
import { settingsService } from "@/services/settingsService";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Ao carregar o lado client do App, aplica a cor imediatamente
    settingsService.getTheme().then((theme) => {
      document.documentElement.style.setProperty("--primary", theme.primary);
    });
  }, []);

  return <>{children}</>;
}
