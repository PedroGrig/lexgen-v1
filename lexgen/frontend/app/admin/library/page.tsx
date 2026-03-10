"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getLibrary, getCategories } from "@/lib/api";
import Navbar from "@/components/Navbar";

interface Document {
    filename: string;
    document_type: string;
    label: string;
    uploaded_at: string;
    chunks_count: number;
}

export default function LibraryPage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [categories, setCategories] = useState<{ slug: string, label: string }[]>([]);
    const [filter, setFilter] = useState<string>("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { user, token } = getAuth();

    useEffect(() => {
        if (!token || user?.role !== "admin") {
            router.push("/");
            return;
        }
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [cats, lib] = await Promise.all([
                getCategories(),
                getLibrary()
            ]);
            setCategories(cats.map((c: any) => ({ slug: c.slug, label: c.label })));
            setDocuments(lib.documents || []);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Erro ao carregar biblioteca");
        } finally {
            setLoading(false);
        }
    };

    const filteredDocs = filter
        ? documents.filter((d) => d.document_type === filter)
        : documents;

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar username={user.username} role={user.role} />

            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
                            Biblioteca
                        </h2>
                        <p className="text-muted">
                            Todos os documentos indexados no banco vetorial
                        </p>
                    </div>

                    <div className="md:w-72">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full px-4 py-2 bg-card border border-border rounded-lg text-foreground focus:border-accent focus:ring-1 focus:ring-accent"
                        >
                            <option value="">Todas as categorias</option>
                            {categories.map((c) => (
                                <option key={c.slug} value={c.slug}>
                                    {c.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-16 loading-shimmer rounded-lg" />
                        ))}
                    </div>
                ) : (
                    <div className="glass-card rounded-xl overflow-hidden border border-border">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-card/50 border-b border-border">
                                        <th className="py-4 px-6 font-medium text-muted-foreground text-sm">Arquivo</th>
                                        <th className="py-4 px-6 font-medium text-muted-foreground text-sm">Categoria</th>
                                        <th className="py-4 px-6 font-medium text-muted-foreground text-sm">Data de Upload</th>
                                        <th className="py-4 px-6 font-medium text-muted-foreground text-sm text-right">Chunks Vetorizados</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredDocs.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="py-8 px-6 text-center text-muted">
                                                Nenhum documento encontrado{filter ? " para esta categoria" : ""}.
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredDocs.map((doc, i) => (
                                            <tr key={i} className="hover:bg-card/30 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-lg">{doc.filename.endsWith(".pdf") ? "📕" : "📄"}</span>
                                                        <span className="text-foreground max-w-xs truncate" title={doc.filename}>
                                                            {doc.filename}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6 text-sm text-muted">
                                                    {doc.label}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-muted">
                                                    {new Date(doc.uploaded_at).toLocaleString('pt-BR')}
                                                </td>
                                                <td className="py-4 px-6 text-sm text-accent text-right font-medium">
                                                    {doc.chunks_count}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {filteredDocs.length > 0 && (
                            <div className="bg-card/50 px-6 py-4 border-t border-border flex justify-between items-center text-sm text-muted">
                                <span>Total: {filteredDocs.length} documentos listados</span>
                                <span>
                                    Total de chunks: {filteredDocs.reduce((acc, curr) => acc + curr.chunks_count, 0)}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
