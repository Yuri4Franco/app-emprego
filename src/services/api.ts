import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
  withCredentials: true,
});

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
    // Quando o servidor diz "401 Não Autorizado" (Token expirou ou é inválido)
    if (error.response?.status === 401) {
      
      // 1. Limpa TODOS os Cookies que você definiu no AuthContext
      Cookies.remove("aci_token", { path: "/" });
      Cookies.remove("user_role", { path: "/" });
      Cookies.remove("exigir_troca_senha", { path: "/" });

      // 2. Só exibe o aviso e redireciona se a pessoa já não estiver na página de entrar
      if (window.location.pathname !== "/entrar") {
        toast.error("Sua sessão expirou. Por favor, faça login novamente.", {
          duration: 4000, // Fica na tela por 4 segundos
        });
        
        window.location.href = "/entrar";
      }
    }
    return Promise.reject(error);
  }
);

export default api;