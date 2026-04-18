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
          { id: "paciente-demo-id", name: "Paciente Demo (Conta de Teste)", email: "paciente@demo.com", phone: "1100000000", start_date: "2026-04-18", end_date: "2026-12-31" },
        ],
        error: null,
      };
    }

    const supabase = createClient();
    const { data, error } = await supabase.from("patients").select("*").order("name");
    return { data, error };
  },

  async createPatient(patientData: Omit<Patient, "id"> & { protocol?: number }) {
    const supabase = createClient();
    const cleanData = { ...patientData };
    const protocolDays = cleanData.protocol;
    delete cleanData.protocol;
    
    // Pega o ID do dentista logado
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
        // Modo Demo Simulation
        const match = document.cookie.match(/next-auth\.demo-session=([^;]+)/);
        if (match) {
            console.log(`[Demo] Paciente salvo. Protocolo de ${protocolDays || 0} dias acionado: 20 Eventos simulados.`);
            return { data: { id: "mock-new-id", ...cleanData }, error: null };
        }
        return { data: null, error: new Error("Usuário não autenticado") };
    }

    // Insere Real no DB
    const { data, error } = await supabase
      .from("patients")
      .insert([{ ...cleanData, dentist_id: userData.user.id }])
      .select()
      .single();

    // Lógica Automática de Eventos Baseado no Protocolo selecionado
    if (data && protocolDays && protocolDays > 0) {
        const eventsToInsert = [];
        let currDate = new Date(data.start_date || new Date().toISOString().split('T')[0]);
        // Gera 20 placas
        for(let i = 1; i <= 20; i++) {
           eventsToInsert.push({
               patient_id: data.id,
               type: "aligner_change",
               title: `Placa ${i}`,
               date: currDate.toISOString().split('T')[0]
           });
           currDate.setDate(currDate.getDate() + protocolDays);
        }
        await supabase.from("events").insert(eventsToInsert);
    }

    return { data, error };
  }
};
