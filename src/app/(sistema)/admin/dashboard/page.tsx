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
} from "react-icons/hi";
import Link from "next/link";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-10 text-center">Carregando...</div>;

  return (
    <div className="p-6 md:p-10 animate-in fade-in duration-500">
      <h1 className="text-2xl font-black text-gray-900 mb-8">
        Painel Administrativo
      </h1>

      {/* 1. CARDS DE TOTAIS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <StatCard
          title="Candidatos"
          value={data.totais.candidatos}
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
          title="Empresas"
          count={data.pendencias.empresasAguardando}
          label="Aguardando Aprovação"
          link="/admin/empresas?status=PENDENTE"
          color="border-purple-200"
        />
        <PendenciaCard
          title="Vagas"
          count={data.pendencias.vagasEmAnalise}
          label="Em Análise"
          link="/admin/vagas?status=EM_ANALISE"
          color="border-blue-200"
        />
        <PendenciaCard
          title="Habilidades"
          count={data.pendencias.competenciasSugeridas}
          label="Sugestões"
          link="/admin/competencias?status=PENDENTE"
          color="border-amber-200"
        />
        <PendenciaCard
          title="Financeiro"
          count={data.pendencias.pagamentosAguardando}
          label="Pagamentos"
          link="/admin/financeiro"
          color="border-emerald-200"
        />
      </div>
    </div>
  );
}

// Sub-componentes para manter o código limpo
function StatCard({ title, value, icon, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
      <div className={`p-4 bg-gray-50 rounded-2xl ${color}`}>{icon}</div>
      <div>
        <p className="text-sm font-bold text-gray-500 uppercase tracking-wider">
          {title}
        </p>
        <p className="text-3xl font-black text-gray-900">{value}</p>
      </div>
    </div>
  );
}

function PendenciaCard({ title, count, label, link, color }: any) {
  return (
    <Link
      href={link}
      className={`bg-white p-6 rounded-3xl border-2 ${color} hover:shadow-lg transition-all`}
    >
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-gray-800">{title}</h3>
        {count > 0 && (
          <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-full">
            NOVO
          </span>
        )}
      </div>
      <p className="text-4xl font-black text-gray-900 mb-1">{count}</p>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
        {label}
      </p>
    </Link>
  );
}
