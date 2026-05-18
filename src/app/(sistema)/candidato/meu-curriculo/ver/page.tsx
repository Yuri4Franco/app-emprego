"use client";

import { useEffect, useState, useRef } from "react";
import api from "@/src/services/api";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import {
  HiOutlineArrowLeft,
  HiOutlinePrinter,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineLink,
  HiOutlineCalendar,
  HiOutlineLightningBolt,
} from "react-icons/hi";
import { FaWhatsapp, FaLinkedin, FaGithub } from "react-icons/fa";

const turnoLabels: Record<string, string> = {
  QUALQUER_TURNO: "Qualquer Turno",
  HORARIO_COMERCIAL: "Horário Comercial",
  PRIMEIRO_TURNO: "1º Turno",
  SEGUNDO_TURNO: "2º Turno",
  TERCEIRO_TURNO: "3º Turno",
};

const contatoLabels: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "E-mail",
  LIGACAO: "Ligação",
  QUALQUER_UM: "Qualquer canal",
};

export default function VerCurriculoPage() {
  const [dados, setDados] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const componentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const buscarDados = async () => {
      try {
        const res = await api.get("/candidato/meu-curriculo");
        setDados(res.data.data);
      } catch (error) {
        console.error("Erro ao carregar currículo", error);
      } finally {
        setIsLoading(false);
      }
    };
    buscarDados();
  }, []);

  const nome = dados?.usuario?.nome || dados?.nome || "Candidato";
  const objetivo =
    dados?.objetivo_profissional || "Em busca de novas oportunidades";

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Curriculo_${nome.replace(/\s+/g, "_")}`,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400 font-bold animate-pulse">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
        Montando seu currículo...
      </div>
    );
  }

  // ✨ MELHORIA DE USABILIDADE: Botão de voltar caso o usuário não tenha currículo
  if (!dados) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 animate-in fade-in duration-500">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-6">
          <HiOutlinePrinter size={32} />
        </div>
        <h2 className="text-xl font-black text-gray-800 mb-2">Currículo Vazio</h2>
        <p className="text-gray-500 font-medium mb-8 max-w-md leading-relaxed">
          Não encontramos seus dados. Para visualizar e imprimir seu currículo, você precisa preenchê-lo primeiro.
        </p>
        <Link
          href="/candidato/meu-curriculo"
          className="flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-full font-bold shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:-translate-y-0.5 transition-all"
        >
          <HiOutlineArrowLeft size={20} /> Ir para o Cadastro
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl pt-10 mx-auto pb-20 animate-in fade-in duration-700 px-4 sm:px-6">
      {/* BARRA DE AÇÕES FLUTUANTE (Oculta na impressão) */}
      <div className="sticky top-4 md:top-8 z-50 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 mb-8 print:hidden bg-white/80 backdrop-blur-md p-3 md:p-4 rounded-3xl md:rounded-full border border-gray-200/80 shadow-lg shadow-gray-200/40">

        {/* Botão Secundário: Voltar */}
        <Link
          href="/candidato/meu-curriculo"
          className="group w-full sm:w-auto flex items-center justify-center gap-2 text-gray-500 hover:text-primary font-bold transition-all bg-white sm:bg-transparent px-6 py-3.5 sm:py-3 rounded-full border border-gray-200 sm:border-transparent hover:bg-white hover:border-blue-100 hover:shadow-sm"
        >
          <HiOutlineArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Voltar <span className="hidden sm:inline">para Edição</span>
        </Link>

        {/* Botão Primário: Imprimir */}
        <button
          onClick={() => handlePrint()}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary text-white px-8 py-3.5 sm:py-3 rounded-full font-black hover:bg-blue-700 transition-all shadow-md hover:shadow-xl hover:shadow-primary/20 hover:-translate-y-0.5 active:translate-y-0"
        >
          <HiOutlinePrinter size={20} />
          Salvar PDF <span className="hidden sm:inline">/ Imprimir</span>
        </button>
      </div>

      {/* A FOLHA DO CURRÍCULO */}
      <div
        ref={componentRef}
        className="bg-white rounded-[40px] md:p-14 p-6 sm:p-10 shadow-sm border border-gray-100 print:shadow-none print:border-none print:m-0 print:w-full relative"
      >
        {/* ✨ MELHORIA DE USABILIDADE: A regra @page força margens na folha A4 física */}
        <style type="text/css" media="print">
          {`
            @page { 
              size: auto; 
              margin: 15mm 15mm 15mm 15mm !important; 
            }
          `}
        </style>

        {/* ========================================= */}
        {/* CABEÇALHO (Foto, Nome e Contatos)         */}
        {/* ========================================= */}
        <header className="flex flex-col md:flex-row print:flex-row gap-6 md:gap-8 lg:gap-10 items-center md:items-start border-b border-gray-100 print:border-gray-200 pb-8 mb-8 print:pb-6 print:mb-6">
          {/* FOTO */}
          <div className="relative shrink-0">
            {dados.foto_url ? (
              <img
                src={dados.foto_url}
                alt={nome}
                className="w-28 h-28 md:w-32 md:h-32 print:w-28 print:h-28 rounded-full object-cover border border-gray-200 shadow-sm print:shadow-none print:border-gray-300"
              />
            ) : (
              <div className="w-28 h-28 md:w-32 md:h-32 print:w-28 print:h-28 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-4xl font-black text-gray-300 shrink-0 print:border-gray-300">
                {nome.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 w-full text-center md:text-left pt-2">
            {/* TÍTULOS */}
            <div>
              <h1 className="text-3xl md:text-4xl print:text-3xl font-black text-gray-900 tracking-tight">
                {nome}
              </h1>
              {objetivo && (
                <h2 className="text-base md:text-lg print:text-base font-medium text-gray-500 mt-1.5 leading-snug">
                  {objetivo}
                </h2>
              )}
            </div>

            {/* CONTATOS */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-5 gap-y-2 mt-5 pt-5 border-t border-gray-50 print:border-gray-100 text-sm print:text-[13px] text-gray-600 font-medium">
              {dados.usuario?.email && (
                <div className="flex items-center gap-1.5">
                  <HiOutlineMail className="text-gray-400 print:text-gray-500 shrink-0" size={18} />
                  <span>{dados.usuario.email}</span>
                </div>
              )}

              {dados.whatsapp && (
                <div className="flex items-center gap-1.5">
                  <FaWhatsapp className="text-gray-400 print:text-gray-500 shrink-0" size={18} />
                  <span>{dados.whatsapp}</span>
                </div>
              )}

              {dados.telefone && (
                <div className="flex items-center gap-1.5">
                  <HiOutlinePhone className="text-gray-400 print:text-gray-500 shrink-0" size={18} />
                  <span>{dados.telefone}</span>
                </div>
              )}

              {dados.endereco?.cidade && (
                <div className="flex items-center gap-1.5">
                  <HiOutlineLocationMarker className="text-gray-400 print:text-gray-500 shrink-0" size={18} />
                  <span>
                    {dados.endereco.cidade}, {dados.endereco.uf}
                  </span>
                </div>
              )}

              {dados.link_linkedin && (
                <a
                  href={dados.link_linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                >
                  <FaLinkedin className="text-gray-400 print:text-gray-500 shrink-0" size={18} />
                  <span>LinkedIn</span>
                </a>
              )}

              {dados.link_portfolio && (
                <a
                  href={dados.link_portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-gray-900 transition-colors"
                >
                  <FaGithub className="text-gray-400 print:text-gray-500 shrink-0" size={18} />
                  <span>Portfólio / GitHub</span>
                </a>
              )}

              {dados.link_outro && (
                <a
                  href={dados.link_outro}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 hover:text-blue-600 transition-colors"
                >
                  <HiOutlineLink className="text-gray-400 print:text-gray-500 shrink-0" size={18} />
                  <span className="truncate max-w-[150px]">Link Externo</span>
                </a>
              )}
            </div>
          </div>
        </header>

        {/* ========================================= */}
        {/* RESUMO PROFISSIONAL                       */}
        {/* ========================================= */}
        {dados.resumo_profissional && (
          <section className="mb-8 print:mb-6 print:break-inside-avoid">
            <h3 className="text-lg print:text-base font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 print:bg-gray-800 rounded-full"></span>{" "}
              Resumo Profissional
            </h3>
            <p className="text-gray-600 print:text-gray-800 leading-relaxed text-justify whitespace-pre-wrap font-medium text-sm md:text-base print:text-[13px]">
              {dados.resumo_profissional}
            </p>
          </section>
        )}

        {/* ========================================= */}
        {/* EXPERIÊNCIA PROFISSIONAL                  */}
        {/* ========================================= */}
        {(dados.experiencias?.length > 0 || dados.primeiro_emprego) && (
          <section className="mb-8 print:mb-6">
            <h3 className="text-lg print:text-base font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 print:bg-gray-800 rounded-full"></span>{" "}
              Experiência Profissional
            </h3>

            {dados.primeiro_emprego ? (
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 print:bg-transparent print:border-none print:p-0">
                <p className="text-blue-800 print:text-gray-800 font-bold flex items-center gap-2">
                  <HiOutlineLightningBolt
                    size={20}
                    className="text-blue-500 print:text-gray-800"
                  />
                  Em busca da primeira oportunidade profissional.
                </p>
              </div>
            ) : (
              <div className="space-y-8 print:space-y-6 pl-2">
                {dados.experiencias.map((exp: any) => (
                  <div
                    key={exp.id_experiencia}
                    className="relative pl-6 md:pl-8 border-l-2 border-gray-100 print:border-gray-300 print:break-inside-avoid"
                  >
                    <div className="absolute w-4 h-4 bg-white border-4 border-blue-600 rounded-full -left-[9px] top-1 print:border-gray-800"></div>

                    <div className="flex flex-col mb-2">
                      <h4 className="text-lg md:text-xl print:text-base font-black text-gray-900 leading-snug">
                        {exp.cargo}
                      </h4>
                      <div className="flex flex-col md:flex-row md:items-center print:flex-row print:items-center gap-1 md:gap-3 print:gap-3 mt-1 mb-2">
                        <p className="text-sm md:text-base print:text-[13px] font-bold text-blue-600 print:text-gray-800">
                          {exp.empresa}
                        </p>
                        <span className="hidden md:block print:block text-gray-300">
                          •
                        </span>
                        <span className="flex items-center gap-1.5 text-[11px] md:text-xs font-bold text-gray-400 print:text-gray-600 uppercase tracking-wider">
                          <HiOutlineCalendar size={14} />
                          {new Date(exp.data_inicio).toLocaleDateString(
                            "pt-BR",
                            { month: "short", year: "numeric" },
                          )}
                          {" — "}
                          {exp.atual
                            ? "O Momento"
                            : new Date(exp.data_fim).toLocaleDateString(
                              "pt-BR",
                              { month: "short", year: "numeric" },
                            )}
                        </span>
                      </div>
                    </div>

                    {exp.atividades && (
                      <p className="text-sm print:text-[13px] text-gray-600 print:text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
                        {exp.atividades}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ========================================= */}
        {/* FORMAÇÃO ACADÊMICA                        */}
        {/* ========================================= */}
        {dados.formacoes?.length > 0 && (
          <section className="mb-8 print:mb-6">
            <h3 className="text-lg print:text-base font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 print:bg-gray-800 rounded-full"></span>{" "}
              Formação Acadêmica
            </h3>

            <div className="space-y-6 print:space-y-4 pl-2">
              {dados.formacoes.map((form: any) => (
                <div
                  key={form.id_formacao}
                  className="relative pl-6 md:pl-8 border-l-2 border-gray-100 print:border-gray-300 print:break-inside-avoid"
                >
                  <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7px] top-1.5 print:bg-gray-500"></div>

                  <div className="flex flex-col">
                    <h4 className="text-base md:text-lg print:text-[15px] font-black text-gray-900 leading-snug">
                      {form.curso}
                    </h4>
                    <p className="text-sm print:text-[13px] font-bold text-gray-600 print:text-gray-800 mt-0.5">
                      {form.instituicao}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 print:bg-transparent print:border print:border-gray-300 text-gray-500 print:text-gray-800 px-2 py-1 rounded-md">
                        {form.nivel}
                      </span>
                      <span className="text-[10px] md:text-[11px] font-bold text-blue-600 print:text-gray-800 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-blue-600 print:bg-gray-800 hidden sm:inline-block"></span>
                        {form.status}{" "}
                        {form.data_conclusao
                          ? `(${new Date(form.data_conclusao).getFullYear()})`
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================= */}
        {/* HABILIDADES E COMPETÊNCIAS                */}
        {/* ========================================= */}
        {dados.competencias?.length > 0 && (
          <section className="mb-10 print:mb-6 print:break-inside-avoid">
            <h3 className="text-lg print:text-base font-black text-gray-900 uppercase tracking-widest mb-5 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 print:bg-gray-800 rounded-full"></span>{" "}
              Habilidades
            </h3>
            <div className="flex flex-wrap gap-2 md:gap-3">
              {dados.competencias.map((c: any) => (
                <div
                  key={c.id_competencia}
                  className="flex flex-col justify-center px-3 md:px-4 py-2 bg-blue-50/50 border border-blue-100 text-blue-800 rounded-2xl print:border-gray-300 print:bg-transparent print:text-gray-800 print:rounded-lg print:py-1 print:px-2.5"
                >
                  <span className="text-xs md:text-sm print:text-[11px] font-bold">
                    {c.competencia?.nome}
                  </span>
                  <span className="text-[9px] md:text-[10px] text-blue-500/70 print:text-gray-500 uppercase font-black tracking-widest mt-0.5">
                    {c.nivel}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ========================================= */}
        {/* INFORMAÇÕES ADICIONAIS (LOGÍSTICA)        */}
        {/* ========================================= */}
        <section className="pt-6 md:pt-8 border-t-2 border-gray-50 print:border-gray-200 print:break-inside-avoid">
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 md:gap-6 print:gap-8">

            {/* Bloco de Logística */}
            <div className="bg-gray-50 p-5 md:p-6 rounded-3xl print:bg-transparent print:p-0">
              <h4 className="text-[11px] md:text-xs font-black text-gray-400 print:text-gray-800 uppercase tracking-widest mb-4">
                Disponibilidade & Logística
              </h4>
              <ul className="space-y-3 print:space-y-1.5 text-xs md:text-sm print:text-[11px] text-gray-700 font-medium">
                <li className="flex justify-between items-center border-b border-gray-200/60 print:border-none pb-2 print:pb-0">
                  <span className="text-gray-500 print:text-gray-600">
                    Carteira de Habilitação:
                  </span>
                  <span className="font-bold text-gray-900 text-right max-w-[140px] md:max-w-[200px] truncate">
                    {dados.cnh &&
                      dados.cnh.length > 0 &&
                      !dados.cnh.includes("NAO_POSSUO")
                      ? dados.cnh.join(", ")
                      : "Não possui"}
                  </span>
                </li>

                <li className="flex justify-between items-center border-b border-gray-200/60 print:border-none pb-2 print:pb-0">
                  <span className="text-gray-500 print:text-gray-600">
                    Trabalho aos sábados:
                  </span>
                  <span className="font-bold text-gray-900">
                    {dados.disponibilidade_sabados ? "Sim" : "Não"}
                  </span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-200/60 print:border-none pb-2 print:pb-0">
                  <span className="text-gray-500 print:text-gray-600">
                    Viagens a trabalho:
                  </span>
                  <span className="font-bold text-gray-900">
                    {dados.disponibilidade_viagem ? "Sim" : "Não"}
                  </span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-200/60 print:border-none pb-2 print:pb-0">
                  <span className="text-gray-500 print:text-gray-600">
                    Mudança de cidade:
                  </span>
                  <span className="font-bold text-gray-900">
                    {dados.disponibilidade_mudanca ? "Sim" : "Não"}
                  </span>
                </li>
                <li className="flex justify-between items-start print:items-center print:border-none pt-1 print:pt-0 gap-3">
                  <span className="text-gray-500 print:text-gray-600 shrink-0">
                    Turno Preferido:
                  </span>
                  <span className="font-bold text-gray-900 text-right leading-snug break-words">
                    {Array.isArray(dados.turno_preferido) &&
                      dados.turno_preferido.length > 0
                      ? dados.turno_preferido
                        .map((t: string) => turnoLabels[t] || t)
                        .join(", ")
                      : "Sem Preferência"}
                  </span>
                </li>
              </ul>
            </div>

            {/* Bloco de Contato e Diversidade */}
            <div className="bg-gray-50 p-5 md:p-6 rounded-3xl print:bg-transparent print:p-0 mt-2 md:mt-0">
              <h4 className="text-[11px] md:text-xs font-black text-gray-400 print:text-gray-800 uppercase tracking-widest mb-4">
                Preferências Adicionais
              </h4>
              <ul className="space-y-3 print:space-y-1.5 text-xs md:text-sm print:text-[11px] text-gray-700 font-medium">
                <li className="flex justify-between items-center border-b border-gray-200/60 print:border-none pb-2 print:pb-0">
                  <span className="text-gray-500 print:text-gray-600">
                    Canal de contato:
                  </span>
                  <span className="font-bold text-blue-600 print:text-gray-900 text-right max-w-[140px] md:max-w-[200px] truncate">
                    {Array.isArray(dados.tipo_contato) &&
                      dados.tipo_contato.length > 0
                      ? dados.tipo_contato
                        .map((t: string) => contatoLabels[t] || t)
                        .join(", ")
                      : "Qualquer canal"}
                  </span>
                </li>
                {dados.pcd && (
                  <>
                    <li className="flex justify-between items-center border-b border-gray-200/60 print:border-none pb-2 print:pb-0">
                      <span className="text-gray-500 print:text-gray-600">
                        Perfil Inclusivo:
                      </span>
                      <span className="font-bold text-gray-900 truncate max-w-[120px]">
                        PcD ({dados.tipo_pcd})
                      </span>
                    </li>
                    {dados.necessidade && (
                      <li className="flex flex-col gap-1 mt-2 print:mt-1">
                        <span className="text-gray-500 print:text-gray-600 text-[11px] md:text-xs">
                          Necessidade p/ entrevista:
                        </span>
                        <span className="font-bold text-gray-900 leading-snug">
                          {dados.necessidade}
                        </span>
                      </li>
                    )}
                  </>
                )}
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}