import axios from "axios";

// Create axios instance with auth header injection
const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
  withCredentials: true,
});

// Request interceptor to add token if needed
client.interceptors.request.use((config) => {
  // Check if running in browser before accessing localStorage
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const api = {
  // Auth
  login: async (email: string, password: string) => {
    const res = await client.post("/auth/login", { email, password });
    if (typeof window !== "undefined") {
      localStorage.setItem("token", res.data.access_token);
    }
    return res.data;
  },
  
  register: async (email: string, password: string) => {
    const res = await client.post("/auth/register", { email, password });
    return res.data;
  },

  getMe: async () => {
    const res = await client.get("/auth/me");
    return res.data;
  },

  // Documents
  getVisaRequirements: async () => {
    const res = await client.get("/documents/requirements");
    return res.data;
  },
  uploadDocuments: async (files: File[], docType: string) => {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    formData.append("doc_type", docType);
    const res = await client.post("/documents/upload", formData);
    return res.data;
  },

  listDocuments: async () => {
    const res = await client.get("/documents");
    return res.data;
  },
  
  processDocument: async (docId: number | string) => {
    const res = await client.post(`/documents/${docId}/process`);
    return res.data;
  },
  
  getExtractedFields: async (docId: number | string) => {
    const res = await client.get(`/documents/${docId}`);
    return res.data.extracted_fields || {};
  },

  // Verification
  runVerification: async () => {
    const res = await client.post("/verify/");
    return res.data;
  },

  // DS-160 Form
  generateDS160: async () => {
    const res = await client.post("/ds160/generate");
    return res.data;
  },
  
  previewDS160: async () => {
    const res = await client.get("/ds160/preview");
    return res.data;
  },
  
  saveDS160: async (formId: number | string, formData: any) => {
    const res = await client.put(`/ds160/${formId}`, { form_data: formData });
    return res.data;
  },
  
  exportDS160: async () => {
    const res = await client.get("/ds160/export", { responseType: "blob" });
    if (typeof window !== "undefined") {
      // Create download link
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "ds160_form.json");
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  },

  exportDS160PDF: async (formData: any) => {
    const res = await client.post("/ds160/export-pdf", { form_data: formData }, { responseType: "blob" });
    const url = window.URL.createObjectURL(new Blob([res.data], { type: "application/pdf" }));
    return url;
  },
};
