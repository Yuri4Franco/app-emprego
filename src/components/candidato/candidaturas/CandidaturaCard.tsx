"use client";

import { HiOutlineOfficeBuilding, HiOutlineLocationMarker, HiOutlineClock, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineChatAlt2 } from "react-icons/hi";

interface EtapaProcesso {
    id_etapa: number;
    nome_etapa: string;
    ordem: number;
}

interface CandidaturaCardProps {
    cand: any;
    isCanceling: boolean;
    onDesistir: (id: number) => void;
}

export function CandidaturaCard({ cand, isCanceling, onDesistir }: CandidaturaCardProps) {
    const isEncerrado = ["REPROVADO", "DESISTENCIA"].includes(cand.status);
    const isAprovado = cand.status === "APROVADO";

    // Identifica as etapas do processo dinâmico da vaga
    const etapasvaga: EtapaProcesso[] = cand.vaga?.etapas_processo || [];

    // Encontra o index sequencial da etapa que o candidato se encontra no momento
    const indexEtapaCandidato = etapasvaga.findIndex(
        (e) => e.id_etapa === cand.etapa_atual?.id_etapa
    );

    const ultimaMovimentacao = cand.movimentacoes?.length > 0 ? cand.movimentacoes[cand.movimentacoes.length - 1] : null;
    const dataUltimaAtt = ultimaMovimentacao ? ultimaMovimentacao.criado_em : cand.data_inscricao;

    return (
        <div className={`bg-white p-5 md:p-8 rounded-[24px] md:rounded-[32px] border ${isEncerrado ? "border-gray-100 opacity-85" : isAprovado ? "border-emerald-200 bg-emerald-50/10 shadow-sm" : "border-gray-100 shadow-sm hover:shadow-md transition-shadow"} flex flex-col gap-6`}>

            {/* TOPO */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div className="flex items-start gap-4">
                    {cand.vaga.empresa_logo ? (
                        <img src={cand.vaga.empresa_logo} alt={cand.vaga.empresa_nome} className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover border border-gray-100 shrink-0 ${isEncerrado ? "grayscale" : ""}`} />
                    ) : (
                        <div className="w-12 h-12 md:w-14 md:h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center border border-gray-100 shrink-0">
                            <HiOutlineOfficeBuilding size={24} />
                        </div>
                    )}
                    <div className="space-y-1">
                        <h3 className="text-base md:text-lg font-black text-gray-900 leading-tight">{cand.vaga.titulo}</h3>
                        <p className="text-xs md:text-sm font-bold text-gray-500">{cand.vaga.empresa_nome}</p>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                                <HiOutlineLocationMarker size={12} /> {cand.vaga.localizacao}
                            </span>
                            {/* ✨ Ajuste do Replace AQUI ✨ */}
                            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 px-2.5 py-1 rounded-md">
                                {cand.vaga.tipo_contrato?.replace(/_/g, ' ')}
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-left md:text-right pl-16 md:pl-0">
                    <p className="text-[9px] md:text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1 md:justify-end">
                        <HiOutlineClock size={12} /> Atualizado em {new Date(dataUltimaAtt).toLocaleDateString("pt-BR")}
                    </p>
                </div>
            </div>

            {/* ✨ MEIO: STEPPER DO PROCESSO SELETIVO DINÂMICO */}
            <div className="py-2 md:px-2">
                <div className="flex flex-col md:flex-row w-full justify-between gap-y-4 md:gap-y-0">
                    {etapasvaga.map((etapa, index) => {
                        const executada = index < indexEtapaCandidato;
                        const atual = index === indexEtapaCandidato;
                        const isFirst = index === 0;
                        const isLast = index === etapasvaga.length - 1;

                        let dotStyle = "bg-white border-2 border-gray-200 text-gray-300";
                        let textStyle = "text-gray-400";
                        let lineStyle = "bg-gray-100";

                        if (executada) {
                            dotStyle = isEncerrado ? "bg-gray-300 border-gray-300 text-white" : "bg-blue-500 border-blue-500 text-white";
                            textStyle = "text-gray-600 font-bold";
                            lineStyle = isEncerrado ? "bg-gray-200" : "bg-blue-500";
                        } else if (atual) {
                            textStyle = isAprovado ? "text-emerald-600 font-black" : isEncerrado ? "text-red-500 font-black" : "text-blue-600 font-black";
                            dotStyle = isAprovado
                                ? "bg-emerald-500 text-white border-4 border-emerald-100 scale-110 shadow-sm"
                                : isEncerrado
                                    ? "bg-red-500 text-white border-4 border-red-100 scale-110 shadow-sm"
                                    : "bg-white text-blue-600 border-4 border-blue-500 scale-110 shadow-sm";
                        }

                        return (
                            <div key={etapa.id_etapa} className="relative flex flex-row md:flex-col items-stretch md:items-center md:flex-1">
                                {/* Conector Horizontal (Desktop) */}
                                {!isFirst && (
                                    <div className={`hidden md:block absolute top-[9px] right-1/2 w-full h-[2.5px] -z-10 ${lineStyle}`} />
                                )}

                                {/* Bolinha e Conector Mobile */}
                                <div className="flex flex-col items-center shrink-0">
                                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300 ${dotStyle}`}>
                                        {executada && <HiOutlineCheckCircle size={13} />}
                                        {atual && isEncerrado && <HiOutlineXCircle size={13} />}
                                        {atual && !isEncerrado && !isAprovado && <div className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-pulse" />}
                                    </div>
                                    {!isLast && (
                                        <div className={`w-[2px] flex-1 my-1 md:hidden ${executada || (atual && !isEncerrado) ? "bg-blue-500" : "bg-gray-100"}`} />
                                    )}
                                </div>

                                {/* Nome da Etapa */}
                                <div className="ml-4 md:ml-0 md:mt-2.5 pb-4 md:pb-0 flex-1 md:w-full flex items-start md:justify-center">
                                    <span className={`text-[10px] uppercase tracking-wider text-left md:text-center leading-tight ${textStyle}`}>
                                        {etapa.nome_etapa}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* RODAPÉ */}
            <div className="pt-4 border-t border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1">
                    {cand.feedback_reprovacao ? (
                        <div className="flex items-start gap-3 bg-red-50/40 p-4 rounded-xl border border-red-100">
                            <HiOutlineChatAlt2 size={18} className="text-red-400 shrink-0 mt-0.5" />
                            <div>
                                <span className="block font-black text-[9px] uppercase tracking-widest text-red-800 mb-0.5">Feedback de Encerramento</span>
                                <p className="text-xs md:text-sm font-medium text-red-900 leading-relaxed italic">"{cand.feedback_reprovacao}"</p>
                            </div>
                        </div>
                    ) : isAprovado ? (
                        <div className="flex items-center gap-2 bg-emerald-50 text-emerald-800 p-3.5 rounded-xl border border-emerald-100 text-xs md:text-sm font-bold">
                            <span>🎉</span> Parabéns! Seu perfil foi selecionado para a vaga. O RH fará contato para alinhar a contratação.
                        </div>
                    ) : !isEncerrado ? (
                        <p className="text-xs text-gray-500 font-medium bg-gray-50/80 px-4 py-3 rounded-xl border border-gray-100">
                            💡 Seu perfil está ativo nesta etapa do fluxo de seleção. Fique de olho no seu painel.
                        </p>
                    ) : (
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Inscrição Encerrada</p>
                    )}
                </div>

                {!isEncerrado && !isAprovado && (
                    <button
                        onClick={() => onDesistir(cand.id_candidatura)}
                        disabled={isCanceling}
                        className="w-full sm:w-auto text-xs font-bold text-gray-400 hover:text-red-600 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 border border-gray-100 sm:border-transparent hover:border-red-100 shrink-0"
                    >
                        <HiOutlineXCircle size={16} />
                        {isCanceling ? "Processando..." : "Desistir do Processo"}
                    </button>
                )}
            </div>
        </div>
    );
}