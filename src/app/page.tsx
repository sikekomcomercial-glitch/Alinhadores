"use client";

import { useState } from "react";
import { ArrowRight, User, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { Input } from "@/components/ui/Input";

export default function Home() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { data, error: authError } = await authService.signInWithEmailPassword(email, password);

    if (authError || !data.user) {
      setError("Credenciais inválidas. Verifique seu e-mail e senha.");
      setLoading(false);
      return;
    }

    const role = await authService.checkUserRole(data.user.id);
    
    if (role === "dentist") {
      router.push("/dashboard");
    } else {
      router.push("/paciente");
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 sm:p-10 bg-background text-text-primary overflow-hidden relative">
      {/* Decoração de fundo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-secondary/30 blur-[120px] rounded-full pointer-events-none" />

      <main className="w-full max-w-sm z-10">
        <div className="flex flex-col items-center mb-10 space-y-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-border flex items-center justify-center text-primary mb-2">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-text-primary text-center">
            Acompanhamento Premium
          </h1>
          <p className="text-center text-text-secondary">
            Entre na sua conta para acompanhar o tratamento.
          </p>
        </div>

        <div className="bg-surface p-6 sm:p-8 rounded-3xl shadow-xl shadow-primary/5 border border-border">
          {error && (
             <div className="mb-4 text-center text-sm font-medium p-3 bg-red-50 text-red-600 rounded-lg">
                {error}
             </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary" htmlFor="email">
                E-mail ou Usuário
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Seu email cadastrado"
                  className="pl-11"
                  required
                />
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary placeholder-icon"
                  size={18}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-text-primary" htmlFor="password">
                  Senha
                </label>
                <a href="#" className="text-xs text-primary font-medium hover:underline">
                  Esqueceu a senha?
                </a>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-text-primary text-white font-medium py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] disabled:opacity-50 group"
            >
              {loading ? "Entrando..." : "Entrar na conta"}
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
