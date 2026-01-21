import api from "@/lib/axios";

export const adminLogin = (payload: {
    name: string;
    password: string;
}) => {
    return api.post("/auth/admin/login", payload);
}

export interface SendOtpPayload {
  name: string;
  phone: string; 
}

export interface VerifyOtpPayload {
  phone: string;
  otp: string;
}

export interface UserAuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    phone: string;
    role: "user";
  };
}

export async function sendOtpService(payload: SendOtpPayload) {
  const res = await api.post("/auth/otp", payload);
  return res.data;
}

export async function verifyOtpService(
  payload: VerifyOtpPayload
): Promise<UserAuthResponse> {
  const res = await api.post("/auth/verify", payload);
  return res.data;
}