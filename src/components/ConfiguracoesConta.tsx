"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import { useAuth } from "@/src/AuthContext";
import {
    HiOutlineLockClosed,
    HiOutlineExclamation,
    HiOutlineTrash,
    HiOutlineX,
} from "react-icons/hi";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";

// ==========================================
// SCHEMAS DE VALIDAÇÃO (ZOD)
// ==========================================

const trocarSenhaSchema = z
    .object({
        senha_atual: z.string().min(1, "A senha atual é obrigatória"),
        nova_senha: z.string().min(6, "A nova senha deve ter no mínimo 6 caracteres"),
        confirmar_senha: z.string().min(1, "Confirme a nova senha"),
    })
    .refine((data) => data.nova_senha === data.confirmar_senha, {
        message: "As senhas não coincidem",
        path: ["confirmar_senha"],
    });

type TrocarSenhaData = z.infer<typeof trocarSenhaSchema>;

export default function ConfiguracoesConta() {
    const { user, logout } = useAuth();

    // Estados Troca de Senha
    const [isSavingSenha, setIsSavingSenha] = useState(false);

    // Estados Exclusão de Conta
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [deleteSenha, setDeleteSenha] = useState("");
    const [isAwareChecked, setIsAwareChecked] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [countdown, setCountdown] = useState(15);

    // ==========================================
    // LÓGICA: TROCAR SENHA
    // ==========================================
    const {
        register: registerSenha,
        handleSubmit: handleSubmitSenha,
        reset: resetSenha,
        formState: { errors: errorsSenha },
    } = useForm<TrocarSenhaData>({
        resolver: zodResolver(trocarSenhaSchema),
    });

    const onSubmitSenha = async (data: TrocarSenhaData) => {
        setIsSavingSenha(true);
        try {
            await api.patch("/user/trocar-senha", {
                senha_atual: data.senha_atual,
                nova_senha: data.nova_senha,
            });
            toast.success("Senha alterada com sucesso!");
            resetSenha();
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao alterar senha.");
        } finally {
            setIsSavingSenha(false);
        }
    };

    // ==========================================
    // LÓGICA: EXCLUSÃO DE CONTA (COUNTDOWN)
    // ==========================================
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isDeleteModalOpen && countdown > 0) {
            timer = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [isDeleteModalOpen, countdown]);

    const abrirModalExclusao = () => {
        setCountdown(15);
        setIsAwareChecked(false);
        setDeleteSenha("");
        setIsDeleteModalOpen(true);
    };

    const fecharModalExclusao = () => {
        setIsDeleteModalOpen(false);
        setDeleteSenha("");
        setIsAwareChecked(false);
    };

    const handleExcluirConta = async () => {
        if (!deleteSenha) {
            toast.error("Digite sua senha para confirmar.");
            return;
        }

        setIsDeleting(true);
        try {
            // O axios.delete usa 'data' para passar o body
            await api.delete("/usuario/conta", {
                data: { senha: deleteSenha }
            });

            toast.success("Sua conta foi excluída permanentemente.");
            // Força o logout e joga pro login
            setTimeout(() => logout(), 1500);
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Senha incorreta ou erro ao excluir.");
            setIsDeleting(false);
        }
    };

    const podeExcluir = countdown === 0 && isAwareChecked && deleteSenha.length > 0;

    return (
        <div className="max-w-4xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-700">

            {/* HEADER */}
            <header className="mb-10 space-y-2">
                <h1 className="text-3xl font-black text-gray-800 tracking-tight">
                    Configurações da Conta
                </h1>
                <p className="text-gray-500 text-sm font-medium">
                    Gerencie a segurança e o acesso do seu perfil.
                </p>
            </header>

            {/* BLOCO 1: ALTERAR SENHA (GLOBAL) */}
            <div className="bg-white p-6 md:p-10 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
                <div className="flex items-center gap-3 border-b border-gray-50 pb-4">
                    <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                        <HiOutlineLockClosed size={20} />
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-gray-800">Segurança</h2>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-0.5">Alterar Senha</p>
                    </div>
                </div>

                <form onSubmit={handleSubmitSenha(onSubmitSenha)} className="space-y-6 max-w-xl">
                    <Input
                        label="Senha Atual"
                        type="password"
                        placeholder="Digite sua senha atual"
                        {...registerSenha("senha_atual")}
                        error={errorsSenha.senha_atual?.message}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Nova Senha"
                            type="password"
                            placeholder="No mínimo 6 caracteres"
                            {...registerSenha("nova_senha")}
                            error={errorsSenha.nova_senha?.message}
                        />
                        <Input
                            label="Confirmar Nova Senha"
                            type="password"
                            placeholder="Repita a nova senha"
                            {...registerSenha("confirmar_senha")}
                            error={errorsSenha.confirmar_senha?.message}
                        />
                    </div>

                    <div className="pt-2">
                        <ButtonType
                            type="submit"
                            disabled={isSavingSenha}
                            className="w-full sm:w-auto px-8 py-3.5 rounded-full font-bold shadow-md shadow-blue-100 flex justify-center"
                        >
                            {isSavingSenha ? "Salvando..." : "Atualizar Senha"}
                        </ButtonType>
                    </div>
                </form>
            </div>

            {/* BLOCO 2: ZONA DE PERIGO (APENAS CANDIDATO) */}
            {user?.role === "CANDIDATO" && (
                <div className="bg-white p-6 md:p-10 rounded-[32px] border border-red-100 shadow-sm space-y-6 mt-8">
                    <div className="flex items-center gap-3 border-b border-red-50 pb-4">
                        <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                            <HiOutlineTrash size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-red-600">Zona de Risco</h2>
                            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mt-0.5">Exclusão de Conta</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 font-medium leading-relaxed max-w-2xl">
                            Ao excluir sua conta, o seu currículo, histórico de candidaturas e todas as informações atreladas ao seu perfil serão removidas permanentemente do Banco de Talentos.
                        </p>
                        <button
                            onClick={abrirModalExclusao}
                            className="px-6 py-3 border-2 border-red-100 text-red-600 font-bold text-sm rounded-full hover:bg-red-50 hover:border-red-200 transition-colors"
                        >
                            Excluir minha conta
                        </button>
                    </div>
                </div>
            )}

            {/* ========================================== */}
            {/* MODAL DE EXCLUSÃO (OVERLAY)                  */}
            {/* ========================================== */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in">

                    <div className="bg-white w-full max-w-lg rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95">
                        {/* Header do Modal */}
                        <div className="bg-red-50 p-6 flex items-start justify-between border-b border-red-100">
                            <div className="flex gap-4">
                                <div className="w-12 h-12 bg-white text-red-600 rounded-full flex items-center justify-center shadow-sm shrink-0">
                                    <HiOutlineExclamation size={28} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-red-800 leading-tight">Exclusão Definitiva</h3>
                                    <p className="text-xs font-bold text-red-500 uppercase tracking-widest mt-1">Ação Irreversível</p>
                                </div>
                            </div>
                            <button onClick={fecharModalExclusao} className="p-2 bg-white/50 hover:bg-white text-red-400 hover:text-red-600 rounded-full transition-colors">
                                <HiOutlineX size={20} />
                            </button>
                        </div>

                        {/* Corpo do Modal */}
                        <div className="p-8 space-y-6">
                            <p className="text-sm text-gray-600 font-medium leading-relaxed">
                                Você está prestes a apagar todos os seus dados. Essa ação <strong>não poderá ser desfeita</strong> e você perderá o acesso às suas candidaturas em andamento.
                            </p>

                            <div className="space-y-4">
                                <label className="flex items-start gap-3 cursor-pointer p-4 bg-gray-50 border border-gray-200 rounded-[20px] group">
                                    <input
                                        type="checkbox"
                                        checked={isAwareChecked}
                                        onChange={(e) => setIsAwareChecked(e.target.checked)}
                                        className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500 mt-0.5"
                                    />
                                    <span className="text-sm font-bold text-gray-700 group-hover:text-red-700 transition-colors">
                                        Estou ciente de que todos os meus dados serão apagados e jamais recuperados.
                                    </span>
                                </label>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 ml-1">
                                        Confirme sua senha para continuar:
                                    </label>
                                    <input
                                        type="password"
                                        placeholder="Sua senha atual"
                                        value={deleteSenha}
                                        onChange={(e) => setDeleteSenha(e.target.value)}
                                        className="w-full p-4 rounded-[20px] bg-gray-50 border border-gray-200 outline-none text-sm focus:border-red-400 focus:bg-white transition-colors"
                                    />
                                </div>
                            </div>

                            {/* Botão com Countdown */}
                            <div className="pt-2">
                                <button
                                    onClick={handleExcluirConta}
                                    disabled={!podeExcluir || isDeleting}
                                    className={`w-full py-4 rounded-[24px] font-black text-sm uppercase tracking-wider transition-all duration-300
                    ${podeExcluir
                                            ? "bg-red-600 text-white hover:bg-red-700 shadow-lg shadow-red-200"
                                            : "bg-gray-100 text-gray-400 cursor-not-allowed"
                                        }
                  `}
                                >
                                    {isDeleting ? (
                                        "Excluindo dados..."
                                    ) : countdown > 0 ? (
                                        `Aguarde ${countdown}s para excluir`
                                    ) : (
                                        "Sim, quero excluir minha conta"
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            )}

        </div>
    );
}