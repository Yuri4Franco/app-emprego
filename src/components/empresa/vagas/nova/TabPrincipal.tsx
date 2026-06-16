"use client";

import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { HiOutlineSearch, HiOutlineX } from "react-icons/hi";
import { Input } from "@/src/components/Input";
import { VagaFormData } from "@/src/schemas/vagaSchemas";

interface TabPrincipalProps {
  areas: any[];
}

export default function TabPrincipal({ areas }: TabPrincipalProps) {
  const {
    register,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useFormContext<VagaFormData>();

  const [searchTermArea, setSearchTermArea] = useState("");
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [focusedAreaIndex, setFocusedAreaIndex] = useState(-1);

  const idAreaAtual = watch("id_area_atuacao");

  // ✨ ADICIONE ESTE USEEFFECT
  useEffect(() => {
    // Se existe um ID no form (vindo da edição), mas o texto de busca está vazio, 
    // nós procuramos o nome da área e preenchemos o input visualmente.
    if (idAreaAtual > 0 && areas.length > 0 && searchTermArea === "") {
      const areaEncontrada = areas.find(
        (a: any) => Number(a.id_area || a.id) === idAreaAtual
      );

      if (areaEncontrada) {
        setSearchTermArea(areaEncontrada.nome);
      }
    }
  }, [idAreaAtual, areas, searchTermArea]);

  const getFieldStatus = (fieldName: keyof VagaFormData) => {
    if (errors[fieldName])
      return "border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20";

    const value = watch(fieldName);
    if (value)
      return "border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-emerald-500/20";

    return "border-gray-200 bg-gray-50 focus:border-blue-500";
  };

  const filteredAreas = areas.filter((a: any) =>
    a.nome.toLowerCase().includes(searchTermArea.toLowerCase()),
  );

  const selecionarArea = (area: any) => {
    setValue("id_area_atuacao", Number(area.id_area || area.id));
    setSearchTermArea(area.nome);
    setIsAreaDropdownOpen(false);
    setFocusedAreaIndex(-1);
    trigger("id_area_atuacao");
  };

  const handleKeyDownArea = (e: React.KeyboardEvent) => {
    if (!isAreaDropdownOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        e.preventDefault();
        setIsAreaDropdownOpen(true);
      }
      return;
    }

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedAreaIndex((prev) =>
        prev < filteredAreas.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedAreaIndex((prev) => (prev > 0 ? prev - 1 : 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (focusedAreaIndex >= 0 && filteredAreas[focusedAreaIndex]) {
        selecionarArea(filteredAreas[focusedAreaIndex]);
      }
    } else if (e.key === "Escape") {
      setIsAreaDropdownOpen(false);
      setFocusedAreaIndex(-1);
    }
  };

  return (
    <section className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-gray-100 shadow-sm space-y-6 animate-in slide-in-from-bottom-4">
      <h2 className="text-xl md:text-2xl font-black text-gray-800">
        Informações Principais
      </h2>

      <Input
        label="Título da Vaga"
        placeholder="Ex: Desenvolvedor Front-end Pleno"
        className={getFieldStatus("titulo")}
        {...register("titulo")}
        error={errors.titulo?.message}
      />

      <div className="space-y-2">
        <label className="text-sm font-bold text-gray-700 ml-1">
          Área de Atuação
        </label>
        <div className="relative group">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 z-10" />
          <input
            type="text"
            placeholder="Buscar área (Ex: TI, Comercial...)"
            className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-[20px] outline-none text-sm transition-all focus:ring-4 focus:ring-blue-500/5 ${errors.id_area_atuacao
                ? "border-red-500 bg-red-50/30"
                : "border-gray-100 focus:border-blue-500"
              }`}
            value={searchTermArea}
            onChange={(e) => {
              setSearchTermArea(e.target.value);
              setIsAreaDropdownOpen(true);
              setFocusedAreaIndex(-1);
              if (e.target.value === "") setValue("id_area_atuacao", 0);
            }}
            onFocus={() => setIsAreaDropdownOpen(true)}
            onBlur={() => setTimeout(() => setIsAreaDropdownOpen(false), 200)}
            onKeyDown={handleKeyDownArea}
            role="combobox"
            aria-expanded={isAreaDropdownOpen}
            aria-controls="lista-areas-vaga"
            aria-activedescendant={
              focusedAreaIndex >= 0
                ? `area-vaga-${focusedAreaIndex}`
                : undefined
            }
          />

          {isAreaDropdownOpen && (
            <ul
              id="lista-areas-vaga"
              role="listbox"
              className="absolute w-full mt-2 bg-white border border-gray-100 rounded-[24px] shadow-2xl z-50 max-h-60 overflow-y-auto p-2"
            >
              {filteredAreas.length > 0 ? (
                filteredAreas.map((a: any, index: number) => {
                  const idReal = a.id_area || a.id;
                  const isFocused = index === focusedAreaIndex;
                  return (
                    <li
                      key={`area-${idReal}`}
                      id={`area-vaga-${index}`}
                      role="option"
                      aria-selected={isFocused}
                      onClick={() => selecionarArea(a)}
                      onMouseEnter={() => setFocusedAreaIndex(index)}
                      className={`w-full text-left px-4 py-3 rounded-[16px] text-sm font-medium cursor-pointer transition-colors ${isFocused
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-600 hover:bg-blue-50 hover:text-blue-700"
                        }`}
                    >
                      {a.nome}
                    </li>
                  );
                })
              ) : (
                <li className="px-4 py-3 text-sm text-gray-400 italic">
                  Nenhuma área encontrada...
                </li>
              )}
            </ul>
          )}

          {watch("id_area_atuacao") > 0 && (
            <button
              type="button"
              onClick={() => {
                setValue("id_area_atuacao", 0);
                setSearchTermArea("");
                trigger("id_area_atuacao");
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-100 text-emerald-600 p-1 rounded-full hover:bg-red-100 hover:text-red-600 z-10"
            >
              <HiOutlineX size={16} />
            </button>
          )}
        </div>
        {errors.id_area_atuacao && (
          <p className="text-[10px] text-red-500 font-bold uppercase ml-4">
            {errors.id_area_atuacao.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700 ml-1">
            Nível Hierárquico
          </label>
          <select
            {...register("nivel_hierarquico")}
            className={`w-full p-4 rounded-[20px] outline-none text-sm transition-colors border ${getFieldStatus("nivel_hierarquico")}`}
          >
            <option value="JOVEM_APRENDIZ">Jovem Aprendiz</option>
            <option value="ESTAGIO">Estágio</option>
            <option value="TRAINEE">Trainee</option>
            <option value="OPERACIONAL">Operacional</option>
            <option value="ASSISTENTE">Assistente</option>
            <option value="JUNIOR">Júnior</option>
            <option value="PLENO">Pleno</option>
            <option value="SENIOR">Sênior</option>
            <option value="ESPECIALISTA">Especialista</option>
            <option value="SUPERVISAO">Supervisão</option>
            <option value="GERENCIA">Gerência</option>
            <option value="DIRETORIA">Diretoria</option>
            <option value="NAO_SE_APLICA">Não se aplica</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700 ml-1">
            Tipo de Contrato
          </label>
          <select
            {...register("tipo_contrato")}
            className={`w-full p-4 rounded-[20px] outline-none text-sm transition-colors border ${getFieldStatus("tipo_contrato")}`}
          >
            <optgroup label="Vínculo Empregatício (CLT)">
              <option value="CLT_EFETIVO">Efetivo</option>
              <option value="CLT_TEMPORARIO">Temporário</option>
              <option value="CLT_INTERMITENTE">Intermitente</option>
            </optgroup>
            <optgroup label="Prestação de Serviços">
              <option value="PJ">Prestador de Serviços (PJ)</option>
              <option value="AUTONOMO">Autônomo (RPA)</option>
              <option value="FREELANCE">Freelancer / Eventual</option>
            </optgroup>
            <optgroup label="Formação e Aprendizado">
              <option value="ESTAGIO">Estágio</option>
              <option value="JOVEM_APRENDIZ">Jovem Aprendiz</option>
            </optgroup>
            <optgroup label="Outros Modelos">
              <option value="COOPERADO">Cooperado</option>
              <option value="OUTROS">Outros</option>
            </optgroup>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-sm font-bold text-gray-700 ml-1">
            Modelo de Trabalho
          </label>
          <select
            {...register("modelo_trabalho")}
            className={`w-full p-4 rounded-[20px] outline-none text-sm transition-colors border ${getFieldStatus("modelo_trabalho")}`}
          >
            <option value="PRESENCIAL">Presencial</option>
            <option value="HIBRIDO">Híbrido</option>
            <option value="REMOTO">Remoto</option>
          </select>
        </div>

        {/* DATA DE ENCERRAMENTO AQUI */}
        <div className="space-y-1.5">
          <Input
            label="Data de Encerramento (Opcional)"
            type="date"
            {...register("data_encerramento")}
            className={getFieldStatus("data_encerramento")}

            error={errors.data_encerramento?.message}
          />
          <p className="text-[10px] text-gray-500 ml-1">
            A vaga será ocultada automaticamente após esta data.
          </p>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-gray-100 mt-6">
        <div>
          <h3 className="text-sm font-bold text-gray-800 ml-1">
            Diversidade e Inclusão
          </h3>
          <p className="text-xs text-gray-500 ml-1 mt-1">
            Como esta vaga se posiciona em relação à contratação de Pessoas com
            Deficiência (PcD)?
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <label
            className={`cursor-pointer p-5 border-2 rounded-[24px] flex flex-col gap-2 transition-all group ${watch("tipo_diversidade") === "AMPLA_CONCORRENCIA" ? "bg-blue-50 border-blue-500 shadow-sm" : "bg-white border-gray-100 hover:border-blue-200"}`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                value="AMPLA_CONCORRENCIA"
                {...register("tipo_diversidade")}
                className="hidden"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${watch("tipo_diversidade") === "AMPLA_CONCORRENCIA" ? "border-blue-600" : "border-gray-300 group-hover:border-blue-400"}`}
              >
                {watch("tipo_diversidade") === "AMPLA_CONCORRENCIA" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-in zoom-in" />
                )}
              </div>
              <span
                className={`text-sm font-black tracking-wide ${watch("tipo_diversidade") === "AMPLA_CONCORRENCIA" ? "text-blue-900" : "text-gray-700"}`}
              >
                Ampla Concorrência
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed pl-8">
              Vaga padrão. Por lei, profissionais PcD também podem concorrer,
              mas o processo não possui adaptações específicas garantidas.
            </p>
          </label>

          <label
            className={`cursor-pointer p-5 border-2 rounded-[24px] flex flex-col gap-2 transition-all group ${watch("tipo_diversidade") === "VAGA_INCLUSIVA" ? "bg-blue-50 border-blue-500 shadow-sm" : "bg-white border-gray-100 hover:border-blue-200"}`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                value="VAGA_INCLUSIVA"
                {...register("tipo_diversidade")}
                className="hidden"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${watch("tipo_diversidade") === "VAGA_INCLUSIVA" ? "border-blue-600" : "border-gray-300 group-hover:border-blue-400"}`}
              >
                {watch("tipo_diversidade") === "VAGA_INCLUSIVA" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-in zoom-in" />
                )}
              </div>
              <span
                className={`text-sm font-black tracking-wide flex items-center gap-1.5 ${watch("tipo_diversidade") === "VAGA_INCLUSIVA" ? "text-blue-900" : "text-gray-700"}`}
              >
                Vaga Inclusiva
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed pl-8">
              Sinaliza um <b>ambiente adaptado</b>. Mostra para os candidatos
              que a empresa incentiva ativamente o envio de currículos PcD.
            </p>
          </label>

          <label
            className={`cursor-pointer p-5 border-2 rounded-[24px] flex flex-col gap-2 transition-all group ${watch("tipo_diversidade") === "EXCLUSIVA_PCD" ? "bg-blue-50 border-blue-500 shadow-sm" : "bg-white border-gray-100 hover:border-blue-200"}`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                value="EXCLUSIVA_PCD"
                {...register("tipo_diversidade")}
                className="hidden"
              />
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${watch("tipo_diversidade") === "EXCLUSIVA_PCD" ? "border-blue-600" : "border-gray-300 group-hover:border-blue-400"}`}
              >
                {watch("tipo_diversidade") === "EXCLUSIVA_PCD" && (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-in zoom-in" />
                )}
              </div>
              <span
                className={`text-sm font-black tracking-wide ${watch("tipo_diversidade") === "EXCLUSIVA_PCD" ? "text-blue-900" : "text-gray-700"}`}
              >
                Exclusiva PcD
              </span>
            </div>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed pl-8">
              Vaga de Ação Afirmativa. Destinada <b>exclusivamente</b> a
              profissionais com deficiência (ideal para a Lei de Cotas).
            </p>
          </label>
        </div>
      </div>
    </section>
  );
}
