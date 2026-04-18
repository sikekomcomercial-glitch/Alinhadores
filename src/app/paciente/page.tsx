"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { LogOut, Calendar, Bell, FileText } from "lucide-react";
import { authService } from "@/services/authService";
import { eventService, CalendarEvent } from "@/services/eventService";
import { useRouter } from "next/navigation";

export default function DashboardPaciente() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"calendar" | "history" | "forms">("calendar");

  useEffect(() => {
    // Busca os dados (Assumindo id real ou pegando mockup do serviço local)
    eventService.getEventsByPatient("mock-id").then((res) => {
      if (res.data) setEvents(res.data);
    });
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="bg-surface border-b border-border p-6 sticky top-0 z-10 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Meu Tratamento</h1>
            <p className="text-sm text-text-secondary">Acompanhamento e alertas</p>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-text-secondary">
             <LogOut size={18} />
          </Button>
       </header>

      {/* Tabs Menu */}
      <div className="flex overflow-x-auto border-b border-border bg-surface px-6 sticky top-[88px] z-10">
        <button onClick={() => setActiveTab("calendar")} className={`px-4 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === "calendar" ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
          <div className="flex items-center gap-2"><Calendar size={16}/> Meu Calendário</div>
        </button>
        <button onClick={() => setActiveTab("history")} className={`px-4 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === "history" ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
          <div className="flex items-center gap-2"><Bell size={16}/> Avisos e Push</div>
        </button>
        <button onClick={() => setActiveTab("forms")} className={`px-4 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === "forms" ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
          <div className="flex items-center gap-2"><FileText size={16}/> Formulários</div>
        </button>
      </div>

       <main className="flex-1 p-6 pb-24 w-full max-w-2xl mx-auto space-y-6">
          {activeTab === "calendar" && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-text-primary mb-4">Próximos Passos</h2>
              
              {events.length === 0 && <p className="text-center text-text-secondary pt-10">Você não tem nada agendado.</p>}
              
              {events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((evt, idx) => (
                 <div key={evt.id} className="relative flex gap-4 pb-6">
                    <div className="flex flex-col items-center">
                       <div className={`w-4 h-4 rounded-full border-4 z-10 ${idx === 0 ? "border-primary bg-background" : "border-border bg-background"}`} />
                       {idx !== events.length - 1 && <div className="w-0.5 h-full bg-border absolute top-4" />}
                    </div>
                    
                    <div className={`flex-1 bg-surface p-4 rounded-2xl border ${idx === 0 ? "border-primary/40 shadow-sm" : "border-border"} transition-colors`}>
                       <span className="text-xs font-bold text-primary uppercase tracking-wider mb-1 block">
                          {evt.type === 'aligner_change' ? "Trocar Alinhador" : "Ir ao Consultório"}
                       </span>
                       <h3 className="font-semibold text-text-primary mb-2">{evt.title}</h3>
                       <div className="inline-block text-text-secondary font-medium bg-background px-3 py-1 rounded-lg border border-border text-sm">
                          Data: {new Date(evt.date + "T12:00:00").toLocaleDateString('pt-BR')}
                       </div>
                    </div>
                 </div>
              ))}
            </div>
          )}

          {activeTab === "history" && (
             <div className="text-center py-20 space-y-2">
                <Bell size={32} className="mx-auto text-border" />
                <p className="text-text-secondary font-medium">Nenhum aviso recebido ainda.</p>
             </div>
          )}

          {activeTab === "forms" && (
             <div className="text-center py-20 space-y-2">
                <FileText size={32} className="mx-auto text-border" />
                <p className="text-text-secondary font-medium">Não há formulários pendentes.</p>
             </div>
          )}
       </main>
    </div>
  );
}

