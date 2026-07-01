"use client";

import { HiOutlineCalendar, HiOutlineChatAlt2 } from "react-icons/hi";

interface Agendamento {
    id_agendamento: number;
    data_hora: string;
    local_link: string;
    observacoes: string | null;
    vaga_titulo: string;
    empresa_nome: string;
}

interface CompromissosListProps {
    agendamentos: Agendamento[];
}

export function CompromissosList({ agendamentos }: CompromissosListProps) {
    if (agendamentos.length === 0) return null;

    return (
        <div className="space-y-4 animate-in slide-in-from-top-4">
            <h2 className="text-xs md:text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 ml-2">
                <HiOutlineCalendar size={18} className="text-purple-500" /> Próximos Compromissos
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {agendamentos.map((ag) => (
                    <div
                        key={ag.id_agendamento}
                        className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-purple-100 shadow-sm flex flex-col justify-between gap-4 hover:shadow-md transition-shadow bg-gradient-to-r from-purple-50/50 to-white"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 border border-purple-200">
                                <HiOutlineCalendar size={24} />
                            </div>
                            <div className="flex-1 min-w-0 space-y-1">
                                <p className="text-[10px] md:text-xs font-black text-purple-600 uppercase tracking-widest leading-none">
                                    {new Date(ag.data_hora).toLocaleString("pt-BR", {
                                        weekday: "short",
                                        day: "2-digit",
                                        month: "short",
                                    })}{" "}
                                    •{" "}
                                    {new Date(ag.data_hora).toLocaleTimeString("pt-BR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                    })}
                                </p>
                                <h3 className="text-sm md:text-base font-bold text-gray-900 leading-tight truncate">
                                    {ag.vaga_titulo}
                                </h3>
                                <p className="text-xs font-medium text-gray-500 truncate">
                                    {ag.empresa_nome}
                                </p>
                            </div>
                        </div>

                        {/* ✨ EXIBIÇÃO DAS OBSERVAÇÕES DA ENTREVISTA */}
                        {ag.observacoes && (
                            <div className="bg-white p-3.5 rounded-xl border border-purple-100/60 flex items-start gap-2 text-xs text-gray-600 font-medium">
                                <HiOutlineChatAlt2 size={16} className="text-purple-400 shrink-0 mt-0.5" />
                                <div className="space-y-0.5">
                                    <span className="block font-black text-[9px] uppercase tracking-widest text-purple-700">Instruções do Recrutador</span>
                                    <p className="leading-relaxed text-gray-600 italic">"{ag.observacoes}"</p>
                                </div>
                            </div>
                        )}

                        <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-4">
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest hidden sm:block">
                                Localização / Acesso
                            </p>
                            {ag.local_link.startsWith("http") ? (
                                <a
                                    href={ag.local_link}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-[10px] md:text-xs font-black bg-purple-600 text-white px-5 py-2.5 rounded-xl hover:bg-purple-700 transition-colors text-center shadow-sm"
                                >
                                    Acessar Sala Virtual
                                </a>
                            ) : (
                                <p className="text-xs font-bold text-gray-700 truncate max-w-[250px]">
                                    {ag.local_link}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}