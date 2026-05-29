"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import {
  HiOutlineArrowLeft,
  HiOutlineLocationMarker,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineLightningBolt,
  HiOutlineLockClosed,
  HiOutlineClock,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineCalendar,
  HiOutlineMap,
  HiBookmark,
  HiOutlineBookmark,
  HiOutlineIdentification,
} from "react-icons/hi";
import { FaWhatsapp, FaLinkedin, FaGithub } from "react-icons/fa";

// Dicionário de Turnos para exibição
const turnoLabels: Record<string, string> = {
  QUALQUER_TURNO: "Qualquer Turno",
  COMERCIAL: "Horário Comercial",
  MANHÃ: "Manhã (Manhã)",
  TARDE: "Tarde (Tarde)",
  NOITE: "Noite (Noite)",
};

export default function DetalhesCurriculoPage() {
  const params = useParams();
  const router = useRouter();
  const id_candidato = params.id;

  const [dadosBase, setDadosBase] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isFavorito, setIsFavorito] = useState(false);
  const [isFavoriting, setIsFavoriting] = useState(false);

  useEffect(() => {
    const buscarDetalhes = async () => {
      try {
        const res = await api.get(`/empresas/banco-talentos/${id_candidato}`);
        setDadosBase(res.data.data);
        // Pega o estado inicial de salvo do backend
        setIsFavorito(res.data.data.is_salvo || false);
      } catch (error: any) {
        toast.error("Currículo não encontrado ou oculto.");
        router.push("/empresa/banco-talentos");
      } finally {
        setIsLoading(false);
      }
    };
    if (id_candidato) buscarDetalhes();
  }, [id_candidato, router]);

  const handleDesbloquear = async () => {
    setIsUnlocking(true);
    try {
      const res = await api.post(
        `/empresas/banco-talentos/${id_candidato}/desbloquear`,
      );
      toast.success(res.data.message || "Currículo desbloqueado com sucesso!");
      setDadosBase(res.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Erro ao desbloquear currículo.",
      );
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleToggleFavorito = async () => {
    if (isFavoriting) return;
    setIsFavoriting(true);

    // Optimistic UI: Muda o estado na tela antes mesmo da API responder
    const previousState = isFavorito;
    setIsFavorito(!previousState);

    try {
      await api.post(`/empresas/banco-talentos/${id_candidato}/favorito`);
      toast.success(
        !previousState
          ? "Currículo salvo nos favoritos!"
          : "Currículo removido dos salvos.",
      );
    } catch (error: any) {
      // Se der erro na API, desfaz a animação otimista
      setIsFavorito(previousState);
      toast.error("Não foi possível salvar o currículo no momento.");
    } finally {
      setIsFavoriting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 font-bold animate-pulse">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4"></div>
        Carregando perfil do talento...
      </div>
    );
  }

  if (!dadosBase || !dadosBase.perfil) return null;

  const { acesso_liberado, saldo_creditos_empresa } = dadosBase;
  const perfil = dadosBase.perfil;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 md:px-8 animate-in fade-in duration-700 space-y-8">
      {/* ================= HEADER & CONTROLES ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center sm:justify-start gap-2 text-muted hover:text-primary font-bold transition-colors bg-surface px-6 py-3 rounded-full border border-gray-100 shadow-sm hover:shadow-md w-full sm:w-auto"
        >
          <HiOutlineArrowLeft size={18} /> Voltar para a vitrine
        </button>

        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          {acesso_liberado && (
            <span className="flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 px-4 py-3 sm:py-2 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest border border-emerald-100 flex-1 sm:flex-none">
              <HiOutlineLockClosed size={16} className="hidden sm:block" />{" "}
              Acesso Liberado
            </span>
          )}

          {/* BOTÃO SALVAR (FAVORITAR) */}
          <button
            onClick={handleToggleFavorito}
            disabled={isFavoriting}
            className={`flex items-center justify-center gap-2 px-5 py-3 sm:py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border flex-1 sm:flex-none disabled:opacity-70 ${isFavorito
                ? "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20"
                : "bg-surface text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700 shadow-sm"
              }`}
          >
            {isFavorito ? (
              <HiBookmark size={16} />
            ) : (
              <HiOutlineBookmark size={16} />
            )}
            {isFavorito ? "Salvo" : "Salvar"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ================= COLUNA ESQUERDA ================= */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card do Perfil */}
          <div className="bg-surface p-8 rounded-[32px] border border-gray-100 shadow-sm text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none"></div>

            <div className="relative z-10">
              {perfil.foto_url ? (
                <img
                  src={perfil.foto_url}
                  alt="Foto do candidato"
                  className="w-32 h-32 mx-auto rounded-[32px] object-cover border-[6px] border-white shadow-lg mb-6"
                />
              ) : (
                <div className="w-32 h-32 mx-auto rounded-[32px] bg-gray-50 border-[6px] border-white shadow-lg flex items-center justify-center mb-6">
                  <HiOutlineLockClosed size={36} className="text-gray-300" />
                </div>
              )}

              <h1 className="text-2xl font-black text-foreground leading-tight mb-3">
                {perfil.nome}
              </h1>

              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {perfil.primeiro_emprego && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-md border border-emerald-100">
                    1º Emprego
                  </span>
                )}
                {perfil.pcd && (
                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-md border border-blue-100">
                    PcD
                  </span>
                )}
              </div>

              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-gray-500 bg-gray-50 py-2.5 px-4 rounded-xl border border-gray-100 mx-auto w-fit">
                <HiOutlineLocationMarker className="text-primary" size={16} />
                {perfil.endereco_completo?.cidade},{" "}
                {perfil.endereco_completo?.uf}
              </div>
            </div>
          </div>

          {/* O BLOCO MÁGICO: CONTATO VS PAYWALL */}
          {acesso_liberado ? (
            /* PAINEL DE CONTATO (DESBLOQUEADO) */
            <div className="bg-surface p-8 rounded-[32px] border border-primary/20 shadow-sm animate-in zoom-in-95 duration-500">
              <h3 className="text-[10px] font-black text-primary uppercase tracking-widest mb-6">
                Informações de Contato
              </h3>
              <div className="space-y-4 text-sm font-bold text-gray-700">
                {perfil.email && (
                  <div className="flex items-center gap-3 group">
                    <div className="p-2.5 bg-gray-50 rounded-xl group-hover:bg-primary/10 transition-colors border border-gray-100">
                      <HiOutlineMail
                        size={18}
                        className="text-gray-500 group-hover:text-primary transition-colors"
                      />
                    </div>
                    <a
                      href={`mailto:${perfil.email}`}
                      className="break-all hover:text-primary transition-colors"
                    >
                      {perfil.email}
                    </a>
                  </div>
                )}
                {perfil.whatsapp && (
                  <div className="flex items-center gap-3 group">
                    <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-100 group-hover:bg-emerald-100 transition-colors">
                      <FaWhatsapp size={18} className="text-emerald-600" />
                    </div>
                    <a
                      href={`https://wa.me/55${perfil.whatsapp.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-emerald-600 transition-colors"
                    >
                      {perfil.whatsapp}
                    </a>
                  </div>
                )}
                {perfil.telefone && (
                  <div className="flex items-center gap-3 group">
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <HiOutlinePhone size={18} className="text-gray-500" />
                    </div>
                    <span>{perfil.telefone}</span>
                  </div>
                )}
                {perfil.link_linkedin && (
                  <a
                    href={perfil.link_linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 hover:text-blue-600 transition-colors group"
                  >
                    <div className="p-2.5 bg-blue-50 rounded-xl border border-blue-100 group-hover:bg-blue-100 transition-colors">
                      <FaLinkedin size={18} className="text-blue-600" />
                    </div>
                    Ver perfil no LinkedIn
                  </a>
                )}
                {perfil.link_portfolio && (
                  <a
                    href={perfil.link_portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 hover:text-gray-900 transition-colors group"
                  >
                    <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 group-hover:bg-gray-200 transition-colors">
                      <FaGithub size={18} className="text-gray-700" />
                    </div>
                    Acessar Portfólio
                  </a>
                )}
              </div>
            </div>
          ) : (
            /* PAINEL CENSURADO (PAYWALL) */
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-[32px] shadow-xl text-center relative overflow-hidden animate-in fade-in">
              <div className="absolute -right-6 -top-6 text-white/5">
                <HiOutlineLockClosed size={120} />
              </div>

              <div className="relative z-10">
                <div className="w-14 h-14 bg-white/10 rounded-[16px] flex items-center justify-center mx-auto mb-5 backdrop-blur-sm border border-white/10">
                  <HiOutlineLockClosed size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">
                  Contato Oculto
                </h3>
                <p className="text-sm text-gray-300 font-medium mb-6 leading-relaxed">
                  Para visualizar a foto, e-mail, telefone e redes sociais deste
                  candidato, é necessário desbloquear o perfil.
                </p>

                {saldo_creditos_empresa > 0 ? (
                  <div className="space-y-3">
                    <button
                      onClick={handleDesbloquear}
                      disabled={isUnlocking}
                      className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-sm transition-colors shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 disabled:opacity-70"
                    >
                      {isUnlocking ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <HiOutlineLockClosed size={18} />
                          Desbloquear (1 Crédito)
                        </>
                      )}
                    </button>
                    <p className="text-[10px] text-emerald-300/80 font-black uppercase tracking-widest">
                      Seu saldo: {saldo_creditos_empresa} créditos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/empresa/comprar-creditos"
                      className="flex items-center justify-center w-full py-4 px-6 bg-white hover:bg-gray-50 text-gray-900 rounded-2xl font-black text-sm transition-colors shadow-lg"
                    >
                      Comprar Créditos
                    </Link>
                    <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">
                      Saldo Insuficiente
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card de Preferências Logísticas */}
          <div className="bg-surface p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h4 className="text-[10px] font-black text-muted uppercase tracking-widest mb-6">
              Logística & Preferências
            </h4>

            <ul className="space-y-4 text-sm font-bold">
              <li className="flex justify-between items-center pb-4 border-b border-gray-50">
                <span className="flex items-center gap-2 text-gray-500">
                  <HiOutlineClock size={16} /> Turno:
                </span>
                <span className="text-primary text-right max-w-[130px] leading-tight">
                  {turnoLabels[perfil.turno_preferido] || "Indiferente"}
                </span>
              </li>

              <li className="flex justify-between items-center pb-4 border-b border-gray-50">
                <span className="flex items-center gap-2 text-gray-500">
                  <HiOutlineCalendar size={16} /> Sábados:
                </span>
                <span
                  className={
                    perfil.disponibilidade_sabados
                      ? "text-emerald-600"
                      : "text-gray-400"
                  }
                >
                  {perfil.disponibilidade_sabados ? "Disponível" : "Não"}
                </span>
              </li>

              <li className="flex justify-between items-center pb-4 border-b border-gray-50">
                <span className="flex items-center gap-2 text-gray-500">
                  <HiOutlineMap size={16} /> Viagens:
                </span>
                <span
                  className={
                    perfil.disponibilidade_viagem
                      ? "text-emerald-600"
                      : "text-gray-400"
                  }
                >
                  {perfil.disponibilidade_viagem ? "Disponível" : "Não"}
                </span>
              </li>

              <li className="flex flex-col gap-2 pt-1">
                <span className="flex items-center gap-2 text-gray-500">
                  <HiOutlineIdentification size={16} /> Categorias CNH:
                </span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {perfil.cnh &&
                    perfil.cnh.length > 0 &&
                    !perfil.cnh.includes("NAO_POSSUO") ? (
                    perfil.cnh.map((cat: string) => (
                      <span
                        key={cat}
                        className="px-3 py-1.5 bg-gray-100 border border-gray-200 text-gray-700 rounded-lg text-xs font-black uppercase"
                      >
                        {cat}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400 font-medium">
                      Não possui habilitação
                    </span>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* ================= COLUNA DIREITA ================= */}
        <div className="lg:col-span-2 space-y-6">
          {/* Resumo Profissional */}
          {(perfil.resumo_profissional || perfil.objetivo_profissional) && (
            <div className="bg-surface p-8 md:p-10 rounded-[32px] border border-gray-100 shadow-sm space-y-8">
              {perfil.objetivo_profissional && (
                <div>
                  <h3 className="text-[10px] font-black text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                    Objetivo
                  </h3>
                  <p className="text-xl md:text-2xl font-black text-foreground leading-snug">
                    "{perfil.objetivo_profissional}"
                  </p>
                </div>
              )}

              {perfil.resumo_profissional && (
                <div
                  className={
                    perfil.objetivo_profissional
                      ? "pt-6 border-t border-gray-50"
                      : ""
                  }
                >
                  <h3 className="text-[10px] font-black text-muted uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-primary rounded-full"></span>
                    Sobre o Perfil
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap text-sm md:text-base">
                    {perfil.resumo_profissional}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Experiência */}
          {perfil.experiencias && perfil.experiencias.length > 0 && (
            <div className="bg-surface p-8 md:p-10 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-8 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                  <HiOutlineBriefcase size={20} />
                </div>
                Histórico Profissional
              </h3>
              <div className="space-y-8 pl-3">
                {perfil.experiencias.map((exp: any, index: number) => (
                  <div
                    key={exp.id_experiencia}
                    className="relative pl-8 border-l-2 border-gray-100 pb-2"
                  >
                    {/* Bolinha da Timeline */}
                    <div className="absolute w-4 h-4 bg-white border-4 border-primary rounded-full -left-[9px] top-1"></div>

                    <div className="flex flex-col mb-3">
                      <h4 className="text-lg md:text-xl font-black text-foreground">
                        {exp.cargo}
                      </h4>
                      <p className="text-base font-bold text-gray-500 mb-2">
                        {exp.empresa}
                      </p>
                      <span className="flex items-center gap-1.5 text-[11px] font-black text-primary uppercase tracking-wider bg-primary/5 w-fit px-3 py-1 rounded-md">
                        <HiOutlineCalendar size={14} />
                        {new Date(exp.data_inicio).toLocaleDateString("pt-BR", {
                          month: "short",
                          year: "numeric",
                        })}
                        {" — "}
                        {exp.atual
                          ? "O momento"
                          : new Date(exp.data_fim).toLocaleDateString("pt-BR", {
                            month: "short",
                            year: "numeric",
                          })}
                      </span>
                    </div>
                    {exp.atividades && (
                      <p className="text-sm text-gray-600 font-medium leading-relaxed whitespace-pre-wrap mt-3 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        {exp.atividades}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* O PULO DO GATO: Formação e Habilidades Lado a Lado (items-start previne o esticamento) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* FORMAÇÃO ACADÊMICA */}
            {perfil.formacoes && perfil.formacoes.length > 0 && (
              <div className="bg-surface p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <HiOutlineAcademicCap size={20} />
                  </div>
                  Formação Acadêmica
                </h3>
                <div className="space-y-4">
                  {perfil.formacoes.map((form: any) => (
                    <div
                      key={form.id_formacao}
                      className="flex flex-col bg-gray-50 p-5 rounded-[20px] border border-gray-100"
                    >
                      <h4 className="font-black text-foreground text-base leading-tight mb-1">
                        {form.curso}
                      </h4>
                      <p className="text-xs font-bold text-gray-500 mb-3">
                        {form.instituicao}
                      </p>
                      <div>
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${form.status === "CONCLUÍDO"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                            }`}
                        >
                          {form.nivel} • {form.status}{" "}
                          {form.data_conclusao
                            ? `(${new Date(form.data_conclusao).getFullYear()})`
                            : ""}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* HABILIDADES (CHIPS) */}
            {perfil.competencias && perfil.competencias.length > 0 && (
              <div className="bg-surface p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
                    <HiOutlineLightningBolt size={20} />
                  </div>
                  Habilidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {perfil.competencias.map((c: any, index: number) => {
                    // Pinta a tag de acordo com o nível da habilidade para dar um destaque visual top
                    let colorClass = "bg-gray-50 border-gray-200 text-gray-700";
                    if (c.nivel === "AVANCADO") colorClass = "bg-blue-50 border-blue-200 text-blue-800";
                    if (c.nivel === "INTERMEDIARIO") colorClass = "bg-indigo-50 border-indigo-100 text-indigo-700";

                    return (
                      <div
                        key={index}
                        className={`px-3 py-2 border rounded-xl flex flex-col transition-colors ${colorClass}`}
                      >
                        <span className="text-xs font-bold">{c.nome}</span>
                        <span className="text-[9px] uppercase tracking-widest mt-0.5 font-black opacity-70">
                          {c.nivel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}