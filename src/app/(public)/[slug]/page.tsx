import Image from "next/image";
import { notFound } from "next/navigation";
import Link from "next/link";
import logoDefault from "@/src/assets/default/logo.webp";
import bannerDefault from "@/src/assets/default/banner.webp";
import {
  HiOutlineLocationMarker,
  HiOutlineGlobeAlt,
  HiOutlineBriefcase,
  HiOutlineClock,
  HiOutlineChevronRight,
} from "react-icons/hi";
import { FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getPerfilEmpresa(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/empresas/perfil/${slug}`,
      { next: { revalidate: 300 } },
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

export default async function PerfilPublicoEmpresaPage({ params }: PageProps) {
  const { slug } = await params;
  const empresa = await getPerfilEmpresa(slug);

  if (!empresa) notFound();

  const logotipo = empresa.logotipo_url || logoDefault;
  const banner = empresa.banner_url || bannerDefault;
  const localizacao = `${empresa.endereco?.bairro}, ${empresa.endereco?.cidade} - ${empresa.endereco?.uf}`;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* 1. BANNER (Igual ao da Vaga) */}
      <div className="w-full h-64 md:h-80 relative overflow-hidden">
        <Image
          src={banner}
          alt="Banner"
          fill
          className="object-content object-center"
          priority
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* 2. CONTAINER PRINCIPAL CENTRALIZADO */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 relative z-10">
        {/* CABEÇALHO DA EMPRESA (Perfil Style) */}
        <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col items-center text-center gap-6 mb-10">
          {/* Logotipo Redondo invadindo o banner */}
          <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full p-1.5 border-2 border-white shadow-xl -mt-24 relative shrink-0">
            <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
              <Image
                src={logotipo}
                alt={empresa.nome_fantasia}
                fill
                className="object-contain"
              />
            </div>
          </div>

          <div className="space-y-4 w-full">
            <h1 className="text-4xl font-black text-gray-900 leading-tight tracking-tight">
              {empresa.nome_fantasia}
            </h1>

            {/* Tags de Localização e Site */}
            <div className="flex flex-wrap justify-center gap-3">
              <span className="flex items-center gap-1 px-4 py-2 bg-gray-50 text-gray-600 rounded-xl text-sm font-medium border border-gray-100">
                <HiOutlineLocationMarker className="text-primary" size={18} />{" "}
                {localizacao}
              </span>
            </div>

            {/* Redes Sociais */}
            <div className="flex justify-center gap-4 pt-2">
              {empresa.site && (
                <a
                  href={formatSocialUrl("https://", empresa.site)}
                  target="_blank"
                  className="p-3 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-800 hover:text-white transition-all shadow-sm"
                >
                  <HiOutlineGlobeAlt size={18} />
                </a>
              )}
              {empresa.instagram && (
                <a
                  href={formatSocialUrl(
                    "https://instagram.com/",
                    empresa.instagram,
                  )}
                  target="_blank"
                  className="p-3 bg-pink-50 text-pink-600 rounded-2xl hover:bg-pink-600 hover:text-white transition-all shadow-sm"
                >
                  <FaInstagram size={20} />
                </a>
              )}
              {empresa.linkedin && (
                <a
                  href={formatSocialUrl(
                    "https://linkedin.com/in/",
                    empresa.linkedin,
                  )}
                  target="_blank"
                  className="p-3 bg-blue-50 text-blue-700 rounded-2xl hover:bg-blue-700 hover:text-white transition-all shadow-sm"
                >
                  <FaLinkedin size={20} />
                </a>
              )}
              {empresa.facebook && (
                <a
                  href={formatSocialUrl(
                    "https://facebook.com/",
                    empresa.facebook,
                  )}
                  target="_blank"
                  className="p-3 bg-blue-50 text-blue-800 rounded-2xl hover:bg-blue-800 hover:text-white transition-all shadow-sm"
                >
                  <FaFacebook size={20} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* 3. FLUXO DE CONTEÚDO EM SEQUÊNCIA (Coluna Única) */}
        <div className="space-y-10">
          {/* QUEM SOMOS */}
          <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
            <div
              className="rich-text text-gray-600 leading-relaxed text-lg"
              dangerouslySetInnerHTML={{ __html: empresa.quem_somos }}
            />
          </section>

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
                    className="flex items-center gap-2 px-6 py-3 bg-emerald-50/50 text-emerald-700 border border-emerald-100 rounded-2xl text-sm font-bold"
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
                    {b.descricao}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* LISTAGEM DE VAGAS (ESTILO CARD GRANDE) */}
          <section className="space-y-6">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-2xl font-black text-gray-800">
                Vagas Abertas ({empresa.vagas?.length || 0})
              </h2>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {empresa.vagas?.length > 0 ? (
                empresa.vagas.map((vaga: any) => (
                  <Link key={vaga.id_vaga} href={`/vaga/${vaga.id_vaga}`}>
                    <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6">
                      <div className="space-y-3">
                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] bg-blue-50 px-3 py-1 rounded-md">
                          {vaga.tipo_contrato}
                        </span>
                        <h3 className="text-xl font-black text-gray-800 group-hover:text-primary transition-colors">
                          {vaga.titulo}
                        </h3>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500 font-medium">
                          <span className="flex items-center gap-1.5">
                            <HiOutlineBriefcase
                              size={18}
                              className="text-gray-400"
                            />
                            {vaga.modelo_trabalho}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <HiOutlineLocationMarker
                              size={18}
                              className="text-gray-400"
                            />
                            {vaga.endereco?.cidade}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-primary font-black uppercase text-xs tracking-widest bg-gray-50 px-6 py-3 rounded-2xl group-hover:bg-primary group-hover:text-white transition-all">
                        Candidatar-se <HiOutlineChevronRight size={18} />
                      </div>
                    </div>
                  </Link>
                ))
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
