import { createClient } from "./supabaseBrowser";

export interface CalendarEvent {
  id: string;
  patient_id: string;
  type: "aligner_change" | "consultation" | "custom" | string;
  title: string;
  date: string;
  time?: string;
}

export const eventService = {
  async getEventsByPatient(patientId: string) {
    const match = document.cookie.match(/next-auth\.role=([^;]+)/);
    if (match) {
      return {
        data: [
          { id: "e1", patient_id: patientId, type: "aligner_change" as const, title: "Troca de Alinhador 1", date: "2026-01-15" },
          { id: "e2", patient_id: patientId, type: "consultation" as const, title: "Consulta de Retorno", date: "2026-02-15", time: "14:00" },
        ],
        error: null,
      };
    }

    const supabase = createClient();
    const { data, error } = await supabase.from("events").select("*").eq("patient_id", patientId).order("date");
    return { data, error };
  },

  async createEvent(eventData: Omit<CalendarEvent, "id">) {
    const match = document.cookie.match(/next-auth\.demo-session=([^;]+)/);
    if (match) return { data: { id: `mock-evt-${Date.now()}`, ...eventData }, error: null };

    const supabase = createClient();
    const { data, error } = await supabase.from("events").insert([eventData]).select().single();
    return { data, error };
  },

  async deleteEvent(eventId: string) {
    const match = document.cookie.match(/next-auth\.demo-session=([^;]+)/);
    if (match) return { error: null };

    const supabase = createClient();
    const { error } = await supabase.from("events").delete().eq("id", eventId);
    return { error };
  }
};
