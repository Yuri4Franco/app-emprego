"use client";

import {
    HiOutlineX,
    HiOutlineUser,
    HiOutlineMail,
    HiOutlineBriefcase,
    HiOutlineAcademicCap,
    HiOutlineStar,
    HiOutlineCalendar,
    HiOutlineLocationMarker,
    HiStar,
    HiOutlineDocumentText,
    HiOutlineClock,
    HiOutlineArrowsExpand,
    HiOutlineChevronLeft,
    HiOutlineChevronRight,
    HiOutlineCheckCircle,
    HiOutlineXCircle,
    HiOutlinePrinter,
    HiOutlineSparkles,
} from "react-icons/hi";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import { TimelineCandidatura } from "../TimelineCandidatura";

/* ========================================================================= */
/* HEADER DO DRAWER (Alterna entre Modo Compacto e Modo Foco)                */
/* ========================================================================= */
export function DrawerHeader({
    isExpanded,
    setIsExpanded,
    onClose,
    onAnterior,
    onProximo,
    hasAnterior,
    hasProximo,
    dados,
    activeTab,
    setActiveTab,
}: any) {
    if (isExpanded) {
        return (
            <header className="bg-blue-950 text-white px-6 py-3.5 flex items-center justify-between shrink-0 border-b border-blue-900/60 shadow-md print:hidden">
                <button
                    onClick={() => setIsExpanded(false)}
                    className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-blue-200 hover:text-white bg-blue-900/50 hover:bg-blue-900 px-4 py-2 rounded-xl border border-blue-800/50 transition-all active:scale-95 cursor-pointer"
                >
                    <HiOutlineChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span>Voltar à Gaveta</span>
                </button>

                <div className="flex items-center gap-1.5 bg-blue-900/40 p-1 rounded-xl border border-blue-800/50">
                    <button
                        onClick={onAnterior}
                        disabled={!hasAnterior}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-200 hover:bg-blue-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                        <HiOutlineChevronLeft size={16} /> Anterior
                    </button>
                    <span className="w-px h-4 bg-blue-800/80"></span>
                    <button
                        onClick={onProximo}
                        disabled={!hasProximo}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold text-blue-200 hover:bg-blue-800 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                        Próximo <HiOutlineChevronRight size={16} />
                    </button>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => window.print()}
                        className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-blue-200 hover:text-white bg-blue-900/50 hover:bg-blue-900 border border-blue-800/50 px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                    >
                        <HiOutlinePrinter size={16} className="text-blue-400" /> Imprimir
                    </button>
                    <button onClick={onClose} className="p-2 text-blue-300 hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors cursor-pointer">
                        <HiOutlineX size={20} />
                    </button>
                </div>
            </header>
        );
    }

    // Fallback seguro de nome para o modo compacto
    const nomeCompacto = dados?.candidato?.nome || dados?.candidato?.usuario?.nome || "Candidato";
    const emailCompacto = dados?.candidato?.email || dados?.candidato?.usuario?.email;

    return (
        <div className="bg-slate-50 border-b border-gray-100 shrink-0 relative overflow-hidden print:hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

            <div className="p-6 md:p-8 relative z-10 flex flex-col gap-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        {dados.candidato.foto_url ? (
                            <img src={dados.candidato.foto_url} alt="Foto" className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm" />
                        ) : (
                            <div className="w-16 h-16 bg-white text-blue-600 border border-blue-100 rounded-full flex items-center justify-center text-2xl font-black shadow-sm shrink-0">
                                {nomeCompacto.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">{nomeCompacto}</h2>
                            {emailCompacto && (
                                <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mt-1">
                                    <HiOutlineMail className="text-gray-400" /> {emailCompacto}
                                </p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                        <button
                            onClick={() => setIsExpanded(true)}
                            title="Expandir em Tela Cheia (Modo Foco)"
                            className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors shadow-sm cursor-pointer"
                        >
                            <HiOutlineArrowsExpand size={18} />
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 rounded-full transition-colors shadow-sm cursor-pointer"
                        >
                            <HiOutlineX size={20} />
                        </button>
                    </div>
                </div>

                {dados.resumo_estrategico && (
                    <div className="flex flex-wrap items-center gap-2">
                        {dados.resumo_estrategico.cidade_bairro && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-2xs rounded-lg text-[10px] font-black uppercase text-gray-600">
                                <HiOutlineLocationMarker size={14} className="text-blue-500" />
                                {dados.resumo_estrategico.cidade_bairro}
                            </span>
                        )}
                        {dados.resumo_estrategico.idade && (
                            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-2xs rounded-lg text-[10px] font-black uppercase text-gray-600">
                                <HiOutlineUser size={14} className="text-blue-500" />
                                {dados.resumo_estrategico.idade} anos
                            </span>
                        )}
                    </div>
                )}
            </div>

            <div className="px-6 pb-6 relative z-10">
                <div className="flex bg-gray-200/50 p-1.5 rounded-2xl border border-gray-100">
                    <button
                        onClick={() => setActiveTab("CURRICULO")}
                        className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === "CURRICULO" ? "bg-white text-blue-700 shadow-2xs" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                            }`}
                    >
                        <HiOutlineDocumentText size={16} /> <span className="hidden sm:inline">Resumo</span>
                    </button>
                    <button
                        onClick={() => setActiveTab("AVALIACAO")}
                        className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === "AVALIACAO" ? "bg-white text-amber-600 shadow-2xs" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                            }`}
                    >
                        <HiOutlineStar size={16} /> Avaliar
                    </button>
                    <button
                        onClick={() => setActiveTab("AGENDAMENTO")}
                        className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === "AGENDAMENTO" ? "bg-white text-purple-600 shadow-2xs" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                            }`}
                    >
                        <HiOutlineCalendar size={16} /> Agendar
                    </button>
                    <button
                        onClick={() => setActiveTab("HISTORICO")}
                        className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${activeTab === "HISTORICO" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"
                            }`}
                    >
                        <HiOutlineClock size={16} /> Histórico
                    </button>
                </div>
            </div>
        </div>
    );
}

/* ========================================================================= */
/* FOOTER DO DRAWER (Ações Rápidas no Modo Foco)                             */
/* ========================================================================= */
export function DrawerFooter({ idCandidatura, nota, setNota, obs, onAtualizar, setIsExpanded, setActiveTab, onClose, hasProximo, onProximo }: any) {
    return (
        <footer className="bg-blue-950 text-white px-6 md:px-10 py-3.5 border-t border-blue-900/60 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.15)] print:hidden z-10">
            <div className="flex items-center gap-3.5 bg-blue-900/40 px-4 py-2 rounded-2xl border border-blue-800/50">
                <div className="flex items-center gap-1.5 text-blue-200">
                    <HiOutlineSparkles className="text-amber-400" size={16} />
                    <span className="text-[11px] font-black uppercase tracking-widest">Avaliação:</span>
                </div>
                <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            onClick={() => {
                                setNota(star);
                                api.post(`/empresa/candidaturas/${idCandidatura}/avaliar`, { pontuacao: star, observacoes_internas: obs }).then(() => {
                                    toast.success(`Classificado com ${star} estrela(s)!`);
                                    onAtualizar();
                                });
                            }}
                            className="focus:outline-none hover:scale-125 active:scale-95 transition-all duration-150 cursor-pointer p-0.5"
                        >
                            {nota >= star ? <HiStar size={22} className="text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]" /> : <HiOutlineStar size={22} className="text-blue-300/40 hover:text-blue-200" />}
                        </button>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                    onClick={() => {
                        setIsExpanded(false);
                        setActiveTab("AGENDAMENTO");
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-600/30 active:scale-95 cursor-pointer border border-blue-500/30"
                >
                    <HiOutlineCalendar size={16} /> Agendar
                </button>

                <button
                    onClick={() => {
                        if (confirm("Deseja desqualificar este candidato?")) {
                            api.patch(`/empresa/candidaturas/${idCandidatura}/status`, { status: "REPROVADO" }).then(() => {
                                toast.success("Candidato movido para Reprovados.");
                                onAtualizar();
                                if (hasProximo && onProximo) onProximo();
                                else onClose();
                            });
                        }
                    }}
                    className="p-2.5 rounded-xl bg-blue-900/40 hover:bg-red-500/20 text-blue-300 hover:text-red-400 border border-blue-800/60 hover:border-red-500/40 transition-all active:scale-95 cursor-pointer"
                >
                    <HiOutlineXCircle size={20} />
                </button>

                <button
                    onClick={() => {
                        toast.success("Candidato aprovado na triagem inicial!");
                        onAtualizar();
                        if (hasProximo && onProximo) onProximo();
                    }}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 active:scale-95 cursor-pointer"
                >
                    <HiOutlineCheckCircle size={18} className="text-slate-950" /> Aprovar
                </button>
            </div>
        </footer>
    );
}

/* ========================================================================= */
/* ABAS DO DRAWER (Conteúdo do Modo Gaveta de 640px)                         */
/* ========================================================================= */
export function DrawerAbas({
    activeTab,
    dados,
    idCandidatura,
    setIsExpanded,
    nota,
    setNota,
    obs,
    setObs,
    salvarAvaliacao,
    isSalvandoAvaliacao,
    dataEntrevista,
    setDataEntrevista,
    horaEntrevista,
    setHoraEntrevista,
    localEntrevista,
    setLocalEntrevista,
    agendarEntrevista,
    isAgendando,
}: any) {
    return (
        <>
            {activeTab === "CURRICULO" && (
                <div className="space-y-8 animate-in fade-in">
                    <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <HiOutlineBriefcase size={16} className="text-blue-500" /> Experiências Recentes
                        </h3>
                        {dados.candidato.experiencias?.length > 0 ? (
                            <div className="space-y-4 pl-2">
                                {dados.candidato.experiencias.slice(0, 3).map((exp: any, idx: number) => (
                                    <div key={idx} className="relative pl-5 border-l-2 border-gray-100">
                                        <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -left-[6px] top-1.5 border-2 border-white box-content"></div>
                                        <h4 className="font-bold text-gray-900 text-sm">{exp.cargo}</h4>
                                        <p className="text-xs font-bold text-gray-500">{exp.empresa}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl">Nenhuma experiência registrada.</p>
                        )}
                    </div>

                    <div>
                        <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <HiOutlineAcademicCap size={16} className="text-emerald-500" /> Principais Formações
                        </h3>
                        {dados.candidato.formacoes?.length > 0 ? (
                            <div className="space-y-4 pl-2">
                                {dados.candidato.formacoes.slice(0, 3).map((form: any, idx: number) => (
                                    <div key={idx} className="relative pl-5 border-l-2 border-gray-100">
                                        <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full -left-[6px] top-1.5 border-2 border-white box-content"></div>
                                        <h4 className="font-bold text-gray-900 text-sm">{form.curso || form.nivel}</h4>
                                        <p className="text-xs font-bold text-gray-500">{form.instituicao}</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl">Nenhuma formação registrada.</p>
                        )}
                    </div>

                    <div className="pt-4 border-t border-gray-100 flex flex-col gap-2">
                        <button
                            onClick={() => setIsExpanded(true)}
                            className="w-full py-4 border-2 border-blue-600 bg-blue-600 text-white hover:bg-blue-700 font-black uppercase tracking-widest text-xs rounded-2xl transition-all shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
                        >
                            <HiOutlineDocumentText size={18} /> Ver Perfil Completo na Gaveta
                        </button>

                        <button
                            onClick={() => window.open(`/empresa/candidaturas/${idCandidatura}/curriculo`, "_blank")}
                            className="w-full py-2.5 text-gray-400 hover:text-blue-600 font-bold text-[11px] uppercase tracking-wider rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                            Abrir em nova aba do navegador ↗
                        </button>
                    </div>
                </div>
            )}

            {activeTab === "AVALIACAO" && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="bg-amber-50 p-6 md:p-8 rounded-[32px] border border-amber-100">
                        <div className="text-center mb-6">
                            <label className="text-[10px] font-black text-amber-900 uppercase tracking-widest block mb-3">Classificação do Perfil</label>
                            <div className="flex justify-center gap-1.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} onClick={() => setNota(star)} className="focus:outline-none hover:scale-110 transition-transform cursor-pointer">
                                        {nota >= star ? <HiStar size={40} className="text-amber-400 drop-shadow-xs" /> : <HiOutlineStar size={40} className="text-amber-200" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <textarea
                            value={obs}
                            onChange={(e) => setObs(e.target.value)}
                            placeholder="Notas confidenciais sobre o candidato..."
                            className="w-full p-4 bg-white border border-amber-200/50 rounded-2xl h-40 outline-none text-sm focus:border-amber-400 resize-none font-medium text-gray-700 mb-6 shadow-2xs"
                        />
                        <button
                            onClick={salvarAvaliacao}
                            disabled={isSalvandoAvaliacao}
                            className="w-full py-4 font-black text-white bg-amber-500 hover:bg-amber-600 rounded-2xl shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            {isSalvandoAvaliacao ? "Salvando..." : "Salvar Avaliação"}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === "AGENDAMENTO" && (
                <div className="space-y-6 animate-in fade-in">
                    <div className="bg-purple-50 p-6 md:p-8 rounded-[32px] border border-purple-100 space-y-5">
                        <h3 className="text-lg font-black text-purple-900 border-b border-purple-100/50 pb-3">Marcar Entrevista</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] font-black text-purple-900/60 uppercase mb-1 block">Data</label>
                                <input type="date" value={dataEntrevista} onChange={(e) => setDataEntrevista(e.target.value)} className="w-full p-4 bg-white border border-purple-100 rounded-2xl text-sm font-bold text-gray-700" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-purple-900/60 uppercase mb-1 block">Horário</label>
                                <input type="time" value={horaEntrevista} onChange={(e) => setHoraEntrevista(e.target.value)} className="w-full p-4 bg-white border border-purple-100 rounded-2xl text-sm font-bold text-gray-700" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-purple-900/60 uppercase mb-1 block">Local / Link da Reunião</label>
                            <input type="text" value={localEntrevista} onChange={(e) => setLocalEntrevista(e.target.value)} placeholder="Ex: Sala 1 ou Meet" className="w-full p-4 bg-white border border-purple-100 rounded-2xl text-sm font-medium text-gray-700" />
                        </div>
                        <button onClick={agendarEntrevista} disabled={isAgendando} className="w-full py-4 font-black text-white bg-purple-600 hover:bg-purple-700 rounded-2xl shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50 cursor-pointer">
                            {isAgendando ? "Agendando..." : "Confirmar Agendamento"}
                        </button>
                    </div>
                </div>
            )}

            {activeTab === "HISTORICO" && (
                <div className="animate-in fade-in">
                    <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6">Linha do Tempo</h3>
                    <TimelineCandidatura idCandidatura={idCandidatura} />
                </div>
            )}
        </>
    );
}