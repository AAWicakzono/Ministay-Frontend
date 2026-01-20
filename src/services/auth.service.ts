import api from "@/lib/axios";

export const adminLogin = (payload: {
    name: string;
    password: string;
}) => {
    return api.post("/auth/admin/login", payload);
}