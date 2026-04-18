"use client";

import { useEffect, useState } from "react";
import { settingsService } from "@/services/settingsService";
import { Palette, X, Check } from "lucide-react";

const SUGGESTED_COLORS = [
  { name: "Padrão", value: "#A8C5DA" },
  { name: "Menta", value: "#A8DAC5" },
  { name: "Rosa", value: "#DAA8C5" },
  { name: "Lavanda", value: "#C5A8DA" },
  { name: "Dourado", value: "#d4af37" },
  { name: "Dark", value: "#1A1A1A" },
];

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentColor, setCurrentColor] = useState("#A8C5DA");

  useEffect(() => {
    settingsService.getTheme().then((theme) => {
      document.documentElement.style.setProperty("--primary", theme.primary);
      setCurrentColor(theme.primary);
    });
  }, []);

  const changeColor = async (color: string) => {
     setCurrentColor(color);
     await settingsService.updateTheme(color);
  };

  return (
    <>
      {children}
      
      {/* Botão Flutuante Global */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-[9999] border-4 border-white"
        aria-label="Mudar Tema"
      >
        <Palette size={24} />
      </button>

      {/* Modal de Temas (Slide up no Mobile) */}
      {isOpen && (
        <div className="fixed inset-0 z-[10000] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-surface w-full max-w-md rounded-t-[32px] p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
              <div className="flex justify-between items-center mb-6">
                 <div>
                    <h3 className="text-xl font-bold text-text-primary">Identidade Visual</h3>
                    <p className="text-sm text-text-secondary">Escolha a cor da sua clínica</p>
                 </div>
                 <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-background rounded-full transition-colors">
                    <X size={24} className="text-text-secondary" />
                 </button>
              </div>

              <div className="grid grid-cols-3 gap-4">
                 {SUGGESTED_COLORS.map(color => (
                    <button 
                       key={color.value}
                       onClick={() => changeColor(color.value)}
                       className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${currentColor === color.value ? "border-primary bg-primary/5" : "border-transparent hover:bg-background"}`}
                    >
                       <div 
                          className="w-10 h-10 rounded-full shadow-inner relative flex items-center justify-center" 
                          style={{ backgroundColor: color.value }}
                       >
                          {currentColor === color.value && <Check size={16} className="text-white" />}
                       </div>
                       <span className="text-xs font-bold text-text-primary">{color.name}</span>
                    </button>
                 ))}
              </div>

              <div className="mt-8">
                 <button 
                    onClick={() => setIsOpen(false)}
                    className="w-full bg-primary text-white py-4 rounded-2xl font-bold shadow-lg shadow-primary/30 active:scale-[0.98] transition-all"
                 >
                    Aplicar e Fechar
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
