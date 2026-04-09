import axios from "axios";
import Cookies from "js-cookie";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
});

// INTERCEPTOR: Adiciona o token em todas as chamadas automaticamente
api.interceptors.request.use((config) => {
  const token = Cookies.get("aci_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default api;
