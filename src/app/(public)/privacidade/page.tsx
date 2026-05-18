"use client";

import { useState, useEffect } from "react";
import {
    HiOutlineShieldCheck,
    HiOutlineMail,
    HiOutlinePhone,
    HiOutlineDocumentText,
    HiOutlineCheckCircle
} from "react-icons/hi";

export default function PoliticaPrivacidadePage() {
    const [activeSection, setActiveSection] = useState("introducao");

    // Função para rolar suavemente até a seção e atualizar o menu ativo
    const scrollToSection = (id: string) => {
        setActiveSection(id);
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
        }
    };

    // Atualiza o menu ativo com base no scroll da página
    useEffect(() => {
        const handleScroll = () => {
            const sections = ["introducao", "definicoes", "coleta", "compartilhamento", "direitos", "seguranca", "disposicoes"];
            let current = "introducao";

            for (const section of sections) {
                const element = document.getElementById(section);
                if (element) {
                    const rect = element.getBoundingClientRect();
                    if (rect.top <= 150) {
                        current = section;
                    }
                }
            }
            setActiveSection(current);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="max-w-7xl mx-auto py-10 px-6 md:px-10 animate-in fade-in duration-700">

            {/* ================= HEADER ================= */}
            <header className="mb-12 md:mb-16 text-center max-w-3xl mx-auto space-y-6">
                <div className="w-20 h-20 bg-primary/10 text-primary rounded-[24px] flex items-center justify-center mx-auto mb-6 shadow-sm border border-primary/20">
                    <HiOutlineShieldCheck size={40} />
                </div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-gray-200">
                    <HiOutlineDocumentText size={16} />
                    Documento Oficial
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight leading-tight">
                    Política de Privacidade e Proteção de Dados
                </h1>
                <p className="text-gray-500 text-base md:text-lg font-medium leading-relaxed">
                    Saiba como a Associação Comercial e Industrial de Panambi (ACI) protege, coleta e utiliza suas informações.
                </p>
            </header>

            {/* ================= CONTEÚDO COM SIDEBAR ================= */}
            <div className="flex flex-col lg:flex-row gap-12 items-start relative">

                {/* SIDEBAR DE NAVEGAÇÃO (Sticky) */}
                <aside className="w-full lg:w-[280px] shrink-0 lg:sticky lg:top-8 hidden md:block bg-surface p-6 rounded-[32px] border border-gray-100 shadow-sm">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-6 ml-2">
                        Índice
                    </h3>
                    <nav className="flex flex-col space-y-1">
                        {[
                            { id: "introducao", label: "1. Introdução e Contato" },
                            { id: "definicoes", label: "2. Definições e Base Legal" },
                            { id: "coleta", label: "3. Coleta e Uso de Dados" },
                            { id: "compartilhamento", label: "4. Compartilhamento" },
                            { id: "direitos", label: "5. Seus Direitos" },
                            { id: "seguranca", label: "6. Segurança e Cookies" },
                            { id: "disposicoes", label: "7. Disposições Finais" },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => scrollToSection(item.id)}
                                className={`text-left px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeSection === item.id
                                        ? "bg-primary/10 text-primary"
                                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </nav>
                </aside>

                {/* ÁREA DE TEXTO LEGAL */}
                <main className="flex-1 w-full bg-surface p-8 md:p-12 rounded-[40px] border border-gray-100 shadow-sm text-gray-600 space-y-16">

                    {/* SEÇÃO 1 */}
                    <section id="introducao" className="scroll-mt-24 space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <span className="w-2 h-8 bg-primary rounded-full"></span>
                            Introdução
                        </h2>
                        <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                            <p>
                                A ASSOCIAÇÃO COMERCIAL E INDUSTRIAL DE PANAMBI (ACI), inscrita no Cadastro Nacional de Pessoa Jurídica (CNPJ) n° 91.986.257/0001-10, com sede na Avenida Konrad Adenauer, n° 555, no centro, do município de Panambi, RS, de CEP 98280-000, vem instituir sua Política de Privacidade, Cookies e Proteção de Dados, em conformidade com a Lei Geral de Proteção de Dados (LGPD).
                            </p>
                            <p>
                                Esta Política se destina a todas as pessoas físicas que são ou foram nossos consumidores, bem como aos empregados, parceiros, associados, diretores e fornecedores, os quais declaram sua concordância com o tratamento dos dados ao utilizar as plataformas físicas e virtuais da ACI-Panambi.
                            </p>
                        </div>

                        {/* Card de Contato DPO */}
                        <div className="mt-8 bg-blue-50/50 p-6 rounded-3xl border border-blue-100">
                            <h3 className="text-sm font-black text-blue-900 mb-2">Fale com nosso DPO</h3>
                            <p className="text-sm text-blue-700 mb-5">
                                Caso deseje saber informações relacionadas a seus dados pessoais, você pode entrar em contato com o Encarregado pelo Tratamento e Proteção de Dados Pessoais (DPO) designado pela ACI-Panambi:
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <a href="mailto:dpo@acipanambi.com.br" className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow text-sm font-bold text-gray-800">
                                    <HiOutlineMail className="text-blue-500" size={20} />
                                    dpo@acipanambi.com.br
                                </a>
                                <a href="tel:+555533759350" className="flex items-center gap-3 bg-white px-5 py-3 rounded-2xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow text-sm font-bold text-gray-800">
                                    <HiOutlinePhone className="text-blue-500" size={20} />
                                    (55) 3375-9350
                                </a>
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* SEÇÃO 2 */}
                    <section id="definicoes" className="scroll-mt-24 space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <span className="w-2 h-8 bg-primary rounded-full"></span>
                            Definições e Base Legal
                        </h2>
                        <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                            <p>No âmbito da Lei 13.709/2018, adotam-se as seguintes definições:</p>
                            <ul className="space-y-3 pl-2">
                                <li className="flex items-start gap-3">
                                    <HiOutlineCheckCircle className="text-emerald-500 shrink-0 mt-1" size={20} />
                                    <span><strong>Controlador:</strong> Pessoa natural ou jurídica a quem competem as decisões referentes ao tratamento de dados pessoais.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <HiOutlineCheckCircle className="text-emerald-500 shrink-0 mt-1" size={20} />
                                    <span><strong>Operador:</strong> Pessoa que realizará o tratamento de dados em nome do controlador.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <HiOutlineCheckCircle className="text-emerald-500 shrink-0 mt-1" size={20} />
                                    <span><strong>Titular:</strong> Pessoa singular e identificável a quem se referem os dados pessoais.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <HiOutlineCheckCircle className="text-emerald-500 shrink-0 mt-1" size={20} />
                                    <span><strong>Dados Pessoais Sensíveis:</strong> Informações sobre origem racial, convicção religiosa, opinião política, saúde, vida sexual ou dado biométrico.</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <HiOutlineCheckCircle className="text-emerald-500 shrink-0 mt-1" size={20} />
                                    <span><strong>Tratamento:</strong> Toda operação realizada com dados pessoais (coleta, armazenamento, eliminação, etc.).</span>
                                </li>
                            </ul>

                            <h3 className="text-lg font-black text-gray-800 mt-6 pt-4">Base Legal do Tratamento</h3>
                            <p>
                                A ACI-Panambi identifica o <strong>Legítimo Interesse</strong> como base legal para o tratamento dos dados pessoais, previsto no artigo 7°, inciso IX, da Lei 13.709/2018, sem prejuízo das demais bases legais contidas na LGPD, CLT e em seu Estatuto Social.
                            </p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* SEÇÃO 3 */}
                    <section id="coleta" className="scroll-mt-24 space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <span className="w-2 h-8 bg-primary rounded-full"></span>
                            Coleta e Tratamento de Dados
                        </h2>
                        <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                            <h3 className="text-lg font-black text-gray-800">Canais e Dados Coletados</h3>
                            <p>Os dados são coletados diretamente do titular através do site, e-mail, telefone, redes sociais e de forma presencial na sede da ACI, em feiras e eventos. Coletamos apenas os dados estritamente necessários para cada atendimento. Dados de menores de idade somente são coletados com o consentimento do responsável legal.</p>

                            <h3 className="text-lg font-black text-gray-800 mt-6 pt-4">Finalidades do Tratamento</h3>
                            <p>A ACI-Panambi trata os dados coletados afim de:</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 pl-2">
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Efetivar propostas e contratos.</li>
                                    <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Fornecer e divulgar cursos e eventos.</li>
                                    <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Promover marketing e pesquisas de satisfação.</li>
                                    <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Prestar suporte aos associados.</li>
                                    <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Cadastrar currículos e divulgar vagas.</li>
                                </ul>
                                <ul className="space-y-3">
                                    <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Consultar o birô de crédito SCPC.</li>
                                    <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Processar transações financeiras.</li>
                                    <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Intermediar usuários com fornecedores.</li>
                                    <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Cumprir obrigações legais e ordens judiciais.</li>
                                    <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Exercer direito de defesa em processos.</li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* SEÇÃO 4 */}
                    <section id="compartilhamento" className="scroll-mt-24 space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <span className="w-2 h-8 bg-primary rounded-full"></span>
                            Compartilhamento de Dados
                        </h2>
                        <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                            <p>Para a execução de nossas atividades e cumprimento de obrigações legais, o compartilhamento pode ser necessário. Compartilhamos com:</p>
                            <div className="flex flex-wrap gap-2 pt-2">
                                <span className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-bold text-gray-700">Associados</span>
                                <span className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-bold text-gray-700">Redes Sociais</span>
                                <span className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-bold text-gray-700">Parceiros e Fornecedores</span>
                                <span className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-bold text-gray-700">Órgãos de Crédito</span>
                                <span className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs font-bold text-gray-700">Governo/Autoridades</span>
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* SEÇÃO 5 */}
                    <section id="direitos" className="scroll-mt-24 space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <span className="w-2 h-8 bg-primary rounded-full"></span>
                            Direitos do Titular e Armazenamento
                        </h2>
                        <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                            <p>A ACI-Panambi está comprometida em garantir os direitos estabelecidos pela LGPD, possibilitando aos titulares :</p>
                            <ul className="space-y-2 pl-2">
                                <li className="flex items-start gap-2"><span className="text-emerald-500 font-black mt-0.5">✓</span> Confirmar a existência de tratamento e acessar os dados.</li>
                                <li className="flex items-start gap-2"><span className="text-emerald-500 font-black mt-0.5">✓</span> Corrigir dados incompletos ou desatualizados .</li>
                                <li className="flex items-start gap-2"><span className="text-emerald-500 font-black mt-0.5">✓</span> Solicitar anonimização, bloqueio ou eliminação de dados desnecessários.</li>
                                <li className="flex items-start gap-2"><span className="text-emerald-500 font-black mt-0.5">✓</span> Obter informações sobre compartilhamento.</li>
                                <li className="flex items-start gap-2"><span className="text-emerald-500 font-black mt-0.5">✓</span> Informar-se sobre a negativa de consentimento e suas consequências.</li>
                                <li className="flex items-start gap-2"><span className="text-emerald-500 font-black mt-0.5">✓</span> Opor-se a tratamentos realizados em casos de dispensa de consentimento.</li>
                            </ul>

                            <div className="bg-amber-50 p-5 rounded-2xl border border-amber-100 mt-4">
                                <h4 className="font-bold text-amber-900 mb-1">Prazo de Armazenamento</h4>
                                <p className="text-amber-800 text-sm">
                                    Armazenamos seus Dados Pessoais pelo tempo necessário para alcançar os fins para os quais foram coletados, para cumprir obrigações legais ou pelos prazos determinados pela ANDP.
                                </p>
                            </div>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* SEÇÃO 6 */}
                    <section id="seguranca" className="scroll-mt-24 space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <span className="w-2 h-8 bg-primary rounded-full"></span>
                            Segurança e Cookies
                        </h2>
                        <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                            <p>Adotamos práticas de segurança da informação rígidas para garantir a proteção dos seus dados pessoais, incluindo:</p>
                            <ul className="space-y-2 pl-2">
                                <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Rede corporativa protegida por Firewall, Anti-malware e Antivírus.</li>
                                <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Política de login e senha com rastreabilidade.</li>
                                <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Treinamentos contínuos para os empregados.</li>
                                <li className="flex items-start gap-2"><span className="text-primary font-black mt-0.5">•</span> Acesso interno restrito apenas a empregados previamente autorizados.</li>
                            </ul>

                            <h3 className="text-lg font-black text-gray-800 mt-6 pt-4">Uso de Cookies</h3>
                            <p>
                                Coletamos cookies necessários para facilitar a utilização e otimizar o desempenho do site. Você pode configurar seu navegador para bloqueá-los, porém algumas funções poderão não funcionar corretamente.
                            </p>
                        </div>
                    </section>

                    <hr className="border-gray-100" />

                    {/* SEÇÃO 7 */}
                    <section id="disposicoes" className="scroll-mt-24 space-y-6">
                        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                            <span className="w-2 h-8 bg-primary rounded-full"></span>
                            Disposições Finais
                        </h2>
                        <div className="space-y-4 text-sm md:text-base leading-relaxed font-medium">
                            <p><strong>Propriedade Intelectual:</strong> As informações e imagens pertencem à ACI-Panambi, não sendo permitidas cópias ou reproduções sem consentimento prévio.</p>
                            <p><strong>Links Externos:</strong> O site contém links para parceiros e terceiros. Não nos responsabilizamos pelos dados coletados por eles.</p>
                            <p><strong>Extensão dos Efeitos:</strong> Os termos aplicam-se exclusivamente aos dados disponibilizados pelo Titular para a utilização de nossos serviços.</p>
                            <p><strong>Tolerância:</strong> Eventuais tolerâncias ao cumprimento desta Política não constituirão novação ou renúncia de direitos.</p>
                            <p><strong>Atualizações:</strong> Esta Política está em constante atualização. Sempre que houver uma, haverá comunicação visível no site.</p>

                            <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 mt-6">
                                <p className="text-gray-500 text-sm">
                                    <strong>Foro e Resolução de Conflitos:</strong> Toda controvérsia oriunda dos termos desta Política será solucionada de acordo com a lei brasileira, sendo competente o foro da cidade de Panambi, Estado do Rio Grande do Sul.
                                </p>
                            </div>
                        </div>
                    </section>

                </main>
            </div>
        </div>
    );
}