"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/src/AuthContext";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
    HiOutlineExclamationCircle,
    HiOutlineCheckCircle,
    HiOutlineExternalLink
} from "react-icons/hi";

export function BannerConfirmacaoEmail() {
    const { perfil } = useAuth();

    const [isSent, setIsSent] = useState(perfil?.link_enviado || false);
    const [isLoading, setIsLoading] = useState(false);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (cooldown > 0) {
            timer = setInterval(() => {
                setCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [cooldown]);

    if (!perfil || perfil.tipo_usuario !== "CANDIDATO" || perfil.email_confirmado) {
        return null;
    }

    // Pega apenas o primeiro nome para ficar mais amigável
    const primeiroNome = perfil.nome.split(" ")[0];

    const handleEnviarLink = async () => {
        if (isLoading || cooldown > 0) return;

        setIsLoading(true);
        try {
            // ✨ PASSANDO O E-MAIL AQUI CONFORME SOLICITADO
            await api.post("/auth/validar-email", { email: perfil.email });

            setIsSent(true);
            setCooldown(60);
            toast.success("Prontinho! Link enviado com sucesso 📩");
        } catch (error: any) {
            const mensagemErro = error.response?.data?.error || "Poxa, ocorreu um erro ao enviar o e-mail. Tente de novo daqui a pouco.";
            toast.error(mensagemErro);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSent) {
        // ✨ ESTADO 3: Link Enviado (Amigável)
        return (
            <div
                role="status"
                className="w-full bg-blue-50 border-b border-blue-200 sticky top-0 z-50 shadow-sm animate-in fade-in slide-in-from-top-4"
            >
                <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center sm:items-start md:items-center justify-between gap-4 sm:gap-6">
                    <div className="flex items-start gap-3 w-full">
                        <HiOutlineCheckCircle className="text-blue-600 shrink-0 mt-0.5" size={22} />
                        <div className="flex flex-col space-y-1.5 w-full">
                            <p className="text-sm font-medium text-blue-900 leading-snug">
                                Enviamos um link de confirmação para <span className="font-bold bg-blue-100/70 px-1.5 py-0.5 rounded text-blue-800">{perfil.email}</span>.
                                <br className="hidden md:block" />
                                <span className="text-blue-800/80">
                                    Já confirmou?{" "}
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="underline decoration-blue-400/50 hover:decoration-blue-600 hover:text-blue-700 font-bold transition-all cursor-pointer"
                                    >
                                        Recarregue a página
                                    </button>
                                    {" "}para atualizar o status.
                                </span>
                            </p>
                            <p className="text-xs font-medium text-blue-700/80">
                                Cadastrou o e-mail errado? {" "}
                                <a
                                    href="https://wa.me/555533759350?text=Olá, preciso corrigir meu e-mail na plataforma ACI Vagas."
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-bold text-blue-700 hover:text-blue-900 transition-colors inline-flex items-center gap-1 group"
                                >
                                    Chame a ACI no WhatsApp
                                    <HiOutlineExternalLink size={12} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                </a>
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={handleEnviarLink}
                        disabled={isLoading || cooldown > 0}
                        className="shrink-0 w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all disabled:opacity-50 disabled:hover:bg-blue-600 shadow-sm shadow-blue-600/20 active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                Enviando...
                            </>
                        ) : cooldown > 0 ? (
                            `Aguarde ${cooldown}s`
                        ) : (
                            "Reenviar link"
                        )}
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            role="alert"
            className="w-full bg-amber-50 border-b border-amber-200 sticky top-0 z-50 shadow-sm"
        >
            <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <HiOutlineExclamationCircle className="text-amber-600 shrink-0" size={24} />
                    <p className="text-sm font-medium text-amber-900 leading-tight">
                        <strong>Olá, {primeiroNome}! Falta só um detalhe:</strong> Confirme seu e-mail para não perder nenhuma notificação importante e garantir que as empresas consigam te contatar.
                    </p>
                </div>
                <button
                    onClick={handleEnviarLink}
                    disabled={isLoading}
                    className="shrink-0 w-full sm:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-wider rounded-lg transition-all shadow-sm shadow-amber-500/20 disabled:opacity-50 disabled:hover:bg-amber-500 flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                >
                    {isLoading ? (
                        <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                            Enviando...
                        </>
                    ) : (
                        "Quero confirmar meu e-mail"
                    )}
                </button>
            </div>
        </div>
    );
}