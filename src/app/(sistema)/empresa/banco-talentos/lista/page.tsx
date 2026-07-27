// page.tsx
"use client";

import { useEffect, useState, Suspense } from "react";
import api from "@/src/services/api";
import { useRouter, useSearchParams } from "next/navigation";
import {
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
  HiOutlineSearch,
  HiOutlineSparkles,
  HiOutlineX,
  HiOutlineArrowLeft,
} from "react-icons/hi";
import toast from "react-hot-toast";

// Importando arquivos criados

import CandidatoCard from "@/src/components/empresa/banco-talentos/CandidatoCard";
import FiltrosSidebar from "@/src/components/empresa/banco-talentos/FiltrosSidebar";
import { CandidatoResumo, Competencia, escolaridadeOptions, turnosOptions, cnhOptions, generoOptions, toggleArrayItem } from "@/src/components/empresa/banco-talentos/constants";
import { AlertaCreditosCurriculo } from "@/src/components/empresa/banco-talentos/BancoTalentosBanner";

function VitrineConteudo() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [candidatos, setCandidatos] = useState<CandidatoResumo[]>([]);
  const [paginacao, setPaginacao] = useState({ pagina_atual: 1, total_paginas: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [todasCompetencias, setTodasCompetencias] = useState<Competencia[]>([]);

  const parseArrayParam = (param: string | null) => (param ? param.split(",") : []);

  // Estados dos Filtros
  const [filtroArea, setFiltroArea] = useState(searchParams.get("area") || "");
  const [filtroTurno, setFiltroTurno] = useState<string[]>(parseArrayParam(searchParams.get("turno")));
  const [filtroEscolaridade, setFiltroEscolaridade] = useState<string[]>(parseArrayParam(searchParams.get("escolaridade")));
  const [filtroCnh, setFiltroCnh] = useState<string[]>(parseArrayParam(searchParams.get("cnh")));
  const [filtroCompetencias, setFiltroCompetencias] = useState<string[]>(parseArrayParam(searchParams.get("competencia")));
  const [filtroPcd, setFiltroPcd] = useState(searchParams.get("pcd") === "true");
  const [filtroPrimeiroEmprego, setFiltroPrimeiroEmprego] = useState(searchParams.get("primeiro_emprego") === "true");
  const [filtroSabados, setFiltroSabados] = useState(searchParams.get("sabados") === "true");
  const [filtroViagem, setFiltroViagem] = useState(searchParams.get("viagem") === "true");

  // ✨ NOVOS FILTROS
  const [filtroGenero, setFiltroGenero] = useState(searchParams.get("genero") || "");
  const [filtroIdadeMin, setFiltroIdadeMin] = useState(searchParams.get("idade_min") || "");
  const [filtroIdadeMax, setFiltroIdadeMax] = useState(searchParams.get("idade_max") || "");

  const [isFirstLoad, setIsFirstLoad] = useState(true);

  const paginaAtual = Number(searchParams.get("pagina")) || 1;

  useEffect(() => {
    api.get("/taxonomia/competencias")
      .then((res) => setTodasCompetencias(res.data.data || res.data.competencias || res.data))
      .catch(() => null);
  }, []);

  const buscarCandidatos = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filtroArea) params.append("area", filtroArea);
      if (filtroTurno.length > 0) params.append("turno", filtroTurno.join(","));
      if (filtroEscolaridade.length > 0) params.append("escolaridade", filtroEscolaridade.join(","));
      if (filtroCnh.length > 0) params.append("cnh", filtroCnh.join(","));
      if (filtroCompetencias.length > 0) params.append("competencia", filtroCompetencias.join(","));

      if (filtroGenero) params.append("genero", filtroGenero);
      if (filtroIdadeMin) params.append("idade_min", filtroIdadeMin);
      if (filtroIdadeMax) params.append("idade_max", filtroIdadeMax);

      if (filtroPcd) params.append("pcd", "true");
      if (filtroPrimeiroEmprego) params.append("primeiro_emprego", "true");
      if (filtroSabados) params.append("sabados", "true");
      if (filtroViagem) params.append("viagem", "true");

      params.append("pagina", paginaAtual.toString());

      const res = await api.get(`/empresas/banco-talentos?${params.toString()}`);
      setCandidatos(res.data.dados);
      setPaginacao(res.data.paginacao);

      router.replace(`/empresa/banco-talentos/lista?${params.toString()}`, { scroll: false });
    } catch (error) {
      toast.error("Erro ao buscar talentos.");
    } finally {
      setIsLoading(false);
    }
  };

  // ✨ APLICAÇÃO DO DEBOUNCE NO USE EFFECT
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      buscarCandidatos();
    }, 400); // Aguarda 400ms após o usuário parar de digitar/clicar para chamar a API

    return () => clearTimeout(delayDebounceFn);
  }, [filtroArea, filtroTurno, filtroEscolaridade, filtroCnh, filtroCompetencias, filtroPcd, filtroPrimeiroEmprego, filtroSabados, filtroViagem, filtroGenero, filtroIdadeMin, filtroIdadeMax, paginaAtual]);

  useEffect(() => {
    if ("scrollRestoration" in window.history) {
      window.history.scrollRestoration = "manual";
    }
  }, []);

  // ✨ 2. RESTAURA O SCROLL (Com Trava Dupla para vencer o Next.js)
  useEffect(() => {
    if (!isLoading && isFirstLoad && candidatos.length > 0) {
      const savedScroll = sessionStorage.getItem("vitrine_scroll_y");

      if (savedScroll) {
        const position = parseInt(savedScroll, 10);

        // Ação 1: Restaura imediatamente quando a DOM pinta
        requestAnimationFrame(() => {
          window.scrollTo({ top: position, behavior: "instant" });
        });

        // Ação 2: A Trava Dupla. Esperamos 350ms para deixar o Next.js dar o pulo falso dele, 
        // e então puxamos a tela de volta pro lugar certo.
        const timeoutId = setTimeout(() => {
          window.scrollTo({ top: position, behavior: "instant" });
          setIsFirstLoad(false); // Libera o sistema para salvar novos scrolls APÓS a poeira baixar
        }, 350);

        return () => clearTimeout(timeoutId);
      } else {
        setIsFirstLoad(false);
      }
    }
  }, [isLoading, isFirstLoad, candidatos]);

  // ✨ 3. SALVA O SCROLL (Com proteção contra pulos falsos)
  useEffect(() => {
    // Só deixa salvar se a página não estiver carregando e o primeiro load (e a trava dupla) já passou
    if (isLoading || isFirstLoad) return;

    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      // Usamos um debounce de 100ms. 
      // Se o navegador der um "pulo" sozinho, a gente não salva isso imediatamente.
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        sessionStorage.setItem("vitrine_scroll_y", window.scrollY.toString());
      }, 100);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timeoutId);
    };
  }, [isLoading, isFirstLoad]);

  const mudarPagina = (novaPagina: number) => {
    if (novaPagina < 1 || novaPagina > paginacao.total_paginas) return;
    sessionStorage.removeItem("vitrine_scroll_y");
    window.scrollTo({ top: 0, behavior: "smooth" });
    const params = new URLSearchParams(searchParams.toString());
    params.set("pagina", novaPagina.toString());
    router.push(`/empresa/banco-talentos/lista?${params.toString()}`);
  };

  const limparFiltros = () => {
    sessionStorage.removeItem("vitrine_scroll_y");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setFiltroArea(""); setFiltroTurno([]); setFiltroEscolaridade([]); setFiltroCnh([]); setFiltroCompetencias([]);
    setFiltroPcd(false); setFiltroPrimeiroEmprego(false); setFiltroSabados(false); setFiltroViagem(false);
    setFiltroGenero(""); setFiltroIdadeMin(""); setFiltroIdadeMax(""); // Limpa os novos
    router.push("/empresa/banco-talentos/lista");
  };

  const temFiltroAtivo = filtroTurno.length > 0 || filtroEscolaridade.length > 0 || filtroCnh.length > 0 || filtroCompetencias.length > 0 || filtroPcd || filtroPrimeiroEmprego || filtroSabados || filtroViagem || filtroArea !== "" || filtroGenero !== "" || filtroIdadeMin !== "" || filtroIdadeMax !== "";

  // Agrupando tags ativas para mostrar no topo do grid
  const getFiltrosAtivos = () => {
    const ativos = [];
    if (filtroArea) ativos.push({ label: "Área Específica", onRemove: () => setFiltroArea("") });

    // Gênero e Idade no Cabeçalho
    if (filtroGenero) ativos.push({ label: `Gênero: ${generoOptions.find(g => g.value === filtroGenero)?.label || filtroGenero}`, onRemove: () => setFiltroGenero("") });
    if (filtroIdadeMin || filtroIdadeMax) {
      let label = "Idade: ";
      if (filtroIdadeMin && filtroIdadeMax) label += `${filtroIdadeMin} a ${filtroIdadeMax} anos`;
      else if (filtroIdadeMin) label += `Min ${filtroIdadeMin} anos`;
      else label += `Máx ${filtroIdadeMax} anos`;
      ativos.push({ label, onRemove: () => { setFiltroIdadeMin(""); setFiltroIdadeMax(""); } });
    }

    filtroTurno.forEach((val) => ativos.push({ label: turnosOptions.find((t) => t.value === val)?.label || val, onRemove: () => setFiltroTurno(toggleArrayItem(filtroTurno, val)) }));
    filtroEscolaridade.forEach((val) => ativos.push({ label: escolaridadeOptions.find((e) => e.value === val)?.label || val, onRemove: () => setFiltroEscolaridade(toggleArrayItem(filtroEscolaridade, val)) }));
    filtroCnh.forEach((val) => ativos.push({ label: `CNH: ${cnhOptions.find((c) => c.value === val)?.label || val}`, onRemove: () => setFiltroCnh(toggleArrayItem(filtroCnh, val)) }));
    filtroCompetencias.forEach((val) => ativos.push({ label: `Hab: ${todasCompetencias.find((c) => c.id_competencia.toString() === val)?.nome}`, onRemove: () => setFiltroCompetencias(toggleArrayItem(filtroCompetencias, val)) }));
    if (filtroPrimeiroEmprego) ativos.push({ label: "1º Emprego", onRemove: () => setFiltroPrimeiroEmprego(false) });
    if (filtroPcd) ativos.push({ label: "PcD", onRemove: () => setFiltroPcd(false) });
    if (filtroSabados) ativos.push({ label: "Sábados", onRemove: () => setFiltroSabados(false) });
    if (filtroViagem) ativos.push({ label: "Viagens", onRemove: () => setFiltroViagem(false) });
    return ativos;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 py-10 px-6 md:px-10 animate-in fade-in duration-700">
      <AlertaCreditosCurriculo />

      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md">
        <HiOutlineArrowLeft size={18} /> Voltar
      </button>


      <header className="mb-8 bg-surface p-8 md:p-10 rounded-[32px] border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
            <HiOutlineSparkles size={14} /> Busca Avançada
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight flex items-center gap-3">Vitrine de Talentos</h1>
          <p className="text-muted text-sm md:text-base">Mostrando <strong className="text-foreground">{paginacao.total}</strong> profissionais disponíveis.</p>
        </div>
      </header>

      <div className="flex flex-col lg:flex-row gap-8 items-start">

        {/* COMPONENTE: FiltrosSidebar (Com os novos campos mapeados) */}
        <FiltrosSidebar
          filtros={{
            turno: filtroTurno,
            escolaridade: filtroEscolaridade,
            cnh: filtroCnh,
            competencias: filtroCompetencias,
            pcd: filtroPcd,
            primeiroEmprego: filtroPrimeiroEmprego,
            sabados: filtroSabados,
            viagem: filtroViagem,
            genero: filtroGenero,
            idadeMin: filtroIdadeMin,
            idadeMax: filtroIdadeMax
          }}
          setters={{
            setFiltroTurno,
            setFiltroEscolaridade,
            setFiltroCnh,
            setFiltroCompetencias,
            setFiltroPcd,
            setFiltroPrimeiroEmprego,
            setFiltroSabados,
            setFiltroViagem,
            setFiltroGenero,
            setIdadeMin: setFiltroIdadeMin,
            setIdadeMax: setFiltroIdadeMax
          }}
          todasCompetencias={todasCompetencias}
          temFiltroAtivo={temFiltroAtivo}
          limparFiltros={limparFiltros}
        />

        <main className="flex-1 w-full space-y-6">
          {getFiltrosAtivos().length > 0 && (
            <div className="flex items-center flex-wrap gap-2 animate-in slide-in-from-top-2 bg-surface p-4 rounded-[24px] border border-gray-100 shadow-sm">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-1">Filtros:</span>
              {getFiltrosAtivos().map((tag, index) => (
                <div key={index} className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[9px] font-black uppercase tracking-widest">
                  {tag.label}
                  <button onClick={tag.onRemove} className="p-0.5 rounded-full hover:bg-primary/20 hover:text-hover-button transition-colors">
                    <HiOutlineX size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="h-40 bg-surface border border-gray-100 rounded-[32px] animate-pulse shadow-sm"></div>)}
            </div>
          ) : candidatos.length === 0 ? (
            <div className="bg-surface rounded-[40px] border border-dashed border-gray-200 p-16 md:p-20 text-center">
              <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-5">
                <HiOutlineSearch size={36} />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground">Nenhum talento encontrado</h3>
              <p className="text-muted mt-2 text-sm md:text-base">Tente remover alguns filtros para ver mais opções.</p>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {candidatos.map((candidato) => (
                  <CandidatoCard key={candidato.id_candidato} candidato={candidato} />
                ))}
              </div>

              {paginacao.total_paginas > 1 && (
                <div className="flex items-center justify-between bg-surface px-6 md:px-8 py-4 rounded-full border border-gray-100 shadow-sm mt-10">
                  <button onClick={() => mudarPagina(paginaAtual - 1)} disabled={paginaAtual === 1} className="flex items-center gap-2 text-xs md:text-sm font-black uppercase tracking-widest text-muted hover:text-primary disabled:opacity-30 transition-colors">
                    <HiOutlineChevronLeft size={18} /> Anterior
                  </button>
                  <span className="text-xs md:text-sm font-medium text-muted">
                    Página <strong className="text-foreground font-black">{paginaAtual}</strong> de {paginacao.total_paginas}
                  </span>
                  <button onClick={() => mudarPagina(paginaAtual + 1)} disabled={paginaAtual === paginacao.total_paginas} className="flex items-center gap-2 text-xs md:text-sm font-black uppercase tracking-widest text-muted hover:text-primary disabled:opacity-30 transition-colors">
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
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh] text-muted font-bold animate-pulse">Carregando Vitrine...</div>}>
      <VitrineConteudo />
    </Suspense>
  );
}