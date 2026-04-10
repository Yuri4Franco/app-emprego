"use client";

import { useState, useEffect } from "react";
import { HiOutlineExclamation, HiOutlineX } from "react-icons/hi";
import { ButtonType } from "@/src/components/ButtonType";

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading: boolean;
    tipo: "ATIVAR" | "DESATIVAR";
}

export function ModalConfirmarStatusEmpresa({ isOpen, onClose, onConfirm, isLoading, tipo }: ModalProps) {
    const [timer, setTimer] = useState(5);
    const isDesativar = tipo === "DESATIVAR";

    useEffect(() => {
        if (isOpen && isDesativar) {
            setTimer(5);
            const interval = setInterval(() => {
                setTimer((prev) => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [isOpen, isDesativar]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4">
            <div className="bg-white w-full max-w-md rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">

                <div className="p-8 text-center">
                    {/* Ícone de Alerta */}
                    <div className={`mx-auto w-16 h-16 rounded-2xl flex items-center justify-center mb-6 ${isDesativar ? "bg-red-50 text-red-600" : "bg-emerald-50 text-emerald-600"
                        }`}>
                        <HiOutlineExclamation size={32} />
                    </div>

                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {isDesativar ? "Desativar Empresa?" : "Reativar Empresa?"}
                    </h2>

                    <p className="text-sm text-gray-500 leading-relaxed mb-8">
                        {isDesativar
                            ? "Atenção: Todos os usuários vinculados serão BLOQUEADOS e as vagas ativas serão PAUSADAS imediatamente."
                            : "Isso restaurará o acesso dos usuários e permitirá que as vagas sejam reativadas."}
                    </p>

                    <div className="flex flex-col gap-3">
                        <ButtonType
                            onClick={onConfirm}
                            disabled={isLoading || (isDesativar && timer > 0)}
                            variant={isDesativar ? "danger" : "primary"}
                            className="w-full py-4 flex items-center justify-center gap-2"
                        >
                            {isLoading ? "Processando..." : (
                                isDesativar && timer > 0
                                    ? `Aguarde (${timer}s)`
                                    : "Sim, confirmar"
                            )}
                        </ButtonType>

                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="text-sm font-bold text-gray-400 hover:text-gray-600 transition-all py-2"
                        >
                            Não, cancelar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}