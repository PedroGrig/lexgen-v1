"use client";

import { useRouter } from "next/navigation";
import { clearAuth } from "@/lib/auth";

interface NavbarProps {
    username: string;
    role: "admin" | "user";
}

export default function Navbar({ username, role }: NavbarProps) {
    const router = useRouter();

    const handleLogout = () => {
        clearAuth();
        router.push("/");
    };

    return (
        <nav className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <h1
                        className="font-serif text-2xl font-bold text-gold-gradient cursor-pointer"
                        onClick={() => router.push(role === "admin" ? "/admin" : "/dashboard")}
                    >
                        LexGen
                    </h1>

                    {role === "admin" && (
                        <div className="flex items-center gap-1">
                            <button
                                onClick={() => router.push("/admin")}
                                className="px-3 py-1.5 text-sm text-muted hover:text-foreground transition-colors rounded-md hover:bg-card"
                            >
                                Dashboard
                            </button>
                            <button
                                onClick={() => router.push("/admin/library")}
                                className="px-3 py-1.5 text-sm text-muted hover:text-foreground transition-colors rounded-md hover:bg-card"
                            >
                                Biblioteca
                            </button>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center">
                            <span className="text-accent text-sm font-semibold">
                                {username.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="text-sm">
                            <span className="text-foreground">{username}</span>
                            <span className="text-muted ml-2 text-xs px-2 py-0.5 bg-accent/10 rounded-full">
                                {role === "admin" ? "Admin" : "Usuário"}
                            </span>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="px-3 py-1.5 text-sm text-muted hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                    >
                        Sair
                    </button>
                </div>
            </div>
        </nav>
    );
}
