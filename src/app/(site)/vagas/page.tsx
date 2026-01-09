'use client';

import { useState } from "react";
import { JobCard } from "@/src/components/JobCard";
import { ButtonType } from "@/src/components/ButtonType";
import { FilterSelect } from "@/src/components/FilterSelect"; // Importe o novo componente
import { BiSearchAlt, BiFilter, BiSliderAlt } from "react-icons/bi";
import { IoClose } from "react-icons/io5";

// Mock Data (Mesmo de antes)
const MOCK_JOBS = [
    { id: 1, company: "Bruning Tecnometal", title: "Analista de Qualidade Sênior", location: "Panambi - RS", type: "Presencial", contract: "CLT", datePosted: "2 dias", isPcd: false },
    { id: 2, company: "Saur Equipamentos", title: "Desenvolvedor Fullstack Pleno", location: "Remoto", type: "Remoto", contract: "PJ", salary: "R$ 6k - 8k", datePosted: "Hoje", isPcd: false },
    { id: 3, company: "Cotripal", title: "Auxiliar Administrativo", location: "Panambi - RS", type: "Presencial", contract: "Estágio", datePosted: "5 dias", isPcd: true },
    { id: 4, company: "Kepler Weber", title: "Engenheiro Mecânico", location: "Panambi - RS", type: "Presencial", contract: "CLT", datePosted: "1 semana", isPcd: false },
    { id: 5, company: "Tromink", title: "Assistente de RH", location: "Panambi - RS", type: "Híbrido", contract: "CLT", datePosted: "3 dias", isPcd: false },
    { id: 6, company: "Empresa Confidencial", title: "Gerente Comercial", location: "Ijuí - RS", type: "Presencial", contract: "CLT", salary: "A combinar", datePosted: "Hoje", isPcd: false },
];

export default function VagasPage() {
    // Exemplo simples de estado para controlar visualmente um filtro ativo
    const [activeFilters, setActiveFilters] = useState<string[]>(["Panambi - RS"]);

    return (
        <div className="w-full bg-gray-50 min-h-screen pt-24 pb-20">

            {/* --- CABEÇALHO DA PÁGINA --- */}
            <div className="bg-white border-b border-gray-200 pb-8 pt-6 px-4 md:px-8 sticky top-[80px] z-30 shadow-sm">
                <div className="max-w-7xl mx-auto space-y-6">

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                            142 Vagas encontradas
                        </h1>
                        <p className="text-gray-500 text-sm">Atualizado hoje às 08:00</p>
                    </div>

                    {/* BARRA DE PESQUISA + BOTÃO DE FILTRO AVANÇADO */}
                    <div className="flex gap-3 w-full">
                        <div className="flex-1 flex items-center px-4 bg-gray-100 rounded-full border border-transparent focus-within:bg-white focus-within:border-primary focus-within:ring-2 focus-within:ring-blue-50 transition-all h-12">
                            <BiSearchAlt className="text-gray-400 text-xl mr-3" />
                            <input
                                type="text"
                                placeholder="Cargo, empresa ou palavra-chave..."
                                className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-500"
                            />
                        </div>

                        {/* Botão de Filtros Avançados (Aquele que abriria o modal lateral) */}
                        <button className="h-12 w-12 shrink-0 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-primary hover:border-primary transition-all bg-white" title="Todos os Filtros">
                            <BiSliderAlt className="text-xl" />
                        </button>

                        <ButtonType className="h-12 px-8 rounded-full hidden md:flex">
                            Buscar
                        </ButtonType>
                    </div>

                    {/* --- FILTROS RÁPIDOS (HORIZONTAL) --- */}
                    <div className="flex flex-wrap items-center gap-3">
                        <FilterSelect
                            label="Localização"
                            options={['Panambi - RS', 'Condor - RS', 'Ijuí - RS', 'Remoto']}
                        />
                        <FilterSelect
                            label="Modelo"
                            options={['Presencial', 'Híbrido', 'Remoto']}
                        />
                        <FilterSelect
                            label="Contrato"
                            options={['CLT', 'PJ', 'Estágio', 'Temporário']}
                        />

                        {/* Toggle Simples para PCD */}
                        <label className="flex items-center gap-2 px-4 py-2.5 rounded-full border border-gray-300 bg-white cursor-pointer hover:border-gray-400 select-none">
                            <input type="checkbox" className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300" />
                            <span className="text-sm font-medium text-gray-600">Vaga PCD</span>
                        </label>

                        {/* Link Limpar (Só aparece se tiver filtros) */}
                        <button className="text-sm text-gray-500 hover:text-red-500 hover:underline ml-auto">
                            Limpar filtros
                        </button>
                    </div>

                </div>
            </div>

            {/* --- CONTEÚDO PRINCIPAL --- */}
            <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8">

                {/* Filtros Ativos (Chips) */}
                {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {activeFilters.map(filter => (
                            <span key={filter} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-100 text-primary text-xs font-bold animate-fade-in">
                                {filter} <IoClose className="cursor-pointer hover:text-red-500 text-base" onClick={() => setActiveFilters([])} />
                            </span>
                        ))}
                    </div>
                )}

                {/* Grid de Cards - AGORA FULL WIDTH */}
                {/* grid-cols-1 (Celular) -> grid-cols-2 (Tablet) -> grid-cols-3 (Desktop) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {MOCK_JOBS.map((job) => (
                        <JobCard key={job.id} job={job} />
                    ))}
                </div>

                {/* Paginação */}
                <div className="mt-16 flex justify-center pb-10">
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-white text-sm font-medium disabled:opacity-50 bg-white">Anterior</button>
                        <button className="px-4 py-2 rounded-lg bg-primary text-white text-sm font-bold shadow-md">1</button>
                        <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-white text-sm font-medium bg-white">2</button>
                        <span className="px-2 py-2 text-gray-400">...</span>
                        <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-white text-sm font-medium bg-white">Próxima</button>
                    </div>
                </div>

            </div>
        </div>
    );
}