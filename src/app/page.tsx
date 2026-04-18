import { ArrowRight, User, ShieldCheck } from "lucide-react";

export default function Home() {
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
            Entre na sua conta para acompanhar seu tratamento com alinhadores.
          </p>
        </div>

        <div className="bg-surface p-6 sm:p-8 rounded-3xl shadow-xl shadow-primary/5 border border-border">
          <form className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary" htmlFor="email">
                E-mail ou Usuário
              </label>
              <div className="relative">
                <input
                  id="email"
                  type="email"
                  placeholder="Seu email cadastrado"
                  className="w-full pl-11 pr-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition duration-200"
                />
                <User
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary"
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
              <input
                id="password"
                type="password"
                placeholder="********"
                className="w-full px-4 py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition duration-200"
              />
            </div>

            <button
              type="button"
              className="w-full mt-2 bg-text-primary text-white font-medium py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-all active:scale-[0.98] group"
            >
              Entrar na conta
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-text-secondary mt-8">
          Pacientes recebem o acesso diretamente com o dentista responsável.
        </p>
      </main>
    </div>
  );
}
