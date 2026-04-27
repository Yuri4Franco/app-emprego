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

  if (!dados) {
    return (
      <div className="text-center py-20 text-gray-500">
        Nenhum dado encontrado. Preencha seu currículo primeiro.
      </div>
    );
  }

  return (
    <div className="max-w-4xl pt-10 mx-auto pb-20 animate-in fade-in duration-700">
      {/* BARRA DE AÇÕES (Oculta na impressão) */}
      {/* BARRA DE AÇÕES (Oculta na impressão) */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        {/* Botão Secundário: Voltar */}
        <Link
          href="/meu-curriculo"
          className="group flex items-center gap-2 text-gray-500 hover:text-primary font-bold transition-all bg-white px-6 py-3 rounded-full border border-gray-200 shadow-sm hover:shadow-md hover:border-primary/30"
        >
          <HiOutlineArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          Voltar para Edição
        </Link>

        {/* Botão Primário: Imprimir */}
        <button
          onClick={() => handlePrint()}
          className="flex items-center gap-2 bg-primary text-white px-8 py-3 rounded-full font-bold hover:opacity-90 transition-all shadow-lg shadow-primary/30 hover:-translate-y-0.5"
        >
          <HiOutlinePrinter size={20} />
          Salvar PDF / Imprimir
        </button>
      </div>

      {/* A FOLHA DO CURRÍCULO */}
      <div
        ref={componentRef}
        // print:m-0 print:p-8 tira o padding exagerado da tela e deixa uma margem segura pra folha A4
        className="bg-white rounded-[40px] md:p-14 p-8 shadow-sm border border-gray-100 print:shadow-none print:border-none print:m-0 print:p-8 print:w-full"
      >
        {/* ========================================= */}
        {/* CABEÇALHO (Foto, Nome e Contatos)         */}
        {/* ========================================= */}
        <header className="flex flex-col md:flex-row print:flex-row gap-8 lg:gap-10 items-center md:items-start border-b border-gray-100 print:border-gray-200 pb-10 mb-10 print:pb-8 print:mb-8">
          {/* FOTO: Estilo retrato clássico (Círculo) com borda fina */}
          <div className="relative shrink-0">
            {dados.foto_url ? (
              <img
                src={dados.foto_url}
                alt={nome}
                className="w-40 h-40 print:w-32 print:h-32 rounded-full object-cover border border-gray-200 shadow-sm print:shadow-none print:border-gray-300"
              />
            ) : (
              <div className="w-40 h-40 print:w-32 print:h-32 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-4xl font-black text-gray-300 shrink-0 print:border-gray-300">
                {nome.charAt(0)}
              </div>
            )}
          </div>

          <div className="flex-1 w-full text-center md:text-left pt-2">
            {/* TÍTULOS: Nome em destaque, objetivo elegante e sóbrio */}
            <div>
              <h1 className="text-4xl print:text-3xl font-black text-gray-900 tracking-tight">
                {nome}
              </h1>
              {objetivo && (
                <h2 className="text-lg print:text-base font-medium text-gray-500 mt-1.5">
                  {objetivo}
                </h2>
              )}
            </div>

            {/* CONTATOS: Estilo "Papel Timbrado" - Sem fundos coloridos, limpo e direto */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-6 gap-y-3 mt-6 pt-6 border-t border-gray-50 print:border-gray-100 text-sm print:text-xs text-gray-600 font-medium">
              {dados.usuario?.email && (
                <div className="flex items-center gap-2">
                  <HiOutlineMail
                    className="text-gray-400 print:text-gray-500"
                    size={18}
                  />
                  <span>{dados.usuario.email}</span>
                </div>
              )}

              {dados.whatsapp && (
                <div className="flex items-center gap-2">
                  <FaWhatsapp
                    className="text-gray-400 print:text-gray-500"
                    size={18}
                  />
                  <span>{dados.whatsapp}</span>
                </div>
              )}

              {dados.telefone && (
                <div className="flex items-center gap-2">
                  <HiOutlinePhone
                    className="text-gray-400 print:text-gray-500"
                    size={18}
                  />
                  <span>{dados.telefone}</span>
                </div>
              )}

              {dados.endereco?.cidade && (
                <div className="flex items-center gap-2">
                  <HiOutlineLocationMarker
                    className="text-gray-400 print:text-gray-500"
                    size={18}
                  />
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
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  <FaLinkedin
                    className="text-gray-400 print:text-gray-500"
                    size={18}
                  />
                  <span>LinkedIn</span>
                </a>
              )}

              {dados.link_portfolio && (
                <a
                  href={dados.link_portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-gray-900 transition-colors"
                >
                  <FaGithub
                    className="text-gray-400 print:text-gray-500"
                    size={18}
                  />
                  <span>Portfólio / GitHub</span>
                </a>
              )}

              {dados.link_outro && (
                <a
                  href={dados.link_outro}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 hover:text-blue-600 transition-colors"
                >
                  <HiOutlineLink
                    className="text-gray-400 print:text-gray-500"
                    size={18}
                  />
                  <span>Outro Link</span>
                </a>
              )}
            </div>
          </div>
        </header>

        {/* ========================================= */}
        {/* RESUMO PROFISSIONAL                       */}
        {/* ========================================= */}
        {dados.resumo_profissional && (
          <section className="mb-10 print:mb-6 print:break-inside-avoid">
            <h3 className="text-lg print:text-base font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 print:bg-gray-800 rounded-full"></span>{" "}
              Resumo Profissional
            </h3>
            <p className="text-gray-600 print:text-gray-800 leading-relaxed text-justify whitespace-pre-wrap font-medium print:text-sm">
              {dados.resumo_profissional}
            </p>
          </section>
        )}

        {/* ========================================= */}
        {/* EXPERIÊNCIA PROFISSIONAL                  */}
        {/* ========================================= */}
        {(dados.experiencias?.length > 0 || dados.primeiro_emprego) && (
          <section className="mb-10 print:mb-6">
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
                    // break-inside-avoid garante que a experiência não seja cortada no meio se a folha acabar
                    className="relative pl-8 border-l-2 border-gray-100 print:border-gray-300 print:break-inside-avoid"
                  >
                    <div className="absolute w-4 h-4 bg-white border-4 border-blue-600 rounded-full -left-[9px] top-1 print:border-gray-800"></div>

                    <div className="flex flex-col mb-2">
                      <h4 className="text-xl print:text-lg font-black text-gray-900">
                        {exp.cargo}
                      </h4>
                      <div className="flex flex-col md:flex-row md:items-center print:flex-row print:items-center gap-2 md:gap-4 print:gap-4 mb-2">
                        <p className="text-base print:text-sm font-bold text-blue-600 print:text-gray-800">
                          {exp.empresa}
                        </p>
                        <span className="hidden md:block print:block text-gray-300">
                          •
                        </span>
                        <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 print:text-gray-600 uppercase tracking-wider">
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
                      <p className="text-sm print:text-xs text-gray-600 print:text-gray-800 leading-relaxed whitespace-pre-wrap font-medium">
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
          <section className="mb-10 print:mb-6">
            <h3 className="text-lg print:text-base font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 print:bg-gray-800 rounded-full"></span>{" "}
              Formação Acadêmica
            </h3>

            <div className="space-y-6 print:space-y-4 pl-2">
              {dados.formacoes.map((form: any) => (
                <div
                  key={form.id_formacao}
                  className="relative pl-8 border-l-2 border-gray-100 print:border-gray-300 print:break-inside-avoid"
                >
                  <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-[7px] top-1.5 print:bg-gray-500"></div>

                  <div className="flex flex-col">
                    <h4 className="text-lg print:text-base font-black text-gray-900">
                      {form.curso}
                    </h4>
                    <p className="text-sm print:text-xs font-bold text-gray-600 print:text-gray-800">
                      {form.instituicao}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 print:bg-transparent print:border print:border-gray-300 text-gray-500 print:text-gray-800 px-2.5 py-1 rounded-md">
                        {form.nivel}
                      </span>
                      <span className="text-[11px] font-bold text-blue-600 print:text-gray-800 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-blue-600 print:bg-gray-800"></span>
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
          <section className="mb-12 print:mb-6 print:break-inside-avoid">
            <h3 className="text-lg print:text-base font-black text-gray-900 uppercase tracking-widest mb-5 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 print:bg-gray-800 rounded-full"></span>{" "}
              Habilidades
            </h3>
            <div className="flex flex-wrap gap-3">
              {dados.competencias.map((c: any) => (
                <div
                  key={c.id_competencia}
                  className="flex flex-col justify-center px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl print:border-gray-300 print:bg-transparent print:rounded-lg print:py-1 print:px-3"
                >
                  <span className="text-sm print:text-xs font-bold text-gray-800">
                    {c.competencia?.nome}
                  </span>
                  <span className="text-[10px] text-gray-400 print:text-gray-500 uppercase font-black tracking-widest mt-0.5">
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
        <section className="pt-8 border-t-2 border-gray-50 print:border-gray-200 print:break-inside-avoid">
          <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-4 print:gap-8">
            {/* Bloco de Logística */}
            <div className="bg-gray-50 p-6 rounded-3xl print:bg-transparent print:p-0">
              <h4 className="text-xs font-black text-gray-400 print:text-gray-800 uppercase tracking-widest mb-4">
                Disponibilidade
              </h4>
              <ul className="space-y-3 print:space-y-1.5 text-sm print:text-xs text-gray-700 font-medium">
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
                <li className="flex justify-between items-center">
                  <span className="text-gray-500 print:text-gray-600">
                    Turno Preferido:
                  </span>
                  <span className="font-bold text-gray-900">
                    {turnoLabels[dados.turno_preferido] || "Sem Preferência"}
                  </span>
                </li>
              </ul>
            </div>

            {/* Bloco de Contato e Diversidade */}
            <div className="bg-gray-50 p-6 rounded-3xl print:bg-transparent print:p-0">
              <h4 className="text-xs font-black text-gray-400 print:text-gray-800 uppercase tracking-widest mb-4">
                Preferências Adicionais
              </h4>
              <ul className="space-y-3 print:space-y-1.5 text-sm print:text-xs text-gray-700 font-medium">
                <li className="flex justify-between items-center border-b border-gray-200/60 print:border-none pb-2 print:pb-0">
                  <span className="text-gray-500 print:text-gray-600">
                    Contato Preferido:
                  </span>
                  <span className="font-bold text-blue-600 print:text-gray-900">
                    {contatoLabels[dados.tipo_contato] || "Qualquer canal"}
                  </span>
                </li>
                {dados.pcd && (
                  <>
                    <li className="flex justify-between items-center border-b border-gray-200/60 print:border-none pb-2 print:pb-0">
                      <span className="text-gray-500 print:text-gray-600">
                        Perfil Inclusivo:
                      </span>
                      <span className="font-bold text-gray-900">
                        PcD ({dados.tipo_pcd})
                      </span>
                    </li>
                    {dados.necessidade && (
                      <li className="flex flex-col gap-1 mt-2">
                        <span className="text-gray-500 print:text-gray-600 text-xs">
                          Necessidade p/ entrevista:
                        </span>
                        <span className="font-bold text-gray-900">
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
