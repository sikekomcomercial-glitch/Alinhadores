"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { patientService } from "@/services/patientService";
import { useState } from "react";

const patientSchema = z.object({
  name: z.string().min(3, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  start_date: z.string().min(1, "Data de início obrigatória"),
  end_date: z.string().min(1, "Previsão de término obrigatória"),
});

type PatientFormData = z.infer<typeof patientSchema>;

export default function NovoPaciente() {
  const router = useRouter();
  const [error, setError] = useState("");
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
  });

  const onSubmit = async (data: PatientFormData) => {
    setError("");
    const result = await patientService.createPatient(data);
    
    if (result.error) {
      setError("Erro ao cadastrar paciente. O E-mail já existe?");
      return;
    }
    
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-surface border-b border-border p-6 sticky top-0 z-10 flex items-center gap-4 text-text-primary">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-3">
          <ArrowLeft size={20} />
        </Button>
        <h1 className="text-xl font-bold">Novo Paciente</h1>
      </header>

      <main className="p-6 max-w-lg mx-auto w-full">
        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium border border-red-100">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4 bg-surface p-6 rounded-3xl border border-border shadow-sm">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Dados Pessoais</h2>
            
            <div>
              <label className="text-sm font-medium text-text-primary block mb-1">Nome Completo</label>
              <Input placeholder="Ex: João da Silva" {...register("name")} error={errors.name?.message} />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary block mb-1">E-mail (usado para login)</label>
              <Input type="email" placeholder="joao@email.com" {...register("email")} error={errors.email?.message} />
            </div>

            <div>
              <label className="text-sm font-medium text-text-primary block mb-1">WhatsApp</label>
              <Input type="tel" placeholder="(11) 99999-9999" {...register("phone")} error={errors.phone?.message} />
            </div>
          </div>

          <div className="space-y-4 bg-surface p-6 rounded-3xl border border-border shadow-sm">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Tratamento</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">Início</label>
                <Input type="date" {...register("start_date")} error={errors.start_date?.message} />
              </div>
              <div>
                <label className="text-sm font-medium text-text-primary block mb-1">Previsão Fim</label>
                <Input type="date" {...register("end_date")} error={errors.end_date?.message} />
              </div>
            </div>

            <div>
               <label className="text-sm font-medium text-text-primary block mb-1">Criação Automática do Calendário (Protocolo)</label>
               <select {...register("protocol", { valueAsNumber: true })} className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none text-text-primary">
                  <option value={0}>Manual (Criarei as trocas 1 a 1)</option>
                  <option value={7}>Protocolo Intenso (Trocas a cada 7 dias)</option>
                  <option value={10}>Protocolo Padrão (Trocas a cada 10 dias)</option>
                  <option value={14}>Protocolo Conservador (Trocas a cada 14 dias)</option>
               </select>
               <p className="text-xs text-text-secondary mt-1">Isso vai empilhar automaticamente 20 trocas no calendário a partir da data de início.</p>
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full py-6 text-lg font-bold gap-2 shadow-lg">
            <Save size={20} />
            {isSubmitting ? "Cadastrando e Gerando..." : "Cadastrar Paciente"}
          </Button>
        </form>
      </main>
    </div>
  );
}
