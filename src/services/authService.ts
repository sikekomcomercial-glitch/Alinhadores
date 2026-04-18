import { createClient } from "./supabaseBrowser";

export const authService = {
  async signInWithEmailPassword(email: string, password: string) {
    // LOGIN DEMO (MOCK)
    if ((email === "dentista@demo.com" || email === "paciente@demo.com") && password === "demo123") {
      const role = email.startsWith("paciente") ? "patient" : "dentist";
      
      // Criar cookies de sessão mock para o middleware reconhecer
      document.cookie = `next-auth.demo-session=true; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `next-auth.role=${role}; path=/; max-age=86400; SameSite=Lax`;
      
      return { data: { user: { id: "mock-id", email } }, error: null };
    }

    const supabase = createClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  async signOut() {
    // Limpar cookies demo se existirem
    document.cookie = "next-auth.demo-session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "next-auth.role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

    const supabase = createClient();
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  async checkUserRole(userId: string) {
    if (userId === "mock-id") {
       // Pega do cookie se for mock
       const match = document.cookie.match(/next-auth\.role=([^;]+)/);
       return match ? match[1] : "dentist";
    }

    const supabase = createClient();
    // Verifica se esse UID existe na tabela pacients
    const { data: patient } = await supabase
      .from('patients')
      .select('id')
      .eq('id', userId)
      .single();

    if (patient) {
      return "patient";
    }
    
    // Por padrão (se não for paciente), assumimos dentista para este MVP
    return "dentist";
  },

  async getCurrentUser() {
    const isDemo = document.cookie.includes("next-auth.demo-session=true");
    if (isDemo) {
       return { id: "mock-id", email: "paciente@demo.com" };
    }

    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};
