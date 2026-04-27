"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";
import Link from "next/link";
import { useAuth } from "@/src/AuthContext";
import {
  HiOutlineBriefcase,
  HiOutlineEye,
  HiOutlineSparkles,
  HiOutlineArrowRight,
  HiOutlineLocationMarker,
  HiOutlineOfficeBuilding,
  HiOutlineCalendar,
  HiOutlineChevronRight,
  HiOutlineExclamationCircle,
} from "react-icons/hi";

// Tipagens
interface Metricas {
  saude_curriculo: number;
  candidaturas_ativas: number;
  visualizacoes_perfil: number;
  vagas_compativeis: number;
}

interface CandidaturaRecente {
  id_candidatura: number;
  vaga_titulo: string;
  empresa_nome: string;
  empresa_logo: string | null;
  status: string;
  data_atualizacao: string;
  agendamento: {
    data_hora: string;
    local_link: string;
    observacoes: string | null;
  } | null;
}

interface VagaRecomendada {
  id_vaga: number;
  titulo: string;
  empresa_nome: string;
  empresa_logo: string | null;
  localizacao: string;
  modelo_trabalho: string;
  tipo_contrato: string;
  faixa_salarial: string;
  criado_em: string;
}

// Dicionário Visual de Status
const statusConfig: Record<string, { label: string; cor: string; bg: string }> =
{
  INSCRITO: {
    label: "Inscrito",
    cor: "text-blue-700",
    bg: "bg-blue-50 border-blue-100",
  },
  EM_TRIAGEM: {
    label: "Em Triagem",
    cor: "text-amber-700",
    bg: "bg-amber-50 border-amber-100",
  },
  ENTREVISTA: {
    label: "Entrevista Marcada",
    cor: "text-purple-700",
    bg: "bg-purple-50 border-purple-100",
  },
  APROVADO: {
    label: "Aprovado!",
    cor: "text-emerald-700",
    bg: "bg-emerald-50 border-emerald-100",
  },
  REPROVADO: {
    label: "Não Avançou",
    cor: "text-gray-500",
    bg: "bg-gray-100 border-gray-200",
  },
};

export default function DashboardCandidatoPage() {
  const { user, perfil } = useAuth();

  const [metricas, setMetricas] = useState<Metricas | null>(null);
  const [candidaturas, setCandidaturas] = useState<CandidaturaRecente[]>([]);
  const [vagas, setVagas] = useState<VagaRecomendada[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const buscarDadosDashboard = async () => {
      try {
        // Promise.all executa as 3 requisições ao mesmo tempo, economizando tempo do usuário
        const [resMetricas, resCandidaturas, resVagas] = await Promise.all([
          api.get("/candidato/dashboard/metricas"),
          api.get("/candidato/dashboard/candidaturas-recentes"),
          api.get("/candidato/dashboard/vagas-recomendadas"),
        ]);

        setMetricas(resMetricas.data.data);
        setCandidaturas(resCandidaturas.data.data);
        setVagas(resVagas.data.data);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    buscarDadosDashboard();
  }, []);

  const primeiroNome = perfil?.nome?.split(" ")[0] || "Candidato";

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4 space-y-8 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-[32px] w-full"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-40 bg-gray-100 rounded-[32px]"></div>
          <div className="h-40 bg-gray-100 rounded-[32px]"></div>
          <div className="h-40 bg-gray-100 rounded-[32px]"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-gray-100 rounded-[32px]"></div>
          <div className="lg:col-span-1 h-96 bg-gray-100 rounded-[32px]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8 animate-in fade-in duration-700">
      {/* ============================================================== */}
      {/* CABEÇALHO E SAÚDE DO CURRÍCULO                                   */}
      {/* ============================================================== */}
      <header className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-sm flex flex-col lg:flex-row justify-between gap-8 items-center">
        <div className="text-center lg:text-left space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest mb-2">
            <HiOutlineSparkles size={16} /> Bem-vindo de volta
          </div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">
            Olá, {primeiroNome}!
          </h1>
          <p className="text-gray-500 max-w-lg leading-relaxed font-medium">
            Confira como está o seu desempenho na ACI Vagas hoje e explore as
            oportunidades que separamos para você.
          </p>
        </div>

        {/* Gráfico de Saúde do Currículo */}
        {metricas && (
          <div className="flex items-center gap-6 bg-gray-50 p-6 rounded-[32px] border border-gray-100 min-w-fit">
            <div className="relative w-20 h-20 flex items-center justify-center">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 36 36"
              >
                <path
                  className="text-gray-200"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={`${metricas.saude_curriculo === 100 ? "text-emerald-500" : "text-blue-500"} transition-all duration-1000 ease-out`}
                  strokeDasharray={`${metricas.saude_curriculo}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-lg font-black text-gray-800">
                  {metricas.saude_curriculo}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest">
                Força do Perfil
              </h3>
              {metricas.saude_curriculo === 100 ? (
                <span className="inline-block bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase px-3 py-1 rounded-md">
                  Perfil Completo
                </span>
              ) : (
                <Link
                  href="/meu-curriculo"
                  className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors flex items-center gap-1"
                >
                  Completar currículo <HiOutlineArrowRight />
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* ============================================================== */}
      {/* CARDS DE MÉTRICAS RÁPIDAS (VAIDADE)                              */}
      {/* ============================================================== */}
      {metricas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4">
              <HiOutlineBriefcase size={24} />
            </div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">
              Candidaturas Ativas
            </h3>
            <span className="text-4xl font-black text-gray-900">
              {metricas.candidaturas_ativas}
            </span>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group hover:border-purple-200 transition-colors">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4">
                <HiOutlineEye size={24} />
              </div>
              <h3 className="text-sm font-bold text-gray-500 mb-1">Visualizações do Perfil</h3>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-gray-900">{metricas.visualizacoes_perfil}</span>
                {/* 👇 AQUI A MUDANÇA: Em vez de "Empresas interessadas", focamos no acesso ao contato */}
                <span className="text-xs font-bold text-purple-600 mb-1.5 uppercase tracking-widest">
                  Visualização no Banco de Talentos
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <HiOutlineSparkles size={24} />
            </div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">
              Vagas na sua area
            </h3>
            <span className="text-4xl font-black text-gray-900">
              {metricas.vagas_compativeis}
            </span>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* CORPO PRINCIPAL: ESQUERDA (Candidaturas) | DIREITA (Radar)       */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LADO ESQUERDO: Acompanhamento de Candidaturas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              <HiOutlineBriefcase className="text-blue-600" /> Movimentações
              Recentes
            </h2>
            <Link
              href="/candidaturas"
              className="text-sm font-bold text-blue-600 hover:text-blue-800 transition-colors"
            >
              Ver histórico completo
            </Link>
          </div>

          <div className="space-y-4">
            {candidaturas.length === 0 ? (
              <div className="bg-white rounded-[32px] border border-dashed border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HiOutlineBriefcase size={28} />
                </div>
                <h3 className="text-lg font-bold text-gray-800">
                  Você ainda não se candidatou a vagas
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Explore o Radar de Vagas ao lado para encontrar oportunidades.
                </p>
              </div>
            ) : (
              candidaturas.map((cand) => {
                const config = statusConfig[cand.status] || {
                  label: cand.status,
                  cor: "text-gray-700",
                  bg: "bg-gray-100",
                };

                return (
                  <div
                    key={cand.id_candidatura}
                    className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Vaga e Empresa */}
                      <div className="flex items-center gap-4">
                        {cand.empresa_logo ? (
                          <img
                            src={cand.empresa_logo}
                            alt={cand.empresa_nome}
                            className="w-14 h-14 rounded-2xl object-cover border border-gray-100"
                          />
                        ) : (
                          <div className="w-14 h-14 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center border border-gray-100">
                            <HiOutlineOfficeBuilding size={24} />
                          </div>
                        )}
                        <div>
                          <h3 className="font-black text-gray-900 text-lg leading-tight">
                            {cand.vaga_titulo}
                          </h3>
                          <p className="text-sm font-bold text-gray-500">
                            {cand.empresa_nome}
                          </p>
                        </div>
                      </div>

                      {/* Status Visual */}
                      <div className="flex flex-col items-start md:items-end">
                        <span
                          className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${config.bg} ${config.cor}`}
                        >
                          {config.label}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400 uppercase mt-1">
                          Atualizado em{" "}
                          {new Date(cand.data_atualizacao).toLocaleDateString(
                            "pt-BR",
                          )}
                        </span>
                      </div>
                    </div>

                    {/* ALERTA DE ENTREVISTA (Destaque máximo) */}
                    {cand.status === "ENTREVISTA" && cand.agendamento && (
                      <div className="mt-5 p-4 bg-gradient-to-r from-purple-50 to-white border border-purple-100 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                            <HiOutlineCalendar size={20} />
                          </div>
                          <div>
                            <p className="text-xs font-black text-purple-800 uppercase tracking-widest">
                              Entrevista Agendada!
                            </p>
                            <p className="text-sm font-bold text-purple-900 mt-0.5">
                              {new Date(
                                cand.agendamento.data_hora,
                              ).toLocaleString("pt-BR", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })}
                            </p>
                          </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                          <p className="text-xs font-bold text-gray-500">
                            Local / Link:
                          </p>
                          <p
                            className="text-sm font-medium text-gray-800 truncate max-w-[200px]"
                            title={cand.agendamento.local_link}
                          >
                            {cand.agendamento.local_link.startsWith("http") ? (
                              <a
                                href={cand.agendamento.local_link}
                                target="_blank"
                                rel="noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                Acessar Link
                              </a>
                            ) : (
                              cand.agendamento.local_link
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        {/* LADO DIREITO: Radar de Vagas */}
        <div className="lg:col-span-1 space-y-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-black text-gray-900 flex items-center gap-3">
              {/* 👇 AQUI A MUDANÇA 1: Nome mais neutro e claro */}
              <HiOutlineSparkles className="text-emerald-500" /> Novidades na sua área
            </h2>
          </div>

          <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 space-y-4">
            {/* 👇 AQUI A MUDANÇA 2: Tira o "Recomendadas para você" */}
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest px-2">
              Vagas Recentes
            </p>

            {vagas.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                <HiOutlineExclamationCircle size={24} className="text-gray-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-500">Nenhuma vaga na sua área no momento.</p>
                <Link href="/vagas" className="text-xs font-bold text-blue-600 mt-2 inline-block">
                  Ver todas as vagas
                </Link>
              </div>
            ) : (
              vagas.map((vaga) => (
                <Link
                  key={vaga.id_vaga}
                  href={`/vagas/${vaga.id_vaga}`}
                  className="block group"
                >
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:border-emerald-200 hover:shadow-md transition-all">
                    <h3 className="font-black text-gray-900 text-base leading-tight group-hover:text-emerald-700 transition-colors line-clamp-2">
                      {vaga.titulo}
                    </h3>
                    <p className="text-xs font-bold text-gray-500 mt-1">
                      {vaga.empresa_nome}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-4">
                      <span className="px-2 py-1 bg-gray-50 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-md flex items-center gap-1">
                        <HiOutlineLocationMarker size={12} /> {vaga.localizacao}
                      </span>
                      <span className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-md">
                        {vaga.modelo_trabalho}
                      </span>
                    </div>
                  </div>
                </Link>
              ))
            )}

            <Link
              href="/vagas"
              className="flex items-center justify-center gap-2 w-full py-4 text-sm font-bold text-gray-600 hover:text-blue-600 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-gray-200"
            >
              Explorar mais vagas <HiOutlineChevronRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
