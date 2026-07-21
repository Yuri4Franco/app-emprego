"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";
import {
    HiOutlineX,
    HiOutlineOfficeBuilding,
    HiOutlineCalendar,
    HiOutlineClipboardList,
    HiOutlineCheckCircle,
} from "react-icons/hi";

interface ModalVagasAtivasProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ModalVagasAtivas({ isOpen, onClose }: ModalVagasAtivasProps) {
    const [vagas, setVagas] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            const fetchVagas = async () => {
                setIsLoading(true);
                try {
                    const res = await api.get("/admin/metricas/vagas-ativas");
                    setVagas(res.data.data || res.data || []);
                } catch (error) {
                    console.error("Erro ao carregar o extrato de vagas ativas", error);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchVagas();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-gray-50 rounded-[32px] w-full max-w-3xl shadow-2xl flex flex-col max-h-[85vh] animate-in zoom-in-95 overflow-hidden border border-gray-200">

                {/* HEADER DO MODAL */}
                <div className="p-6 border-b border-gray-200 bg-white shrink-0 flex justify-between items-center relative overflow-hidden">
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0 border border-emerald-100">
                            <HiOutlineClipboardList size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">
                                Extrato de Vagas Ativas
                            </h2>
                            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mt-0.5">
                                {vagas.length} Oportunidade(s) Pública(s)
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 bg-gray-50 border border-gray-100 rounded-full text-gray-400 hover:text-gray-600 transition-colors relative z-10"
                    >
                        <HiOutlineX size={20} />
                    </button>
                </div>

                {/* CORPO / LISTAGEM (ESTILO EXTRATO) */}
                <div className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-40 text-gray-400 gap-3">
                            <div className="w-8 h-8 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin"></div>
                            <p className="font-bold text-xs uppercase tracking-widest">Processando extrato...</p>
                        </div>
                    ) : vagas.length === 0 ? (
                        <div className="text-center p-8 bg-white border border-dashed border-gray-200 rounded-[20px]">
                            <p className="text-gray-500 font-bold text-sm">Não há vagas ativas na plataforma no momento.</p>
                        </div>
                    ) : (
                        <div className="bg-white border border-gray-200 rounded-[24px] overflow-hidden shadow-sm">

                            {/* CABEÇALHO DA TABELA/LISTA */}
                            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50/80 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                <div className="col-span-7">Vaga & Empresa</div>
                                <div className="col-span-5 text-right">Encerramento</div>
                            </div>

                            {/* ITENS DO EXTRATO */}
                            <div className="divide-y divide-gray-100">
                                {vagas.map((vaga) => {
                                    const isEncerrandoBreve = vaga.data_fechamento && new Date(vaga.data_fechamento).getTime() < new Date().getTime() + (7 * 24 * 60 * 60 * 1000);

                                    return (
                                        <div
                                            key={vaga.id_vaga}
                                            className="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 px-5 md:px-6 py-4 hover:bg-emerald-50/30 transition-colors items-center group"
                                        >
                                            {/* Vaga Info */}
                                            <div className="col-span-7 flex items-center gap-3.5 min-w-0">
                                                <div className="w-8 h-8 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center shrink-0 border border-emerald-100 group-hover:scale-110 transition-transform">
                                                    <HiOutlineCheckCircle size={18} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-gray-900 text-sm truncate" title={vaga.titulo}>
                                                        {vaga.titulo}
                                                    </h3>
                                                    <p className="text-xs font-medium text-gray-500 flex items-center gap-1 mt-0.5 truncate">
                                                        <HiOutlineOfficeBuilding size={12} className="shrink-0" /> {vaga.empresa}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Data Info */}
                                            <div className="col-span-5 flex items-center md:justify-end gap-2 text-xs md:pl-0 pl-[46px]">
                                                <HiOutlineCalendar size={14} className={isEncerrandoBreve ? "text-red-400" : "text-gray-400"} />
                                                {vaga.data_fechamento ? (
                                                    <span className={`font-bold ${isEncerrandoBreve ? "text-red-600 bg-red-50 px-2 py-0.5 rounded-md border border-red-100" : "text-gray-600"}`}>
                                                        {new Date(vaga.data_fechamento).toLocaleDateString("pt-BR")}
                                                    </span>
                                                ) : (
                                                    <span className="font-medium text-gray-400 italic">
                                                        Prazo indeterminado
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* FOOTER */}
                <div className="p-4 border-t border-gray-200 bg-white shrink-0 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-bold rounded-xl transition-colors"
                    >
                        Fechar Extrato
                    </button>
                </div>

            </div>
        </div>
    );
}