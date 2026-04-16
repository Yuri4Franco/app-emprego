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

import Logo from "@/src/assets/logos/logo-transparente.png";

export default function AtivarContaPage({
  params,
}: {
  // 1. Tipagem atualizada para o Next.js mais recente
  params: Promise<{ token: string }>;
}) {
  const router = useRouter();

  // 2. A MÁGICA AQUI: Desempacotando a Promise com o hook use()
  const { token } = use(params);

  const jaValidou = useRef(false);

  // Status possíveis: 'loading', 'success', 'error'
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading",
  );
  const [errorMessage, setErrorMessage] = useState("");

useEffect(() => {
    const validarToken = async () => {
      // Se a requisição já foi feita, aborta a execução duplicada do Strict Mode
      if (jaValidou.current) return;
      
      // Marca que a requisição está sendo feita
      jaValidou.current = true;

      try {
        await api.post("/ativar", { token });

        setStatus("success");
        setTimeout(() => {
          router.push("/entrar");
        }, 3000);
      } catch (error: any) {
        setStatus("error");
        setErrorMessage(
          error.response?.data?.error || "Ocorreu um erro ao validar seu link.",
        );
      }
    };

    if (token) {
      validarToken();
    }
  }, [token, router]);

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100 transition-all duration-300">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Image src={Logo} alt="Logo ACI Empregos" className="h-12 w-auto" />
        </div>

        {/* --- ESTADO: CARREGANDO --- */}
        {status === "loading" && (
          <div className="flex flex-col items-center animate-pulse">
            <HiOutlineDotsHorizontal
              className="text-gray-400 mb-4 animate-bounce"
              size={48}
            />
            <h1 className="text-xl font-bold text-gray-900 mb-2">
              Validando seu acesso...
            </h1>
            <p className="text-gray-500">
              Aguarde um instante, estamos confirmando seu link.
            </p>
          </div>
        )}

        {/* --- ESTADO: SUCESSO --- */}
        {status === "success" && (
          <div className="flex flex-col items-center">
            <HiCheckCircle className="text-green-500 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Conta Ativada!
            </h1>
            <p className="text-gray-600 mb-6">
              Sua conta na ACI Empregos foi ativada com sucesso. Você será
              redirecionado para o login em instantes...
            </p>

            <Link
              href="/entrar"
              className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors"
            >
              Ir para o Login Agora
            </Link>
          </div>
        )}

        {/* --- ESTADO: ERRO --- */}
        {status === "error" && (
          <div className="flex flex-col items-center">
            <HiXCircle className="text-red-500 mb-4" size={64} />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Ops, link inválido
            </h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>

            <div className="flex flex-col w-full space-y-3">
              <Link
                href="/entrar"
                className="w-full bg-primary text-white py-3 rounded-lg font-bold hover:bg-blue-800 transition-colors"
              >
                Ir para o Login
              </Link>

              <Link
                href="/verificar-email"
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-200 transition-colors"
              >
                Pedir novo link
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
