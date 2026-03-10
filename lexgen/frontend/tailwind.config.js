/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "#0f0f13",
                foreground: "#e8e4dc",
                accent: "#c9a96e",
                "accent-hover": "#d4b87e",
                "accent-muted": "rgba(201, 169, 110, 0.15)",
                card: "#18181f",
                "card-hover": "#1f1f28",
                border: "#2a2a35",
                "border-accent": "rgba(201, 169, 110, 0.3)",
                muted: "#8a8a99",
                "muted-foreground": "#6b6b7a",
                success: "#4ade80",
                destructive: "#ef4444",
                warning: "#f59e0b",
            },
            fontFamily: {
                serif: ["Playfair Display", "Georgia", "serif"],
                sans: ["DM Sans", "Inter", "system-ui", "sans-serif"],
            },
            borderRadius: {
                lg: "0.75rem",
                md: "0.5rem",
                sm: "0.375rem",
            },
            boxShadow: {
                glow: "0 0 20px rgba(201, 169, 110, 0.15)",
                "glow-lg": "0 0 40px rgba(201, 169, 110, 0.2)",
                card: "0 4px 24px rgba(0, 0, 0, 0.3)",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-out",
                "slide-up": "slideUp 0.5s ease-out",
                "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
            },
        },
    },
    plugins: [],
};
