"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { settingsService } from "@/services/settingsService";
import { Palette, Check } from "lucide-react";
import { useRouter } from "next/navigation";

const SUGGESTED_COLORS = [
  { name: "Azul Bebê (Padrão)", value: "#A8C5DA" },
  { name: "Verde Menta", value: "#A8DAC5" },
  { name: "Rosa Pastel", value: "#DAA8C5" },
  { name: "Lavanda", value: "#C5A8DA" },
  { name: "Dourado Nobre", value: "#d4af37" },
  { name: "Preto Exclusivo", value: "#1A1A1A" },
];

export default function SettingsPage() {
  const [currentColor, setCurrentColor] = useState("#A8C5DA");
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
     settingsService.getTheme().then((theme) => {
        if(theme.primary) setCurrentColor(theme.primary);
     });
  }, []);

  const saveColor = async (color: string) => {
     setIsSaving(true);
     setCurrentColor(color);
     await settingsService.updateTheme(color);
     
     // Aguarda animação CSS
     setTimeout(() => {
        setIsSaving(false);
     }, 400);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="bg-surface border-b border-border p-6 sticky top-0 z-10 flex items-center gap-4">
        <button onClick={() => router.push("/dashboard")} className="text-text-secondary hover:text-text-primary transition-colors">
          ← Voltar
        </button>
        <div>
          <h1 className="text-xl font-bold text-text-primary">Customização White-Label</h1>
          <p className="text-sm text-text-secondary">Defina a cor e identidade da sua clínica no aplicativo do paciente.</p>
        </div>
      </header>

      <main className="flex-1 p-6 w-full max-w-lg mx-auto">
         <div className="bg-surface p-8 rounded-3xl border border-border shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-border pb-4">
               <Palette className="text-text-secondary" />
               <h2 className="text-lg font-bold">Cor Principal do App</h2>
            </div>
            
            <p className="text-sm text-text-secondary">
               Esta cor será usada imediatamente em todos os botões, links, e calendários tanto no seu dashboard quanto no celular do seu paciente.
            </p>

            <div className="grid grid-cols-2 gap-4 pt-4">
               {SUGGESTED_COLORS.map(color => (
                  <button 
                     key={color.value}
                     onClick={() => saveColor(color.value)}
                     className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${currentColor === color.value ? "border-primary shadow-md bg-primary/5 scale-[1.02]" : "border-border hover:border-text-secondary"}`}
                  >
                     {currentColor === color.value && <div className="absolute top-2 right-2 rounded-full bg-primary text-white p-1"><Check size={12}/></div>}
                     <div className="w-12 h-12 rounded-full mb-3 shadow-inner" style={{ backgroundColor: color.value }} />
                     <span className="text-sm font-medium text-text-primary text-center">{color.name}</span>
                  </button>
               ))}
            </div>

            <div className="mt-8 pt-8 border-t border-border">
               <h3 className="font-medium text-text-primary mb-3">Escolher cor Exata (Avançado)</h3>
               <div className="flex gap-4">
                  <input 
                     type="color" 
                     value={currentColor} 
                     onChange={(e) => saveColor(e.target.value)}
                     className="w-14 h-14 rounded cursor-pointer"
                  />
                  <div className="flex-1">
                     <p className="text-xs text-text-secondary mb-1">Código HEX</p>
                     <div className="font-mono text-sm uppercase bg-background px-3 py-2 rounded-md border border-border">{currentColor}</div>
                  </div>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
