"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";
import {
    HiOutlineDocumentText,
    HiOutlineEye,
    HiOutlineStar,
    HiOutlineCalendar,
    HiOutlineSwitchHorizontal,
    HiOutlineClock,
} from "react-icons/hi";
import toast from "react-hot-toast";

interface EventoHistorico {
    id_evento: string;
    tipo: "INSCRICAO" | "VISUALIZACAO" | "MOVIMENTACAO" | "AVALIACAO" | "AGENDAMENTO";
    titulo: string;
    descricao: string;
    data_hora: string;
}

// Configuração visual para cada tipo de evento
const EVENTO_CONFIG: Record<string, { icon: any; colorClass: string; bgIconClass: string }> = {
    INSCRICAO: {
        icon: HiOutlineDocumentText,
        colorClass: "text-blue-600",
        bgIconClass: "bg-blue-100",
    },
    VISUALIZACAO: {
        icon: HiOutlineEye,
        colorClass: "text-purple-600",
        bgIconClass: "bg-purple-100",
    },
    MOVIMENTACAO: {
        icon: HiOutlineSwitchHorizontal,
        colorClass: "text-gray-600",
        bgIconClass: "bg-gray-100",
    },
    AVALIACAO: {
        icon: HiOutlineStar,
        colorClass: "text-amber-600",
        bgIconClass: "bg-amber-100",
    },
    AGENDAMENTO: {
        icon: HiOutlineCalendar,
        colorClass: "text-emerald-600",
        bgIconClass: "bg-emerald-100",
    },
};

export function TimelineCandidatura({ idCandidatura }: { idCandidatura: number }) {
    const [eventos, setEventos] = useState<EventoHistorico[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const carregarHistorico = async () => {
            setIsLoading(true);
            try {
                const response = await api.get(`/empresa/candidaturas/${idCandidatura}/historico`);
                setEventos(response.data.data);
            } catch (error) {
                console.error(error);
                toast.error("Não foi possível carregar o histórico.");
            } finally {
                setIsLoading(false);
            }
        };

        if (idCandidatura) {
            carregarHistorico();
        }
    }, [idCandidatura]);

    // Função para deixar a data mais amigável
    const formatarData = (dataIso: string) => {
        const data = new Date(dataIso);
        const hoje = new Date();
        const ontem = new Date(hoje);
        ontem.setDate(ontem.getDate() - 1);

        const hora = data.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

        if (data.toDateString() === hoje.toDateString()) {
            return `Hoje às ${hora}`;
        } else if (data.toDateString() === ontem.toDateString()) {
            return `Ontem às ${hora}`;
        } else {
            return `${data.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} às ${hora}`;
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-10 space-y-3 opacity-50">
                <HiOutlineClock size={32} className="animate-spin text-gray-400" />
                <p className="text-sm font-bold text-gray-500">Lendo dossiê do candidato...</p>
            </div>
        );
    }

    if (eventos.length === 0) {
        return (
            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500 font-medium">Nenhum histórico encontrado.</p>
            </div>
        );
    }

    return (
        <div className="relative border-l-2 border-gray-100 ml-4 py-4 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            {eventos.map((evento, index) => {
                const config = EVENTO_CONFIG[evento.tipo] || EVENTO_CONFIG.MOVIMENTACAO;
                const Icone = config.icon;

                // Verifica se é o último item (para não ficar uma linha sobrando embaixo)
                const isUltimo = index === eventos.length - 1;

                return (
                    <div key={evento.id_evento} className="relative flex items-start group">
                        {/* Ícone Redondo Flutuante sobre a Linha */}
                        <div className={`absolute -left-[21px] w-10 h-10 rounded-full flex items-center justify-center border-4 border-white ${config.bgIconClass} ${config.colorClass} shadow-sm group-hover:scale-110 transition-transform`}>
                            <Icone size={18} />
                        </div>

                        {/* Conteúdo do Evento */}
                        <div className="ml-10 w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group-hover:border-blue-100">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                                <h4 className="text-sm font-black text-gray-800 tracking-tight">
                                    {evento.titulo}
                                </h4>
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">
                                    {formatarData(evento.data_hora)}
                                </span>
                            </div>
                            <p className="text-xs font-medium text-gray-500 leading-relaxed">
                                {evento.descricao}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}