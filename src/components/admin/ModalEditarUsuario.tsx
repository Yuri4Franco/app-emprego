"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
    HiOutlineX,
    HiOutlineUser,
    HiOutlineShieldCheck,
    HiOutlineSave,
    HiOutlineKey
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
            setNovaSenha(""); // Limpa o campo de senha ao abrir
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
                loading: "Redefinindo senha...",
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
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* MODAL CONTAINER */}
            <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">

                {/* HEADER FIXO */}
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600">
                            <HiOutlineUser size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Editar Usuário</h2>
                            <p className="text-sm text-gray-500 font-medium">ID: #{usuario.id_usuario}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2.5 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        <HiOutlineX size={20} />
                    </button>
                </div>

                {/* BODY SCROLLÁVEL */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1">

                    {/* O form abraça o conteúdo principal, mas os botões de ação ficam no footer */}
                    <form id="form-editar-usuario" onSubmit={handleSubmit(onUpdateInfo)} className="space-y-8">

                        {/* SEÇÃO 1: Dados Básicos */}
                        <section>
                            <h3 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                                Informações Básicas
                            </h3>
                            <div className="space-y-5">
                                <Input
                                    label="Nome Completo"
                                    placeholder="Ex: João da Silva"
                                    {...register("nome")}
                                    error={errors.nome?.message}
                                />
                                <Input
                                    label="E-mail de Acesso"
                                    placeholder="exemplo@empresa.com"
                                    {...register("email")}
                                    error={errors.email?.message}
                                />
                            </div>
                        </section>

                        <div className="h-px w-full bg-gray-100" />

                        {/* SEÇÃO 2: Segurança (Atenção: type="button" no botão de reset para não disparar o form) */}
                        <section>
                            <h3 className="flex items-center gap-2 text-xs font-black text-amber-500 uppercase tracking-widest mb-6">
                                <HiOutlineShieldCheck size={16} /> Segurança e Acesso
                            </h3>

                            <div className="bg-amber-50/50 p-6 rounded-2xl border border-amber-100">
                                <div className="flex gap-3 mb-5">
                                    <div className="mt-0.5 text-amber-600">
                                        <HiOutlineKey size={20} />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-amber-900 mb-1">Redefinição Manual de Senha</h4>
                                        <p className="text-xs text-amber-700/80 leading-relaxed font-medium">
                                            O reset desconectará o usuário imediatamente. Informe esta senha provisória para que ele possa acessar e cadastrar uma nova.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3">
                                    <div className="flex-1">
                                        <Input
                                            label="Nova Senha Provisória"
                                            placeholder="Mínimo 6 caracteres"
                                            type="text"
                                            value={novaSenha}
                                            onChange={(e) => setNovaSenha(e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={handleResetSenha}
                                        disabled={isResetting || novaSenha.length < 6}
                                        className="h-[52px] px-6 bg-amber-600 text-white rounded-xl text-sm font-bold hover:bg-amber-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-amber-600/20 shrink-0"
                                    >
                                        {isResetting ? "Aplicando..." : "Definir Senha"}
                                    </button>
                                </div>
                            </div>
                        </section>
                    </form>
                </div>

                {/* FOOTER FIXO */}
                <div className="px-8 py-5 border-t border-gray-100 bg-gray-50 flex justify-end gap-3 shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-200/50 rounded-xl transition-colors"
                    >
                        Cancelar
                    </button>
                    {/* Botão linkado ao formulário pelo atributo 'form' */}
                    <ButtonType
                        type="submit"
                        form="form-editar-usuario"
                        variant="primary"
                        className="px-8 py-3 flex items-center gap-2 shadow-lg shadow-blue-600/20"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            "Salvando..."
                        ) : (
                            <>
                                <HiOutlineSave size={18} /> Salvar Dados
                            </>
                        )}
                    </ButtonType>
                </div>

            </div>
        </div>
    );
}