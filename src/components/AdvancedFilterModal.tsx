"use client";

import { useState, useEffect } from "react";
import { IoClose } from "react-icons/io5";
import { BiTrash } from "react-icons/bi";
import { ButtonType } from "./ButtonType";

// Definição do tipo para o objeto de filtros
export interface AdvancedFilterData {
  id_area: string;
  niveis: string[];
  modelos: string[];
  salarioMin: string;
  salarioMax: string;
  formacao: string;
  pcd: string; // 'TODAS', 'AFIRMATIVAS', 'EXCLUSIVAS'
}

interface AreaAtuacao {
  id_area_atuacao: number;
  nome: string;
}

interface AdvancedFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: AdvancedFilterData) => void;
  opcoesAreas?: AreaAtuacao[];
  opcoesNiveis?: string[]; // <-- ADICIONAMOS AQUI
}

const ESTADO_INICIAL: AdvancedFilterData = {
  id_area: "",
  niveis: [],
  modelos: [],
  salarioMin: "",
  salarioMax: "",
  formacao: "",
  pcd: "TODAS",
};

// Formatação bonita para exibir na tela
const formatarNivel = (nivel: string) => {
  if (nivel === "NAO_SE_APLICA") return "Não se Aplica";

  let formatado = nivel.charAt(0) + nivel.slice(1).toLowerCase();
  formatado = formatado.replace("agio", "ágio");
  formatado = formatado.replace("encia", "ência");
  return formatado;
};

export function AdvancedFilterModal({
  isOpen,
  onClose,
  onApply,
  opcoesAreas = [],
  opcoesNiveis = [], // <-- ADICIONAMOS AQUI
}: AdvancedFilterModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [filtros, setFiltros] = useState<AdvancedFilterData>(ESTADO_INICIAL);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      document.body.style.overflow = "unset";
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleArrayToggle = (campo: "niveis" | "modelos", valor: string) => {
    setFiltros((prev) => {
      const lista = prev[campo];
      if (lista.includes(valor)) {
        return { ...prev, [campo]: lista.filter((item) => item !== valor) };
      }
      return { ...prev, [campo]: [...lista, valor] };
    });
  };

  const handleLimpar = () => {
    setFiltros(ESTADO_INICIAL);
  };

  const handleAplicar = () => {
    onApply(filtros);
    onClose();
  };

  if (!isVisible && !isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      <div
        className={`
            relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ease-out
            ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* --- CABEÇALHO --- */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Filtros Avançados</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            <IoClose size={24} />
          </button>
        </div>

        {/* --- CORPO COM SCROLL --- */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* 1. Área e Categoria */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
              Área de Atuação
            </h3>
            <div className="space-y-3">
              <select
                value={filtros.id_area}
                onChange={(e) =>
                  setFiltros({ ...filtros, id_area: e.target.value })
                }
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
              >
                <option value="">Selecione uma Área...</option>
                {opcoesAreas.map((area, index) => (
                  <option
                    // Se o id_area_atuacao for undefined, ele usa 'area-0', 'area-1', etc.
                    key={area.id_area_atuacao || `area-${index}`}
                    value={area.id_area_atuacao} // Tenta pegar 'id' caso o nome real do banco seja esse
                  >
                    {area.nome}
                  </option>
                ))}
              </select>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* 2. Detalhes da Vaga (Grid) */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
              Detalhes
            </h3>
            <div className="space-y-4">
              {/* Senioridade (AGORA DINÂMICO!) */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                  Nível de Experiência
                </label>
                <div className="flex flex-wrap gap-2">
                  {opcoesNiveis.map((level) => {
                    const labelFormatada = formatarNivel(level);
                    return (
                      <label key={level} className="cursor-pointer">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={filtros.niveis.includes(level)}
                          onChange={() => handleArrayToggle("niveis", level)}
                        />
                        <span className="inline-block px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 peer-checked:bg-blue-50 peer-checked:text-primary peer-checked:border-primary transition-all select-none">
                          {labelFormatada}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* Modalidade */}
              <div>
                <label className="text-xs text-gray-500 font-medium mb-1.5 block">
                  Modalidade
                </label>
                <div className="flex flex-wrap gap-2">
                  {["PRESENCIAL", "HIBRIDO", "REMOTO"].map((mode) => {
                    const labelFormatada =
                      mode === "HIBRIDO"
                        ? "Híbrido"
                        : mode.charAt(0) + mode.slice(1).toLowerCase();
                    return (
                      <label key={mode} className="cursor-pointer">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={filtros.modelos.includes(mode)}
                          onChange={() => handleArrayToggle("modelos", mode)}
                        />
                        <span className="inline-block px-3 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600 peer-checked:bg-blue-50 peer-checked:text-primary peer-checked:border-primary transition-all select-none">
                          {labelFormatada}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* 3. Salário */}
          <section>
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-3">
              Pretensão Salarial
            </h3>
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  R$
                </span>
                <input
                  type="number"
                  placeholder="Mínimo"
                  value={filtros.salarioMin}
                  onChange={(e) =>
                    setFiltros({ ...filtros, salarioMin: e.target.value })
                  }
                  className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                />
              </div>
              <span className="text-gray-400">-</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  R$
                </span>
                <input
                  type="number"
                  placeholder="Máximo"
                  value={filtros.salarioMax}
                  onChange={(e) =>
                    setFiltros({ ...filtros, salarioMax: e.target.value })
                  }
                  className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm outline-none focus:border-primary"
                />
              </div>
            </div>
          </section>

          <hr className="border-gray-100" />

          {/* 4. Inclusão (PCD) */}
          <section className="bg-purple-50 p-4 rounded-xl border border-purple-100">
            <h3 className="text-sm font-bold text-purple-900 uppercase tracking-wider mb-3 flex items-center gap-2">
              Inclusão Social
            </h3>
            <div className="space-y-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="pcd"
                  checked={filtros.pcd === "TODAS"}
                  onChange={() => setFiltros({ ...filtros, pcd: "TODAS" })}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  Mostrar todas as vagas
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="pcd"
                  checked={filtros.pcd === "AFIRMATIVAS"}
                  onChange={() =>
                    setFiltros({ ...filtros, pcd: "AFIRMATIVAS" })
                  }
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  Vagas inclusivas (PCD)
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio"
                  name="pcd"
                  checked={filtros.pcd === "EXCLUSIVAS"}
                  onChange={() => setFiltros({ ...filtros, pcd: "EXCLUSIVAS" })}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                />
                <span className="text-sm text-gray-700">
                  Vagas Exclusivas para PCD
                </span>
              </label>
            </div>
          </section>

          <div className="h-20"></div>
        </div>

        {/* --- RODAPÉ STICKY --- */}
        <div className="border-t border-gray-100 p-6 bg-white flex items-center gap-4">
          <button
            onClick={handleLimpar}
            className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors font-medium text-sm"
          >
            <BiTrash size={18} /> Limpar
          </button>
          <ButtonType
            onClick={handleAplicar}
            className="flex-1 rounded-xl shadow-lg"
          >
            Aplicar Filtros
          </ButtonType>
        </div>
      </div>
    </div>
  );
}
