'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import { JobCard, JobProps } from "@/src/components/JobCard";
import { ButtonType } from "@/src/components/ButtonType";
import { FilterSelect } from "@/src/components/FilterSelect";
import { AdvancedFilterModal } from "@/src/components/AdvancedFilterModal";
import { BiSearchAlt, BiSliderAlt, BiTrash, BiUpArrowAlt } from "react-icons/bi"; // Novos ícones
import { IoClose } from "react-icons/io5";

// --- MOCK DATA INICIAL ---
const INITIAL_JOBS: JobProps[] = [
    { id: 1, company: "Bruning Tecnometal", title: "Analista de Qualidade Sênior", location: "Panambi - RS", type: "Presencial", contract: "CLT", datePosted: "2 dias", pcdType: null, isNew: true, isMember: true, shift: "Diurno" },
    { id: 2, company: "Saur Equipamentos", title: "Desenvolvedor Fullstack Pleno", location: "Remoto", type: "Remoto", contract: "PJ", salary: "R$ 6k - 8k", datePosted: "Hoje", pcdType: "exclusive", },
    { id: 3, company: "Cotripal", title: "Auxiliar Administrativo", location: "Panambi - RS", type: "Presencial", contract: "Estágio", datePosted: "5 dias", pcdType: "inclusive", },
    { id: 4, company: "Kepler Weber", title: "Engenheiro Mecânico", location: "Panambi - RS", type: "Presencial", contract: "CLT", datePosted: "1 semana", pcdType: null },
    { id: 5, company: "Tromink", title: "Assistente de RH", location: "Panambi - RS", type: "Híbrido", contract: "CLT", datePosted: "3 dias", pcdType: null },
    { id: 6, company: "Empresa Confidencial", title: "Gerente Comercial", location: "Ijuí - RS", type: "Presencial", contract: "CLT", salary: "A combinar", datePosted: "Hoje", pcdType: null },
];

// Componente SKELETON (O fantasma que aparece carregando)
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

export default function VagasPage() {
    const [activeFilters, setActiveFilters] = useState<string[]>(["Panambi - RS"]);
    const [showScrollTop, setShowScrollTop] = useState(false); // Estado para o botão de voltar ao topo

    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Estados para o Infinite Scroll
    const [jobs, setJobs] = useState(INITIAL_JOBS);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);

    const loaderRef = useRef(null);

    // --- LÓGICA DE TOGGLE DOS FILTROS ---
    const handleFilterToggle = (value: string) => {
        setActiveFilters(prev => {
            if (prev.includes(value)) {
                return prev.filter(item => item !== value); // Remove se já existe
            } else {
                return [...prev, value]; // Adiciona se não existe
            }
        });
    };

    // --- LÓGICA DO SCROLL TO TOP ---
    useEffect(() => {
        const handleScroll = () => {
            // Mostra o botão se rolar mais de 400px
            setShowScrollTop(window.scrollY > 400);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // --- LÓGICA DO INFINITE SCROLL (MANTIDA IGUAL) ---
    // --- LÓGICA DO INFINITE SCROLL CORRIGIDA ---
    const loadMoreJobs = useCallback(async () => {
        // Se já estiver carregando ou acabou, para.
        if (isLoading || !hasMore) return;

        setIsLoading(true);

        // Simula delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setJobs((prevJobs) => {
            // A MÁGICA ESTÁ AQUI:
            // Calculamos o ID baseado no 'prevJobs' (o estado mais atual garantido pelo React)
            // e não na variável 'jobs' externa.

            // Pega o maior ID atual ou 0 se estiver vazio
            const lastId = prevJobs.length > 0 ? Math.max(...prevJobs.map(j => Number(j.id))) : 0;

            const newJobs = INITIAL_JOBS.map((job, index) => ({
                ...job,
                // O novo ID será: O maior ID que existe + 1 + o índice atual do loop
                id: lastId + index + 1,
                title: `${job.title} (Nova)`,
            }));

            // Verifica se devemos parar de carregar (limite de 30 itens)
            if (prevJobs.length + newJobs.length > 30) {
                setHasMore(false);
            }

            return [...prevJobs, ...newJobs];
        });

        setIsLoading(false);
    }, [isLoading, hasMore]); // REMOVIDO 'jobs' das dependências para evitar loop/stale state

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) loadMoreJobs();
        }, { root: null, rootMargin: "20px", threshold: 1.0 });

        if (loaderRef.current) observer.observe(loaderRef.current);
        return () => { if (loaderRef.current) observer.unobserve(loaderRef.current); };
    }, [loadMoreJobs]);


    return (
        <div className="w-full bg-gray-50 min-h-screen pt-24 pb-20 relative">

            {/* CABEÇALHO */}
            <div className="bg-white border-b border-gray-200 pb-8 pt-6 px-4 md:px-8 shadow-sm">
                <div className="max-w-7xl mx-auto space-y-6">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            {jobs.length} Vagas encontradas
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

                        <ButtonType className="h-12 px-8 rounded-full hidden md:flex">
                            Buscar
                        </ButtonType>
                    </div>

                    {/* FILTROS RÁPIDOS */}
                    <div className="flex flex-wrap items-center gap-3">
                        <FilterSelect
                            label="Localização"
                            options={['Panambi - RS', 'Condor - RS', 'Ijuí - RS', 'Remoto']}
                            activeFilters={activeFilters}
                            onToggle={handleFilterToggle}
                        />
                        <FilterSelect
                            label="Modelo"
                            options={['Presencial', 'Híbrido', 'Remoto']}
                            activeFilters={activeFilters}
                            onToggle={handleFilterToggle}
                        />
                        <FilterSelect
                            label="Contrato"
                            options={['CLT', 'PJ', 'Estágio', 'Temporário']}
                            activeFilters={activeFilters}
                            onToggle={handleFilterToggle}
                        />

                        <label className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-300 bg-white cursor-pointer hover:border-gray-400 select-none transition-colors">
                            <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300" />
                            <span className="text-sm font-medium text-gray-600">Vaga PCD</span>
                        </label>

                        {/* REMOVI O BOTÃO DE LIMPAR DAQUI - VAI FICAR JUNTO COM AS TAGS */}
                    </div>

                </div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">

                {/* ÁREA DE FILTROS ATIVOS + BOTÃO LIXEIRA */}
                {activeFilters.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 mb-6 animate-fade-in">

                        {/* As Tags */}
                        {activeFilters.map(filter => (
                            <span key={filter} className="inline-flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-lg bg-white border border-blue-100 text-primary text-sm font-medium shadow-sm">
                                {filter}
                                <button onClick={() => handleFilterToggle(filter)} className="hover:bg-blue-50 rounded-md p-0.5 transition-colors">
                                    <IoClose className="text-gray-400 hover:text-red-500 text-lg" />
                                </button>
                            </span>
                        ))}

                        {/* O BOTÃO DE LIMPAR (LIXEIRA) */}
                        {/* Do mesmo tamanho visual das tags para harmonia */}
                        <div className="h-full border-l border-gray-300 mx-2 h-6 w-px"></div> {/* Divisor vertical sutil */}

                        <button
                            onClick={() => setActiveFilters([])}
                            className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 transition-colors text-sm font-medium"
                            title="Limpar todos os filtros"
                        >
                            <BiTrash className="text-lg group-hover:scale-110 transition-transform" />
                            <span>Limpar</span>
                        </button>
                    </div>
                )}

                {/* LISTA DE VAGAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {jobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))}
                    {isLoading && (
                        <>
                            <JobCardSkeleton /><JobCardSkeleton /><JobCardSkeleton />
                        </>
                    )}
                </div>

                {/* LOADER INFINITO */}
                {hasMore && (
                    <div ref={loaderRef} className="w-full h-20 flex items-center justify-center mt-8 opacity-0">Carregando...</div>
                )}

                {!hasMore && (
                    <div className="w-full text-center py-10 text-gray-400">
                        <p>Não há mais vagas para mostrar.</p>
                    </div>
                )}

            </div>

            {/* --- BOTÃO FLUTUANTE VOLTAR AO TOPO --- */}
            <button
                onClick={scrollToTop}
                className={`
            fixed bottom-8 right-8 z-50 p-4 rounded-full bg-primary text-white shadow-lg 
            hover:bg-blue-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300
            ${showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10 pointer-events-none'}
        `}
                aria-label="Voltar ao topo"
            >
                <BiUpArrowAlt className="text-2xl" />
            </button>
            <AdvancedFilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={(filters) => {
                    console.log("Filtros aplicados:", filters);
                    setIsFilterModalOpen(false);
                }}
            />
        </div>
    );
}