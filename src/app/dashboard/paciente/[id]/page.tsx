"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { patientService, Patient } from "@/services/patientService";
import { eventService, CalendarEvent } from "@/services/eventService";
import { templateService } from "@/services/templateService";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, User as UserIcon, Calendar as CalendarIcon, Bell, FileText, Plus, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";

export default function PacienteDetalhes() {
  const { id } = useParams();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [templates, setTemplates] = useState<{id: string, title: string, type: string}[]>([]);
  const [activeTab, setActiveTab] = useState<"calendar" | "history" | "forms">("calendar");

  // Interactive Calendar Stating
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>("");
  const formRef = useRef<HTMLFormElement>(null);

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

    Promise.all([templateService.getPushTemplates(), templateService.getFormTemplates()]).then(([pRes, fRes]) => {
      const merged = [
         ...(pRes.data || []).map(t => ({ id: "push_" + t.id, title: `Push: ${t.title}`, type: "notification" })),
         ...(fRes.data || []).map(t => ({ id: "form_" + t.id, title: `Form: ${t.title}`, type: "form" }))
      ];
      setTemplates(merged);
    });
  }, [id]);

  const handleDaySelect = (dayDateStr: string) => {
     setSelectedDateStr(dayDateStr);
     if (formRef.current) {
        const inputDate = formRef.current.querySelector('input[name="date"]') as HTMLInputElement;
        if (inputDate) inputDate.value = dayDateStr;
        formRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
     }
  };

  // Bidirectional link: Sync Calendar view to typed date
  useEffect(() => {
     if (selectedDateStr) {
        const [y, m] = selectedDateStr.split('-');
        if (y && m) {
           const newDate = new Date(parseInt(y), parseInt(m) - 1, 1);
           if (newDate.getMonth() !== currentDate.getMonth() || newDate.getFullYear() !== currentDate.getFullYear()) {
              setCurrentDate(newDate);
           }
        }
     }
  }, [selectedDateStr]);

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
              <h2 className="text-lg font-bold text-text-primary">Visão do Calendário</h2>
              <Card>
                 <div className="flex justify-between items-center p-4 border-b border-border bg-surface rounded-t-xl">
                    <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
                       <ChevronLeft size={20} />
                    </Button>
                    <h3 className="font-bold text-text-primary uppercase tracking-wider text-sm">
                       {currentDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                    </h3>
                    <Button variant="ghost" size="sm" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
                       <ChevronRight size={20} />
                    </Button>
                 </div>
                 
                 <div className="grid grid-cols-7 border-b border-border bg-background/50">
                    {['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'].map(day => (
                       <div key={day} className="py-2 text-center text-[10px] font-bold text-text-secondary uppercase">{day}</div>
                    ))}
                 </div>
                 <div className="grid grid-cols-7">
                    {Array(new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()).fill(null).map((_, i) => (
                       <div key={`blank-${i}`} className="min-h-[80px] border-r border-b border-border/50 bg-background/30 p-1" />
                    ))}
                    {Array.from({length: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()}).map((_, i) => {
                       const d = i + 1;
                       const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
                       const dayEvents = events.filter(e => e.date === dateStr);
                       const isSelected = selectedDateStr === dateStr;
                       
                       return (
                          <div 
                             key={d} 
                             onClick={() => handleDaySelect(dateStr)}
                             className={`min-h-[80px] border-r border-b border-border/50 p-1 flex flex-col gap-1 cursor-pointer transition-colors ${isSelected ? "ring-2 ring-primary ring-inset bg-primary/5" : "hover:bg-primary/5"}`}
                          >
                             <div className={`text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full ${isSelected ? "bg-primary text-white" : "text-text-secondary"}`}>
                                {d}
                             </div>
                             {dayEvents.map(evt => (
                                <div key={evt.id} title={evt.title} className="text-[9px] font-semibold bg-primary text-white px-1 py-0.5 rounded truncate shadow-sm">
                                   {evt.title}
                                </div>
                             ))}
                          </div>
                       )
                    })}
                 </div>
              </Card>

              {/* Event Form */}
              <div ref={formRef} className="pt-2">
                 <form onSubmit={handleAddEvent} className="bg-surface p-5 rounded-xl border border-border shadow-sm flex flex-col gap-3">
                    <h3 className="font-semibold text-text-primary text-sm mb-2">Agendar Disparo (Ação)</h3>
                    <div className="flex flex-col sm:flex-row gap-3">
                       <Input name="title" placeholder="Descreva (ex: Lembrete Placa 02)" required className="flex-1" />
                       <select name="type" className="bg-background border border-border rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:outline-none flex-1">
                          {templates.length === 0 && <option value="custom">Agendamento Manual (Sem Modelo)</option>}
                          {templates.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
                       </select>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 mt-2">
                       <div className="flex-1 flex gap-3">
                          <Input name="date" type="date" required className="w-full" onChange={(e) => setSelectedDateStr(e.target.value)} />
                          <Input name="time" type="time" defaultValue="10:00" className="w-full" />
                       </div>
                       <Button type="submit" size="md" className="w-full sm:w-auto px-8"><Plus size={18} className="mr-2"/> Agendar</Button>
                    </div>
                 </form>
              </div>

              {/* Lembretes List */}
              <div className="space-y-3 pt-4">
                <h3 className="text-sm font-semibold text-text-secondary">Próximos na Fila:</h3>
                {events.length === 0 && <p className="text-center text-text-secondary pt-2">Vazio.</p>}
                {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map(evt => (
                   <div key={evt.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-surface p-4 rounded-xl border border-border shadow-sm gap-4">
                      <div>
                         <span className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1 block">
                            {evt.type.startsWith('push_') ? "Notificação Push" : evt.type.startsWith('form_') ? "Formulário" : "Agendamento"}
                         </span>
                         <h4 className="font-semibold text-text-primary">{evt.title}</h4>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto">
                         <div className="text-text-secondary font-medium bg-background px-3 py-1 rounded-lg border border-border text-sm">
                            {new Date(evt.date + "T12:00:00").toLocaleDateString('pt-BR')} {evt.time ? `às ${evt.time}` : ""}
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
