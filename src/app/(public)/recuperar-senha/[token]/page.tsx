"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/src/services/api";
import Link from "next/link";
import toast from "react-hot-toast";
import {
    HiOutlineLockClosed,
    HiOutlineCheckCircle,
    HiOutlineEye,
    HiOutlineEyeOff,
    HiOutlineArrowRight,
    HiXCircle,
} from "react-icons/hi";

// Validação rigorosa e confirmação de senha
const redefinirSenhaSchema = z
    .object({
        novaSenha: z
            .string()
            .min(8, "A senha deve ter pelo menos 8 caracteres")
            .regex(/[a-zA-Z]/, "A senha deve conter letras")
            .regex(/[0-9]/, "A senha deve conter números")
            .regex(
                /[@#$!%*?&]/,
                "A senha deve conter um caractere especial (@, #, $, etc)"
            ),
        confirmarSenha: z.string(),
    })
    .refine((data) => data.novaSenha === data.confirmarSenha, {
        message: "As senhas não coincidem.",
        path: ["confirmarSenha"],
    });

type RedefinirSenhaData = z.infer<typeof redefinirSenhaSchema>;

export default function RedefinirSenhaPage() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<RedefinirSenhaData>({
        resolver: zodResolver(redefinirSenhaSchema),
        mode: "onChange", // Valida a cada tecla digitada
    });

    // Observa a senha para animar a checklist em tempo real
    const senhaAtual = watch("novaSenha", "");

    // Regras da Checklist
    const regras = [
        { label: "Pelo menos 8 caracteres", valido: senhaAtual.length >= 8 },
        { label: "Contém letras", valido: /[a-zA-Z]/.test(senhaAtual) },
        { label: "Contém números", valido: /[0-9]/.test(senhaAtual) },
        { label: "Caractere especial (@, #, $, etc)", valido: /[@#$!%*?&]/.test(senhaAtual) },
    ];

    const onSubmit = async (data: RedefinirSenhaData) => {
        setIsSubmitting(true);
        try {
            // Bate no endpoint com o token capturado da URL
            await api.post("/auth/redefinir-senha", {
                token,
                nova_senha: data.novaSenha, // Ajuste para a chave esperada pelo seu backend
            });

            setIsSuccess(true);
            toast.success("Sua senha foi redefinida com sucesso!");
        } catch (error: any) {
            toast.error(
                error.response?.data?.error ||
                "Token inválido ou expirado. Solicite a recuperação novamente."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50/50 animate-in fade-in duration-700">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">

                <div className="bg-white py-10 px-8 shadow-xl shadow-gray-200/50 rounded-[40px] border border-gray-100 relative overflow-hidden">
                    {/* Detalhe de fundo */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

                    {!isSuccess ? (
                        /* ETAPA 1: CRIAÇÃO DA NOVA SENHA */
                        <div className="relative z-10 space-y-8 animate-in slide-in-from-bottom-4">
                            <div className="text-center space-y-2">
                                <div className="w-16 h-16 bg-primary/10 text-primary rounded-[20px] flex items-center justify-center mx-auto mb-4 border border-primary/20">
                                    <HiOutlineLockClosed size={32} />
                                </div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                    Criar Nova Senha
                                </h2>
                                <p className="text-sm font-medium text-gray-500 leading-relaxed px-4">
                                    Sua nova senha deve ser diferente das anteriores para garantir a segurança da sua conta.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                                {/* CAMPO: NOVA SENHA */}
                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-1.5 ml-1 uppercase tracking-widest">
                                        Nova Senha
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            {...register("novaSenha")}
                                            className={`w-full pl-4 pr-12 py-4 bg-gray-50 border rounded-2xl outline-none text-sm font-medium transition-all ${errors.novaSenha
                                                    ? "border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-50/30"
                                                    : "border-gray-200 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white"
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                                        >
                                            {showPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
                                        </button>
                                    </div>
                                </div>

                                {/* CHECKLIST VISUAL EM TEMPO REAL */}
                                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">
                                        Requisitos da senha:
                                    </p>
                                    <ul className="space-y-2">
                                        {regras.map((regra, index) => (
                                            <li key={index} className="flex items-center gap-2 text-sm font-medium transition-colors duration-300">
                                                {regra.valido ? (
                                                    <HiOutlineCheckCircle className="text-emerald-500 shrink-0" size={18} />
                                                ) : (
                                                    <HiXCircle className="text-gray-300 shrink-0" size={18} />
                                                )}
                                                <span className={regra.valido ? "text-emerald-700" : "text-gray-500"}>
                                                    {regra.label}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* CAMPO: CONFIRMAR SENHA */}
                                <div>
                                    <label className="block text-sm font-black text-gray-700 mb-1.5 ml-1 uppercase tracking-widest">
                                        Confirmar Senha
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            {...register("confirmarSenha")}
                                            className={`w-full pl-4 pr-12 py-4 bg-gray-50 border rounded-2xl outline-none text-sm font-medium transition-all ${errors.confirmarSenha
                                                    ? "border-red-500 focus:ring-4 focus:ring-red-500/10 bg-red-50/30"
                                                    : "border-gray-200 focus:ring-4 focus:ring-primary/10 focus:border-primary focus:bg-white"
                                                }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors focus:outline-none"
                                        >
                                            {showConfirmPassword ? <HiOutlineEyeOff size={20} /> : <HiOutlineEye size={20} />}
                                        </button>
                                    </div>
                                    {errors.confirmarSenha && (
                                        <p className="text-[11px] font-bold text-red-500 ml-2 mt-1.5">
                                            {errors.confirmarSenha.message}
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !regras.every(r => r.valido)}
                                    className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-full shadow-lg shadow-primary/30 text-sm font-black uppercase tracking-widest text-white bg-primary hover:bg-hover-button focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    ) : (
                                        "Redefinir Senha"
                                    )}
                                </button>
                            </form>
                        </div>
                    ) : (
                        /* ETAPA 2: TELA DE SUCESSO */
                        <div className="relative z-10 text-center space-y-6 animate-in zoom-in-95 duration-500 py-6">
                            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-[24px] flex items-center justify-center mx-auto mb-2 border border-emerald-100">
                                <HiOutlineCheckCircle size={40} />
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                Tudo Certo!
                            </h2>
                            <p className="text-sm font-medium text-gray-600 leading-relaxed px-2">
                                Sua senha foi atualizada com sucesso. Agora você já pode acessar a plataforma utilizando suas novas credenciais.
                            </p>

                            <Link
                                href="/entrar"
                                className="w-full inline-flex justify-center items-center gap-2 py-4 px-4 rounded-full shadow-lg text-sm font-black uppercase tracking-widest text-white bg-gray-900 hover:bg-black transition-all active:scale-95 mt-6"
                            >
                                Acessar minha conta <HiOutlineArrowRight size={18} />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}