"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { patientService, Patient } from "@/services/patientService";
import { eventService, CalendarEvent } from "@/services/eventService";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, User as UserIcon, Calendar, Bell, FileText, Plus, Trash2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function PacienteDetalhes() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"calendar" | "history" | "forms">("calendar");

  // Load patient data
  useEffect(() => {
    patientService.getPatients().then((res) => {
      const match = res.data?.find((p) => p.id === id);
      if (match) setPatient(match);
      else setPatient({ id: id as string, name: "Paciente Teste", email: "teste@teste.com", phone: "119999", start_date: "2026-01-01", end_date: "" });
    });

    eventService.getEventsByPatient(id as string).then((res) => {
      if (res.data) setEvents(res.data);
    });
  }, [id]);

  const handleAddEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEvt = {
       patient_id: id as string,
       title: formData.get("title") as string,
       type: formData.get("type") as "aligner_change" | "consultation" | "custom",
       date: formData.get("date") as string,
       time: (formData.get("time") as string) || undefined,
    };
    const res = await eventService.createEvent(newEvt);
    if (res.data) setEvents((prev) => [...prev, res.data as CalendarEvent]);
    e.currentTarget.reset();
  };

  const handleDeleteEvent = async (evtId: string) => {
    await eventService.deleteEvent(evtId);
    setEvents((prev) => prev.filter((e) => e.id !== evtId));
  };

  if (!patient) return <div className="p-8 text-center text-text-secondary">Carregando...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-surface border-b border-border p-6 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-3">
             <ArrowLeft size={20} />
           </Button>
           <div>
             <h1 className="text-xl font-bold text-text-primary">{patient.name}</h1>
             <p className="text-sm text-text-secondary">Próxima etapa: {events[0]?.date || "Sem eventos"}</p>
           </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-border bg-surface px-6">
        <button onClick={() => setActiveTab("calendar")} className={`px-4 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === "calendar" ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
          <div className="flex items-center gap-2"><Calendar size={16}/> Calendário</div>
        </button>
        <button onClick={() => setActiveTab("history")} className={`px-4 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === "history" ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
          <div className="flex items-center gap-2"><Bell size={16}/> Push Enviados</div>
        </button>
        <button onClick={() => setActiveTab("forms")} className={`px-4 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === "forms" ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
          <div className="flex items-center gap-2"><FileText size={16}/> Formulários</div>
        </button>
      </div>

      <main className="p-6 pb-24 flex-1 max-w-3xl mx-auto w-full">
        {activeTab === "calendar" && (
          <div className="space-y-8">
            <Card>
               <CardHeader><CardTitle>Informações do Paciente</CardTitle></CardHeader>
               <CardContent className="grid grid-cols-2 gap-4 text-sm">
                  <div><span className="text-text-secondary block">Telefone:</span>{patient.phone}</div>
                  <div><span className="text-text-secondary block">Email:</span>{patient.email}</div>
                  <div><span className="text-text-secondary block">Início:</span>{patient.start_date}</div>
               </CardContent>
            </Card>

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                 <h2 className="text-lg font-bold text-text-primary">Cronograma de Eventos</h2>
              </div>
              
              {/* Event Form */}
              <form onSubmit={handleAddEvent} className="bg-surface p-4 rounded-xl border border-border shadow-sm flex flex-col sm:flex-row gap-3">
                 <Input name="title" placeholder="Nome do Evento (ex: Placa 02)" required className="flex-1" />
                 <select name="type" className="bg-background border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none">
                    <option value="aligner_change">Trocar Alinhador</option>
                    <option value="consultation">Consulta</option>
                 </select>
                 <Input name="date" type="date" required className="w-full sm:w-auto" />
                 <Button type="submit" size="sm"><Plus size={16}/></Button>
              </form>

              {/* Event List */}
              <div className="space-y-3">
                {events.length === 0 && <p className="text-center text-text-secondary pt-4">Nenhum evento agendado.</p>}
                {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(evt => (
                   <div key={evt.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface p-4 rounded-xl border border-border shadow-sm gap-4">
                      <div>
                         <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">
                            {evt.type === 'aligner_change' ? "Troca de Alinhador" : "Consulta Presencial"}
                         </span>
                         <h4 className="font-semibold text-text-primary">{evt.title}</h4>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                         <div className="text-text-secondary font-medium bg-background px-3 py-1 rounded-lg border border-border text-sm">
                            {new Date(evt.date + "T12:00:00").toLocaleDateString('pt-BR')}
                         </div>
                         <Button type="button" variant="ghost" size="sm" onClick={() => handleDeleteEvent(evt.id)} className="text-red-500 hover:bg-red-50">
                            <Trash2 size={16}/>
                         </Button>
                      </div>
                   </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "history" && (
           <div className="text-center py-20 text-text-secondary border-2 border-dashed border-border rounded-2xl">
              Nenhuma notificação push enviada ainda para este paciente. (Simulado)
           </div>
        )}

        {activeTab === "forms" && (
           <div className="text-center py-20 text-text-secondary border-2 border-dashed border-border rounded-2xl">
              Nenhum formulário respondido por este paciente. (Simulado)
           </div>
        )}
      </main>
    </div>
  );
}
