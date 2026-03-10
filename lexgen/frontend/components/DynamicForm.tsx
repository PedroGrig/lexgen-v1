"use client";

import { useState } from "react";
import {
    documentSchemas,
    getSections,
    getFieldsBySection,
    type FieldSchema,
} from "@/lib/document-schemas";

interface DynamicFormProps {
    documentType: string;
    onSubmit: (data: Record<string, any>) => void;
    loading?: boolean;
}

export default function DynamicForm({
    documentType,
    onSubmit,
    loading = false,
}: DynamicFormProps) {
    const schema = documentSchemas[documentType];
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!schema) {
        return (
            <div className="text-center p-8 text-muted">
                Schema não encontrado para: {documentType}
            </div>
        );
    }

    const sections = getSections(documentType);

    const handleChange = (id: string, value: any) => {
        setFormData((prev) => ({ ...prev, [id]: value }));
        if (errors[id]) {
            setErrors((prev) => {
                const n = { ...prev };
                delete n[id];
                return n;
            });
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};
        schema.fields.forEach((field) => {
            if (field.required && !formData[field.id]) {
                newErrors[field.id] = "Campo obrigatório";
            }
        });
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    const renderField = (field: FieldSchema) => {
        const value = formData[field.id] || "";
        const hasError = !!errors[field.id];
        const baseInputClasses = `w-full px-4 py-3 bg-background border rounded-lg text-foreground placeholder-muted-foreground focus:border-accent focus:ring-1 focus:ring-accent transition-colors ${hasError ? "border-destructive" : "border-border"
            }`;

        switch (field.type) {
            case "textarea":
                return (
                    <textarea
                        id={field.id}
                        value={value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        rows={4}
                        className={`${baseInputClasses} resize-vertical min-h-[100px]`}
                    />
                );

            case "select":
                return (
                    <select
                        id={field.id}
                        value={value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        className={baseInputClasses}
                    >
                        <option value="">Selecione...</option>
                        {field.options?.map((opt) => (
                            <option key={opt} value={opt}>
                                {opt}
                            </option>
                        ))}
                    </select>
                );

            case "date":
                return (
                    <input
                        id={field.id}
                        type="date"
                        value={value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        className={baseInputClasses}
                    />
                );

            case "number":
                return (
                    <input
                        id={field.id}
                        type="number"
                        value={value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className={baseInputClasses}
                    />
                );

            case "currency":
                return (
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted">
                            R$
                        </span>
                        <input
                            id={field.id}
                            type="text"
                            value={value}
                            onChange={(e) => {
                                const v = e.target.value.replace(/[^\d.,]/g, "");
                                handleChange(field.id, v);
                            }}
                            placeholder="0,00"
                            className={`${baseInputClasses} pl-10`}
                        />
                    </div>
                );

            default:
                return (
                    <input
                        id={field.id}
                        type="text"
                        value={value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        placeholder={field.placeholder}
                        className={baseInputClasses}
                    />
                );
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {sections.map((section) => {
                const fields = getFieldsBySection(documentType, section);
                return (
                    <div key={section} className="space-y-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-1 h-6 bg-accent rounded-full" />
                            <h3 className="font-serif text-lg font-semibold text-foreground">
                                {section}
                            </h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fields.map((field) => (
                                <div
                                    key={field.id}
                                    className={
                                        field.type === "textarea"
                                            ? "col-span-1 md:col-span-2"
                                            : ""
                                    }
                                >
                                    <label
                                        htmlFor={field.id}
                                        className="block text-sm font-medium text-muted mb-1.5"
                                    >
                                        {field.label}
                                        {field.required && (
                                            <span className="text-accent ml-1">*</span>
                                        )}
                                    </label>
                                    {renderField(field)}
                                    {errors[field.id] && (
                                        <p className="text-xs text-destructive mt-1">
                                            {errors[field.id]}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}

            {/* Submit */}
            <div className="pt-4 border-t border-border">
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-accent hover:bg-accent-hover text-background font-semibold rounded-lg transition-all duration-200 shadow-glow hover:shadow-glow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg"
                >
                    {loading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            <span>Gerando com IA...</span>
                        </>
                    ) : (
                        <>
                            <span>⚡</span>
                            <span>Gerar Documento</span>
                        </>
                    )}
                </button>
            </div>
        </form>
    );
}
