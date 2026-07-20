"use client";

import { useState } from "react";
import {
    HiOutlineArrowLeft,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineStar,
    HiStar,
    HiOutlineCalendar,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlinePrinter
} from "react-icons/hi";
import { CurriculoIdentidade } from "../banco-talentos/curriculo/IdentidadeContato";
import { PerfilProfissional } from "../banco-talentos/curriculo/PerfilProfissional";
import { CurriculoLogistica } from "../banco-talentos/curriculo/LogisticaPreferencias";
import { Experiencias } from "../banco-talentos/curriculo/Experiencias";
import { FormacaoAcad } from "../banco-talentos/curriculo/FormacaoAcad";
import { Habilidades } from "../banco-talentos/curriculo/Habilidades";


interface CurriculoCandidaturaViewProps {
    dados: any; // Payload completo vindo da API (/perfil)
    onClose: () => void;
    onAnterior?: () => void;
    onProximo?: () => void;
    hasAnterior?: boolean;
    hasProximo?: boolean;
    onAvaliarRápido?: (nota: number) => void;
    onAbrirAgendamento?: () => void;
}

export function CurriculoCandidaturaView({
    dados,
    onClose,
    onAnterior,
    onProximo,
    hasAnterior = false,
    hasProximo = false,
    onAvaliarRápido,
    onAbrirAgendamento,
}: CurriculoCandidaturaViewProps) {
    const [notaAtual, setNotaAtual] = useState(dados?.avaliacao?.pontuacao || 0);
    const candidato = dados?.candidato;

    if (!candidato) return null;

    // Cálculo rápido de idade
    const idade = candidato.data_nascimento
        ? new Date().getFullYear() - new Date(candidato.data_nascimento).getFullYear()
        : null;

    const handleStarClick = (star: number) => {
        setNotaAtual(star);
        if (onAvaliarRápido) onAvaliarRápido(star);
    };

    return (
        <div className="flex flex-col h-full bg-slate-50/50 relative animate-in fade-in duration-300">

            {/* ================= 1. BARRA DE NAVEGAÇÃO SUPERIOR ================= */}
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-gray-200/80 px-6 py-4 flex items-center justify-between gap-4 shadow-sm print:hidden">

                {/* Botão Voltar (Para fechar a visão completa ou voltar pra tabela) */}
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-blue-600 transition-colors bg-gray-100 hover:bg-blue-50 px-4 py-2.5 rounded-xl border border-transparent hover:border-blue-100"
                >
                    <HiOutlineArrowLeft size={16} /> Voltar
                </button>

                {/* Navegação Tinder (Próximo / Anterior) */}
                <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl border border-gray-200/60">
                    <button
                        onClick={onAnterior}
                        disabled={!hasAnterior}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        title="Candidato Anterior"
                    >
                        <HiOutlineChevronLeft size={16} /> Anterior
                    </button>
                    <span className="w-px h-4 bg-gray-300"></span>
                    <button
                        onClick={onProximo}
                        disabled={!hasProximo}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-700 hover:bg-white hover:shadow-sm disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                        title="Próximo Candidato"
                    >
                        Próximo <HiOutlineChevronRight size={16} />
                    </button>
                </div>

                {/* Imprimir PDF */}
                <button
                    onClick={() => window.print()}
                    className="hidden sm:flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-gray-900 bg-white border border-gray-200 px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                >
                    <HiOutlinePrinter size={16} /> Imprimir
                </button>
            </div>

            {/* ================= 2. CORPO DO CURRÍCULO (SCROLLÁVEL) ================= */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 pb-32 space-y-8 max-w-5xl mx-auto w-full">

                {/* Identidade e Contato (SEMPRE LIBERADO NA CANDIDATURA) */}
                <CurriculoIdentidade
                    perfil={candidato}
                    acessoLiberado={true} // ✨ REGRA DE NEGÓCIO: Forçado como True
                    saldoCreditos={999}
                    isUnlocking={false}
                    onDesbloquear={() => { }}
                    idade={idade}
                />

                {/* Objetivo, Resumo e PcD */}
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <PerfilProfissional perfil={candidato} />
                </div>

                {/* Logística, Salário e Turnos */}
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                    <CurriculoLogistica perfil={candidato} />
                </div>

                {/* Experiências e Formações em Grid ou Pilha */}
                <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-10">
                    <Experiencias
                        experiencias={candidato.experiencias || []}
                        primeiroEmprego={candidato.primeiro_emprego || false}
                    />

                    <hr className="border-gray-100" />

                    <FormacaoAcad formacoes={candidato.formacoes || []} />

                    {candidato.competencias?.length > 0 && (
                        <>
                            <hr className="border-gray-100" />
                            <Habilidades competencias={candidato.competencias} />
                        </>
                    )}
                </div>
            </div>

            {/* ================= 3. RODAPÉ FIXO DE DECISÃO RÁPIDA (STICKY FOOTER) ================= */}
            <div className="sticky bottom-0 z-40 bg-gray-900/95 backdrop-blur-md text-white border-t border-gray-800 p-4 md:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-2xl print:hidden">

                {/* Classificação Rápida por Estrelas */}
                <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                        Avaliação:
                    </span>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => handleStarClick(star)}
                                className="focus:outline-none transition-transform hover:scale-125"
                                title={`Avaliar com ${star} estrelas`}
                            >
                                {notaAtual >= star ? (
                                    <HiStar size={24} className="text-amber-400 drop-shadow-md" />
                                ) : (
                                    <HiOutlineStar size={24} className="text-gray-600 hover:text-gray-400" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ações de Triagem */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                    <button
                        onClick={onAbrirAgendamento}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-purple-600/30"
                    >
                        <HiOutlineCalendar size={16} /> Agendar
                    </button>

                    <button
                        onClick={() => {/* Lógica para Reprovar/Desqualificar */ }}
                        className="flex items-center justify-center p-2.5 rounded-xl bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500/30 transition-all"
                        title="Reprovar Candidato"
                    >
                        <HiOutlineXCircle size={20} />
                    </button>

                    <button
                        onClick={() => {/* Lógica para Aprovar/Avançar Etapa */ }}
                        className="flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/30"
                    >
                        <HiOutlineCheckCircle size={18} /> Avançar Etapa
                    </button>
                </div>

            </div>

        </div>
    );
}