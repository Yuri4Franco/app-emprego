"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    HiOutlineX,
    HiOutlineUser,
    HiOutlineMail,
    HiOutlineShieldCheck,
    HiOutlineSave
} from "react-icons/hi";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";

const editarUsuarioSchema = z.object({
    nome: z.string().min(3, "Mínimo 3 caracteres"),
    email: z.string().email("E-mail inválido"),
});

type EditarUsuarioFormData = z.infer<typeof editarUsuarioSchema>;

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    usuario: any;
    onSuccess: () => void;
}

export function ModalEditarUsuario({ isOpen, onClose, usuario, onSuccess }: ModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [novaSenha, setNovaSenha] = useState("");

    const { register, handleSubmit, formState: { errors }, reset } = useForm<EditarUsuarioFormData>({
        resolver: zodResolver(editarUsuarioSchema),
    });

    useEffect(() => {
        if (usuario) {
            reset({
                nome: usuario.nome,
                email: usuario.email,
            });
        }
    }, [usuario, reset, isOpen]);

    if (!isOpen || !usuario) return null;

    const onUpdateInfo = async (data: EditarUsuarioFormData) => {
        setIsLoading(true);
        await toast.promise(
            api.put(`/admin/usuarios/${usuario.id_usuario}`, data),
            {
                loading: "Salvando alterações...",
                success: () => {
                    onSuccess();
                    onClose();
                    return "Dados atualizados!";
                },
                error: (err) => err.response?.data?.error || "Erro ao atualizar.",
            }
        );
        setIsLoading(false);
    };

    const handleResetSenha = async () => {
        if (!novaSenha || novaSenha.length < 6) {
            return toast.error("Digite uma senha válida (mín. 6 caracteres)");
        }

        setIsResetting(true);
        await toast.promise(
            api.patch(`/admin/usuarios/${usuario.id_usuario}/reset-senha`, { novaSenha }),
            {
                loading: "Resetando senha...",
                success: () => {
                    setNovaSenha("");
                    return "Senha alterada com sucesso!";
                },
                error: (err) => err.response?.data?.error || "Erro ao resetar senha.",
            }
        );
        setIsResetting(false);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4">
            {/* Modal Container: Adicionei flex-col e max-h */}
            <div className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">

                {/* Header: Fixo no topo */}
                <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Gerenciar Usuário</h2>
                        <p className="text-xs text-gray-400 font-medium">ID: #{usuario.id_usuario}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <HiOutlineX size={20} />
                    </button>
                </div>

                {/* Body: Com scroll interno para não "comer" conteúdo em telas pequenas */}
                <div className="p-8 space-y-8 overflow-y-auto custom-scrollbar">

                    {/* Seção 1: Dados Básicos */}
                    <section className="space-y-6">
                        <div className="flex items-center gap-2 text-blue-600 font-bold text-[10px] uppercase tracking-[0.2em]">
                            <HiOutlineUser size={14} /> Informações Básicas
                        </div>
                        <form onSubmit={handleSubmit(onUpdateInfo)} className="space-y-6">
                            <div className="grid grid-cols-1 gap-5">
                                <Input label="Nome Completo" placeholder="Nome do colaborador" {...register("nome")} error={errors.nome?.message} />
                                <Input label="E-mail de Acesso" placeholder="email@empresa.com" {...register("email")} error={errors.email?.message} />
                            </div>
                            <ButtonType type="submit" variant="primary" className="w-full flex items-center justify-center gap-2 py-3.5 shadow-lg shadow-blue-100" disabled={isLoading}>
                                <HiOutlineSave size={18} /> Salvar Dados
                            </ButtonType>
                        </form>
                    </section>

                    <div className="h-px bg-gray-100 w-full" />

                    {/* Seção 2: Segurança */}
                    <section className="space-y-6 pb-2">
                        <div className="flex items-center gap-2 text-amber-600 font-bold text-[10px] uppercase tracking-[0.2em]">
                            <HiOutlineShieldCheck size={14} /> Segurança e Acesso
                        </div>
                        <div className="bg-amber-50/40 p-6 rounded-[24px] border border-amber-100/50 space-y-5">
                            <p className="text-[11px] text-amber-700 font-semibold leading-relaxed">
                                O reset forçará a desconexão do usuário. Ele precisará definir uma nova senha permanente no próximo acesso.
                            </p>

                            {/* Alinhamento de Reset: items-end para alinhar o botão com o box do input */}
                            <div className="flex items-end gap-3">
                                <div className="flex-1">
                                    <Input
                                        label="Nova Senha Provisória"
                                        placeholder="Mín. 6 caracteres"
                                        type="text"
                                        value={novaSenha}
                                        onChange={(e) => setNovaSenha(e.target.value)}
                                    />
                                </div>
                                <button
                                    onClick={handleResetSenha}
                                    disabled={isResetting}
                                    className="h-[46px] px-6 bg-amber-600 text-white rounded-xl text-xs font-bold hover:bg-amber-700 transition-all disabled:opacity-50 shadow-md shadow-amber-200/50 mb-[2px]"
                                >
                                    {isResetting ? "..." : "Resetar"}
                                </button>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}