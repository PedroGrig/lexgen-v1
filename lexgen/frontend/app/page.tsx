"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const data = await login(username, password);
            saveAuth(data.access_token, {
                username: data.username,
                role: data.role,
            });

            if (data.role === "admin") {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }
        } catch (err: any) {
            setError(
                err.response?.data?.detail || "Erro ao fazer login. Tente novamente."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,169,110,0.08)_0%,_transparent_60%)]" />
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/3 rounded-full blur-3xl" />

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo */}
                <div className="text-center mb-12">
                    <h1 className="font-serif text-5xl font-bold text-gold-gradient mb-3">
                        LexGen
                    </h1>
                    <div className="w-16 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mb-4" />
                    <p className="text-muted text-sm tracking-wider uppercase">
                        Geração Inteligente de Documentos Jurídicos
                    </p>
                </div>

                {/* Login Card */}
                <div className="glass-card rounded-xl p-8 shadow-card">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-muted mb-2"
                            >
                                Usuário
                            </label>
                            <input
                                id="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                                placeholder="Digite seu usuário"
                                required
                            />
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-muted mb-2"
                            >
                                Senha
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                                placeholder="Digite sua senha"
                                required
                            />
                        </div>

                        {error && (
                            <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-destructive text-sm">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-accent hover:bg-accent-hover text-background font-semibold rounded-lg transition-all duration-200 shadow-glow hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <svg
                                        className="animate-spin h-5 w-5"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <circle
                                            className="opacity-25"
                                            cx="12"
                                            cy="12"
                                            r="10"
                                            stroke="currentColor"
                                            strokeWidth="4"
                                        />
                                        <path
                                            className="opacity-75"
                                            fill="currentColor"
                                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                                        />
                                    </svg>
                                    <span>Entrando...</span>
                                </>
                            ) : (
                                "Entrar"
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="text-center text-muted-foreground text-xs mt-8">
                    Sistema protegido por autenticação JWT
                </p>
            </div>
        </div>
    );
}
