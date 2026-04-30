'use client';

import { useState, useEffect } from "react";
import api from "@/src/services/api";
import { HiOutlineFilter, HiOutlineLocationMarker, HiOutlineBriefcase, HiOutlineDocumentText } from "react-icons/hi";

interface JobFiltersProps {
    onFilterChange: (filtros: any) => void;
}

export function JobFilters({ onFilterChange }: JobFiltersProps) {
    const [metadata, setMetadata] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    // Novo estado para controlar qual Estado (UF) está ativo na visualização
    const [ufAtiva, setUfAtiva] = useState<string>("");

    // Estado interno do que está marcado
    const [selecionados, setSelecionados] = useState({
        cidades: [] as string[],
        modelos: [] as string[],
        contratos: [] as string[],
        pcd: false
    });

    // 1. Busca as opções reais do backend
    useEffect(() => {
        async function loadMetadata() {
            try {
                const res = await api.get("/vagas/filtros-disponiveis");
                // Adapte aqui dependendo se seu controller retorna direto ou dentro de um "data"
                const dados = res.data.data || res.data;

                if (dados) {
                    setMetadata(dados);
                    // Se veio locais, já deixa o primeiro Estado (ex: RS) clicado por padrão
                    if (dados.locais && dados.locais.length > 0) {
                        setUfAtiva(dados.locais[0].uf);
                    }
                }
            } catch (err) {
                console.error("Erro ao carregar metadados do filtro", err);
            } finally {
                setLoading(false);
            }
        }
        loadMetadata();
    }, []);

    // 2. Notifica o componente pai sempre que algo mudar
    useEffect(() => {
        onFilterChange(selecionados);
    }, [selecionados, onFilterChange]);

    const handleToggle = (categoria: keyof typeof selecionados, valor: string) => {
        setSelecionados(prev => {
            const lista = prev[categoria] as string[];
            const novaLista = lista.includes(valor)
                ? lista.filter((i: string) => i !== valor)
                : [...lista, valor];
            return { ...prev, [categoria]: novaLista };
        });
    };

    if (loading) return <div className="w-full h-96 bg-gray-100 animate-pulse rounded-[32px]" />;

    return (
        <aside className="w-full bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-8 sticky top-6">
            <div className="flex items-center gap-2 border-b border-gray-50 pb-4">
                <HiOutlineFilter className="text-primary text-xl" />
                <h2 className="font-black text-gray-800 tracking-tight">FILTRAR POR</h2>
            </div>

            {/* --- NOVO FILTRO DE LOCALIZAÇÃO (CASCATA) --- */}
            <div className="space-y-4">
                <h3 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                    <HiOutlineLocationMarker /> Localização
                </h3>

                {/* 1. Botões dos Estados (UFs) */}
                <div className="flex flex-wrap gap-2">
                    {metadata?.locais?.map((local: any) => (
                        <button
                            key={local.uf}
                            onClick={() => setUfAtiva(local.uf)}
                            className={`px-3 py-1 text-xs font-bold rounded-lg transition-all ${ufAtiva === local.uf
                                    ? 'bg-primary text-white shadow-sm ring-2 ring-primary/20'
                                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100 border border-gray-200'
                                }`}
                        >
                            {local.uf}
                        </button>
                    ))}
                </div>

                {/* 2. Checkboxes das Cidades (Muda conforme o botão acima) */}
                <div className="space-y-2.5 pt-2 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                    {metadata?.locais?.find((l: any) => l.uf === ufAtiva)?.cidades.map((cidade: string) => {
                        // Salvamos no formato "Panambi - RS" para não quebrar a lógica da sua API!
                        const valorCompleto = `${cidade} - ${ufAtiva}`;
                        const isChecked = selecionados.cidades.includes(valorCompleto);

                        return (
                            <label key={cidade} className="flex items-center gap-3 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 rounded-[6px] border-gray-200 text-primary focus:ring-primary/20 transition-all cursor-pointer shrink-0"
                                    checked={isChecked}
                                    onChange={() => handleToggle('cidades', valorCompleto)}
                                />
                                <span className={`text-sm font-medium transition-colors line-clamp-1 ${isChecked ? 'text-primary font-bold' : 'text-gray-600 group-hover:text-primary'}`}>
                                    {cidade}
                                </span>
                            </label>
                        );
                    })}
                </div>
            </div>

            {/* --- MODELO DE TRABALHO --- */}
            <FilterGroup
                title="Modelo"
                icon={<HiOutlineBriefcase />}
                options={metadata?.modelos}
                selected={selecionados.modelos}
                onChange={(val: string) => handleToggle('modelos', val)}
                isEnum
            />

            {/* --- TIPO DE CONTRATO --- */}
            <FilterGroup
                title="Tipo de Contrato"
                icon={<HiOutlineDocumentText />}
                options={metadata?.contratos}
                selected={selecionados.contratos}
                onChange={(val: string) => handleToggle('contratos', val)}
                isEnum
            />

            {/* --- SWITCH PCD --- */}
            <div className="pt-4 border-t border-gray-50">
                <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">Apenas PCD</span>
                    <div className="relative inline-flex items-center">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={selecionados.pcd}
                            onChange={() => setSelecionados(prev => ({ ...prev, pcd: !prev.pcd }))}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-100 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </div>
                </label>
            </div>
        </aside>
    );
}

// Componente Interno Auxiliar
function FilterGroup({ title, options, selected, onChange, icon, isEnum }: any) {
    if (!options || options.length === 0) return null;

    const formatText = (text: string) => {
        if (!isEnum) return text;
        return text.split('_').map((word: string) => word.charAt(0) + word.slice(1).toLowerCase()).join(' ');
    };

    return (
        <div className="space-y-4">
            <h3 className="flex items-center gap-2 text-xs font-black text-gray-400 uppercase tracking-widest">
                {icon} {title}
            </h3>
            <div className="space-y-2.5 max-h-48 overflow-y-auto custom-scrollbar pr-2">
                {options.map((opt: string) => (
                    <label key={opt} className="flex items-center gap-3 cursor-pointer group">
                        <input
                            type="checkbox"
                            className="w-5 h-5 rounded-[6px] border-gray-200 text-primary focus:ring-primary/20 transition-all cursor-pointer shrink-0"
                            checked={selected.includes(opt)}
                            onChange={() => onChange(opt)}
                        />
                        <span className={`text-sm font-medium transition-colors line-clamp-1 ${selected.includes(opt) ? 'text-primary font-bold' : 'text-gray-600 group-hover:text-primary'}`} title={formatText(opt)}>
                            {formatText(opt)}
                        </span>
                    </label>
                ))}
            </div>
        </div>
    );
}