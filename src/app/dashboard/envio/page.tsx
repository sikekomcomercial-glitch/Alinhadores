"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Send, CheckSquare, Square } from "lucide-react";
import { useRouter } from "next/navigation";
import { patientService, Patient } from "@/services/patientService";
import { templateService, NotificationTemplate, FormTemplate } from "@/services/templateService";
import { Card, CardContent } from "@/components/ui/Card";

export default function EnviosEmMassa() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatients, setSelectedPatients] = useState<Set<string>>(new Set());
  
  const [type, setType] = useState<"notification" | "form">("notification");
  const [notifTemplates, setNotifTemplates] = useState<NotificationTemplate[]>([]);
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    patientService.getPatients().then(res => { if(res.data) setPatients(res.data); });
    Promise.all([templateService.getPushTemplates(), templateService.getFormTemplates()]).then(([nRes, fRes]) => {
      setNotifTemplates(nRes.data);
      setFormTemplates(fRes.data);
    });
  }, []);

  const togglePatient = (id: string) => {
    const next = new Set(selectedPatients);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedPatients(next);
  };
  
  const toggleAll = () => {
    if (selectedPatients.size === patients.length) setSelectedPatients(new Set());
    else setSelectedPatients(new Set(patients.map(p => p.id)));
  };

  const handleSend = async () => {
     if (selectedPatients.size === 0 || !selectedTemplateId) return;
     setSending(true);
     await templateService.sendMassMessage(Array.from(selectedPatients), type, selectedTemplateId);
     setSending(false);
     setSuccessMsg("Disparo realizado com sucesso para os pacientes selecionados!");
     setTimeout(() => setSuccessMsg(""), 3000);
     setSelectedPatients(new Set());
     setSelectedTemplateId("");
  };

  const activeTemplates = type === "notification" ? notifTemplates : formTemplates;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-surface border-b border-border p-6 sticky top-0 z-10 flex items-center gap-4 text-text-primary">
         <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-3">
            <ArrowLeft size={20} />
         </Button>
         <div>
            <h1 className="text-xl font-bold">Disparo em Massa</h1>
            <p className="text-sm text-text-secondary">Selecione e envie para grupos</p>
         </div>
      </header>

      <main className="flex-1 p-6 max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Lado Esquerdo: Pacientes */}
         <div className="space-y-4">
            <div className="flex items-center justify-between">
               <h2 className="text-lg font-bold text-text-primary">1. Selecione os Destinatários</h2>
               <Button variant="ghost" size="sm" onClick={toggleAll} className="text-primary text-xs h-8">
                  {selectedPatients.size === patients.length ? "Desmarcar Todos" : "Marcar Todos"}
               </Button>
            </div>
            
            <div className="bg-surface border border-border rounded-xl max-h-[60vh] overflow-y-auto p-2">
               {patients.length === 0 && <p className="p-4 text-center text-text-secondary text-sm">Nenhum paciente cadastrado.</p>}
               {patients.map(p => (
                  <div key={p.id} onClick={() => togglePatient(p.id)} className="flex items-center gap-3 p-3 hover:bg-background rounded-lg cursor-pointer transition-colors">
                     {selectedPatients.has(p.id) ? <CheckSquare className="text-primary" size={20}/> : <Square className="text-border" size={20}/>}
                     <div>
                        <p className="font-medium text-text-primary text-sm">{p.name}</p>
                        <p className="text-xs text-text-secondary">{p.start_date ? `Iniciou em ${p.start_date}` : "Data de início não definida"}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>

         {/* Lado Direito: Seleção do Modelo */}
         <div className="space-y-6">
            <div>
               <h2 className="text-lg font-bold text-text-primary mb-4">2. O que enviar?</h2>
               <div className="flex gap-2">
                  <Button variant={type === "notification" ? "default" : "outline"} onClick={() => { setType("notification"); setSelectedTemplateId(""); }} className="flex-1">Notificação</Button>
                  <Button variant={type === "form" ? "default" : "outline"} onClick={() => { setType("form"); setSelectedTemplateId(""); }} className="flex-1">Formulário</Button>
               </div>
            </div>

            {activeTemplates.length > 0 && (
               <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">Selecione o Modelo</h3>
                  {activeTemplates.map((tpl: any) => (
                     <Card 
                        key={tpl.id} 
                        onClick={() => setSelectedTemplateId(tpl.id)}
                        className={`cursor-pointer transition-all border-2 ${selectedTemplateId === tpl.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"}`}
                     >
                        <CardContent className="p-4">
                           <h4 className="font-semibold text-text-primary">{tpl.title}</h4>
                           <p className="text-sm text-text-secondary mt-1">{tpl.message || `${tpl.questions?.length} perguntas`}</p>
                        </CardContent>
                     </Card>
                  ))}
               </div>
            )}
            {activeTemplates.length === 0 && <p className="text-sm text-text-secondary italic">Você precisa criar modelos antes de enviar.</p>}

            {/* Ação de Envio */}
            <div className="pt-4 mt-6 border-t border-border">
               {successMsg && <p className="text-sm text-green-600 bg-green-50 p-3 rounded-lg mb-4 text-center font-medium border border-green-200">{successMsg}</p>}
               
               <Button 
                  disabled={selectedPatients.size === 0 || !selectedTemplateId || sending} 
                  className="w-full py-6 text-lg font-bold gap-2 shadow-lg" 
                  onClick={handleSend}
               >
                  <Send size={20} />
                  {sending ? "Disparando..." : `Enviar para ${selectedPatients.size} paciente(s)`}
               </Button>
               <p className="text-xs text-center text-text-secondary mt-3">A ação enviará um push para os selecionados (Modo Demo imita funcionamento real).</p>
            </div>
         </div>
      </main>
    </div>
  );
}
