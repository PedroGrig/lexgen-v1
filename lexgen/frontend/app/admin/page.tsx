"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getCategories, deleteCategory } from "@/lib/api";
import Navbar from "@/components/Navbar";
import CategoryCard from "@/components/CategoryCard";
import ConfirmModal from "@/components/ConfirmModal";

interface Category {
    slug: string;
    label: string;
    total_chunks: number;
    total_documents: number;
    last_upload: string | null;
}

export default function AdminDashboard() {
    const router = useRouter();
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [resetSlug, setResetSlug] = useState<string | null>(null);
    const [resetting, setResetting] = useState(false);

    const { user, token } = getAuth();

    useEffect(() => {
        if (!token || user?.role !== "admin") {
            router.push("/");
            return;
        }
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await getCategories();
            setCategories(data);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Erro ao carregar categorias");
        } finally {
            setLoading(false);
        }
    };

    const handleReset = async () => {
        if (!resetSlug) return;
        setResetting(true);
        try {
            await deleteCategory(resetSlug);
            setResetSlug(null);
            fetchCategories();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Erro ao resetar treinamento");
        } finally {
            setResetting(false);
        }
    };

    if (!user) return null;

    const trained = categories.filter((c) => c.total_chunks > 0);
    const untrained = categories.filter((c) => c.total_chunks === 0);

    return (
        <div className="min-h-screen bg-background">
            <Navbar username={user.username} role={user.role} />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
                        Painel Administrativo
                    </h2>
                    <p className="text-muted">
                        Gerencie o treinamento do modelo para cada categoria de documento
                    </p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="glass-card rounded-xl p-5">
                        <p className="text-muted text-sm mb-1">Total de Categorias</p>
                        <p className="text-3xl font-bold text-foreground">{categories.length}</p>
                    </div>
                    <div className="glass-card rounded-xl p-5">
                        <p className="text-muted text-sm mb-1">Categorias Treinadas</p>
                        <p className="text-3xl font-bold text-success">{trained.length}</p>
                    </div>
                    <div className="glass-card rounded-xl p-5">
                        <p className="text-muted text-sm mb-1">Sem Dados</p>
                        <p className="text-3xl font-bold text-warning">{untrained.length}</p>
                    </div>
                </div>

                {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className="h-40 loading-shimmer rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categories.map((cat) => (
                            <CategoryCard
                                key={cat.slug}
                                slug={cat.slug}
                                totalChunks={cat.total_chunks}
                                totalDocuments={cat.total_documents}
                                lastUpload={cat.last_upload}
                                onClick={() =>
                                    router.push(`/admin/upload?type=${cat.slug}`)
                                }
                                onReset={() => setResetSlug(cat.slug)}
                            />
                        ))}
                    </div>
                )}
            </main>

            {/* Reset Modal */}
            <ConfirmModal
                isOpen={!!resetSlug}
                title="Resetar Treinamento"
                message={`Tem certeza que deseja apagar todos os dados de treinamento desta categoria? Esta ação não pode ser desfeita.`}
                confirmText={resetting ? "Resetando..." : "Resetar"}
                onConfirm={handleReset}
                onCancel={() => setResetSlug(null)}
                destructive
            />
        </div>
    );
}
