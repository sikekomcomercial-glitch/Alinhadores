"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { UserPlus, Search, Calendar, ChevronRight, LogOut, Bell, FileText } from "lucide-react";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import { patientService, Patient } from "@/services/patientService";

export default function DashboardDentista() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);

  useEffect(() => {
    patientService.getPatients().then((res) => {
       if (res.data) setPatients(res.data);
    });
  }, []);

  const handleSignOut = async () => {
    await authService.signOut();
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header Premium Mobile-First */}
      <header className="bg-surface border-b border-border p-6 sticky top-0 z-10 flex flex-col gap-4 sm:flex-row sm:items-center justify-between">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-text-secondary">
             <LogOut size={18} />
           </Button>
           <div>
             <h1 className="text-xl font-bold text-text-primary">Dra. Ana</h1>
             <p className="text-sm text-text-secondary">Dashboard White-Label</p>
           </div>
        </div>
        
        <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0">
          <Link href="/dashboard/envio">
             <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap">
               <Bell size={16} /> <span className="hidden md:inline">Disparos</span>
             </Button>
          </Link>
          <Link href="/dashboard/modelos">
             <Button variant="outline" size="sm" className="gap-2 whitespace-nowrap">
               <FileText size={16} /> <span className="hidden md:inline">Modelos</span>
             </Button>
          </Link>
          <Link href="/dashboard/novo">
             <Button size="sm" className="gap-2 whitespace-nowrap">
               <UserPlus size={16} /> <span className="hidden sm:inline">Novo Paciente</span>
             </Button>
          </Link>
        </div>
      </header>

      {/* Busca */}
      <div className="p-6 pb-2">
        <div className="relative">
          <input
            type="text"
            placeholder="Buscar paciente..."
            className="w-full bg-surface border border-border pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary" size={18} />
        </div>
      </div>

      {/* Lista de Pacientes (Cards) */}
      <div className="p-6 space-y-4 flex-1">
        {patients.length === 0 && (
           <p className="text-center text-text-secondary mt-10">Nenhum paciente cadastrado.</p>
        )}
        {patients.map((patient) => (
          <Link href={`/dashboard/paciente/${patient.id}`} key={patient.id} className="block group">
            <Card className="hover:border-primary/40 transition-colors cursor-pointer">
              <CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-primary font-bold text-lg">
                    {patient.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-text-primary">{patient.name}</h3>
                    <div className="flex items-center gap-1.5 text-sm text-text-secondary mt-0.5">
                      <Calendar size={14} />
                      <span>Início: {patient.start_date || "Não definido"}</span>
                    </div>
                  </div>
                </div>
                <ChevronRight className="text-text-secondary group-hover:text-primary transition-colors" size={20} />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

