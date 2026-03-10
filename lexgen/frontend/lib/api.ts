import axios from "axios";

// Uso "/api" como fallback padrão para se beneficiar dos rewrites() do Next.js
const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Interceptor para adicionar o token JWT
api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        const token = localStorage.getItem("lexgen_token");
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

// Interceptor para lidar com erros de autenticação
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== "undefined") {
                localStorage.removeItem("lexgen_token");
                localStorage.removeItem("lexgen_user");
                window.location.href = "/";
            }
        }
        return Promise.reject(error);
    }
);

// Auth
export const login = async (username: string, password: string) => {
    const response = await api.post("/auth/login", { username, password });
    return response.data;
};

// Admin
export const getCategories = async () => {
    const response = await api.get("/admin/categories");
    return response.data;
};

export const uploadDocuments = async (
    files: File[],
    documentType: string,
    onProgress?: (progress: number) => void
) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("document_type", documentType);

    const response = await api.post("/admin/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
            if (onProgress && progressEvent.total) {
                const progress = Math.round(
                    (progressEvent.loaded * 100) / progressEvent.total
                );
                onProgress(progress);
            }
        },
    });
    return response.data;
};

export const deleteCategory = async (documentType: string) => {
    const response = await api.delete(`/admin/category/${documentType}`);
    return response.data;
};

export const getLibrary = async (documentType?: string) => {
    const params = documentType ? { document_type: documentType } : {};
    const response = await api.get("/admin/library", { params });
    return response.data;
};

// Documents
export const getDocumentTypes = async () => {
    const response = await api.get("/documents/types");
    return response.data;
};

export const generateText = async (
    documentType: string,
    formData: Record<string, any>
) => {
    const response = await api.post("/documents/generate-text", {
        document_type: documentType,
        form_data: formData,
    });
    return response.data;
};

export const downloadDocx = async (text: string, documentType: string) => {
    const response = await api.post(
        "/documents/download-docx",
        { text, document_type: documentType },
        { responseType: "blob" }
    );

    // Trigger download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${documentType}_gerado.docx`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
};

export default api;
