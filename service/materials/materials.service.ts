// import { api } from "@/lib/api";
// import type { Material } from "@/lib/types/material";

// export const materialsService = {
//   // Get all materials (paginated)
//   getAll: async (params?: any): Promise<Material[]> => {
//     const res = await api.get("/materials", { params });
//     // Always return an array
//     if (Array.isArray(res.data)) return res.data;
//     if (Array.isArray(res.data?.payload)) return res.data.payload;
//     return [];
//   },

//   // Get material by ID
//   getById: async (id: string): Promise<Material> => {
//     const res = await api.get(`/materials/${id}`);
//     return res.data;
//   },

//   // Get materials by session (paginated)
//   getBySession: async (
//     sessionId: string,
//     params?: any,
//   ): Promise<Material[]> => {
//     const res = await api.get(`/materials/session/${sessionId}`, { params });
//     return res.data;
//   },

//   // Create new material (ADMIN or TRAINER)
//   create: async (data: {
//     title: string;
//     fileUrl: string;
//     sessionId: string;
//     trainerId: number;
//   }): Promise<any> => {
//     const res = await api.post("/materials", data);
//     return res.data;
//   },

//   // Update material (ADMIN or TRAINER)
//   update: async (id: string, data: Partial<Material>): Promise<Material> => {
//     const res = await api.put(`/materials/${id}`, data);
//     return res.data;
//   },

//   // Delete material (ADMIN or TRAINER)
//   delete: async (id: string): Promise<void> => {
//     await api.delete(`/materials/${id}`);
//   },
// };


import { api } from "@/lib/api";
import type { Material } from "@/lib/types/material";

export interface MaterialsParams {
  page?: number;
  size?: number;
  sort?: string;
}

export interface CreateMaterialData {
  title: string;
  fileUrl: string;
  sessionId: number;
  trainerId: number;
}

type ApiListResponse<T> = T[] | { payload: T[] };

function extractList<T>(data: ApiListResponse<T>): T[] {
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as { payload: T[] })?.payload)) return (data as { payload: T[] }).payload;
  return [];
}

export const materialsService = {
  getAll: async (params?: MaterialsParams): Promise<Material[]> => {
    const res = await api.get<ApiListResponse<Material>>("/materials", { params });
    return extractList(res.data);
  },

  getById: async (id: string): Promise<Material> => {
    const res = await api.get<Material>(`/materials/${id}`);
    return res.data;
  },

  getBySession: async (sessionId: string, params?: MaterialsParams): Promise<Material[]> => {
    const res = await api.get<ApiListResponse<Material>>(`/materials/session/${sessionId}`, { params });
    return extractList(res.data);
  },

  create: async (data: CreateMaterialData): Promise<Material> => {
    const res = await api.post<Material>("/materials", data);
    return res.data;
  },

  update: async (id: string, data: Partial<Material>): Promise<Material> => {
    const res = await api.put<Material>(`/materials/${id}`, data);
    return res.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/materials/${id}`);
  },

  uploadFile: async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data.url; // adjust to backend response
},
};