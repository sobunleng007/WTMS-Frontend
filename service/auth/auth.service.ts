 

import { api } from "@/lib/api";

export const authService = {
  login: async (data: { email: string; password: string }) => {
    const res = await api.post("/auth/login", data);
    return res.data;
  },

  register: async (data: any) => {
    const res = await api.post("/auth/register", data);
    return res.data;
  },

  resendOtp: async (data: { email: string }) => {
    const res = await api.post("/auth/resend-otp", data);
    return res.data;
  },

  verifyOtp: async (data: { email: string; otp: string }) => {
    const res = await api.put("/auth/verify", data);
    return res.data;
  },
};
