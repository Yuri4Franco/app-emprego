"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";
import {
  HiOutlineBriefcase,
  HiOutlineUsers,
  HiOutlineCalendar,
  HiOutlineTrendingUp,
  HiOutlineExternalLink,
  HiOutlineClock,
  HiOutlineBadgeCheck,
  HiOutlineDocumentText,
  HiOutlineDuplicate,
  HiOutlineArrowRight,
} from "react-icons/hi";
import Link from "next/link";
import { useAuth } from "@/src/AuthContext";
import toast from "react-hot-toast";

// 1. Interfaces para Tipagem dos Dados do Dashboard
interface VagaResumo {
  id_vaga: number;
  titulo: string;
  total_inscritos: number;
  novos_inscritos: number;
}

interface EntrevistaResumo {
  id_agendamento: number;
  nome_candidato: string;
  titulo_vaga: string;
  data_hora: string;
}

export default function EmpresaDashboard() {
  const { perfil, isLoading: authLoading, isAssociada } = useAuth();

  const [vagas, setVagas] = useState<VagaResumo[]>([]);
  const [entrevistas, setEntrevistas] = useState<EntrevistaResumo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [resVagas, resEntrevistas] = await Promise.all([
          api.get("/empresa/dashboard/vagas-resumo"),
          api.get("/empresa/dashboard/proximas-entrevistas"),
        ]);
        setVagas(resVagas.data.data || []);
        setEntrevistas(resEntrevistas.data.data || []);
      } catch (err) {
        console.error("Erro ao carregar dashboard", err);
      } finally {
        setLoading(false);
      }
    }

    if (perfil) {
      loadDashboard();
    }
  }, [perfil]);

  const handleCopiarLink = () => {
    // Monta o link da vitrine da empresa (ajuste a URL conforme sua regra de rotas públicas)
    const linkVitrine = `${window.location.origin}/${perfil?.empresa?.slug}`;
    navigator.clipboard.writeText(linkVitrine);
    toast.success("Link da sua vitrine copiado!", {
      icon: "📋",
      style: {
        borderRadius: "12px",
        background: "#333",
        color: "#fff",
        fontSize: "14px",
        fontWeight: "bold",
      },
    });
  };

  if (authLoading || loading) {
    return (
      <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 animate-pulse">
        <div className="h-32 bg-gray-200 rounded-[32px] w-full"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-gray-100 rounded-[24px]"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 md:space-y-10 animate-in fade-in duration-700">
      {/* ================= HEADER ================= */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white p-8 md:p-10 rounded-[32px] md:rounded-[40px] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="bg-primary/10 text-primary border border-primary/20 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">
              Painel Corporativo
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight leading-tight">
            {perfil?.empresa?.nome_fantasia || "Minha Empresa"}
          </h1>
          <p className="text-gray-500 font-medium text-sm md:text-base">
            Olá,{" "}
            <strong className="text-gray-800">{perfil?.nome}</strong>. O que
            vamos realizar hoje?
          </p>
        </div>

        {/* CARTEIRA DE CRÉDITOS */}
        {!isAssociada && (
          <div className="relative z-10 flex items-center gap-3 bg-gray-50 px-6 py-2 rounded-full border border-gray-100">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
                Seu Saldo
              </span>
              <div className="flex items-center gap-3 text-sm font-black text-gray-800">
                <div
                  className="flex items-center gap-1.5"
                  title="Créditos de Currículos"
                >
                  <HiOutlineDocumentText className="text-emerald-500" size={16} />
                  {perfil?.empresa?.creditos_curriculos || 0}
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ================= MÉTRICAS EM CARDS ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <MetricCard
          icon={<HiOutlineBriefcase size={24} />}
          label="Processos Ativos"
          value={vagas.length}
          color="blue"
        />
        <MetricCard
          icon={<HiOutlineUsers size={24} />}
          label="Total Inscritos"
          value={vagas.reduce((acc, v) => acc + v.total_inscritos, 0)}
          color="emerald"
        />
        <MetricCard
          icon={<HiOutlineCalendar size={24} />}
          label="Entrevistas"
          value={entrevistas.length}
          color="purple"
        />
        <MetricCard
          icon={<HiOutlineTrendingUp size={24} />}
          label="Novas Triagens"
          value={vagas.reduce((acc, v) => acc + v.novos_inscritos, 0)}
          color="orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ================= LISTA DE VAGAS ================= */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
              Resumo das Vagas
            </h2>
            <Link
              href="/empresa/vagas"
              className="text-xs font-black uppercase tracking-widest text-primary hover:bg-primary/10 px-4 py-2 rounded-full transition-colors"
            >
              Ver Todas
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {vagas.length > 0 ? (
              vagas.map((vaga) => (
                <div
                  key={vaga.id_vaga}
                  className="bg-white p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg hover:border-primary/30 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-5 group"
                >
                  <div className="space-y-2 flex-1">
                    <h3 className="font-black text-gray-900 text-lg group-hover:text-primary transition-colors leading-tight">
                      {vaga.titulo}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 bg-gray-50 border border-gray-200 px-2.5 py-1 rounded-md">
                        {vaga.total_inscritos}{" "}
                        {vaga.total_inscritos === 1 ? "Inscrito" : "Inscritos"}
                      </span>
                      {vaga.novos_inscritos > 0 && (
                        <span className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded-md">
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                          </span>
                          {vaga.novos_inscritos} Novos
                        </span>
                      )}
                    </div>
                  </div>

                  <Link
                    href={`/empresa/vagas/${vaga.id_vaga}/gestao`}
                    className="shrink-0 flex items-center justify-center gap-2 bg-gray-50 hover:bg-primary text-gray-600 hover:text-white border border-gray-200 hover:border-primary text-xs font-black uppercase tracking-widest py-3 px-6 rounded-full transition-all duration-300 w-full sm:w-auto"
                  >
                    Analisar <HiOutlineArrowRight size={16} />
                  </Link>
                </div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-[32px] border-2 border-dashed border-gray-200 text-center flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mb-4">
                  <HiOutlineBriefcase size={28} />
                </div>
                <h3 className="text-lg font-black text-gray-800">
                  Nenhuma vaga ativa
                </h3>
                <p className="text-gray-400 font-medium text-sm mt-1 max-w-xs mx-auto">
                  Crie sua primeira vaga para começar a receber currículos de
                  talentos.
                </p>
                <Link
                  href="/empresa/vagas/nova"
                  className="mt-6 px-8 py-3 bg-primary text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/30 hover:-translate-y-0.5 transition-all"
                >
                  Criar Vaga
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ================= AGENDA E LINK ================= */}
        <div className="space-y-6">
          <div className="px-2">
            <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
              Próximas Entrevistas
            </h2>
          </div>

          <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            {entrevistas.length > 0 ? (
              <div className="space-y-5">
                {entrevistas.map((ent) => {
                  const dataEntrevista = new Date(ent.data_hora);
                  return (
                    <div
                      key={ent.id_agendamento}
                      className="flex items-center gap-4 group"
                    >
                      {/* Calendário estilo iOS */}
                      <div className="shrink-0 w-14 border border-gray-100 rounded-2xl overflow-hidden shadow-sm group-hover:border-purple-200 transition-colors">
                        <div className="bg-purple-100 text-purple-700 text-[9px] font-black uppercase tracking-widest text-center py-1">
                          {dataEntrevista
                            .toLocaleDateString("pt-BR", { month: "short" })
                            .replace(".", "")}
                        </div>
                        <div className="bg-white text-gray-900 text-xl font-black text-center py-2">
                          {dataEntrevista.getDate()}
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-black text-gray-900 truncate group-hover:text-primary transition-colors">
                          {ent.nome_candidato}
                        </h4>
                        <p className="text-xs text-gray-500 font-medium truncate mt-0.5">
                          {ent.titulo_vaga}
                        </p>
                        <span className="text-[10px] text-purple-600 font-black flex items-center gap-1 mt-1.5 uppercase tracking-widest bg-purple-50 w-fit px-2 py-0.5 rounded-md">
                          <HiOutlineClock size={12} />
                          {dataEntrevista.toLocaleTimeString("pt-BR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-3">
                  <HiOutlineCalendar size={20} />
                </div>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                  Sem entrevistas agendadas.
                </p>
              </div>
            )}
          </div>

          {/* CARD DA VITRINE (Link da Empresa) */}
          <div className="bg-gradient-to-br from-primary to-blue-700 p-8 rounded-[32px] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/4"></div>

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest opacity-80 bg-black/20 px-3 py-1 rounded-full">
                <HiOutlineExternalLink size={12} />
                Link da Vitrine
              </div>
              <h3 className="font-black text-xl md:text-2xl leading-tight">
                Atraia talentos direto pelo seu link.
              </h3>
              <p className="text-sm text-blue-100 font-medium leading-relaxed pb-2">
                Compartilhe nas suas redes sociais e direcione os candidatos
                para sua página exclusiva.
              </p>
              <button
                onClick={handleCopiarLink}
                className="flex items-center justify-center gap-2 w-full bg-white text-primary text-xs font-black py-3.5 rounded-full uppercase tracking-widest hover:bg-blue-50 transition-all active:scale-95 shadow-md"
              >
                <HiOutlineDuplicate size={16} /> Copiar Link
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponente de Card de Métrica (Refinado)
function MetricCard({
  icon,
  label,
  value,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  color: string;
}) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100 group-hover:bg-blue-100",
    emerald:
      "bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-100",
    purple:
      "bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-100",
    orange:
      "bg-orange-50 text-orange-600 border-orange-100 group-hover:bg-orange-100",
  };

  return (
    <div className="group bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex items-center gap-5 cursor-default">
      <div
        className={`w-14 h-14 rounded-[18px] border flex items-center justify-center transition-colors duration-300 shrink-0 ${colors[color]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1.5">
          {label}
        </p>
        <h3 className="text-3xl font-black text-gray-900 leading-none tracking-tight">
          {value}
        </h3>
      </div>
    </div>
  );
}
