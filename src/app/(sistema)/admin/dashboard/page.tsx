"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";
import {
  HiOutlineUserGroup,
  HiOutlineOfficeBuilding,
  HiOutlineBriefcase,
  HiOutlineClock,
  HiOutlineLightningBolt,
  HiOutlineCash,
  HiOutlineCheckCircle,
  HiOutlineClipboardList,
} from "react-icons/hi";
import Link from "next/link";
import { ModalVagasAtivas } from "@/src/components/admin/dashboard/ModalVagasAtivas";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Estado que controla a abertura do relatório de vagas ativas
  const [isRelatorioOpen, setIsRelatorioOpen] = useState(false);

  useEffect(() => {
    const fetchResumo = async () => {
      try {
        const res = await api.get("/admin/dashboard/resumo");
        setData(res.data.data);
      } catch (err) {
        console.error("Erro ao carregar resumo", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResumo();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 font-bold animate-pulse">
      <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      Carregando indicadores...
    </div>
  );

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500">

      {/* HEADER COM BOTÃO DE RELATÓRIO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
          Painel Administrativo
        </h1>

        <button
          onClick={() => setIsRelatorioOpen(true)}
          className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-5 py-3 rounded-2xl font-bold text-sm transition-all shadow-sm"
        >
          <HiOutlineClipboardList size={20} />
          Ver Extrato de Vagas Ativas
        </button>
      </div>

      {/* 1. CARDS DE TOTAIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Inscritos"
          value={data.totais.candidatos}
          icon={<HiOutlineUserGroup />}
          color="text-blue-600"
        />
        <StatCard
          title="Banco de Currículos"
          value={data.totais.candidatosAtivos}
          icon={<HiOutlineUserGroup />}
          color="text-blue-600"
        />
        <StatCard
          title="Empresas Ativas"
          value={data.totais.empresas}
          icon={<HiOutlineOfficeBuilding />}
          color="text-purple-600"
        />
        <StatCard
          title="Vagas Ativas"
          value={data.totais.vagasAtivas}
          icon={<HiOutlineBriefcase />}
          color="text-emerald-600"
        />
      </div>

      <h2 className="text-lg font-black text-gray-800 mb-6">
        Ações Necessárias (Pendências)
      </h2>

      {/* 2. CARDS DE PENDÊNCIAS (Links diretos) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <PendenciaCard
          title="Vagas"
          count={data.pendencias.vagasEmAnalise}
          label="Em Análise"
          link="/admin/vagas?tab=EM_ANALISE"
          color="border-blue-200"
        />
        <PendenciaCard
          title="Habilidades"
          count={data.pendencias.competenciasSugeridas}
          label="Sugestões"
          link="/admin/catalogo"
          color="border-amber-200"
        />
        <PendenciaCard
          title="Financeiro"
          count={data.pendencias.pagamentosAguardando}
          label="Pagamentos"
          link="/admin/vagas?tab=AGUARDANDO_PAGAMENTO"
          color="border-emerald-200"
        />
      </div>

      {/* RENDERIZA O MODAL INVISIVELMENTE ATÉ SER ACIONADO */}
      <ModalVagasAtivas
        isOpen={isRelatorioOpen}
        onClose={() => setIsRelatorioOpen(false)}
      />
    </div>
  );
}

// Sub-componentes para manter o código limpo
function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex items-center gap-5">
      <div className={`p-4 bg-gray-50 rounded-2xl text-2xl ${color}`}>{icon}</div>
      <div>
        <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest mb-1">
          {title}
        </p>
        <p className="text-3xl font-black text-gray-900 leading-none">{value}</p>
      </div>
    </div>
  );
}

function PendenciaCard({ title, count, label, link, color }: any) {
  return (
    <Link
      href={link}
      className={`bg-white p-6 rounded-[32px] border-2 ${color} hover:shadow-lg transition-all flex flex-col group`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-black text-gray-800 group-hover:text-primary transition-colors">{title}</h3>
        {count > 0 && (
          <span className="px-2.5 py-1 bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-wider rounded-md animate-pulse">
            Novo
          </span>
        )}
      </div>
      <p className="text-4xl font-black text-gray-900 mb-2 leading-none">{count}</p>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
        {label}
      </p>
    </Link>
  );
}