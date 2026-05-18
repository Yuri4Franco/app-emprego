"use client";

import { useEffect, useState } from "react";
// ✨ IMPORTAMOS O FORMPROVIDER AQUI
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import {
  HiOutlineBriefcase,
  HiOutlineMap,
  HiOutlineGift,
  HiOutlineViewList,
  HiOutlineClipboardList,
  HiOutlineSave,
} from "react-icons/hi";

// Schemas
import { vagaSchema, VagaFormData } from "@/src/schemas/vagaSchemas";
import TabPrincipal from "@/src/components/empresa/vagas/nova/TabPrincipal";
import TabDescricao from "@/src/components/empresa/vagas/nova/TabDescricao";
import TabBeneficios from "@/src/components/empresa/vagas/nova/TabBeneficios";
import TabEtapas from "@/src/components/empresa/vagas/nova/TabEtapas";
import TabRevisao from "@/src/components/empresa/vagas/nova/TabRevisao";

// Os componentes filhos que vamos criar nas próximas etapas
// import TabPrincipal from "./_components/TabPrincipal";
// import TabDescricao from "./_components/TabDescricao";
// import TabBeneficios from "./_components/TabBeneficios";
// import TabEtapas from "./_components/TabEtapas";
// import TabRevisao from "./_components/TabRevisao";

export default function NovaVagaPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<
    "principal" | "descricao" | "beneficios" | "etapas" | "revisao"
  >("principal");
  const ordemAbas: Array<
    "principal" | "descricao" | "beneficios" | "etapas" | "revisao"
  > = ["principal", "descricao", "beneficios", "etapas", "revisao"];

  const [areas, setAreas] = useState([]);
  const [beneficiosTaxonomia, setBeneficiosTaxonomia] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // ✨ INICIALIZAMOS O FORMULÁRIO GERAL (Chamamos de "methods")
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
        { nome: "Entrevistas", requer_agendamento: true },
      ],
    },
  });

  // Desestruturamos as ferramentas que o Pai precisa para a lógica de UI
  const {
    watch,
    trigger,
    getValues,
    setValue,
    formState: { errors, isValid },
  } = methods;
  const valoresAtuais = watch();

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

        const beneficiosPadrao = resPadrao.data.data || resPadrao.data;
        if (Array.isArray(beneficiosPadrao) && beneficiosPadrao.length > 0) {
          const idsPadrao = beneficiosPadrao.map((b: any) =>
            Number(b.id_beneficio),
          );
          setValue("beneficios_ids", idsPadrao);
        }
      } catch (error) {
        toast.error("Erro ao carregar configurações.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [setValue]);

  // Lógica de Progresso
  const checkPrincipal = () =>
    !!(valoresAtuais.titulo?.length > 4 && valoresAtuais.id_area_atuacao > 0);
  const checkDescricao = () =>
    !!(
      (valoresAtuais.descricao || "").length > 15 &&
      (valoresAtuais.responsabilidades || "").length > 10 &&
      (valoresAtuais.requisitos_obrigatorios || "").length > 10 &&
      valoresAtuais.cidade
    );
  const checkEtapas = () =>
    valoresAtuais.etapas?.every((e) => e.nome.length > 1);

  const statusAbas = {
    principal: checkPrincipal(),
    descricao: checkDescricao(),
    beneficios: true,
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

  // Lógica de Navegação
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

    if (direcao === "proximo" && camposParaValidar[activeTab]) {
      await trigger(camposParaValidar[activeTab]);
    }

    if (direcao === "proximo" && currentIndex < ordemAbas.length - 1) {
      setActiveTab(ordemAbas[currentIndex + 1]);
    } else if (direcao === "anterior" && currentIndex > 0) {
      setActiveTab(ordemAbas[currentIndex - 1]);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Submissão de Dados
  const submitData = async (data: VagaFormData, isDraft: boolean) => {
    if (isDraft) setIsSavingDraft(true);
    else setIsPublishing(true);

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
        enviar_para_aprovacao: !isDraft,

        data_encerramento: data.data_encerramento
          ? `${data.data_encerramento}T23:59:59.000Z`
          : null,
        vaga_externa: data.vaga_externa || false,
        link_externo:
          data.vaga_externa && data.link_externo ? data.link_externo : null,
        instrucoes_candidatura:
          data.vaga_externa && data.instrucoes_candidatura
            ? data.instrucoes_candidatura
            : null,
      };

      if (payload.tipo_salario !== "FAIXA") {
        payload.salario_de = null;
        payload.salario_ate = null;
      } else {
        payload.salario_de = payload.salario_de
          ? Number(payload.salario_de)
          : null;
        payload.salario_ate = payload.salario_ate
          ? Number(payload.salario_ate)
          : null;
      }

      if (isDraft) {
        Object.keys(payload).forEach((key) => {
          if (
            payload[key] === "" ||
            payload[key] === "0" ||
            payload[key] === 0
          ) {
            delete payload[key];
          }
        });
      }

      await api.post("/vagas", payload);
      toast.success(
        isDraft
          ? "Rascunho salvo com sucesso!"
          : "Vaga enviada para aprovação!",
      );
      router.push("/empresa/vagas");
    } catch (error: any) {
      console.error("Erro da API:", error.response?.data);
      toast.error(error.response?.data?.error || "Erro ao processar vaga.");
    } finally {
      setIsSavingDraft(false);
      setIsPublishing(false);
    }
  };

  if (isLoading)
    return (
      <div className="p-20 text-center animate-pulse font-bold text-gray-400">
        Preparando ambiente...
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto pb-20 pt-6 md:pt-10 md:px-8 space-y-6 md:space-y-8 px-4 md:px-0 animate-in fade-in duration-700">
      {/* HEADER DA PÁGINA E PROGRESSO */}
      <header className="mb-6 md:mb-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              Criar Nova Vaga
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Preencha os detalhes para encontrar o candidato ideal.
            </p>
          </div>
          <div className="flex w-full md:w-auto">
            <button
              type="button"
              onClick={() => submitData(getValues(), true)}
              disabled={isSavingDraft}
              className="w-full sm:w-auto flex justify-center items-center gap-2.5 px-6 py-3 md:py-4 rounded-[24px] bg-amber-50 text-amber-700 border border-amber-200 text-sm font-bold hover:bg-amber-100 transition-colors shadow-sm"
            >
              <HiOutlineSave size={20} />
              {isSavingDraft ? "Salvando..." : "Salvar Rascunho Seguro"}
            </button>
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
            className={`relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-[20px] text-xs md:text-sm font-bold transition-all overflow-hidden whitespace-nowrap min-w-fit ${activeTab === tab.id ? "bg-blue-50 text-primary shadow-sm border-b-2 border-primary" : tab.hasError ? "text-red-500 hover:bg-red-50 border-b-2 border-transparent" : "text-gray-500 hover:bg-gray-50 border-b-2 border-transparent hover:text-gray-700"}`}
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

      {/* ✨ O PULO DO GATO: AQUI COMEÇA O FORMPROVIDER */}
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit((d) => submitData(d, false))}
          className="space-y-8"
        >
          {/* OS COMPONENTES FILHOS VÃO ENTRAR AQUI */}
          {activeTab === "principal" && <TabPrincipal areas={areas} />}
          {activeTab === "descricao" && <TabDescricao />}
          {activeTab === "beneficios" && (
            <TabBeneficios beneficiosTaxonomia={beneficiosTaxonomia} />
          )}
          {activeTab === "etapas" && <TabEtapas />}
          {activeTab === "revisao" && (
            <TabRevisao isPublishing={isPublishing} />
          )}

          {/* CONTROLES DE NAVEGAÇÃO INFERIORES */}
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
