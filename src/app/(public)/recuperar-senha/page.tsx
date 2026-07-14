"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/src/services/api";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    HiOutlineMail,
    HiOutlineArrowLeft,
    HiOutlineCheckCircle,
    HiOutlineSupport,
    HiOutlineKey,
} from "react-icons/hi";

// Validação do Zod para garantir que é um e-mail de verdade
const esqueciSenhaSchema = z.object({
    email: z
        .string()
        .min(1, "O e-mail é obrigatório.")
        .email("Por favor, digite um e-mail válido."),
});

type EsqueciSenhaData = z.infer<typeof esqueciSenhaSchema>;

export default function RecuperarSenhaPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [emailEnviado, setEmailEnviado] = useState("");

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EsqueciSenhaData>({
        resolver: zodResolver(esqueciSenhaSchema),
    });

    const onSubmit = async (data: EsqueciSenhaData) => {
        setIsSubmitting(true);
        try {
            // Dispara o e-mail pelo seu backend
            await api.post("/auth/esqueci-senha", { email: data.email });

            // Guarda o e-mail para mostrar na tela de sucesso
            setEmailEnviado(data.email);
            setIsSuccess(true);
            toast.success("E-mail de recuperação enviado!");
        } catch (error: any) {
            toast.error(
                error.response?.data?.error ||
                "Ocorreu um erro ao tentar recuperar a senha. Verifique o e-mail digitado."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50/50 animate-in fade-in duration-700">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">

                {/* ================= CARD PRINCIPAL ================= */}
                <div className="bg-white py-10 px-8 shadow-xl shadow-gray-200/50 rounded-[40px] border border-gray-100 relative overflow-hidden">

                    {/* Detalhe de fundo */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                    {!isSuccess ? (
                        /* ETAPA 1: FORMULÁRIO DE RECUPERAÇÃO */
                        <div className="relative z-10 space-y-8 animate-in slide-in-from-bottom-4">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-[20px] flex items-center justify-center mx-auto mb-4 border border-primary/20">
                                    <HiOutlineKey size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                    Esqueceu a senha?
                                </h2>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed px-4">
                                    Não se preocupe! Digite o e-mail cadastrado e enviaremos as instruções para você criar uma nova.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-black text-gray-700 mb-1.5 ml-1 uppercase tracking-widest">
                                        Seu E-mail
                                    </label>
                                    <div className="relative group">
                                        <HiOutlineMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                        <input
                                            id="email"
                                            type="email"
                                            placeholder="exemplo@email.com"
                                            {...register("email")}
                                            className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-2xl outline-none text-sm font-medium transition-all ${errors.email
                                                    ? "border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-50/30"
                                                    : "border-gray-200 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white"
                                                }`}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-[11px] font-bold text-red-500 ml-2 mt-1.5">
                                            {errors.email.message}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-full shadow-lg shadow-primary/30 text-sm font-black uppercase tracking-widest text-white bg-primary hover:bg-hover-button focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all active:scale-95 disabled:opacity-70 disabled:hover:scale-100"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        "Enviar E-mail de Recuperação"
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* ETAPA 2: TELA DE SUCESSO */
                        <div className="relative z-10 text-center space-y-6 animate-in zoom-in-95 duration-500">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[24px] flex items-center justify-center mx-auto mb-2 border border-emerald-100">
                                <HiOutlineCheckCircle size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                E-mail enviado!
                            </h2>
                            <div className="text-sm font-medium text-gray-600 leading-relaxed bg-gray-50 p-5 rounded-2xl border border-gray-100">
                                Enviamos um link de recuperação para:<br />
                                <strong className="text-gray-900 block mt-1 text-base">{emailEnviado}</strong>
                            </div>
                            <p className="text-xs text-gray-500 font-medium px-4">
                                Por favor, verifique sua caixa de entrada e também a pasta de <strong>Spam</strong> ou <strong>Lixo Eletrônico</strong>.
                            </p>

                            <button
                                onClick={() => setIsSuccess(false)}
                                className="text-xs font-bold text-primary hover:text-blue-800 transition-colors uppercase tracking-widest mt-4 inline-block"
                            >
                                Tentar outro e-mail
                            </button>
                        </div>
                    )}
                </div>

                {/* ================= LINKS EXTRAS E SUPORTE ================= */}
                <div className="mt-8 space-y-6 text-center animate-in fade-in slide-in-from-bottom-2">

                    <Link
                        href="/entrar"
                        className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors"
                    >
                        <HiOutlineArrowLeft size={16} /> Voltar para o Login
                    </Link>

                    {/* O Pulo do Gato: Fallback para quem perdeu o e-mail */}
                    <div className="bg-white border border-gray-200 p-5 rounded-3xl shadow-sm text-sm">
                        <div className="flex items-center justify-center gap-2 text-gray-800 font-black mb-1">
                            <HiOutlineSupport className="text-amber-500" size={20} />
                            Perdeu o acesso ao e-mail?
                        </div>
                        <p className="text-gray-500 font-medium text-xs mb-3">
                            Se você não consegue mais acessar o e-mail cadastrado, nossa equipe pode ajudar a recuperar sua conta.
                        </p>
                        <Link
                            href="https://wa.me/555533759350"
                            className="inline-block px-5 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 rounded-full text-xs font-black uppercase tracking-widest transition-colors"
                        >
                            Falar com o Suporte
                        </Link>
                    </div>

                </div>
            </div>
        </div>
    );
}