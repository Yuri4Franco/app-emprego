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
  HiOutlineLink,
} from "react-icons/hi";
import { FaWhatsapp, FaLinkedin, FaGithub } from "react-icons/fa";

// Dicionário de Turnos para exibição
const turnoLabels: Record<string, string> = {
  QUALQUER_TURNO: "Qualquer Turno",
  HORARIO_COMERCIAL: "Horário Comercial",
  PRIMEIRO_TURNO: "1º Turno (Manhã)",
  SEGUNDO_TURNO: "2º Turno (Tarde)",
  TERCEIRO_TURNO: "3º Turno (Noite)",
};

export default function DetalhesCurriculoPage() {
  const params = useParams();
  const router = useRouter();
  const id_candidato = params.id;

  const [dadosBase, setDadosBase] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);

  useEffect(() => {
    const buscarDetalhes = async () => {
      try {
        const res = await api.get(`/empresas/banco-talentos/${id_candidato}`);
        setDadosBase(res.data.data);
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
      // Bate no endpoint transacional
      const res = await api.post(
        `/empresas/banco-talentos/${id_candidato}/desbloquear`,
      );

      toast.success(res.data.message || "Currículo desbloqueado com sucesso!");

      // A MÁGICA: Atualiza o estado com o novo payload completo.
      // O React re-renderiza a tela na hora, sumindo com o cadeado e mostrando os contatos!
      setDadosBase(res.data.data);
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Erro ao desbloquear currículo.",
      );
    } finally {
      setIsUnlocking(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 font-bold animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        Carregando perfil...
      </div>
    );
  }

  if (!dadosBase || !dadosBase.perfil) return null;

  const { acesso_liberado, saldo_creditos_empresa } = dadosBase;
  const perfil = dadosBase.perfil;

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 animate-in fade-in duration-700 space-y-8">
      {/* HEADER & VOLTAR */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md"
        >
          <HiOutlineArrowLeft size={18} /> Voltar para a lista
        </button>

        {acesso_liberado && (
          <span className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest border border-emerald-100">
            <HiOutlineClock size={16} /> Acesso Liberado
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* COLUNA ESQUERDA: PERFIL PRINCIPAL E PAYWALL */}
        <div className="lg:col-span-1 space-y-6">
          {/* Card do Perfil */}
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm text-center">
            {perfil.foto_url ? (
              <img
                src={perfil.foto_url}
                alt="Foto do candidato"
                className="w-32 h-32 mx-auto rounded-full object-cover border-4 border-gray-50 shadow-sm mb-6"
              />
            ) : (
              <div className="w-32 h-32 mx-auto rounded-full bg-gray-100 border-4 border-gray-50 flex items-center justify-center mb-6">
                <HiOutlineLockClosed size={40} className="text-gray-300" />
              </div>
            )}

            <h1 className="text-2xl font-black text-gray-900 leading-tight mb-2">
              {perfil.nome}
            </h1>

            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {perfil.primeiro_emprego && (
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-md">
                  1º Emprego
                </span>
              )}
              {perfil.pcd && (
                <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-md">
                  PcD
                </span>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-sm font-medium text-gray-500 bg-gray-50 py-3 rounded-2xl">
              <HiOutlineLocationMarker className="text-gray-400" />
              {perfil.endereco_completo?.cidade}, {perfil.endereco_completo?.uf}
            </div>
          </div>

          {/* ========================================== */}
          {/* O BLOCO MÁGICO: CONTATO VS PAYWALL          */}
          {/* ========================================== */}
          {acesso_liberado ? (
            /* PAINEL DE CONTATO (DESBLOQUEADO) */
            <div className="bg-white p-8 rounded-[32px] border border-emerald-100 shadow-sm animate-in zoom-in-95 duration-500">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6">
                Informações de Contato
              </h3>
              <div className="space-y-4 text-sm font-medium text-gray-700">
                {perfil.email && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-xl">
                      <HiOutlineMail size={18} className="text-gray-500" />
                    </div>
                    <span className="break-all">{perfil.email}</span>
                  </div>
                )}
                {perfil.whatsapp && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 rounded-xl">
                      <FaWhatsapp size={18} className="text-emerald-500" />
                    </div>
                    {perfil.whatsapp}
                  </div>
                )}
                {perfil.telefone && (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-50 rounded-xl">
                      <HiOutlinePhone size={18} className="text-gray-500" />
                    </div>
                    {perfil.telefone}
                  </div>
                )}
                {perfil.link_linkedin && (
                  <a
                    href={perfil.link_linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 hover:text-blue-600 transition-colors"
                  >
                    <div className="p-2 bg-blue-50 rounded-xl">
                      <FaLinkedin size={18} className="text-blue-600" />
                    </div>
                    LinkedIn
                  </a>
                )}
                {perfil.link_portfolio && (
                  <a
                    href={perfil.link_portfolio}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-3 hover:text-gray-900 transition-colors"
                  >
                    <div className="p-2 bg-gray-50 rounded-xl">
                      <FaGithub size={18} className="text-gray-700" />
                    </div>
                    Portfólio / GitHub
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
                <div className="w-14 h-14 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                  <HiOutlineLockClosed size={24} className="text-white" />
                </div>
                <h3 className="text-lg font-black text-white mb-2">
                  Contato Oculto
                </h3>
                <p className="text-sm text-gray-300 font-medium mb-6 leading-relaxed">
                  Para visualizar a foto, e-mail, telefone e redes sociais deste
                  candidato, é necessário desbloquear o perfil.
                </p>

                {/* Lógica de Saldo */}
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
                          <HiOutlineClock size={18} />
                          Desbloquear (1 Crédito)
                        </>
                      )}
                    </button>
                    <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                      Seu saldo: {saldo_creditos_empresa} créditos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      href="/empresa/comprar-creditos"
                      className="flex items-center justify-center w-full py-4 px-6 bg-white hover:bg-gray-50 text-gray-900 rounded-2xl font-black text-sm transition-colors"
                    >
                      Comprar Créditos
                    </Link>
                    <p className="text-[11px] text-red-400 font-bold uppercase tracking-widest">
                      Saldo Insuficiente
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Card de Preferências Logísticas */}
          <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100">
            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
              Logística & Preferências
            </h4>
            <ul className="space-y-3 text-sm text-gray-700 font-medium">
              <li className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                <span className="text-gray-500">Aceita viagens:</span>
                <span className="font-bold text-gray-900">
                  {perfil.disponibilidade_viagem ? "Sim" : "Não"}
                </span>
              </li>
              <li className="flex justify-between items-center border-b border-gray-200/60 pb-2">
                <span className="text-gray-500">Mudar de cidade:</span>
                <span className="font-bold text-gray-900">
                  {perfil.disponibilidade_mudanca ? "Sim" : "Não"}
                </span>
              </li>
              <li className="flex justify-between items-center">
                <span className="text-gray-500">Turno preferido:</span>
                <span className="font-bold text-blue-600 text-right max-w-[130px] leading-tight">
                  {turnoLabels[perfil.turno_preferido] || "Indiferente"}
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* COLUNA DIREITA: DADOS PROFISSIONAIS */}
        <div className="lg:col-span-2 space-y-8">
          {/* Resumo Profissional */}
          {(perfil.resumo_profissional || perfil.objetivo_profissional) && (
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              {perfil.objetivo_profissional && (
                <div className="mb-6">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">
                    Objetivo
                  </h3>
                  <p className="text-lg font-bold text-blue-600">
                    {perfil.objetivo_profissional}
                  </p>
                </div>
              )}

              {perfil.resumo_profissional && (
                <div>
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">
                    Sobre o perfil
                  </h3>
                  <p className="text-gray-600 leading-relaxed font-medium whitespace-pre-wrap">
                    {perfil.resumo_profissional}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Experiência */}
          {perfil.experiencias && perfil.experiencias.length > 0 && (
            <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
                <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>
                Experiência
              </h3>
              <div className="space-y-8 pl-2">
                {perfil.experiencias.map((exp: any) => (
                  <div
                    key={exp.id_experiencia}
                    className="relative pl-8 border-l-2 border-gray-100"
                  >
                    <div className="absolute w-4 h-4 bg-white border-4 border-blue-600 rounded-full -left-[9px] top-1"></div>
                    <div className="flex flex-col mb-2">
                      <h4 className="text-xl font-black text-gray-900">
                        {exp.cargo}
                      </h4>
                      <p className="text-base font-bold text-gray-500 mb-1">
                        {exp.empresa}
                      </p>
                      <span className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wider">
                        <HiOutlineCalendar size={14} />
                        {new Date(exp.data_inicio).toLocaleDateString("pt-BR", {
                          month: "short",
                          year: "numeric",
                        })}
                        {" — "}
                        {exp.atual
                          ? "Atual"
                          : new Date(exp.data_fim).toLocaleDateString("pt-BR", {
                              month: "short",
                              year: "numeric",
                            })}
                      </span>
                    </div>
                    {exp.atividades && (
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap mt-3">
                        {exp.atividades}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formação e Habilidades */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {perfil.formacoes && perfil.formacoes.length > 0 && (
              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <h3 className="text-base font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <HiOutlineAcademicCap className="text-blue-600" size={24} />{" "}
                  Formação
                </h3>
                <div className="space-y-5">
                  {perfil.formacoes.map((form: any) => (
                    <div key={form.id_formacao} className="flex flex-col">
                      <h4 className="font-black text-gray-900">{form.curso}</h4>
                      <p className="text-sm font-medium text-gray-500">
                        {form.instituicao}
                      </p>
                      <span className="text-[11px] font-bold text-blue-600 mt-1">
                        {form.nivel} • {form.status}{" "}
                        {form.data_conclusao
                          ? `(${new Date(form.data_conclusao).getFullYear()})`
                          : ""}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {perfil.competencias && perfil.competencias.length > 0 && (
              <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
                <h3 className="text-base font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <HiOutlineLightningBolt className="text-blue-600" size={24} />{" "}
                  Habilidades
                </h3>
                <div className="flex flex-wrap gap-2">
                  {perfil.competencias.map((c: any, index: number) => (
                    <div
                      key={index}
                      className="px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-700 flex flex-col"
                    >
                      {c.nome}
                      <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                        {c.nivel}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
