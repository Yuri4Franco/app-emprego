"use client";

import { useEffect, useState, use, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  HiCheckCircle,
  HiXCircle,
  HiOutlineDotsHorizontal,
} from "react-icons/hi";
import api from "@/src/services/api";

import Logo from "@/src/assets/logos/logo-transparente.webp";
import { useAuth } from "@/src/AuthContext";

export default function ConfirmarEmailPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { login } = useAuth();
  const router = useRouter();
  const { token } = use(params);

  const jaValidou = useRef(false);

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const validarToken = async () => {
      if (jaValidou.current) return;
      jaValidou.current = true;

      try {
        // ✨ ATUALIZADO: Usando o novo endpoint
        const response = await api.post("/confirmar-email", { token });

        // ✨ CORREÇÃO: Faltava atualizar o estado para sucesso!
        setStatus("success");

        // Tenta pegar o token dependendo de como o seu backend devolve
        const tokenDeLogin = response.data?.data?.token || response.data?.token;

        setTimeout(async () => {
          if (tokenDeLogin) {
            await login(tokenDeLogin);
          } else {
            // Se o backend não devolver token, manda pro login
            router.push("/entrar");
          }
        }, 2500);
      } catch (error: any) {
        setStatus("error");
        setErrorMessage(
          error.response?.data?.error || "Ocorreu um erro ao validar seu link. Ele pode ter expirado."
        );
      }
    };

    if (token) {
      validarToken();
    }
  }, [token, login, router]);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100 transition-all duration-300">

        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src={Logo} alt="Logo ACI Vagas" className="h-12 w-auto" priority />
        </div>

        {/* --- ESTADO: CARREGANDO --- */}
        {status === "loading" && (
          <div className="flex flex-col items-center animate-in fade-in duration-500">
            <HiOutlineDotsHorizontal
              className="text-blue-500 mb-4 animate-bounce"
              size={48}
            />
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Verificando seu e-mail...
            </h1>
            <p className="text-sm text-gray-500 font-medium">
              Aguarde um instante, estamos validando seu link de confirmação.
            </p>
          </div>
        )}

        {/* --- ESTADO: SUCESSO --- */}
        {status === "success" && (
          <div className="flex flex-col items-center animate-in zoom-in-95 duration-500">
            <HiCheckCircle className="text-emerald-500 mb-4" size={64} />
            <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
              E-mail Confirmado!
            </h1>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Tudo certo! Seu endereço de e-mail foi validado com sucesso.
              Você será redirecionado em instantes...
            </p>

            {/* Caso o redirecionamento demore, o usuário pode clicar */}
            <Link
              href="/entrar"
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20"
            >
              Ir para o meu painel
            </Link>
          </div>
        )}

        {/* --- ESTADO: ERRO --- */}
        {status === "error" && (
          <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <HiXCircle className="text-red-500 mb-4" size={64} />
            <h1 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">
              Ops, link inválido
            </h1>
            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              {errorMessage}
            </p>

            {/* ✨ UX Aprimorada: Como não sabemos o e-mail aqui, mandamos para o login onde o Banner resolve o problema! */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-left">
              <p className="text-xs font-medium text-amber-900">
                <strong>Dica:</strong> Faça login na sua conta. Se o e-mail ainda não estiver confirmado, você verá um aviso no topo da tela para <strong>solicitar um novo link</strong>.
              </p>
            </div>

            <Link
              href="/entrar"
              className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-black text-sm uppercase tracking-wider hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 active:scale-95"
            >
              Fazer Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}