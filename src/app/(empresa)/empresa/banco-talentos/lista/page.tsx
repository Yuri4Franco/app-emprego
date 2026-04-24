"use client";

import { useEffect, useState, Suspense } from "react";
import api from "@/src/services/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineLightningBolt,
  HiOutlineFilter,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineBadgeCheck,
  HiOutlineSearch,
} from "react-icons/hi";
import toast from "react-hot-toast";

// Interface para tipar o que vem do seu Backend
interface CandidatoResumo {
  id_candidato: number;
  identificacao_publica: string; // Ex: Candidato #1042 - Desenvolvedor
  cidade: string;
  uf: string;
  primeiro_emprego: boolean;
  pcd: boolean;
  areas: string[];
  experiencias: any[];
}

// Dicionário de Turnos para o Select do Filtro
const turnosOptions = [
  { value: "", label: "Qualquer Turno" },
  { value: "HORARIO_COMERCIAL", label: "Horário Comercial" },
  { value: "PRIMEIRO_TURNO", label: "1º Turno (Manhã)" },
  { value: "SEGUNDO_TURNO", label: "2º Turno (Tarde/Noite)" },
  { value: "TERCEIRO_TURNO", label: "3º Turno (Madrugada)" },
];

function VitrineConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados dos Dados
  const [candidatos, setCandidatos] = useState<CandidatoResumo[]>([]);
  const [paginacao, setPaginacao] = useState({
    pagina_atual: 1,
    total_paginas: 1,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Estados dos Filtros (Lidos da URL inicialmente)
  const [filtroArea, setFiltroArea] = useState(searchParams.get("area") || "");
  const [filtroTurno, setFiltroTurno] = useState(
    searchParams.get("turno") || "",
  );
  const [filtroPcd, setFiltroPcd] = useState(
    searchParams.get("pcd") === "true",
  );
  const [filtroPrimeiroEmprego, setFiltroPrimeiroEmprego] = useState(
    searchParams.get("primeiro_emprego") === "true",
  );
  const paginaAtual = Number(searchParams.get("pagina")) || 1;

  // Função central de busca
  const buscarCandidatos = async () => {
    setIsLoading(true);
    try {
      // Monta a URL de busca baseada nos states atuais
      const params = new URLSearchParams();
      if (filtroArea) params.append("area", filtroArea);
      if (filtroTurno) params.append("turno", filtroTurno);
      if (filtroPcd) params.append("pcd", "true");
      if (filtroPrimeiroEmprego) params.append("primeiro_emprego", "true");
      params.append("pagina", paginaAtual.toString());

      const res = await api.get(
        `/empresas/banco-talentos?${params.toString()}`,
      );

      setCandidatos(res.data.dados);
      setPaginacao(res.data.paginacao);

      // Atualiza a URL invisívelmente para manter o histórico (se o cara der F5, os filtros continuam)
      router.replace(`/empresa/banco-talentos/lista?${params.toString()}`, {
        scroll: false,
      });
    } catch (error) {
      toast.error("Erro ao buscar talentos.");
    } finally {
      setIsLoading(false);
    }
  };

  // Dispara a busca toda vez que um filtro ou a página muda
  useEffect(() => {
    buscarCandidatos();
  }, [filtroArea, filtroTurno, filtroPcd, filtroPrimeiroEmprego, paginaAtual]);

  // Handler para trocar de página
  const mudarPagina = (novaPagina: number) => {
    if (novaPagina < 1 || novaPagina > paginacao.total_paginas) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("pagina", novaPagina.toString());
    router.push(`/empresa/banco-talentos/lista?${params.toString()}`);
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 animate-in fade-in duration-700">
      {/* HEADER DA VITRINE */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
          <HiOutlineBriefcase className="text-blue-600" />
          Vitrine de Talentos
        </h1>
        <p className="text-gray-500 mt-2">
          Mostrando <strong className="text-gray-800">{paginacao.total}</strong>{" "}
          candidatos disponíveis.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ========================================= */}
        {/* SIDEBAR DE FILTROS (Lado Esquerdo)        */}
        {/* ========================================= */}
        <aside className="w-full lg:w-80 shrink-0 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm sticky top-8">
          <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-50">
            <HiOutlineFilter size={20} className="text-gray-400" />
            <h2 className="text-lg font-black text-gray-800">Filtros</h2>
          </div>

          <div className="space-y-6">
            {/* Filtro: Turno */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">
                Turno de Trabalho
              </label>
              <select
                value={filtroTurno}
                onChange={(e) => setFiltroTurno(e.target.value)}
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] outline-none text-sm font-medium text-gray-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer"
              >
                {turnosOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Filtros: Toggles (Primeiro Emprego e PcD) */}
            <div className="space-y-4 pt-4">
              <label className="flex items-center justify-between cursor-pointer group bg-blue-50/50 p-4 rounded-[20px] border border-blue-50 hover:bg-blue-50 transition-colors">
                <span className="text-sm font-bold text-blue-900 group-hover:text-blue-700 transition-colors">
                  Apenas 1º Emprego
                </span>
                <input
                  type="checkbox"
                  checked={filtroPrimeiroEmprego}
                  onChange={(e) => setFiltroPrimeiroEmprego(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer group p-4 rounded-[20px] border border-gray-100 hover:bg-gray-50 transition-colors">
                <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 transition-colors">
                  Candidatos PcD
                </span>
                <input
                  type="checkbox"
                  checked={filtroPcd}
                  onChange={(e) => setFiltroPcd(e.target.checked)}
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </label>
            </div>

            {/* Botão de Limpar Filtros */}
            {(filtroTurno ||
              filtroPcd ||
              filtroPrimeiroEmprego ||
              filtroArea) && (
              <button
                onClick={() => {
                  setFiltroArea("");
                  setFiltroTurno("");
                  setFiltroPcd(false);
                  setFiltroPrimeiroEmprego(false);
                  router.push("/empresa/banco-talentos/lista");
                }}
                className="w-full py-3 text-sm font-bold text-gray-400 hover:text-red-500 transition-colors"
              >
                Limpar todos os filtros
              </button>
            )}
          </div>
        </aside>

        {/* ========================================= */}
        {/* ÁREA CENTRAL: LISTA DE CANDIDATOS         */}
        {/* ========================================= */}
        <main className="flex-1 w-full space-y-6">
          {isLoading ? (
            /* SKELETON DE CARREGAMENTO */
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 bg-white border border-gray-100 rounded-[32px] animate-pulse"
                ></div>
              ))}
            </div>
          ) : candidatos.length === 0 ? (
            /* ESTADO VAZIO */
            <div className="bg-white rounded-[40px] border border-dashed border-gray-200 p-16 text-center">
              <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-4">
                <HiOutlineSearch size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800">
                Nenhum talento encontrado
              </h3>
              <p className="text-gray-500 mt-2">
                Tente ajustar ou remover alguns filtros na barra lateral.
              </p>
            </div>
          ) : (
            /* LISTA REAL DOS CARDS */
            <>
              <div className="space-y-4">
                {candidatos.map((candidato) => (
                  <Link
                    key={candidato.id_candidato}
                    href={`/empresa/banco-talentos/${candidato.id_candidato}`}
                    className="block bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* INFO PRINCIPAL */}
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          {candidato.primeiro_emprego && (
                            <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-md">
                              1º Emprego
                            </span>
                          )}
                          {candidato.pcd && (
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-md">
                              PcD
                            </span>
                          )}
                        </div>

                        <h3 className="text-xl font-black text-gray-900 group-hover:text-blue-700 transition-colors">
                          {candidato.identificacao_publica}
                        </h3>

                        <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-gray-500">
                          <span className="flex items-center gap-1.5">
                            <HiOutlineLocationMarker className="text-gray-400" />
                            {candidato.cidade}, {candidato.uf}
                          </span>

                          {/* Mostra a última experiência como contexto rápido (se tiver) */}
                          {!candidato.primeiro_emprego &&
                            candidato.experiencias &&
                            candidato.experiencias.length > 0 && (
                              <>
                                <span className="hidden md:inline text-gray-300">
                                  •
                                </span>
                                <span className="flex items-center gap-1.5 text-gray-600">
                                  <HiOutlineBadgeCheck className="text-gray-400" />
                                  {candidato.experiencias[0].cargo} na{" "}
                                  {candidato.experiencias[0].empresa}
                                </span>
                              </>
                            )}
                        </div>
                      </div>

                      {/* BOTÃO DE AÇÃO */}
                      <div className="shrink-0 mt-4 md:mt-0">
                        <span className="inline-flex items-center justify-center px-6 py-3 bg-gray-50 text-gray-700 font-bold rounded-full group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          Analisar Perfil
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* CONTROLES DE PAGINAÇÃO */}
              {paginacao.total_paginas > 1 && (
                <div className="flex items-center justify-between bg-white px-8 py-4 rounded-full border border-gray-100 shadow-sm mt-8">
                  <button
                    onClick={() => mudarPagina(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                    className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 disabled:opacity-30 transition-colors"
                  >
                    <HiOutlineChevronLeft size={18} /> Anterior
                  </button>
                  <span className="text-sm font-bold text-gray-400">
                    Página{" "}
                    <strong className="text-gray-800">{paginaAtual}</strong> de{" "}
                    {paginacao.total_paginas}
                  </span>
                  <button
                    onClick={() => mudarPagina(paginaAtual + 1)}
                    disabled={paginaAtual === paginacao.total_paginas}
                    className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 disabled:opacity-30 transition-colors"
                  >
                    Próxima <HiOutlineChevronRight size={18} />
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

// O Next.js 13+ exige que componentes que usam useSearchParams sejam encapsulados num Suspense
export default function VitrinePage() {
  return (
    <Suspense
      fallback={
        <div className="p-20 text-center text-gray-400 font-bold animate-pulse">
          Carregando Vitrine...
        </div>
      }
    >
      <VitrineConteudo />
    </Suspense>
  );
}
