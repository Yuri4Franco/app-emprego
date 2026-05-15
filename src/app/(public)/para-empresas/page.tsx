'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ButtonType } from "@/src/components/ButtonType";
import BgImagem from "@/src/assets/backgrounds/bg-t1.webp";
import FtPainel from "@/src/assets/designs/foto-painel.webp";
import {
    HiOutlineOfficeBuilding,
    HiOutlineUserGroup,
    HiOutlineCheckCircle,
    HiOutlineMail,
    HiOutlineChatAlt2,
    HiOutlineDocumentText,
    HiOutlineCursorClick,
    HiOutlineSearch
} from "react-icons/hi";
import { IoIosArrowDown } from "react-icons/io";
import ContatoEmpresaForm from "@/src/components/ContatoEmpresaForm";

const faqData = [
    {
        question: "Preciso ser associado da ACI-Panambi?",
        answer: "Não precisa ser nosso associado para utilizar a plataforma. Entre em contato para entender as condições exclusivas para membros e as opções para não-sócios."
    },
    {
        question: "Tem algum custo?",
        answer: "Apenas para não associados. Nós oferecemos pacotes de curriculos e pagamentos por vagas avulsas. Entre em contato conosco para saber mais."
    },
    {
        question: "É só para empresas de Panambi?",
        answer: "Nosso foco principal é conectar talentos e empresas de Panambi e região (Condor, Ijuí, etc), fortalecendo a economia local. Se sua empresa é de fora mas quer contratar aqui, você é muito bem-vindo!"
    },
    {
        question: "É para empresas de todos os portes?",
        answer: "Com certeza! Desde o pequenas empresas com uma demanda pontual de talento até grandes indústrias com processos seletivos contínuos. A plataforma se adapta à sua necessidade."
    },
];

export default function EmpresasPage() {
    // Estado para o FAQ
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const toggleFAQ = (index: number) => setOpenIndex(openIndex === index ? null : index);

    return (
        <div className="w-full bg-white">

            {/* --- 1. HERO SECTION --- */}
            {/* Fundo Azul para impacto corporativo, texto branco */}
            <section className="relative w-full py-32 md:py-32 bg-primary overflow-hidden">

                {/* --- INÍCIO DA MODIFICAÇÃO DO BACKGROUND --- */}

                {/*
           Este é o container inclinado original que você tinha.
           Adicionei 'overflow-hidden' para que a imagem não vaze das bordas inclinadas.
           Aumentei um pouco a largura (w-3/5) para a imagem aparecer mais.
        */}
                <div className="absolute top-0 right-0 w-full md:w-3/5 h-full pointer-events-none overflow-hidden">
                    {/* CAMADA 1: A Imagem de Fundo */}
                    {/* Usamos style inline para pegar o .src da imagem importada com segurança */}
                    <div
                        className="absolute inset-0 bg-cover bg-center object-cover "
                        style={{
                            backgroundImage: `url(${BgImagem.src})`,
                            filter: 'brightness(0.8)'
                        }}
                    ></div>

                    {/* CAMADA 2: O Degradê de Fusão (Overlay) */}
                    {/*
               Este é o segredo do efeito. É um degradê que vai da esquerda para a direita (to-r).
               - 'from-primary': Começa na cor sólida do seu fundo (esquerda)
               - 'via-primary/60': Fica semi-transparente no meio (ajuste o /60 se quiser mais ou menos)
               - 'to-transparent/10': Fica quase totalmente transparente na direita, revelando a imagem.
            */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/80 to-primary/60"></div>

                </div>
                {/* --- FIM DA MODIFICAÇÃO DO BACKGROUND --- */}


                <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
                    <div className="max-w-3xl">
                        <span className="inline-block py-1 px-3 rounded-full bg-blue-400/20 text-blue-100 text-sm font-bold tracking-wide mb-6 border border-blue-400/30">
                            PARA EMPRESAS
                        </span>
                        <h1 className="text-2xl md:text-5xl lg:text-5xl font-bold text-white leading-tight mb-6">
                            Publique sua vaga em minutos e encontre o talento certo.
                        </h1>
                        <p className="text-lg md:text-xl text-blue-100 mb-8 leading-relaxed max-w-2xl">
                            Chega de currículos perdidos em caixas de e-mail ou redes sociais. A ACI Vagas é a nova plataforma oficial da Associação Comercial e Industrial de panambi para centralizar e profissionalizar o recrutamento na nossa cidade. Conectamos sua empresa diretamente aos candidatos locais de forma organizada, ágil e confiável.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <ButtonType href="#contato" variant="secondary" size="lg" className="shadow-lg shadow-blue-900/20">
                                Falar com um consultor
                            </ButtonType>
                            <ButtonType href="https://acipanambi.com/" variant="outline" size="lg" className="border-blue-200 text-blue-100 hover:bg-white/10 hover:border-white">
                                Conhecer a ACI
                            </ButtonType>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 2. COMO FUNCIONA (STEPS) --- */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Como funciona?</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Simplificamos o processo para você focar no que importa: as pessoas.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Passo 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 text-9xl font-bold text-gray-50  group-hover:text-blue-50 transition-colors select-none">1</div>
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-primary text-2xl mb-6 relative z-10">
                                <HiOutlineChatAlt2 />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10">Ative seu acesso</h3>
                            <p className="text-gray-600 relative z-10">Converse com a gente e formalize o seu cadastro na plataforma.</p>
                        </div>

                        {/* Passo 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 text-9xl font-bold text-gray-50 group-hover:text-blue-50 transition-colors select-none">2</div>
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-primary text-2xl mb-6 relative z-10">
                                <HiOutlineDocumentText />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10">Cadastre sua vaga</h3>
                            <p className="text-gray-600 relative z-10">Preencha os detalhes, requisitos e benefícios da oportunidade.</p>
                        </div>

                        {/* Passo 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 text-9xl font-bold text-gray-50  group-hover:text-blue-50 transition-colors select-none">3</div>
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-primary text-2xl mb-6 relative z-10">
                                <HiOutlineCursorClick />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10">Receba candidatos</h3>
                            <p className="text-gray-600 relative z-10">Visualize currículos padronizados e organize sua seleção pelo painel.</p>
                        </div>

                        {/* Passo 4 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 text-9xl font-bold text-gray-50  group-hover:text-blue-50 transition-colors select-none">4</div>
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-primary text-2xl mb-6 relative z-10">
                                <HiOutlineCheckCircle />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10">Contrate o talento</h3>
                            <p className="text-gray-600 relative z-10">Encontre o profissional certo em Panambi e região para o seu time.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 3. BENEFÍCIOS (Turbine seu RH) --- */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-6 md:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-16">

                        {/* Texto */}
                        <div className="w-full md:w-1/2 space-y-8">
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 leading-tight">
                                Turbine seu RH com a gente
                            </h2>

                            <div className="space-y-6">
                                <div className="flex gap-4">
                                    <div className="w-12 h-12 shrink-0 bg-red-50 rounded-full flex items-center justify-center text-red-500 text-xl">
                                        <HiOutlineMail />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">Adeus, caixa de e-mail caótica</h3>
                                        <p className="text-gray-600 mt-1">Centralize tudo aqui. Currículos padronizados em um único painel intuitivo, sem perder arquivos.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 shrink-0 bg-blue-50 rounded-full flex items-center justify-center text-primary text-xl">
                                        <HiOutlineSearch />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">O radar certo em Panambi</h3>
                                        <p className="text-gray-600 mt-1">Encontre talentos locais com mais facilidade. Nossa base é focada em quem mora ou quer trabalhar na região.</p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 shrink-0 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 text-xl">
                                        <HiOutlineOfficeBuilding />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">Selo de confiança ACI</h3>
                                        <p className="text-gray-600 mt-1">Sua vaga tem mais credibilidade e alcance ao ser divulgada na plataforma oficial da Associação Comercial.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Imagem / Visual Ilustrativo */}
                        <div className="w-full md:w-1/2 min-h-[400px] flex items-center justify-center relative overflow-hidden">
                            {/* Aqui você colocaria uma imagem real. Como placeholder, uso um padrão abstrato */}
                            <Image src={FtPainel} alt="Ilustração de RH" className="w-full h-auto object-cover rounded-2xl shadow-lg" />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 4. NÚMEROS (Social Proof) --- */}
            <section className="bg-primary py-16 text-white">
                <div className="max-w-7xl mx-auto px-6 md:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
                    </div>
                </div>
            </section>

            {/* --- 5. FAQ (Especifico para Empresas) --- */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">Perguntas Frequentes</h2>
                        <p className="text-gray-600">Tire suas dúvidas sobre como contratar pela ACI Vagas.</p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {faqData.map((item, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <div key={index} className={`bg-white rounded-xl border transition-all duration-300 ${isOpen ? 'border-primary shadow-md' : 'border-gray-200 hover:border-blue-300'}`}>
                                    <button onClick={() => toggleFAQ(index)} className="w-full flex items-center justify-between p-6 text-left focus:outline-none">
                                        <span className={`text-lg font-medium ${isOpen ? 'text-primary' : 'text-gray-700'}`}>{item.question}</span>
                                        <IoIosArrowDown className={`text-primary transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'}`} />
                                    </button>
                                    <div className={`grid overflow-hidden transition-all duration-300 ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'}`}>
                                        <div className="overflow-hidden px-6 text-gray-600">{item.answer}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* --- 6. FORMULÁRIO DE CONTATO --- */}
            <ContatoEmpresaForm />

        </div>
    );
}