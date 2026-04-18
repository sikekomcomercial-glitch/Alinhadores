"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowLeft, Bell, FileText, Plus, Trash2, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { templateService, NotificationTemplate, FormTemplate } from "@/services/templateService";
import { Input } from "@/components/ui/Input";
import { Card, CardContent } from "@/components/ui/Card";

export default function GestaoModelos() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"notifications" | "forms">("notifications");
  const [notifTemplates, setNotifTemplates] = useState<NotificationTemplate[]>([]);
  const [formTemplates, setFormTemplates] = useState<FormTemplate[]>([]);

  useEffect(() => {
    templateService.getPushTemplates().then(res => setNotifTemplates(res.data));
    templateService.getFormTemplates().then(res => setFormTemplates(res.data));
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-surface border-b border-border p-6 sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-3">
             <ArrowLeft size={20} />
           </Button>
           <div>
             <h1 className="text-xl font-bold text-text-primary">Padrões de Envio</h1>
             <p className="text-sm text-text-secondary">Personalize seus alertas e formulários</p>
           </div>
        </div>
        <Button size="sm" className="gap-2">
            <Plus size={16} /> <span className="hidden sm:inline">Criar Novo</span>
        </Button>
      </header>

      {/* Tabs */}
      <div className="flex overflow-x-auto border-b border-border bg-surface px-6 z-0">
        <button onClick={() => setActiveTab("notifications")} className={`px-4 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === "notifications" ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
          <div className="flex items-center gap-2"><Bell size={16}/> Notificações Push</div>
        </button>
        <button onClick={() => setActiveTab("forms")} className={`px-4 py-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${activeTab === "forms" ? "border-primary text-primary" : "border-transparent text-text-secondary hover:text-text-primary"}`}>
          <div className="flex items-center gap-2"><FileText size={16}/> Formulários</div>
        </button>
      </div>

      <main className="flex-1 p-6 max-w-3xl mx-auto w-full space-y-6">
         {activeTab === "notifications" && (
            <div className="space-y-4">
               <h2 className="text-lg font-bold text-text-primary mb-2">Pushs Memorizados</h2>
               {notifTemplates.map(tpl => (
                  <Card key={tpl.id} className="hover:border-primary/40 transition-colors group">
                     <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                           <h3 className="font-semibold text-text-primary mb-1">{tpl.title}</h3>
                           <p className="text-sm text-text-secondary line-clamp-2">"{tpl.message}"</p>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                           <Button variant="outline" size="sm"><Edit2 size={16}/></Button>
                           <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50"><Trash2 size={16}/></Button>
                        </div>
                     </CardContent>
                  </Card>
               ))}
               {notifTemplates.length === 0 && <p className="text-text-secondary text-center py-10">Você não tem modelos de Push salvos.</p>}
            </div>
         )}

         {activeTab === "forms" && (
            <div className="space-y-4">
               <h2 className="text-lg font-bold text-text-primary mb-2">Testes Memorizados</h2>
               {formTemplates.map(form => (
                  <Card key={form.id} className="hover:border-primary/40 transition-colors group">
                     <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                           <h3 className="font-semibold text-text-primary mb-1">{form.title}</h3>
                           <p className="text-sm text-text-secondary">{form.questions.length} perguntas cadastradas</p>
                        </div>
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                           <Button variant="outline" size="sm"><Edit2 size={16}/></Button>
                           <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50"><Trash2 size={16}/></Button>
                        </div>
                     </CardContent>
                  </Card>
               ))}
               {formTemplates.length === 0 && <p className="text-text-secondary text-center py-10">Nenhum formulário criado ainda.</p>}
            </div>
         )}
      </main>
    </div>
  );
}
