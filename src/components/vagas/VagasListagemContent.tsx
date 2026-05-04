"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { JobCard, JobProps } from "@/src/components/JobCard";
import { BiUpArrowAlt } from "react-icons/bi";
import api from "@/src/services/api";
import { mapearVagaBackendParaFrontend } from "@/src/utils/vaga-adapter";
import { JobFilter, JobFilterPayload } from "../JobFilter";

// IMPORTANDO O NOVO COMPONENTE PODEROSO

const JobCardSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 p-6 h-full flex flex-col justify-between animate-pulse">
    <div className="space-y-4">
      <div className="flex justify-between">
        <div className="h-3 bg-gray-200 rounded w-1/3"></div>
        <div className="h-4 w-12 bg-gray-100 rounded-full"></div>
      </div>
      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
      <div className="flex gap-2 pt-2">
        <div className="h-6 w-20 bg-gray-100 rounded"></div>
        <div className="h-6 w-20 bg-gray-100 rounded"></div>
        <div className="h-6 w-20 bg-gray-100 rounded"></div>
      </div>
    </div>
    <div className="pt-6 mt-4 border-t border-gray-50 flex justify-between items-center">
      <div className="h-3 w-24 bg-gray-100 rounded"></div>
      <div className="h-9 w-32 bg-gray-200 rounded-full"></div>
    </div>
  </div>
);

interface VagasListagemProps {
  initialJobs: JobProps[];
  initialTotal: number;
  initialTotalPages: number;
  urlPrefix?: string;
  gridCols?: string;
}

export default function VagasListagemContent({
  initialJobs,
  urlPrefix = "",
  initialTotal,
  initialTotalPages,
  gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
}: VagasListagemProps) {
  const [jobs, setJobs] = useState<JobProps[]>(initialJobs);
  const [totalVagas, setTotalVagas] = useState(initialTotal);
  const [totalPaginas, setTotalPaginas] = useState(initialTotalPages);

  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  const [paginaAtual, setPaginaAtual] = useState(1);

  // O único estado de filtro que a lista precisa conhecer
  const [apiParams, setApiParams] = useState<JobFilterPayload>({});

  const loaderRef = useRef(null);

  // --- INTEGRAÇÃO COM A API ---
  const carregarVagas = useCallback(
    async (
      pagina: number,
      parametrosFiltro: JobFilterPayload,
      resetar: boolean = false,
    ) => {
      if (pagina === 1) setIsLoading(true);
      else setIsFetchingMore(true);

      try {

        const response = await api.get("/vagas", {
          params: {
            pagina,
            limite: 9,
            ...parametrosFiltro, // Espalha os parâmetros que vieram do JobFilter
          },
        });

        const { dados, paginacao } = response.data;
        const vagasMapeadas = dados.map(mapearVagaBackendParaFrontend);

        setJobs((prev) =>
          resetar ? vagasMapeadas : [...prev, ...vagasMapeadas],
        );
        setTotalPaginas(paginacao.total_paginas);
        setTotalVagas(paginacao.total);
        setPaginaAtual(paginacao.pagina_atual);
      } catch (error) {
        console.error("Erro ao buscar vagas", error);
      } finally {
        setIsLoading(false);
        setIsFetchingMore(false);
      }
    },
    [], // useCallback limpo e otimizado!
  );

  // --- LÓGICA DO INFINITE SCROLL ---
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          !isLoading &&
          !isFetchingMore &&
          paginaAtual < totalPaginas
        ) {
          // Chama a próxima página usando os filtros armazenados no estado
          carregarVagas(paginaAtual + 1, apiParams);
        }
      },
      { root: null, rootMargin: "20px", threshold: 1.0 },
    );

    if (loaderRef.current) observer.observe(loaderRef.current);
    return () => {
      if (loaderRef.current) observer.unobserve(loaderRef.current);
    };
  }, [
    carregarVagas,
    isLoading,
    isFetchingMore,
    paginaAtual,
    totalPaginas,
    apiParams,
  ]);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <div className="w-full bg-gray-50 min-h-screen pb-20">
      {/* O COMPONENTE DE FILTRO PODEROSO ENTRA AQUI */}
      <JobFilter
        totalVagas={totalVagas}
        isLoading={isLoading}
        onFilterChange={(novosFiltros) => {
          // Salva os filtros no estado para o infinite scroll lembrar deles
          setApiParams(novosFiltros);
          // Dispara a busca voltando para a página 1
          carregarVagas(1, novosFiltros, true);
        }}
      />

      {/* --- CONTEÚDO PRINCIPAL --- */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
        {/* LISTA DE VAGAS */}
        <div className={`grid gap-6 ${gridCols}`}>
          {isLoading ? (
            <>
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </>
          ) : jobs.length > 0 ? (
            jobs.map((job) => (
              <JobCard key={job.id} job={job} urlPrefix={urlPrefix} />
            ))
          ) : (
            <div className="col-span-full py-20 text-center">
              <h3 className="text-xl font-bold text-gray-700">
                Nenhuma vaga encontrada.
              </h3>
              <p className="text-gray-500 mt-2">
                Tente ajustar seus filtros ou mudar o termo da busca.
              </p>
            </div>
          )}

          {isFetchingMore && (
            <>
              <JobCardSkeleton />
              <JobCardSkeleton />
              <JobCardSkeleton />
            </>
          )}
        </div>

        {/* LOADER INFINITO */}
        {!isLoading && paginaAtual < totalPaginas && (
          <div
            ref={loaderRef}
            className="w-full h-20 mt-8 opacity-0 pointer-events-none"
          >
            Observador
          </div>
        )}

        {!isLoading &&
          !isFetchingMore &&
          jobs.length > 0 &&
          paginaAtual >= totalPaginas && (
            <div className="w-full text-center py-10 text-gray-400 font-medium">
              <p>Você chegou ao fim da lista!</p>
            </div>
          )}
      </div>

      {/* BOTÃO FLUTUANTE VOLTAR AO TOPO */}
      <button
        onClick={scrollToTop}
        className={`
            fixed bottom-8 right-8 z-50 p-4 rounded-full bg-primary text-white shadow-lg 
            hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300
            ${showScrollTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10 pointer-events-none"}
        `}
        aria-label="Voltar ao topo"
      >
        <BiUpArrowAlt className="text-2xl" />
      </button>
    </div>
  );
}
