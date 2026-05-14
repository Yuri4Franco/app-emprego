"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { HiOutlineMailOpen, HiArrowLeft } from "react-icons/hi";
import toast from "react-hot-toast";
import api from "@/src/services/api";

import Logo from "@/src/assets/logos/logo-transparente.webp";

export default function VerificarEmailPage() {
  const [emailPendente, setEmailPendente] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  // Busca o e-mail salvo na aba do navegador (sessionStorage)
  useEffect(() => {
    const emailSalvo = sessionStorage.getItem("@ACI:pendingEmail");
    if (emailSalvo) {
      setEmailPendente(emailSalvo);
    }
  }, []);

  const handleReenviar = async () => {
    if (!emailPendente) {
      toast.error(
        "E-mail não encontrado. Por favor, tente fazer login novamente.",
      );
      return;
    }

    setIsResending(true);

    try {
      await api.post("/auth/reenviar-ativacao", { email: emailPendente });
      toast.success(
        "Novo link enviado com sucesso! Verifique sua caixa de entrada.",
      );
    } catch (error: any) {
      const msgErro =
        error.response?.data?.error ||
        "Erro ao reenviar o e-mail. Tente mais tarde.";
      toast.error(msgErro);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50 flex flex-col justify-center items-center p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image src={Logo} alt="Logo ACI Vagas" className="h-12 w-auto" />
        </div>

        {/* Ícone de E-mail */}
        <div className="w-20 h-20 bg-blue-50 text-primary rounded-full flex items-center justify-center mx-auto mb-6">
          <HiOutlineMailOpen size={40} />
        </div>

        {/* Mensagens */}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Quase lá!</h1>

        {/* Mostra o e-mail dinamicamente para confirmar ao usuário */}
        {emailPendente && (
          <p className="text-primary font-medium mb-4">{emailPendente}</p>
        )}

        <p className="text-gray-600 mb-6 leading-relaxed">
          Enviamos um link de ativação para o seu e-mail. Por favor, clique no
          botão contido na mensagem para liberar o seu acesso à plataforma.
        </p>

        <div className="bg-orange-50 text-orange-800 text-sm p-4 rounded-lg text-left mb-8">
          <strong>Dica:</strong> Se não encontrar o e-mail na sua caixa de
          entrada em alguns minutos, verifique também as pastas de{" "}
          <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>.
        </div>

        {/* Ações */}
        <div className="flex flex-col space-y-4">
          <button
            onClick={handleReenviar}
            disabled={isResending || !emailPendente}
            className={`font-semibold text-sm transition-colors ${
              isResending || !emailPendente
                ? "text-gray-400 cursor-not-allowed"
                : "text-primary hover:underline"
            }`}
          >
            {isResending
              ? "Enviando novo link..."
              : "Não recebeu o e-mail? Clique aqui para reenviar"}
          </button>

          <Link
            href="/entrar"
            className="inline-flex items-center justify-center gap-2 text-gray-500 hover:text-gray-900 font-medium transition-colors"
          >
            <HiArrowLeft /> Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
}
