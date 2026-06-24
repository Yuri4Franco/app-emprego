import Image from "next/image";
import { notFound } from "next/navigation";
import logoDefault from "@/src/assets/default/logo.webp";
import bannerDefault from "@/src/assets/default/banner.webp";
import {
  HiOutlineLocationMarker,
  HiOutlineGlobeAlt,
  HiOutlineOfficeBuilding,
} from "react-icons/hi";
import { FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";

// Importando o Adaptador e o Componente em Lista (Deitado)
import { mapearVagaBackendParaFrontend } from "@/src/utils/vaga-adapter";
import { CompanyJobListItem } from "@/src/components/CompanyJobListItem";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPerfilEmpresa(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/empresas/perfil/${slug}`,
      { next: { revalidate: 60 } },
    );
    if (!res.ok) return null;
    const response = await res.json();
    return response.success ? response.data : null;
  } catch (error) {
    return null;
  }
}

const formatSocialUrl = (base: string, url: string) => {
  if (url.startsWith("http")) return url;
  return `${base}${url.replace("@", "")}`;
};

// ==========================================
// 🚀 SEO DINÂMICO
// ==========================================
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const empresa = await getPerfilEmpresa(slug);

  if (!empresa) return { title: "Empresa não encontrada | ACI Vagas" };

  const cleanDescription = empresa.quem_somos?.replace(/<[^>]*>?/gm, '').substring(0, 150) || "Confira as vagas e oportunidades desta empresa.";

  return {
    title: `Trabalhe na ${empresa.nome_fantasia} | ACI Vagas`,
    description: `${cleanDescription}...`,
    openGraph: {
      images: [empresa.logotipo_url || logoDefault.src],
    },
  };
}

export default async function PerfilPublicoEmpresaPage({ params }: PageProps) {
  const { slug } = await params;
  const empresa = await getPerfilEmpresa(slug);

  if (!empresa) notFound();

  const logotipo = empresa.logotipo_url || logoDefault;
  const banner = empresa.banner_url || bannerDefault;
  const localizacao = `${empresa.endereco?.bairro || ""}, ${empresa.endereco?.cidade || ""} - ${empresa.endereco?.uf || ""}`.replace(/^, /, '');

  return (
    <div className="min-h-screen bg-gray-50 pb-24">

      {/* 1. BANNER (Mais alto e bem enquadrado) */}
      <div className="w-full h-64 md:h-96 lg:h-[420px] relative bg-gray-900 flex items-center justify-center">
        <Image
          src={banner}
          alt={`Banner da ${empresa.nome_fantasia}`}
          fill
          className="object-cover object-center opacity-90"
          priority
        />
        {/* Sombra sutil apenas na parte inferior para dar destaque ao card branco */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
      </div>

      {/* 2. CONTAINER PRINCIPAL CENTRALIZADO */}
      {/* O -mt-16 md:-mt-20 puxa o card sutilmente para cima do banner */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10 -mt-12">

        {/* CABEÇALHO DA EMPRESA */}
        <div className="bg-white rounded-[32px] md:rounded-[40px] px-6 pb-10 md:px-12 md:pb-12 shadow-xl shadow-gray-200/50 border border-gray-100 flex flex-col items-center text-center">

          {/* Logotipo Flutuante (Exatamente 50% para fora, estilo LinkedIn) */}
          <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-full p-2 shadow-lg border border-gray-100 -mt-14 md:-mt-18 shrink-0 relative">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-white flex items-center justify-center">
              <Image
                src={logotipo}
                alt={empresa.nome_fantasia}
                fill
                className="object-contain p-3"
              />
            </div>
          </div>

          {/* Dados e Título com espaçamento corrigido (mt-5) */}
          <div className="space-y-5 w-full mt-5">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 leading-tight tracking-tight">
              {empresa.nome_fantasia}
            </h1>

            {/* Tags de Localização e Status */}
            <div className="flex flex-wrap justify-center items-center gap-3">
              {localizacao.length > 5 && (
                <span className="flex items-center gap-1.5 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-xs md:text-sm font-bold border border-gray-100">
                  <HiOutlineLocationMarker className="text-blue-600" size={18} />
                  {localizacao}
                </span>
              )}
              {empresa.tipo_vinculo_aci === "ASSOCIADA" && (
                <span className="flex items-center gap-1.5 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-xs md:text-sm font-black uppercase tracking-widest border border-emerald-100">
                  <HiOutlineOfficeBuilding size={18} /> Empresa Associada
                </span>
              )}
            </div>

            {/* Redes Sociais */}
            <div className="flex justify-center gap-3 pt-3">
              {empresa.site && (
                <a href={formatSocialUrl("https://", empresa.site)} target="_blank" rel="noreferrer" className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-900 hover:text-white hover:-translate-y-1 transition-all shadow-sm">
                  <HiOutlineGlobeAlt size={22} />
                </a>
              )}
              {empresa.instagram && (
                <a href={formatSocialUrl("https://instagram.com/", empresa.instagram)} target="_blank" rel="noreferrer" className="p-3 bg-pink-50 text-pink-600 rounded-2xl hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-pink-500 hover:to-purple-500 hover:text-white hover:-translate-y-1 transition-all shadow-sm">
                  <FaInstagram size={22} />
                </a>
              )}
              {empresa.linkedin && (
                <a href={formatSocialUrl("https://linkedin.com/in/", empresa.linkedin)} target="_blank" rel="noreferrer" className="p-3 bg-blue-50 text-blue-700 rounded-2xl hover:bg-[#0077b5] hover:text-white hover:-translate-y-1 transition-all shadow-sm">
                  <FaLinkedin size={22} />
                </a>
              )}
              {empresa.facebook && (
                <a href={formatSocialUrl("https://facebook.com/", empresa.facebook)} target="_blank" rel="noreferrer" className="p-3 bg-blue-50 text-blue-800 rounded-2xl hover:bg-[#1877F2] hover:text-white hover:-translate-y-1 transition-all shadow-sm">
                  <FaFacebook size={22} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 3. FLUXO DE CONTEÚDO EM COLUNA ÚNICA */}
        <div className="space-y-8 mt-8">

          {/* QUEM SOMOS */}
          {empresa.quem_somos && (
            <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
              <h2 className="text-2xl font-black text-gray-900">
                Sobre a Empresa
              </h2>
              <div
                className="rich-text text-gray-600 leading-relaxed text-base md:text-lg font-medium"
                dangerouslySetInnerHTML={{ __html: empresa.quem_somos }}
              />
            </section>
          )}

          {/* BENEFÍCIOS */}
          {empresa.beneficios?.length > 0 && (
            <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
              <h2 className="text-2xl font-black text-gray-800 border-b border-gray-100 pb-4">
                O que oferecemos
              </h2>
              <div className="flex flex-wrap gap-3">
                {empresa.beneficios.map((b: any) => (
                  <span
                    key={b.id_beneficio}
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl text-sm font-bold"
                  >
                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {b.descricao}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* LISTAGEM DE VAGAS EM LISTA (DEITADA) */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-2xl font-black text-gray-800">
                Oportunidades Abertas
              </h2>
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-black">
                {empresa.vagas?.length || 0}
              </span>
            </div>

            <div className="flex flex-col gap-4">
              {empresa.vagas?.length > 0 ? (
                empresa.vagas.map((vaga: any) => {
                  const propsAdaptadas = mapearVagaBackendParaFrontend(vaga);
                  return (
                    <CompanyJobListItem key={propsAdaptadas.id} job={propsAdaptadas} />
                  );
                })
              ) : (
                <div className="bg-white p-12 rounded-[40px] border border-dashed border-gray-200 text-center">
                  <p className="text-gray-400 font-bold italic text-lg">
                    Nenhuma vaga aberta no momento nesta empresa.
                  </p>
                </div>
              )}
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}