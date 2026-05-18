"use client";

import Image from "next/image";
import {
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineGlobeAlt,
  HiOutlineAcademicCap,
  HiOutlineCalendar,
  HiOutlineInformationCircle,
  HiOutlineExternalLink,
} from "react-icons/hi";
import { FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";
import logoDefault from "@/src/assets/default/logo.webp";
import bannerDefault from "@/src/assets/default/banner.webp";

interface VagaDetalhesContentProps {
  vaga: any;
  botaoAcao: React.ReactNode;
}

const DICIONARIO: any = {
  modelos: {
    PRESENCIAL: "Presencial",
    HIBRIDO: "Híbrido",
    REMOTO: "Remoto",
  },
  contratos: {
    CLT_EFETIVO: "CLT (Efetivo)",
    CLT_TEMPORARIO: "CLT (Temporário)",
    CLT_INTERMITENTE: "CLT (Intermitente)",
    PJ: "Pessoa Jurídica (PJ)",
    AUTONOMO: "Autônomo",
    FREELANCE: "Freelance",
    ESTAGIO: "Estágio",
    JOVEM_APRENDIZ: "Jovem Aprendiz",
    COOPERADO: "Cooperado",
    OUTROS: "Outros",
  },
  niveis: {
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
    NAO_SE_APLICA: "Não se Aplica",
  },
};

const formatSocialUrl = (base: string, url: string) => {
  if (!url) return "#";
  if (url.startsWith("http")) return url;
  return `${base}${url.replace("@", "")}`;
};

export default function VagaDetalhesContent({
  vaga,
  botaoAcao,
}: VagaDetalhesContentProps) {
  const isConfidencial = vaga.empresa_confidencial;
  const empresa = isConfidencial ? null : vaga.empresa;

  const nomeEmpresa = isConfidencial
    ? "Empresa Confidencial"
    : empresa?.nome_fantasia;
  const logotipo =
    isConfidencial || !empresa?.logotipo_url
      ? logoDefault
      : empresa.logotipo_url;
  const banner =
    isConfidencial || !empresa?.banner_url ? bannerDefault : empresa.banner_url;
  const localizacao = empresa?.endereco
    ? `${empresa.endereco.cidade} - ${empresa.endereco.uf}`
    : "Panambi - RS";

  const modeloTraduzido =
    DICIONARIO.modelos[vaga.modelo_trabalho] || vaga.modelo_trabalho;
  const contratoTraduzido =
    DICIONARIO.contratos[vaga.tipo_contrato] || vaga.tipo_contrato;
  const nivelTraduzido =
    DICIONARIO.niveis[vaga.nivel_hierarquico] || vaga.nivel_hierarquico;

  const formatarSalario = () => {
    if (vaga.salario_a_combinar) return "A combinar";
    const de = Number(vaga.faixa_salarial_de);
    const ate = Number(vaga.faixa_salarial_ate);
    if (de > 0 && ate > 0)
      return `R$ ${de.toLocaleString("pt-BR")} - R$ ${ate.toLocaleString("pt-BR")}`;
    if (de > 0) return `A partir de R$ ${de.toLocaleString("pt-BR")}`;
    return "Não informado";
  };

  // Ordena as etapas pela propriedade 'ordem', caso exista
  const etapasOrdenadas = vaga.etapas
    ? [...vaga.etapas].sort((a, b) => a.ordem - b.ordem)
    : [];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. BANNER */}
      <div className="w-full h-64 md:h-80 relative overflow-hidden">
        <Image
          src={banner}
          alt="Banner"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* 2. CONTAINER CENTRALIZADO */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-16 relative z-10">
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col items-center text-center gap-6 mb-10">
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full p-1.5 border-2 border-white shadow-xl -mt-24 relative shrink-0">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
              <Image
                src={logotipo}
                alt={nomeEmpresa}
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="space-y-3 w-full flex flex-col items-center">
            <span className="inline-block text-xs font-black text-primary uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">
              {vaga.area_atuacao?.nome || "Geral"}
            </span>

            <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tight">
              {vaga.titulo}
            </h1>

            {vaga.nivel_hierarquico &&
              vaga.nivel_hierarquico !== "NAO_SE_APLICA" && (
                <div className="flex justify-center mt-1 mb-2">
                  <span className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 border border-purple-100 rounded-lg text-xs font-black uppercase tracking-widest">
                    <HiOutlineAcademicCap size={16} /> Nível: {nivelTraduzido}
                  </span>
                </div>
              )}

            <p className="text-lg md:text-xl font-bold text-gray-500">
              {nomeEmpresa}
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <Badge
                icon={<HiOutlineLocationMarker size={18} />}
                text={localizacao}
              />
              <Badge
                icon={<HiOutlineBriefcase size={18} />}
                text={modeloTraduzido}
              />
              <Badge
                icon={<HiOutlineClock size={18} />}
                text={contratoTraduzido}
              />

              {!vaga.ocultar_salario && (
                <Badge
                  icon={<HiOutlineCurrencyDollar size={18} />}
                  text={formatarSalario()}
                  color="bg-emerald-50 text-emerald-700 border-emerald-100"
                />
              )}

              {/* DATA DE ENCERRAMENTO */}
              {vaga.data_encerramento &&
                !isNaN(new Date(vaga.data_encerramento).getTime()) && (
                  <Badge
                    icon={<HiOutlineCalendar size={18} />}
                    text={`Inscrições até: ${new Date(vaga.data_encerramento).toLocaleDateString("pt-BR")}`}
                    color="bg-amber-50 text-amber-700 border-amber-200"
                  />
                )}
            </div>

            {/* === AVISO DE DIVERSIDADE (SÉRIO E OBJETIVO) === */}
            {vaga.tipo_diversidade &&
              vaga.tipo_diversidade !== "AMPLA_CONCORRENCIA" && (
                <div
                  className={`w-full p-6 rounded-3xl border flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 mt-6 ${
                    vaga.tipo_diversidade === "EXCLUSIVA_PCD"
                      ? "bg-purple-50/60 border-purple-200 text-purple-950"
                      : "bg-blue-50/40 border-blue-200 text-blue-950"
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white shadow-sm border ${
                      vaga.tipo_diversidade === "EXCLUSIVA_PCD"
                        ? "border-purple-200 text-purple-600"
                        : "border-blue-200 text-blue-600"
                    }`}
                  >
                    <HiOutlineInformationCircle size={24} />
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <h4 className="font-black text-sm md:text-base tracking-tight">
                      {vaga.tipo_diversidade === "EXCLUSIVA_PCD"
                        ? "Vaga exclusiva para PcDs e neurodivergentes"
                        : "Espaço para Todos os Talentos"}
                    </h4>
                    <p className="text-xs md:text-sm text-gray-700 leading-relaxed font-medium">
                      {vaga.tipo_diversidade === "EXCLUSIVA_PCD"
                        ? "O processo seletivo e o ambiente de trabalho são adaptados para garantir o seu desenvolvimento profissional."
                        : "A diversidade é valorizada neste ambiente de trabalho. A organização incentiva a candidatura de pessoas com deficiência (PcD) e neurodivergentes, garantindo um processo seletivo justo, acessível e com igualdade de oportunidades."}
                    </p>
                  </div>
                </div>
              )}
          </div>

          {/* === LOGICA DE VAGA EXTERNA VS INTERNA === */}
          <div className="w-full mt-4 pt-6 border-t border-gray-100">
            {vaga.vaga_externa ? (
              <div className="w-full bg-gray-50 border border-gray-200 rounded-3xl p-6 text-left space-y-4">
                <div className="flex items-center gap-2 text-gray-800 font-bold text-sm">
                  <HiOutlineInformationCircle
                    size={20}
                    className="text-blue-500 shrink-0"
                  />
                  Captação de Candidatos Externa
                </div>
                <p className="text-xs md:text-sm text-gray-600 leading-relaxed font-medium">
                  A inscrição para esta vaga não é feita pelo botão da
                  plataforma. Siga as instruções abaixo definidas pela empresa
                  para enviar o seu currículo.
                </p>

                {vaga.instrucoes_candidatura && (
                  <div className="bg-white p-4 rounded-2xl border border-gray-200 text-xs md:text-sm text-gray-700 font-medium whitespace-pre-wrap leading-relaxed shadow-sm">
                    <span className="font-black block text-[10px] text-gray-400 uppercase tracking-widest mb-1.5">
                      Instruções da Empresa:
                    </span>
                    {vaga.instrucoes_candidatura}
                  </div>
                )}

                {vaga.link_externo && (
                  <a
                    href={vaga.link_externo}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-black text-sm shadow-md transition-all"
                  >
                    Acessar Link de Inscrição{" "}
                    <HiOutlineExternalLink size={18} />
                  </a>
                )}
              </div>
            ) : (
              <div className="max-w-md mx-auto w-full flex items-center justify-center">{botaoAcao}</div>
            )}
          </div>
        </div>

        {/* 3. CONTEÚDO EM SEQUÊNCIA */}
        <div className="space-y-8">
          <Section title="Descrição da Vaga">
            <div
              className="rich-text text-gray-600 leading-relaxed text-lg"
              dangerouslySetInnerHTML={{ __html: vaga.descricao }}
            />
          </Section>

          {vaga.responsabilidades && (
            <Section title="Responsabilidades e Atribuições">
              <div
                className="rich-text text-gray-600 leading-relaxed text-lg"
                dangerouslySetInnerHTML={{ __html: vaga.responsabilidades }}
              />
            </Section>
          )}

          <Section title="Requisitos e Qualificações">
            <div className="space-y-8">
              {vaga.requisitos_obrigatorios && (
                <SubSection
                  title="Obrigatórios"
                  color="primary"
                  content={vaga.requisitos_obrigatorios}
                  isHtml={true}
                />
              )}

              {vaga.diferenciais && (
                <SubSection
                  title="Diferenciais (Opcional)"
                  color="blue"
                  content={vaga.diferenciais}
                  isHighlight={true}
                  isHtml={false}
                />
              )}
            </div>
          </Section>

          {/* === TIMELINE DE ETAPAS === */}
          {etapasOrdenadas.length > 0 && !vaga.vaga_externa && (
            <Section title="Etapas do Processo">
              <div className="relative border-l-2 border-blue-100 ml-3 md:ml-5 space-y-8 py-2 mt-4">
                {etapasOrdenadas.map((etapa: any, index: number) => {
                  const isUltima = index === etapasOrdenadas.length - 1;
                  return (
                    <div
                      key={etapa.id_etapa || index}
                      className="relative pl-8"
                    >
                      {/* Bolinha da Timeline */}
                      <span
                        className={`absolute -left-[11px] top-1 w-5 h-5 rounded-full flex items-center justify-center border-4 border-white ${
                          isUltima ? "bg-emerald-500" : "bg-blue-500"
                        }`}
                      ></span>

                      <h4 className="text-base font-bold text-gray-800">
                        {etapa.nome_etapa || etapa.nome}
                      </h4>

                      {/* Badge de Requer Agendamento (se aplicável) */}
                      {etapa.requer_agendamento && (
                        <span className="inline-block mt-1.5 text-[10px] font-black uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          Requer Agendamento
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Section>
          )}

          {vaga.competencias && vaga.competencias.length > 0 && (
            <Section title="Competências Desejadas">
              <div className="flex flex-wrap gap-3">
                {vaga.competencias.map((comp: any) => (
                  <span
                    key={comp.id_competencia}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-sm font-bold shadow-sm"
                  >
                    {comp.competencia?.nome}
                    {comp.obrigatoria && (
                      <span className="text-red-500" title="Obrigatório">
                        *
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </Section>
          )}

          {vaga.beneficios?.length > 0 && (
            <Section title="Benefícios">
              <div className="flex flex-wrap gap-3">
                {vaga.beneficios.map((item: any) => (
                  <div
                    key={item.id_beneficio}
                    className="flex items-center gap-2 px-5 py-3 bg-emerald-50/50 text-emerald-700 border border-emerald-100 rounded-2xl text-sm font-bold shadow-sm"
                  >
                    <svg
                      className="w-5 h-5 text-emerald-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {item.beneficio?.descricao}
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* SOBRE A EMPRESA */}
          <section className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-12 rounded-[40px] shadow-xl text-white space-y-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-black mb-2">
                Conheça a {nomeEmpresa}
              </h2>
              {!isConfidencial && empresa ? (
                <div className="space-y-8">
                  <div
                    className="rich-text text-gray-300 leading-relaxed text-lg max-w-3xl"
                    dangerouslySetInnerHTML={{ __html: empresa.quem_somos }}
                  />
                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-700/50">
                    <SocialLink
                      href={formatSocialUrl("https://", empresa.site)}
                      icon={<HiOutlineGlobeAlt size={20} />}
                      label="Website"
                    />
                    <SocialLink
                      href={formatSocialUrl(
                        "https://linkedin.com/in/",
                        empresa.linkedin,
                      )}
                      icon={<FaLinkedin size={20} />}
                      label="LinkedIn"
                    />
                    <SocialLink
                      href={formatSocialUrl(
                        "https://instagram.com/",
                        empresa.instagram,
                      )}
                      icon={<FaInstagram size={20} />}
                      label="Instagram"
                    />
                    <SocialLink
                      href={formatSocialUrl(
                        "https://facebook.com/",
                        empresa.facebook,
                      )}
                      icon={<FaFacebook size={20} />}
                      label="Facebook"
                    />
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-lg italic">
                  Informações confidenciais.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function Badge({
  icon,
  text,
  color = "bg-gray-50 text-gray-600 border-gray-100",
}: any) {
  return (
    <span
      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-bold border ${color}`}
    >
      {icon} {text}
    </span>
  );
}

function Section({ title, children }: any) {
  return (
    <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
      <h2 className="text-2xl font-black text-gray-800 border-b border-gray-100 pb-4">
        {title}
      </h2>
      {children}
    </section>
  );
}

function SubSection({
  title,
  color,
  content,
  isHighlight = false,
  isHtml = true,
}: any) {
  if (!content) return null;

  return (
    <div
      className={
        isHighlight
          ? `bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50`
          : ""
      }
    >
      <h4
        className={`text-sm font-black text-${color}-500 uppercase tracking-widest mb-4 flex items-center gap-2`}
      >
        <span className={`w-2 h-2 bg-${color}-500 rounded-full`}></span> {title}
      </h4>

      {isHtml ? (
        <div
          className="rich-text text-gray-600"
          dangerouslySetInnerHTML={{ __html: content }}
        />
      ) : (
        <div className="text-gray-600 leading-relaxed text-lg whitespace-pre-wrap">
          {content}
        </div>
      )}
    </div>
  );
}

function SocialLink({ href, icon, label }: any) {
  if (href === "#") return null;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm font-bold text-white"
    >
      {icon} {label}
    </a>
  );
}
