"use client";

import { useEffect, useState, use } from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
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
  HiOutlineSave,
  HiOutlineUpload,
  HiOutlineX,
  HiOutlineEyeOff,
  HiOutlineSearch,
  HiOutlineViewList,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineInformationCircle,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from "react-icons/hi";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";
import Editor from "@/src/components/Editor";

// --- SCHEMA DE VALIDAÇÃO ---
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
  uf: z.string().length(2, "UF obrigatória").default("RS"),
  beneficios_ids: z.array(z.number()).default([]),
  tipo_diversidade: z.string().default("AMPLA_CONCORRENCIA"),
  etapas: z.array(
    z.object({
      nome: z.string().min(2, "Nome da etapa é obrigatório"),
      requer_agendamento: z.boolean().default(false),
    }),
  ),
});

type VagaFormData = z.infer<typeof vagaSchema>;

const ESTADOS_BRASIL = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
];

export default function EditarVagaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const vagaId = resolvedParams.id;
  const router = useRouter();

  // Controle de Abas
  const [activeTab, setActiveTab] = useState<
    "principal" | "descricao" | "beneficios" | "etapas" | "revisao"
  >("principal");
  const ordemAbas: Array<
    "principal" | "descricao" | "beneficios" | "etapas" | "revisao"
  > = ["principal", "descricao", "beneficios", "etapas", "revisao"];

  // Estados de Dados Auxiliares
  const [areas, setAreas] = useState([]);
  const [searchTermArea, setSearchTermArea] = useState("");
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);
  const [beneficiosTaxonomia, setBeneficiosTaxonomia] = useState([]);

  // Loading & Status
  const [isLoading, setIsLoading] = useState(true);
  const [acaoLoading, setAcaoLoading] = useState<
    "RASCUNHO" | "APROVACAO" | "SALVAR" | null
  >(null);
  const [statusVaga, setStatusVaga] = useState<string>(""); // <-- ARMAZENA O STATUS DA VAGA AQUI

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    control,
    reset,
    trigger,
    formState: { errors, isValid },
  } = useForm<VagaFormData>({
    resolver: zodResolver(vagaSchema) as any,
    mode: "onChange",
    defaultValues: {
      titulo: "",
      id_area_atuacao: 0,
      nivel_hierarquico: "JUNIOR",
      modelo_trabalho: "PRESENCIAL",
      tipo_contrato: "CLT_EFETIVO",
      tipo_salario: "OCULTO",
      empresa_confidencial: false,
      descricao: "",
      responsabilidades: "",
      requisitos_obrigatorios: "",
      diferenciais: "",
      cidade: "Panambi",
      uf: "RS",
      beneficios_ids: [],
      tipo_diversidade: "AMPLA_CONCORRENCIA",
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
  } = useFieldArray({ control, name: "etapas" });

  const valoresAtuais = watch();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resAreas, resBen, resVaga] = await Promise.all([
          api.get("/taxonomia/areas"),
          api.get("/taxonomia/beneficios"),
          api.get(`/vagas/${vagaId}`),
        ]);

        setAreas(resAreas.data);
        setBeneficiosTaxonomia(resBen.data);

        const vaga = resVaga.data.data || resVaga.data;

        // 1. BLOQUEIO DE SEGURANÇA: Vaga Encerrada
        if (vaga.status === "ENCERRADA") {
          toast.error("Vagas encerradas não podem ser editadas.");
          router.push("/empresa/vagas");
          return;
        }

        // 2. GUARDA O STATUS PARA LÓGICA DOS BOTÕES
        setStatusVaga(vaga.status);

        const beneficiosMapeados =
          vaga.beneficios?.map(
            (b: any) => b.id_beneficio || b.beneficio?.id_beneficio,
          ) || [];
        const etapasIntermediarias =
          vaga.etapas
            ?.filter(
              (e: any) => e.nome !== "Inscritos" && e.nome !== "Aprovados",
            )
            .sort((a: any, b: any) => a.ordem - b.ordem) || [];

        if (vaga.area_atuacao) setSearchTermArea(vaga.area_atuacao.nome);

        reset({
          titulo: vaga.titulo,
          id_area_atuacao: vaga.id_area_atuacao,
          nivel_hierarquico: vaga.nivel_hierarquico,
          modelo_trabalho: vaga.modelo_trabalho,
          tipo_contrato: vaga.tipo_contrato,
          tipo_salario: vaga.ocultar_salario
            ? "OCULTO"
            : vaga.salario_a_combinar
              ? "COMBINAR"
              : "FAIXA",
          salario_de: vaga.faixa_salarial_de || "",
          salario_ate: vaga.faixa_salarial_ate || "",
          empresa_confidencial: vaga.empresa_confidencial,
          descricao: vaga.descricao || "",
          responsabilidades: vaga.responsabilidades || "",
          requisitos_obrigatorios: vaga.requisitos_obrigatorios || "",
          diferenciais: vaga.diferenciais || "",
          cidade: vaga.endereco?.cidade || "Panambi",
          uf: vaga.endereco?.uf || "RS",
          tipo_diversidade: vaga.tipo_diversidade || "AMPLA_CONCORRENCIA",
          beneficios_ids: beneficiosMapeados,
          etapas: etapasIntermediarias,
        });
      } catch (error) {
        toast.error("Erro ao carregar os dados da vaga.");
        router.push("/empresa/vagas");
      } finally {
        setIsLoading(false);
      }
    };

    if (vagaId) loadData();
  }, [vagaId, reset, router]);

  // Regra de Negócio: O que a empresa pode fazer com a vaga atual?
  const isRascunhoOuReprovada =
    statusVaga === "RASCUNHO" || statusVaga === "REPROVADA";

  const checkPrincipal = () =>
    !!(valoresAtuais.titulo?.length > 4 && valoresAtuais.id_area_atuacao > 0);
  const checkDescricao = () =>
    !!(
      (valoresAtuais.descricao || "").length > 15 &&
      (valoresAtuais.responsabilidades || "").length > 10 &&
      (valoresAtuais.requisitos_obrigatorios || "").length > 10 &&
      valoresAtuais.cidade
    );
  const checkBeneficios = () => true;
  const checkEtapas = () =>
    valoresAtuais.etapas?.every((e) => e.nome.length > 1);

  const statusAbas = {
    principal: checkPrincipal(),
    descricao: checkDescricao(),
    beneficios: checkBeneficios(),
    etapas: checkEtapas(),
    revisao: isValid,
  };

  const progressoVaga = () => {
    let pts = 0;
    if (statusAbas.principal) pts += 25;
    if (statusAbas.descricao) pts += 25;
    if (statusAbas.etapas) pts += 25;
    if (valoresAtuais.beneficios_ids?.length > 0) pts += 25;
    return pts;
  };

  const getFieldStatus = (fieldName: keyof VagaFormData) => {
    if (errors[fieldName])
      return "border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20";
    const value = watch(fieldName);
    if (value && value !== "" && value !== 0)
      return "border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-emerald-500/20";
    return "border-gray-200 bg-gray-50 focus:border-blue-500";
  };

  const navegarParaAba = async (direcao: "proximo" | "anterior") => {
    const currentIndex = ordemAbas.indexOf(activeTab);
    const camposParaValidar: any = {
      principal: [
        "titulo",
        "id_area_atuacao",
        "nivel_hierarquico",
        "modelo_trabalho",
        "tipo_contrato",
      ],
      descricao: [
        "descricao",
        "responsabilidades",
        "requisitos_obrigatorios",
        "cidade",
        "uf",
      ],
      etapas: ["etapas"],
    };

    if (direcao === "proximo") {
      await trigger(camposParaValidar[activeTab]);
    }

    if (direcao === "proximo" && currentIndex < ordemAbas.length - 1)
      setActiveTab(ordemAbas[currentIndex + 1]);
    else if (direcao === "anterior" && currentIndex > 0)
      setActiveTab(ordemAbas[currentIndex - 1]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // --- SUBMISSÃO DINÂMICA ---
  const submitData = async (
    data: VagaFormData,
    acao: "RASCUNHO" | "APROVACAO" | "SALVAR",
  ) => {
    setAcaoLoading(acao);

    try {
      const etapasCompletas = [
        { nome: "Inscritos", requer_agendamento: false },
        ...data.etapas,
        { nome: "Aprovados", requer_agendamento: false },
      ].map((etapa, idx) => ({ ...etapa, ordem: idx }));

      let payload: any = {
        ...data,
        etapas: etapasCompletas,
        salario_a_combinar: data.tipo_salario === "COMBINAR",
        ocultar_salario: data.tipo_salario === "OCULTO",
        // Se a vaga já for ATIVA, PAUSADA, etc. Não enviamos pra aprovação, pois já está no fluxo.
        // Se for Rascunho/Reprovada, mandamos pra aprovação apenas se a ação for APROVACAO.
        enviar_para_aprovacao: acao === "APROVACAO",
      };

      if (acao === "RASCUNHO") {
        Object.keys(payload).forEach((key) => {
          if (payload[key] === "" || payload[key] === "0" || payload[key] === 0)
            delete payload[key];
        });
      } else {
        payload.salario_de = payload.salario_de
          ? Number(payload.salario_de)
          : null;
        payload.salario_ate = payload.salario_ate
          ? Number(payload.salario_ate)
          : null;
      }

      await api.put(`/vagas/${vagaId}`, payload);

      const mensagens = {
        RASCUNHO: "Rascunho atualizado com sucesso!",
        APROVACAO: "Vaga enviada para aprovação com sucesso!",
        SALVAR: "Alterações salvas com sucesso!",
      };

      toast.success(mensagens[acao]);
      router.push("/empresa/vagas");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao atualizar vaga.");
    } finally {
      setAcaoLoading(null);
    }
  };

  const filteredAreas = areas.filter((a: any) =>
    a.nome.toLowerCase().includes(searchTermArea.toLowerCase()),
  );

  if (isLoading)
    return (
      <div className="p-20 text-center animate-pulse font-bold text-gray-400">
        Preparando ambiente de edição...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto pb-20 pt-6 md:pt-10 md:px-8 space-y-6 md:space-y-8 px-4 md:px-0 animate-in fade-in duration-700">
      <header className="mb-6 md:mb-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              Editar Vaga
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Atualize as informações da sua vaga abaixo.
            </p>
          </div>
          <div className="flex w-full md:w-auto">
            {/* O Botão Superior Muda Conforme o Status */}
            {isRascunhoOuReprovada ? (
              <button
                type="button"
                onClick={() => submitData(getValues(), "RASCUNHO")}
                disabled={acaoLoading !== null}
                className="w-full sm:w-auto flex justify-center items-center gap-2.5 px-6 py-3 md:py-4 rounded-[24px] bg-amber-50 text-amber-700 border border-amber-200 text-sm font-bold hover:bg-amber-100 transition-colors shadow-sm"
              >
                <HiOutlineSave size={20} />
                {acaoLoading === "RASCUNHO"
                  ? "Salvando..."
                  : "Salvar Rascunho Seguro"}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => submitData(getValues(), "SALVAR")}
                disabled={acaoLoading !== null || !isValid}
                className="w-full sm:w-auto flex justify-center items-center gap-2.5 px-6 py-3 md:py-4 rounded-[24px] bg-blue-50 text-blue-700 border border-blue-200 text-sm font-bold hover:bg-blue-100 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <HiOutlineSave size={20} />
                {acaoLoading === "SALVAR" ? "Salvando..." : "Salvar Alterações"}
              </button>
            )}
          </div>
        </div>

        <div className="bg-white p-5 md:p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-gray-700">Qualidade da Vaga</span>
              <span
                className={
                  progressoVaga() >= 100 ? "text-emerald-600" : "text-primary"
                }
              >
                {progressoVaga()}% Preenchida
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${progressoVaga() >= 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                style={{ width: `${progressoVaga()}%` }}
              ></div>
            </div>
          </div>
        </div>
      </header>

      {/* TABS DE NAVEGAÇÃO */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-x-auto hide-scrollbar w-full md:w-fit">
        {[
          {
            id: "principal",
            label: "Principal",
            icon: <HiOutlineBriefcase />,
            isOk: statusAbas.principal,
            hasError: Object.keys(errors).some((k) =>
              [
                "titulo",
                "id_area_atuacao",
                "nivel_hierarquico",
                "modelo_trabalho",
                "tipo_contrato",
              ].includes(k),
            ),
          },
          {
            id: "descricao",
            label: "Detalhes",
            icon: <HiOutlineMap />,
            isOk: statusAbas.descricao,
            hasError: Object.keys(errors).some((k) =>
              [
                "descricao",
                "responsabilidades",
                "requisitos_obrigatorios",
                "cidade",
                "uf",
              ].includes(k),
            ),
          },
          {
            id: "beneficios",
            label: "Benefícios",
            icon: <HiOutlineGift />,
            isOk: statusAbas.beneficios,
            hasError: false,
          },
          {
            id: "etapas",
            label: "Etapas",
            icon: <HiOutlineViewList />,
            isOk: statusAbas.etapas,
            hasError: !!errors.etapas,
          },
          {
            id: "revisao",
            label: "Revisão",
            icon: <HiOutlineClipboardList />,
            isOk: isValid,
            hasError: !isValid,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-[20px] text-xs md:text-sm font-bold transition-all overflow-hidden whitespace-nowrap min-w-fit ${
              activeTab === tab.id
                ? "bg-blue-50 text-primary shadow-sm border-b-2 border-primary"
                : tab.hasError
                  ? "text-red-500 hover:bg-red-50 border-b-2 border-transparent"
                  : "text-gray-500 hover:bg-gray-50 border-b-2 border-transparent hover:text-gray-700"
            }`}
          >
            <span className="flex items-center gap-1.5 md:gap-2 relative z-10">
              {tab.icon} {tab.label}
            </span>
            {tab.isOk && !tab.hasError && (
              <span className="flex h-2 w-2 relative z-10 ml-1">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
            {tab.hasError && (
              <span className="flex h-2 w-2 relative z-10 ml-1">
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
          </button>
        ))}
      </div>

      <form
        onSubmit={handleSubmit((d) =>
          submitData(d, isRascunhoOuReprovada ? "APROVACAO" : "SALVAR"),
        )}
        className="space-y-8"
      >
        {activeTab === "principal" && (
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
                  className={`w-full pl-12 pr-4 py-4 bg-gray-50 border rounded-[20px] outline-none text-sm transition-all focus:ring-4 focus:ring-blue-500/5 ${errors.id_area_atuacao ? "border-red-500 bg-red-50/30" : "border-gray-100 focus:border-blue-500"}`}
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
                  <div className="absolute w-full mt-2 bg-white border border-gray-100 rounded-[24px] shadow-2xl z-50 max-h-60 overflow-y-auto p-2">
                    {filteredAreas.length > 0 ? (
                      filteredAreas.map((a: any) => (
                        <button
                          key={a.id_area || a.id}
                          type="button"
                          onClick={() => {
                            setValue(
                              "id_area_atuacao",
                              Number(a.id_area || a.id),
                            );
                            setSearchTermArea(a.nome);
                            setIsAreaDropdownOpen(false);
                            trigger("id_area_atuacao");
                          }}
                          className="w-full text-left px-4 py-3 hover:bg-blue-50 rounded-[16px] text-sm font-medium text-gray-600 hover:text-blue-700"
                        >
                          {a.nome}
                        </button>
                      ))
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
                  <option value="ESTAGIO">Estágio</option>
                  <option value="JUNIOR">Júnior</option>
                  <option value="PLENO">Pleno</option>
                  <option value="SENIOR">Sênior</option>
                  <option value="GERENCIA">Gerência</option>
                  <option value="DIRETORIA">Diretoria</option>
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
            </div>

            <div className="space-y-4 pt-6 border-t border-gray-100 mt-6">
              <div>
                <h3 className="text-sm font-bold text-gray-800 ml-1">
                  Diversidade e Inclusão
                </h3>
                <p className="text-xs text-gray-500 ml-1 mt-1">
                  Como esta vaga se posiciona em relação à contratação de PcD?
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
                    Vaga padrão. Por lei, profissionais PcD também podem
                    concorrer, mas não há adaptações específicas garantidas.
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
                    Sinaliza um <b>ambiente adaptado</b>. Mostra para os
                    candidatos que a empresa incentiva ativamente currículos
                    PcD.
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
        )}

        {/* ABA 2: DETALHES */}
        {activeTab === "descricao" && (
          <section className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
            <h2 className="text-xl md:text-2xl font-black text-gray-800">
              Localização e Descrição
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Cidade"
                className={getFieldStatus("cidade")}
                {...register("cidade")}
                error={errors.cidade?.message}
              />
              <div className="flex flex-col space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-2">
                  UF
                </label>
                <select
                  {...register("uf")}
                  className={`w-full h-[52px] px-4 rounded-[20px] outline-none text-sm transition-all border ${getFieldStatus("uf")}`}
                >
                  {ESTADOS_BRASIL.map((uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-5 md:p-6 bg-gray-50 rounded-[24px] border border-gray-100 space-y-4">
              <label className="text-sm font-bold text-gray-800 ml-1">
                Visibilidade do Salário
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {[
                  { id: "FAIXA", label: "Faixa Salarial" },
                  { id: "COMBINAR", label: "A Combinar" },
                  { id: "OCULTO", label: "Ocultar" },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`cursor-pointer p-4 border-2 rounded-[20px] flex items-center gap-3 transition-all ${watch("tipo_salario") === opt.id ? "bg-white border-blue-500 shadow-sm" : "bg-white border-transparent hover:border-blue-200"}`}
                  >
                    <input
                      type="radio"
                      value={opt.id}
                      {...register("tipo_salario")}
                      className="hidden"
                    />
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${watch("tipo_salario") === opt.id ? "border-blue-600" : "border-gray-300"}`}
                    >
                      {watch("tipo_salario") === opt.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <span
                      className={`text-sm font-bold ${watch("tipo_salario") === opt.id ? "text-blue-900" : "text-gray-600"}`}
                    >
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
              {watch("tipo_salario") === "FAIXA" && (
                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in">
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

            <div className="space-y-8">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-2">
                  Descrição Geral da Vaga
                </label>
                <Controller
                  name="descricao"
                  control={control}
                  render={({ field }) => (
                    <div
                      className={
                        errors.descricao
                          ? "ring-2 ring-red-400 rounded-[32px]"
                          : ""
                      }
                    >
                      <Editor
                        content={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
                {errors.descricao && (
                  <p className="text-[10px] text-red-500 font-bold uppercase ml-4">
                    {errors.descricao.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-2">
                  Responsabilidades do Dia a Dia
                </label>
                <Controller
                  name="responsabilidades"
                  control={control}
                  render={({ field }) => (
                    <div
                      className={
                        errors.responsabilidades
                          ? "ring-2 ring-red-400 rounded-[32px]"
                          : ""
                      }
                    >
                      <Editor
                        content={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
                {errors.responsabilidades && (
                  <p className="text-[10px] text-red-500 font-bold uppercase ml-4">
                    {errors.responsabilidades.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-2">
                  Requisitos Obrigatórios
                </label>
                <Controller
                  name="requisitos_obrigatorios"
                  control={control}
                  render={({ field }) => (
                    <div
                      className={
                        errors.requisitos_obrigatorios
                          ? "ring-2 ring-red-400 rounded-[32px]"
                          : ""
                      }
                    >
                      <Editor
                        content={field.value || ""}
                        onChange={field.onChange}
                      />
                    </div>
                  )}
                />
                {errors.requisitos_obrigatorios && (
                  <p className="text-[10px] text-red-500 font-bold uppercase ml-4">
                    {errors.requisitos_obrigatorios.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-gray-700 ml-2">
                  Diferenciais (Opcional)
                </label>
                <textarea
                  {...register("diferenciais")}
                  className="w-full p-6 bg-gray-50 border border-gray-100 focus:border-blue-400 rounded-[32px] h-32 outline-none text-sm transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-5 rounded-[24px]">
              <HiOutlineEyeOff className="text-gray-500 shrink-0" size={24} />
              <div>
                <p className="text-sm font-bold text-gray-800">
                  Empresa Confidencial?
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  A vaga ocultará o nome da sua empresa.
                </p>
              </div>
              <input
                type="checkbox"
                {...register("empresa_confidencial")}
                className="ml-auto w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
            </div>
          </section>
        )}

        {/* ABA 3: BENEFÍCIOS */}
        {activeTab === "beneficios" && (
          <section className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-gray-100 shadow-sm space-y-6 animate-in slide-in-from-bottom-4">
            <h2 className="text-xl md:text-2xl font-black text-gray-800">
              Benefícios Oferecidos
            </h2>
            <select
              onChange={(e) => {
                const id = Number(e.target.value);
                if (id && !valoresAtuais.beneficios_ids?.includes(id)) {
                  setValue("beneficios_ids", [
                    ...(valoresAtuais.beneficios_ids || []),
                    id,
                  ]);
                }
                e.target.value = "";
              }}
              className="w-full p-5 bg-gray-50 border border-gray-100 rounded-[24px] outline-none text-sm font-bold text-gray-600 cursor-pointer hover:border-blue-200 transition-colors"
            >
              <option value="">+ Adicionar um benefício...</option>
              {beneficiosTaxonomia.map((b: any) => (
                <option key={b.id_beneficio} value={b.id_beneficio}>
                  {b.descricao}
                </option>
              ))}
            </select>
            <div className="flex flex-wrap gap-2 pt-2">
              {(valoresAtuais.beneficios_ids || []).map((id) => {
                const ben = beneficiosTaxonomia.find(
                  (b: any) => b.id_beneficio === id,
                ) as any;
                return (
                  <div
                    key={id}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-800 rounded-full text-xs font-bold border border-emerald-100 animate-in zoom-in"
                  >
                    {ben?.descricao}
                    <button
                      type="button"
                      onClick={() =>
                        setValue(
                          "beneficios_ids",
                          valoresAtuais.beneficios_ids.filter((i) => i !== id),
                        )
                      }
                      className="hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
                    >
                      <HiOutlineX size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ABA 4: ETAPAS */}
        {activeTab === "etapas" && (
          <section className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-gray-100 shadow-sm space-y-6 animate-in slide-in-from-bottom-4">
            <h2 className="text-xl md:text-2xl font-black text-gray-800">
              Funil de Contratação
            </h2>
            <div className="space-y-4 pt-4 relative before:absolute before:inset-y-0 before:left-[35px] before:w-0.5 before:bg-gray-100">
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-[24px] relative z-10 border border-gray-200 opacity-70">
                <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-600 font-black flex items-center justify-center shrink-0">
                  1
                </div>
                <div>
                  <p className="text-sm font-black text-gray-700">
                    Inscritos (Padrão)
                  </p>
                  <p className="text-xs text-gray-500">
                    Todos os candidatos entram aqui.
                  </p>
                </div>
              </div>

              {etapasFields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col sm:flex-row sm:items-center gap-4 p-5 bg-white rounded-[24px] border border-blue-100 shadow-sm relative z-10 group hover:border-blue-300 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 font-black flex items-center justify-center shrink-0">
                    {index + 2}
                  </div>
                  <div className="flex-1 w-full">
                    <input
                      {...register(`etapas.${index}.nome`)}
                      className="w-full bg-transparent border-b border-gray-200 focus:border-blue-500 py-2 outline-none text-sm font-bold text-gray-800 placeholder-gray-300"
                      placeholder="Nome da etapa (Ex: Entrevista Técnica)"
                    />
                    {errors?.etapas?.[index]?.nome && (
                      <p className="text-[10px] text-red-500 mt-1">
                        {errors.etapas[index]?.nome?.message}
                      </p>
                    )}
                  </div>
                  <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-3 py-2 rounded-xl">
                    <input
                      type="checkbox"
                      {...register(`etapas.${index}.requer_agendamento`)}
                      className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-[10px] font-bold text-gray-600 uppercase">
                      Agendamento
                    </span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeEtapa(index)}
                    className="p-2 text-gray-400 hover:text-red-500 bg-gray-50 rounded-full hover:bg-red-50 transition-colors"
                  >
                    <HiOutlineTrash size={18} />
                  </button>
                </div>
              ))}

              <div className="pl-16 relative z-10 pt-2">
                <button
                  type="button"
                  onClick={() =>
                    appendEtapa({ nome: "", requer_agendamento: false })
                  }
                  className="py-3 px-6 bg-white border-2 border-dashed border-gray-200 rounded-full text-gray-500 font-bold text-xs flex items-center gap-2 hover:border-blue-400 hover:text-blue-600 transition-all shadow-sm"
                >
                  <HiOutlinePlus size={16} /> Adicionar Etapa
                </button>
              </div>

              <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-[24px] relative z-10 border border-emerald-100">
                <div className="w-10 h-10 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center shrink-0">
                  <HiOutlineCheckCircle size={20} />
                </div>
                <div>
                  <p className="text-sm font-black text-emerald-900">
                    Aprovados (Final)
                  </p>
                  <p className="text-xs text-emerald-700">
                    Mover para cá aprova o candidato.
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ABA 5: REVISÃO */}
        {activeTab === "revisao" && (
          <section className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
            <div className="text-center space-y-2">
              <div
                className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 shadow-sm border-4 border-white ${isValid ? "bg-emerald-100 text-emerald-500" : "bg-red-100 text-red-500"}`}
              >
                {isValid ? (
                  <HiOutlineClipboardList size={36} />
                ) : (
                  <HiOutlineExclamationCircle size={36} />
                )}
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-800">
                {isValid ? "Tudo pronto!" : "Faltam algumas informações"}
              </h2>
              <p className="text-sm text-gray-500 max-w-md mx-auto">
                {isValid
                  ? isRascunhoOuReprovada
                    ? "Revise os detalhes da vaga abaixo e envie para aprovação."
                    : "Revise as alterações feitas na vaga. Como ela já passou por aprovação, você está apenas atualizando os dados."
                  : "Notamos que alguns campos obrigatórios não foram preenchidos nas abas anteriores. Volte e corrija para poder salvar."}
              </p>
            </div>

            {/* Painel de Resumo */}
            <div className="bg-gray-50 rounded-[24px] p-6 border border-gray-200 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Título da Vaga
                  </p>
                  <p
                    className={`font-bold ${valoresAtuais.titulo ? "text-gray-800" : "text-red-500"}`}
                  >
                    {valoresAtuais.titulo || "Não preenchido"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Localização
                  </p>
                  <p
                    className={`font-bold ${valoresAtuais.cidade ? "text-gray-800" : "text-red-500"}`}
                  >
                    {valoresAtuais.cidade
                      ? `${valoresAtuais.cidade} - ${valoresAtuais.uf}`
                      : "Não preenchido"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Modelo / Contrato
                  </p>
                  <p className="font-bold text-gray-800">
                    {valoresAtuais.modelo_trabalho} •{" "}
                    {valoresAtuais.tipo_contrato}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Área / Nível
                  </p>
                  <p className="font-bold text-gray-800">
                    {valoresAtuais.id_area_atuacao > 0 ? (
                      "Área Selecionada"
                    ) : (
                      <span className="text-red-500">Pendente</span>
                    )}{" "}
                    • {valoresAtuais.nivel_hierarquico}
                  </p>
                </div>
              </div>
              <hr className="border-gray-200" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Descrição & Textos
                  </p>
                  <p
                    className={`text-sm font-bold ${checkDescricao() ? "text-emerald-600" : "text-red-500"}`}
                  >
                    {checkDescricao()
                      ? "Preenchidos corretamente"
                      : "Pendentes (Revisar)"}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Etapas de Seleção
                  </p>
                  <p
                    className={`text-sm font-bold ${checkEtapas() ? "text-blue-600" : "text-red-500"}`}
                  >
                    {checkEtapas()
                      ? `${valoresAtuais.etapas?.length} Etapas Intermediárias`
                      : "Nomes de etapas em branco"}
                  </p>
                </div>
              </div>
            </div>

            <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
              {/* O Botão Final também muda conforme o status */}
              {isRascunhoOuReprovada ? (
                <ButtonType
                  type="submit"
                  disabled={acaoLoading !== null || !isValid}
                  className="w-full sm:w-auto px-10 py-5 rounded-full text-base shadow-xl flex items-center justify-center gap-2"
                >
                  <HiOutlineUpload size={20} />{" "}
                  {acaoLoading === "APROVACAO"
                    ? "Enviando..."
                    : "Enviar para Aprovação"}
                </ButtonType>
              ) : (
                <ButtonType
                  type="submit"
                  disabled={acaoLoading !== null || !isValid}
                  className="w-full sm:w-auto px-10 py-5 rounded-full text-base shadow-xl flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <HiOutlineSave size={20} />{" "}
                  {acaoLoading === "SALVAR"
                    ? "Salvando..."
                    : "Salvar Alterações"}
                </ButtonType>
              )}
            </div>
          </section>
        )}

        {/* CONTROLES DE WIZARD INFERIORES */}
        <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-8 mt-8 gap-4 border-t border-gray-100">
          <div>
            {ordemAbas.indexOf(activeTab) > 0 ? (
              <button
                type="button"
                onClick={() => navegarParaAba("anterior")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-gray-500 font-bold hover:bg-gray-100 transition-colors"
              >
                <span className="text-xl leading-none">&larr;</span> Voltar
              </button>
            ) : (
              <div className="hidden sm:block" />
            )}
          </div>
          <div>
            {ordemAbas.indexOf(activeTab) < ordemAbas.length - 1 && (
              <button
                type="button"
                onClick={() => navegarParaAba("proximo")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-blue-50 text-primary font-bold hover:bg-blue-100 transition-colors group"
              >
                Próxima Aba{" "}
                <span className="text-xl leading-none group-hover:translate-x-1 transition-transform">
                  &rarr;
                </span>
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
