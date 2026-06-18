"use client";

import { useEffect, useState, use, useCallback } from "react";
import { useRouter } from "next/navigation";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
  HiOutlineArrowLeft,
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineClock,
  HiOutlineCurrencyDollar,
  HiOutlineOfficeBuilding,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineGift,
  HiOutlineLightningBolt,
  HiOutlineViewList,
  HiOutlineShieldCheck,
  HiOutlineTag,
  HiOutlineTrash,
} from "react-icons/hi";

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_MAP: Record<string, any> = {
  RASCUNHO: {
    label: "Rascunho",
    color: "bg-gray-100 text-gray-600 border-gray-200",
    icon: <HiOutlineClock />,
  },
  EM_ANALISE: {
    label: "Em Moderação",
    color: "bg-amber-50 text-amber-600 border-amber-200",
    icon: <HiOutlineClock />,
  },
  REPROVADA: {
    label: "Reprovada",
    color: "bg-red-50 text-red-600 border-red-200",
    icon: <HiOutlineXCircle />,
  },
  ATIVA: {
    label: "Ativa (Pública)",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    icon: <HiOutlineCheckCircle />,
  },
  PAUSADA: {
    label: "Pausada pela Empresa",
    color: "bg-blue-50 text-primary border-blue-200",
    icon: <HiOutlineClock />,
  },
  ENCERRADA: {
    label: "Encerrada",
    color: "bg-gray-200 text-gray-500 border-gray-300",
    icon: <HiOutlineTrash />,
  },
  AGUARDANDO_PAGAMENTO: {
    label: "Aguardando Pagamento",
    color: "bg-purple-50 text-purple-600 border-purple-200",
    icon: <HiOutlineCurrencyDollar />,
  },
};

export default function AdminDetalhesVagaPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const idVaga = resolvedParams.id;
  const router = useRouter();

  const [vaga, setVaga] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Controle do fluxo de reprovação direto no painel
  const [campoReprovarAberto, setCampoReprovarAberto] = useState(false);
  const [motivoReprovacao, setMotivoReprovacao] = useState("");

  const carregarVaga = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get(`/admin/vagas/${idVaga}`);
      setVaga(res.data.data || res.data);
    } catch (error) {
      toast.error("Erro ao carregar os detalhes da vaga.");
      router.push("/admin/vagas");
    } finally {
      setIsLoading(false);
    }
  }, [idVaga, router]);

  useEffect(() => {
    if (idVaga) carregarVaga();
  }, [idVaga, carregarVaga]);

  // Processamento de Ações de Moderação
  const handleModeracao = async (acao: "APROVAR" | "REPROVAR") => {
    if (acao === "REPROVAR" && motivoReprovacao.trim().length < 5) {
      toast.error(
        "Por favor, informe uma justificativa válida de pelo menos 5 caracteres.",
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await api.patch(`/admin/vagas/${idVaga}/moderacao`, {
        acao,
        motivo: acao === "REPROVAR" ? motivoReprovacao.trim() : undefined,
      });

      toast.success(
        acao === "APROVAR"
          ? "Vaga aprovada com sucesso!"
          : "Vaga reprovada e empresa notificada.",
      );
      setCampoReprovarAberto(false);
      carregarVaga();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Erro ao processar moderação.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmarPagamento = async () => {
    setIsSubmitting(true);
    try {
      await api.patch(`/admin/vagas/${idVaga}/confirmar-pagamento`);
      toast.success("Pagamento confirmado e fluxo atualizado!");
      carregarVaga();
    } catch (error: any) {
      toast.error(
        error.response?.data?.error || "Erro ao confirmar pagamento.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 font-bold animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        Carregando dados da oportunidade...
      </div>
    );
  }

  if (!vaga) return null;

  // Formatação de Salário com base nas regras do modelo
  const formatarSalario = () => {
    if (vaga.ocultar_salario) return "Oculto para Candidatos";
    if (vaga.salario_a_combinar) return "A Combinar";
    if (vaga.faixa_salarial_de || vaga.faixa_salarial_ate) {
      const de = vaga.faixa_salarial_de
        ? Number(vaga.faixa_salarial_de).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        : "";
      const ate = vaga.faixa_salarial_ate
        ? Number(vaga.faixa_salarial_ate).toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL",
          })
        : "";
      return de && ate
        ? `${de} até ${ate}`
        : de
          ? `A partir de ${de}`
          : `Até ${ate}`;
    }
    return "Não Informado";
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 md:px-8 space-y-6 animate-in fade-in duration-500">
      {/* ================= BARRA SUPERIOR ================= */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => router.push("/admin/vagas")}
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md"
        >
          <HiOutlineArrowLeft size={18} /> Voltar para a fila
        </button>

        <div
          className={`px-4 py-2 border rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-1.5 ${STATUS_MAP[vaga.status]?.color}`}
        >
          {STATUS_MAP[vaga.status]?.icon}
          {STATUS_MAP[vaga.status]?.label}
        </div>
      </div>

      {/* ================= CONTAINER EM COLA DE GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LADO ESQUERDO: CONTEÚDO INTEGRAL DA VAGA (65%) */}
        <div className="lg:col-span-8 space-y-6 md:space-y-8">
          {/* Corpo do Post (Informações Gerais) */}
          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>

            <div className="space-y-2 relative z-10">
              <span className="text-[10px] font-black tracking-widest bg-blue-50 text-blue-700 px-3 py-1 rounded-md uppercase">
                {vaga.tipo_contrato?.replace("_", " ")}
              </span>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-tight">
                {vaga.titulo}
              </h1>
            </div>

            {/* Metadados Escaneáveis */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-50 text-sm font-bold text-gray-600">
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <HiOutlineBriefcase /> Nível
                </span>
                <p className="text-gray-800 font-black">
                  {vaga.nivel_hierarquico?.replace("_", " ")}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <HiOutlineOfficeBuilding /> Modelo
                </span>
                <p className="text-gray-800 font-black">
                  {vaga.modelo_trabalho}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <HiOutlineLocationMarker /> Cidade
                </span>
                <p className="text-gray-800 font-black">
                  {vaga.endereco?.cidade || "Não definido"}
                </p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 flex items-center gap-1">
                  <HiOutlineCurrencyDollar /> Remuneração
                </span>
                <p className="text-gray-800 font-black truncate">
                  {formatarSalario()}
                </p>
              </div>
            </div>

            {vaga.tipo_diversidade !== "AMPLA_CONCORRENCIA" && (
              <div className="p-4 bg-purple-50 text-purple-700 border border-purple-100 rounded-2xl text-xs font-bold uppercase tracking-wide">
                Ação Afirmativa / Vaga Configurada como:{" "}
                <span className="font-black text-purple-900">
                  {vaga.tipo_diversidade?.replace("_", " ")}
                </span>
              </div>
            )}
          </div>

          {/* Textos Descritivos Longos (Quem Somos, Descrição, Atividades) */}
          <div className="bg-white p-8 md:p-10 rounded-[40px] border border-gray-100 shadow-sm space-y-8">
            <div>
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>{" "}
                Descrição da Oportunidade
              </h3>
              <div
                className="rich-text text-gray-600 leading-relaxed text-sm whitespace-pre-wrap"
                dangerouslySetInnerHTML={{ __html: vaga.descricao }}
              />
            </div>

            {vaga.responsabilidades && (
              <div className="pt-6 border-t border-gray-50">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>{" "}
                  Responsabilidades e Atividades
                </h3>
                <div
                  className="rich-text text-gray-600 leading-relaxed text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: vaga.responsabilidades }}
                />
              </div>
            )}

            {vaga.requisitos_obrigatorios && (
              <div className="pt-6 border-t border-gray-50">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-red-500 rounded-full"></span>{" "}
                  Requisitos Obrigatórios
                </h3>
                <div
                  className="rich-text text-gray-600 leading-relaxed text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{
                    __html: vaga.requisitos_obrigatorios,
                  }}
                />
              </div>
            )}

            {vaga.diferenciais && (
              <div className="pt-6 border-t border-gray-50">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-emerald-500 rounded-full"></span>{" "}
                  Diferenciais (Desejável)
                </h3>
                <div
                  className="rich-text text-gray-600 leading-relaxed text-sm whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ __html: vaga.diferenciais }}
                />
              </div>
            )}
          </div>

          {/* Taxonomias vinculadas (Benefícios e Competências) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Benefícios */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <HiOutlineGift size={18} className="text-blue-500" /> Benefícios
                Oferecidos
              </h3>
              <div className="flex flex-wrap gap-2 content-start flex-1">
                {vaga.beneficios?.length > 0 ? (
                  vaga.beneficios.map((b: any, index: number) => (
                    <span
                      key={index}
                      className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-xl"
                    >
                      {b.beneficio?.descricao || b.descricao}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic py-2">
                    Nenhum benefício extra listado.
                  </p>
                )}
              </div>
            </div>

            {/* Competências técnicas */}
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                <HiOutlineLightningBolt size={18} className="text-purple-500" />{" "}
                Habilidades Desejadas
              </h3>
              <div className="flex flex-wrap gap-2 content-start flex-1">
                {vaga.competencias?.length > 0 ? (
                  vaga.competencias.map((c: any, index: number) => (
                    <span
                      key={index}
                      className={`text-xs font-bold border px-3 py-1.5 rounded-xl flex items-center gap-1 ${c.obrigatoria ? "bg-purple-50 border-purple-200 text-purple-700" : "bg-gray-50 border-gray-100 text-gray-600"}`}
                    >
                      {c.competencia?.nome || c.nome}
                      {c.obrigatoria && (
                        <span className="text-[8px] font-black uppercase text-purple-400 bg-white px-1 border border-purple-200 rounded-sm ml-1">
                          Obrigatório
                        </span>
                      )}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-gray-400 italic py-2">
                    Nenhuma competência vinculada.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Funil de Etapas configurado pela empresa */}
          {vaga.etapas?.length > 0 && (
            <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
              <h3 className="text-xs font-black text-gray-900 uppercase tracking-widest mb-5 flex items-center gap-2">
                <HiOutlineViewList size={18} className="text-gray-400" /> Fluxo
                do Funil de Candidatura
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {vaga.etapas
                  .sort((a: any, b: any) => a.ordem - b.ordem)
                  .map((etapa: any, idx: number) => (
                    <div
                      key={etapa.id_etapa || idx}
                      className="flex items-center gap-2"
                    >
                      <div
                        className={`px-4 py-2 rounded-xl text-xs font-bold border shadow-sm ${etapa.tipo === "INICIAL" ? "bg-gray-50 border-gray-200 text-gray-600" : etapa.tipo === "FINAL" ? "bg-emerald-50 border-emerald-100 text-emerald-800 font-black" : "bg-blue-50 border-blue-100 text-blue-800"}`}
                      >
                        {etapa.nome_etapa}
                        {etapa.requer_agendamento && (
                          <span className="text-[8px] block font-black text-purple-500 uppercase tracking-wider mt-0.5">
                            Requer Agendamento
                          </span>
                        )}
                      </div>
                      {idx < vaga.etapas.length - 1 && (
                        <span className="text-gray-300 font-bold">&rarr;</span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>

        {/* ================================================== */}
        {/* LADO DIREITO: MODERAÇÃO & INFORMAÇÕES DA EMPRESA (35%) */}
        {/* ================================================== */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-8">
          {/* PAINEL DE MODERAÇÃO DINÂMICO */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-xl overflow-hidden">
            <div className="bg-gray-900 p-5 text-white text-center">
              <h3 className="text-sm font-black uppercase tracking-wider">
                Mesa de Moderação
              </h3>
              <p className="text-[11px] text-gray-400 font-medium mt-1">
                Status da Fila:{" "}
                <span className="text-white font-black">{vaga.status}</span>
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Fluxo 1: Vaga aguardando liberação técnica (Aprovar / Reprovar) */}
              {vaga.status === "EM_ANALISE" && !campoReprovarAberto && (
                <div className="grid grid-cols-1 gap-2.5 animate-in fade-in">
                  <button
                    onClick={() => handleModeracao("APROVAR")}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black text-sm transition-colors shadow-md shadow-emerald-500/10 flex items-center justify-center gap-2"
                  >
                    <HiOutlineCheckCircle size={18} /> Aprovar Publicação
                  </button>
                  <button
                    onClick={() => setCampoReprovarAberto(true)}
                    disabled={isSubmitting}
                    className="w-full py-3.5 border-2 border-red-200 hover:bg-red-50 text-red-600 rounded-2xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <HiOutlineXCircle size={18} /> Reprovar Vaga
                  </button>
                </div>
              )}

              {/* Fluxo 2: Formulário interno de Reprovação */}
              {campoReprovarAberto && (
                <div className="space-y-4 animate-in slide-in-from-top-2">
                  <div>
                    <label className="text-[10px] font-black text-red-800 uppercase tracking-widest block mb-2">
                      Motivo do Indeferimento
                    </label>
                    <textarea
                      value={motivoReprovacao}
                      onChange={(e) => setMotivoReprovacao(e.target.value)}
                      placeholder="Explique de forma clara para a empresa o que precisa ser corrigido (ex: Erros de digitação, salário incoerente...)"
                      className="w-full p-3 bg-red-50/20 border border-red-200 rounded-2xl h-36 outline-none text-xs font-medium text-gray-700 placeholder:text-red-300 resize-none focus:ring-2 focus:ring-red-400/10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setCampoReprovarAberto(false)}
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-500"
                    >
                      Voltar
                    </button>
                    <button
                      onClick={() => handleModeracao("REPROVAR")}
                      disabled={isSubmitting}
                      className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-md shadow-red-600/10 flex items-center justify-center"
                    >
                      {isSubmitting ? "Gravando..." : "Confirmar"}
                    </button>
                  </div>
                </div>
              )}

              {/* Fluxo 3: Vaga Aguardando Pagamento */}
              {vaga.status === "AGUARDANDO_PAGAMENTO" && (
                <div className="space-y-3 animate-in fade-in">
                  <p className="text-xs font-medium text-gray-500 text-center leading-relaxed">
                    Esta vaga foi aprovada na moderação técnica, mas a empresa
                    precisa realizar a compensação do crédito.
                  </p>
                  <button
                    onClick={handleConfirmarPagamento}
                    disabled={isSubmitting}
                    className="w-full py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-2xl font-black text-sm transition-colors shadow-md shadow-purple-600/20 flex items-center justify-center gap-2"
                  >
                    <HiOutlineCurrencyDollar size={18} /> Confirmar Pagamento
                    Manual
                  </button>
                </div>
              )}

              {/* Histórico de Reprovação Anterior */}
              {vaga.status === "REPROVADA" && vaga.observacoes_admin && (
                <div className="p-4 bg-red-50/50 border border-red-100 rounded-2xl text-xs text-red-700 font-medium">
                  <strong className="block text-red-800 mb-1 flex items-center gap-1">
                    <HiOutlineXCircle /> Justificativa Aplicada:
                  </strong>
                  "{vaga.observacoes_admin}"
                </div>
              )}

              {/* Casos Passivos (Ativa, Pausada, Encerrada) */}
              {vaga.status !== "EM_ANALISE" &&
                vaga.status !== "AGUARDANDO_PAGAMENTO" && (
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-center text-xs text-gray-400 font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                    <HiOutlineShieldCheck size={16} /> Nenhuma ação pendente
                  </div>
                )}
            </div>
          </div>

          {/* CARD DA EMPRESA EMITENTE */}
          <div className="bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-4">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
              <HiOutlineOfficeBuilding size={14} /> Empresa Emitente
            </h4>

            <div className="flex items-center gap-3">
              {vaga.empresa?.logotipo_url ? (
                <img
                  src={vaga.empresa.logotipo_url}
                  alt="Logo"
                  className="w-12 h-12 rounded-xl object-contain border border-gray-100 bg-gray-50"
                />
              ) : (
                <div className="w-12 h-12 bg-blue-50 text-blue-600 font-black rounded-xl flex items-center justify-center border border-blue-100">
                  {vaga.empresa?.nome_fantasia?.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-black text-gray-800 text-sm truncate">
                  {vaga.empresa?.nome_fantasia}
                </p>
                <p className="text-[10px] font-bold text-gray-400 tracking-wider font-mono mt-0.5">
                  {vaga.empresa?.cnpj}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-50 text-xs font-bold text-gray-600 space-y-1.5">
              <p>
                Razão Social:{" "}
                <span className="font-normal text-gray-500">
                  {vaga.empresa?.razao_social}
                </span>
              </p>
              <p>
                Associação:{" "}
                <span
                  className={`font-black uppercase tracking-wider text-[10px] ${vaga.empresa?.tipo_vinculo_aci === "ASSOCIADA" ? "text-emerald-600" : "text-gray-400"}`}
                >
                  {vaga.empresa?.tipo_vinculo_aci}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
