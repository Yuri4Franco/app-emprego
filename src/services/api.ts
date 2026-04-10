import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // 1. Limpa os dados de sessão
      localStorage.removeItem("@ACI:token");
      localStorage.removeItem("@ACI:user");

      toast.error("Sua sessão expirou. Por favor, faça login novamente.");

      // 3. Redireciona para o login (se não estiver na página de login)
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
