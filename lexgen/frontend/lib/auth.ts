export interface User {
    username: string;
    role: "admin" | "user";
}

export function saveAuth(token: string, user: User) {
    if (typeof window !== "undefined") {
        localStorage.setItem("lexgen_token", token);
        localStorage.setItem("lexgen_user", JSON.stringify(user));
    }
}

export function getAuth(): { token: string | null; user: User | null } {
    if (typeof window === "undefined") {
        return { token: null, user: null };
    }

    const token = localStorage.getItem("lexgen_token");
    const userStr = localStorage.getItem("lexgen_user");

    let user: User | null = null;
    if (userStr) {
        try {
            user = JSON.parse(userStr);
        } catch {
            user = null;
        }
    }

    return { token, user };
}

export function clearAuth() {
    if (typeof window !== "undefined") {
        localStorage.removeItem("lexgen_token");
        localStorage.removeItem("lexgen_user");
    }
}

export function isAuthenticated(): boolean {
    const { token } = getAuth();
    return !!token;
}

export function isAdmin(): boolean {
    const { user } = getAuth();
    return user?.role === "admin";
}

export function requireAuth(): User {
    const { user, token } = getAuth();
    if (!token || !user) {
        if (typeof window !== "undefined") {
            window.location.href = "/";
        }
        throw new Error("Não autenticado");
    }
    return user;
}
