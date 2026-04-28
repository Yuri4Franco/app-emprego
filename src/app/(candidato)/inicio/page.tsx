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
  HiOutlineInformationCircle,
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

  // O Banco de Talentos começa Visível até que a API diga o contrário
  const [isVisivel, setIsVisivel] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const buscarDadosDashboard = async () => {
      try {
        const [resMetricas, resCandidaturas, resVagas, resCurriculo] =
          await Promise.all([
            api.get("/candidato/dashboard/metricas"),
            api.get("/candidato/dashboard/candidaturas-recentes"),
            api.get("/candidato/dashboard/vagas-recomendadas"),
            api.get("/candidato/meu-curriculo"), // Pegamos a visibilidade atual dele
          ]);

        setMetricas(resMetricas.data.data);
        setCandidaturas(resCandidaturas.data.data);
        setVagas(resVagas.data.data);
        setIsVisivel(resCurriculo.data.data?.perfil_visivel_empresas ?? true);
      } catch (error) {
        console.error("Erro ao carregar dashboard:", error);
      } finally {
        setIsLoading(false);
      }
    };

    buscarDadosDashboard();
  }, []);

  const primeiroNome = perfil?.nome?.split(" ")[0] || "Candidato";

  const handleToggleVisibilidade = async () => {
    const novoStatus = !isVisivel;
    setIsVisivel(novoStatus); // Atualização Otimista
    try {
      await api.patch("/candidato/visibilidade", {
        perfil_visivel_empresas: novoStatus,
      });
    } catch (error: any) {
      setIsVisivel(!novoStatus); // Se der erro, desfaz
      console.error("Erro ao alterar visibilidade");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-4 space-y-8 animate-pulse">
        <div className="h-48 bg-gray-200 rounded-[32px] w-full"></div>
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
      {/* CABEÇALHO "TUTORIAL": BOAS-VINDAS E STATUS DO CURRÍCULO          */}
      {/* ============================================================== */}
      <header className="bg-white rounded-[40px] border border-gray-100 shadow-sm overflow-hidden flex flex-col lg:flex-row">
        {/* Bloco de Boas Vindas */}
        <div className="p-8 md:p-10 lg:w-3/5 bg-gradient-to-br from-white to-blue-50/30">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-primary rounded-full text-xs font-black uppercase tracking-widest mb-4 border border-blue-100">
            <HiOutlineSparkles size={16} /> Bem-vindo(a) à ACI Vagas
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-3">
            Olá, {primeiroNome}!
          </h1>

          {metricas?.saude_curriculo === 0 ? (
            // Mensagem para quem acabou de chegar (0%)
            <p className="text-gray-600 font-medium leading-relaxed max-w-lg">
              Este é o seu painel principal. O seu primeiro passo para conseguir
              uma entrevista é cadastrar o seu currículo na plataforma. Vamos
              começar?
            </p>
          ) : (
            // Mensagem padrão
            <p className="text-gray-600 font-medium leading-relaxed max-w-lg">
              Este é o seu painel de controle. Aqui você acompanha as vagas que
              se candidatou, vê as novidades da sua área e gerencia o seu
              currículo.
            </p>
          )}

          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              {/* Botão Switch estilo iOS */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isVisivel}
                  onChange={handleToggleVisibilidade}
                />
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
              <div>
                <p className="text-sm font-black text-gray-900">
                  Aparecer para empresas
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {isVisivel
                    ? "Seu perfil pode ser achado nas buscas."
                    : "Você está invisível no momento."}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bloco de Saúde do Currículo */}
        {metricas && (
          <div className="p-8 md:p-10 lg:w-2/5 bg-gray-50 border-l border-gray-100 flex flex-col justify-center">
            <div className="flex items-start gap-5">
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
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
                    className={`${metricas.saude_curriculo === 100 ? "text-emerald-500" : "text-primary"} transition-all duration-1000 ease-out`}
                    strokeDasharray={`${metricas.saude_curriculo}, 100`}
                    strokeWidth="3"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span
                    className={`text-lg font-black ${metricas.saude_curriculo === 100 ? "text-emerald-600" : "text-gray-800"}`}
                  >
                    {metricas.saude_curriculo}%
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest mb-1">
                  O seu Currículo
                </h3>
                {metricas.saude_curriculo === 100 ? (
                  <>
                    <p className="text-xs text-gray-500 font-medium mb-3">
                      Está perfeito! Currículos 100% completos aparecem no topo
                      das buscas do RH.
                    </p>
                    <Link
                      href="/meu-curriculo"
                      className="text-xs font-bold text-emerald-600 hover:text-emerald-800 transition-colors flex items-center gap-1"
                    >
                      Visualizar ou editar dados <HiOutlineArrowRight />
                    </Link>
                  </>
                ) : (
                  <>
                    <p className="text-xs text-gray-500 font-medium mb-3">
                      Um currículo incompleto diminui suas chances. Preencha as
                      informações que faltam!
                    </p>
                    <Link
                      href="/meu-curriculo"
                      className="text-xs font-bold px-4 py-2 bg-primary hover:bg-blue-700 text-white rounded-xl transition-colors inline-block text-center"
                    >
                      Preencher meu currículo
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ============================================================== */}
      {/* CARDS DE MÉTRICAS RÁPIDAS (RESUMO)                               */}
      {/* ============================================================== */}
      {metricas && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
            <div className="w-12 h-12 bg-blue-50 text-primary rounded-2xl flex items-center justify-center mb-4 shrink-0">
              <HiOutlineBriefcase size={24} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-500 mb-1">
                Processos Ativos
              </h3>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-gray-900">
                  {metricas.candidaturas_ativas}
                </span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1.5">
                  Vagas que você enviou
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group hover:border-purple-200 transition-colors">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-50 rounded-full group-hover:scale-150 transition-transform duration-500 ease-out z-0"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-4 shrink-0">
                <HiOutlineEye size={24} />
              </div>
              <h3 className="text-sm font-bold text-gray-500 mb-1">
                Visualizações
              </h3>
              <div className="flex items-end gap-3">
                <span className="text-4xl font-black text-gray-900">
                  {metricas.visualizacoes_perfil}
                </span>
                <span className="text-[10px] font-bold text-purple-600 mb-1.5 uppercase tracking-widest leading-tight">
                  Vezes que empresas abriram seu contato
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4 shrink-0">
              <HiOutlineLocationMarker size={24} />
            </div>
            <h3 className="text-sm font-bold text-gray-500 mb-1">
              Oportunidades
            </h3>
            <div className="flex items-end gap-3">
              <span className="text-4xl font-black text-gray-900">
                {metricas.vagas_compativeis}
              </span>
              <span className="text-[10px] font-bold text-emerald-600 mb-1.5 uppercase tracking-widest leading-tight">
                Vagas ativas na sua área
              </span>
            </div>
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
              <HiOutlineBriefcase className="text-primary" /> Movimentações
              Recentes
            </h2>
            <Link
              href="/candidaturas"
              className="text-sm font-bold text-primary hover:text-blue-800 transition-colors"
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
                  Sua lista está vazia
                </h3>
                <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                  Quando você clicar em "Candidatar-se" em alguma vaga, ela
                  aparecerá aqui para você acompanhar se foi chamado para
                  entrevista.
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
                                className="text-primary hover:underline"
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
              <HiOutlineSparkles className="text-emerald-500" /> Novidades na
              sua área
            </h2>
          </div>

          <div className="bg-gray-50 p-6 rounded-[32px] border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <HiOutlineInformationCircle className="text-gray-400" size={16} />
              <p className="text-xs font-medium text-gray-500 leading-tight">
                Separamos as últimas vagas cadastradas com a sua área de
                atuação.
              </p>
            </div>

            {vagas.length === 0 ? (
              <div className="bg-white p-6 rounded-2xl border border-gray-100 text-center">
                <HiOutlineExclamationCircle
                  size={24}
                  className="text-gray-300 mx-auto mb-2"
                />
                <p className="text-sm font-medium text-gray-500">
                  Nenhuma vaga nova nesta semana.
                </p>
                <Link
                  href="/vagas"
                  className="text-xs font-bold text-primary mt-2 inline-block"
                >
                  Ir para a busca geral
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
              className="flex items-center justify-center gap-2 w-full py-4 text-sm font-bold text-gray-600 hover:text-primary hover:bg-white rounded-2xl transition-all border border-transparent hover:border-gray-200"
            >
              Explorar o Banco de Vagas <HiOutlineChevronRight />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
