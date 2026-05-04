"use client";

import { useState, useEffect } from "react";
import { BiSearchAlt, BiSliderAlt, BiTrash } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { ButtonType } from "@/src/components/ButtonType";
import { FilterSelect } from "@/src/components/FilterSelect";
import {
  AdvancedFilterModal,
  AdvancedFilterData,
} from "@/src/components/AdvancedFilterModal";
import api from "@/src/services/api";

// O formato exato que a API de listagem espera receber
export interface JobFilterPayload {
  busca?: string;
  cidade?: string;
  modelo_trabalho?: string;
  tipo_contrato?: string;
  somente_pcd?: boolean;
  nivel_hierarquico?: string;
  salario_min?: string;
  salario_max?: string;
  tipo_pcd?: string;
  id_area_atuacao?: string;
}

interface JobFilterProps {
  totalVagas: number;
  isLoading: boolean;
  onFilterChange: (filtros: JobFilterPayload) => void;
}

// --- FUNÇÕES DE TRADUÇÃO (FRONT <-> BACK) ---
const mapModeloFront = (backendStr: string) => {
  if (backendStr === "HIBRIDO") return "Híbrido";
  if (backendStr === "NAO_SE_APLICA") return "Não se Aplica";
  return backendStr.charAt(0) + backendStr.slice(1).toLowerCase();
};

const mapModeloBack = (frontStr: string) => {
  if (frontStr === "Híbrido") return "HIBRIDO";
  if (frontStr === "Não se Aplica") return "NAO_SE_APLICA";
  return frontStr.toUpperCase();
};

const mapContratoFront = (backendStr: string) => {
  if (backendStr === "CLT_EFETIVO") return "CLT Efetivo";
  if (backendStr === "JOVEM_APRENDIZ") return "Jovem Aprendiz";
  if (backendStr === "ESTAGIO") return "Estágio";
  if (backendStr === "TEMPORARIO") return "Temporário";
  return backendStr.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const mapContratoBack = (frontStr: string) => {
  if (frontStr === "CLT Efetivo") return "CLT_EFETIVO";
  if (frontStr === "Jovem Aprendiz") return "JOVEM_APRENDIZ";
  if (frontStr === "Estágio") return "ESTAGIO";
  if (frontStr === "Temporário") return "TEMPORARIO";
  return frontStr.toUpperCase().replace(/ /g, "_");
};

export function JobFilter({
  totalVagas,
  isLoading,
  onFilterChange,
}: JobFilterProps) {
  // Estados do usuário
  const [busca, setBusca] = useState("");
  const [termoBuscado, setTermoBuscado] = useState("");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [pcdOnly, setPcdOnly] = useState(false);
  const [opcoesAreas, setOpcoesAreas] = useState<any[]>([]);
  const [filtrosAvancados, setFiltrosAvancados] =
    useState<AdvancedFilterData | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  // Estados alimentados dinamicamente pelo Backend
  const [opcoesCidades, setOpcoesCidades] = useState<string[]>([]);
  const [opcoesModelos, setOpcoesModelos] = useState<string[]>([]);
  const [opcoesContratos, setOpcoesContratos] = useState<string[]>([]);

  // 1. BUSCA OS FILTROS REAIS DISPONÍVEIS ASSIM QUE A TELA CARREGA
  useEffect(() => {
    async function fetchOpcoesDinamicas() {
      try {
        const res = await api.get("/vagas/filtros-disponiveis");
        const dados = res.data.data || res.data; // Ajuste se seu backend retornar { success, data: {} }

        if (dados) {
          // Achata as cidades no formato "Panambi - RS" para a barra rápida
          const cidadesFmt: string[] = [];
          dados.locais?.forEach((local: any) => {
            local.cidades.forEach((cid: string) => {
              cidadesFmt.push(`${cid} - ${local.uf}`);
            });
          });
          setOpcoesCidades(cidadesFmt);

          // Mapeia e embeleza as strings para o usuário ler
          setOpcoesModelos((dados.modelos || []).map(mapModeloFront));
          setOpcoesContratos((dados.contratos || []).map(mapContratoFront));

          if (dados.areas) {
            setOpcoesAreas(dados.areas);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar filtros dinâmicos", err);
      }
    }
    fetchOpcoesDinamicas();
  }, []);

  // 2. MONTA O PACOTE E ENVIA PARA A LISTAGEM QUANDO ALGO MUDA
  useEffect(() => {
    // Encontra o que o usuário marcou e extrai apenas a cidade
    const cidadeFiltro = activeFilters
      .find((f) => opcoesCidades.includes(f))
      ?.split(" - ")[0];

    // Acha o modelo/contrato clicado na interface
    const contratoSelecionado = activeFilters.find((f) =>
      opcoesContratos.includes(f),
    );
    const modeloSelecionado = activeFilters.find((f) =>
      opcoesModelos.includes(f),
    );

    const payload: JobFilterPayload = {
      busca: termoBuscado || undefined,
      cidade: cidadeFiltro || undefined,

      // Usa as funções de tradução reversa para enviar o ENUM certinho pro Prisma
      tipo_contrato: contratoSelecionado
        ? mapContratoBack(contratoSelecionado)
        : undefined,
      modelo_trabalho: modeloSelecionado
        ? mapModeloBack(modeloSelecionado)
        : undefined,

      somente_pcd: pcdOnly ? true : undefined,

      // Adiciona filtros avançados se a gaveta foi usada
      nivel_hierarquico: filtrosAvancados?.niveis?.join(",") || undefined,
      ...(filtrosAvancados?.modelos?.length
        ? { modelo_trabalho: filtrosAvancados.modelos.join(",") }
        : {}),
      salario_min: filtrosAvancados?.salarioMin || undefined,
      salario_max: filtrosAvancados?.salarioMax || undefined,
      tipo_pcd:
        filtrosAvancados?.pcd !== "TODAS" ? filtrosAvancados?.pcd : undefined,
      id_area_atuacao: filtrosAvancados?.id_area || undefined,
    };

    // Passa a bola pro VagasListagemContent
    onFilterChange(payload);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [termoBuscado, activeFilters, pcdOnly, filtrosAvancados]);

  const handleBusca = () => {
    setTermoBuscado(busca);
  };

  const handleFilterToggle = (value: string) => {
    setActiveFilters((prev) => {
      if (prev.includes(value)) return prev.filter((item) => item !== value);
      return [...prev, value];
    });
  };

  const handleLimparTodosFiltros = () => {
    setActiveFilters([]);
    setPcdOnly(false);
    setFiltrosAvancados(null);
    setTermoBuscado("");
    setBusca("");
  };

  return (
    <div className="bg-white border-b border-gray-200 pb-8 md:px-8 shadow-sm relative z-20">
      <div className="max-w-7xl mx-auto space-y-6 p-8">
        {/* --- HEADER TÍTULO --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
            {isLoading
              ? "Buscando vagas..."
              : `${totalVagas} Vagas encontradas`}
          </h1>
          <p className="text-gray-500 text-sm">Atualizado em tempo real</p>
        </div>

        {/* --- BARRA DE PESQUISA --- */}
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
            className="h-12 w-12 shrink-0 flex items-center justify-center rounded-full border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-primary hover:border-primary transition-all bg-white relative"
            title="Filtros Avançados"
          >
            <BiSliderAlt className="text-xl" />
            {filtrosAvancados && (
              <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>

          <ButtonType
            onClick={handleBusca}
            className="h-12 px-8 rounded-full hidden md:flex"
          >
            Buscar
          </ButtonType>
        </div>

        {/* --- FILTROS RÁPIDOS (Agora Dinâmicos!) --- */}
        <div className="flex flex-wrap items-center gap-3">
          <FilterSelect
            label="Localização"
            options={opcoesCidades}
            activeFilters={activeFilters}
            onToggle={handleFilterToggle}
          />
          <FilterSelect
            label="Modelo"
            options={opcoesModelos}
            activeFilters={activeFilters}
            onToggle={handleFilterToggle}
          />
          <FilterSelect
            label="Contrato"
            options={opcoesContratos}
            activeFilters={activeFilters}
            onToggle={handleFilterToggle}
          />

          <label
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full border cursor-pointer select-none transition-colors duration-200 ${pcdOnly ? "bg-blue-50 border-primary text-primary" : "bg-white border-gray-300 text-gray-600 hover:border-gray-400"}`}
          >
            <input
              type="checkbox"
              checked={pcdOnly}
              onChange={() => setPcdOnly(!pcdOnly)}
              className="w-4 h-4 rounded text-primary focus:ring-primary border-gray-300 cursor-pointer"
            />
            <span className="text-sm font-bold">Vaga PCD</span>
          </label>
        </div>

        {/* --- CHIPS DE FILTROS ATIVOS --- */}
        {(activeFilters.length > 0 || pcdOnly || filtrosAvancados) && (
          <div className="flex flex-wrap items-center gap-2 pt-2 animate-in fade-in">
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

            {filtrosAvancados && (
              <span className="inline-flex items-center gap-1 pl-3 pr-2 py-1.5 rounded-lg bg-white border border-orange-200 text-orange-700 text-sm font-medium shadow-sm">
                Filtros Avançados Ativos
                <button
                  onClick={() => setFiltrosAvancados(null)}
                  className="hover:bg-orange-50 rounded-md p-0.5 transition-colors"
                >
                  <IoClose className="text-gray-400 hover:text-red-500 text-lg" />
                </button>
              </span>
            )}

            <div className="h-6 border-l border-gray-300 mx-2 w-px"></div>

            <button
              onClick={handleLimparTodosFiltros}
              className="group flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 transition-colors text-sm font-medium"
            >
              <BiTrash className="text-lg group-hover:scale-110 transition-transform" />
              <span>Limpar Tudo</span>
            </button>
          </div>
        )}
      </div>

      {/* O MODAL FICA AQUI DENTRO, ISOLADO! */}
      <AdvancedFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={(filters) => {
          setFiltrosAvancados(filters);
          setIsFilterModalOpen(false);
        }}
        opcoesAreas={opcoesAreas}
      />
    </div>
  );
}
