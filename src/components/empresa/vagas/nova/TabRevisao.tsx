"use client";

import { useFormContext } from "react-hook-form";
import {
  HiOutlineClipboardList,
  HiOutlineExclamationCircle,
  HiOutlineUpload,
  HiOutlineCheckCircle,
  HiOutlineXCircle,
  HiOutlineCalendar,
} from "react-icons/hi";
import { ButtonType } from "@/src/components/ButtonType";
import { VagaFormData } from "@/src/schemas/vagaSchemas";
import { AlertaPagamentoNaoAssociada } from "./StepRevisao";

interface TabRevisaoProps {
  isPublishing: boolean;
}

// Dicionários para traduzir as constantes do sistema para português legível
const dicionarioContrato: any = {
  CLT_EFETIVO: "CLT (Efetivo)",
  CLT_TEMPORARIO: "CLT (Temporário)",
  CLT_INTERMITENTE: "CLT (Intermitente)",
  PJ: "Pessoa Jurídica (PJ)",
  AUTONOMO: "Autônomo",
  FREELANCE: "Freelancer",
  ESTAGIO: "Estágio",
  JOVEM_APRENDIZ: "Jovem Aprendiz",
  COOPERADO: "Cooperado",
  OUTROS: "Outros",
};

const dicionarioNivel: any = {
  JOVEM_APRENDIZ: "Jovem Aprendiz",
  ESTAGIO: "Estágio",
  TRAINEE: "Trainee",
  OPERACIONAL: "Operacional",
  ASSISTENTE: "Assistente",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
  ESPECIALISTA: "Especialista",
  SUPERVISAO: "Supervisão",
  GERENCIA: "Gerência",
  DIRETORIA: "Diretoria",
  NAO_SE_APLICA: "Não se aplica",
};

export default function TabRevisao({ isPublishing }: TabRevisaoProps) {
  const {
    watch,
    formState: { isValid },
  } = useFormContext<VagaFormData>();

  const valoresAtuais = watch();

  const checkDescricao = () =>
    !!(
      (valoresAtuais.descricao || "").length > 15 &&
      (valoresAtuais.responsabilidades || "").length > 10 &&
      valoresAtuais.cidade
    );

  const checkEtapas = () =>
    !!valoresAtuais.etapas?.every((e) => e.nome.length > 1);

  return (
    <section className="bg-white p-6 md:p-10 rounded-[32px] md:rounded-[48px] border border-gray-100 shadow-sm space-y-8 animate-in slide-in-from-bottom-4">
      {/* HEADER DA REVISÃO */}
      <div className="text-center space-y-2">
        <div
          className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 shadow-sm border-4 border-white transition-colors ${isValid
              ? "bg-emerald-100 text-emerald-500"
              : "bg-red-100 text-red-500"
            }`}
        >
          {isValid ? (
            <HiOutlineClipboardList size={36} />
          ) : (
            <HiOutlineExclamationCircle size={36} />
          )}
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-gray-800">
          {isValid
            ? "Tudo pronto para envio!"
            : "Faltam informações obrigatórias"}
        </h2>
        <p className="text-sm text-gray-500 max-w-md mx-auto">
          {isValid
            ? "Revise os detalhes essenciais da vaga abaixo. Se estiver tudo certo, clique no botão final para enviar para nossa equipe."
            : "Existem campos obrigatórios em branco nas abas anteriores. Corrija-os para liberar o botão de publicação."}
        </p>
      </div>

      {/* PAINEL DE RESUMO DA VAGA */}
      <div className="bg-gray-50 rounded-[24px] p-6 md:p-8 border border-gray-200 space-y-8">
        {/* Bloco 1: Identificação Básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              Título Principal
            </p>
            <p
              className={`text-lg font-black ${valoresAtuais.titulo ? "text-gray-800" : "text-red-500"}`}
            >
              {valoresAtuais.titulo || "Sem título definido"}
            </p>
            {valoresAtuais.empresa_confidencial && (
              <span className="inline-block px-2 py-0.5 bg-gray-200 text-gray-600 text-[10px] font-bold rounded mt-1">
                Publicação Confidencial (Nome Oculto)
              </span>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              Localização Base
            </p>
            <p
              className={`text-lg font-black ${valoresAtuais.cidade ? "text-gray-800" : "text-red-500"}`}
            >
              {valoresAtuais.cidade
                ? `${valoresAtuais.cidade} - ${valoresAtuais.uf}`
                : "Não informada"}
            </p>
          </div>
        </div>

        {/* Bloco 2: Tags de Contratação */}
        <div className="space-y-2">
          <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
            Formato de Contratação
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1.5 bg-blue-100 text-blue-800 text-xs font-bold rounded-lg border border-blue-200">
              {valoresAtuais.modelo_trabalho}
            </span>
            <span className="px-3 py-1.5 bg-indigo-100 text-indigo-800 text-xs font-bold rounded-lg border border-indigo-200">
              {dicionarioContrato[valoresAtuais.tipo_contrato] ||
                valoresAtuais.tipo_contrato}
            </span>
            <span className="px-3 py-1.5 bg-purple-100 text-purple-800 text-xs font-bold rounded-lg border border-purple-200">
              {dicionarioNivel[valoresAtuais.nivel_hierarquico] ||
                valoresAtuais.nivel_hierarquico}
            </span>
            {valoresAtuais.id_area_atuacao === 0 && (
              <span className="px-3 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-lg border border-red-200 flex items-center gap-1">
                <HiOutlineExclamationCircle /> Área Pendente
              </span>
            )}
          </div>
        </div>

        <hr className="border-gray-200" />

        {/* Bloco 3: Textos e Diversidade */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              Textos e Descrições
            </p>
            <div
              className={`flex items-center gap-2 text-sm font-bold ${checkDescricao() ? "text-emerald-600" : "text-red-500"}`}
            >
              {checkDescricao() ? (
                <HiOutlineCheckCircle size={20} />
              ) : (
                <HiOutlineXCircle size={20} />
              )}
              {checkDescricao()
                ? "Módulos de texto preenchidos"
                : "Faltam textos obrigatórios (Aba Detalhes)"}
            </div>

            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest pt-2">
              Política de Diversidade
            </p>
            <p className="text-sm font-bold text-gray-700">
              {valoresAtuais.tipo_diversidade === "AMPLA_CONCORRENCIA" &&
                "Ampla Concorrência (Vaga Padrão)"}
              {valoresAtuais.tipo_diversidade === "VAGA_INCLUSIVA" &&
                "Vaga Inclusiva (Ambiente Adaptado)"}
              {valoresAtuais.tipo_diversidade === "EXCLUSIVA_PCD" &&
                "Vaga de Ação Afirmativa (Exclusiva PcD)"}
            </p>
          </div>

          <div className="space-y-3">
            <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">
              Configurações Especiais
            </p>

            {valoresAtuais.data_encerramento && (
              <div className="flex items-start gap-2 text-sm text-gray-700 font-medium bg-white p-3 rounded-xl border border-gray-100">
                <HiOutlineCalendar
                  className="text-blue-500 shrink-0 mt-0.5"
                  size={18}
                />
                <div>
                  <span className="font-bold block">
                    Fechamento Automático:
                  </span>
                  Encerra dia{" "}
                  {new Date(
                    `${valoresAtuais.data_encerramento}T12:00:00`,
                  ).toLocaleDateString("pt-BR")}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1 text-sm text-gray-700 font-medium bg-white p-3 rounded-xl border border-gray-100">
              <span className="font-bold text-emerald-600 text-xs uppercase tracking-widest">
                Funil de Etapas configurado:
              </span>
              <span className="text-xs text-gray-500">
                1. Inscritos &rarr;{" "}
                {valoresAtuais.etapas
                  ?.map((e: any) => e.nome)
                  .join(" \u2192 ")}{" "}
                {valoresAtuais.etapas?.length ? "\u2192" : ""} Aprovados
              </span>
              {!checkEtapas() && (
                <span className="text-xs font-bold text-red-500 flex items-center gap-1 mt-1">
                  <HiOutlineExclamationCircle /> Você deixou nomes de etapas
                  em branco!
                </span>
              )}
            </div>
          </div>

        </div>
        <AlertaPagamentoNaoAssociada />
      </div>

      {/* BOTÃO DE SUBMISSÃO (Só é ativado se isValid for true) */}
      <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center items-center">
        <ButtonType
          type="submit"
          disabled={isPublishing || !isValid}
          className="w-full sm:w-auto px-10 py-5 rounded-full text-base shadow-xl flex items-center justify-center gap-2 transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          <HiOutlineUpload size={20} />{" "}
          {isPublishing
            ? "Enviando para o portal..."
            : "Enviar Vaga para Publicação"}
        </ButtonType>
      </div>
    </section>
  );
}