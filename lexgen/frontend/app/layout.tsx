import type { Metadata } from "next";
import { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
    title: "LexGen — Geração Inteligente de Documentos Jurídicos",
    description:
        "Plataforma de geração inteligente de documentos jurídicos trabalhistas baseada em IA",
};

export default function RootLayout({
    children,
}: {
    children: ReactNode;
}) {
    return (
        <html lang="pt-BR">
            <body className="min-h-screen bg-background text-foreground font-sans antialiased">
                {children}
            </body>
        </html>
    );
}