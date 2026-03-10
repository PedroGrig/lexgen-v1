"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { generateText, downloadDocx } from "@/lib/api";
import { documentSchemas } from "@/lib/document-schemas";
import Navbar from "@/components/Navbar";
import DynamicForm from "@/components/DynamicForm";

function GenerateContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const documentType = searchParams.get("type") || "";

    const [loading, setLoading] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const [error, setError] = useState("");
    const [generatedText, setGeneratedText] = useState("");

    const { user, token } = getAuth();
    const schema = documentSchemas[documentType];

    useEffect(() => {
        if (!token) {
            router.push("/");
        }
    }, []);

    const handleGenerate = async (formData: Record<string, any>) => {
        setLoading(true);
        setError("");
        setGeneratedText("");

        try {
            // Gera apenas o texto primeiro para permitir edição
            const data = await generateText(documentType, formData);
            setGeneratedText(data.text);
        } catch (err: any) {
            setError(
                err.response?.data?.detail || "Erro ao gerar o documento. O LLM pode estar ocupado."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!generatedText) return;
        setDownloading(true);
        setError("");

        try {
            await downloadDocx(generatedText, documentType);
        } catch (err: any) {
            setError("Erro ao baixar o documento gerado.");
        } finally {
            setDownloading(false);
        }
    };

    if (!user || !schema) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar username={user.username} role={user.role} />

            <main className="max-w-4xl mx-auto px-6 py-8">
                <button
                    onClick={() => router.push("/dashboard")}
                    className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-6"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Voltar ao Selecionador
                </button>

                <div className="mb-8">
                    <div className="text-4xl mb-3">{schema.icon}</div>
                    <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
                        Gerar {schema.label}
                    </h2>
                    <p className="text-muted">
                        Preencha os dados abaixo. A IA usará o conhecimento do escritório para redigir o documento.
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm mb-6">
                        {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Form Column */}
                    <div className={`transition-all duration-500 ${generatedText ? 'lg:col-span-1 border-r border-border pr-8' : 'lg:col-span-2'}`}>
                        <DynamicForm
                            documentType={documentType}
                            onSubmit={handleGenerate}
                            loading={loading}
                        />
                    </div>

                    {/* Preview Column */}
                    {generatedText && (
                        <div className="lg:col-span-1 flex flex-col h-full animate-fade-in">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-serif text-xl font-bold text-accent">
                                    Documento Gerado
                                </h3>
                                <span className="text-xs text-muted-foreground bg-card px-2 py-1 rounded">
                                    Editável
                                </span>
                            </div>

                            <textarea
                                value={generatedText}
                                onChange={(e) => setGeneratedText(e.target.value)}
                                className="flex-grow w-full px-4 py-4 bg-card border border-border rounded-lg text-foreground font-sans text-sm tracking-wide leading-relaxed focus:border-accent focus:ring-1 focus:ring-accent resize-none min-h-[500px]"
                                spellCheck={false}
                            />

                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="w-full mt-4 py-3 bg-white text-black hover:bg-gray-200 font-semibold rounded-lg transition-all shadow-card hover:shadow-glow flex items-center justify-center gap-2"
                            >
                                {downloading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        <span>Preparando DOCX...</span>
                                    </>
                                ) : (
                                    <>
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                                            <polyline points="7 10 12 15 17 10" />
                                            <line x1="12" y1="15" x2="12" y2="3" />
                                        </svg>
                                        <span>Baixar Documento .docx</span>
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default function GeneratePage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <GenerateContent />
        </Suspense>
    );
}
