"use client";

import { documentSchemas } from "@/lib/document-schemas";

interface CategoryCardProps {
    slug: string;
    totalChunks?: number;
    totalDocuments?: number;
    lastUpload?: string | null;
    onClick?: () => void;
    onReset?: () => void;
    showTrainingBadge?: boolean;
    disabled?: boolean;
}

export default function CategoryCard({
    slug,
    totalChunks = 0,
    totalDocuments = 0,
    lastUpload,
    onClick,
    onReset,
    showTrainingBadge = true,
    disabled = false,
}: CategoryCardProps) {
    const schema = documentSchemas[slug];
    if (!schema) return null;

    const isTrained = totalChunks > 0;

    return (
        <div
            onClick={disabled ? undefined : onClick}
            className={`group relative glass-card rounded-xl p-6 transition-all duration-300 ${disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer hover:border-accent/40 hover:shadow-glow hover:scale-[1.02]"
                }`}
        >
            {/* Icon */}
            <div className="text-3xl mb-3">{schema.icon}</div>

            {/* Title */}
            <h3 className="font-serif text-lg font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
                {schema.label}
            </h3>

            {/* Training status */}
            {showTrainingBadge && (
                <div className="flex items-center gap-2 mt-3">
                    <div
                        className={`pulse-dot ${isTrained ? "bg-success" : "bg-muted-foreground"
                            }`}
                    />
                    <span
                        className={`text-xs font-medium ${isTrained ? "text-success" : "text-muted-foreground"
                            }`}
                    >
                        {isTrained
                            ? `Treinado • ${totalChunks} chunks`
                            : "Sem dados"}
                    </span>
                </div>
            )}

            {/* Documents count */}
            {isTrained && totalDocuments > 0 && (
                <p className="text-xs text-muted mt-1">
                    {totalDocuments} documento{totalDocuments > 1 ? "s" : ""} indexado{totalDocuments > 1 ? "s" : ""}
                </p>
            )}

            {/* Reset button */}
            {onReset && isTrained && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onReset();
                    }}
                    className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10"
                    title="Resetar treinamento"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            )}

            {/* Disabled tooltip */}
            {disabled && (
                <p className="text-xs text-muted-foreground mt-3 italic">
                    Aguardando treinamento pelo administrador
                </p>
            )}
        </div>
    );
}
