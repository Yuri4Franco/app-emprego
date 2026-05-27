"use client";

import { useState, useEffect } from "react";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
  HiOutlineLightningBolt,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineInformationCircle,
  HiOutlineSparkles,
} from "react-icons/hi";

interface TabCompetenciasProps {
  dadosIniciais: any;
  onAtualizarProgresso: () => void;
}

export default function TabCompetencias({
  dadosIniciais,
  onAtualizarProgresso,
}: TabCompetenciasProps) {
  const [competencias, setCompetencias] = useState<any[]>(
    dadosIniciais?.competencias || [],
  );
  const [listaTaxonomiaCompetencias, setListaTaxonomiaCompetencias] = useState<
    any[]
  >([]);

  const [searchTermComp, setSearchTermComp] = useState("");
  const [isCompDropdownOpen, setIsCompDropdownOpen] = useState(false);
  const [compSelecionada, setCompSelecionada] = useState<any | null>(null);

  // Busca a lista completa de habilidades do banco de talentos (Taxonomia)
  useEffect(() => {
    const carregarTaxonomia = async () => {
      try {
        const res = await api.get("/taxonomia/competencias");
        const compData = res.data?.data || res.data?.competencias || res.data;

        if (Array.isArray(compData)) {
          // Garante que só carrega para a busca as competências aprovadas pela ACI
          const apenasAprovadas = compData.filter(
            (c) => c.status === "APROVADA" || !c.status, // fallback caso o backend ainda não mande o status
          );
          setListaTaxonomiaCompetencias(apenasAprovadas);
        }
      } catch (error) {
        console.error("Erro ao carregar lista de competências", error);
      }
    };
    carregarTaxonomia();
  }, []);

  // Filtra as habilidades (remove as que o usuário já adicionou e aplica a busca)
  const filteredCompetencias = listaTaxonomiaCompetencias.filter((tax) => {
    const jaAdicionou = competencias.some(
      (c) => c.id_competencia === tax.id_competencia,
    );
    const bateComBusca = tax.nome
      .toLowerCase()
      .includes(searchTermComp.toLowerCase());
    return !jaAdicionou && bateComBusca;
  });

  // Verifica se o texto digitado não é exatamente igual a nenhuma competência já listada
  const mostrarSugestao =
    searchTermComp.trim().length > 1 &&
    !listaTaxonomiaCompetencias.some(
      (c) => c.nome.toLowerCase() === searchTermComp.trim().toLowerCase(),
    );

  const adicionarCompetencia = async (
    id_competencia: number,
    nivel: string,
  ) => {
    if (competencias.length >= 10) {
      toast.error("Você já atingiu o limite máximo de 10 competências.");
      return;
    }
    if (competencias.find((c) => c.id_competencia === id_competencia)) {
      toast.error("Você já adicionou essa competência.");
      return;
    }

    try {
      const payload = { id_competencia, nivel };
      await api.post("/candidato/competencias", payload);

      const compTaxonomia = listaTaxonomiaCompetencias.find(
        (c) => c.id_competencia === id_competencia,
      );
      setCompetencias((prev) => [
        ...prev,
        { ...payload, competencia: compTaxonomia },
      ]);

      resetarBusca();
      toast.success("Habilidade adicionada!");
      onAtualizarProgresso();
    } catch (error) {
      toast.error("Erro ao adicionar competência.");
    }
  };

  const sugerirCompetencia = async (nome: string, nivel: string) => {
    if (competencias.length >= 10) {
      toast.error("Você já atingiu o limite máximo de 10 competências.");
      return;
    }

    const toastId = toast.loading("Enviando sugestão...");
    try {
      const payload = { nome: nome.trim(), nivel };
      const res = await api.post("/candidato/competencias/sugerir", payload);

      // Assumindo que o backend retorna o vínculo recém criado ou os dados para montar o card
      const novaCompetencia = {
        id_competencia: res.data?.data?.id_competencia || Date.now(), // Fallback de ID para a UI não quebrar
        nivel,
        competencia: {
          nome: payload.nome,
          status: "PENDENTE",
        },
      };

      setCompetencias((prev) => [...prev, novaCompetencia]);
      resetarBusca();
      toast.success("Sugestão enviada e adicionada ao perfil!", {
        id: toastId,
      });
      onAtualizarProgresso();
    } catch (error) {
      toast.error("Erro ao sugerir habilidade. Tente novamente.", {
        id: toastId,
      });
    }
  };

  const removerCompetencia = async (id_competencia: number) => {
    try {
      await api.delete(`/candidato/competencias/${id_competencia}`);
      setCompetencias((prev) =>
        prev.filter((c) => c.id_competencia !== id_competencia),
      );
      toast.success("Competência removida.");
      onAtualizarProgresso();
    } catch (error) {
      toast.error("Erro ao remover.");
    }
  };

  const handleSelecaoNivel = (nivel: string) => {
    if (compSelecionada.isSuggestion) {
      sugerirCompetencia(compSelecionada.nome, nivel);
    } else {
      adicionarCompetencia(compSelecionada.id_competencia, nivel);
    }
  };

  const resetarBusca = () => {
    setSearchTermComp("");
    setCompSelecionada(null);
    setIsCompDropdownOpen(false);
  };

  return (
    <section className="bg-white p-6 md:p-10 rounded-[24px] md:rounded-[48px] shadow-sm border border-gray-100 space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4 pt-4 mt-4">
      {/* CABEÇALHO E TEXTOS EDUCATIVOS */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-gray-800">
            Suas Habilidades
          </h2>
          <p className="text-xs md:text-sm text-gray-500 mt-1">
            Adicione até 10 ferramentas, tecnologias ou comportamentos.
            <span
              className={`ml-1 font-bold ${competencias.length === 10 ? "text-red-500" : "text-blue-500"}`}
            >
              ({competencias.length}/10)
            </span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-2xl flex items-start gap-3">
            <HiOutlineSparkles
              className="text-blue-500 shrink-0 mt-0.5"
              size={20}
            />
            <div>
              <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest mb-1">
                O que são Habilidades?
              </h4>
              <p className="text-xs text-blue-800/80 leading-relaxed font-medium">
                Fortaleça seu perfil destacando suas tecnologias dominadas e as
                competências estratégicas que impulsionam suas entregas.
              </p>
            </div>
          </div>
          <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
            <HiOutlineInformationCircle
              className="text-amber-500 shrink-0 mt-0.5"
              size={20}
            />
            <div>
              <h4 className="text-xs font-black text-amber-900 uppercase tracking-widest mb-1">
                Construa com a gente
              </h4>
              <p className="text-xs text-amber-800/80 leading-relaxed font-medium">
                Nosso banco de dados está em fase de crescimento. Se você não
                encontrar a sua habilidade na busca,{" "}
                <strong>basta sugerir</strong>! Ela entra no seu currículo e a
                equipe da ACI-Panambi revisa.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:gap-10">
        {/* LADO ESQUERDO: BUSCA E SELEÇÃO */}
        <div className="space-y-4">
          <label className="text-xs md:text-sm font-bold text-gray-700 ml-1">
            Buscar ou Sugerir Habilidade
          </label>
          <div className="relative group">
            <HiOutlineSearch
              className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 z-10"
              size={20}
            />
            <input
              type="text"
              placeholder="Ex: Liderança, Empilhadeira, Excel..."
              disabled={competencias.length >= 10 || compSelecionada !== null}
              className="w-full pl-14 pr-4 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-full md:rounded-[24px] outline-none text-sm transition-all focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 disabled:opacity-50"
              value={compSelecionada ? compSelecionada.nome : searchTermComp}
              onChange={(e) => {
                setSearchTermComp(e.target.value);
                setIsCompDropdownOpen(true);
              }}
              onFocus={() => setIsCompDropdownOpen(true)}
              // Atraso no onBlur para dar tempo de clicar na sugestão
              onBlur={() => setTimeout(() => setIsCompDropdownOpen(false), 200)}
            />
            {compSelecionada && (
              <button
                type="button"
                onClick={resetarBusca}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-200 text-gray-600 p-1.5 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors z-10"
              >
                <HiOutlineX size={14} />
              </button>
            )}

            {/* DROPDOWN DE RESULTADOS */}
            {isCompDropdownOpen &&
              searchTermComp.length > 0 &&
              !compSelecionada && (
                <div className="absolute w-full mt-2 bg-white border border-gray-100 rounded-[20px] md:rounded-[24px] shadow-2xl z-50 max-h-60 overflow-y-auto p-2 animate-in fade-in duration-200 flex flex-col">
                  {filteredCompetencias.length > 0 ? (
                    filteredCompetencias.map((comp: any) => (
                      <button
                        key={`comp-${comp.id_competencia}`}
                        type="button"
                        onClick={() => {
                          setCompSelecionada(comp);
                          setIsCompDropdownOpen(false);
                        }}
                        className="w-full text-left px-5 py-3 hover:bg-blue-50 rounded-[16px] text-sm font-bold text-gray-700 hover:text-blue-700 transition-colors"
                      >
                        {comp.nome}
                      </button>
                    ))
                  ) : (
                    <div className="px-5 py-3 text-sm text-gray-400 font-medium italic">
                      Nenhuma habilidade cadastrada encontrada.
                    </div>
                  )}

                  {/* BOTÃO DE SUGERIR (Sempre aparece se não houver match exato) */}
                  {mostrarSugestao && (
                    <button
                      type="button"
                      onClick={() => {
                        setCompSelecionada({
                          isSuggestion: true,
                          nome: searchTermComp.trim(),
                        });
                        setIsCompDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-5 py-3 mt-1 bg-amber-50 hover:bg-amber-100 rounded-[16px] text-sm font-bold text-amber-700 transition-colors border border-amber-200/50"
                    >
                      <span>Sugerir "{searchTermComp.trim()}"</span>
                      <HiOutlinePlus size={16} />
                    </button>
                  )}
                </div>
              )}
          </div>

          {/* ESCOLHA O NÍVEL (Aparece após selecionar ou sugerir) */}
          {compSelecionada && (
            <div
              className={`p-5 md:p-6 rounded-[24px] md:rounded-[32px] border animate-in slide-in-from-top-2 ${compSelecionada.isSuggestion ? "bg-amber-50/50 border-amber-100" : "bg-blue-50 border-blue-100"}`}
            >
              <p
                className={`text-[11px] md:text-xs font-black uppercase tracking-widest mb-3 md:mb-4 ${compSelecionada.isSuggestion ? "text-amber-800" : "text-blue-800"}`}
              >
                Qual seu nível em "{compSelecionada.nome}"?
              </p>
              <div className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleSelecaoNivel("BASICO")}
                  className={`w-full py-3 bg-white rounded-[16px] text-sm font-bold transition-colors border ${compSelecionada.isSuggestion ? "text-amber-700 border-amber-100 hover:bg-amber-500 hover:text-white" : "text-blue-700 border-blue-100 hover:bg-primary hover:text-white"}`}
                >
                  Básico (Tenho noções)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelecaoNivel("INTERMEDIARIO")}
                  className={`w-full py-3 bg-white rounded-[16px] text-sm font-bold transition-colors border ${compSelecionada.isSuggestion ? "text-amber-700 border-amber-100 hover:bg-amber-500 hover:text-white" : "text-blue-700 border-blue-100 hover:bg-primary hover:text-white"}`}
                >
                  Intermediário (Me viro bem)
                </button>
                <button
                  type="button"
                  onClick={() => handleSelecaoNivel("AVANCADO")}
                  className={`w-full py-3 bg-white rounded-[16px] text-sm font-bold transition-colors border ${compSelecionada.isSuggestion ? "text-amber-700 border-amber-100 hover:bg-amber-500 hover:text-white" : "text-blue-700 border-blue-100 hover:bg-primary hover:text-white"}`}
                >
                  Avançado (Domino)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* MOSTRUÁRIO DE HABILIDADES SALVAS */}
        <div className="bg-gray-50 border border-gray-100 rounded-[24px] md:rounded-[32px] p-5 md:p-6  overflow-y-auto">
          <h3 className="text-[10px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-4 ml-1 md:ml-2">
            Suas Seleções
          </h3>

          {competencias.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
              <HiOutlineLightningBolt
                size={40}
                className="text-gray-300 mb-2 md:w-12 md:h-12"
              />
              <p className="text-xs md:text-sm font-bold text-gray-400">
                Nenhuma habilidade salva
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2 items-start content-start">
              {competencias.map((c: any) => {
                const isPendente =
                  c.competencia?.status === "PENDENTE" ||
                  c.status === "PENDENTE";

                return (
                  <div
                    key={`saved-${c.id_competencia}`}
                    className={`group flex flex-col px-4 py-2 md:py-3 bg-white border rounded-[16px] md:rounded-[20px] shadow-sm transition-all relative w-full sm:w-auto ${isPendente ? "border-amber-200 hover:border-amber-300" : "border-gray-200 hover:border-blue-300"}`}
                  >
                    <span className="text-xs md:text-sm font-black text-gray-800 pr-6">
                      {c.competencia?.nome || "Carregando..."}
                    </span>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] md:text-[10px] font-bold text-blue-500 uppercase tracking-wider">
                        {c.nivel}
                      </span>
                      {isPendente && (
                        <span
                          className="bg-amber-100 text-amber-700 text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-widest"
                          title="Sua sugestão está em análise pela equipe"
                        >
                          Em Análise ⏳
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => removerCompetencia(c.id_competencia)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-50 text-gray-400 p-2 rounded-full sm:opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <HiOutlineTrash size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
