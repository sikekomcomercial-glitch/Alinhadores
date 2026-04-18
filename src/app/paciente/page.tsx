"use client";

import { Button } from "@/components/ui/Button";
import { LogOut } from "lucide-react";
import { authService } from "@/services/authService";
import { useRouter } from "next/navigation";

export default function DashboardPaciente() {
  const router = useRouter();

  const handleSignOut = async () => {
    await authService.signOut();
    router.push("/");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
       <header className="bg-surface border-b border-border p-6 sticky top-0 z-10 flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary">Meu Tratamento</h1>
          <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-text-secondary">
             <LogOut size={18} />
          </Button>
       </header>

       <div className="p-8 pb-20 sm:p-20 flex-1">
          <p className="text-text-secondary">Bem-vindo! Aqui você poderá ver seu calendário de alinhadores e responder formulários.</p>
       </div>
    </div>
  );
}

