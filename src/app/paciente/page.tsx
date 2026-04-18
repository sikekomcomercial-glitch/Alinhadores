"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { LogOut, Calendar, Bell, FileText, Send } from "lucide-react";
import { authService } from "@/services/authService";
import { eventService, CalendarEvent } from "@/services/eventService";
import { pushService } from "@/services/pushService";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";

export default function DashboardPaciente() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"calendar" | "history" | "forms">("calendar");
  const [pushStatus, setPushStatus] = useState<string>("Solicitar Permissão");

  // Mocks For History and Forms
  const [history] = useState([{id: "1", title: "Lembrete!", message: "Sua próxima troca é amanhã.", date: "Hoje, 10:00"}]);
  const [pendingForm, setPendingForm] = useState(true);
  const [formAns, setFormAns] = useState("");

  useEffect(() => {
    // Busca os dados (Assumindo id real ou pegando mockup do serviço local)
    eventService.getEventsByPatient("mock-id").then((res) => {
      if (res.data) setEvents(res.data);
    });

    if ('Notification' in window) {
      if (Notification.permission === 'granted') setPushStatus("Notificações Ativas");
    }
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    router.push("/");
  };

  const handleSubscribePush = async () => {
     if ('Notification' in window && Notification.permission !== 'granted') {
        const perm = await Notification.requestPermission();
        if (perm === 'granted') {
           setPushStatus("Registrando...");
           await pushService.subscribe("mock-id"); // Injeta ID do paciente autenticado
           setPushStatus("Notificações Ativas");
        }
     }
  };

  const submitForm = () => {
     if(!formAns) return;
     setPendingForm(false);
     alert("Formulário respondido simulado com sucesso!");
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
             <div className="space-y-6">
                <div className="bg-primary/5 border border-primary/20 p-4 rounded-xl flex items-center justify-between">
                   <div>
                      <h4 className="font-semibold text-text-primary">Alertas no Celular</h4>
                      <p className="text-sm text-text-secondary">Seja avisado quando trocar o alinhador.</p>
                   </div>
                   <Button size="sm" onClick={handleSubscribePush} disabled={pushStatus === "Notificações Ativas"}>
                      {pushStatus}
                   </Button>
                </div>

                <div className="space-y-3 pt-4">
                   <h3 className="font-bold text-text-primary">Seus avisos antigos</h3>
                   {history.map(item => (
                      <div key={item.id} className="p-4 bg-surface rounded-xl border border-border">
                         <div className="flex justify-between items-start mb-2">
                             <h4 className="font-semibold text-text-primary">{item.title}</h4>
                             <span className="text-xs text-text-secondary">{item.date}</span>
                         </div>
                         <p className="text-sm text-text-secondary">{item.message}</p>
                      </div>
                   ))}
                </div>
             </div>
          )}

          {activeTab === "forms" && (
             <div className="space-y-4">
                {pendingForm ? (
                   <div className="bg-surface border border-border p-5 rounded-2xl">
                      <h3 className="font-bold text-text-primary text-lg mb-2">Relato Semanal</h3>
                      <p className="text-sm text-text-secondary mb-4">Seu dentista solicitou um feedback do uso.</p>
                      
                      <div className="space-y-4">
                         <div>
                            <label className="text-sm font-medium text-text-primary block mb-2">Quantas horas por dia usou nesta semana?</label>
                            <Input placeholder="Ex: 22 horas..." value={formAns} onChange={(e) => setFormAns(e.target.value)} />
                         </div>
                         <Button onClick={submitForm} className="w-full gap-2">
                            <Send size={16}/> Enviar Resposta
                         </Button>
                      </div>
                   </div>
                ) : (
                   <div className="text-center py-20 space-y-2">
                      <FileText size={32} className="mx-auto text-border" />
                      <p className="text-text-secondary font-medium">Todos os formulários respondidos!</p>
                   </div>
                )}
             </div>
          )}
       </main>
    </div>
  );
}

