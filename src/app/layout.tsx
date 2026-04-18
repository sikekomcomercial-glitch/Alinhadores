import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Acompanhamento de Alinhadores",
  description: "Plataforma premium para acompanhamento de pacientes com alinhadores invisíveis.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#A8C5DA",
};

import { ThemeProvider } from "@/components/ThemeProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} antialiased h-full`}>
      <body className="min-h-full flex flex-col bg-background text-text-primary">
         <ThemeProvider>
            {children}
         </ThemeProvider>
      </body>
    </html>
  );
}
