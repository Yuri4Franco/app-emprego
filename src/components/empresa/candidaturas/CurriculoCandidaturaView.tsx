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
    HiOutlinePrinter,
    HiOutlineSparkles
} from "react-icons/hi";
import { CurriculoIdentidade } from "../banco-talentos/curriculo/IdentidadeContato";
import { PerfilProfissional } from "../banco-talentos/curriculo/PerfilProfissional";
import { CurriculoLogistica } from "../banco-talentos/curriculo/LogisticaPreferencias";
import { Experiencias } from "../banco-talentos/curriculo/Experiencias";
import { FormacaoAcad } from "../banco-talentos/curriculo/FormacaoAcad";
import { Habilidades } from "../banco-talentos/curriculo/Habilidades";

interface CurriculoCandidaturaViewProps {
    dados: any;
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

    const idade = candidato.data_nascimento
        ? new Date().getFullYear() - new Date(candidato.data_nascimento).getFullYear()
        : null;

    const handleStarClick = (star: number) => {
        setNotaAtual(star);
        if (onAvaliarRápido) onAvaliarRápido(star);
    };

    return (
        /* ✨ OVERLAY FULLSCREEN: Ocupa toda a tela, sobrepondo menus (z-[100]) + Reset de Impressão */
        <div className="fixed inset-0 z-[100] w-screen h-screen bg-slate-100/95 backdrop-blur-md flex flex-col animate-in fade-in zoom-in-95 duration-200 print:static print:h-auto print:w-full print:bg-white print:overflow-visible print:z-0">

            {/* ================= 1. HEADER PREMIUM DE TRIAGEM (Invisível na impressão) ================= */}
            <header className="shrink-0 bg-white/80 backdrop-blur-md border-b border-slate-200/80 px-6 py-3.5 flex items-center justify-between gap-4 shadow-xs print:hidden">

                {/* Botão Voltar com acabamento pill */}
                <button
                    onClick={onClose}
                    className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-600 hover:text-blue-600 bg-slate-100/80 hover:bg-blue-50/80 px-4 py-2 rounded-xl border border-slate-200/60 hover:border-blue-200 transition-all active:scale-95 shadow-2xs"
                >
                    <HiOutlineArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span>Voltar à Triagem</span>
                </button>

                {/* Navegação Rápida entre Candidatos (Tinder Navigation) */}
                <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 shadow-inner">
                    <button
                        onClick={onAnterior}
                        disabled={!hasAnterior}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-white hover:text-blue-600 hover:shadow-2xs disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-700 transition-all cursor-pointer disabled:cursor-not-allowed"
                        title="Candidato Anterior"
                    >
                        <HiOutlineChevronLeft size={16} /> Anterior
                    </button>
                    <div className="w-px h-4 bg-slate-300/80"></div>
                    <button
                        onClick={onProximo}
                        disabled={!hasProximo}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-slate-700 hover:bg-white hover:text-blue-600 hover:shadow-2xs disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-700 transition-all cursor-pointer disabled:cursor-not-allowed"
                        title="Próximo Candidato"
                    >
                        Próximo <HiOutlineChevronRight size={16} />
                    </button>
                </div>

                {/* Ações Secundárias (Imprimir) */}
                <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 text-xs font-bold text-slate-700 hover:text-blue-600 bg-white border border-slate-200/80 px-4 py-2 rounded-xl hover:bg-blue-50/50 hover:border-blue-200 transition-all shadow-2xs active:scale-95 cursor-pointer"
                >
                    <HiOutlinePrinter size={16} className="text-slate-400 group-hover:text-blue-500" />
                    <span className="hidden sm:inline">Imprimir / PDF</span>
                </button>
            </header>

            {/* ================= 2. CORPO DO CURRÍCULO (Área scrollável isolada + Reset para Impressão) ================= */}
            <main className="flex-1 overflow-y-auto p-4 sm:p-8 md:p-12 pb-36 space-y-6 md:space-y-8 max-w-5xl mx-auto w-full print:overflow-visible print:h-auto print:p-0 print:pb-0 print:max-w-none print:space-y-6 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-slate-300 [&::-webkit-scrollbar-thumb]:rounded-full">

                {/* Identidade e Contato */}
                <div className="print:break-inside-avoid">
                    <CurriculoIdentidade
                        perfil={candidato}
                        acessoLiberado={true}
                        saldoCreditos={999}
                        isUnlocking={false}
                        onDesbloquear={() => { }}
                        idade={idade}
                    />
                </div>

                {/* Objetivo, Resumo e PcD */}
                <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[28px] border border-slate-200/70 shadow-xs hover:shadow-md transition-shadow duration-300 print:shadow-none print:border-slate-300 print:p-6 print:rounded-2xl print:break-inside-avoid">
                    <PerfilProfissional perfil={candidato} />
                </div>

                {/* Logística, Salário e Turnos */}
                <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[28px] border border-slate-200/70 shadow-xs hover:shadow-md transition-shadow duration-300 print:shadow-none print:border-slate-300 print:p-6 print:rounded-2xl print:break-inside-avoid">
                    <CurriculoLogistica perfil={candidato} />
                </div>

                {/* Experiências e Formações */}
                <div className="bg-white p-6 sm:p-8 md:p-10 rounded-[28px] border border-slate-200/70 shadow-xs hover:shadow-md transition-shadow duration-300 space-y-10 print:shadow-none print:border-slate-300 print:p-6 print:rounded-2xl print:space-y-8">
                    <div className="print:break-inside-avoid">
                        <Experiencias
                            experiencias={candidato.experiencias || []}
                            primeiroEmprego={candidato.primeiro_emprego || false}
                        />
                    </div>

                    <hr className="border-slate-100 print:border-slate-200" />

                    <div className="print:break-inside-avoid">
                        <FormacaoAcad formacoes={candidato.formacoes || []} />
                    </div>

                    {candidato.competencias?.length > 0 && (
                        <>
                            <hr className="border-slate-100 print:border-slate-200" />
                            <div className="print:break-inside-avoid">
                                <Habilidades competencias={candidato.competencias} />
                            </div>
                        </>
                    )}
                </div>
            </main>

            {/* ================= 3. RODAPÉ DE DECISÃO RÁPIDA (Com cor da marca e invisível na impressão) ================= */}
            {/* ✨ Substituído o cinza/preto por bg-blue-950 com bordas sutis e brilho de marca */}
            <footer className="shrink-0 bg-blue-950/95 backdrop-blur-md text-white border-t border-blue-900/60 p-4 px-6 md:px-10 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[0_-10px_30px_rgba(0,0,0,0.15)] print:hidden z-10">

                {/* Classificação Rápida por Estrelas */}
                <div className="flex items-center gap-3.5 bg-blue-900/40 px-4 py-2 rounded-2xl border border-blue-800/50">
                    <div className="flex items-center gap-1.5 text-blue-200">
                        <HiOutlineSparkles className="text-amber-400" size={16} />
                        <span className="text-[11px] font-black uppercase tracking-widest">
                            Avaliação:
                        </span>
                    </div>
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <button
                                key={star}
                                onClick={() => handleStarClick(star)}
                                className="focus:outline-none transition-all duration-150 hover:scale-125 active:scale-95 cursor-pointer p-0.5"
                                title={`Avaliar com ${star} estrelas`}
                            >
                                {notaAtual >= star ? (
                                    <HiStar size={22} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" />
                                ) : (
                                    <HiOutlineStar size={22} className="text-blue-300/40 hover:text-blue-200" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Ações de Triagem com Hierarquia Visual de Cores */}
                <div className="flex items-center gap-3 w-full sm:w-auto justify-end">

                    {/* Botão Agendar (Ação Secundária de Destaque) */}
                    <button
                        onClick={onAbrirAgendamento}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer border border-blue-500/30"
                    >
                        <HiOutlineCalendar size={16} />
                        <span>Agendar</span>
                    </button>

                    {/* Botão Reprovar (Discreto para evitar cliques acidentais) */}
                    <button
                        onClick={() => {/* Lógica para Reprovar/Desqualificar */ }}
                        className="flex items-center justify-center p-2.5 rounded-xl bg-blue-900/40 hover:bg-red-500/20 text-blue-300 hover:text-red-400 border border-blue-800/60 hover:border-red-500/40 transition-all active:scale-95 cursor-pointer"
                        title="Reprovar / Desqualificar"
                    >
                        <HiOutlineXCircle size={20} />
                    </button>

                    {/* Botão Avançar Etapa (Call to Action Principal) */}
                    <button
                        onClick={() => {/* Lógica para Aprovar/Avançar Etapa */ }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-95 cursor-pointer"
                    >
                        <HiOutlineCheckCircle size={18} className="text-slate-950" />
                        <span>Avançar Etapa</span>
                    </button>
                </div>

            </footer>

        </div>
    );
}