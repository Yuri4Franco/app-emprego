// _components/FiltrosSidebar.tsx
import { useState, useRef, useEffect } from "react";
import {
    HiOutlineFilter,
    HiOutlineStar,
    HiOutlineUser,
    HiOutlineCalendar,
    HiOutlineMap,
    HiOutlineSearch,
    HiOutlineX,
} from "react-icons/hi";
import { Competencia, escolaridadeOptions, turnosOptions, cnhOptions, generoOptions, toggleArrayItem } from "./constants";

const FilterChip = ({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${active ? "bg-primary border-primary text-surface shadow-md shadow-primary/20" : "bg-surface border-gray-200 text-gray-500 hover:border-primary/50 hover:text-primary"
            }`}
    >
        {label}
    </button>
);

const FilterSquare = ({ active, label, icon: Icon, onClick }: { active: boolean; label: string; icon: any; onClick: () => void }) => (
    <button
        onClick={onClick}
        className={`flex flex-col items-center justify-center p-3 gap-1.5 rounded-xl border transition-all ${active ? "bg-primary/10 border-primary/30 text-primary shadow-sm" : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            }`}
    >
        <Icon size={20} />
        <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">{label}</span>
    </button>
);

interface FiltrosSidebarProps {
    filtros: any;
    setters: any;
    todasCompetencias: Competencia[];
    temFiltroAtivo: boolean;
    limparFiltros: () => void;
}

export default function FiltrosSidebar({ filtros, setters, todasCompetencias, temFiltroAtivo, limparFiltros }: FiltrosSidebarProps) {
    const [buscaComp, setBuscaComp] = useState("");
    const [isCompOpen, setIsCompOpen] = useState(false);
    const compRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (compRef.current && !compRef.current.contains(event.target as Node)) setIsCompOpen(false);
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const competenciasFiltradas = todasCompetencias.filter(
        (c) => c.nome.toLowerCase().includes(buscaComp.toLowerCase()) && !filtros.competencias.includes(c.id_competencia.toString())
    );

    return (
        <aside className="w-full lg:w-[320px] shrink-0 bg-surface p-6 rounded-[32px] border border-gray-100 shadow-sm lg:sticky lg:top-8 overflow-y-auto hide-scrollbar">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                    <HiOutlineFilter size={20} className="text-primary" />
                    <h2 className="text-base font-black text-foreground">Filtros</h2>
                </div>
                {temFiltroAtivo && (
                    <button
                        onClick={() => {
                            limparFiltros();
                            setBuscaComp("");
                        }}
                        className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors bg-red-50 px-3 py-1.5 rounded-full"
                    >
                        Limpar
                    </button>
                )}
            </div>

            <div className="space-y-6">

                {/* ✨ NOVO: BLOCO GÊNERO */}
                <div className="space-y-2.5">
                    <h3 className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Gênero</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {generoOptions.map((opt) => (
                            <FilterChip
                                key={opt.value}
                                label={opt.label}
                                active={filtros.genero === opt.value}
                                onClick={() => setters.setFiltroGenero(filtros.genero === opt.value ? "" : opt.value)}
                            />
                        ))}
                    </div>
                </div>

                {/* ✨ NOVO: BLOCO IDADE (Inputs Numéricos) */}
                <div className="space-y-2.5">
                    <h3 className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Faixa Etária</h3>
                    <div className="flex items-center gap-2">
                        <input
                            type="number"
                            min="14"
                            max="99"
                            placeholder="Mín (ex: 18)"
                            value={filtros.idadeMin}
                            onChange={(e) => setters.setIdadeMin(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-[12px] outline-none text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                        <span className="text-gray-400 font-bold text-xs">-</span>
                        <input
                            type="number"
                            min="14"
                            max="99"
                            placeholder="Máx (ex: 45)"
                            value={filtros.idadeMax}
                            onChange={(e) => setters.setIdadeMax(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-[12px] outline-none text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                        />
                    </div>
                </div>

                <div className="space-y-2.5 pt-2 border-t border-gray-50">
                    <h3 className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Escolaridade</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {escolaridadeOptions.map((opt) => (
                            <FilterChip key={opt.value} label={opt.label} active={filtros.escolaridade.includes(opt.value)} onClick={() => setters.setFiltroEscolaridade(toggleArrayItem(filtros.escolaridade, opt.value))} />
                        ))}
                    </div>
                </div>

                <div className="space-y-2.5">
                    <h3 className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Turno Desejado</h3>
                    <div className="flex flex-wrap gap-1.5">
                        {turnosOptions.map((opt) => (
                            <FilterChip key={opt.value} label={opt.label} active={filtros.turno.includes(opt.value)} onClick={() => setters.setFiltroTurno(toggleArrayItem(filtros.turno, opt.value))} />
                        ))}
                    </div>
                </div>

                <div className="space-y-2.5">
                    <h3 className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">CNH</h3>

                    <div className="grid grid-cols-4 gap-1.5 mb-3">
                        {cnhOptions.map((opt) => (
                            <FilterChip key={opt.value} label={opt.label} active={filtros.cnh.includes(opt.value)} onClick={() => setters.setFiltroCnh(toggleArrayItem(filtros.cnh, opt.value))} />
                        ))}
                    </div>

                    <h3 className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Requisitos Adicionais</h3>
                    <div className="grid grid-cols-2 gap-2">
                        <FilterSquare label="1º Emprego" icon={HiOutlineStar} active={filtros.primeiroEmprego} onClick={() => setters.setFiltroPrimeiroEmprego(!filtros.primeiroEmprego)} />
                        <FilterSquare label="PcD" icon={HiOutlineUser} active={filtros.pcd} onClick={() => setters.setFiltroPcd(!filtros.pcd)} />
                        <FilterSquare label="Sábados" icon={HiOutlineCalendar} active={filtros.sabados} onClick={() => setters.setFiltroSabados(!filtros.sabados)} />
                        <FilterSquare label="Viagens" icon={HiOutlineMap} active={filtros.viagem} onClick={() => setters.setFiltroViagem(!filtros.viagem)} />
                    </div>
                </div>

                {/* HABILIDADES (Autocomplete isolado) */}
                <div className="space-y-2.5 pt-2 border-t border-gray-100" ref={compRef}>
                    <h3 className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">Habilidades e Softwares</h3>
                    <div className="relative">
                        <div className="flex items-center relative">
                            <HiOutlineSearch className="absolute left-3.5 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Adicionar habilidade..."
                                value={buscaComp}
                                onChange={(e) => { setBuscaComp(e.target.value); setIsCompOpen(true); }}
                                onFocus={() => setIsCompOpen(true)}
                                className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-[12px] outline-none text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                            />
                            {buscaComp && (
                                <button onClick={() => setBuscaComp("")} className="absolute right-3 p-1 text-gray-400 hover:bg-gray-200 rounded-full transition-colors">
                                    <HiOutlineX size={14} />
                                </button>
                            )}
                        </div>

                        {isCompOpen && buscaComp.length > 0 && (
                            <div className="absolute w-full mt-1.5 bg-surface border border-gray-100 rounded-[12px] shadow-xl z-50 max-h-48 overflow-y-auto p-1.5 animate-in fade-in zoom-in-95">
                                {competenciasFiltradas.length > 0 ? (
                                    competenciasFiltradas.map((comp) => (
                                        <button
                                            key={comp.id_competencia}
                                            onClick={() => {
                                                setters.setFiltroCompetencias(toggleArrayItem(filtros.competencias, comp.id_competencia.toString()));
                                                setBuscaComp("");
                                                setIsCompOpen(false);
                                            }}
                                            className="w-full text-left px-3 py-2.5 hover:bg-primary/5 rounded-[8px] text-xs font-bold text-foreground hover:text-primary transition-colors"
                                        >
                                            + {comp.nome}
                                        </button>
                                    ))
                                ) : (
                                    <div className="px-3 py-2 text-xs text-muted font-medium italic text-center">Nenhuma habilidade.</div>
                                )}
                            </div>
                        )}
                    </div>

                    {filtros.competencias.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-3">
                            {filtros.competencias.map((val: string) => {
                                const nomeComp = todasCompetencias.find((c) => c.id_competencia.toString() === val)?.nome;
                                if (!nomeComp) return null;
                                return (
                                    <div key={val} className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 bg-gray-100 text-gray-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-200">
                                        {nomeComp}
                                        <button
                                            onClick={() => setters.setFiltroCompetencias(toggleArrayItem(filtros.competencias, val))}
                                            className="p-0.5 rounded-md hover:bg-gray-300 transition-colors"
                                        >
                                            <HiOutlineX size={12} />
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </aside>
    );
}