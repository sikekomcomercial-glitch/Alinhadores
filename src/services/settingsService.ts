import { createClient } from "./supabaseBrowser";

export const settingsService = {
  async getTheme() {
    if (typeof window === "undefined") return { primary: "#A8C5DA" }; // Default no server

    const localTheme = localStorage.getItem("alinhadores_theme_color");
    if (localTheme) return { primary: localTheme };

    const supabase = createClient();
    const { data } = await supabase.from("dentist_settings").select("theme_primary_color").limit(1).single();
    
    // Fallback default
    const color = data?.theme_primary_color || "#A8C5DA";
    localStorage.setItem("alinhadores_theme_color", color);
    return { primary: color };
  },

  async updateTheme(colorHex: string) {
    if (typeof window !== "undefined") {
       localStorage.setItem("alinhadores_theme_color", colorHex);
       document.documentElement.style.setProperty("--primary", colorHex);
    }
    
    // No modo DEMO apenas altera no LocalStorage/DOM
    const match = typeof document !== 'undefined' && document.cookie.match(/next-auth\.demo-session=([^;]+)/);
    if (match) return { success: true };

    const supabase = createClient();
    const { data: userData } = await supabase.auth.getUser();
    if(userData.user) {
        await supabase
          .from("dentist_settings")
          .upsert({ dentist_id: userData.user.id, theme_primary_color: colorHex });
    }
    
    return { success: true };
  }
};
