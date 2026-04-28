import Image from "next/image";
import { notFound } from "next/navigation";
import { BotaoCandidatar } from "@/src/components/vagas/[id]/BotaoCandidatar";
import logoDefault from "@/src/assets/default/logo.webp";
import bannerDefault from "@/src/assets/default/banner.webp"; // Atualizado com seu novo import
import {
  HiOutlineBriefcase,
  HiOutlineLocationMarker,
  HiOutlineCurrencyDollar,
  HiOutlineClock,
  HiOutlineOfficeBuilding,
  HiOutlineGlobeAlt,
} from "react-icons/hi";
import { FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa"; // Ícones de redes sociais

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getVagaDetalhes(id: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/vagas/${id}`,
      { next: { revalidate: 60 } },
    );

    if (!res.ok) return null;
    const response = await res.json();

    return response.success ? response.data : null;
  } catch (error) {
    return null;
  }
}

// Helper para montar URLs corretas caso o usuário digite só o @ ou o final do link
const formatSocialUrl = (base: string, url: string) => {
  if (url.startsWith("http")) return url;
  return `${base}${url.replace("@", "")}`;
};

export default async function DetalhesVagaPage({ params }: PageProps) {
  const resolvedParams = await params;
  const vaga = await getVagaDetalhes(resolvedParams.id);

  if (!vaga) {
    notFound();
  }

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

  const formatarSalario = () => {
    if (vaga.ocultar_salario) return "Salário Confidencial";
    if (vaga.salario_a_combinar) return "A combinar";

    const de = Number(vaga.faixa_salarial_de);
    const ate = Number(vaga.faixa_salarial_ate);

    if (de > 0 && ate > 0)
      return `R$ ${de.toLocaleString()} - R$ ${ate.toLocaleString()}`;
    if (de > 0) return `A partir de R$ ${de.toLocaleString()}`;
    return "Não informado";
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="w-full h-64 md:h-80 relative overflow-hidden">
        <Image
          src={banner}
          alt="Banner da Vaga"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* 2. CONTAINER PRINCIPAL CENTRALIZADO */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-16 relative z-10">
        {/* CABEÇALHO DA VAGA (Perfil Style) */}
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col items-center text-center gap-6 mb-10">
          {/* Logotipo Redondo invadindo o banner */}
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full p-1.5 border-2 border-white shadow-xl -mt-24 relative shrink-0">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
              <Image
                src={logotipo}
                alt={nomeEmpresa || "Logo"}
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="space-y-3 w-full">
            <span className="inline-block text-xs font-black text-primary uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">
              {vaga.area_atuacao?.nome || "Geral"}
            </span>
            <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tight">
              {vaga.titulo}
            </h1>
            <p className="text-lg md:text-xl font-bold text-gray-500 flex items-center justify-center gap-2">
              {nomeEmpresa}
            </p>

            {/* Tags (Centralizadas) */}
            <div className="flex flex-wrap justify-center gap-3 pt-4">
              <span className="flex items-center gap-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium border border-gray-100">
                <HiOutlineLocationMarker className="text-primary" size={18} />{" "}
                {localizacao}
              </span>
              <span className="flex items-center gap-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium border border-gray-100">
                <HiOutlineBriefcase className="text-primary" size={18} />{" "}
                {vaga.modelo_trabalho}
              </span>
              <span className="flex items-center gap-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium border border-gray-100">
                <HiOutlineClock className="text-primary" size={18} />{" "}
                {vaga.tipo_contrato} • {vaga.nivel_hierarquico}
              </span>
              <span className="flex items-center gap-1 px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-xl text-sm font-bold">
                <HiOutlineCurrencyDollar size={18} /> {formatarSalario()}
              </span>
            </div>
          </div>

          {/* O BOTÃO AGORA FECHA O CABEÇALHO */}
          <div className="w-full flex justify-center max-w-md mt-6 pt-8 border-t border-gray-100">
            <BotaoCandidatar idVaga={vaga.id_vaga} tituloVaga={vaga.titulo} />
          </div>
        </div>

        {/* 3. FLUXO DE CONTEÚDO (Coluna Única) */}
        <div className="space-y-8">
          {/* DESCRIÇÃO DA VAGA */}
          <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-2xl font-black text-gray-800 border-b border-gray-100 pb-4">
              Descrição da Vaga
            </h2>
            <div className="prose prose-lg prose-gray max-w-none whitespace-pre-wrap text-gray-600 leading-relaxed">
              {vaga.descricao}
            </div>
          </section>

          {/* RESPONSABILIDADES */}
          {vaga.responsabilidades && (
            <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
              <h2 className="text-2xl font-black text-gray-800 border-b border-gray-100 pb-4">
                Responsabilidades e Atribuições
              </h2>
              <div className="prose prose-lg prose-gray max-w-none whitespace-pre-wrap text-gray-600 leading-relaxed">
                {vaga.responsabilidades}
              </div>
            </section>
          )}

          {/* REQUISITOS E QUALIFICAÇÕES */}
          <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100 space-y-8">
            <h2 className="text-2xl font-black text-gray-800 border-b border-gray-100 pb-4">
              Requisitos e Qualificações
            </h2>

            <div className="space-y-8">
              <div>
                <h4 className="text-sm font-black text-primary uppercase tracking-widest mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 bg-primary rounded-full"></span>{" "}
                  Obrigatórios
                </h4>
                <div className="prose prose-lg prose-gray max-w-none whitespace-pre-wrap text-gray-600">
                  {vaga.requisitos_obrigatorios}
                </div>
              </div>

              {vaga.diferenciais && (
                <div className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                  <h4 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>{" "}
                    Diferenciais (Sair na frente)
                  </h4>
                  <div className="prose prose-lg prose-blue max-w-none whitespace-pre-wrap text-gray-600">
                    {vaga.diferenciais}
                  </div>
                </div>
              )}
            </div>
          </section>
          {/* COLE ESTE BLOCO NOVO: */}
          {vaga.beneficios && vaga.beneficios.length > 0 && (
            <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
              <h2 className="text-2xl font-black text-gray-800 border-b border-gray-100 pb-4">
                Benefícios
              </h2>

              <div className="flex flex-wrap gap-3">
                {vaga.beneficios.map((item: any) => (
                  <span
                    key={`ben-${item.id_beneficio}`}
                    className="flex items-center gap-2 px-5 py-3 bg-emerald-50/50 text-emerald-700 border border-emerald-100 rounded-2xl text-sm font-bold shadow-sm"
                  >
                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {item.beneficio.descricao}
                  </span>
                ))}
              </div>
            </section>
          )}
          {/* SOBRE A EMPRESA E REDES SOCIAIS */}
          <section className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-12 rounded-[40px] shadow-xl text-white space-y-8 relative overflow-hidden">
            {/* Decoração de fundo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>

            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-black mb-2">
                Conheça a {nomeEmpresa}
              </h2>

              {!isConfidencial && empresa ? (
                <div className="space-y-8">
                  <p className="text-gray-300 text-lg leading-relaxed max-w-3xl">
                    {empresa.quem_somos ||
                      "Nossa missão é conectar talentos incríveis a oportunidades transformadoras na região. Junte-se ao nosso time!"}
                  </p>

                  {/* Redes Sociais Bonitas */}
                  <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-700/50">
                    {empresa.site && (
                      <a
                        href={formatSocialUrl("https://", empresa.site)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm font-bold"
                      >
                        <HiOutlineGlobeAlt size={20} /> Website
                      </a>
                    )}
                    {empresa.linkedin && (
                      <a
                        href={formatSocialUrl(
                          "https://linkedin.com/in/",
                          empresa.linkedin,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-3 bg-[#0A66C2]/20 hover:bg-[#0A66C2]/40 text-blue-300 hover:text-white rounded-full transition-colors text-sm font-bold"
                      >
                        <FaLinkedin size={20} /> LinkedIn
                      </a>
                    )}
                    {empresa.instagram && (
                      <a
                        href={formatSocialUrl(
                          "https://instagram.com/",
                          empresa.instagram,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-3 bg-[#E1306C]/20 hover:bg-[#E1306C]/40 text-pink-300 hover:text-white rounded-full transition-colors text-sm font-bold"
                      >
                        <FaInstagram size={20} /> Instagram
                      </a>
                    )}
                    {empresa.facebook && (
                      <a
                        href={formatSocialUrl(
                          "https://facebook.com/",
                          empresa.facebook,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-5 py-3 bg-[#1877F2]/20 hover:bg-[#1877F2]/40 text-blue-400 hover:text-white rounded-full transition-colors text-sm font-bold"
                      >
                        <FaFacebook size={20} /> Facebook
                      </a>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-gray-400 text-lg italic leading-relaxed">
                  Os detalhes desta empresa são confidenciais e serão revelados
                  apenas para os candidatos selecionados para avançar no
                  processo seletivo.
                </p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
