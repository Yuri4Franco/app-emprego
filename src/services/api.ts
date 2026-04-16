import axios from "axios";
import Cookies from "js-cookie";
import toast from "react-hot-toast";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000",
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
    if (error.response?.status === 401) {

      localStorage.removeItem("@ACI:token");
      localStorage.removeItem("@ACI:user");

      if (window.location.pathname !== "/entrar") {
        window.location.href = "/entrar";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
