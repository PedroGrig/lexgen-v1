"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { uploadDocuments } from "@/lib/api";
import { documentSchemas } from "@/lib/document-schemas";
import Navbar from "@/components/Navbar";
import UploadZone from "@/components/UploadZone";

function UploadContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const documentType = searchParams.get("type") || "";

    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState<{
        processed: number;
        chunks_created: number;
    } | null>(null);
    const [error, setError] = useState("");

    const { user, token } = getAuth();
    const schema = documentSchemas[documentType];

    useEffect(() => {
        if (!token || user?.role !== "admin") {
            router.push("/");
        }
    }, []);

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);
        setProgress(0);
        setError("");
        setResult(null);

        try {
            const data = await uploadDocuments(files, documentType, (p) =>
                setProgress(p)
            );
            setResult(data);
            setFiles([]);
        } catch (err: any) {
            setError(
                err.response?.data?.detail || "Erro ao processar os documentos"
            );
        } finally {
            setUploading(false);
        }
    };

    if (!user || !schema) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar username={user.username} role={user.role} />

            <main className="max-w-3xl mx-auto px-6 py-8">
                {/* Back button */}
                <button
                    onClick={() => router.push("/admin")}
                    className="flex items-center gap-2 text-muted hover:text-foreground transition-colors mb-6"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Voltar ao Dashboard
                </button>

                {/* Header */}
                <div className="mb-8">
                    <div className="text-3xl mb-3">{schema.icon}</div>
                    <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
                        {schema.label}
                    </h2>
                    <p className="text-muted">
                        Carregue documentos reais do escritório para treinar o modelo nesta categoria
                    </p>
                </div>

                {/* Upload Zone */}
                <div className="glass-card rounded-xl p-8 mb-6">
                    <UploadZone onFilesSelected={setFiles} />
                </div>

                {/* Upload button */}
                {files.length > 0 && (
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="w-full py-4 bg-accent hover:bg-accent-hover text-background font-semibold rounded-lg transition-all duration-200 shadow-glow hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                    >
                        {uploading ? (
                            <>
                                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                <span>Processando... {progress}%</span>
                            </>
                        ) : (
                            <>
                                <span>📤</span>
                                <span>Processar {files.length} arquivo{files.length > 1 ? "s" : ""}</span>
                            </>
                        )}
                    </button>
                )}

                {/* Progress bar */}
                {uploading && (
                    <div className="mt-4">
                        <div className="w-full h-2 bg-card rounded-full overflow-hidden">
                            <div
                                className="h-full bg-accent transition-all duration-300 rounded-full"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Error */}
                {error && (
                    <div className="mt-6 p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                        {error}
                    </div>
                )}

                {/* Success */}
                {result && (
                    <div className="mt-6 p-6 bg-success/10 border border-success/30 rounded-xl">
                        <div className="flex items-center gap-3 mb-3">
                            <span className="text-2xl">✅</span>
                            <h3 className="font-semibold text-success text-lg">
                                Processamento concluído!
                            </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="bg-background/50 rounded-lg p-4 text-center">
                                <p className="text-3xl font-bold text-foreground">
                                    {result.processed}
                                </p>
                                <p className="text-sm text-muted">
                                    arquivo{result.processed > 1 ? "s" : ""} processado{result.processed > 1 ? "s" : ""}
                                </p>
                            </div>
                            <div className="bg-background/50 rounded-lg p-4 text-center">
                                <p className="text-3xl font-bold text-foreground">
                                    {result.chunks_created}
                                </p>
                                <p className="text-sm text-muted">chunks criados</p>
                            </div>
                        </div>
                        <button
                            onClick={() => router.push("/admin")}
                            className="mt-4 w-full py-2 text-center text-accent hover:text-accent-hover transition-colors text-sm"
                        >
                            ← Voltar ao Dashboard
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default function UploadPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-background" />}>
            <UploadContent />
        </Suspense>
    );
}
