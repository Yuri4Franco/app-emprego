"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
    HiOutlineArrowLeft,
    HiOutlineLocationMarker,
    HiOutlineBriefcase,
    HiOutlineAcademicCap,
    HiOutlineLightningBolt,
    HiOutlineStar,
    HiOutlineCalendar,
    HiOutlineMail,
    HiOutlinePhone,
    HiStar,
    HiOutlineDocumentText,
    HiOutlineBadgeCheck,
} from "react-icons/hi";
import { FaWhatsapp, FaLinkedin, FaGithub } from "react-icons/fa";

export default function GestaoCurriculoPage() {
    const params = useParams();
    const router = useRouter();
    const idCandidatura = params.id;

    const [dados, setDados] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<"CONTATO" | "AVALIACAO" | "AGENDAMENTO">("AVALIACAO");

    // Estados de Avaliação
    const [nota, setNota] = useState(0);
    const [obs, setObs] = useState("");
    const [isSalvandoAvaliacao, setIsSalvandoAvaliacao] = useState(false);

    // Estados de Agendamento
    const [dataEntrevista, setDataEntrevista] = useState("");
    const [horaEntrevista, setHoraEntrevista] = useState("");
    const [localEntrevista, setLocalEntrevista] = useState("");
    const [instrucoesEntrevista, setInstrucoesEntrevista] = useState("");
    const [isAgendando, setIsAgendando] = useState(false);

    useEffect(() => {
        if (!idCandidatura) return;

        const carregarPerfil = async () => {
            setIsLoading(true);
            try {
                const res = await api.get(`/empresa/candidaturas/${idCandidatura}/perfil`);
                const payload = res.data.data || res.data.dados || res.data;
                setDados(payload);

                if (payload.avaliacao) {
                    setNota(payload.avaliacao.pontuacao || 0);
                    setObs(payload.avaliacao.observacoes_internas || "");
                }
            } catch (error) {
                toast.error("Erro ao carregar o perfil do candidato.");
                router.back();
            } finally {
                setIsLoading(false);
            }
        };

        carregarPerfil();
    }, [idCandidatura, router]);

    const salvarAvaliacao = async () => {
        setIsSalvandoAvaliacao(true);
        try {
            await api.post(`/empresa/candidaturas/${idCandidatura}/avaliar`, {
                pontuacao: nota,
                observacoes_internas: obs,
            });
            toast.success("Avaliação salva com sucesso!");
        } catch (error) {
            toast.error("Erro ao salvar avaliação.");
        } finally {
            setIsSalvandoAvaliacao(false);
        }
    };

    const agendarEntrevista = async () => {
        if (!dataEntrevista || !horaEntrevista || !localEntrevista) {
            toast.error("Por favor, preencha Data, Hora e Local.");
            return;
        }

        setIsAgendando(true);
        try {
            const dataHoraIso = new Date(`${dataEntrevista}T${horaEntrevista}:00`).toISOString();
            await api.post(`/empresa/candidaturas/${idCandidatura}/agendar`, {
                data_hora: dataHoraIso,
                local_link: localEntrevista,
                instrucoes: instrucoesEntrevista,
            });

            toast.success("Entrevista agendada com sucesso!");
            setActiveTab("CONTATO"); // Volta pra aba de contato após agendar
        } catch (error: any) {
            toast.error(error.response?.data?.error || "Erro ao agendar entrevista.");
        } finally {
            setIsAgendando(false);
        }
    };

    if (isLoading || !dados) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 font-bold animate-pulse">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
                Carregando dossiê completo...
            </div>
        );
    }

    const candidato = dados.candidato;

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 animate-in fade-in duration-700">

            {/* HEADER DA PÁGINA */}
            <div className="flex items-center justify-between mb-8">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm"
                >
                    <HiOutlineArrowLeft size={18} /> Voltar para a Vaga
                </button>

                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-blue-100 flex items-center gap-2">
                    <HiOutlineDocumentText size={16} /> Dossiê do Candidato
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* ========================================= */}
                {/* COLUNA ESQUERDA: O CURRÍCULO (65% da tela) */}
                {/* ========================================= */}
                <div className="lg:col-span-8 space-y-8">

                    {/* CABEÇALHO DO CURRÍCULO */}
                    <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-8 items-center md:items-start">
                        {candidato.foto_url ? (
                            <img
                                src={candidato.foto_url}
                                alt={candidato.usuario.nome}
                                className="w-36 h-36 rounded-3xl object-cover border-4 border-gray-50 shadow-md shrink-0"
                            />
                        ) : (
                            <div className="w-36 h-36 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-5xl border-4 border-white shadow-md shrink-0">
                                {candidato.usuario.nome.charAt(0)}
                            </div>
                        )}

                        <div className="flex-1 text-center md:text-left">
                            <h1 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
                                {candidato.usuario.nome}
                            </h1>
                            {candidato.objetivo_profissional && (
                                <h2 className="text-xl font-bold text-blue-600 mt-1">
                                    {candidato.objetivo_profissional}
                                </h2>
                            )}

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-6 text-sm font-medium text-gray-600">
                                {candidato.endereco?.cidade && (
                                    <span className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg">
                                        <HiOutlineLocationMarker className="text-gray-400" size={18} />
                                        {candidato.endereco.cidade}, {candidato.endereco.uf}
                                    </span>
                                )}
                                {candidato.primeiro_emprego && (
                                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-black uppercase tracking-widest rounded-lg flex items-center gap-1">
                                        <HiOutlineBadgeCheck size={16} /> 1º Emprego
                                    </span>
                                )}
                                {candidato.pcd && (
                                    <span className="px-3 py-1.5 bg-blue-50 text-blue-700 font-black uppercase tracking-widest rounded-lg">
                                        PcD
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* RESUMO PROFISSIONAL */}
                    {candidato.resumo_profissional && (
                        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span> Resumo Profissional
                            </h3>
                            <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                                {candidato.resumo_profissional}
                            </p>
                        </div>
                    )}

                    {/* EXPERIÊNCIA (TIMELINE) */}
                    {candidato.experiencias?.length > 0 && (
                        <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span> Experiência Profissional
                            </h3>
                            <div className="space-y-8 pl-2">
                                {candidato.experiencias.map((exp: any) => (
                                    <div key={exp.id_experiencia} className="relative pl-8 border-l-2 border-gray-100">
                                        <div className="absolute w-4 h-4 bg-white border-4 border-blue-600 rounded-full -left-[9px] top-1"></div>
                                        <div className="flex flex-col mb-3">
                                            <h4 className="text-xl font-black text-gray-900">{exp.cargo}</h4>
                                            <p className="text-base font-bold text-blue-600 mb-1">{exp.empresa}</p>
                                            <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                                <HiOutlineCalendar size={14} />
                                                {new Date(exp.data_inicio).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                                                {" — "}
                                                {exp.atual ? "O Momento" : new Date(exp.data_fim).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                                            </span>
                                        </div>
                                        {exp.atividades && (
                                            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                                                {exp.atividades}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FORMAÇÃO ACADÊMICA E HABILIDADES */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {candidato.formacoes?.length > 0 && (
                            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                                <h3 className="text-base font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <HiOutlineAcademicCap size={24} className="text-blue-600" /> Formação
                                </h3>
                                <div className="space-y-6">
                                    {candidato.formacoes.map((form: any) => (
                                        <div key={form.id_formacao} className="flex flex-col">
                                            <h4 className="font-black text-gray-900">{form.curso}</h4>
                                            <p className="text-sm font-bold text-gray-600">{form.instituicao}</p>
                                            <div className="flex items-center gap-2 mt-2">
                                                <span className="text-[10px] font-black uppercase bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md">
                                                    {form.nivel}
                                                </span>
                                                <span className="text-[11px] font-bold text-blue-600 uppercase">
                                                    {form.status} {form.data_conclusao ? `(${new Date(form.data_conclusao).getFullYear()})` : ""}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {candidato.competencias?.length > 0 && (
                            <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
                                <h3 className="text-base font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                                    <HiOutlineLightningBolt size={24} className="text-blue-600" /> Habilidades
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {candidato.competencias.map((c: any, index: number) => (
                                        <div key={index} className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 flex flex-col">
                                            {c.nome || c.competencia?.nome}
                                            <span className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">{c.nivel}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ========================================= */}
                {/* COLUNA DIREITA: PAINEL DO RECRUTADOR (35%) */}
                {/* ========================================= */}
                <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">

                    <div className="bg-white rounded-[40px] border border-gray-100 shadow-xl overflow-hidden">
                        {/* Header do Painel */}
                        <div className="bg-gray-900 p-6 text-white text-center">
                            <h3 className="text-lg font-black tracking-tight">Painel de Gestão</h3>
                            <p className="text-xs text-gray-400 font-medium mt-1">Ações exclusivas do recrutador</p>
                        </div>

                        {/* Menu de Abas */}
                        <div className="flex border-b border-gray-100">
                            <button
                                onClick={() => setActiveTab("AVALIACAO")}
                                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-colors ${activeTab === "AVALIACAO" ? "text-amber-500 bg-amber-50/30 border-b-2 border-amber-500" : "text-gray-400 hover:bg-gray-50"}`}
                            >
                                <HiOutlineStar size={18} /> Avaliar
                            </button>
                            <button
                                onClick={() => setActiveTab("AGENDAMENTO")}
                                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-colors ${activeTab === "AGENDAMENTO" ? "text-purple-600 bg-purple-50/30 border-b-2 border-purple-600" : "text-gray-400 hover:bg-gray-50"}`}
                            >
                                <HiOutlineCalendar size={18} /> Agendar
                            </button>
                            <button
                                onClick={() => setActiveTab("CONTATO")}
                                className={`flex-1 py-4 text-xs font-black uppercase tracking-widest flex flex-col items-center gap-1 transition-colors ${activeTab === "CONTATO" ? "text-emerald-600 bg-emerald-50/30 border-b-2 border-emerald-600" : "text-gray-400 hover:bg-gray-50"}`}
                            >
                                <HiOutlinePhone size={18} /> Contato
                            </button>
                        </div>

                        {/* Conteúdo Dinâmico do Painel */}
                        <div className="p-6">

                            {/* ABA: AVALIAÇÃO */}
                            {activeTab === "AVALIACAO" && (
                                <div className="space-y-6 animate-in fade-in">
                                    <div className="text-center">
                                        <label className="text-xs font-bold text-amber-900 uppercase tracking-widest block mb-3">
                                            Classificação do Perfil
                                        </label>
                                        <div className="flex justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setNota(star)}
                                                    className="focus:outline-none transition-transform hover:scale-110"
                                                >
                                                    {nota >= star ? (
                                                        <HiStar size={36} className="text-amber-400 drop-shadow-sm" />
                                                    ) : (
                                                        <HiOutlineStar size={36} className="text-amber-100 hover:text-amber-300" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-bold text-amber-900 uppercase tracking-widest block mb-2">
                                            Notas da Triagem
                                        </label>
                                        <textarea
                                            value={obs}
                                            onChange={(e) => setObs(e.target.value)}
                                            placeholder="Pontos fortes, fracos, ou resumo da ligação..."
                                            className="w-full p-4 bg-amber-50/50 border border-amber-200/50 rounded-2xl h-40 outline-none text-sm focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 resize-none font-medium text-amber-900 placeholder:text-amber-300"
                                        />
                                    </div>

                                    <button
                                        onClick={salvarAvaliacao}
                                        disabled={isSalvandoAvaliacao}
                                        className="w-full py-4 font-black text-white bg-amber-500 hover:bg-amber-600 rounded-2xl shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50"
                                    >
                                        {isSalvandoAvaliacao ? "Salvando..." : "Salvar Avaliação"}
                                    </button>
                                </div>
                            )}

                            {/* ABA: AGENDAMENTO */}
                            {activeTab === "AGENDAMENTO" && (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Data</label>
                                            <input
                                                type="date"
                                                value={dataEntrevista}
                                                onChange={(e) => setDataEntrevista(e.target.value)}
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:border-purple-500 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Horário</label>
                                            <input
                                                type="time"
                                                value={horaEntrevista}
                                                onChange={(e) => setHoraEntrevista(e.target.value)}
                                                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:border-purple-500 transition-all"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Local / Link</label>
                                        <input
                                            type="text"
                                            value={localEntrevista}
                                            onChange={(e) => setLocalEntrevista(e.target.value)}
                                            placeholder="Ex: Sala de Reuniões 1"
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none text-sm focus:border-purple-500 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 block">Instruções Extras</label>
                                        <textarea
                                            value={instrucoesEntrevista}
                                            onChange={(e) => setInstrucoesEntrevista(e.target.value)}
                                            placeholder="Ex: Traga RG e caneta."
                                            className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl h-24 outline-none text-sm resize-none focus:border-purple-500 transition-all"
                                        />
                                    </div>

                                    <button
                                        onClick={agendarEntrevista}
                                        disabled={isAgendando}
                                        className="w-full py-4 font-black text-white bg-purple-600 hover:bg-purple-700 rounded-2xl shadow-lg shadow-purple-600/30 transition-all mt-2 disabled:opacity-50"
                                    >
                                        {isAgendando ? "Agendando..." : "Confirmar Agendamento"}
                                    </button>
                                </div>
                            )}

                            {/* ABA: CONTATO */}
                            {activeTab === "CONTATO" && (
                                <div className="space-y-4 animate-in fade-in">
                                    {candidato.whatsapp ? (
                                        <a
                                            href={`https://wa.me/55${candidato.whatsapp.replace(/\D/g, '')}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-center gap-3 w-full py-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 rounded-2xl font-bold transition-colors border border-emerald-200"
                                        >
                                            <FaWhatsapp size={20} /> Conversar no WhatsApp
                                        </a>
                                    ) : (
                                        <div className="p-4 bg-gray-50 text-gray-400 text-center rounded-2xl text-sm font-medium">
                                            WhatsApp não informado.
                                        </div>
                                    )}

                                    {candidato.usuario.email && (
                                        <a
                                            href={`mailto:${candidato.usuario.email}`}
                                            className="flex items-center justify-center gap-3 w-full py-4 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-2xl font-bold transition-colors"
                                        >
                                            <HiOutlineMail size={20} /> Enviar E-mail
                                        </a>
                                    )}

                                    {candidato.telefone && !candidato.whatsapp && (
                                        <div className="flex items-center justify-center gap-3 w-full py-4 bg-white border border-gray-200 text-gray-700 rounded-2xl font-bold">
                                            <HiOutlinePhone size={20} /> {candidato.telefone}
                                        </div>
                                    )}
                                </div>
                            )}

                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}