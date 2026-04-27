"use client";

import { useEffect, useState } from "react";
import api from "@/src/services/api";
import Link from "next/link";
import {
  HiOutlineUserGroup,
  HiOutlineBriefcase,
  HiOutlineSearch,
  HiOutlineArrowRight,
  HiOutlineSparkles,
} from "react-icons/hi";
import toast from "react-hot-toast";

interface AreaCount {
  id_area: number;
  nome: string;
  total_candidatos: number;
}

export default function BancoTalentosDashboard() {
  const [areas, setAreas] = useState<AreaCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const buscarAreas = async () => {
      try {
        const res = await api.get("/empresas/banco-talentos/areas");
        setAreas(res.data.data || []);
      } catch (error) {
        console.error("Erro ao carregar áreas:", error);
        toast.error("Não foi possível carregar as áreas de atuação.");
      } finally {
        setIsLoading(false);
      }
    };
    buscarAreas();
  }, []);

  // Filtro local para a empresa achar a área rapidamente
  const filteredAreas = areas.filter((area) =>
    area.total_candidatos > 0 && area.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calcula o total geral de candidatos disponíveis
  const totalCandidatos = areas.reduce(
    (acc, area) => acc + area.total_candidatos,
    0,
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-10 space-y-8 animate-pulse">
        <div className="h-24 bg-gray-200 rounded-[32px] w-full max-w-3xl"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-[24px]"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 space-y-10 animate-in fade-in duration-700">
      {/* HEADER PREMIUM */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-white p-10 rounded-[40px] shadow-sm border border-gray-100">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-black uppercase tracking-widest">
            <HiOutlineSparkles size={16} />
            Banco de Talentos ACI
          </div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">
            Descubra o candidato ideal
          </h1>
          <p className="text-gray-500 max-w-xl text-lg leading-relaxed">
            Navegue por nossas áreas de atuação e encontre profissionais
            qualificados e prontos para agregar valor à sua empresa.
          </p>
        </div>

        {/* ESTATÍSTICA GERAL */}
        <div className="flex flex-col items-start lg:items-end min-w-fit">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
            Profissionais Disponíveis
          </p>
          <div className="flex items-end gap-3 text-blue-600">
            <span className="text-5xl font-black leading-none">
              {totalCandidatos}
            </span>
            <HiOutlineUserGroup size={36} className="text-blue-200 mb-1" />
          </div>
        </div>
      </header>

      {/* BARRA DE BUSCA E CONTROLES */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full max-w-md group">
          <HiOutlineSearch
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors z-10"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por área (Ex: Comercial, TI, Logística...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-14 pr-6 py-4 bg-white border border-gray-200 rounded-full outline-none text-sm font-medium transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 shadow-sm"
          />
        </div>

        {/* Link rápido para a "Gaveta" */}
        <Link
          href="/empresa/meus-desbloqueados"
          className="flex items-center gap-2 px-6 py-4 bg-gray-900 text-white rounded-full text-sm font-bold hover:bg-black transition-all hover:shadow-lg w-full sm:w-auto justify-center"
        >
          <HiOutlineBriefcase size={18} />
          Meus Desbloqueados
        </Link>
      </div>

      {/* GRID DE ÁREAS */}
      {filteredAreas.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-[40px] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
            <HiOutlineSearch size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-700">
            Nenhuma área encontrada
          </h3>
          <p className="text-gray-400 mt-2">Tente buscar por outro termo.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredAreas.map((area) => (
            <Link
              key={area.id_area}
              href={`/empresa/banco-talentos/lista?area=${area.id_area}`}
              className="group flex flex-col justify-between bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300">
                  <HiOutlineBriefcase size={24} />
                </div>
                <h3 className="text-xl font-black text-gray-800 leading-tight group-hover:text-blue-700 transition-colors">
                  {area.nome}
                </h3>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                    Candidatos
                  </span>
                  <span className="text-lg font-bold text-emerald-600 flex items-center gap-1.5">
                    {area.total_candidatos}
                    <span className="relative flex h-2 w-2">
                      {area.total_candidatos > 0 && (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </>
                      )}
                    </span>
                  </span>
                </div>

                <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <HiOutlineArrowRight
                    size={18}
                    className="group-hover:translate-x-0.5 transition-transform"
                  />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
