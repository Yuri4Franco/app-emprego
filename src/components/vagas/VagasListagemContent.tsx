"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { JobCard, JobProps } from "@/src/components/JobCard";
import { ButtonType } from "@/src/components/ButtonType";
import { FilterSelect } from "@/src/components/FilterSelect";
import { AdvancedFilterModal } from "@/src/components/AdvancedFilterModal";
import {
    BiSearchAlt,
    BiSliderAlt,
    BiTrash,
    BiUpArrowAlt,
} from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import api from "@/src/services/api"; // Importando sua API

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

// --- FUNÇÕES UTILITÁRIAS PARA O CARD ---
const formatarTempo = (dataISO: string) => {
    if (!dataISO) return "Recentemente";
    const dias = Math.floor(
        (new Date().getTime() - new Date(dataISO).getTime()) / (1000 * 3600 * 24),
    );
    if (dias < 7) return `${dias} dias`;
    if (dias < 30) return `${Math.floor(dias / 7)} sem`;
    return `${Math.floor(dias / 30)} mês(es)`;
};

const formatarSalario = (vaga: any) => {
    if (vaga.ocultar_salario) return undefined;
    if (vaga.salario_a_combinar) return "A combinar";
    if (vaga.faixa_salarial_de && vaga.faixa_salarial_ate) {
        return `R$ ${vaga.faixa_salarial_de} - R$ ${vaga.faixa_salarial_ate}`;
    }
    if (vaga.faixa_salarial_de) return `A partir de R$ ${vaga.faixa_salarial_de}`;
    return undefined;
};

// Função para mapear os dados sujos do Backend para a tipagem limpa do Frontend
const mapearVagaBackendParaFrontend = (vagaBackend: any): JobProps => {
    return {
        id: vagaBackend.id_vaga,
        company: vagaBackend.empresa_confidencial
            ? "Empresa Confidencial"
            : vagaBackend.empresa?.nome_fantasia || "Empresa Confidencial",
        title: vagaBackend.titulo,
        location: vagaBackend.cidade || "Panambi",
        type: vagaBackend.modelo_trabalho,
        contract: vagaBackend.tipo_contrato,
        salary: formatarSalario(vagaBackend),
        datePosted: formatarTempo(vagaBackend.data_publicacao),
        isNew:
            Math.floor(
                (new Date().getTime() -
                    new Date(vagaBackend.data_publicacao).getTime()) /
                (1000 * 3600 * 24),
            ) <= 3,
        isMember: true, // Aqui você pode depois cruzar com o vinculo_aci da empresa
        pcdType: null, // Ajuste caso seu backend comece a filtrar vagas afirmativas
    };
};

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
    // Agora o initialJobs já vem tipado como JobProps[] do servidor
    const [jobs, setJobs] = useState<JobProps[]>(initialJobs);
    const [totalVagas, setTotalVagas] = useState(initialTotal);
    const [totalPaginas, setTotalPaginas] = useState(initialTotalPages);
    const [isLoading, setIsLoading] = useState(false);
    const [activeFilters, setActiveFilters] = useState<string[]>([]);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [isFetchingMore, setIsFetchingMore] = useState(false);
    const [paginaAtual, setPaginaAtual] = useState(1);

    // Busca
    const [busca, setBusca] = useState("");
    const [termoBuscado, setTermoBuscado] = useState(""); // Usado para disparar a API só quando clicar em buscar

    const loaderRef = useRef(null);

    // --- INTEGRAÇÃO COM A API ---
    const carregarVagas = useCallback(
        async (pagina: number, resetar: boolean = false) => {
            if (pagina === 1) setIsLoading(true);
            else setIsFetchingMore(true);

            try {
                const cidadeFiltro =
                    activeFilters.find((f) => f.includes(" - RS"))?.split(" - ")[0] ||
                    undefined;

                const response = await api.get("/vagas", {
                    params: {
                        pagina,
                        limite: 9,
                        busca: termoBuscado || undefined,
                        cidade: cidadeFiltro,
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
        [termoBuscado, activeFilters],
    );

    // Carrega a página 1 sempre que o termo buscado ou os filtros mudarem
    useEffect(() => {
        carregarVagas(1, true);
    }, [termoBuscado, activeFilters, carregarVagas]);

    // Dispara a busca ao pressionar ENTER ou clicar no botão
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
            <div className="bg-white border-b border-gray-200 pb-8 md:px-8 shadow-sm">
                <div className="max-w-7xl mx-auto space-y-6 p-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            {isLoading
                                ? "Buscando vagas..."
                                : `${totalVagas} Vagas encontradas`}
                        </h1>
                        <p className="text-gray-500 text-sm">Atualizado em tempo real</p>
                    </div>

                    {/* BARRA DE PESQUISA */}
                    <div className="flex gap-3 w-full">
                        <div className="flex-1 flex items-center px-4 bg-gray-100 rounded-full border border-transparent focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-blue-50 transition-all h-12">
                            <BiSearchAlt className="text-gray-400 text-xl mr-3" />
                            <input
                                type="text"
                                placeholder="Cargo, empresa ou palavra-chave..."
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleBusca()}
                                className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-500"
                            />
                        </div>

                        <button
                            onClick={() => setIsFilterModalOpen(true)}
                            className="h-12 w-12 shrink-0 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-primary hover:border-primary transition-all bg-white"
                            title="Filtros Avançados"
                        >
                            <BiSliderAlt className="text-xl" />
                        </button>

                        <ButtonType
                            onClick={handleBusca}
                            className="h-12 px-8 rounded-full hidden md:flex"
                        >
                            Buscar
                        </ButtonType>
                    </div>

                    {/* FILTROS RÁPIDOS */}
                    <div className="flex flex-wrap items-center gap-3">
                        <FilterSelect
                            label="Localização"
                            options={["Panambi - RS", "Condor - RS", "Ijuí - RS", "Remoto"]}
                            activeFilters={activeFilters}
                            onToggle={handleFilterToggle}
                        />
                        <FilterSelect
                            label="Modelo"
                            options={["Presencial", "Híbrido", "Remoto"]}
                            activeFilters={activeFilters}
                            onToggle={handleFilterToggle}
                        />
                        <FilterSelect
                            label="Contrato"
                            options={["CLT", "PJ", "Estágio", "Temporário"]}
                            activeFilters={activeFilters}
                            onToggle={handleFilterToggle}
                        />

                        <label className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-300 bg-white cursor-pointer hover:border-gray-400 select-none transition-colors">
                            <input
                                type="checkbox"
                                className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300"
                            />
                            <span className="text-sm font-medium text-gray-600">
                                Vaga PCD
                            </span>
                        </label>
                    </div>
                </div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">
                {/* ÁREA DE FILTROS ATIVOS + BOTÃO LIXEIRA */}
                {activeFilters.length > 0 && (
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

                        <div className="h-full border-l border-gray-300 mx-2 w-px h-6"></div>

                        <button
                            onClick={() => {
                                setActiveFilters([]);
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
                    {/* Exibe skeletons se for o primeiro carregamento */}
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

                    {/* Exibe skeletons adicionais no fim do grid se estiver buscando a PRÓXIMA página */}
                    {isFetchingMore && (
                        <>
                            <JobCardSkeleton />
                            <JobCardSkeleton />
                            <JobCardSkeleton />
                        </>
                    )}
                </div>

                {/* LOADER INFINITO: Essa div vazia invisível fica vigiando quando o usuário rola a tela até o fim */}
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

            {/* --- BOTÃO FLUTUANTE VOLTAR AO TOPO --- */}
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
                    console.log("Filtros aplicados (Integração Futura):", filters);
                    setIsFilterModalOpen(false);
                }}
            />
        </div>
    );
}
