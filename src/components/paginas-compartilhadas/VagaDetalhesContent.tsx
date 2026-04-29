import Image from "next/image";
import {
    HiOutlineBriefcase, HiOutlineLocationMarker,
    HiOutlineCurrencyDollar, HiOutlineClock, HiOutlineInformationCircle,
    HiOutlineGlobeAlt
} from "react-icons/hi";
import { FaInstagram, FaLinkedin, FaFacebook } from "react-icons/fa";
import logoDefault from "@/src/assets/default/logo.webp";
import bannerDefault from "@/src/assets/default/banner.webp";

interface VagaDetalhesContentProps {
    vaga: any;
    botaoAcao: React.ReactNode; // Passamos o botão como prop para mudar o contexto
}

const formatSocialUrl = (base: string, url: string) => {
    if (!url) return "#";
    if (url.startsWith("http")) return url;
    return `${base}${url.replace("@", "")}`;
};

export default function VagaDetalhesContent({ vaga, botaoAcao }: VagaDetalhesContentProps) {
    const isConfidencial = vaga.empresa_confidencial;
    const empresa = isConfidencial ? null : vaga.empresa;

    const nomeEmpresa = isConfidencial ? "Empresa Confidencial" : empresa?.nome_fantasia;
    const logotipo = isConfidencial || !empresa?.logotipo_url ? logoDefault : empresa.logotipo_url;
    const banner = isConfidencial || !empresa?.banner_url ? bannerDefault : empresa.banner_url;
    const localizacao = empresa?.endereco ? `${empresa.endereco.cidade} - ${empresa.endereco.uf}` : "Panambi - RS";

    const formatarSalario = () => {
        if (vaga.ocultar_salario) return "Salário Confidencial";
        if (vaga.salario_a_combinar) return "A combinar";
        const de = Number(vaga.faixa_salarial_de);
        const ate = Number(vaga.faixa_salarial_ate);
        if (de > 0 && ate > 0) return `R$ ${de.toLocaleString()} - R$ ${ate.toLocaleString()}`;
        if (de > 0) return `A partir de R$ ${de.toLocaleString()}`;
        return "Não informado";
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* 1. BANNER */}
            <div className="w-full h-64 md:h-80 relative overflow-hidden">
                <Image src={banner} alt="Banner" fill className="object-cover" priority />
                <div className="absolute inset-0 bg-black/20" />
            </div>

            {/* 2. CONTAINER CENTRALIZADO */}
            <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-16 relative z-10">
                <div className="bg-white rounded-[40px] p-8 md:p-12 shadow-xl shadow-gray-200/40 border border-gray-100 flex flex-col items-center text-center gap-6 mb-10">
                    <div className="w-32 h-32 md:w-40 md:h-40 bg-white rounded-full p-1.5 border-2 border-white shadow-xl -mt-24 relative shrink-0">
                        <div className="relative w-full h-full rounded-full overflow-hidden bg-gray-50 flex items-center justify-center">
                            <Image src={logotipo} alt={nomeEmpresa} fill className="object-contain" />
                        </div>
                    </div>

                    <div className="space-y-3 w-full">
                        <span className="inline-block text-xs font-black text-primary uppercase tracking-widest bg-blue-50 px-4 py-1.5 rounded-full">
                            {vaga.area_atuacao?.nome || "Geral"}
                        </span>
                        <h1 className="text-3xl font-black text-gray-900 leading-tight tracking-tight">{vaga.titulo}</h1>
                        <p className="text-lg md:text-xl font-bold text-gray-500">{nomeEmpresa}</p>

                        <div className="flex flex-wrap justify-center gap-3 pt-4">
                            <Badge icon={<HiOutlineLocationMarker size={18} />} text={localizacao} />
                            <Badge icon={<HiOutlineBriefcase size={18} />} text={vaga.modelo_trabalho} />
                            <Badge icon={<HiOutlineClock size={18} />} text={`${vaga.tipo_contrato} • ${vaga.nivel_hierarquico}`} />
                            <Badge icon={<HiOutlineCurrencyDollar size={18} />} text={formatarSalario()} color="bg-emerald-50 text-emerald-700 border-emerald-100" />
                        </div>
                    </div>

                    <div className="w-full flex justify-center max-w-md mt-6 pt-8 border-t border-gray-100">
                        {botaoAcao}
                    </div>
                </div>

                {/* 3. CONTEÚDO EM SEQUÊNCIA */}
                <div className="space-y-8">
                    <Section title="Descrição da Vaga">
                        <div className="rich-text text-gray-600 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: vaga.descricao }} />
                    </Section>

                    {vaga.responsabilidades && (
                        <Section title="Responsabilidades e Atribuições">
                            <div className="rich-text text-gray-600 leading-relaxed text-lg" dangerouslySetInnerHTML={{ __html: vaga.responsabilidades }} />
                        </Section>
                    )}

                    <Section title="Requisitos e Qualificações">
                        <div className="space-y-8">
                            <SubSection title="Obrigatórios" color="primary" content={vaga.requisitos_obrigatorios} />
                            {vaga.diferenciais && <SubSection title="Diferenciais" color="blue" content={vaga.diferenciais} isHighlight />}
                        </div>
                    </Section>

                    {vaga.beneficios?.length > 0 && (
                        <Section title="Benefícios">
                            <div className="flex flex-wrap gap-3">
                                {vaga.beneficios.map((item: any) => (
                                    <div key={item.id_beneficio} className="flex items-center gap-2 px-5 py-3 bg-emerald-50/50 text-emerald-700 border border-emerald-100 rounded-2xl text-sm font-bold shadow-sm">
                                        <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        {item.beneficio.descricao}
                                    </div>
                                ))}
                            </div>
                        </Section>
                    )}

                    <section className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-12 rounded-[40px] shadow-xl text-white space-y-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
                        <div className="relative z-10">
                            <h2 className="text-2xl md:text-3xl font-black mb-2">Conheça a {nomeEmpresa}</h2>
                            {!isConfidencial && empresa ? (
                                <div className="space-y-8">
                                    <div className="rich-text text-gray-300 leading-relaxed text-lg max-w-3xl" dangerouslySetInnerHTML={{ __html: empresa.quem_somos }} />
                                    <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-700/50">
                                        <SocialLink href={formatSocialUrl("https://", empresa.site)} icon={<HiOutlineGlobeAlt size={20} />} label="Website" />
                                        <SocialLink href={formatSocialUrl("https://linkedin.com/in/", empresa.linkedin)} icon={<FaLinkedin size={20} />} label="LinkedIn" />
                                        <SocialLink href={formatSocialUrl("https://instagram.com/", empresa.instagram)} icon={<FaInstagram size={20} />} label="Instagram" />
                                        <SocialLink href={formatSocialUrl("https://facebook.com/", empresa.facebook)} icon={<FaFacebook size={20} />} label="Facebook" />
                                    </div>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-lg italic">Informações confidenciais.</p>
                            )}
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

// --- SUB-COMPONENTES AUXILIARES (Dentro do mesmo arquivo para organização) ---

function Badge({ icon, text, color = "bg-gray-50 text-gray-600 border-gray-100" }: any) {
    return (
        <span className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-medium border ${color}`}>
            {icon} {text}
        </span>
    );
}

function Section({ title, children }: any) {
    return (
        <section className="bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100 space-y-6">
            <h2 className="text-2xl font-black text-gray-800 border-b border-gray-100 pb-4">{title}</h2>
            {children}
        </section>
    );
}

function SubSection({ title, color, content, isHighlight = false }: any) {
    return (
        <div className={isHighlight ? `bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50` : ""}>
            <h4 className={`text-sm font-black text-${color}-500 uppercase tracking-widest mb-4 flex items-center gap-2`}>
                <span className={`w-2 h-2 bg-${color}-500 rounded-full`}></span> {title}
            </h4>
            <div className="rich-text text-gray-600" dangerouslySetInnerHTML={{ __html: content }} />
        </div>
    );
}

function SocialLink({ href, icon, label }: any) {
    if (href === "#") return null;
    return (
        <a href={href} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-5 py-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors text-sm font-bold text-white">
            {icon} {label}
        </a>
    );
}