"use client";

import { useState, useCallback, useRef } from "react";

interface UploadZoneProps {
    onFilesSelected: (files: File[]) => void;
    acceptedTypes?: string[];
    maxFiles?: number;
}

export default function UploadZone({
    onFilesSelected,
    acceptedTypes = [".docx", ".pdf"],
    maxFiles = 20,
}: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragging(false);
            const files = Array.from(e.dataTransfer.files).filter((f) =>
                acceptedTypes.some((t) => f.name.toLowerCase().endsWith(t))
            );
            if (files.length > 0) {
                const newFiles = [...selectedFiles, ...files].slice(0, maxFiles);
                setSelectedFiles(newFiles);
                onFilesSelected(newFiles);
            }
        },
        [selectedFiles, acceptedTypes, maxFiles, onFilesSelected]
    );

    const handleFileSelect = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.target.files) {
                const files = Array.from(e.target.files);
                const newFiles = [...selectedFiles, ...files].slice(0, maxFiles);
                setSelectedFiles(newFiles);
                onFilesSelected(newFiles);
            }
        },
        [selectedFiles, maxFiles, onFilesSelected]
    );

    const removeFile = useCallback(
        (index: number) => {
            const newFiles = selectedFiles.filter((_, i) => i !== index);
            setSelectedFiles(newFiles);
            onFilesSelected(newFiles);
        },
        [selectedFiles, onFilesSelected]
    );

    const formatSize = (bytes: number) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    return (
        <div className="space-y-4">
            {/* Dropzone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragging
                        ? "border-accent bg-accent-muted scale-[1.02]"
                        : "border-border hover:border-accent/50 hover:bg-card"
                    }`}
            >
                <div className="text-4xl mb-4">📁</div>
                <p className="text-foreground font-medium mb-2">
                    Arraste arquivos aqui ou clique para selecionar
                </p>
                <p className="text-muted text-sm">
                    Aceita .docx e .pdf • Máximo {maxFiles} arquivos
                </p>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept={acceptedTypes.join(",")}
                    onChange={handleFileSelect}
                    className="hidden"
                />
            </div>

            {/* File list */}
            {selectedFiles.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm text-muted font-medium">
                        {selectedFiles.length} arquivo{selectedFiles.length > 1 ? "s" : ""}{" "}
                        selecionado{selectedFiles.length > 1 ? "s" : ""}
                    </p>
                    {selectedFiles.map((file, index) => (
                        <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-card rounded-lg border border-border"
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <span className="text-lg">
                                    {file.name.endsWith(".pdf") ? "📕" : "📄"}
                                </span>
                                <div className="min-w-0">
                                    <p className="text-sm text-foreground truncate">{file.name}</p>
                                    <p className="text-xs text-muted">{formatSize(file.size)}</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    removeFile(index);
                                }}
                                className="p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded"
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <p className="text-xs text-muted-foreground italic">
                Quanto mais documentos reais do escritório você adicionar, melhor será a geração
            </p>
        </div>
    );
}
