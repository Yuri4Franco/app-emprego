"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { JobCard, JobProps } from "@/src/components/JobCard";
import { ButtonType } from "@/src/components/ButtonType";
import { FilterSelect } from "@/src/components/FilterSelect";
import { AdvancedFilterModal } from "@/src/components/AdvancedFilterModal";
import { AdvancedFilterData } from "@/src/components/AdvancedFilterModal";
import {
    BiSearchAlt,
    BiSliderAlt,
    BiTrash,
    BiUpArrowAlt,
} from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import api from "@/src/services/api";
import { mapearVagaBackendParaFrontend } from "@/src/utils/vaga-adapter";
import { JobFilters } from "../JobFilter";

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
    gridCols = "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
}: VagasListagemProps) {
    const [jobs, setJobs] = useState<JobProps[]>(initialJobs);
    const [totalVagas, setTotalVagas] = useState(initialTotal);
    const [totalPaginas, setTotalPaginas] = useState(initialTotalPages);
    const [isLoading, setIsLoading] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState(1);
    const [filtrosAvancados, setFiltrosAvancados] = useState<AdvancedFilterData | null>(null);

    // Estados de Filtro
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [pcdOnly, setPcdOnly] = useState(false);
    const [busca, setBusca] = useState("");
    const [termoBuscado, setTermoBuscado] = useState("");

    const loaderRef = useRef(null);

    // --- INTEGRAÇÃO COM A API ---
    const carregarVagas = useCallback(
        async (pagina: number, resetar: boolean = false) => {
            if (pagina === 1) setIsLoading(true);
            else setIsFetchingMore(true);

            try {
                // 1. Lendo os filtros da barra rápida (Adicionado o modeloFiltro que faltava!)
                const cidadeFiltro = activeFilters.find((f) => f.includes(" - RS"))?.split(" - ")[0];
                const contratoFiltro = activeFilters.find((f) => ["CLT", "PJ", "Estágio", "Temporário"].includes(f));
                const modeloFiltro = activeFilters.find((f) => ["Presencial", "Híbrido", "Remoto"].includes(f));

                // 2. Montando o pacote de dados unindo a Barra Rápida + Gaveta Avançada
                const paramsParaEnviar: any = {
                    pagina,
                    limite: 9,
                    busca: termoBuscado || undefined,

                    // Dados da barra rápida
                    cidade: cidadeFiltro || undefined,
                    tipo_contrato: contratoFiltro ? contratoFiltro.toUpperCase() : undefined,
                    modelo_trabalho: modeloFiltro ? modeloFiltro.toUpperCase() : undefined,
                    somente_pcd: pcdOnly ? true : undefined,

                    // Dados da Gaveta Avançada
                    nivel_hierarquico: filtrosAvancados?.niveis?.join(',') || undefined,
                    // Se o usuário marcou modelo na gaveta, sobrescreve o da barra rápida (ou você pode juntar os dois depois)
                    ...(filtrosAvancados?.modelos?.length ? { modelo_trabalho: filtrosAvancados.modelos.join(',') } : {}),
                    salario_min: filtrosAvancados?.salarioMin || undefined,
                    salario_max: filtrosAvancados?.salarioMax || undefined,
                    tipo_pcd: filtrosAvancados?.pcd !== "TODAS" ? filtrosAvancados?.pcd : undefined,
                };

                // 3. Usa o objeto perfeito que acabamos de montar
                const response = await api.get("/vagas", {
                    params: paramsParaEnviar,
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
        [termoBuscado, activeFilters, pcdOnly], // pcdOnly adicionado nas dependências
    );

    // Carrega a página 1 sempre que buscar, mudar filtro ou clicar no botão PCD
    useEffect(() => {
        carregarVagas(1, true);
    }, [termoBuscado, activeFilters, pcdOnly, carregarVagas]);

    const handleBusca = () => {
        setTermoBuscado(busca);
    };

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
                    carregarVagas(paginaAtual + 1);
                }
            },
            { root: null, rootMargin: "20px", threshold: 1.0 },
        );

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => {
            if (loaderRef.current) observer.unobserve(loaderRef.current);
        };
    }, [carregarVagas, isLoading, isFetchingMore, paginaAtual, totalPaginas]);

    const handleFilterToggle = (value: string) => {
        setActiveFilters((prev) => {
            if (prev.includes(value)) return prev.filter((item) => item !== value);
            return [...prev, value];
        });
    };

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

    return (
        <div className="w-full bg-gray-50 min-h-screen pb-20">
            {/* CABEÇALHO */}

            <JobFilters onFilterChange={(filtros) => {
                // Aqui você pode transformar os filtros avançados em filtros rápidos ou apenas guardar o que veio da gaveta e deixar o useEffect cuidar do resto
                setFiltrosAvancados(filtros);
            }} />

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">

                {/* ÁREA DE FILTROS ATIVOS + BOTÃO LIXEIRA */}
                {(activeFilters.length > 0 || pcdOnly) && (
                    <div className="flex flex-wrap items-center gap-2 mb-6 animate-in fade-in">
                        {activeFilters.map((filter) => (
                            <span
                                key={filter}
                                className="inline-flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-lg bg-white border border-blue-100 text-primary text-sm font-medium shadow-sm"
                            >
                                {filter}
                                <button
                                    onClick={() => handleFilterToggle(filter)}
                                    className="hover:bg-blue-50 rounded-md p-0.5 transition-colors"
                                >
                                    <IoClose className="text-gray-400 hover:text-red-500 text-lg" />
                                </button>
                            </span>
                        ))}

                        {pcdOnly && (
                            <span className="inline-flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-lg bg-white border border-purple-200 text-purple-700 text-sm font-medium shadow-sm">
                                Vagas PCD
                                <button
                                    onClick={() => setPcdOnly(false)}
                                    className="hover:bg-purple-50 rounded-md p-0.5 transition-colors"
                                >
                                    <IoClose className="text-gray-400 hover:text-red-500 text-lg" />
                                </button>
                            </span>
                        )}

                        <div className="h-full border-l border-gray-300 mx-2 w-px h-6"></div>

                        <button
                            onClick={() => {
                                setActiveFilters([]);
                                setPcdOnly(false);
                                setTermoBuscado("");
                                setBusca("");
                            }}
                            className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 transition-colors text-sm font-medium"
                            title="Limpar todos os filtros"
                        >
                            <BiTrash className="text-lg group-hover:scale-110 transition-transform" />
                            <span>Limpar</span>
                        </button>
                    </div>
                )}

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
                        jobs.map((job) => <JobCard key={job.id} job={job} urlPrefix={urlPrefix} />)
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

            <AdvancedFilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={(filters) => {
                    setFiltrosAvancados(filters); // Salva o que a gaveta enviou
                    setIsFilterModalOpen(false);  // Fecha a gaveta
                    // O useEffect que você já tem vai notar a mudança e chamar a API sozinho!
                }}
            />

        </div>
    );
}