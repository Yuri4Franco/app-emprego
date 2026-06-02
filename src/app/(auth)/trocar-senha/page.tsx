"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";
import { useAuth } from "@/src/AuthContext";
import { HiOutlineLockClosed, HiOutlineShieldCheck } from "react-icons/hi";
import { useRouter } from "next/navigation";
import Link from "next/link";

// 1. Definição do Schema com a Regra dos Termos
const trocarSenhaSchema = z.object({
    nova_senha: z
        .string()
        .min(8, "A senha deve ter no mínimo 8 caracteres")
        .regex(/[A-Z]/, "Deve conter ao menos uma letra maiúscula")
        .regex(/[0-9]/, "Deve conter ao menos um número")
        .regex(/[^a-zA-Z0-9]/, "Deve conter ao menos um caractere especial"),
    confirmar_senha: z.string(),
    termos: z.boolean().refine((val) => val === true, {
        message: "Você precisa aceitar os Termos de Uso e a Política de Privacidade.",
    }),
}).refine((data) => data.nova_senha === data.confirmar_senha, {
    message: "As senhas não coincidem",
    path: ["confirmar_senha"],
});

type TrocarSenhaFormData = z.infer<typeof trocarSenhaSchema>;

export default function TrocarSenhaPage() {
    const { user, logout, isLoading } = useAuth();
    const router = useRouter();

    const { register, handleSubmit, formState: { errors } } = useForm<TrocarSenhaFormData>({
        resolver: zodResolver(trocarSenhaSchema)
    });

    if (isLoading) return null;
    if (!user) return null;

    const onSubmit = async (data: TrocarSenhaFormData) => {
        await toast.promise(
            api.patch(`/user/definir-senha-inicial`, { nova_senha: data.nova_senha }),
            {
                loading: "Salvando sua nova senha...",
                success: () => {
                    // Verifica o perfil do usuário atual antes de deslogar
                    // Ajuste "tipo" para a propriedade exata que vem da sua API (ex: user.role, user.perfil)
                    const isEmpresa = user.role === "EMPRESA";

                    logout();

                    // Redireciona de forma inteligente
                    router.push(isEmpresa ? "/entrar-empresa" : "/entrar");

                    return "Senha definida! Entre agora com sua nova credencial.";
                },
                error: (err) => err.response?.data?.error || "Erro ao definir senha."
            }
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white p-10 rounded-[40px] shadow-2xl w-full max-w-md border border-gray-100 animate-in fade-in zoom-in-95 duration-300">

                <div className="text-center mb-8">
                    <div className="bg-blue-50 text-blue-600 w-20 h-20 rounded-[28px] flex items-center justify-center mx-auto mb-6 shadow-sm">
                        <HiOutlineShieldCheck size={40} />
                    </div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">Senha Forte</h2>
                    <p className="text-gray-500 text-sm mt-2 leading-relaxed">
                        Para garantir a segurança da conta na <strong>ACI Empregos</strong>, crie uma senha que siga os requisitos abaixo.
                    </p>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="space-y-5">
                        <Input
                            label="Nova Senha"
                            type="password"
                            placeholder="Crie sua nova senha"
                            {...register("nova_senha")}
                            error={errors.nova_senha?.message}
                        />

                        {/* Pequeno guia visual para o usuário */}
                        {!errors.nova_senha && (
                            <div className="px-2 space-y-1">
                                <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">Requisitos:</p>
                                <p className="text-[11px] text-gray-500 flex items-center gap-1 italic">
                                    • Mín. 8 caracteres, maiúscula, número e símbolo.
                                </p>
                            </div>
                        )}

                        <Input
                            label="Confirmar Senha"
                            type="password"
                            placeholder="Repita a senha"
                            {...register("confirmar_senha")}
                            error={errors.confirmar_senha?.message}
                        />

                        {/* --- CHECKBOX DE TERMOS E POLÍTICA --- */}
                        <div className="pt-2">
                            <label className="flex items-start gap-3 cursor-pointer group">
                                <div className="flex items-center h-5">
                                    <input
                                        type="checkbox"
                                        {...register("termos")}
                                        className="w-4 h-4 border border-gray-300 rounded text-blue-600 focus:ring-blue-500 bg-gray-50"
                                    />
                                </div>
                                <span className="text-xs text-gray-600 leading-relaxed">
                                    Eu concordo com os{" "}
                                    <Link href="/termos" target="_blank" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                        Termos de Uso
                                    </Link>{" "}
                                    e a{" "}
                                    <Link href="/privacidade" target="_blank" className="font-bold text-blue-600 hover:text-blue-800 transition-colors">
                                        Política de Privacidade
                                    </Link>{" "}
                                    da plataforma.
                                </span>
                            </label>
                            {errors.termos && (
                                <p className="text-red-500 text-xs font-bold mt-2 ml-7">
                                    {errors.termos.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <ButtonType
                        type="submit"
                        className="w-full py-4.5 shadow-xl shadow-blue-100 flex items-center justify-center gap-2 text-base font-bold"
                    >
                        <HiOutlineLockClosed size={20} /> Definir Nova Senha
                    </ButtonType>
                </form>
            </div>
        </div>
    );
}