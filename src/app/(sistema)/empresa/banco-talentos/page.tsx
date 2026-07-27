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
  HiOutlineBadgeCheck,
  HiOutlineUsers,
} from "react-icons/hi";
import toast from "react-hot-toast";
import { AlertaCreditosCurriculo } from "@/src/components/empresa/banco-talentos/BancoTalentosBanner";

interface AreaCount {
  id_area: number;
  nome: string;
  total_candidatos: number;
}

export default function BancoTalentosDashboard() {
  const [areas, setAreas] = useState<AreaCount[]>([]);
  const [totalRealCandidatos, setTotalRealCandidatos] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAssociada, setIsAssociada] = useState(false);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resAreas, resPerfil] = await Promise.all([
          api.get("/empresas/banco-talentos/areas"),
          api.get("/empresa/perfil").catch(() => null),
        ]);

        const responseData = resAreas.data.data || resAreas.data;

        // Agora apontamos certinho para o array "areas" e para o "total_geral"
        setAreas(responseData.areas || []);
        setTotalRealCandidatos(responseData.total_geral || 0);

        if (
          resPerfil?.data?.tipo_vinculo_aci === "ASSOCIADA" ||
          resPerfil?.data?.data?.tipo_vinculo_aci === "ASSOCIADA"
        ) {
          setIsAssociada(true);
        }
      } catch (error) {
        console.error("Erro ao carregar os dados:", error);
        toast.error("Não foi possível carregar as informações do banco.");
      } finally {
        setIsLoading(false);
      }
    };
    carregarDados();
  }, []);

  const filteredAreas = areas.filter(
    (area) =>
      area.total_candidatos > 0 &&
      area.nome.toLowerCase().includes(searchTerm.toLowerCase()),
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
      <AlertaCreditosCurriculo />
      {/* ================= HEADER PREMIUM ================= */}
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-surface p-8 md:p-12 rounded-[32px] md:rounded-[48px] shadow-sm border border-gray-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>

        <div className="space-y-4 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border border-primary/20">
              <HiOutlineSparkles size={16} />
              Banco de Talentos
            </div>
            {isAssociada && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100 shadow-sm">
                <HiOutlineBadgeCheck size={16} />
                Membro ACI
              </div>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-tight">
            Descubra o talento ideal
          </h1>
          <p className="text-muted max-w-2xl text-sm md:text-base leading-relaxed">
            Navegue por nossas áreas de atuação e encontre profissionais
            qualificados e prontos para agregar valor à sua empresa.
          </p>
        </div>

        {/* ESTATÍSTICA GERAL (AGORA COM O VALOR REAL) */}
        <div className="flex flex-col items-start lg:items-end w-full lg:w-auto bg-gray-50 lg:bg-transparent p-6 lg:p-0 rounded-[24px] lg:rounded-none border lg:border-transparent border-gray-100 relative z-10 shrink-0">
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">
            Profissionais Disponíveis
          </p>
          <div className="flex items-end gap-3 text-primary">
            <span
              className="text-5xl md:text-6xl font-black leading-none tracking-tighter"
              title="Número real de currículos únicos no banco"
            >
              {totalRealCandidatos}
            </span>
            <HiOutlineUserGroup size={40} className="opacity-30 mb-1" />
          </div>
        </div>


      </header>



      {/* ================= BARRA DE BUSCA E CONTROLES ================= */}
      <div className="flex flex-col lg:flex-row items-center justify-between gap-5 md:gap-6 bg-surface p-3 md:p-4 rounded-[28px] md:rounded-full border border-gray-100 shadow-sm">
        <div className="relative w-full lg:max-w-xl group">
          <HiOutlineSearch
            className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors z-10"
            size={20}
          />
          <input
            type="text"
            placeholder="Buscar por área (Ex: Comercial, TI, Logística...)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-gray-50 md:bg-transparent border border-gray-200 md:border-transparent rounded-full outline-none text-sm font-medium transition-all focus:bg-gray-50 focus:border-gray-200 placeholder:text-gray-400"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch gap-2 w-full lg:w-auto shrink-0">
          <Link
            href="/empresa/banco-talentos/meus-curriculos-salvos"
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-50 border border-gray-200 text-foreground rounded-full text-xs font-black uppercase tracking-widest hover:border-primary hover:text-primary transition-all group"
          >
            <HiOutlineBookmark
              size={16}
              className="group-hover:scale-110 transition-transform"
            />
            Salvos
          </Link>

          {!isAssociada && (
            <Link
              href="/empresa/banco-talentos/meus-desbloqueados"
              className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary text-surface rounded-full text-xs font-black uppercase tracking-widest hover:bg-hover-button transition-all shadow-md shadow-primary/20 group"
            >
              <HiLockClosed
                size={16}
                className="group-hover:scale-110 transition-transform"
              />
              Desbloqueados
            </Link>
          )}
        </div>
      </div>

      {/* ================= GRID DE ÁREAS ================= */}
      {filteredAreas.length === 0 && searchTerm !== "" ? (
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
          {/* CARD ESTÁTICO: GERAL/TODOS */}
          <Link
            href={`/empresa/banco-talentos/lista`}
            className="group flex flex-col justify-between bg-gradient-to-br from-blue-50 to-white p-6 md:p-8 rounded-[32px] border border-blue-100 shadow-sm hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
          >
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 bg-white text-primary rounded-[14px] flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-white group-hover:shadow-md transition-all duration-300 border border-blue-100">
                  <HiOutlineUsers size={22} />
                </div>

                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 border border-blue-200 rounded-full">
                  <span className="text-xs font-black text-blue-800">
                    {totalRealCandidatos}
                  </span>
                </div>
              </div>

              <h3 className="text-lg font-black text-blue-900 leading-tight group-hover:text-primary transition-colors pr-2">
                Todos os Profissionais
              </h3>
            </div>

            <div className="flex items-center justify-between mt-8 pt-5 border-t border-blue-100/50">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 group-hover:text-primary transition-colors">
                Busca Geral
              </span>

              <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-blue-400 group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                <HiOutlineArrowRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </div>
            </div>
          </Link>

          {/* DEMAIS ÁREAS MAPEADAS */}
          {filteredAreas.map((area) => (
            <Link
              key={area.id_area}
              href={`/empresa/banco-talentos/lista?area=${area.id_area}`}
              className="group flex flex-col justify-between bg-surface p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="w-12 h-12 bg-gray-50 text-gray-400 rounded-[14px] flex items-center justify-center group-hover:scale-110 group-hover:bg-primary group-hover:text-surface group-hover:shadow-md transition-all duration-300 border border-gray-100 group-hover:border-primary">
                    <HiOutlineBriefcase size={22} />
                  </div>

                  <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
                    <span className="text-xs font-black text-emerald-700">
                      {area.total_candidatos}
                    </span>
                  </div>
                </div>

                <h3 className="text-lg font-black text-foreground leading-tight group-hover:text-primary transition-colors pr-2">
                  {area.nome}
                </h3>
              </div>

              <div className="flex items-center justify-between mt-8 pt-5 border-t border-gray-50">
                <span className="text-[10px] font-black uppercase tracking-widest text-muted group-hover:text-primary transition-colors">
                  Ver Profissionais
                </span>

                <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-surface transition-colors shadow-sm">
                  <HiOutlineArrowRight
                    size={16}
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
