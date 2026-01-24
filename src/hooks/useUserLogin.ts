import { useState } from "react";
import {
  sendOtpService,
  verifyOtpService,
} from "@/services/auth.service";

export function useUserAuth() {
  const [loading, setLoading] = useState(false);

  const sendOtp = async (name: string, phone: string) => {
    setLoading(true);
    try {
      await sendOtpService({ name, phone });
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "Gagal mengirim OTP. Coba lagi.";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async (phone: string, otp: string) => {
    setLoading(true);
    try {
      const data = await verifyOtpService({ phone, otp });

      localStorage.setItem(
        "ministay_user",
        JSON.stringify(data.user)
      );
      localStorage.setItem("user_token", data.token);

      window.dispatchEvent(new Event("user-update"));

      return data;
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        "OTP tidak valid.";
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  return {
    sendOtp,
    verifyOtp,
    loading,
  };
}
