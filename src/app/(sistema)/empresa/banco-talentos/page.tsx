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
  HiOutlineBookmark,
  HiLockClosed,
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
  const filteredAreas = areas.filter(
    (area) =>
      area.total_candidatos > 0 &&
      area.nome.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // Calcula o total geral de candidatos disponíveis
  const totalCandidatos = areas.reduce(
    (acc, area) => acc + area.total_candidatos,
    0,
  );

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto py-10 px-6 md:px-10 space-y-8 animate-pulse">
        <div className="h-48 md:h-40 bg-gray-200 rounded-[32px] md:rounded-[40px] w-full"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-48 bg-gray-100 rounded-[32px]"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-6 md:px-10 space-y-10 animate-in fade-in duration-700">
      {/* HEADER PREMIUM */}
      <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 bg-surface p-8 md:p-12 rounded-[32px] md:rounded-[48px] shadow-sm border border-gray-100 relative overflow-hidden">
        {/* Elemento de Decoração Visual (Opcional, dá um charme) */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

        <div className="space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest">
            <HiOutlineSparkles size={16} />
            Banco de Talentos ACI
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">
            Descubra o candidato ideal
          </h1>
          <p className="text-muted max-w-2xl text-sm md:text-lg leading-relaxed">
            Navegue por nossas áreas de atuação e encontre profissionais
            qualificados e prontos para agregar valor à sua empresa.
          </p>
        </div>

        {/* ESTATÍSTICA GERAL */}
        <div className="flex flex-col items-start lg:items-end w-full lg:w-auto bg-gray-50/50 lg:bg-transparent p-6 lg:p-0 rounded-[24px] lg:rounded-none border lg:border-transparent border-gray-100 relative z-10 mt-2 lg:mt-0">
          <p className="text-xs md:text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">
            Profissionais Disponíveis
          </p>
          <div className="flex items-end gap-3 text-primary">
            <span className="text-5xl md:text-6xl font-black leading-none tracking-tighter">
              {totalCandidatos}
            </span>
            <HiOutlineUserGroup size={40} className="opacity-40 mb-1" />
          </div>
        </div>
      </header>

      {/* BARRA DE BUSCA E CONTROLES RÁPIDOS */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-5 md:gap-6">
        {/* BUSCA */}
        <div className="relative w-full lg:max-w-xl group">
          <HiOutlineSearch
            className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10"
            size={22}
          />
          <input
            type="text"
            placeholder="Buscar por área (Ex: Comercial, TI, Logística...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-16 pr-6 py-4 md:py-5 bg-surface border border-gray-200 rounded-full outline-none text-sm md:text-base font-medium transition-all focus:ring-4 focus:ring-primary/10 focus:border-primary shadow-sm placeholder:text-gray-400"
          />
        </div>

        {/* BOTÕES DE AÇÃO RÁPIDA */}
        <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto">
          <Link
            href="/empresa/meus-curriculos-salvos"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-surface border-2 border-gray-200 text-foreground rounded-full text-sm font-bold hover:border-primary hover:text-primary transition-all group"
          >
            <HiOutlineBookmark
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
            Currículos Salvos
          </Link>

          <Link
            href="/empresa/meus-desbloqueados"
            className="flex items-center justify-center gap-2 px-8 py-4 bg-primary text-surface rounded-full text-sm font-bold hover:bg-hover-button transition-all shadow-md shadow-primary/20 group"
          >
            <HiLockClosed
              size={18}
              className="group-hover:scale-110 transition-transform"
            />
            Meus Desbloqueados
          </Link>
        </div>
      </div>

      {/* GRID DE ÁREAS */}
      {filteredAreas.length === 0 ? (
        <div className="text-center py-20 bg-surface rounded-[32px] md:rounded-[40px] border border-dashed border-gray-200">
          <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-5">
            <HiOutlineSearch size={36} />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-foreground">
            Nenhuma área encontrada
          </h3>
          <p className="text-muted mt-2 text-sm md:text-base">
            Tente buscar por outro termo ou palavra-chave.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6">
          {filteredAreas.map((area) => (
            <Link
              key={area.id_area}
              href={`/empresa/banco-talentos/lista?area=${area.id_area}`}
              className="group flex flex-col justify-between bg-surface p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="w-14 h-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-surface transition-all duration-300">
                  <HiOutlineBriefcase size={26} />
                </div>
                <h3 className="text-lg md:text-xl font-black text-foreground leading-tight group-hover:text-primary transition-colors pr-2">
                  {area.nome}
                </h3>
              </div>

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-50">
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted mb-1">
                    Candidatos
                  </span>
                  <span className="text-lg md:text-xl font-bold text-emerald-600 flex items-center gap-2">
                    {area.total_candidatos}
                    <span className="relative flex h-2.5 w-2.5">
                      {area.total_candidatos > 0 && (
                        <>
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                        </>
                      )}
                    </span>
                  </span>
                </div>

                <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  <HiOutlineArrowRight
                    size={20}
                    className="group-hover:translate-x-1 transition-transform"
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
