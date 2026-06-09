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
  HiOutlineTag,
  HiOutlineHeart,
  HiOutlineMoon,
  HiOutlineUser,
  HiOutlineStar,
} from "react-icons/hi";
import { FaWhatsapp, FaLinkedin, FaGithub } from "react-icons/fa";

// Helper para tratar as regras de negócio da Formação Acadêmica (evita 1969)
const formatarStatusFormacao = (form: any) => {
  const isBasic = form.nivel === "Ensino Fundamental" || form.nivel === "Ensino Médio";
  const statusUpper = form.status?.toUpperCase() || "";

  const isConcluido = statusUpper === "CONCLUÍDO" || statusUpper === "CONCLUIDO";
  const isCursando = statusUpper === "CURSANDO";
  const isInterrompido = statusUpper === "INTERROMPIDO";

  let statusLabel = form.status;
  if (isConcluido) statusLabel = "Concluído";
  if (isCursando) statusLabel = "Cursando";
  if (isInterrompido) statusLabel = "Trancado";

  let anoLabel = "";
  if (isConcluido && !isBasic && form.data_conclusao) {
    const year = new Date(form.data_conclusao).getFullYear();
    if (year > 1970) anoLabel = ` em ${year}`;
  }

  return `${statusLabel}${anoLabel}`;
};

// Dicionário de Turnos
const turnoLabels: Record<string, string> = {
  QUALQUER_TURNO: "Qualquer Turno",
  COMERCIAL: "Comercial",
  MANHÃ: "Manhã",
  TARDE: "Tarde",
  NOITE: "Noite",
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
      const res = await api.post(`/empresas/banco-talentos/${id_candidato}/desbloquear`);
      toast.success(res.data.message || "Currículo desbloqueado com sucesso!");
      setDadosBase(res.data.data);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao desbloquear currículo.");
    } finally {
      setIsUnlocking(false);
    }
  };

  const handleToggleFavorito = async () => {
    if (isFavoriting) return;
    setIsFavoriting(true);

    const previousState = isFavorito;
    setIsFavorito(!previousState);

    try {
      await api.post(`/empresas/banco-talentos/${id_candidato}/favorito`);
      toast.success(!previousState ? "Currículo salvo nos favoritos!" : "Currículo removido dos salvos.");
    } catch (error: any) {
      setIsFavorito(previousState);
      toast.error("Não foi possível salvar o currículo no momento.");
    } finally {
      setIsFavoriting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 font-bold animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        Carregando perfil do talento...
      </div>
    );
  }

  if (!dadosBase || !dadosBase.perfil) return null;

  const { acesso_liberado, saldo_creditos_empresa } = dadosBase;
  const perfil = dadosBase.perfil;
  const endereco = perfil.endereco_completo || perfil.endereco;

  const idade = perfil.data_nascimento ? new Date().getFullYear() - new Date(perfil.data_nascimento).getFullYear() : null;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 md:px-8 animate-in fade-in duration-700 space-y-8">

      {/* ================= HEADER & CONTROLES ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center justify-center sm:justify-start gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors bg-white px-6 py-3 rounded-full border border-gray-200 shadow-sm hover:shadow-md w-full sm:w-auto"
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

          <button
            onClick={handleToggleFavorito}
            disabled={isFavoriting}
            className={`flex items-center justify-center gap-2 px-5 py-3 sm:py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all border flex-1 sm:flex-none disabled:opacity-70 ${isFavorito
              ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
              : "bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:text-gray-700 shadow-sm"
              }`}
          >
            {isFavorito ? <HiBookmark size={16} /> : <HiOutlineBookmark size={16} />}
            {isFavorito ? "Salvo" : "Salvar"}
          </button>
        </div>
      </div>

      {/* ================= LINHA 1: IDENTIDADE E CONTATO ================= */}
      <div className="flex flex-col gap-6 md:gap-8 items-stretch">

        {/* Bloco 1: Identidade (Foto, Nome, Dados Básicos e PcD) */}
        <div className="bg-white p-8 md:p-10 rounded-[32px] border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-8 items-center sm:items-start text-center sm:text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-blue-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70"></div>

          {/* Foto com Blur se estiver bloqueado */}
          <div className="relative z-10 shrink-0">
            {perfil.foto_url && acesso_liberado ? (
              <img
                src={perfil.foto_url}
                alt={`Foto de ${perfil.nome}`}
                className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover border-[6px] border-white shadow-xl bg-gray-50"
              />
            ) : (
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gray-100 border-[6px] border-white shadow-xl flex items-center justify-center relative overflow-hidden">
                {!acesso_liberado && (
                  <div className="absolute inset-0 backdrop-blur-md bg-white/40 flex items-center justify-center z-20">
                    <HiOutlineLockClosed size={40} className="text-gray-500" />
                  </div>
                )}
                <span className="text-5xl font-black text-gray-300">
                  {perfil.nome.charAt(0)}
                </span>
              </div>
            )}
          </div>

          <div className="relative z-10 flex-1 w-full space-y-5">
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight">
              {perfil.nome}
            </h1>

            {/* Informações Básicas (Chips Maiores e Espaçados) */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              {idade && (
                <span className="px-4 py-2 bg-gray-50 text-gray-700 text-sm font-bold rounded-xl border border-gray-100 shadow-sm">
                  {idade} anos
                </span>
              )}
              {perfil.genero && (
                <span className="px-4 py-2 bg-gray-50 text-gray-700 text-sm font-bold rounded-xl border border-gray-100 shadow-sm">
                  {perfil.genero}
                </span>
              )}
              {perfil.primeiro_emprego && (
                <span className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-black uppercase tracking-widest rounded-xl border border-emerald-100 shadow-sm">
                  1º Emprego
                </span>
              )}
            </div>

            {/* Destaque PcD integrado diretamente no perfil para não ocupar espaço extra embaixo */}
            {perfil.pcd && (
              <div className="mt-2 p-4 bg-purple-50 rounded-2xl border border-purple-100 flex flex-col gap-1.5 w-fit mx-auto sm:mx-0 text-left">
                <div className="flex items-center gap-2 text-purple-800 font-black text-sm mb-1">
                  <HiOutlineHeart size={18} /> Profissional PcD
                </div>
                {perfil.tipo_pcd && <p className="text-xs text-purple-700 font-medium"><strong>Condição:</strong> {perfil.tipo_pcd}</p>}
                {perfil.necessidade && <p className="text-xs text-purple-700 font-medium"><strong>Adaptação:</strong> {perfil.necessidade}</p>}
              </div>
            )}
          </div>
        </div>

        {/* Bloco 2: Contato, Endereço Completo & Paywall */}
        {acesso_liberado ? (
          <div className="bg-gray-900 p-8 md:p-10 rounded-[32px] shadow-xl text-white flex flex-col justify-center animate-in zoom-in-95 duration-500 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>

            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Lado A: Contato & Redes */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <HiOutlineMail size={16} /> Contato Pessoal
                </h3>
                <div className="space-y-4 text-sm font-medium">
                  {perfil.whatsapp && (
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                        <FaWhatsapp size={18} className="text-emerald-400" />
                      </div>
                      <a href={`https://wa.me/55${perfil.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="hover:text-emerald-300 transition-colors text-gray-200">
                        {perfil.whatsapp}
                      </a>
                    </div>
                  )}
                  {perfil.telefone && !perfil.whatsapp && (
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-white/10 rounded-xl border border-white/10">
                        <HiOutlinePhone size={18} className="text-gray-300" />
                      </div>
                      <span className="text-gray-200">{perfil.telefone}</span>
                    </div>
                  )}
                  {perfil.email && (
                    <div className="flex items-center gap-3 pl-1">
                      <a href={`mailto:${perfil.email}`} className="truncate hover:text-blue-300 transition-colors text-gray-400 underline underline-offset-4 decoration-gray-700">
                        {perfil.email}
                      </a>
                    </div>
                  )}

                  <div className="flex gap-2 pt-3 border-t border-gray-800">
                    {perfil.link_linkedin && (
                      <a href={perfil.link_linkedin} target="_blank" rel="noreferrer" className="p-3 bg-blue-600 hover:bg-blue-500 rounded-xl transition-colors shadow-lg" title="LinkedIn">
                        <FaLinkedin size={20} className="text-white" />
                      </a>
                    )}
                    {perfil.link_portfolio && (
                      <a href={perfil.link_portfolio} target="_blank" rel="noreferrer" className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 shadow-lg" title="Portfólio">
                        <FaGithub size={20} className="text-white" />
                      </a>
                    )}
                  </div>
                </div>
              </div>

              {/* Lado B: Endereço Completo */}
              <div className="space-y-5">
                <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <HiOutlineLocationMarker size={16} /> Endereço
                </h3>
                {perfil.endereco_completo ? (
                  <div className="text-sm font-medium text-gray-400 space-y-2.5 leading-relaxed bg-white/5 p-5 rounded-2xl border border-white/10">
                    <p className="text-white font-bold text-base mb-3 flex items-center gap-2">
                      {perfil.endereco_completo.cidade} - {perfil.endereco_completo.uf}
                    </p>
                    {perfil.endereco_completo.logradouro && (
                      <p className="text-gray-300">
                        {perfil.endereco_completo.logradouro}, {perfil.endereco_completo.numero || "S/N"}
                      </p>
                    )}
                    {perfil.endereco_completo.bairro && (
                      <p>Bairro {perfil.endereco_completo.bairro}</p>
                    )}
                    {perfil.endereco_completo.complemento && (
                      <p className="italic text-xs">"{perfil.endereco_completo.complemento}"</p>
                    )}
                    {perfil.endereco_completo.cep && (
                      <p className="pt-2">CEP: <span className="font-mono text-gray-300">{perfil.endereco_completo.cep}</span></p>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic p-4 bg-white/5 rounded-2xl">Endereço não cadastrado.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* PAINEL CENSURADO (PAYWALL) MANTIDO */
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-10 rounded-[32px] shadow-xl text-center relative overflow-hidden flex flex-col justify-center">
            <div className="absolute -right-6 -top-6 text-white/5 pointer-events-none">
              <HiOutlineLockClosed size={160} />
            </div>
            <div className="relative z-10 max-w-md mx-auto">
              <div className="w-16 h-16 bg-white/10 rounded-[20px] flex items-center justify-center mx-auto mb-6 backdrop-blur-sm border border-white/10">
                <HiOutlineLockClosed size={32} className="text-white" />
              </div>
              <h3 className="text-2xl font-black text-white mb-3">Dados Ocultos</h3>
              <p className="text-sm text-gray-300 font-medium mb-8 leading-relaxed">
                Desbloqueie o perfil para visualizar o <b>endereço completo, e-mail, telefone, redes sociais e a foto</b> do candidato.
              </p>

              {saldo_creditos_empresa > 0 ? (
                <div className="space-y-4">
                  <button
                    onClick={handleDesbloquear}
                    disabled={isUnlocking}
                    className="w-full py-4 px-6 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-base transition-colors shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {isUnlocking ? (
                      <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <HiOutlineLockClosed size={20} />
                        Desbloquear Perfil (1 Crédito)
                      </>
                    )}
                  </button>
                  <p className="text-xs text-emerald-300/80 font-black uppercase tracking-widest">
                    Saldo disponível: {saldo_creditos_empresa} créditos
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <Link
                    href="/empresa/comprar-creditos"
                    className="flex items-center justify-center w-full py-4 px-6 bg-white hover:bg-gray-50 text-gray-900 rounded-2xl font-black text-base transition-colors shadow-lg"
                  >
                    Comprar Créditos
                  </Link>
                  <p className="text-xs text-red-400 font-black uppercase tracking-widest">
                    Saldo Insuficiente
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ================= LINHA 2: RESUMO E LOGÍSTICA ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Resumo Profissional */}
        <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
          {perfil.objetivo_profissional && (
            <div>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                Objetivo
              </h3>
              <p className="text-xl md:text-2xl font-black text-gray-900 leading-snug">
                "{perfil.objetivo_profissional}"
              </p>
            </div>
          )}

          {perfil.resumo_profissional && (
            <div className={perfil.objetivo_profissional ? "pt-6 border-t border-gray-50" : ""}>
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                Resumo Profissional
              </h3>
              <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap text-sm">
                {perfil.resumo_profissional}
              </p>
            </div>
          )}

          {!perfil.resumo_profissional && !perfil.objetivo_profissional && (
            <p className="text-gray-400 italic text-sm text-center py-4">O candidato não preencheu o resumo profissional.</p>
          )}
        </div>

        {/* Logística & Preferências */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm h-fit">
          <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <HiOutlineMoon className="text-indigo-500" size={16} /> Logística e Interesses
          </h4>

          <ul className="space-y-5 text-sm font-bold text-gray-700">
            <li className="flex justify-between items-center pb-4 border-b border-gray-50">
              <span className="text-gray-500">Pretensão Salarial</span>
              <span className="text-emerald-600">{perfil.pretensao_salarial ? `R$ ${perfil.pretensao_salarial}` : "A Combinar"}</span>
            </li>

            <li className="flex flex-col gap-2 pb-4 border-b border-gray-50">
              <span className="text-gray-500 flex items-center gap-1.5"><HiOutlineClock size={16} /> Turnos Preferidos</span>
              <div className="flex flex-wrap gap-1.5">
                {perfil.turno_preferido && perfil.turno_preferido.length > 0 ? (
                  perfil.turno_preferido.map((turno: string) => (
                    <span key={turno} className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-black uppercase tracking-wider">
                      {turnoLabels[turno] || turno.replace(/_/g, ' ')}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400 font-medium">Qualquer turno</span>
                )}
              </div>
            </li>

            <li className="flex justify-between items-center pb-4 border-b border-gray-50">
              <span className="flex items-center gap-1.5 text-gray-500"><HiOutlineCalendar size={16} /> Sábados</span>
              <span className={perfil.disponibilidade_sabados ? "text-blue-600" : "text-gray-400"}>
                {perfil.disponibilidade_sabados ? "Disponível" : "Indisponível"}
              </span>
            </li>

            <li className="flex flex-col gap-1.5 pb-4 border-b border-gray-50">
              <span className="flex items-center gap-1.5 text-gray-500"><HiOutlineMap size={16} /> Mobilidade</span>
              <div className="flex gap-4 text-xs font-medium">
                <span>Viagens: <strong className={perfil.disponibilidade_viagem ? "text-blue-600" : ""}>{perfil.disponibilidade_viagem ? "Sim" : "Não"}</strong></span>
                <span>Mudança: <strong className={perfil.disponibilidade_mudanca ? "text-blue-600" : ""}>{perfil.disponibilidade_mudanca ? "Sim" : "Não"}</strong></span>
              </div>
            </li>

            <li className="flex flex-col gap-2 pt-1">
              <span className="flex items-center gap-1.5 text-gray-500"><HiOutlineIdentification size={16} /> Categorias CNH</span>
              <div className="flex flex-wrap gap-1.5">
                {perfil.cnh && perfil.cnh.length > 0 && !perfil.cnh.includes("NAO_POSSUO") ? (
                  perfil.cnh.map((cat: string) => (
                    <span key={cat} className="px-3 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-lg text-xs font-black uppercase">
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-gray-400 font-medium">Não possui habilitação</span>
                )}
              </div>
            </li>
          </ul>
        </div>
      </div>

      {/* ================= LINHA 3: ENDEREÇO E TAXONOMIAS (3 COLUNAS) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">

        {/* Bloco 1: Endereço */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm h-fit">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-5">
            <HiOutlineLocationMarker size={18} className="text-red-500" /> Endereço Base
          </h3>
          {endereco ? (
            <div className="space-y-4 text-sm font-medium text-gray-700">
              <div className="grid grid-cols-2 gap-y-4 gap-x-4">
                <div className="col-span-2">
                  <span className="block text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Rua / Logradouro</span>
                  {endereco.logradouro ? `${endereco.logradouro}, ${endereco.numero || "S/N"}` : "-"}
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Bairro</span>
                  {endereco.bairro || "-"}
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Complemento</span>
                  {endereco.complemento || "-"}
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">CEP</span>
                  {endereco.cep || "-"}
                </div>
                <div>
                  <span className="block text-[10px] uppercase font-black text-gray-400 tracking-widest mb-1">Cidade/UF</span>
                  {endereco.cidade} - {endereco.uf}
                </div>
              </div>
            </div>
          ) : (
            <span className="text-sm text-gray-400 italic">Endereço detalhado não informado.</span>
          )}
        </div>

        {/* Bloco 2: Áreas de Atuação */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm h-fit">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-5">
            <HiOutlineTag size={18} className="text-blue-500" /> Áreas de Atuação
          </h3>
          <div className="flex flex-wrap gap-2">
            {perfil.areas_atuacao?.length > 0 ? (
              perfil.areas_atuacao.map((a: any) => (
                <span key={a.id_area || a.area?.id_area} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                  {a.area?.nome || a.nome || "Área"}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400 italic">Nenhuma área cadastrada.</span>
            )}
          </div>
        </div>

        {/* Bloco 3: Habilidades */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm h-fit">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-5">
            <HiOutlineLightningBolt size={18} className="text-purple-500" /> Habilidades (Skills)
          </h3>
          <div className="flex flex-wrap gap-2">
            {perfil.competencias?.length > 0 ? (
              perfil.competencias.map((c: any, index: number) => {
                const nivel = c.nivel || "BASICO";
                const isAvancado = nivel === "AVANCADO";
                const isIntermediario = nivel === "INTERMEDIARIO";
                const colorClass = isAvancado ? "bg-purple-50 text-purple-700 border-purple-200" : isIntermediario ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-gray-50 text-gray-600 border-gray-200";

                return (
                  <div key={index} className={`px-3 py-1.5 border rounded-xl flex items-center gap-1.5 transition-colors ${colorClass}`} title={`Nível: ${nivel}`}>
                    <span className="text-xs font-bold">{c.competencia?.nome || c.nome}</span>
                    <span className="text-[9px] uppercase tracking-widest font-black opacity-60">
                      ({nivel.charAt(0)})
                    </span>
                  </div>
                );
              })
            ) : (
              <span className="text-sm text-gray-400 italic">Nenhuma habilidade cadastrada.</span>
            )}
          </div>
        </div>
      </div>

      {/* ================= LINHA 4: EXPERIÊNCIA E FORMAÇÃO LADO A LADO ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
        {/* Histórico Profissional */}
        {perfil.experiencias && perfil.experiencias.length > 0 && (
          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <HiOutlineBriefcase size={20} />
              </div>
              Experiência Profissional
            </h3>
            <div className="space-y-6 pl-2">
              {perfil.experiencias.map((exp: any) => {
                const anoInicio = exp.data_inicio ? new Date(exp.data_inicio).getFullYear() : "";
                const anoFim = exp.atual ? "Atual" : (exp.data_fim ? new Date(exp.data_fim).getFullYear() : "");

                return (
                  <div key={exp.id_experiencia} className="relative pl-6 border-l-2 border-gray-100 pb-2">
                    <div className="absolute w-3.5 h-3.5 bg-white border-[3px] border-blue-500 rounded-full -left-[9px] top-1"></div>

                    <div className="flex flex-col mb-2">
                      <h4 className="text-base font-black text-gray-900 leading-tight mb-1">{exp.cargo}</h4>
                      <p className="text-sm font-bold text-blue-600 mb-1">{exp.empresa}</p>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider bg-gray-50 px-2.5 py-1 rounded-md w-fit">
                        {anoInicio} {anoInicio && anoFim ? "—" : ""} {anoFim}
                      </span>
                    </div>

                    {exp.atividades && (
                      <p className="text-xs text-gray-600 font-medium leading-relaxed whitespace-pre-wrap mt-2 bg-gray-50/80 p-3 rounded-xl">
                        {exp.atividades}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Formação Acadêmica */}
        {perfil.formacoes && perfil.formacoes.length > 0 && (
          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                <HiOutlineAcademicCap size={20} />
              </div>
              Formação Acadêmica
            </h3>
            <div className="space-y-6 pl-2">
              {perfil.formacoes.map((form: any) => (
                <div key={form.id_formacao} className="relative pl-6 border-l-2 border-gray-100 pb-2">
                  <div className="absolute w-3.5 h-3.5 bg-white border-[3px] border-emerald-500 rounded-full -left-[9px] top-1"></div>

                  <h4 className="text-base font-black text-gray-900 leading-tight mb-1">{form.curso || form.nivel}</h4>
                  {form.instituicao && <p className="text-sm font-bold text-emerald-600 mb-2">{form.instituicao}</p>}

                  <div className="flex flex-wrap items-center gap-2 mt-1">
                    <span className="text-[10px] font-black text-gray-500 bg-gray-100 px-2 py-1 rounded-md uppercase tracking-wider">
                      {form.nivel}
                    </span>
                    <span className={`text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider ${form.status?.toUpperCase().includes("CONCLU")
                      ? "bg-emerald-50 text-emerald-700"
                      : form.status?.toUpperCase() === "CURSANDO"
                        ? "bg-blue-50 text-blue-700"
                        : "bg-orange-50 text-orange-700"
                      }`}>
                      {formatarStatusFormacao(form)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}