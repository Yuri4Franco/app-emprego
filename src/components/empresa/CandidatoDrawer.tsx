"use client";

import { useState, useEffect } from "react";
import api from "@/src/services/api";
import toast from "react-hot-toast";
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
  HiOutlineLightningBolt,
} from "react-icons/hi";

import { FaWhatsapp } from "react-icons/fa";
import { TimelineCandidatura } from "./TimelineCandidatura";

interface CandidatoDrawerProps {
  idCandidatura: number | null;
  onClose: () => void;
  onAtualizar: () => void;
}

export function CandidatoDrawer({
  idCandidatura,
  onClose,
  onAtualizar,
}: CandidatoDrawerProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [dados, setDados] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<
    "CURRICULO" | "AVALIACAO" | "AGENDAMENTO" | "HISTORICO"
  >("CURRICULO");

  const [nota, setNota] = useState(0);
  const [obs, setObs] = useState("");
  const [isSalvandoAvaliacao, setIsSalvandoAvaliacao] = useState(false);

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
        const res = await api.get(
          `/empresa/candidaturas/${idCandidatura}/perfil`,
        );

        const payload = res.data.data || res.data.dados || res.data;
        setDados(payload);

        if (payload.avaliacao) {
          setNota(payload.avaliacao.pontuacao || 0);
          setObs(payload.avaliacao.observacoes_internas || "");
        }
      } catch (error) {
        toast.error("Erro ao carregar perfil do candidato.");
        onClose();
      } finally {
        setIsLoading(false);
      }
    };

    carregarPerfil();
  }, [idCandidatura, onClose]);

  const salvarAvaliacao = async () => {
    setIsSalvandoAvaliacao(true);
    try {
      await api.post(`/empresa/candidaturas/${idCandidatura}/avaliar`, {
        pontuacao: nota,
        observacoes_internas: obs,
      });
      onAtualizar();
      toast.success("Avaliação salva com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar avaliação.");
    } finally {
      setIsSalvandoAvaliacao(false);
    }
  };

  if (!idCandidatura) return null;

  const agendarEntrevista = async () => {
    if (!dataEntrevista || !horaEntrevista || !localEntrevista) {
      toast.error("Por favor, preencha Data, Hora e Local.");
      return;
    }

    setIsAgendando(true);
    try {
      const dataHoraIso = new Date(
        `${dataEntrevista}T${horaEntrevista}:00`,
      ).toISOString();

      await api.post(`/empresa/candidaturas/${idCandidatura}/agendar`, {
        data_hora: dataHoraIso,
        local_link: localEntrevista,
        instrucoes: instrucoesEntrevista,
      });

      toast.success(
        "Entrevista agendada com sucesso! O candidato será notificado.",
      );
      onAtualizar();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao agendar entrevista.");
    } finally {
      setIsAgendando(false);
    }
  };

  return (
    <>
      {/* BACKGROUND BLUR */}
      <div
        className="fixed inset-0 bg-gray-900/30 backdrop-blur-sm z-40 transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* DRAWER CONTAINER */}
      <div className="fixed top-0 right-0 h-full w-full max-w-[640px] bg-white shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {isLoading || !dados ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 gap-4">
            <div className="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
            <p className="font-bold text-sm uppercase tracking-widest">
              Carregando Dossiê...
            </p>
          </div>
        ) : (
          <>
            {/* ================= HEADER DO DRAWER ================= */}
            <div className="bg-slate-50 border-b border-gray-100 shrink-0 relative overflow-hidden">
              {/* Efeito Visual Decorativo */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 pointer-events-none"></div>

              <div className="p-6 md:p-8 relative z-10 flex flex-col gap-6">
                {/* Fechar e Identificação */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    {dados.candidato.foto_url ? (
                      <img
                        src={dados.candidato.foto_url}
                        alt="Foto"
                        className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-white text-blue-600 border border-blue-100 rounded-full flex items-center justify-center text-2xl font-black shadow-sm shrink-0">
                        {dados.candidato.usuario.nome.charAt(0)}
                      </div>
                    )}
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                        {dados.candidato.usuario.nome}
                      </h2>
                      <p className="text-xs font-bold text-gray-500 flex items-center gap-1.5 mt-1">
                        <HiOutlineMail className="text-gray-400" />{" "}
                        {dados.candidato.usuario.email}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="p-2 bg-white border border-gray-200 text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-100 rounded-full transition-colors shadow-sm"
                  >
                    <HiOutlineX size={20} />
                  </button>
                </div>

                {/* Tags Rápidas */}
                {dados.resumo_estrategico && (
                  <div className="flex flex-wrap items-center gap-2">
                    {dados.resumo_estrategico.cidade_bairro && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-[10px] font-black uppercase text-gray-600">
                        <HiOutlineLocationMarker
                          size={14}
                          className="text-blue-500"
                        />
                        {dados.resumo_estrategico.cidade_bairro}
                      </span>
                    )}
                    {dados.resumo_estrategico.idade && (
                      <span className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 shadow-sm rounded-lg text-[10px] font-black uppercase text-gray-600">
                        <HiOutlineUser size={14} className="text-blue-500" />
                        {dados.resumo_estrategico.idade} anos
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Seletor de Abas (Pill Style) */}
              <div className="px-6 pb-6 relative z-10">
                <div className="flex bg-gray-200/50 p-1.5 rounded-2xl border border-gray-100">
                  <button
                    onClick={() => setActiveTab("CURRICULO")}
                    className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeTab === "CURRICULO" ? "bg-white text-blue-700 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"}`}
                  >
                    <HiOutlineDocumentText size={16} />{" "}
                    <span className="hidden sm:inline">Resumo</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("AVALIACAO")}
                    className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeTab === "AVALIACAO" ? "bg-white text-amber-600 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"}`}
                  >
                    <HiOutlineStar size={16} /> Avaliar
                  </button>
                  <button
                    onClick={() => setActiveTab("AGENDAMENTO")}
                    className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeTab === "AGENDAMENTO" ? "bg-white text-purple-600 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"}`}
                  >
                    <HiOutlineCalendar size={16} /> Agendar
                  </button>
                  <button
                    onClick={() => setActiveTab("HISTORICO")}
                    className={`flex-1 py-2 text-[10px] sm:text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${activeTab === "HISTORICO" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700 hover:bg-gray-100/50"}`}
                  >
                    <HiOutlineClock size={16} /> Histórico
                  </button>
                </div>
              </div>
            </div>

            {/* ================= ÁREA SCROLLÁVEL ================= */}
            <div className="flex-1 overflow-y-auto bg-white p-6 md:p-8 scrollbar-thin scrollbar-thumb-gray-200">
              {/* ABA: VISÃO ESTRATÉGICA (CURRÍCULO RESUMIDO) */}
              {activeTab === "CURRICULO" && (
                <div className="space-y-8 animate-in fade-in">
                  {/* Histórico Profissional Mini */}
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <HiOutlineBriefcase size={16} className="text-blue-500" />{" "}
                      Experiências Recentes
                    </h3>

                    {dados.candidato.experiencias?.length > 0 ? (
                      <div className="space-y-4 pl-2">
                        {dados.candidato.experiencias
                          .slice(0, 3)
                          .map((exp: any, index: number) => (
                            <div
                              key={exp.id_experiencia || index}
                              className="relative pl-5 border-l-2 border-gray-100"
                            >
                              <div className="absolute w-2.5 h-2.5 bg-blue-500 rounded-full -left-[6px] top-1.5 border-2 border-white box-content"></div>
                              <h4 className="font-bold text-gray-900 text-sm leading-tight">
                                {exp.cargo}
                              </h4>
                              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-1">
                                <p className="text-xs font-bold text-gray-500">
                                  {exp.empresa}
                                </p>
                                <span className="hidden sm:inline text-gray-300">
                                  •
                                </span>
                                <p className="text-[10px] font-black uppercase text-gray-400">
                                  {new Date(exp.data_inicio).getFullYear()} -{" "}
                                  {exp.data_fim
                                    ? new Date(exp.data_fim).getFullYear()
                                    : "Atual"}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
                        Nenhuma experiência registrada.
                      </p>
                    )}
                  </div>

                  {/* Formações Mini */}
                  <div>
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <HiOutlineAcademicCap
                        size={16}
                        className="text-emerald-500"
                      />{" "}
                      Principais Formações
                    </h3>

                    {dados.candidato.formacoes?.length > 0 ? (
                      <div className="space-y-4 pl-2">
                        {dados.candidato.formacoes
                          .slice(0, 3)
                          .map((form: any, index: number) => (
                            <div
                              key={form.id_formacao || index}
                              className="relative pl-5 border-l-2 border-gray-100"
                            >
                              <div className="absolute w-2.5 h-2.5 bg-emerald-500 rounded-full -left-[6px] top-1.5 border-2 border-white box-content"></div>
                              <h4 className="font-bold text-gray-900 text-sm leading-tight">
                                {form.curso || form.nivel}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <p className="text-xs font-bold text-gray-500">
                                  {form.instituicao}
                                </p>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic bg-gray-50 p-4 rounded-xl border border-dashed border-gray-200">
                        Nenhuma formação registrada.
                      </p>
                    )}
                  </div>

                  {/* Habilidades Mini */}
                  {dados.candidato.competencias?.length > 0 && (
                    <div>
                      <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                        <HiOutlineLightningBolt
                          size={16}
                          className="text-purple-500"
                        />{" "}
                        Habilidades
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {dados.candidato.competencias
                          .slice(0, 6)
                          .map((comp: any, index: number) => {
                            const nivel = comp.nivel || "BASICO";
                            const isAvancado = nivel === "AVANCADO";
                            const isIntermediario = nivel === "INTERMEDIARIO";
                            const color = isAvancado
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : isIntermediario
                                ? "bg-blue-50 text-blue-700 border-blue-200"
                                : "bg-gray-50 text-gray-600 border-gray-200";

                            return (
                              <span
                                key={index}
                                className={`px-2.5 py-1.5 rounded-lg border text-[11px] font-bold ${color}`}
                              >
                                {comp.competencia?.nome || comp.nome}
                              </span>
                            );
                          })}
                        {dados.candidato.competencias.length > 6 && (
                          <span className="px-2.5 py-1.5 bg-gray-50 text-gray-400 border border-gray-200 rounded-lg text-[11px] font-black">
                            +{dados.candidato.competencias.length - 6}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Ver Currículo Completo */}
                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={() =>
                        window.open(
                          `/empresa/candidaturas/${idCandidatura}/curriculo`,
                          "_blank",
                        )
                      }
                      className="w-full py-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 font-black uppercase tracking-widest text-xs rounded-2xl transition-colors flex items-center justify-center gap-2"
                    >
                      <HiOutlineDocumentText size={18} /> Ver Perfil Completo
                    </button>
                  </div>
                </div>
              )}

              {/* ABA: AVALIAÇÃO INTERNA */}
              {activeTab === "AVALIACAO" && (
                <div className="space-y-6 animate-in fade-in">
                  <div className="bg-amber-50 p-6 md:p-8 rounded-[32px] border border-amber-100">
                    <div className="text-center mb-6">
                      <label className="text-[10px] font-black text-amber-900 uppercase tracking-widest block mb-3">
                        Classificação do Perfil
                      </label>
                      <div className="flex justify-center gap-1.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => setNota(star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            {nota >= star ? (
                              <HiStar
                                size={40}
                                className="text-amber-400 drop-shadow-sm"
                              />
                            ) : (
                              <HiOutlineStar
                                size={40}
                                className="text-amber-200 hover:text-amber-300"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-6">
                      <label className="text-[10px] font-black text-amber-900 uppercase tracking-widest block mb-2">
                        Notas Confidenciais da Triagem
                      </label>
                      <textarea
                        value={obs}
                        onChange={(e) => setObs(e.target.value)}
                        placeholder="Ex: Ótima comunicação, mas falta experiência na ferramenta X..."
                        className="w-full p-4 bg-white border border-amber-200/50 rounded-2xl h-40 outline-none text-sm focus:ring-2 focus:ring-amber-400/20 focus:border-amber-400 resize-none font-medium text-gray-700 placeholder:text-gray-300 shadow-sm"
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
                </div>
              )}

              {/* ABA: AGENDAMENTO */}
              {activeTab === "AGENDAMENTO" && (
                <div className="space-y-6 animate-in fade-in">
                  {/* Bloco de Contato Rápido no Agendamento */}
                  {(dados.candidato.whatsapp ||
                    dados.candidato.usuario.email) && (
                    <div className="flex flex-col sm:flex-row gap-3">
                      {dados.candidato.whatsapp && (
                        <a
                          href={`https://wa.me/55${dados.candidato.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 py-3 rounded-xl transition-colors"
                        >
                          <FaWhatsapp size={16} /> Chamar no WhatsApp
                        </a>
                      )}
                      {dados.candidato.usuario.email && (
                        <a
                          href={`mailto:${dados.candidato.usuario.email}`}
                          className="flex-1 flex items-center justify-center gap-2 text-xs font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 border border-gray-200 py-3 rounded-xl transition-colors"
                        >
                          <HiOutlineMail size={16} /> Enviar E-mail
                        </a>
                      )}
                    </div>
                  )}

                  <div className="bg-purple-50 p-6 md:p-8 rounded-[32px] border border-purple-100 space-y-5">
                    <h3 className="text-lg font-black text-purple-900 border-b border-purple-100/50 pb-3">
                      Marcar Entrevista
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-black text-purple-900/60 uppercase tracking-widest mb-1 block">
                          Data
                        </label>
                        <input
                          type="date"
                          value={dataEntrevista}
                          onChange={(e) => setDataEntrevista(e.target.value)}
                          className="w-full p-4 bg-white border border-purple-100 shadow-sm rounded-2xl outline-none text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-bold text-gray-700"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black text-purple-900/60 uppercase tracking-widest mb-1 block">
                          Horário
                        </label>
                        <input
                          type="time"
                          value={horaEntrevista}
                          onChange={(e) => setHoraEntrevista(e.target.value)}
                          className="w-full p-4 bg-white border border-purple-100 shadow-sm rounded-2xl outline-none text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-bold text-gray-700"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-purple-900/60 uppercase tracking-widest mb-1 block">
                        Local / Link da Reunião
                      </label>
                      <input
                        type="text"
                        value={localEntrevista}
                        onChange={(e) => setLocalEntrevista(e.target.value)}
                        placeholder="Ex: Sala de Reuniões 1 ou Meet Link"
                        className="w-full p-4 bg-white border border-purple-100 shadow-sm rounded-2xl outline-none text-sm focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium text-gray-700"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-black text-purple-900/60 uppercase tracking-widest mb-1 block">
                        Instruções (Opcional)
                      </label>
                      <textarea
                        value={instrucoesEntrevista}
                        onChange={(e) =>
                          setInstrucoesEntrevista(e.target.value)
                        }
                        placeholder="Ex: Procure pela recepcionista Maria. Traga RG."
                        className="w-full p-4 bg-white border border-purple-100 shadow-sm rounded-2xl h-24 outline-none text-sm resize-none focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 transition-all font-medium text-gray-700"
                      />
                    </div>

                    <button
                      onClick={agendarEntrevista}
                      disabled={isAgendando}
                      className="w-full py-4 font-black text-white bg-purple-600 hover:bg-purple-700 rounded-2xl shadow-lg shadow-purple-600/30 transition-all disabled:opacity-50"
                    >
                      {isAgendando ? "Agendando..." : "Confirmar Agendamento"}
                    </button>
                  </div>
                </div>
              )}

              {/* ABA: HISTÓRICO */}
              {activeTab === "HISTORICO" && (
                <div className="animate-in fade-in">
                  <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-6">
                    Linha do Tempo
                  </h3>
                  <TimelineCandidatura idCandidatura={idCandidatura} />
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
