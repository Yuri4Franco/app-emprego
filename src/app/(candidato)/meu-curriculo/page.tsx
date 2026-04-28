"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
  HiOutlineUser,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineLightningBolt,
  HiOutlineSave,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineSearch,
  HiOutlineX,
  HiOutlineCamera,
  HiOutlineEye,
} from "react-icons/hi";
import { Input } from "@/src/components/Input";
import { ButtonType } from "@/src/components/ButtonType";
import Link from "next/link";

export const maskCPF = (value: string | undefined | null) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

const descricoesTurno: Record<string, string> = {
  QUALQUER_TURNO: "Disponível para trabalhar em qualquer turno.",
  HORARIO_COMERCIAL:
    "Trabalho durante o horário comercial padrão (Manhã e Tarde).",
  PRIMEIRO_TURNO: "Trabalho no 1º turno (geralmente manhã/início da tarde).",
  SEGUNDO_TURNO: "Trabalho no 2º turno (geralmente tarde/noite).",
  TERCEIRO_TURNO: "Trabalho no 3º turno (geralmente madrugada).",
};

export const maskCEP = (value: string | undefined | null) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1");
};

export const maskTelefone = (value: string | undefined | null) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4,5})(\d{4})/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

// 1. Schema dos Dados Gerais
const dadosGeraisSchema = z.object({
  cpf: z.string().length(14, "CPF deve ter 11 dígitos").optional().nullable(),
  data_nascimento: z.string().optional().nullable(),
  genero: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),

  link_linkedin: z
    .string()
    .url("URL inválida")
    .optional()
    .or(z.literal(""))
    .nullable(),
  link_portfolio: z
    .string()
    .url("URL inválida")
    .optional()
    .or(z.literal(""))
    .nullable(),
  link_outro: z
    .string()
    .url("URL inválida")
    .optional()
    .or(z.literal(""))
    .nullable(),

  objetivo_profissional: z.string().max(200).optional().nullable(),
  resumo_profissional: z
    .string()
    .min(20, "Fale um pouco mais sobre você")
    .optional()
    .nullable(),
  pretensao_salarial: z.coerce.number().optional().nullable(),
  sem_pretensao: z.boolean().default(false),

  pcd: z.boolean().default(false),
  tipo_pcd: z.string().optional().nullable(),
  necessidade: z.string().max(300, "Texto muito longo").optional().nullable(),
  disponibilidade_viagem: z.boolean().default(false),
  disponibilidade_mudanca: z.boolean().default(false),
  cnh: z
    .array(z.enum(["NAO_POSSUO", "A", "B", "C", "D", "E"]))
    .optional()
    .default(["NAO_POSSUO"]),
  turno_preferido: z
    .array(
      z.enum([
        "PRIMEIRO_TURNO",
        "SEGUNDO_TURNO",
        "TERCEIRO_TURNO",
        "HORARIO_COMERCIAL",
        "QUALQUER_TURNO",
      ]),
    )
    .max(3, "Você pode selecionar no máximo 3 turnos")
    .optional()
    .default([]),
  tipo_contato: z
    .enum(["WHATSAPP", "EMAIL", "LIGACAO", "QUALQUER_UM"])
    .optional()
    .nullable(),
  primeiro_emprego: z.boolean().default(false),

  cep: z.string().min(8, "CEP obrigatório").optional().nullable(),
  logradouro: z.string().min(3, "Rua obrigatória").optional().nullable(),
  numero: z.string().min(1, "Nº obrigatório").optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().min(2, "Bairro obrigatório"),
  cidade: z.string().min(2, "Cidade obrigatória").default("Panambi"),
  uf: z.string().length(2, "UF obrigatória").default("RS"),
});

type DadosGeraisData = z.infer<typeof dadosGeraisSchema>;

const descricoesCnh: Record<string, string> = {
  NAO_POSSUO: "Não possuo carteira de habilitação no momento.",
  A: "Moto (Veículos motorizados de 2 ou 3 rodas).",
  B: "Carro (Veículos de passeio). Exame toxicológico obrigatório.",
  C: "Caminhão (Veículos de carga acima de 3,5 ton). Exame toxicológico obrigatório.",
  D: "Ônibus/Vans (Transporte de passageiros). Exame toxicológico obrigatório.",
  E: "Carretas (Veículos articulados). Exame toxicológico obrigatório.",
};

// 2. Schema de Experiência
const experienciaSchema = z
  .object({
    empresa: z.string().min(2, "Nome da empresa é obrigatório"),
    cargo: z.string().min(2, "Cargo é obrigatório"),
    atividades: z
      .string()
      .max(1000, "Resumo muito longo")
      .optional()
      .nullable(),
    data_inicio: z.string().min(6, "Mês/Ano de início obrigatório"),
    data_fim: z.string().optional().nullable(),
    atual: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (!data.atual && !data.data_fim) return false;
      return true;
    },
    {
      message: "Data de fim é obrigatória se não for o emprego atual",
      path: ["data_fim"],
    },
  );

type ExperienciaData = z.infer<typeof experienciaSchema>;

// Schema de Formação
const formacaoSchema = z
  .object({
    instituicao: z.string().min(2, "Nome da instituição é obrigatório"),
    nivel: z.string().min(2, "Selecione o nível de escolaridade"),
    curso: z.string().min(2, "Nome do curso é obrigatório"),
    status: z.string().min(2, "Selecione o status do curso"),
    data_conclusao: z.string().optional().nullable(),
  })
  .refine(
    (data) => {
      if (
        data.status.toUpperCase() === "CONCLUÍDO" &&
        (!data.data_conclusao || data.data_conclusao === "")
      ) {
        return false;
      }
      return true;
    },
    {
      message: "A data de conclusão é obrigatória para cursos concluídos.",
      path: ["data_conclusao"],
    },
  );

type FormacaoData = z.infer<typeof formacaoSchema>;

export default function MeuCurriculoPage() {
  const [isVisivel, setIsVisivel] = useState(true);
  const [activeTab, setActiveTab] = useState("dados");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [fotoUrl, setFotoUrl] = useState<string | null>(null);
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);

  const [nomeCandidato, setNomeCandidato] = useState<string>("");

  const [experiencias, setExperiencias] = useState<any[]>([]);
  const [showExpForm, setShowExpForm] = useState(false);
  const [editingExpId, setEditingExpId] = useState<number | null>(null);
  const [isSavingExp, setIsSavingExp] = useState(false);

  const [formacoes, setFormacoes] = useState<any[]>([]);
  const [showFormFormacao, setShowFormFormacao] = useState(false);
  const [editingFormId, setEditingFormId] = useState<number | null>(null);
  const [isSavingForm, setIsSavingForm] = useState(false);

  const [searchTermComp, setSearchTermComp] = useState("");
  const [isCompDropdownOpen, setIsCompDropdownOpen] = useState(false);
  const [compSelecionada, setCompSelecionada] = useState<any | null>(null);

  const [competencias, setCompetencias] = useState<any[]>([]);
  const [listaTaxonomiaCompetencias, setListaTaxonomiaCompetencias] = useState<
    any[]
  >([]);

  const [listaTaxonomiaAreas, setListaTaxonomiaAreas] = useState<any[]>([]);
  const [areasSelecionadas, setAreasSelecionadas] = useState<any[]>([]);
  const [searchTermArea, setSearchTermArea] = useState("");
  const [isAreaDropdownOpen, setIsAreaDropdownOpen] = useState(false);

  const ordemAbas: Array<
    "dados" | "experiencia" | "formacao" | "competencias"
  > = ["dados", "experiencia", "formacao", "competencias"];

  const navegarParaAba = (direcao: "proximo" | "anterior") => {
    const currentIndex = ordemAbas.indexOf(activeTab as any);

    if (direcao === "proximo" && currentIndex < ordemAbas.length - 1) {
      setActiveTab(ordemAbas[currentIndex + 1]);
    } else if (direcao === "anterior" && currentIndex > 0) {
      setActiveTab(ordemAbas[currentIndex - 1]);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleToggleVisibilidade = async () => {
    const novoStatus = !isVisivel;
    setIsVisivel(novoStatus);

    try {
      await api.patch("/candidato/visibilidade", {
        perfil_visivel_empresas: novoStatus,
      });
      toast.success(
        novoStatus
          ? "Seu perfil agora está visível no Banco de Talentos!"
          : "Seu perfil foi ocultado para as empresas.",
      );
    } catch (error: any) {
      setIsVisivel(!novoStatus);
      toast.error(
        error.response?.data?.error || "Erro ao alterar visibilidade.",
      );
    }
  };

  const filteredCompetencias = listaTaxonomiaCompetencias.filter((tax) => {
    const jaAdicionou = competencias.some(
      (c) => c.id_competencia === tax.id_competencia,
    );
    const bateComBusca = tax.nome
      .toLowerCase()
      .includes(searchTermComp.toLowerCase());
    return !jaAdicionou && bateComBusca;
  });

  const {
    register: registerExp,
    handleSubmit: handleSubmitExp,
    reset: resetExp,
    watch: watchExp,
    setValue: setValueExp,
    formState: { errors: errorsExp },
  } = useForm<ExperienciaData>({
    resolver: zodResolver(experienciaSchema) as any,
    defaultValues: {
      empresa: "",
      cargo: "",
      atividades: "",
      data_inicio: "",
      data_fim: "",
      atual: false,
    },
  });

  const {
    register: registerForm,
    handleSubmit: handleSubmitForm,
    reset: resetForm,
    watch: watchForm,
    formState: { errors: errorsForm },
  } = useForm<FormacaoData>({
    resolver: zodResolver(formacaoSchema) as any,
    defaultValues: {
      instituicao: "",
      nivel: "",
      curso: "",
      status: "",
      data_conclusao: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<DadosGeraisData>({
    resolver: zodResolver(dadosGeraisSchema) as any,
    defaultValues: {
      cpf: "",
      data_nascimento: "",
      genero: "",
      telefone: "",
      whatsapp: "",
      link_linkedin: "",
      link_portfolio: "",
      link_outro: "",
      objetivo_profissional: "",
      tipo_contato: "WHATSAPP",
      resumo_profissional: "",
      pretensao_salarial: 0,
      sem_pretensao: false,
      pcd: false,
      tipo_pcd: "",
      necessidade: "",
      turno_preferido: ["QUALQUER_TURNO"],
      cnh: ["NAO_POSSUO"],
      primeiro_emprego: false,
      disponibilidade_viagem: false,
      disponibilidade_mudanca: false,
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "Panambi",
      uf: "RS",
    },
  });

  const isDadosBasicosOk = () => {
    const vals = getValues();
    const hasAreas = areasSelecionadas.length > 0;
    const hasEssenciais = !!(
      vals.cpf &&
      vals.data_nascimento &&
      vals.objetivo_profissional &&
      vals.bairro &&
      vals.cidade
    );
    return hasEssenciais && hasAreas;
  };

  const isExperienciaOk = () =>
    experiencias.length > 0 || watch("primeiro_emprego");
  const isFormacaoOk = () => formacoes.length > 0;
  const isCompetenciasOk = () => competencias.length > 0;

  const statusAbas = {
    dados: isDadosBasicosOk(),
    experiencia: isExperienciaOk(),
    formacao: isFormacaoOk(),
    competencias: isCompetenciasOk(),
  };

  const calcularProgresso = () => {
    let preenchidos = 0;
    if (statusAbas.dados) preenchidos++;
    if (statusAbas.experiencia) preenchidos++;
    if (statusAbas.formacao) preenchidos++;
    if (statusAbas.competencias) preenchidos++;
    return (preenchidos / 4) * 100;
  };

  const progressoCurriculo = calcularProgresso();

  const getFieldStatus = (fieldName: keyof DadosGeraisData) => {
    if (errors[fieldName])
      return "border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20";
    const value = watch(fieldName);
    if (value && value !== "" && value !== 0)
      return "border-emerald-400 bg-emerald-50/20 focus:border-emerald-500 focus:ring-emerald-500/20";
    return "border-gray-200 bg-gray-50 focus:border-blue-500";
  };

  useEffect(() => {
    const carregarCurriculo = async () => {
      try {
        const [resCurriculo, resTaxonomia, resAreas] = await Promise.all([
          api.get("/candidato/meu-curriculo"),
          api.get("/taxonomia/competencias"),
          api.get("/taxonomia/areas"),
        ]);

        const areasData = resAreas.data?.data || resAreas.data || [];
        setListaTaxonomiaAreas(Array.isArray(areasData) ? areasData : []);

        const compData =
          resTaxonomia.data.data ||
          resTaxonomia.data.competencias ||
          resTaxonomia.data;

        if (Array.isArray(compData)) {
          setListaTaxonomiaCompetencias(compData);
        } else {
          setListaTaxonomiaCompetencias([]);
        }

        const dados = resCurriculo.data.data;

        if (dados) {
          const areasSalvas = (
            dados.areas_atuacao ||
            dados.candidatoAreaAtuacao ||
            []
          ).map((item: any) => ({
            id_area: item.id_area || item.area?.id_area,
            nome: item.area?.nome || "Área",
          }));
          setAreasSelecionadas(areasSalvas);

          setFotoUrl(dados.foto_url || null);
          setNomeCandidato(dados.usuario?.nome || dados.nome || "Meu Perfil");

          reset({
            cpf: maskCPF(dados.cpf) || "",
            data_nascimento: dados.data_nascimento
              ? dados.data_nascimento.split("T")[0]
              : "",
            genero: dados.genero || "",
            telefone: maskTelefone(dados.telefone) || "",
            whatsapp: maskTelefone(dados.whatsapp) || "",
            link_linkedin: dados.link_linkedin || "",
            link_portfolio: dados.link_portfolio || "",
            link_outro: dados.link_outro || "",
            objetivo_profissional: dados.objetivo_profissional || "",
            resumo_profissional: dados.resumo_profissional || "",
            pretensao_salarial: dados.pretensao_salarial || "",
            tipo_contato: dados.tipo_contato || "WHATSAPP",
            sem_pretensao: !dados.pretensao_salarial,
            pcd: dados.pcd || false,
            tipo_pcd: dados.tipo_pcd || "",
            necessidade: dados.necessidade || "",
            disponibilidade_viagem: dados.disponibilidade_viagem || false,
            disponibilidade_mudanca: dados.disponibilidade_mudanca || false,
            turno_preferido: dados.turno_preferido || [],
            cnh: dados.cnh || [],
            primeiro_emprego: dados.primeiro_emprego || false,
            cep: maskCEP(dados.endereco?.cep) || "",
            logradouro: dados.endereco?.logradouro || "",
            numero: dados.endereco?.numero || "",
            complemento: dados.endereco?.complemento || "",
            bairro: dados.endereco?.bairro || "",
            cidade: dados.endereco?.cidade || "Panambi",
            uf: dados.endereco?.uf || "RS",
          });
        }

        setIsVisivel(dados.perfil_visivel_empresas ?? true);
        setCompetencias(dados?.competencias || []);
        setExperiencias(dados?.experiencias || []);
        setFormacoes(dados?.formacoes || []);
      } catch (error) {
        toast.error("Erro ao carregar seu currículo.");
      } finally {
        setIsLoading(false);
      }
    };
    carregarCurriculo();
  }, [reset]);

  const handleUploadFoto = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setFotoUrl(previewUrl);
    setIsUploadingFoto(true);

    const formData = new FormData();
    formData.append("foto", file);

    try {
      const res = await api.patch("/candidato/foto-perfil", formData);
      toast.success("Foto de perfil atualizada!");
      if (res.data?.foto_url) setFotoUrl(res.data.foto_url);
    } catch (error) {
      toast.error("Erro ao enviar a foto.");
      setFotoUrl(null);
    } finally {
      setIsUploadingFoto(false);
    }
  };

  const onSubmitDadosGerais = async (data: DadosGeraisData) => {
    setIsSaving(true);
    try {
      const payload = {
        cpf: data.cpf ? data.cpf.replace(/\D/g, "") : null,
        data_nascimento: data.data_nascimento,
        genero: data.genero,
        telefone: data.telefone ? data.telefone.replace(/\D/g, "") : null,
        whatsapp: data.whatsapp ? data.whatsapp.replace(/\D/g, "") : null,
        link_linkedin: data.link_linkedin,
        link_portfolio: data.link_portfolio,
        link_outro: data.link_outro,
        objetivo_profissional: data.objetivo_profissional,
        resumo_profissional: data.resumo_profissional,
        pretensao_salarial: data.sem_pretensao ? null : data.pretensao_salarial,
        pcd: data.pcd,
        tipo_pcd: data.tipo_pcd,
        necessidade: data.pcd ? data.necessidade : null,
        tipo_contato: data.tipo_contato,
        disponibilidade_viagem: data.disponibilidade_viagem,
        disponibilidade_mudanca: data.disponibilidade_mudanca,
        turno_preferido: data.turno_preferido,
        cnh: data.cnh,
        primeiro_emprego: data.primeiro_emprego,
        endereco: {
          cep: data.cep ? data.cep.replace(/\D/g, "") : null,
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.cidade,
          uf: data.uf,
        },
      };

      await api.put("/candidato/meu-curriculo", payload);

      const areas_ids = areasSelecionadas.map((a) => a.id_area || a.id);
      await api.put("/candidato/areas/sync", { areas_ids });

      toast.success("Dados atualizados com sucesso!");
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao salvar.");
    } finally {
      setIsSaving(false);
    }
  };

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
      setSearchTermComp("");
      setCompSelecionada(null);
      toast.success("Habilidade adicionada!");
    } catch (error) {
      toast.error("Erro ao adicionar competência.");
    }
  };

  const removerCompetencia = async (id_competencia: number) => {
    try {
      await api.delete(`/candidato/competencias/${id_competencia}`);
      setCompetencias((prev) =>
        prev.filter((c) => c.id_competencia !== id_competencia),
      );
      toast.success("Competência removida.");
    } catch (error) {
      toast.error("Erro ao remover.");
    }
  };

  if (isLoading)
    return (
      <div className="p-20 text-center animate-pulse font-bold text-gray-400">
        Carregando currículo...
      </div>
    );

  const abrirFormExperiencia = (exp?: any) => {
    if (exp) {
      setEditingExpId(exp.id_experiencia);
      resetExp({
        empresa: exp.empresa,
        cargo: exp.cargo,
        atividades: exp.atividades || "",
        data_inicio: exp.data_inicio
          ? String(exp.data_inicio).substring(0, 7)
          : "",
        data_fim: exp.data_fim ? String(exp.data_fim).substring(0, 7) : "",
        atual: exp.atual || false,
      });
    } else {
      setEditingExpId(null);
      resetExp({
        empresa: "",
        cargo: "",
        atividades: "",
        data_inicio: "",
        data_fim: "",
        atual: false,
      });
    }
    setShowExpForm(true);
  };

  const fecharFormExperiencia = () => {
    setShowExpForm(false);
    setEditingExpId(null);
  };

  const salvarExperiencia = async (data: ExperienciaData) => {
    setIsSavingExp(true);
    try {
      const formatarData = (yyyyMM: string) =>
        new Date(`${yyyyMM}-01T12:00:00.000Z`).toISOString();
      const payload = {
        ...data,
        data_fim: data.atual ? null : data.data_fim,
        data_inicio: formatarData(data.data_inicio),
        ...(data.data_fim && !data.atual
          ? { data_fim: formatarData(data.data_fim) }
          : {}),
      };

      if (editingExpId) {
        const res = await api.put(
          `/candidato/experiencias/${editingExpId}`,
          payload,
        );
        setExperiencias((prev) =>
          prev.map((e) =>
            e.id_experiencia === editingExpId ? res.data.data : e,
          ),
        );
        toast.success("Experiência atualizada!");
      } else {
        const res = await api.post("/candidato/experiencias", payload);
        setExperiencias((prev) => [...prev, res.data.data]);
        toast.success("Experiência adicionada!");
      }
      fecharFormExperiencia();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao salvar experiência.");
    } finally {
      setIsSavingExp(false);
    }
  };

  const excluirExperiencia = async (id: number) => {
    if (!confirm("Tem certeza que deseja excluir esta experiência?")) return;
    try {
      await api.delete(`/candidato/experiencias/${id}`);
      setExperiencias((prev) => prev.filter((e) => e.id_experiencia !== id));
      toast.success("Experiência removida.");
    } catch (error) {
      toast.error("Erro ao excluir experiência.");
    }
  };

  const abrirFormFormacao = (form?: any) => {
    if (form) {
      setEditingFormId(form.id_formacao);
      resetForm({
        instituicao: form.instituicao,
        nivel: form.nivel,
        curso: form.curso,
        status: form.status,
        data_conclusao: form.data_conclusao
          ? String(form.data_conclusao).substring(0, 4)
          : "",
      });
    } else {
      setEditingFormId(null);
      resetForm({
        instituicao: "",
        nivel: "",
        curso: "",
        status: "",
        data_conclusao: "",
      });
    }
    setShowFormFormacao(true);
  };

  const salvarFormacao = async (data: FormacaoData) => {
    setIsSavingForm(true);
    try {
      const payload = {
        ...data,
        data_conclusao: data.data_conclusao
          ? new Date(`${data.data_conclusao}-01-01T12:00:00.000Z`).toISOString()
          : null,
      };

      if (editingFormId) {
        const res = await api.put(
          `/candidato/formacoes/${editingFormId}`,
          payload,
        );
        setFormacoes((prev) =>
          prev.map((f) =>
            f.id_formacao === editingFormId ? res.data.data : f,
          ),
        );
        toast.success("Formação atualizada!");
      } else {
        const res = await api.post("/candidato/formacoes", payload);
        setFormacoes((prev) => [...prev, res.data.data]);
        toast.success("Formação adicionada!");
      }
      setShowFormFormacao(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Erro ao salvar formação.");
    } finally {
      setIsSavingForm(false);
    }
  };

  const excluirFormacao = async (id: number) => {
    if (!confirm("Excluir esta formação?")) return;
    try {
      await api.delete(`/candidato/formacoes/${id}`);
      setFormacoes((prev) => prev.filter((f) => f.id_formacao !== id));
      toast.success("Formação removida.");
    } catch (error) {
      toast.error("Erro ao excluir.");
    }
  };

  const handleTogglePrimeiroEmprego = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const isChecked = e.target.checked;
    setValue("primeiro_emprego", isChecked, { shouldDirty: true });
    const toastId = toast.loading("Salvando preferência...");

    try {
      const data = getValues();
      const payload = {
        cpf: data.cpf ? data.cpf.replace(/\D/g, "") : null,
        data_nascimento: data.data_nascimento,
        genero: data.genero,
        telefone: data.telefone ? data.telefone.replace(/\D/g, "") : null,
        whatsapp: data.whatsapp ? data.whatsapp.replace(/\D/g, "") : null,
        link_linkedin: data.link_linkedin,
        link_portfolio: data.link_portfolio,
        link_outro: data.link_outro,
        objetivo_profissional: data.objetivo_profissional,
        resumo_profissional: data.resumo_profissional,
        pretensao_salarial: data.sem_pretensao ? null : data.pretensao_salarial,
        pcd: data.pcd,
        tipo_pcd: data.tipo_pcd,
        necessidade: data.pcd ? data.necessidade : null,
        tipo_contato: data.tipo_contato,
        disponibilidade_viagem: data.disponibilidade_viagem,
        disponibilidade_mudanca: data.disponibilidade_mudanca,
        turno_preferido: data.turno_preferido,
        cnh: data.cnh,
        primeiro_emprego: isChecked,
        endereco: {
          cep: data.cep ? data.cep.replace(/\D/g, "") : null,
          logradouro: data.logradouro,
          numero: data.numero,
          complemento: data.complemento,
          bairro: data.bairro,
          cidade: data.cidade,
          uf: data.uf,
        },
      };

      await api.put("/candidato/meu-curriculo", payload);
      const areas_ids = areasSelecionadas.map((a) => a.id_area || a.id);
      await api.put("/candidato/areas/sync", { areas_ids });

      toast.success(
        isChecked
          ? "Salvo! Marcado como 1º Emprego."
          : "Opção de 1º Emprego desmarcada.",
        { id: toastId },
      );
    } catch (error: any) {
      setValue("primeiro_emprego", !isChecked);
      toast.error(
        "Para ativar essa opção, preencha primeiro os Dados Básicos.",
        { id: toastId },
      );
    }
  };

  const filteredAreas = listaTaxonomiaAreas.filter((tax) => {
    const idReal = tax.id_area || tax.id;
    const jaAdicionou = areasSelecionadas.some(
      (a) => (a.id_area || a.id) === idReal,
    );
    const bateComBusca = tax.nome
      .toLowerCase()
      .includes(searchTermArea.toLowerCase());
    return !jaAdicionou && bateComBusca;
  });

  const adicionarArea = (area: any) => {
    if (areasSelecionadas.length >= 3) {
      toast.error("Você pode selecionar no máximo 3 .");
      return;
    }
    setAreasSelecionadas([...areasSelecionadas, area]);
    setSearchTermArea("");
    setIsAreaDropdownOpen(false);
  };

  const removerArea = (id: number) => {
    setAreasSelecionadas(
      areasSelecionadas.filter((a) => (a.id_area || a.id) !== id),
    );
  };

  const WizardNavegacao = () => {
    const currentIndex = ordemAbas.indexOf(activeTab as any);
    const hasAnterior = currentIndex > 0;
    const hasProximo = currentIndex < ordemAbas.length - 1;

    return (
      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-8 mt-8 gap-4 border-t border-gray-100 print:hidden">
        <div>
          {hasAnterior ? (
            <button
              type="button"
              onClick={() => navegarParaAba("anterior")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-gray-500 font-bold hover:bg-gray-100 transition-colors"
            >
              <span className="text-xl leading-none">&larr;</span> Etapa
              Anterior
            </button>
          ) : (
            <div className="hidden sm:block" />
          )}
        </div>

        <div>
          {hasProximo && (
            <button
              type="button"
              onClick={() => navegarParaAba("proximo")}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-blue-50 text-primary font-bold hover:bg-blue-100 transition-colors group"
            >
              Próxima Etapa
              <span className="text-xl leading-none group-hover:translate-x-1 transition-transform">
                &rarr;
              </span>
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto pb-20 pt-6 md:pt-10 space-y-6 md:space-y-8 px-4 md:px-0 animate-in fade-in duration-700">
      {/* HEADER DA PÁGINA */}
      <header className="mb-6 md:mb-10 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-black text-gray-800 tracking-tight">
              Meu Currículo
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Mantenha seus dados atualizados para aumentar suas chances.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-3 md:gap-4 w-full md:w-auto">
            <Link
              href="/meu-curriculo/ver"
              className="w-full sm:w-auto flex justify-center items-center gap-2.5 px-6 py-3 md:py-4 rounded-[24px] bg-blue-50 text-primary text-sm font-bold hover:bg-blue-100 hover:text-blue-700 transition-colors"
            >
              <HiOutlineEye size={20} />
              Visualizar
            </Link>

            {/* CARD DE VISIBILIDADE */}
            <div className="w-full sm:w-auto flex items-center justify-between sm:justify-start gap-4 bg-white px-5 md:px-6 py-3 md:py-4 rounded-[24px] border border-gray-100 shadow-sm transition-all duration-500">
              <div className="flex flex-col text-left sm:text-right">
                <span className="text-sm font-black text-gray-800">
                  Banco de Talentos
                </span>
                <span
                  className={`text-[11px] font-bold ${isVisivel ? "text-emerald-500" : "text-gray-400"}`}
                >
                  {isVisivel ? "Visível p/ empresas" : "Perfil oculto"}
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={isVisivel}
                  onChange={handleToggleVisibilidade}
                />
                <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>
          </div>
        </div>

        {/* BARRA DE PROGRESSO */}
        <div className="bg-white p-5 md:p-6 rounded-[24px] border border-gray-100 shadow-sm flex flex-col md:flex-row items-center gap-4 md:gap-6">
          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-gray-700">Força do Perfil</span>
              <span
                className={
                  progressoCurriculo === 100
                    ? "text-emerald-600"
                    : "text-primary"
                }
              >
                {progressoCurriculo}% Concluído
              </span>
            </div>
            <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ease-out ${progressoCurriculo === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                style={{ width: `${progressoCurriculo}%` }}
              ></div>
            </div>
          </div>

          <div className="shrink-0 text-center px-2 md:px-4 w-full md:w-auto">
            {progressoCurriculo === 100 ? (
              <>
                <span className="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase tracking-widest rounded-full mb-1">
                  Perfil Completo
                </span>
                <p className="text-xs text-gray-500 font-medium">Muito bem!</p>
              </>
            ) : (
              <p className="text-xs text-gray-500 font-medium md:max-w-[150px]">
                Complete todas as seções para destacar seu currículo.
              </p>
            )}
          </div>
        </div>
      </header>

      {/* TABS DE NAVEGAÇÃO */}
      <div className="flex flex-wrap sm:flex-nowrap gap-2 p-1.5 bg-white border border-gray-100 rounded-[24px] shadow-sm overflow-x-auto hide-scrollbar w-full md:w-fit">
        {[
          {
            id: "dados",
            label: "Dados Básicos",
            icon: <HiOutlineUser />,
            isOk: statusAbas.dados,
          },
          {
            id: "experiencia",
            label: "Experiência",
            icon: <HiOutlineBriefcase />,
            isOk: statusAbas.experiencia,
          },
          {
            id: "formacao",
            label: "Formação",
            icon: <HiOutlineAcademicCap />,
            isOk: statusAbas.formacao,
          },
          {
            id: "competencias",
            label: "Habilidades",
            icon: <HiOutlineLightningBolt />,
            isOk: statusAbas.competencias,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-[20px] text-xs md:text-sm font-bold transition-all overflow-hidden whitespace-nowrap min-w-fit ${
              activeTab === tab.id
                ? "bg-blue-50 text-primary shadow-sm border-b-2 border-primary"
                : "text-gray-500 hover:bg-gray-50 border-b-2 border-transparent hover:text-gray-700"
            }`}
          >
            <span className="flex items-center gap-1.5 md:gap-2 relative z-10">
              {tab.icon} {tab.label}
            </span>
            {tab.isOk && (
              <span className="flex h-2 w-2 relative z-10 ml-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            )}
          </button>
        ))}
      </div>

      {/* CONTEÚDO: DADOS GERAIS */}
      {activeTab === "dados" && (
        <form
          onSubmit={handleSubmit(onSubmitDadosGerais)}
          className="space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4"
        >
          <div className="flex justify-between items-end mb-4 md:mb-6 ml-1 md:ml-2">
            <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed">
              Itens com a tag{" "}
              <span className="font-bold text-gray-400">(opcional)</span> não
              travam o cadastro, mas enriquecem seu perfil. Não esqueça de
              clicar em "Salvar" ao terminar!
            </p>
          </div>

          {/* DADOS PESSOAIS E FOTO */}
          <div className="bg-white rounded-[24px] md:rounded-[40px] shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex flex-col items-center justify-center p-6 md:p-10 bg-gradient-to-b from-blue-50/80 to-white border-b border-gray-50">
              <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-blue-100 flex items-center justify-center border-[4px] md:border-[6px] border-white shadow-xl overflow-hidden group mb-4 md:mb-5">
                {fotoUrl ? (
                  <img
                    src={fotoUrl}
                    alt="Sua foto"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <HiOutlineUser
                    size={48}
                    className="text-blue-300 md:w-14 md:h-14"
                  />
                )}
                <label
                  className={`absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white transition-opacity cursor-pointer ${fotoUrl ? "opacity-0 group-hover:opacity-100" : "opacity-100 hover:bg-black/70"}`}
                >
                  <HiOutlineCamera size={24} className="mb-1" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-center px-2">
                    {fotoUrl ? "Trocar Foto" : "Adicionar Foto"}
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUploadFoto}
                    disabled={isUploadingFoto}
                  />
                </label>
                {isUploadingFoto && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight text-center">
                {nomeCandidato || "Seu Nome Aqui"}
              </h2>
              <p className="text-[11px] md:text-xs font-bold text-gray-400 mt-1 text-center max-w-sm px-4 md:px-0">
                Perfis com foto profissional recebem até 3x mais visualizações.
              </p>
            </div>

            <div className="p-5 md:p-8 space-y-8 md:space-y-10">
              <div>
                <h3 className="text-[11px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-3 md:mb-4 ml-1">
                  Informações Básicas
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="CPF"
                    placeholder="000.000.000-00"
                    className={getFieldStatus("cpf")}
                    {...register("cpf", {
                      onChange: (e) => {
                        e.target.value = maskCPF(e.target.value);
                      },
                    })}
                    error={errors.cpf?.message}
                  />
                  <Input
                    label="Nascimento"
                    type="date"
                    className={getFieldStatus("data_nascimento")}
                    {...register("data_nascimento")}
                    error={errors.data_nascimento?.message}
                  />
                  <div className="space-y-1.5">
                    <label className="text-xs md:text-sm font-bold text-gray-700 ml-1">
                      Gênero
                    </label>
                    <select
                      {...register("genero")}
                      className={`w-full p-3.5 md:p-4 rounded-[16px] md:rounded-[20px] outline-none text-sm transition-colors border ${getFieldStatus("genero")}`}
                    >
                      <option value="">Selecione...</option>
                      <option value="MASCULINO">Masculino</option>
                      <option value="FEMININO">Feminino</option>
                      <option value="OUTRO">
                        Outro / Prefiro não informar
                      </option>
                    </select>
                    {errors.genero && (
                      <p className="text-[11px] text-red-500 ml-2 font-bold">
                        {errors.genero.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-[11px] md:text-xs font-black text-gray-400 uppercase tracking-widest mb-3 md:mb-4 ml-1">
                  Contatos & Redes Sociais
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    label="WhatsApp"
                    placeholder="(55) 99999-9999"
                    className={getFieldStatus("whatsapp")}
                    {...register("whatsapp", {
                      onChange: (e) => {
                        e.target.value = maskTelefone(e.target.value);
                      },
                    })}
                    error={errors.whatsapp?.message}
                  />
                  <Input
                    label="Telefone / Celular(opcional)"
                    placeholder="(55) 9999-9999"
                    className={getFieldStatus("telefone")}
                    {...register("telefone", {
                      onChange: (e) => {
                        e.target.value = maskTelefone(e.target.value);
                      },
                    })}
                    error={errors.telefone?.message}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="LinkedIn (URL) (opcional)"
                    placeholder="https://linkedin.com/in/..."
                    className={getFieldStatus("link_linkedin")}
                    {...register("link_linkedin")}
                    error={errors.link_linkedin?.message}
                  />
                  <Input
                    label="Portfólio/GitHub (opcional)"
                    placeholder="https://..."
                    className={getFieldStatus("link_portfolio")}
                    {...register("link_portfolio")}
                    error={errors.link_portfolio?.message}
                  />
                  <Input
                    label="Outro Link (opcional)"
                    placeholder="https://..."
                    className={getFieldStatus("link_outro")}
                    {...register("link_outro")}
                    error={errors.link_outro?.message}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* PERFIL PROFISSIONAL & PRETENSÃO */}
          <div className="bg-white p-5 md:p-8 rounded-[24px] md:rounded-[40px] shadow-sm border border-gray-100 space-y-6 md:space-y-8">
            <h2 className="text-lg md:text-xl font-black text-gray-800">
              Perfil Profissional
            </h2>

            <div className="space-y-6">
              <div className="space-y-3">
                <div>
                  <label className="text-xs md:text-sm font-bold text-gray-700 ml-1 flex items-center justify-between">
                    Áreas de Atuação
                    <span
                      className={`text-[10px] uppercase tracking-widest font-black ${areasSelecionadas.length === 3 ? "text-red-500" : "text-blue-500"}`}
                    >
                      {areasSelecionadas.length}/3
                    </span>
                  </label>
                  <p className="text-[11px] md:text-xs text-gray-500 ml-1 mt-0.5">
                    Selecione até 3 áreas principais para seu perfil ser
                    encontrado em nosso banco de talentos.
                  </p>
                </div>
                <div className="relative group z-20">
                  <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 z-10" />
                  <input
                    type="text"
                    placeholder={
                      areasSelecionadas.length >= 3
                        ? "Limite de áreas atingido"
                        : "Buscar área (Ex: TI, RH...)"
                    }
                    disabled={areasSelecionadas.length >= 3}
                    className="w-full pl-12 pr-4 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-[20px] md:rounded-[24px] outline-none text-sm transition-all focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 disabled:opacity-50"
                    value={searchTermArea}
                    onChange={(e) => {
                      setSearchTermArea(e.target.value);
                      setIsAreaDropdownOpen(true);
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
                              key={`area-drop-${idReal}`}
                              type="button"
                              onClick={() => adicionarArea(a)}
                              className="w-full text-left px-5 py-3 hover:bg-blue-50 rounded-[16px] text-sm font-bold text-gray-700 hover:text-blue-700 transition-colors"
                            >
                              {a.nome}
                            </button>
                          );
                        })
                      ) : (
                        <div className="px-5 py-4 text-sm text-gray-400 font-medium italic">
                          Nenhuma área disponível...
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {areasSelecionadas.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {areasSelecionadas.map((a: any) => {
                      const idReal = a.id_area_atuacao || a.id_area || a.id;
                      return (
                        <div
                          key={`area-sel-${idReal}`}
                          className="flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-blue-50 text-primary border border-blue-100 rounded-full text-xs md:text-sm font-bold animate-in zoom-in duration-200"
                        >
                          {a.nome}
                          <button
                            type="button"
                            onClick={() => removerArea(idReal)}
                            className="text-primary hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors"
                          >
                            <HiOutlineX size={14} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-gray-700 ml-1">
                  Resumo Profissional (opcional)
                </label>
                <textarea
                  {...register("resumo_profissional")}
                  className={`w-full p-4 md:p-6 rounded-[24px] md:rounded-[32px] h-32 outline-none text-sm focus:ring-4 resize-none transition-colors border ${getFieldStatus("resumo_profissional")}`}
                  placeholder="Exemplo: Profissional com 3 anos de experiência em atendimento..."
                />
                {errors.resumo_profissional && (
                  <p className="text-[11px] text-red-500 ml-2 font-bold">
                    {errors.resumo_profissional.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-xs md:text-sm font-bold text-gray-700 ml-1">
                  Objetivos Profissionais (opcional)
                </label>
                <textarea
                  {...register("objetivo_profissional")}
                  className={`w-full p-4 md:p-6 rounded-[24px] md:rounded-[32px] h-32 outline-none text-sm focus:ring-4 resize-none transition-colors border ${getFieldStatus("objetivo_profissional")}`}
                  placeholder="Exemplo: Busco oportunidades na área administrativa..."
                />
                {errors.objetivo_profissional && (
                  <p className="text-[11px] text-red-500 ml-2 font-bold">
                    {errors.objetivo_profissional.message}
                  </p>
                )}
              </div>
            </div>

            {/* Pretensão Salarial Horizontal -> Stack on Mobile */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 p-5 md:p-6 bg-gray-50 rounded-[24px] md:rounded-[32px] border border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-800">
                  Pretensão Salarial
                </h3>
                <p className="text-[11px] md:text-xs text-gray-500 max-w-sm mt-1 leading-relaxed">
                  Informe um valor médio ou marque a opção ao lado.
                </p>
              </div>
              <div className="flex-1 w-full max-w-sm space-y-3">
                <Input
                  label="Valor (R$)"
                  type="number"
                  disabled={watch("sem_pretensao")}
                  className={`transition-colors bg-white ${watch("sem_pretensao") ? "opacity-50 bg-gray-200 border-gray-200" : getFieldStatus("pretensao_salarial")}`}
                  {...register("pretensao_salarial")}
                  error={errors.pretensao_salarial?.message}
                />
                <label className="flex items-center gap-2 cursor-pointer ml-1 md:ml-2 group">
                  <input
                    type="checkbox"
                    {...register("sem_pretensao")}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-blue-500"
                  />
                  <span className="text-[11px] md:text-xs font-bold text-gray-500 group-hover:text-primary transition-colors">
                    Sem pretensão / Prefiro não responder
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* ENDEREÇO */}
          <div className="bg-white p-5 md:p-8 rounded-[24px] md:rounded-[40px] shadow-sm border border-gray-100 space-y-5 md:space-y-6">
            <h2 className="text-lg md:text-xl font-black text-gray-800">
              Endereço
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="CEP"
                placeholder="00000-000"
                className={getFieldStatus("cep")}
                {...register("cep", {
                  onChange: (e) => (e.target.value = maskCEP(e.target.value)),
                })}
                error={errors.cep?.message}
              />
              <div className="md:col-span-2">
                <Input
                  label="Logradouro (Rua)"
                  className={getFieldStatus("logradouro")}
                  {...register("logradouro")}
                  error={errors.logradouro?.message}
                />
              </div>
              <Input
                label="Número"
                className={getFieldStatus("numero")}
                {...register("numero")}
                error={errors.numero?.message}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Input
                label="Complemento"
                className={getFieldStatus("complemento")}
                {...register("complemento")}
                error={errors.complemento?.message}
              />
              <Input
                label="Bairro"
                className={getFieldStatus("bairro")}
                {...register("bairro")}
                error={errors.bairro?.message}
              />
              <Input
                label="Cidade"
                className={getFieldStatus("cidade")}
                {...register("cidade")}
                error={errors.cidade?.message}
              />
              <Input
                label="UF"
                className={getFieldStatus("uf")}
                {...register("uf")}
                error={errors.uf?.message}
              />
            </div>
          </div>

          {/* PREFERÊNCIAS & DIVERSIDADE */}
          {/* BLOCO 3: PREFERÊNCIAS & DIVERSIDADE */}
          <div className="bg-white p-5 md:p-8 rounded-[24px] md:rounded-[40px] shadow-sm border border-gray-100 space-y-6 md:space-y-8">
            <h2 className="text-lg md:text-xl font-black text-gray-800 border-b border-gray-50 pb-3 md:pb-4">
              Preferências & Diversidade
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
              {/* === LADO ESQUERDO: CONTATO E LOGÍSTICA === */}
              <div className="space-y-6 md:space-y-8">
                {/* 1. Contato Preferido (Card) */}
                <div className="bg-gray-50 p-4 md:p-6 rounded-[20px] md:rounded-[24px] border border-gray-100 space-y-4">
                  <div>
                    <h3 className="text-xs md:text-sm font-black text-gray-800">
                      Canal de Contato
                    </h3>
                    <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">
                      Como as empresas devem te procurar?
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "WHATSAPP", label: "WhatsApp" },
                      { id: "EMAIL", label: "E-mail" },
                      { id: "LIGACAO", label: "Ligação" },
                      { id: "QUALQUER_UM", label: "Qualquer um" },
                    ].map((metodo) => (
                      <label key={metodo.id} className="cursor-pointer w-full">
                        <input
                          type="radio"
                          value={metodo.id}
                          {...register("tipo_contato")}
                          className="sr-only peer"
                        />
                        <div className="w-full h-full flex items-center justify-center text-center px-2 py-3 rounded-xl border border-gray-200 bg-white text-[11px] md:text-xs font-bold text-gray-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 peer-checked:border-emerald-300 hover:border-blue-200 transition-all shadow-sm">
                          {metodo.label}
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* 2. Disponibilidade Logística (Card) */}
                <div className="bg-gray-50 p-4 md:p-6 rounded-[20px] md:rounded-[24px] border border-gray-100 space-y-4">
                  <h3 className="text-xs md:text-sm font-black text-gray-800">
                    Disponibilidade Logística
                  </h3>
                  <div className="flex flex-col gap-4">
                    <label className="flex items-center justify-between cursor-pointer group bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                      <span className="text-xs md:text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">
                        Aceita viagens a trabalho?
                      </span>
                      <input
                        type="checkbox"
                        {...register("disponibilidade_viagem")}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-blue-500"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer group bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
                      <span className="text-xs md:text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">
                        Toparia mudar de cidade?
                      </span>
                      <input
                        type="checkbox"
                        {...register("disponibilidade_mudanca")}
                        className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-blue-500"
                      />
                    </label>
                  </div>
                </div>

                {/* 3. Inclusão PCD (Card) */}
                <div
                  className={`p-4 md:p-6 rounded-[20px] md:rounded-[24px] border transition-all shadow-sm ${watch("pcd") ? "bg-blue-50/50 border-blue-200" : "bg-gray-50 border-gray-100"}`}
                >
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      {...register("pcd")}
                      className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-blue-500"
                    />
                    <div>
                      <span className="block text-xs md:text-sm font-black text-gray-800 group-hover:text-primary transition-colors">
                        Sou Pessoa com Deficiência (PcD)
                      </span>
                      <span className="block text-[10px] md:text-xs text-gray-500 mt-0.5">
                        Seção opcional de inclusão.
                      </span>
                    </div>
                  </label>

                  {watch("pcd") && (
                    <div className="mt-5 space-y-4 animate-in slide-in-from-top-4 pt-4 border-t border-blue-100">
                      <Input
                        label="Tipo de deficiência"
                        placeholder="Ex: Física, Visual, Auditiva..."
                        className={`bg-white shadow-sm ${getFieldStatus("tipo_pcd")}`}
                        {...register("tipo_pcd")}
                        error={errors.tipo_pcd?.message}
                      />
                      <div className="space-y-1.5">
                        <label className="text-[11px] md:text-xs font-bold text-gray-700 ml-1">
                          Necessita adaptação na entrevista?
                        </label>
                        <textarea
                          {...register("necessidade")}
                          className={`w-full p-3 bg-white shadow-sm rounded-xl h-20 outline-none text-xs focus:ring-4 resize-none transition-colors border ${getFieldStatus("necessidade")}`}
                          placeholder="Ex: Rampa de acesso, intérprete..."
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* === LADO DIREITO: TURNOS E CNH === */}
              <div className="space-y-6 md:space-y-8">
                {/* 4. Turnos (Card) */}
                <div className="bg-gray-50 p-4 md:p-6 rounded-[20px] md:rounded-[24px] border border-gray-100 space-y-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs md:text-sm font-black text-gray-800">
                        Turno de Trabalho
                      </h3>
                      <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">
                        Selecione até 3 horários.
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 bg-white rounded-md border text-[10px] font-black shadow-sm ${(watch("turno_preferido") || []).length > 3 ? "text-red-500 border-red-200" : "text-primary border-blue-100"}`}
                    >
                      {(watch("turno_preferido") || []).length}/3
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      {
                        id: "QUALQUER_TURNO",
                        label: "Sem Preferência",
                        colSpan: "col-span-2 sm:col-span-3",
                      }, // Esse ocupa a linha toda pra destacar
                      {
                        id: "HORARIO_COMERCIAL",
                        label: "Comercial",
                        colSpan: "",
                      },
                      { id: "PRIMEIRO_TURNO", label: "1º Turno", colSpan: "" },
                      { id: "SEGUNDO_TURNO", label: "2º Turno", colSpan: "" },
                      { id: "TERCEIRO_TURNO", label: "3º Turno", colSpan: "" },
                    ].map((turno) => {
                      const turnosSelecionados = watch("turno_preferido") || [];
                      const isChecked = turnosSelecionados.includes(
                        turno.id as any,
                      );
                      const isAtMaxLimit =
                        turnosSelecionados.length >= 3 &&
                        !isChecked &&
                        turno.id !== "QUALQUER_TURNO";

                      const handleTurnoChange = (
                        e: React.ChangeEvent<HTMLInputElement>,
                      ) => {
                        const clicouNeste = e.target.checked;
                        if (clicouNeste) {
                          if (turno.id === "QUALQUER_TURNO") {
                            setValue("turno_preferido", ["QUALQUER_TURNO"]);
                          } else {
                            const novaLista = turnosSelecionados.filter(
                              (t) => t !== "QUALQUER_TURNO",
                            );
                            setValue("turno_preferido", [
                              ...novaLista,
                              turno.id as any,
                            ]);
                          }
                        } else {
                          const listaAposRemover = turnosSelecionados.filter(
                            (t) => t !== turno.id,
                          );
                          if (listaAposRemover.length === 0) {
                            setValue("turno_preferido", ["QUALQUER_TURNO"]);
                          } else {
                            setValue("turno_preferido", listaAposRemover);
                          }
                        }
                      };

                      return (
                        <label
                          key={turno.id}
                          className={`cursor-pointer w-full ${turno.colSpan} ${isAtMaxLimit ? "opacity-40" : ""}`}
                        >
                          <input
                            type="checkbox"
                            value={turno.id}
                            disabled={isAtMaxLimit}
                            checked={isChecked}
                            onChange={handleTurnoChange}
                            className="sr-only peer"
                          />
                          <div className="w-full h-full flex items-center justify-center text-center px-2 py-3 rounded-xl border border-gray-200 bg-white text-[11px] md:text-xs font-bold text-gray-500 peer-checked:bg-blue-50 peer-checked:text-primary peer-checked:border-blue-300 hover:border-blue-200 transition-all shadow-sm">
                            {turno.label}
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {(watch("turno_preferido") || []).length > 0 &&
                    !watch("turno_preferido")?.includes("QUALQUER_TURNO") && (
                      <div className="mt-3 px-4 py-3 bg-blue-50/50 rounded-xl animate-in fade-in space-y-1.5 border border-blue-100">
                        {(watch("turno_preferido") || []).map(
                          (tId) =>
                            descricoesTurno[tId] && (
                              <p
                                key={`dica-${tId}`}
                                className="text-[10px] md:text-[11px] text-primary font-bold flex items-start gap-1.5"
                              >
                                <span className="shrink-0 mt-0.5">💡</span>
                                {descricoesTurno[tId]}
                              </p>
                            ),
                        )}
                      </div>
                    )}
                  {errors.turno_preferido && (
                    <p className="text-[11px] text-red-500 ml-2 font-bold">
                      {errors.turno_preferido.message}
                    </p>
                  )}
                </div>

                {/* 5. CNH (Card) */}
                <div className="bg-gray-50 p-4 md:p-6 rounded-[20px] md:rounded-[24px] border border-gray-100 space-y-4">
                  <div>
                    <h3 className="text-xs md:text-sm font-black text-gray-800">
                      Carteira de Habilitação (CNH)
                    </h3>
                    <p className="text-[11px] md:text-xs text-gray-500 mt-0.5">
                      Quais categorias você possui?
                    </p>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {/* Botão Não Possuo ocupando a linha de cima */}
                    <label className="cursor-pointer w-full col-span-3 sm:col-span-5">
                      <input
                        type="checkbox"
                        value="NAO_POSSUO"
                        checked={(watch("cnh") || []).includes("NAO_POSSUO")}
                        onChange={(e) => {
                          if (e.target.checked) setValue("cnh", ["NAO_POSSUO"]);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-full text-center px-2 py-3 rounded-xl border border-gray-200 bg-white text-[11px] md:text-xs font-bold text-gray-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 peer-checked:border-emerald-300 hover:border-emerald-200 transition-all shadow-sm">
                        Não Possuo
                      </div>
                    </label>

                    {/* Letras da CNH menores embaixo */}
                    {["A", "B", "C", "D", "E"].map((categoria) => {
                      const cnhSelecionadas = watch("cnh") || [];
                      const isChecked = cnhSelecionadas.includes(
                        categoria as any,
                      );

                      const handleCnhChange = (
                        e: React.ChangeEvent<HTMLInputElement>,
                      ) => {
                        const clicou = e.target.checked;
                        if (clicou) {
                          const novaLista = cnhSelecionadas.filter(
                            (c) => c !== "NAO_POSSUO",
                          );
                          setValue("cnh", [...novaLista, categoria as any]);
                        } else {
                          const listaAposRemover = cnhSelecionadas.filter(
                            (c) => c !== categoria,
                          );
                          if (listaAposRemover.length === 0) {
                            setValue("cnh", ["NAO_POSSUO"]);
                          } else {
                            setValue("cnh", listaAposRemover);
                          }
                        }
                      };

                      return (
                        <label
                          key={categoria}
                          className="cursor-pointer w-full"
                        >
                          <input
                            type="checkbox"
                            value={categoria}
                            checked={isChecked}
                            onChange={handleCnhChange}
                            className="sr-only peer"
                          />
                          <div className="w-full flex items-center justify-center px-1 py-3 rounded-xl border border-gray-200 bg-white text-xs md:text-sm font-black text-gray-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 peer-checked:border-emerald-300 hover:border-emerald-200 transition-all shadow-sm">
                            {categoria}
                          </div>
                        </label>
                      );
                    })}
                  </div>

                  {/* Exibição das Dicas da CNH */}
                  {(watch("cnh") || []).length > 0 &&
                    !watch("cnh")?.includes("NAO_POSSUO") && (
                      <div className="mt-3 px-4 py-3 bg-emerald-50/50 rounded-xl animate-in fade-in space-y-1.5 border border-emerald-100">
                        {(watch("cnh") || []).map(
                          (cat) =>
                            descricoesCnh[cat] && (
                              <p
                                key={`dica-cnh-${cat}`}
                                className="text-[10px] md:text-[11px] text-emerald-700 font-bold flex items-start gap-1.5"
                              >
                                <span className="shrink-0 mt-0.5">💡</span>
                                {descricoesCnh[cat]}
                              </p>
                            ),
                        )}
                      </div>
                    )}
                  {errors.cnh && (
                    <p className="text-[11px] text-red-500 ml-2 font-bold">
                      {errors.cnh.message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* BOTÃO DE SALVAR CENTRALIZADO NO MOBILE */}
          <div className="flex flex-col md:flex-row justify-center md:justify-end pt-4 md:pt-8 w-full">
            <ButtonType
              type="submit"
              disabled={isSaving}
              className="w-full md:w-auto px-6 md:px-10 py-4 md:py-5 rounded-full md:rounded-[24px] flex items-center justify-center gap-2 shadow-lg shadow-blue-100 text-base md:text-lg"
            >
              <HiOutlineSave size={24} />
              {isSaving ? "Salvando Dados..." : "Salvar Dados Básicos"}
            </ButtonType>
          </div>
        </form>
      )}

      {/* ABA 4: COMPETÊNCIAS */}
      {activeTab === "competencias" && (
        <section className="bg-white p-6 md:p-10 rounded-[24px] md:rounded-[48px] shadow-sm border border-gray-100 space-y-6 md:space-y-8 animate-in slide-in-from-bottom-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-800">
              Suas Habilidades
            </h2>
            <p className="text-xs md:text-sm text-gray-500 mt-1">
              Adicione até 10 ferramentas ou tecnologias.
              <span
                className={`ml-1 font-bold ${competencias.length === 10 ? "text-red-500" : "text-blue-500"}`}
              >
                ({competencias.length}/10)
              </span>
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
            <div className="space-y-4">
              <label className="text-xs md:text-sm font-bold text-gray-700 ml-1">
                Buscar Habilidade
              </label>
              <div className="relative group">
                <HiOutlineSearch
                  className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 z-10"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Ex: React, Vendas..."
                  disabled={
                    competencias.length >= 10 || compSelecionada !== null
                  }
                  className="w-full pl-14 pr-4 py-3.5 md:py-4 bg-gray-50 border border-gray-100 rounded-full md:rounded-[24px] outline-none text-sm transition-all focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 disabled:opacity-50"
                  value={
                    compSelecionada ? compSelecionada.nome : searchTermComp
                  }
                  onChange={(e) => {
                    setSearchTermComp(e.target.value);
                    setIsCompDropdownOpen(true);
                  }}
                  onFocus={() => setIsCompDropdownOpen(true)}
                  onBlur={() =>
                    setTimeout(() => setIsCompDropdownOpen(false), 200)
                  }
                />
                {compSelecionada && (
                  <button
                    type="button"
                    onClick={() => {
                      setCompSelecionada(null);
                      setSearchTermComp("");
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-gray-200 text-gray-600 p-1.5 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors z-10"
                  >
                    <HiOutlineX size={14} />
                  </button>
                )}
                {isCompDropdownOpen &&
                  searchTermComp.length > 0 &&
                  !compSelecionada && (
                    <div className="absolute w-full mt-2 bg-white border border-gray-100 rounded-[20px] md:rounded-[24px] shadow-2xl z-50 max-h-60 overflow-y-auto p-2 animate-in fade-in duration-200">
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
                        <div className="px-5 py-4 text-sm text-gray-400 font-medium italic">
                          Nenhuma habilidade encontrada...
                        </div>
                      )}
                    </div>
                  )}
              </div>

              {compSelecionada && (
                <div className="bg-blue-50 p-5 md:p-6 rounded-[24px] md:rounded-[32px] border border-blue-100 animate-in slide-in-from-top-2">
                  <p className="text-[11px] md:text-xs font-black text-blue-800 uppercase tracking-widest mb-3 md:mb-4">
                    Qual seu nível de domínio?
                  </p>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        adicionarCompetencia(
                          compSelecionada.id_competencia,
                          "BASICO",
                        )
                      }
                      className="w-full py-3 bg-white text-blue-700 border border-blue-100 hover:bg-primary hover:text-white rounded-[16px] text-sm font-bold transition-colors"
                    >
                      Básico (Tenho noções)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        adicionarCompetencia(
                          compSelecionada.id_competencia,
                          "INTERMEDIARIO",
                        )
                      }
                      className="w-full py-3 bg-white text-blue-700 border border-blue-100 hover:bg-primary hover:text-white rounded-[16px] text-sm font-bold transition-colors"
                    >
                      Intermediário (Me viro bem)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        adicionarCompetencia(
                          compSelecionada.id_competencia,
                          "AVANCADO",
                        )
                      }
                      className="w-full py-3 bg-white text-blue-700 border border-blue-100 hover:bg-primary hover:text-white rounded-[16px] text-sm font-bold transition-colors"
                    >
                      Avançado (Domino)
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-50 border border-gray-100 rounded-[24px] md:rounded-[32px] p-5 md:p-6 h-[300px] md:h-[400px] overflow-y-auto">
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
                <div className="flex flex-wrap gap-2">
                  {competencias.map((c: any) => (
                    <div
                      key={`saved-${c.id_competencia}`}
                      className="group flex flex-col px-4 py-2 md:py-3 bg-white border border-gray-200 rounded-[16px] md:rounded-[20px] shadow-sm hover:border-blue-300 transition-all relative w-full sm:w-auto"
                    >
                      <span className="text-xs md:text-sm font-black text-gray-800">
                        {c.competencia?.nome || "Carregando..."}
                      </span>
                      <span className="text-[9px] md:text-[10px] font-bold text-blue-500 uppercase tracking-wider mt-0.5">
                        {c.nivel}
                      </span>
                      <button
                        type="button"
                        onClick={() => removerCompetencia(c.id_competencia)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-50 text-gray-400 p-2 rounded-full sm:opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
                      >
                        <HiOutlineTrash size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ABA 2: EXPERIÊNCIA PROFISSIONAL */}
      {activeTab === "experiencia" && (
        <section className="space-y-6 animate-in slide-in-from-bottom-4">
          {!showExpForm && (
            <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[40px] shadow-sm border border-gray-100 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-black text-gray-800">
                    Histórico Profissional
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500">
                    Adicione suas experiências mais relevantes.
                  </p>
                </div>
                <label className="w-full sm:w-auto flex items-center justify-between gap-3 cursor-pointer group bg-blue-50/50 px-4 md:px-5 py-3 rounded-[16px] md:rounded-[20px] border border-blue-100 hover:bg-blue-50 transition-colors">
                  <span className="text-xs md:text-sm font-black text-blue-900">
                    Busco meu 1º Emprego
                  </span>
                  <div className="relative inline-flex items-center">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={watch("primeiro_emprego")}
                      onChange={handleTogglePrimeiroEmprego}
                    />
                    <div className="w-10 h-5 md:w-11 md:h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 md:after:h-5 md:after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </div>
                </label>
              </div>

              {watch("primeiro_emprego") ? (
                <div className="p-6 md:p-10 rounded-[24px] md:rounded-[32px] bg-gradient-to-br from-emerald-50 to-teal-50/30 border border-emerald-100 text-center animate-in zoom-in-95 duration-300">
                  <div className="w-12 h-12 md:w-16 md:h-16 bg-white text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 shadow-sm border border-emerald-50">
                    <HiOutlineLightningBolt
                      size={24}
                      className="md:w-7 md:h-7"
                    />
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-emerald-900 mb-2">
                    Todo grande talento tem um começo!
                  </h3>
                  <p className="text-xs md:text-sm font-medium text-emerald-700/80 max-w-md mx-auto leading-relaxed">
                    Empresas estão em busca de pessoas com vontade de aprender.
                    Capriche nas abas de <b>Formação</b> e <b>Habilidades</b>!
                  </p>
                </div>
              ) : (
                <div className="space-y-4 md:space-y-6">
                  {experiencias.length > 0 && (
                    <div className="flex justify-center sm:justify-end border-t border-gray-50 pt-4">
                      <button
                        onClick={() => abrirFormExperiencia()}
                        className="w-full sm:w-auto flex justify-center items-center gap-2 bg-blue-50 text-primary px-5 py-3 md:py-2.5 rounded-full text-sm font-bold hover:bg-blue-100 transition-colors"
                      >
                        <HiOutlinePlus size={18} /> Adicionar Experiência
                      </button>
                    </div>
                  )}

                  {experiencias.length === 0 ? (
                    <div
                      onClick={() => abrirFormExperiencia()}
                      className="p-10 md:p-16 rounded-[24px] md:rounded-[32px] border-2 border-dashed border-gray-200 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
                    >
                      <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-50 text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-100 transition-colors rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                        <HiOutlineBriefcase
                          size={24}
                          className="md:w-7 md:h-7"
                        />
                      </div>
                      <h3 className="text-base md:text-lg font-bold text-gray-700">
                        Nenhuma experiência cadastrada
                      </h3>
                      <p className="text-xs md:text-sm text-gray-400 mt-1">
                        Clique aqui para adicionar seu emprego anterior ou
                        atual.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 md:space-y-4">
                      {experiencias.map((exp: any) => (
                        <div
                          key={exp.id_experiencia}
                          className="flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 bg-gray-50 border border-gray-100 rounded-[20px] md:rounded-[24px] group hover:border-blue-200 transition-colors"
                        >
                          <div className="space-y-1">
                            <h4 className="font-bold text-gray-800 text-base md:text-lg leading-tight">
                              {exp.cargo}
                            </h4>
                            <p className="text-xs md:text-sm font-medium text-primary">
                              {exp.empresa}
                            </p>
                            <p className="text-[11px] md:text-xs text-gray-400 font-medium">
                              {new Date(exp.data_inicio).toLocaleDateString(
                                "pt-BR",
                                { month: "short", year: "numeric" },
                              )}{" "}
                              -{" "}
                              {exp.atual
                                ? "Atual"
                                : new Date(exp.data_fim).toLocaleDateString(
                                    "pt-BR",
                                    { month: "short", year: "numeric" },
                                  )}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 mt-4 md:mt-0 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => abrirFormExperiencia(exp)}
                              className="flex-1 sm:flex-none justify-center flex px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:border-blue-300 hover:text-primary rounded-full transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() =>
                                excluirExperiencia(exp.id_experiencia)
                              }
                              className="p-2 flex items-center justify-center bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <HiOutlineTrash size={16} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {showExpForm && (
            <form
              onSubmit={handleSubmitExp(salvarExperiencia)}
              className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[40px] shadow-sm border border-gray-100 space-y-6"
            >
              <h2 className="text-lg md:text-xl font-black text-gray-800 border-b border-gray-100 pb-3 md:pb-4">
                {editingExpId ? "Editar Experiência" : "Nova Experiência"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Empresa"
                  placeholder="Ex: ACI Panambi"
                  {...registerExp("empresa")}
                  error={errorsExp.empresa?.message}
                />
                <Input
                  label="Cargo"
                  placeholder="Ex: Analista de Sistemas"
                  {...registerExp("cargo")}
                  error={errorsExp.cargo?.message}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                <Input
                  label="Data de Início"
                  type="month"
                  {...registerExp("data_inicio")}
                  error={errorsExp.data_inicio?.message}
                />
                <div className="space-y-2">
                  <Input
                    label="Data de Fim"
                    type="month"
                    disabled={watchExp("atual")}
                    className={
                      watchExp("atual") ? "opacity-50 bg-gray-100" : ""
                    }
                    {...registerExp("data_fim")}
                    error={errorsExp.data_fim?.message}
                  />
                  <label className="flex items-center gap-2 cursor-pointer group px-1">
                    <input
                      type="checkbox"
                      {...registerExp("atual")}
                      onChange={(e) => {
                        setValueExp("atual", e.target.checked);
                        if (e.target.checked) setValueExp("data_fim", "");
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-blue-500"
                    />
                    <span className="text-[11px] md:text-xs font-bold text-gray-500 group-hover:text-primary transition-colors">
                      Trabalho atualmente neste cargo
                    </span>
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs md:text-sm font-bold text-gray-700 ml-1">
                  Atividades e Conquistas
                </label>
                <textarea
                  {...registerExp("atividades")}
                  className="w-full p-4 md:p-6 bg-gray-50 border border-gray-100 rounded-[20px] md:rounded-[32px] h-32 outline-none text-sm focus:ring-4 focus:ring-blue-500/5 resize-none"
                  placeholder="Descreva suas responsabilidades e resultados..."
                />
                {errorsExp.atividades && (
                  <p className="text-[11px] md:text-xs text-red-500 ml-2 font-bold">
                    {errorsExp.atividades.message}
                  </p>
                )}
              </div>
              <div className="flex flex-col-reverse md:flex-row justify-center md:justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={fecharFormExperiencia}
                  disabled={isSavingExp}
                  className="w-full md:w-auto px-8 py-3.5 md:py-4 rounded-full md:rounded-[24px] font-bold text-gray-500 hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-200"
                >
                  Cancelar
                </button>
                <ButtonType
                  type="submit"
                  disabled={isSavingExp}
                  className="w-full md:w-auto px-10 py-3.5 md:py-4 rounded-full md:rounded-[24px] flex items-center justify-center gap-2 shadow-lg shadow-blue-100"
                >
                  <HiOutlineSave size={20} />{" "}
                  {isSavingExp ? "Salvando..." : "Salvar Experiência"}
                </ButtonType>
              </div>
            </form>
          )}
        </section>
      )}

      {/* ABA 3: FORMAÇÃO ACADÊMICA */}
      {activeTab === "formacao" && (
        <section className="space-y-6 animate-in slide-in-from-bottom-4">
          {!showFormFormacao && (
            <div className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[40px] shadow-sm border border-gray-100 space-y-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg md:text-xl font-black text-gray-800">
                    Sua Formação
                  </h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                    Liste seus cursos, graduações e especializações.
                  </p>
                </div>
                {formacoes.length > 0 && (
                  <button
                    onClick={() => abrirFormFormacao()}
                    className="w-full sm:w-auto flex justify-center items-center gap-2 bg-blue-50 text-primary px-5 py-3 md:py-2.5 rounded-full text-sm font-bold hover:bg-blue-100 transition-colors"
                  >
                    <HiOutlinePlus size={18} /> Adicionar
                  </button>
                )}
              </div>

              {formacoes.length === 0 ? (
                <div
                  onClick={() => abrirFormFormacao()}
                  className="p-10 md:p-16 rounded-[24px] md:rounded-[32px] border-2 border-dashed border-gray-200 text-center cursor-pointer hover:border-blue-300 hover:bg-blue-50/30 transition-all group"
                >
                  <div className="w-14 h-14 md:w-16 md:h-16 bg-gray-50 text-gray-400 group-hover:text-blue-500 group-hover:bg-blue-100 transition-colors rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                    <HiOutlineAcademicCap size={24} className="md:w-7 md:h-7" />
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-gray-700">
                    Nenhuma formação cadastrada
                  </h3>
                  <p className="text-xs md:text-sm text-gray-400 mt-1">
                    Adicione cursos técnicos ou graduações.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:gap-4">
                  {formacoes.map((f: any) => (
                    <div
                      key={f.id_formacao}
                      className="flex flex-col md:flex-row md:items-center justify-between p-5 md:p-6 bg-gray-50 border border-gray-100 rounded-[20px] md:rounded-[24px] group hover:border-blue-200 transition-colors"
                    >
                      <div className="space-y-1">
                        <h4 className="font-bold text-gray-800 text-base md:text-lg leading-tight">
                          {f.curso}
                        </h4>
                        <p className="text-xs md:text-sm font-medium text-primary">
                          {f.instituicao} • {f.nivel}
                        </p>
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase mt-1 ${f.status === "CONCLUÍDO" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                        >
                          {f.status}{" "}
                          {f.data_conclusao &&
                            `em ${new Date(f.data_conclusao).getFullYear()}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 mt-4 md:mt-0 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => abrirFormFormacao(f)}
                          className="flex-1 sm:flex-none justify-center flex px-4 py-2 text-xs font-bold text-gray-600 bg-white border border-gray-200 hover:border-blue-300 hover:text-primary rounded-full"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => excluirFormacao(f.id_formacao)}
                          className="p-2 flex items-center justify-center bg-white border border-gray-200 hover:border-red-300 hover:text-red-500 rounded-full"
                        >
                          <HiOutlineTrash size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {showFormFormacao && (
            <form
              onSubmit={handleSubmitForm(salvarFormacao)}
              className="bg-white p-6 md:p-8 rounded-[24px] md:rounded-[40px] shadow-sm border border-gray-100 space-y-6"
            >
              <h2 className="text-lg md:text-xl font-black text-gray-800 border-b border-gray-100 pb-3 md:pb-4">
                {editingFormId ? "Editar Formação" : "Nova Formação"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Instituição"
                  placeholder="Ex: UNIJUÍ, IFFar, Fisk..."
                  {...registerForm("instituicao")}
                  error={errorsForm.instituicao?.message}
                />
                <Input
                  label="Curso"
                  placeholder="Ex: Administração..."
                  {...registerForm("curso")}
                  error={errorsForm.curso?.message}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs md:text-sm font-bold text-gray-700 ml-1">
                    Nível
                  </label>
                  <select
                    {...registerForm("nivel")}
                    className="w-full p-3.5 md:p-4 bg-gray-50 border border-gray-100 rounded-[16px] md:rounded-[20px] outline-none text-sm focus:border-blue-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="Ensino Fundamental">
                      Ensino Fundamental
                    </option>
                    <option value="Ensino Médio">Ensino Médio</option>
                    <option value="Curso Técnico">Curso Técnico</option>
                    <option value="Superior Curto (Tecnólogo)">
                      Superior (Tecnólogo)
                    </option>
                    <option value="Graduação">
                      Graduação (Bacharel/Licenciatura)
                    </option>
                    <option value="Pós-Graduação / Especialização">
                      Pós / Especialização
                    </option>
                    <option value="Mestrado / Doutorado">
                      Mestrado / Doutorado
                    </option>
                    <option value="Curso Complementar">
                      Curso Complementar / Idiomas
                    </option>
                  </select>
                  {errorsForm.nivel && (
                    <p className="text-[11px] text-red-500 ml-2">
                      {errorsForm.nivel.message}
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs md:text-sm font-bold text-gray-700 ml-1">
                    Status
                  </label>
                  <select
                    {...registerForm("status")}
                    className="w-full p-3.5 md:p-4 bg-gray-50 border border-gray-100 rounded-[16px] md:rounded-[20px] outline-none text-sm focus:border-blue-500"
                  >
                    <option value="">Selecione...</option>
                    <option value="CURSANDO">Cursando</option>
                    <option value="CONCLUÍDO">Concluído</option>
                    <option value="INTERROMPIDO">
                      Interrompido / Trancado
                    </option>
                  </select>
                  {errorsForm.status && (
                    <p className="text-[11px] text-red-500 ml-2">
                      {errorsForm.status.message}
                    </p>
                  )}
                </div>
                <Input
                  label="Ano de Conclusão"
                  type="number"
                  placeholder="Exemplo: 2024"
                  min="1950"
                  max="2050"
                  disabled={watchForm("status") !== "CONCLUÍDO"}
                  className={
                    watchForm("status") !== "CONCLUÍDO" ? "opacity-50" : ""
                  }
                  {...registerForm("data_conclusao")}
                  error={errorsForm.data_conclusao?.message}
                />
              </div>
              <div className="flex flex-col-reverse md:flex-row justify-center md:justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowFormFormacao(false)}
                  className="w-full md:w-auto px-8 py-3.5 md:py-4 font-bold text-gray-500 hover:bg-gray-50 rounded-full md:rounded-[24px] border border-transparent hover:border-gray-200"
                >
                  Cancelar
                </button>
                <ButtonType
                  type="submit"
                  disabled={isSavingForm}
                  className="w-full md:w-auto px-10 py-3.5 md:py-4 rounded-full md:rounded-[24px] shadow-lg shadow-blue-100 flex justify-center"
                >
                  {isSavingForm ? "Salvando..." : "Salvar Formação"}
                </ButtonType>
              </div>
            </form>
          )}
        </section>
      )}
    </div>
  );
}
