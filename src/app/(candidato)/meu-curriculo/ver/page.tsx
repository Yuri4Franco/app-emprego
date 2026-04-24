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

// Dicionário para traduzir o Enum do banco para a tela
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

  // Criamos a referência com a tipagem genérica para a div
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

  // 1. Movemos a criação das variáveis para cá (usando ? para não quebrar se dados for null)
  const nome = dados?.usuario?.nome || dados?.nome || "Candidato";
  const objetivo =
    dados?.objetivo_profissional || "Em busca de novas oportunidades";

  // 2. Chamamos o Hook ANTES dos "if" de retorno
  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Curriculo_${nome.replace(/\s+/g, "_")}`,
  });

  // 3. AGORA SIM, colocamos as verificações de tela!
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
    <div className="max-w-4xl mx-auto pb-20 animate-in fade-in duration-700">
      {/* BARRA DE AÇÕES (Oculta na impressão) */}
      <div className="flex items-center justify-between mb-8 print:hidden">
        <Link
          href="/meu-curriculo"
          className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-colors bg-white px-5 py-2.5 rounded-full border border-gray-200 shadow-sm hover:shadow-md"
        >
          <HiOutlineArrowLeft size={18} /> Voltar para Edição
        </Link>
        <button
          onClick={() => handlePrint()}
          className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 hover:-translate-y-0.5"
        >
          <HiOutlinePrinter size={20} /> Salvar PDF / Imprimir
        </button>
      </div>

      {/* A FOLHA DO CURRÍCULO */}
      <div
        ref={componentRef}
        className="bg-white rounded-[40px] md:p-14 p-8 shadow-sm border border-gray-100 print:shadow-none print:border-none print:m-0 print:p-8"
      >
        {/* CABEÇALHO (Foto, Nome e Contatos) */}
        <header className="flex flex-col md:flex-row gap-8 items-start border-b-2 border-gray-50 pb-10 mb-10 print:border-gray-200 print:pb-6 print:mb-6">
          {dados.foto_url && (
            <img
              src={dados.foto_url}
              alt={nome}
              className="w-36 h-36 rounded-3xl object-cover border-4 border-gray-50 shadow-md shrink-0 print:shadow-none print:border-none"
            />
          )}

          <div className="flex-1 w-full flex flex-col justify-center h-full pt-2">
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight uppercase">
                {nome}
              </h1>
              <h2 className="text-l font-bold text-blue-500 mt-1">
                {objetivo}
              </h2>
            </div>

            {/* Grid de Contatos - Mais clean */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6 mt-6 text-sm text-gray-600 font-medium">
              {dados.usuario?.email && (
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-gray-50 rounded-lg print:p-0 print:bg-transparent">
                    <HiOutlineMail className="text-gray-500" size={16} />
                  </div>
                  {dados.usuario.email}
                </div>
              )}
              {dados.whatsapp && (
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-emerald-50 rounded-lg print:p-0 print:bg-transparent">
                    <FaWhatsapp className="text-emerald-500" size={16} />
                  </div>
                  {dados.whatsapp}
                </div>
              )}
              {dados.telefone && (
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-gray-50 rounded-lg print:p-0 print:bg-transparent">
                    <HiOutlinePhone className="text-gray-500" size={16} />
                  </div>
                  {dados.telefone}
                </div>
              )}
              {dados.endereco?.cidade && (
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-gray-50 rounded-lg print:p-0 print:bg-transparent">
                    <HiOutlineLocationMarker
                      className="text-gray-500"
                      size={16}
                    />
                  </div>
                  {dados.endereco.cidade}, {dados.endereco.uf}
                </div>
              )}
              {dados.link_linkedin && (
                <a
                  href={dados.link_linkedin}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <div className="p-1.5 bg-blue-50 rounded-lg print:p-0 print:bg-transparent">
                    <FaLinkedin className="text-blue-600" size={16} />
                  </div>
                  LinkedIn
                </a>
              )}
              {dados.link_portfolio && (
                <a
                  href={dados.link_portfolio}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <div className="p-1.5 bg-gray-50 rounded-lg print:p-0 print:bg-transparent">
                    <FaGithub className="text-gray-700" size={16} />
                  </div>
                  Portfólio / GitHub
                </a>
              )}
              {dados.link_outro && (
                <a
                  href={dados.link_outro}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2.5 text-gray-600 hover:text-blue-600 transition-colors"
                >
                  <div className="p-1.5 bg-gray-50 rounded-lg print:p-0 print:bg-transparent">
                    <HiOutlineLink className="text-gray-700" size={16} />
                  </div>
                  Outro Link
                </a>
              )}
            </div>
          </div>
        </header>

        {/* RESUMO PROFISSIONAL */}
        {dados.resumo_profissional && (
          <section className="mb-10 print:mb-8">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>{" "}
              Resumo Profissional
            </h3>
            <p className="text-gray-600 leading-relaxed text-justify whitespace-pre-wrap font-medium">
              {dados.resumo_profissional}
            </p>
          </section>
        )}

        {/* EXPERIÊNCIA PROFISSIONAL (Timeline Style) */}
        {(dados.experiencias?.length > 0 || dados.primeiro_emprego) && (
          <section className="mb-10 print:mb-8">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>{" "}
              Experiência Profissional
            </h3>

            {dados.primeiro_emprego ? (
              <div className="bg-blue-50/50 p-6 rounded-2xl border border-blue-100 print:bg-transparent print:border-none print:p-0">
                <p className="text-blue-800 font-bold flex items-center gap-2">
                  <HiOutlineLightningBolt size={20} className="text-blue-500" />
                  Em busca da primeira oportunidade profissional.
                </p>
              </div>
            ) : (
              <div className="space-y-8 pl-2">
                {dados.experiencias.map((exp: any) => (
                  <div
                    key={exp.id_experiencia}
                    className="relative pl-8 border-l-2 border-gray-100 print:border-gray-300"
                  >
                    <div className="absolute w-4 h-4 bg-white border-4 border-blue-600 rounded-full -left-2.25 top-1 print:border-gray-800"></div>

                    <div className="flex flex-col mb-3">
                      <h4 className="text-xl font-black text-gray-900">
                        {exp.cargo}
                      </h4>
                      <p className="text-base font-bold text-blue-600 mb-1">
                        {exp.empresa}
                      </p>

                      <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                        <HiOutlineCalendar size={14} />
                        {new Date(exp.data_inicio).toLocaleDateString("pt-BR", {
                          month: "short",
                          year: "numeric",
                        })}
                        {" — "}
                        {exp.atual
                          ? "O Momento"
                          : new Date(exp.data_fim).toLocaleDateString("pt-BR", {
                              month: "short",
                              year: "numeric",
                            })}
                      </span>
                    </div>

                    {exp.atividades && (
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap font-medium">
                        {exp.atividades}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* FORMAÇÃO ACADÊMICA (Timeline Style) */}
        {dados.formacoes?.length > 0 && (
          <section className="mb-10 print:mb-8">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-6 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>{" "}
              Formação Acadêmica
            </h3>

            <div className="space-y-6 pl-2">
              {dados.formacoes.map((form: any) => (
                <div
                  key={form.id_formacao}
                  className="relative pl-8 border-l-2 border-gray-100 print:border-gray-300"
                >
                  <div className="absolute w-3 h-3 bg-gray-300 rounded-full -left-1.75 top-1.5 print:bg-gray-500"></div>

                  <div className="flex flex-col">
                    <h4 className="text-lg font-black text-gray-900">
                      {form.curso}
                    </h4>
                    <p className="text-sm font-bold text-gray-600">
                      {form.instituicao}
                    </p>

                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-500 px-2.5 py-1 rounded-md print:border print:border-gray-300 print:bg-transparent">
                        {form.nivel}
                      </span>
                      <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider flex items-center gap-1">
                        <span className="w-1 h-1 rounded-full bg-blue-600 print:hidden"></span>
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

        {/* COMPETÊNCIAS / HABILIDADES */}
        {dados.competencias?.length > 0 && (
          <section className="mb-12 print:mb-8">
            <h3 className="text-lg font-black text-gray-900 uppercase tracking-widest mb-5 flex items-center gap-3">
              <span className="w-1.5 h-6 bg-blue-600 rounded-full"></span>{" "}
              Habilidades
            </h3>
            <div className="flex flex-wrap gap-3">
              {dados.competencias.map((c: any) => (
                <div
                  key={c.id_competencia}
                  className="flex flex-col justify-center px-4 py-2.5 bg-gray-50 border border-gray-100 rounded-2xl print:border-gray-300 print:bg-transparent print:border"
                >
                  <span className="text-sm font-bold text-gray-800">
                    {c.competencia?.nome}
                  </span>
                  <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest mt-0.5">
                    {c.nivel}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* INFORMAÇÕES ADICIONAIS */}
        <section className="pt-8 border-t-2 border-gray-50 print:border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Bloco de Logística */}
            <div className="bg-gray-50 p-6 rounded-3xl print:bg-transparent print:border print:border-gray-200 print:p-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                Disponibilidade
              </h4>
              <ul className="space-y-3 text-sm text-gray-700 font-medium">
                <li className="flex justify-between items-center border-b border-gray-200/60 pb-2 print:border-none print:pb-0">
                  <span className="text-gray-500">Viagens a trabalho:</span>
                  <span className="font-bold text-gray-900">
                    {dados.disponibilidade_viagem ? "Sim" : "Não"}
                  </span>
                </li>
                <li className="flex justify-between items-center border-b border-gray-200/60 pb-2 print:border-none print:pb-0">
                  <span className="text-gray-500">Mudança de cidade:</span>
                  <span className="font-bold text-gray-900">
                    {dados.disponibilidade_mudanca ? "Sim" : "Não"}
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-gray-500">Turno Preferido:</span>
                  <span className="font-bold text-gray-900">
                    {turnoLabels[dados.turno_preferido] || "Sem Preferência"}
                  </span>
                </li>
              </ul>
            </div>

            {/* Bloco de Contato e Diversidade */}
            <div className="bg-gray-50 p-6 rounded-3xl print:bg-transparent print:border print:border-gray-200 print:p-4">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-4">
                Preferências Adicionais
              </h4>
              <ul className="space-y-3 text-sm text-gray-700 font-medium">
                <li className="flex justify-between items-center border-b border-gray-200/60 pb-2 print:border-none print:pb-0">
                  <span className="text-gray-500">Contato Preferido:</span>
                  <span className="font-bold text-blue-600">
                    {contatoLabels[dados.tipo_contato] || "Qualquer canal"}
                  </span>
                </li>
                {dados.pcd && (
                  <>
                    <li className="flex justify-between items-center border-b border-gray-200/60 pb-2 print:border-none print:pb-0">
                      <span className="text-gray-500">Perfil Inclusivo:</span>
                      <span className="font-bold text-gray-900">
                        PcD ({dados.tipo_pcd})
                      </span>
                    </li>
                    {dados.necessidade && (
                      <li className="flex flex-col gap-1 mt-2">
                        <span className="text-gray-500 text-xs">
                          Necessidade para entrevista:
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
