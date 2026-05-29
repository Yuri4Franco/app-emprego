"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import api from "@/src/services/api";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineFilter,
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineBadgeCheck,
  HiOutlineSearch,
  HiOutlineSparkles,
  HiOutlineX,
  HiOutlineStar,
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineMap,
  HiOutlineAcademicCap,
  HiOutlineIdentification,
  HiOutlineClock,
  HiOutlineArrowLeft,
} from "react-icons/hi";
import toast from "react-hot-toast";

// Interface ATUALIZADA com os novos dados do backend
interface CandidatoResumo {
  id_candidato: number;
  identificacao_publica: string;
  cidade: string;
  uf: string;
  primeiro_emprego: boolean;
  pcd: boolean;
  areas: string[];
  experiencias: any[];
  formacoes?: any[];
  cnh?: string[];
  turno_preferido?: string[];
  disponibilidade_sabados?: boolean;
}

interface Competencia {
  id_competencia: number;
  nome: string;
}

// TEXTOS ENCURTADOS PARA ECONOMIZAR ESPAÇO NO LAYOUT
const turnosOptions = [
  { value: "COMERCIAL", label: "Comercial" },
  { value: "MANHÃ", label: "1ºT" },
  { value: "TARDE", label: "2ºT" },
  { value: "NOITE", label: "3ºT" },
];

const escolaridadeOptions = [
  { value: "MEDIO_COMPLETO", label: "Ens. Médio" },
  { value: "TECNICO", label: "Técnico" },
  { value: "SUPERIOR_CURSANDO", label: "Sup. Cursando" },
  { value: "SUPERIOR_COMPLETO", label: "Sup. Completo" },
];

const cnhOptions = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "E", label: "E" },
];

const gerarCodigoTalento = (id: number) => {
  const scrambledId = id * 9973 + 12345;
  return `TAL-${scrambledId.toString(36).toUpperCase()}`;
};

// ================= COMPONENTES COMPACTOS DE UI =================
const FilterChip = ({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border ${active
        ? "bg-primary border-primary text-surface shadow-md shadow-primary/20"
        : "bg-surface border-gray-200 text-gray-500 hover:border-primary/50 hover:text-primary"
      }`}
  >
    {label}
  </button>
);

const FilterSquare = ({
  active,
  label,
  icon: Icon,
  onClick,
}: {
  active: boolean;
  label: string;
  icon: any;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center justify-center p-3 gap-1.5 rounded-xl border transition-all ${active
        ? "bg-primary/10 border-primary/30 text-primary shadow-sm"
        : "bg-gray-50 border-gray-100 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
      }`}
  >
    <Icon size={20} />
    <span className="text-[9px] font-black uppercase tracking-widest text-center leading-tight">
      {label}
    </span>
  </button>
);

function VitrineConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [candidatos, setCandidatos] = useState<CandidatoResumo[]>([]);
  const [paginacao, setPaginacao] = useState({
    pagina_atual: 1,
    total_paginas: 1,
    total: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const [todasCompetencias, setTodasCompetencias] = useState<Competencia[]>([]);
  const [buscaComp, setBuscaComp] = useState("");
  const [isCompOpen, setIsCompOpen] = useState(false);
  const compRef = useRef<HTMLDivElement>(null);

  const parseArrayParam = (param: string | null) =>
    param ? param.split(",") : [];

  const [filtroArea, setFiltroArea] = useState(searchParams.get("area") || "");
  const [filtroTurno, setFiltroTurno] = useState<string[]>(
    parseArrayParam(searchParams.get("turno")),
  );
  const [filtroEscolaridade, setFiltroEscolaridade] = useState<string[]>(
    parseArrayParam(searchParams.get("escolaridade")),
  );
  const [filtroCnh, setFiltroCnh] = useState<string[]>(
    parseArrayParam(searchParams.get("cnh")),
  );
  const [filtroCompetencias, setFiltroCompetencias] = useState<string[]>(
    parseArrayParam(searchParams.get("competencia")),
  );

  const [filtroPcd, setFiltroPcd] = useState(
    searchParams.get("pcd") === "true",
  );
  const [filtroPrimeiroEmprego, setFiltroPrimeiroEmprego] = useState(
    searchParams.get("primeiro_emprego") === "true",
  );
  const [filtroSabados, setFiltroSabados] = useState(
    searchParams.get("sabados") === "true",
  );
  const [filtroViagem, setFiltroViagem] = useState(
    searchParams.get("viagem") === "true",
  );

  const paginaAtual = Number(searchParams.get("pagina")) || 1;

  const toggleArrayFiltro = (
    estado: string[],
    setEstado: any,
    valor: string,
  ) => {
    if (estado.includes(valor))
      setEstado(estado.filter((item) => item !== valor));
    else setEstado([...estado, valor]);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (compRef.current && !compRef.current.contains(event.target as Node))
        setIsCompOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    api
      .get("/taxonomia/competencias")
      .then((res) =>
        setTodasCompetencias(
          res.data.data || res.data.competencias || res.data,
        ),
      )
      .catch(() => null);
  }, []);

  const competenciasFiltradas = todasCompetencias.filter(
    (c) =>
      c.nome.toLowerCase().includes(buscaComp.toLowerCase()) &&
      !filtroCompetencias.includes(c.id_competencia.toString()),
  );

  const buscarCandidatos = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroArea) params.append("area", filtroArea);
      if (filtroTurno.length > 0) params.append("turno", filtroTurno.join(","));
      if (filtroEscolaridade.length > 0)
        params.append("escolaridade", filtroEscolaridade.join(","));
      if (filtroCnh.length > 0) params.append("cnh", filtroCnh.join(","));
      if (filtroCompetencias.length > 0)
        params.append("competencia", filtroCompetencias.join(","));

      if (filtroPcd) params.append("pcd", "true");
      if (filtroPrimeiroEmprego) params.append("primeiro_emprego", "true");
      if (filtroSabados) params.append("sabados", "true");
      if (filtroViagem) params.append("viagem", "true");

      params.append("pagina", paginaAtual.toString());

      const res = await api.get(
        `/empresas/banco-talentos?${params.toString()}`,
      );
      setCandidatos(res.data.dados);
      setPaginacao(res.data.paginacao);

      router.replace(`/empresa/banco-talentos/lista?${params.toString()}`, {
        scroll: false,
      });
    } catch (error) {
      toast.error("Erro ao buscar talentos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    buscarCandidatos();
  }, [
    filtroArea,
    filtroTurno,
    filtroEscolaridade,
    filtroCnh,
    filtroCompetencias,
    filtroPcd,
    filtroPrimeiroEmprego,
    filtroSabados,
    filtroViagem,
    paginaAtual,
  ]);

  const mudarPagina = (novaPagina: number) => {
    if (novaPagina < 1 || novaPagina > paginacao.total_paginas) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("pagina", novaPagina.toString());
    router.push(`/empresa/banco-talentos/lista?${params.toString()}`);
  };

  const limparFiltros = () => {
    setFiltroArea("");
    setFiltroTurno([]);
    setFiltroEscolaridade([]);
    setFiltroCnh([]);
    setFiltroCompetencias([]);
    setBuscaComp("");
    setFiltroPcd(false);
    setFiltroPrimeiroEmprego(false);
    setFiltroSabados(false);
    setFiltroViagem(false);
    router.push("/empresa/banco-talentos/lista");
  };

  const temFiltroAtivo =
    filtroTurno.length > 0 ||
    filtroEscolaridade.length > 0 ||
    filtroCnh.length > 0 ||
    filtroCompetencias.length > 0 ||
    filtroPcd ||
    filtroPrimeiroEmprego ||
    filtroSabados ||
    filtroViagem ||
    filtroArea;

  const getFiltrosAtivos = () => {
    const ativos = [];
    if (filtroArea)
      ativos.push({
        label: "Área Específica",
        onRemove: () => setFiltroArea(""),
      });
    filtroTurno.forEach((val) => {
      const label = turnosOptions.find((t) => t.value === val)?.label;
      if (label)
        ativos.push({
          label,
          onRemove: () => toggleArrayFiltro(filtroTurno, setFiltroTurno, val),
        });
    });
    filtroEscolaridade.forEach((val) => {
      const label = escolaridadeOptions.find((e) => e.value === val)?.label;
      if (label)
        ativos.push({
          label,
          onRemove: () =>
            toggleArrayFiltro(filtroEscolaridade, setFiltroEscolaridade, val),
        });
    });
    filtroCnh.forEach((val) => {
      const label = cnhOptions.find((c) => c.value === val)?.label;
      if (label)
        ativos.push({
          label: `CNH: ${label}`,
          onRemove: () => toggleArrayFiltro(filtroCnh, setFiltroCnh, val),
        });
    });
    filtroCompetencias.forEach((val) => {
      const comp = todasCompetencias.find(
        (c) => c.id_competencia.toString() === val,
      );
      if (comp)
        ativos.push({
          label: `Hab: ${comp.nome}`,
          onRemove: () =>
            toggleArrayFiltro(filtroCompetencias, setFiltroCompetencias, val),
        });
    });
    if (filtroPrimeiroEmprego)
      ativos.push({
        label: "1º Emprego",
        onRemove: () => setFiltroPrimeiroEmprego(false),
      });
    if (filtroPcd)
      ativos.push({ label: "PcD", onRemove: () => setFiltroPcd(false) });
    if (filtroSabados)
      ativos.push({
        label: "Sábados",
        onRemove: () => setFiltroSabados(false),
      });
    if (filtroViagem)
      ativos.push({ label: "Viagens", onRemove: () => setFiltroViagem(false) });

    return ativos;
  };

  const tagsAtivas = getFiltrosAtivos();

  return (
    <div className="max-w-7xl mx-auto space-y-4 py-10 px-6 md:px-10 animate-in fade-in duration-700">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md"
      >
        <HiOutlineArrowLeft size={18} /> Voltar
      </button>
      <header className="mb-8 bg-surface p-8 md:p-10 rounded-[32px] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
            <HiOutlineSparkles size={14} /> Busca Avançada
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight flex items-center gap-3">
            Vitrine de Talentos
          </h1>
          <p className="text-muted text-sm md:text-base">
            Mostrando{" "}
            <strong className="text-foreground">{paginacao.total}</strong>{" "}
            profissionais disponíveis.
          </p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* ================= SIDEBAR MODERNA (COMPACTA) ================= */}
        <aside className="w-full lg:w-[320px] shrink-0 bg-surface p-6 rounded-[32px] border border-gray-100 shadow-sm lg:sticky lg:top-8 overflow-y-auto hide-scrollbar">
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <HiOutlineFilter size={20} className="text-primary" />
              <h2 className="text-base font-black text-foreground">Filtros</h2>
            </div>
            {temFiltroAtivo && (
              <button
                onClick={limparFiltros}
                className="text-[10px] font-black uppercase tracking-widest text-red-500 hover:text-red-700 transition-colors bg-red-50 px-3 py-1.5 rounded-full"
              >
                Limpar
              </button>
            )}
          </div>

          <div className="space-y-6">
            {/* BLOCO 1: ESCOLARIDADE */}
            <div className="space-y-2.5">
              <h3 className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">
                Escolaridade
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {escolaridadeOptions.map((opt) => (
                  <FilterChip
                    key={opt.value}
                    label={opt.label}
                    active={filtroEscolaridade.includes(opt.value)}
                    onClick={() =>
                      toggleArrayFiltro(
                        filtroEscolaridade,
                        setFiltroEscolaridade,
                        opt.value,
                      )
                    }
                  />
                ))}
              </div>
            </div>

            {/* BLOCO 2: TURNOS */}
            <div className="space-y-2.5">
              <h3 className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">
                Turno Desejado
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {turnosOptions.map((opt) => (
                  <FilterChip
                    key={opt.value}
                    label={opt.label}
                    active={filtroTurno.includes(opt.value)}
                    onClick={() =>
                      toggleArrayFiltro(filtroTurno, setFiltroTurno, opt.value)
                    }
                  />
                ))}
              </div>
            </div>

            {/* BLOCO 3: CNH E EXTRAS */}
            <div className="space-y-2.5">
              <h3 className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">
                Requisitos Adicionais
              </h3>
              <div className="grid grid-cols-4 gap-1.5 mb-3">
                {cnhOptions.map((opt) => (
                  <FilterChip
                    key={opt.value}
                    label={opt.label}
                    active={filtroCnh.includes(opt.value)}
                    onClick={() =>
                      toggleArrayFiltro(filtroCnh, setFiltroCnh, opt.value)
                    }
                  />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-2">
                <FilterSquare
                  label="1º Emprego"
                  icon={HiOutlineStar}
                  active={filtroPrimeiroEmprego}
                  onClick={() =>
                    setFiltroPrimeiroEmprego(!filtroPrimeiroEmprego)
                  }
                />
                <FilterSquare
                  label="PcD"
                  icon={HiOutlineUser}
                  active={filtroPcd}
                  onClick={() => setFiltroPcd(!filtroPcd)}
                />
                <FilterSquare
                  label="Sábados"
                  icon={HiOutlineCalendar}
                  active={filtroSabados}
                  onClick={() => setFiltroSabados(!filtroSabados)}
                />
                <FilterSquare
                  label="Viagens"
                  icon={HiOutlineMap}
                  active={filtroViagem}
                  onClick={() => setFiltroViagem(!filtroViagem)}
                />
              </div>
            </div>

            {/* BLOCO 4: HABILIDADES */}
            <div
              className="space-y-2.5 pt-2 border-t border-gray-100"
              ref={compRef}
            >
              <h3 className="text-[10px] font-black text-muted uppercase tracking-widest pl-1">
                Habilidades e Softwares
              </h3>
              <div className="relative">
                <div className="flex items-center relative">
                  <HiOutlineSearch
                    className="absolute left-3.5 text-gray-400"
                    size={16}
                  />
                  <input
                    type="text"
                    placeholder="Adicionar habilidade..."
                    value={buscaComp}
                    onChange={(e) => {
                      setBuscaComp(e.target.value);
                      setIsCompOpen(true);
                    }}
                    onFocus={() => setIsCompOpen(true)}
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-[12px] outline-none text-xs font-bold text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                  {buscaComp && (
                    <button
                      onClick={() => setBuscaComp("")}
                      className="absolute right-3 p-1 text-gray-400 hover:bg-gray-200 rounded-full transition-colors"
                    >
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
                            toggleArrayFiltro(
                              filtroCompetencias,
                              setFiltroCompetencias,
                              comp.id_competencia.toString(),
                            );
                            setBuscaComp("");
                            setIsCompOpen(false);
                          }}
                          className="w-full text-left px-3 py-2.5 hover:bg-primary/5 rounded-[8px] text-xs font-bold text-foreground hover:text-primary transition-colors"
                        >
                          + {comp.nome}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-xs text-muted font-medium italic text-center">
                        Nenhuma habilidade.
                      </div>
                    )}
                  </div>
                )}

                {filtroCompetencias.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-3">
                    {filtroCompetencias.map((val) => {
                      const nomeComp = todasCompetencias.find(
                        (c) => c.id_competencia.toString() === val,
                      )?.nome;
                      return nomeComp ? (
                        <div
                          key={val}
                          className="flex items-center gap-1.5 pl-2.5 pr-1 py-1 bg-gray-100 text-gray-700 rounded-lg text-[9px] font-black uppercase tracking-widest border border-gray-200"
                        >
                          {nomeComp}
                          <button
                            onClick={() =>
                              toggleArrayFiltro(
                                filtroCompetencias,
                                setFiltroCompetencias,
                                val,
                              )
                            }
                            className="p-0.5 rounded-md hover:bg-gray-300 transition-colors"
                          >
                            <HiOutlineX size={12} />
                          </button>
                        </div>
                      ) : null;
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* ================= MAIN ================= */}
        <main className="flex-1 w-full space-y-6">
          {tagsAtivas.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 animate-in slide-in-from-top-2 bg-surface p-4 rounded-[24px] border border-gray-100 shadow-sm">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">
                Filtros:
              </span>
              {tagsAtivas.map((tag, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-widest"
                >
                  {tag.label}
                  <button
                    onClick={tag.onRemove}
                    className="p-0.5 rounded-full hover:bg-primary/20 hover:text-hover-button transition-colors"
                  >
                    <HiOutlineX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-40 bg-surface border border-gray-100 rounded-[32px] animate-pulse shadow-sm"
                ></div>
              ))}
            </div>
          ) : candidatos.length === 0 ? (
            <div className="bg-surface rounded-[40px] border border-dashed border-gray-200 p-16 md:p-20 text-center">
              <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-5">
                <HiOutlineSearch size={36} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground">
                Nenhum talento encontrado
              </h3>
              <p className="text-muted mt-2 text-sm md:text-base">
                Tente remover alguns filtros para ver mais opções.
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {candidatos.map((candidato) => {
                  // ================= LÓGICA DE ETIQUETAS DO CARD (HIERARQUIA & ÍCONES) =================
                  const badgesDoCandidato = [];

                  // 1. Primeiro Emprego
                  if (candidato.primeiro_emprego) {
                    badgesDoCandidato.push({
                      label: "1º Emprego",
                      icon: HiOutlineStar,
                      color:
                        "bg-emerald-50 text-emerald-700 border-emerald-200",
                    });
                  }

                  // 2. Escolaridade (Lógica de Hierarquia: Mostra só a maior)
                  if (candidato.formacoes && candidato.formacoes.length > 0) {
                    const niveis = candidato.formacoes.map((f) => f.nivel);
                    let nivelPrincipal = "";

                    if (
                      niveis.some(
                        (n) =>
                          n?.includes("Mestrado") || n?.includes("Doutorado"),
                      )
                    )
                      nivelPrincipal = "Mestrado/Doutorado";
                    else if (niveis.some((n) => n?.includes("Pós")))
                      nivelPrincipal = "Pós-Graduação";
                    else if (
                      niveis.some(
                        (n) =>
                          n?.includes("Graduação") || n?.includes("Tecnólogo"),
                      )
                    )
                      nivelPrincipal = "Ensino Superior";
                    else if (niveis.some((n) => n?.includes("Técnico")))
                      nivelPrincipal = "Curso Técnico";
                    else if (niveis.some((n) => n?.includes("Médio")))
                      nivelPrincipal = "Ensino Médio";
                    else if (niveis.some((n) => n?.includes("Fundamental")))
                      nivelPrincipal = "Ensino Fundamental";

                    if (nivelPrincipal) {
                      badgesDoCandidato.push({
                        label: nivelPrincipal,
                        icon: HiOutlineAcademicCap,
                        color: "bg-gray-50 text-gray-600 border-gray-200",
                      });
                    }
                  }

                  // 3. Turno Desejado
                  if (
                    candidato.turno_preferido &&
                    candidato.turno_preferido.length > 0
                  ) {
                    if (candidato.turno_preferido.includes("QUALQUER_TURNO")) {
                      badgesDoCandidato.push({
                        label: "Qualquer Turno",
                        icon: HiOutlineClock,
                        color: "bg-gray-50 text-gray-600 border-gray-200",
                      });
                    } else {
                      // Converte os IDs de turno ("MANHÃ") para os nomes curtos ("1ºT")
                      const turnosNomes = candidato.turno_preferido
                        .map(
                          (t) =>
                            turnosOptions.find((opt) => opt.value === t)
                              ?.label || t,
                        )
                        .join(", ");
                      badgesDoCandidato.push({
                        label: turnosNomes,
                        icon: HiOutlineClock,
                        color: "bg-gray-50 text-gray-600 border-gray-200",
                      });
                    }
                  }

                  // 4. CNH
                  if (
                    candidato.cnh &&
                    candidato.cnh.length > 0 &&
                    !candidato.cnh.includes("NAO_POSSUO")
                  ) {
                    badgesDoCandidato.push({
                      label: `CNH: ${candidato.cnh.join(", ")}`,
                      icon: HiOutlineIdentification,
                      color: "bg-gray-50 text-gray-600 border-gray-200",
                    });
                  }

                  // 5. Disponibilidade Logística
                  if (candidato.disponibilidade_sabados) {
                    badgesDoCandidato.push({
                      label: "Sábados",
                      icon: HiOutlineCalendar,
                      color: "bg-gray-50 text-gray-600 border-gray-200",
                    });
                  }

                  return (
                    <Link
                      key={candidato.id_candidato}
                      href={`/empresa/banco-talentos/${candidato.id_candidato}`}
                      className={`block bg-surface p-5 md:p-6 rounded-[24px] border shadow-sm transition-all duration-300 group ${candidato.pcd
                          ? "border-blue-200 hover:border-blue-400 hover:shadow-blue-100"
                          : "border-gray-100 hover:border-primary/30 hover:shadow-lg"
                        }`}
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-2 flex-1">
                          {/* ===================== TOPO DO CARD ===================== */}
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="px-2.5 py-1 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-sm">
                              {gerarCodigoTalento(candidato.id_candidato)}
                            </span>

                            {/* Destaque Diferenciado para PcD */}
                            {candidato.pcd && (
                              <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-sm">
                                <HiOutlineUser size={12} strokeWidth={2.5} />{" "}
                                Profissional PcD
                              </span>
                            )}

                            {/* Etiquetas Dinâmicas de Informação com Ícones */}
                            {badgesDoCandidato.map((badge, i) => (
                              <span
                                key={i}
                                className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border ${badge.color}`}
                              >
                                <badge.icon size={13} strokeWidth={2} />
                                {badge.label}
                              </span>
                            ))}
                          </div>

                          <h3 className="text-xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">
                            Profissional de {candidato.areas[0] || "Talentos"}
                          </h3>

                          {/* ===================== RODAPÉ DO CARD ===================== */}
                          <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-muted mt-2">
                            <span className="flex items-center gap-1 text-gray-500">
                              <HiOutlineLocationMarker
                                className="text-gray-400"
                                size={16}
                              />
                              {candidato.cidade}, {candidato.uf}
                            </span>

                            {!candidato.primeiro_emprego &&
                              candidato.experiencias?.length > 0 && (
                                <span className="flex items-center gap-1.5 text-foreground bg-gray-50 px-2 py-1 rounded-md border border-gray-200">
                                  <HiOutlineBadgeCheck
                                    className="text-primary"
                                    size={14}
                                  />
                                  Último Cargo:{" "}
                                  {candidato.experiencias[0].cargo}
                                </span>
                              )}
                          </div>
                        </div>

                        {/* Seta Simples ao lado */}
                        <div className="shrink-0 hidden md:flex w-10 h-10 rounded-full bg-gray-50 items-center justify-center text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-all">
                          <HiOutlineChevronRight
                            size={20}
                            className="group-hover:translate-x-0.5 transition-transform"
                          />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>

              {paginacao.total_paginas > 1 && (
                <div className="flex items-center justify-between bg-surface px-6 md:px-8 py-4 rounded-full border border-gray-100 shadow-sm mt-10">
                  <button
                    onClick={() => mudarPagina(paginaAtual - 1)}
                    disabled={paginaAtual === 1}
                    className="flex items-center gap-2 text-xs md:text-sm font-black uppercase tracking-widest text-muted hover:text-primary disabled:opacity-30 transition-colors"
                  >
                    <HiOutlineChevronLeft size={18} /> Anterior
                  </button>
                  <span className="text-xs md:text-sm font-medium text-muted">
                    Página{" "}
                    <strong className="text-foreground font-black">
                      {paginaAtual}
                    </strong>{" "}
                    de {paginacao.total_paginas}
                  </span>
                  <button
                    onClick={() => mudarPagina(paginaAtual + 1)}
                    disabled={paginaAtual === paginacao.total_paginas}
                    className="flex items-center gap-2 text-xs md:text-sm font-black uppercase tracking-widest text-muted hover:text-primary disabled:opacity-30 transition-colors"
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

export default function VitrinePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[60vh] text-muted font-bold animate-pulse">
          Carregando Vitrine...
        </div>
      }
    >
      <VitrineConteudo />
    </Suspense>
  );
}
