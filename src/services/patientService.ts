import { createClient } from "./supabaseBrowser";

export interface Patient {
  id: string;
  name: string;
  email: string;
  phone: string;
  start_date: string;
  end_date: string;
}

export const patientService = {
  async getPatients() {
    // Tenta pegar o ID demo
    const match = document.cookie.match(/next-auth\.role=([^;]+)/);
    if (match) {
      // Retorna mocks no modo demo
      return {
        data: [
          { id: "1", name: "João Silva", email: "joao@email.com", phone: "1199999999", start_date: "2026-01-01", end_date: "2026-06-01" },
          { id: "2", name: "Maria Souza", email: "maria@email.com", phone: "1188888888", start_date: "2026-02-01", end_date: "2026-08-01" },
        ],
        error: null,
      };
    }

    const supabase = createClient();
    const { data, error } = await supabase.from("patients").select("*").order("name");
    return { data, error };
  },

  async createPatient(patientData: Omit<Patient, "id">) {
    const supabase = createClient();
    
    // Pega o ID do dentista logado
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
        // Se for modo demo, finja que deu certo
        const match = document.cookie.match(/next-auth\.demo-session=([^;]+)/);
        if (match) return { data: { id: "mock-new-id", ...patientData }, error: null };
        return { data: null, error: new Error("Usuário não autenticado") };
    }

    const { data, error } = await supabase
      .from("patients")
      .insert([{ ...patientData, dentist_id: userData.user.id }])
      .select()
      .single();

    return { data, error };
  }
};
