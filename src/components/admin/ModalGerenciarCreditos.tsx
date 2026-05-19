"use client";

import { useState } from "react";
import { HiOutlineBadgeCheck, HiOutlineX, HiOutlineTicket } from "react-icons/hi";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    idEmpresa: number;
    onSuccess: () => void;
}

export function ModalGerenciarCreditos({ isOpen, onClose, idEmpresa, onSuccess }: ModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [curriculos, setCurriculos] = useState<number>(0);

    if (!isOpen) return null;

    const handleConfirmar = async () => {
        if (curriculos <= 0) {
            return toast.error("Informe um valor maior que zero para adicionar.");
        }

        setIsLoading(true);

        const payload = {
            creditos_vagas: 0, // Removido da interface, mas mantido como 0 para o backend
            creditos_curriculos: curriculos,
            modo: "SOMAR"
        };

        await toast.promise(
            api.patch(`/admin/empresas/${idEmpresa}/creditos`, payload),
            {
                loading: "Processando nova carga de créditos...",
                success: () => {
                    setCurriculos(0);
                    onSuccess();
                    onClose();
                    return "Créditos adicionados com sucesso!";
                },
                error: (err) => err.response?.data?.error || "Erro ao atualizar créditos.",
            }
        );
        setIsLoading(false);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                {/* Header Estilizado */}
                <div className="px-8 pt-8 pb-4 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                            <HiOutlineBadgeCheck size={24} />
                        </div>
                        <h2 className="text-lg font-black text-gray-900">Adicionar Créditos</h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
                        <HiOutlineX size={20} />
                    </button>
                </div>

                <div className="px-8 pb-8 space-y-6">
                    <p className="text-sm text-gray-500 font-medium">
                        Adicione novos créditos de currículos ao saldo da empresa.
                    </p>

                    <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-3xl space-y-4">
                        <div className="flex items-center gap-2 text-emerald-800 font-black text-xs uppercase tracking-widest mb-2">
                            <HiOutlineTicket size={16} /> Quantidade
                        </div>

                        <div className="relative">
                            <input
                                type="number"
                                min="0"
                                value={curriculos}
                                onChange={(e) => setCurriculos(Number(e.target.value))}
                                className="w-full text-4xl font-black text-gray-900 bg-transparent border-none outline-none text-center p-0 placeholder:text-gray-300"
                                placeholder="0"
                            />
                            <p className="text-center text-xs font-bold text-emerald-600 mt-2">currículos desbloqueáveis</p>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <ButtonType
                            onClick={handleConfirmar}
                            variant="primary"
                            disabled={isLoading || curriculos <= 0}
                            className="w-full py-4 shadow-lg shadow-blue-500/20 font-black"
                        >
                            {isLoading ? "Processando..." : "Confirmar Adição"}
                        </ButtonType>
                        <button
                            onClick={onClose}
                            className="w-full text-sm font-bold text-gray-400 hover:text-gray-600 transition-all py-2"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}