"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  HiOutlineBriefcase,
  HiOutlineMap,
  HiOutlineGift,
  HiOutlineClipboardList,
  HiOutlineChevronRight,
  HiOutlineChevronLeft,
  HiOutlineSave,
  HiOutlineUpload,
  HiOutlineX,
  HiOutlineEyeOff,
  HiOutlineSearch,
  HiOutlineViewList,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineCalendar,
  HiOutlineInformationCircle,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";

// 1. Schema
const vagaSchema = z.object({
  titulo: z.string().min(5, "Título muito curto"),
  id_area_atuacao: z.coerce.number().min(1, "Selecione uma área profissional"),
  nivel_hierarquico: z.string().min(1, "Selecione o nível"),
  modelo_trabalho: z.string().min(1, "Selecione o modelo"),
  tipo_contrato: z.string().min(1, "Selecione o contrato"),
  tipo_salario: z.enum(["FAIXA", "COMBINAR", "OCULTO"]).default("FAIXA"),
  salario_de: z.coerce.number().optional(),
  salario_ate: z.coerce.number().optional(),
  empresa_confidencial: z.boolean().default(false),
  descricao: z.string().min(15, "Descrição detalhada é obrigatória"),
  responsabilidades: z.string().min(10, "Informe as responsabilidades"),
  requisitos_obrigatorios: z.string().min(10, "Informe os requisitos"),
  diferenciais: z.string().optional().default(""),
  cidade: z.string().min(2, "Cidade obrigatória").default("Panambi"),
  uf: z.string().min(2, "UF obrigatória").default("RS"),
  beneficios_ids: z.array(z.number()).default([]),
  tipo_diversidade: z.string().default("AMPLA_CONCORRENCIA"),
  perguntas_eliminatorias: z
    .array(
      z.object({
        id_pergunta: z.number(),
        resposta_esperada: z.boolean(),
      }),
    )
    .default([]),
  // ETAPAS INTERMEDIÁRIAS
  etapas: z.array(
    z.object({
      nome: z.string().min(2, "Nome da etapa é obrigatório"),
      requer_agendamento: z.boolean().default(false),
    }),
  ),
});

type VagaFormData = z.infer<typeof vagaSchema>;

export default function NovaVagaPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [areas, setAreas] = useState([]);
  const [searchTermArea, setSearchTermArea] = useState("");
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [beneficiosTaxonomia, setBeneficiosTaxonomia] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    control,
    formState: { errors },
  } = useForm<VagaFormData>({
    resolver: zodResolver(vagaSchema) as any,
    defaultValues: {
      titulo: "",
      id_area_atuacao: 0,
      nivel_hierarquico: "JUNIOR",
      modelo_trabalho: "PRESENCIAL",
      tipo_contrato: "CLT",
      tipo_salario: "OCULTO",
      salario_de: "" as any,
      salario_ate: "" as any,
      empresa_confidencial: false,
      descricao: "",
      responsabilidades: "",
      requisitos_obrigatorios: "",
      diferenciais: "",
      cidade: "Panambi",
      uf: "RS",
      beneficios_ids: [],
      perguntas_eliminatorias: [],
      tipo_diversidade: "AMPLA_CONCORRENCIA",
      // Deixamos duas etapas intermediárias como padrão de sugestão
      etapas: [
        { nome: "Triagem", requer_agendamento: false },
        { nome: "Entrevistas", requer_agendamento: true },
      ],
    },
  });

  const {
    fields: etapasFields,
    append: appendEtapa,
    remove: removeEtapa,
  } = useFieldArray({
    control,
    name: "etapas",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resAreas, resBen, resPadrao] = await Promise.all([
          api.get("/taxonomia/areas"),
          api.get("/taxonomia/beneficios"),
          api.get("/empresa/meus-beneficios-padrao"),
        ]);

        setAreas(resAreas.data);
        setBeneficiosTaxonomia(resBen.data);

        const idAtual = getValues("id_area_atuacao");
        if (idAtual > 0) {
          const areaEncontrada = resAreas.data.find(
            (a: any) => a.id_area_atuacao === idAtual,
          );
          if (areaEncontrada) setSearchTermArea(areaEncontrada.nome);
        }

        const beneficiosPadrao = resPadrao.data.data || resPadrao.data;

        if (Array.isArray(beneficiosPadrao) && beneficiosPadrao.length > 0) {
          const idsPadrao = beneficiosPadrao.map((b: any) =>
            Number(b.id_beneficio),
          );
          setValue("beneficios_ids", idsPadrao, {
            shouldValidate: true,
            shouldDirty: true,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar dados auxiliares", error);
      }
    };

    loadData();
  }, [setValue, getValues]);

  const selectedBeneficios = watch("beneficios_ids");
  const tipoSalarioSelecionado = watch("tipo_salario");

  const filteredAreas = areas.filter((a: any) =>
    a.nome.toLowerCase().includes(searchTermArea.toLowerCase()),
  );

  const handleFormSubmit = (enviarParaAprovacao: boolean) => {
    return handleSubmit(
      async (data: VagaFormData) => {
        setIsLoading(true);
        try {
          // A MÁGICA ACONTECE AQUI: Montamos o array completo blindado!
          const etapasCompletas = [
            { nome: "Inscritos", requer_agendamento: false }, // Fixo no início
            ...data.etapas, // O que a empresa digitou
            { nome: "Aprovados", requer_agendamento: false }, // Fixo no final
          ].map((etapa, idx) => ({
            ...etapa,
            ordem: idx,
          }));

          const payload = {
            ...data,
            etapas: etapasCompletas,
            salario_a_combinar: data.tipo_salario === "COMBINAR",
            ocultar_salario: data.tipo_salario === "OCULTO",
            enviar_para_aprovacao: enviarParaAprovacao,
          };

          await api.post("/vagas", payload);
          toast.success(
            enviarParaAprovacao
              ? "Vaga enviada para aprovação!"
              : "Rascunho salvo!",
          );
          router.push("/empresa/vagas");
        } catch (error: any) {
          toast.error(error.response?.data?.error || "Erro ao criar vaga");
        } finally {
          setIsLoading(false);
        }
      },
      (err) => {
        console.log("Erro de validação final:", err);
        toast.error("Preencha todos os campos obrigatórios antes de enviar.");
      },
    );
  };

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const handleNext = async () => {
    const fieldsToValidate: any = {
      1: [
        "titulo",
        "id_area_atuacao",
        "nivel_hierarquico",
        "modelo_trabalho",
        "tipo_contrato",
      ],
      2: [
        "descricao",
        "responsabilidades",
        "requisitos_obrigatorios",
        "cidade",
        "uf",
      ],
      3: ["beneficios_ids"],
      4: ["etapas"],
    };

    const isValid = await trigger(fieldsToValidate[step]);

    if (isValid) {
      nextStep();
    } else {
      toast.error("Por favor, preencha os campos corretamente para avançar.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
      {/* Header Stepper com 5 Passos */}
      <div className="flex items-center justify-between mb-12 bg-white p-6 rounded-[32px] shadow-sm border border-gray-100">
        {[
          { s: 1, label: "Vaga", icon: <HiOutlineBriefcase /> },
          { s: 2, label: "Detalhes", icon: <HiOutlineMap /> },
          { s: 3, label: "Benefícios", icon: <HiOutlineGift /> },
          { s: 4, label: "Etapas", icon: <HiOutlineViewList /> },
          { s: 5, label: "Revisão", icon: <HiOutlineClipboardList /> },
        ].map((item) => (
          <div
            key={`step-${item.s}`}
            className={`flex items-center gap-2 ${step >= item.s ? "text-blue-600" : "text-gray-300"}`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${step >= item.s ? "border-blue-600 bg-blue-50" : "border-gray-100"} transition-all`}
            >
              {item.icon}
            </div>
            <span className="hidden md:block text-[10px] font-black uppercase">
              {item.label}
            </span>
          </div>
        ))}
      </div>

      <form className="space-y-8">
        {step === 1 && (
          <section className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-6 animate-in slide-in-from-right-4">
            <h2 className="text-2xl font-black text-gray-800">
              Informações Principais
            </h2>
            <Input
              label="Título da Vaga"
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
                  placeholder="Digite para buscar área (Ex: TI, Comercial...)"
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-[20px] outline-none text-sm transition-all focus:ring-4 focus:ring-blue-500/5 ${errors.id_area_atuacao ? "border-red-500" : "border-gray-100 focus:border-blue-500"}`}
                  value={searchTermArea}
                  onChange={(e) => {
                    setSearchTermArea(e.target.value);
                    setIsAreaDropdownOpen(true);
                    if (e.target.value === "") setValue("id_area_atuacao", 0);
                  }}
                  onFocus={() => setIsAreaDropdownOpen(true)}
                  onBlur={() =>
                    setTimeout(() => setIsAreaDropdownOpen(false), 200)
                  }
                />

                {isAreaDropdownOpen && (
                  <div className="absolute w-full mt-2 bg-white border border-gray-100 rounded-[24px] shadow-2xl z-50 max-h-60 overflow-y-auto p-2 animate-in fade-in zoom-in-95 duration-200">
                    {filteredAreas.length > 0 ? (
                      filteredAreas.map((a: any) => {
                        const idReal = a.id_area_atuacao || a.id_area || a.id;
                        return (
                          <button
                            key={`area-${idReal}`}
                            type="button"
                            onClick={() => {
                              setValue("id_area_atuacao", Number(idReal));
                              setSearchTermArea(a.nome);
                              setIsAreaDropdownOpen(false);
                              trigger("id_area_atuacao");
                            }}
                            className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-[16px] text-sm font-medium text-gray-600 hover:text-blue-700 transition-colors"
                          >
                            {a.nome}
                          </button>
                        );
                      })
                    ) : (
                      <div className="px-4 py-3 text-sm text-gray-400 italic">
                        Nenhuma área encontrada...
                      </div>
                    )}
                  </div>
                )}

                {watch("id_area_atuacao") > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setValue("id_area_atuacao", 0);
                      setSearchTermArea("");
                      setIsAreaDropdownOpen(true);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-emerald-100 text-emerald-600 p-1 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors z-10"
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
                <label className="text-sm font-bold text-gray-700">
                  Nível Hierárquico
                </label>
                <select
                  {...register("nivel_hierarquico")}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] outline-none text-sm cursor-pointer"
                >
                  <optgroup label="Entrada e Aprendizagem">
                    <option value="JOVEM_APRENDIZ">Jovem Aprendiz</option>
                    <option value="ESTAGIO">Estágio</option>
                    <option value="TRAINEE">Trainee</option>
                  </optgroup>
                  <optgroup label="Operacional e Suporte">
                    <option value="OPERACIONAL">Operacional / Auxiliar</option>
                    <option value="ASSISTENTE">Assistente</option>
                  </optgroup>
                  <optgroup label="Nível Técnico e Especialista">
                    <option value="JUNIOR">Júnior</option>
                    <option value="PLENO">Pleno</option>
                    <option value="SENIOR">Sênior</option>
                    <option value="ESPECIALISTA">Especialista</option>
                  </optgroup>
                  <optgroup label="Gestão e Liderança">
                    <option value="SUPERVISAO">Supervisão / Coordenação</option>
                    <option value="GERENCIA">Gerência</option>
                    <option value="DIRETORIA">Diretoria</option>
                  </optgroup>
                  <optgroup label="Geral">
                    <option value="NAO_SE_APLICA">Não se aplica</option>
                  </optgroup>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">
                  Tipo de Contrato
                </label>
                <select
                  {...register("tipo_contrato")}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] outline-none text-sm cursor-pointer"
                >
                  <optgroup label="Vínculo Empregatício (CLT)">
                    <option value="EFETIVO">Efetivo</option>
                    <option value="TEMPORARIO">Temporário</option>
                    <option value="INTERMITENTE">Intermitente</option>
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
                {errors.tipo_contrato && (
                  <p className="text-[10px] text-red-500 font-bold uppercase ml-4">
                    {errors.tipo_contrato.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700">
                  Modelo de Trabalho
                </label>
                <select
                  {...register("modelo_trabalho")}
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[20px] outline-none text-sm"
                >
                  <option value="PRESENCIAL">Presencial</option>
                  <option value="HIBRIDO">Híbrido</option>
                  <option value="REMOTO">Remoto</option>
                </select>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100 mt-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 ml-1">
                  Diversidade e Inclusão
                </h3>
                <p className="text-xs text-gray-500 ml-1 mt-1">
                  Como esta vaga se posiciona em relação à contratação de
                  Pessoas com Deficiência (PcD)?
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* OPÇÃO 1: AMPLA CONCORRENCIA */}
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
                    Vaga padrão. Por lei, profissionais PcD também podem
                    concorrer, mas o processo não possui adaptações específicas
                    garantidas.
                  </p>
                </label>

                {/* OPÇÃO 2: VAGA INCLUSIVA */}
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
                    Sinaliza um <b>ambiente adaptado</b>. Mostra para os
                    candidatos que a empresa incentiva ativamente o envio de
                    currículos PcD.
                  </p>
                </label>

                {/* OPÇÃO 3: EXCLUSIVA PCD */}
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
        )}

        {/* STEP 2: DESCRIÇÃO E ENDEREÇO */}
        {step === 2 && (
          <section className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-right-4">
            <h2 className="text-2xl font-black text-gray-800">
              Descrição e Localização
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Cidade"
                {...register("cidade")}
                error={errors.cidade?.message}
              />
              <Input
                label="UF"
                {...register("uf")}
                error={errors.uf?.message}
              />
            </div>

            {/* NOVO BLOCO DE SALÁRIO INTELIGENTE */}
            <div className="space-y-4">
              <label className="text-sm font-bold text-gray-700 ml-1">
                Visibilidade do Salário
              </label>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* OPÇÃO 1: FAIXA */}
                <label
                  className={`cursor-pointer p-4 border-2 rounded-[20px] flex items-center gap-3 transition-all ${tipoSalarioSelecionado === "FAIXA" ? "bg-blue-50 border-blue-500" : "bg-white border-gray-100 hover:border-blue-200"}`}
                >
                  <input
                    type="radio"
                    value="FAIXA"
                    {...register("tipo_salario")}
                    className="hidden"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${tipoSalarioSelecionado === "FAIXA" ? "border-blue-600" : "border-gray-300"}`}
                  >
                    {tipoSalarioSelecionado === "FAIXA" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-in zoom-in" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-bold ${tipoSalarioSelecionado === "FAIXA" ? "text-blue-900" : "text-gray-600"}`}
                  >
                    Faixa Salarial
                  </span>
                </label>

                {/* OPÇÃO 2: A COMBINAR */}
                <label
                  className={`cursor-pointer p-4 border-2 rounded-[20px] flex items-center gap-3 transition-all ${tipoSalarioSelecionado === "COMBINAR" ? "bg-blue-50 border-blue-500" : "bg-white border-gray-100 hover:border-blue-200"}`}
                >
                  <input
                    type="radio"
                    value="COMBINAR"
                    {...register("tipo_salario")}
                    className="hidden"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${tipoSalarioSelecionado === "COMBINAR" ? "border-blue-600" : "border-gray-300"}`}
                  >
                    {tipoSalarioSelecionado === "COMBINAR" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-in zoom-in" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-bold ${tipoSalarioSelecionado === "COMBINAR" ? "text-blue-900" : "text-gray-600"}`}
                  >
                    A Combinar
                  </span>
                </label>

                {/* OPÇÃO 3: OCULTO */}
                <label
                  className={`cursor-pointer p-4 border-2 rounded-[20px] flex items-center gap-3 transition-all ${tipoSalarioSelecionado === "OCULTO" ? "bg-blue-50 border-blue-500" : "bg-white border-gray-100 hover:border-blue-200"}`}
                >
                  <input
                    type="radio"
                    value="OCULTO"
                    {...register("tipo_salario")}
                    className="hidden"
                  />
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${tipoSalarioSelecionado === "OCULTO" ? "border-blue-600" : "border-gray-300"}`}
                  >
                    {tipoSalarioSelecionado === "OCULTO" && (
                      <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-in zoom-in" />
                    )}
                  </div>
                  <span
                    className={`text-sm font-bold ${tipoSalarioSelecionado === "OCULTO" ? "text-blue-900" : "text-gray-600"}`}
                  >
                    Ocultar da Vaga
                  </span>
                </label>
              </div>

              {/* SÓ MOSTRA OS INPUTS SE 'FAIXA' ESTIVER MARCADA */}
              {tipoSalarioSelecionado === "FAIXA" && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-top-4">
                  <Input
                    label="Salário De (R$)"
                    type="number"
                    {...register("salario_de")}
                    error={errors.salario_de?.message}
                  />
                  <Input
                    label="Salário Até (R$)"
                    type="number"
                    {...register("salario_ate")}
                    error={errors.salario_ate?.message}
                  />
                </div>
              )}
            </div>

            {/* ÁREA DE TEXTOS (Placeholders Educativos) */}
            <div className="space-y-6 pt-4">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-2">
                  Descrição Geral da Vaga
                </label>
                <textarea
                  {...register("descricao")}
                  className={`w-full p-6 bg-gray-50 border rounded-[32px] h-32 outline-none text-sm transition-all focus:ring-4 focus:ring-blue-500/5 resize-none
                                        ${errors.descricao ? "border-red-400 focus:border-red-500 bg-red-50/30" : "border-gray-100 focus:border-blue-400"}
                                    `}
                  placeholder="Explique o propósito desta vaga, o impacto dela na empresa e por que um excelente profissional deveria querer fazer parte da sua equipe..."
                />
                {errors.descricao && (
                  <p className="text-[10px] text-red-500 font-bold uppercase ml-4 mt-1">
                    {errors.descricao.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-2">
                  Responsabilidades do Dia a Dia
                </label>
                <textarea
                  {...register("responsabilidades")}
                  className={`w-full p-6 bg-gray-50 border rounded-[32px] h-32 outline-none text-sm transition-all focus:ring-4 focus:ring-blue-500/5 resize-none
                                        ${errors.responsabilidades ? "border-red-400 focus:border-red-500 bg-red-50/30" : "border-gray-100 focus:border-blue-400"}
                                    `}
                  placeholder="Liste as atividades diárias, as ferramentas que a pessoa irá utilizar e quais serão as principais entregas ou metas deste cargo..."
                />
                {errors.responsabilidades && (
                  <p className="text-[10px] text-red-500 font-bold uppercase ml-4 mt-1">
                    {errors.responsabilidades.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-2">
                  Requisitos Obrigatórios
                </label>
                <textarea
                  {...register("requisitos_obrigatorios")}
                  className={`w-full p-6 bg-gray-50 border rounded-[32px] h-32 outline-none text-sm transition-all focus:ring-4 focus:ring-blue-500/5 resize-none
                                        ${errors.requisitos_obrigatorios ? "border-red-400 focus:border-red-500 bg-red-50/30" : "border-gray-100 focus:border-blue-400"}
                                    `}
                  placeholder="Quais experiências, formações acadêmicas ou habilidades técnicas são 100% essenciais e inegociáveis para que o candidato passe na triagem?"
                />
                {errors.requisitos_obrigatorios && (
                  <p className="text-[10px] text-red-500 font-bold uppercase ml-4 mt-1">
                    {errors.requisitos_obrigatorios.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-2">
                  Diferenciais (Opcional mas Recomendado)
                </label>
                <textarea
                  {...register("diferenciais")}
                  className={`w-full p-6 bg-gray-50 border rounded-[32px] h-32 outline-none text-sm transition-all focus:ring-4 focus:ring-blue-500/5 resize-none
                                        ${errors.diferenciais ? "border-red-400 focus:border-red-500 bg-red-50/30" : "border-gray-100 focus:border-blue-400"}
                                    `}
                  placeholder="O que seria considerado um grande 'plus'? Mencione cursos, conhecimentos de nicho ou vivências que não são obrigatórias, mas destacam o candidato."
                />
                {errors.diferenciais && (
                  <p className="text-[10px] text-red-500 font-bold uppercase ml-4 mt-1">
                    {errors.diferenciais.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-4 bg-blue-50 p-6 rounded-[28px] mt-4">
              <HiOutlineEyeOff className="text-blue-600 shrink-0" size={24} />
              <div>
                <p className="text-sm font-bold text-blue-900">
                  Empresa Confidencial?
                </p>
                <p className="text-xs text-blue-700">
                  A vaga será listada sem revelar o nome ou a logo da sua
                  empresa para o público.
                </p>
              </div>
              <input
                type="checkbox"
                {...register("empresa_confidencial")}
                className="ml-auto w-6 h-6 rounded-lg text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </section>
        )}

        {/* STEP 3: BENEFÍCIOS */}
        {step === 3 && (
          <section className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-right-4">
            <h2 className="text-2xl font-black text-gray-800">
              Benefícios Oferecidos
            </h2>
            <p className="text-sm text-gray-500 -mt-6">
              Os benefícios padrão da sua empresa já foram pré-selecionados.
            </p>

            <select
              onChange={(e) => {
                const id = Number(e.target.value);
                if (id && !selectedBeneficios.includes(id)) {
                  setValue("beneficios_ids", [...selectedBeneficios, id]);
                }
                e.target.value = "";
              }}
              className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] outline-none text-sm font-bold text-gray-600"
            >
              <option value="">Adicionar outros benefícios...</option>
              {beneficiosTaxonomia.map((b: any) => (
                <option key={b.id_beneficio} value={b.id_beneficio}>
                  {b.descricao}
                </option>
              ))}
            </select>

            <div className="flex flex-wrap gap-3">
              {selectedBeneficios.map((id) => {
                const ben = beneficiosTaxonomia.find(
                  (b: any) => b.id_beneficio === id,
                ) as any;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-700 rounded-full text-xs font-black border border-blue-100"
                  >
                    {ben?.descricao}
                    <button
                      type="button"
                      onClick={() =>
                        setValue(
                          "beneficios_ids",
                          selectedBeneficios.filter((i) => i !== id),
                        )
                      }
                    >
                      <HiOutlineX size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* STEP 4: ETAPAS DO PROCESSO */}
        {step === 4 && (
          <section className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-6 animate-in slide-in-from-right-4">
            <div>
              <h2 className="text-2xl font-black text-gray-800">
                Funil de Contratação
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                O sistema possui as etapas <b>Inscritos</b> e <b>Aprovados</b>{" "}
                de forma fixa. Adicione as etapas intermediárias (Triagem,
                Entrevista, etc).
              </p>
            </div>

            <div className="space-y-4 pt-4">
              {/* BLOCO FIXO INICIAL */}
              <div className="flex items-center gap-4 p-5 bg-blue-50 rounded-[24px] border border-blue-100 relative opacity-90 cursor-not-allowed">
                <div className="w-8 h-8 rounded-full bg-blue-200 text-blue-700 font-black flex items-center justify-center text-xs shrink-0">
                  1
                </div>
                <div className="flex-1">
                  <p className="text-sm font-black text-blue-900">
                    Inscritos (Etapa Inicial)
                  </p>
                  <p className="text-xs font-medium text-blue-600/80">
                    Todos os novos candidatos caem aqui automaticamente.
                  </p>
                </div>
              </div>

              {/* BLOCOS DINÂMICOS (INTERMEDIÁRIOS) */}
              {etapasFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col md:flex-row items-start md:items-center gap-4 p-5 bg-white rounded-[24px] border border-gray-200 shadow-sm relative group ml-4 border-l-4 border-l-gray-300"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 font-black flex items-center justify-center text-xs shrink-0">
                    {index + 2}
                  </div>

                  <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase px-2">
                        Nome da Etapa Intermediária
                      </label>
                      <input
                        {...register(`etapas.${index}.nome`)}
                        className="w-full bg-gray-50 border border-transparent focus:border-blue-500 px-4 py-2.5 rounded-xl outline-none text-sm font-bold text-gray-700"
                        placeholder="Ex: Entrevista com Gestor"
                      />
                    </div>
                  </div>

                  {/* Opção de Agendamento */}
                  <div className="flex flex-col gap-1 items-center justify-center px-4 border-l border-gray-100">
                    <label className="text-[10px] font-bold text-gray-400 uppercase whitespace-nowrap">
                      Agendamento?
                    </label>
                    <label className="relative inline-flex items-center cursor-pointer mt-1">
                      <input
                        type="checkbox"
                        {...register(`etapas.${index}.requer_agendamento`)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={() => removeEtapa(index)}
                    className="absolute -top-3 -right-3 bg-white text-gray-400 hover:text-white hover:bg-red-500 p-2 rounded-full shadow-md border border-gray-100 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <HiOutlineTrash size={16} />
                  </button>
                </div>
              ))}

              <div className="pl-4">
                <button
                  type="button"
                  onClick={() =>
                    appendEtapa({ nome: "", requer_agendamento: false })
                  }
                  className="w-full py-4 border-2 border-dashed border-gray-200 rounded-[24px] text-gray-500 font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all"
                >
                  <HiOutlinePlus size={18} /> Adicionar Etapa Intermediária
                </button>
              </div>

              {/* BLOCO FIXO FINAL (APROVADOS) */}
              <div className="flex flex-col gap-3 p-5 bg-emerald-50 rounded-[24px] border border-emerald-200 mt-6 relative">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-emerald-200 text-emerald-800 font-black flex items-center justify-center text-xs shrink-0">
                    <HiOutlineCheckCircle size={18} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-black text-emerald-900">
                      Aprovados / Contratados (Etapa Final)
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 bg-emerald-100/50 p-3 rounded-xl ml-12">
                  <HiOutlineInformationCircle
                    className="text-emerald-600 shrink-0 mt-0.5"
                    size={16}
                  />
                  <p className="text-xs font-medium text-emerald-800 leading-relaxed">
                    <b>Atenção:</b> Arrastar um candidato para esta coluna
                    significa que o processo seletivo dele acabou com sucesso. O
                    candidato <b>receberá uma notificação de aprovação</b> e a
                    empresa deverá seguir com os trâmites de contratação
                    externos.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* STEP 5: REVISÃO E ENVIO */}
        {step === 5 && (
          <section className="bg-white p-10 rounded-[48px] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-right-4 text-center">
            <div className="w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 font-black">
              <HiOutlineClipboardList size={32} />
            </div>
            <h2 className="text-3xl font-black text-gray-800">Tudo pronto!</h2>
            <p className="text-gray-500 max-w-md mx-auto">
              Sua vaga está completa com as etapas definidas. Você pode salvar
              como rascunho ou enviar agora para a aprovação da ACI Panambi.
            </p>

            <div className="pt-10 flex flex-col gap-4">
              <ButtonType
                type="button"
                onClick={handleFormSubmit(true)}
                disabled={isLoading}
                className="w-full py-6 rounded-[32px] text-lg shadow-2xl flex items-center justify-center gap-2"
              >
                <HiOutlineUpload size={24} /> Enviar para Aprovação
              </ButtonType>
              <button
                type="button"
                onClick={handleFormSubmit(false)}
                disabled={isLoading}
                className="w-full py-6 rounded-[32px] font-black text-gray-400 hover:text-gray-600 transition-colors flex items-center justify-center gap-2"
              >
                <HiOutlineSave size={24} /> Salvar como Rascunho
              </button>
            </div>
          </section>
        )}

        {/* Navegação */}
        <div className="flex items-center justify-between px-2">
          {step > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="flex items-center gap-2 text-sm font-black text-gray-400 hover:text-blue-600 transition-colors"
            >
              <HiOutlineChevronLeft size={20} /> Voltar
            </button>
          ) : (
            <div />
          )}

          {step < 5 && (
            <ButtonType
              type="button"
              onClick={handleNext}
              className="px-10 py-4 rounded-[20px] shadow-lg flex items-center gap-2"
            >
              Próximo Passo <HiOutlineChevronRight size={20} />
            </ButtonType>
          )}
        </div>
      </form>
    </div>
  );
}
