"use client";

import { useEffect, useState, use } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  HiOutlineBriefcase,
  HiOutlineMap,
  HiOutlineGift,
  HiOutlineClipboardList,
  HiOutlineSave,
  HiOutlineViewList,
} from "react-icons/hi";

// Importações dos Componentes e Schemas
import { vagaSchema, VagaFormData } from "@/src/schemas/vagaSchemas";
import TabPrincipal from "@/src/components/empresa/vagas/nova/TabPrincipal";
import TabDescricao from "@/src/components/empresa/vagas/nova/TabDescricao";
import TabBeneficios from "@/src/components/empresa/vagas/nova/TabBeneficios";
import TabEtapas from "@/src/components/empresa/vagas/nova/TabEtapas";
import TabRevisao from "@/src/components/empresa/vagas/nova/TabRevisao";

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
  const [beneficiosTaxonomia, setBeneficiosTaxonomia] = useState([]);

  // Loading & Status
  const [isLoading, setIsLoading] = useState(true);
  const [acaoLoading, setAcaoLoading] = useState<
    "RASCUNHO" | "APROVACAO" | "SALVAR" | null
  >(null);
  const [statusVaga, setStatusVaga] = useState<string>("");

  const methods = useForm<VagaFormData>({
    resolver: zodResolver(vagaSchema) as any,
    mode: "onChange",
    defaultValues: {
      titulo: "",
      id_area_atuacao: 0,
      nivel_hierarquico: "NAO_SE_APLICA",
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
    handleSubmit,
    watch,
    getValues,
    reset,
    trigger,
    formState: { errors, isValid },
  } = methods;

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



        const etapasIntermediarias = (vaga.etapas || [])
          .filter((e: any) => e.nome !== "Inscritos" && e.nome !== "Aprovados")
          .sort((a: any, b: any) => a.ordem - b.ordem)
          .map((e: any) => ({
            nome: e.nome,
            requer_agendamento: Boolean(e.requer_agendamento)
          }));


        const dataEncerramentoFormatada = vaga.data_encerramento
          ? vaga.data_encerramento.split("T")[0]
          : "";

        reset({
          titulo: vaga.titulo,
          id_area_atuacao: vaga.id_area_atuacao,
          nivel_hierarquico: vaga.nivel_hierarquico,
          modelo_trabalho: vaga.modelo_trabalho,
          tipo_contrato: vaga.tipo_contrato,
          data_encerramento: dataEncerramentoFormatada,
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
    if (valoresAtuais.beneficios_ids) pts += 25;
    return pts;
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
        "cidade",
        "uf",
      ],
      etapas: ["etapas"],
    };

    if (direcao === "proximo" && camposParaValidar[activeTab]) {
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
            className={`relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-[20px] text-xs md:text-sm font-bold transition-all overflow-hidden whitespace-nowrap min-w-fit ${activeTab === tab.id
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

      {/* AQUI A MÁGICA ACONTECE: O FormProvider envolve os componentes reutilizáveis */}
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit((d) =>
            submitData(d, isRascunhoOuReprovada ? "APROVACAO" : "SALVAR"),
          )}
          className="space-y-8"
        >
          {activeTab === "principal" && <TabPrincipal areas={areas} />}
          {activeTab === "descricao" && <TabDescricao />}
          {activeTab === "beneficios" && (
            <TabBeneficios beneficiosTaxonomia={beneficiosTaxonomia} />
          )}
          {activeTab === "etapas" && <TabEtapas />}
          {activeTab === "revisao" && (
            <TabRevisao isPublishing={acaoLoading !== null} />
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
      </FormProvider>
    </div>
  );
}
