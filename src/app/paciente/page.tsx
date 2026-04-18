"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { LogOut, Calendar, Bell, FileText, Send, Camera, AlertTriangle, Pause, Play, Clock } from "lucide-react";
import { authService } from "@/services/authService";
import { eventService, CalendarEvent } from "@/services/eventService";
import { pushService } from "@/services/pushService";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";

export default function DashboardPaciente() {
  const router = useRouter();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [activeTab, setActiveTab] = useState<"calendar" | "history" | "forms" | "gallery">("calendar");
  const [pushStatus, setPushStatus] = useState<string>("Solicitar Permissão");

  // Premium Features State
  const [isPaused, setIsPaused] = useState(false);
  const [hoursUsed, setHoursUsed] = useState(14);
  const [sosActive, setSosActive] = useState(false);
  const [photos, setPhotos] = useState<{id: string, aligner: number, url: string}[]>([
     { id: "1", aligner: 1, url: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop" },
     { id: "2", aligner: 2, url: "https://images.unsplash.com/photo-1544717304-a2ea0e43cebf?w=200&h=200&fit=crop" }
  ]);

  // Mocks For History and Forms
  const [history] = useState([{id: "1", title: "Lembrete!", message: "Sua próxima troca é amanhã.", date: "Hoje, 10:00"}]);
  const [pendingForm, setPendingForm] = useState(true);
  const [formAns, setFormAns] = useState("");

  useEffect(() => {
    eventService.getEventsByPatient("mock-id").then((res) => {
      if (res.data) setEvents(res.data);
    });
    if ('Notification' in window && Notification.permission === 'granted') setPushStatus("Notificações Ativas");
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
           await pushService.subscribe("mock-id");
           setPushStatus("Notificações Ativas");
        }
     }
  };

  const submitForm = () => { if(formAns) { setPendingForm(false); alert("Enviado!"); } };

  const triggerSOS = () => {
     setSosActive(true);
     alert("Alerta SOS enviado diretamente para o celular do dentista!");
     setTimeout(() => setSosActive(false), 3000);
  };

  const handlePhotoUpload = () => {
     alert("Câmera ou Galeria aberta! (Simulado). \nIsto enviaria a imagem para o Supabase Storage 'smile-photos'.");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="bg-surface border-b border-border p-6 sticky top-0 z-20 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-text-primary">Meu Tratamento</h1>
            <p className="text-sm text-text-secondary">Acompanhamento e alertas</p>
          </div>
          <div className="flex gap-2">
             <Button variant="ghost" size="sm" onClick={triggerSOS} className="bg-red-50 text-red-600 hover:bg-red-100 border border-red-200">
                <AlertTriangle size={18} className="mr-1"/> SOS
             </Button>
             <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-text-secondary">
                <LogOut size={18} />
             </Button>
          </div>
       </header>

      {/* Tabs Menu */}
      <div className="flex overflow-x-auto border-b border-border bg-surface px-6 sticky top-[88px] z-10 scrollbar-hide">
        <button onClick={() => setActiveTab("calendar")} className={`px-4 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === "calendar" ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
          <div className="flex items-center gap-2"><Calendar size={16}/> Cronograma</div>
        </button>
        <button onClick={() => setActiveTab("gallery")} className={`px-4 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === "gallery" ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
          <div className="flex items-center gap-2"><Camera size={16}/> Galeria Vip</div>
        </button>
        <button onClick={() => setActiveTab("history")} className={`px-4 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === "history" ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
          <div className="flex items-center gap-2"><Bell size={16}/> Avisos</div>
        </button>
        <button onClick={() => setActiveTab("forms")} className={`px-4 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === "forms" ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
          <div className="flex items-center gap-2"><FileText size={16}/> Relatos</div>
        </button>
      </div>

       <main className="flex-1 p-6 pb-24 w-full max-w-2xl mx-auto space-y-6">
          {activeTab === "calendar" && (
            <div className="space-y-6">
              
              {/* Premium Timer Widget */}
              <Card className="border-primary/30 shadow-lg overflow-hidden relative bg-gradient-to-br from-surface to-primary/5">
                 <CardContent className="p-6 flex flex-col items-center">
                    <h3 className="font-bold text-text-primary mb-1">Cronômetro Diário</h3>
                    <p className="text-sm text-text-secondary mb-6">Meta: 22h de uso</p>
                    
                    <div className="relative w-36 h-36 flex items-center justify-center mb-6">
                       <svg className="absolute w-full h-full transform -rotate-90">
                          <circle cx="72" cy="72" r="66" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-border" />
                          <circle cx="72" cy="72" r="66" fill="transparent" stroke="currentColor" strokeWidth="8" className="text-primary transition-all duration-1000 ease-in-out" strokeDasharray="414" strokeDashoffset={414 - (414 * (hoursUsed / 22))} strokeLinecap="round" />
                       </svg>
                       <div className="text-center">
                          <span className="text-3xl font-black text-text-primary block">{hoursUsed}h</span>
                          <span className="text-xs font-bold uppercase tracking-wider text-primary">{isPaused ? "Pausado" : "Usando"}</span>
                       </div>
                    </div>

                    <Button 
                       onClick={() => setIsPaused(!isPaused)} 
                       variant={isPaused ? "default" : "outline"}
                       className={`w-full py-6 rounded-2xl text-lg font-bold gap-2 ${isPaused ? "animate-pulse shadow-primary/30" : ""}`}
                    >
                       {isPaused ? <><Play size={20}/> Retomar Uso (Limpei os dentes)</> : <><Pause size={20}/> Pausar (Vou comer)</>}
                    </Button>
                 </CardContent>
              </Card>

              <h2 className="text-lg font-bold text-text-primary mb-4 pt-4 border-t border-border mt-4">Próximos Passos</h2>
              
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

          {activeTab === "gallery" && (
             <div className="space-y-6">
                <div className="bg-primary hover:bg-primary/90 text-white p-6 rounded-2xl text-center cursor-pointer transition-transform active:scale-95 shadow-xl" onClick={handlePhotoUpload}>
                   <Camera size={40} className="mx-auto mb-3 opacity-90" />
                   <h3 className="font-bold text-lg">Registrar Sorriso</h3>
                   <p className="text-sm text-white/80 mt-1">Tire foto do novo alinhador!</p>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4">
                   {photos.map(p => (
                      <div key={p.id} className="relative aspect-square rounded-xl overflow-hidden shadow-sm border border-border group">
                         <img src={p.url} alt="Sorriso" className="w-full h-full object-cover" />
                         <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-8">
                            <span className="text-white font-bold text-sm">Placa {p.aligner}</span>
                         </div>
                      </div>
                   ))}
                </div>
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
                         <Button onClick={submitForm} className="w-full gap-2"><Send size={16}/> Enviar Resposta</Button>
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

