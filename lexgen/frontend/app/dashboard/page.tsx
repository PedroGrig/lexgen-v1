"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth } from "@/lib/auth";
import { getDocumentTypes } from "@/lib/api";
import Navbar from "@/components/Navbar";
import CategoryCard from "@/components/CategoryCard";

interface DocumentType {
    slug: string;
    label: string;
    has_training_data: boolean;
    total_chunks: number;
}

export default function UserDashboard() {
    const router = useRouter();
    const [types, setTypes] = useState<DocumentType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const { user, token } = getAuth();

    useEffect(() => {
        if (!token) {
            router.push("/");
            return;
        }
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        try {
            setLoading(true);
            const data = await getDocumentTypes();
            setTypes(data.types);
        } catch (err: any) {
            setError(err.response?.data?.detail || "Erro ao carregar tipos de documentos");
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-background">
            <Navbar username={user.username} role={user.role} />

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h2 className="font-serif text-3xl font-bold text-foreground mb-2">
                        Novo Documento
                    </h2>
                    <p className="text-muted">
                        Selecione o tipo de documento que deseja gerar. A IA irá utilizar o estilo e as fundamentações dos documentos do escritório.
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm mb-6">
                        {error}
                    </div>
                )}

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-32 loading-shimmer rounded-xl" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {types.map((type) => (
                            <CategoryCard
                                key={type.slug}
                                slug={type.slug}
                                totalChunks={type.total_chunks}
                                showTrainingBadge={false}
                                disabled={!type.has_training_data}
                                onClick={() => router.push(`/dashboard/generate?type=${type.slug}`)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
