"use client";

import { useState } from "react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    destructive?: boolean;
}

export default function ConfirmModal({
    isOpen,
    title,
    message,
    confirmText = "Confirmar",
    cancelText = "Cancelar",
    onConfirm,
    onCancel,
    destructive = false,
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onCancel} />
            <div className="relative glass-card rounded-xl p-6 max-w-md w-full mx-4 shadow-card animate-fade-in">
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-muted text-sm mb-6">{message}</p>
                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm text-muted hover:text-foreground transition-colors rounded-lg border border-border hover:border-border"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${destructive
                                ? "bg-destructive hover:bg-destructive/90 text-white"
                                : "bg-accent hover:bg-accent-hover text-background"
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
