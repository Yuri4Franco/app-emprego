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
} from "react-icons/hi";
import Link from "next/link";
import { useAuth } from "@/src/AuthContext";

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
  // Pegamos 'perfil' (dados do /me) e 'isLoading' do seu AuthContext
  const { perfil, isLoading: authLoading } = useAuth();

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
        setVagas(resVagas.data.data);
        setEntrevistas(resEntrevistas.data.data);
      } catch (err) {
        console.error("Erro ao carregar dashboard", err);
      } finally {
        setLoading(false);
      }
    }

    // Só dispara a busca quando o perfil (e o id_empresa) estiver disponível
    if (perfil) {
      loadDashboard();
    }
  }, [perfil]);

  // Se estiver carregando o perfil ou os dados da API, mostra nada ou um skeleton
  if (authLoading || loading) return null;

  return (
    <div className="p-4 md:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* HEADER DINÂMICO USANDO DADOS DO PERFIL (/ME) */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-blue-100 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
              Painel Corporativo
            </span>
            {perfil?.empresa?.status === "ATIVO" && (
              <div className="flex items-center gap-1 text-emerald-600">
                <HiOutlineBadgeCheck size={18} />
                <span className="text-[10px] font-bold uppercase tracking-tight">
                  Verificada
                </span>
              </div>
            )}
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            {perfil?.empresa?.nome_fantasia || "Minha Empresa"}
          </h1>
          <p className="text-gray-500 font-medium text-sm">
            Bem-vindo de volta,{" "}
            <span className="text-gray-800 font-bold">{perfil?.nome}</span>.
          </p>
        </div>

        {/* CRÉDITOS DA EMPRESA */}
        <div className="flex gap-3">
          <div className="bg-white border border-gray-100 p-3 px-4 rounded-2xl shadow-sm text-center min-w-[100px]">
            <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">
              Vagas
            </p>
            <p className="text-lg font-black text-primary leading-none">
              {perfil?.empresa?.creditos_vagas || 0}
            </p>
          </div>
          <div className="bg-white border border-gray-100 p-3 px-4 rounded-2xl shadow-sm text-center min-w-[100px]">
            <p className="text-[9px] font-black text-gray-400 uppercase leading-none mb-1">
              Currículos
            </p>
            <p className="text-lg font-black text-primary leading-none">
              {perfil?.empresa?.creditos_curriculos || 0}
            </p>
          </div>
        </div>
      </header>

      {/* MÉTRICAS EM CARDS */}
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
        {/* LISTA DE VAGAS COM STATUS */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h2 className="text-lg font-black text-gray-800">
              Resumo das Vagas
            </h2>
            <Link
              href="/empresa/vagas"
              className="text-xs font-bold text-primary hover:bg-blue-50 px-3 py-1.5 rounded-full transition-colors"
            >
              Gerenciar Vagas
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {vagas.length > 0 ? (
              vagas.map((vaga) => (
                <div
                  key={vaga.id_vaga}
                  className="bg-white p-5 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-800 text-base group-hover:text-primary transition-colors">
                      {vaga.titulo}
                    </h3>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {vaga.total_inscritos} candidatos
                      </span>
                      {vaga.novos_inscritos > 0 && (
                        <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md animate-pulse">
                          {vaga.novos_inscritos} novos currículos
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/empresa/vagas/${vaga.id_vaga}`}
                    className="flex items-center justify-center gap-2 bg-gray-900 text-white text-xs font-bold py-3 px-6 rounded-2xl hover:bg-primary transition-all active:scale-95"
                  >
                    Ver Candidatos <HiOutlineExternalLink size={16} />
                  </Link>
                </div>
              ))
            ) : (
              <div className="bg-white p-12 rounded-[32px] border border-dashed border-gray-200 text-center">
                <p className="text-gray-400 font-bold text-sm">
                  Sua lista de vagas está vazia.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* AGENDA E LINK DA PÁGINA */}
        <div className="space-y-4">
          <h2 className="text-lg font-black text-gray-800 px-2">
            Agenda Próxima
          </h2>
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
            {entrevistas.length > 0 ? (
              entrevistas.map((ent) => (
                <div key={ent.id_agendamento} className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex flex-col items-center justify-center font-black">
                    <span className="text-[10px] uppercase leading-none">
                      {new Date(ent.data_hora)
                        .toLocaleDateString("pt-BR", { month: "short" })
                        .replace(".", "")}
                    </span>
                    <span className="text-lg leading-none">
                      {new Date(ent.data_hora).getDate()}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-gray-800 truncate">
                      {ent.nome_candidato}
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium truncate">
                      {ent.titulo_vaga}
                    </p>
                    <span className="text-[10px] text-purple-600 font-bold flex items-center gap-1 mt-1">
                      <HiOutlineClock size={12} />{" "}
                      {new Date(ent.data_hora).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4">
                <p className="text-xs font-bold text-gray-400 italic">
                  Sem entrevistas hoje.
                </p>
              </div>
            )}
          </div>

          {/* CARD DA VITRINE (Link da Empresa) */}
          <div className="bg-gradient-to-br from-primary to-blue-700 p-6 rounded-[32px] text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
            <div className="relative z-10 space-y-3">
              <p className="text-[10px] font-black uppercase tracking-widest opacity-80">
                Link da Vitrine
              </p>
              <h3 className="font-black text-lg leading-tight">
                Atraia talentos direto no seu link.
              </h3>
              <button className="bg-white text-primary text-[11px] font-black px-5 py-2.5 rounded-full uppercase hover:bg-blue-50 transition-all active:scale-95 shadow-md">
                Copiar meu link
              </button>
            </div>
            <HiOutlineExternalLink
              size={100}
              className="absolute -bottom-6 -right-6 text-white/10 group-hover:scale-110 transition-transform duration-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponente de Card de Métrica (Puro visual)
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
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    purple: "bg-purple-50 text-purple-600",
    orange: "bg-orange-50 text-orange-600",
  };
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">
          {label}
        </p>
        <h3 className="text-2xl font-black text-gray-800 leading-tight tracking-tight">
          {value}
        </h3>
      </div>
    </div>
  );
}
