"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { isAxiosError } from "axios";

type AdminLoginPayload = {
  name: string;
  password: string;
};

type AdminLoginResponse = {
  token: string;
  user?: {
    name?: string;
    email?: string;
  };
};

type ApiErrorResponse = {
  message?: string;
};

export const useAdminLogin = () => {
  const [loading, setLoading] = useState(false);

  const login = async (payload: AdminLoginPayload): Promise<void> => {
    setLoading(true);

    try {
      const res = await api.post<AdminLoginResponse>(
        "/auth/admin/login",
        payload
      );

      if (!res.data.token) {
        throw new Error("Token tidak diterima dari server");
      }

      localStorage.setItem("ministay_admin_token", res.data.token);
      localStorage.setItem(
        "ministay_user",
        JSON.stringify({
          name: res.data.user?.name ?? payload.name,
          email: res.data.user?.email ?? "-",
          role: "admin",
        })
      );

      window.dispatchEvent(new Event("user-update"));
    } catch (error) {
      if (isAxiosError<ApiErrorResponse>(error)) {
        if (error.response?.status === 401) {
          throw new Error("Username atau Password salah.");
        }

        throw new Error(
          error.response?.data?.message ?? "Gagal login admin"
        );
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error("Terjadi kesalahan tidak terduga");
    } finally {
      setLoading(false);
    }
  };

  return { login, loading };
};
