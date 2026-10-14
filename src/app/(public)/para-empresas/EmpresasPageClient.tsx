"use client";

import { useEffect, useState } from "react";
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
    HiOutlineSearch,
} from "react-icons/hi";
import { IoIosArrowDown } from "react-icons/io";
import ContatoEmpresaForm from "@/src/components/ContatoEmpresaForm";
import { RandomDesignImage } from "../RandomDesignImagem";
import api from "@/src/services/api";

interface MetricasGerais {
    curriculos_ativos: number;
    empresas_cadastradas: number;
    vagas_divulgadas: number;
    candidaturas_realizadas: number;
    candidatos_ativos: number;
}

const faqData = [
    {
        question: "Preciso ser associado da ACI-Panambi?",
        answer:
            "Não precisa ser nosso associado para utilizar a plataforma. Entre em contato para entender as condições exclusivas para membros e as opções para não associados.",
    },
    {
        question: "Tem algum custo?",
        answer:
            "Apenas para não associados. Nós oferecemos pacotes de curriculos e pagamentos por vagas avulsas. Entre em contato conosco para saber mais.",
    },
    {
        question: "É só para empresas de Panambi?",
        answer:
            "Nosso foco principal é conectar talentos e empresas de Panambi e região (Condor, Ijuí, etc), fortalecendo a economia local. Se sua empresa é de fora mas quer contratar aqui, você é muito bem-vindo!",
    },
    {
        question: "É para empresas de todos os portes?",
        answer:
            "Com certeza! Desde o pequenas empresas com uma demanda pontual de talento até grandes indústrias com processos seletivos contínuos. A plataforma se adapta à sua necessidade.",
    },
];

export default function EmpresasPageClient({ metricasIniciais }: { metricasIniciais: MetricasGerais }) {
    // Estado para o FAQ
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const toggleFAQ = (index: number) =>
        setOpenIndex(openIndex === index ? null : index);

    const [mesesNoAr, setMesesNoAr] = useState<number | null>(null);

    useEffect(() => {
        const dataLancamento = new Date('2026-06-26T00:00:00');
        const dataAtual = new Date();

        let meses = (dataAtual.getFullYear() - dataLancamento.getFullYear()) * 12;
        meses -= dataLancamento.getMonth();
        meses += dataAtual.getMonth();

        // Subtrai 1 mês se o dia atual for antes do dia 26
        if (dataAtual.getDate() < dataLancamento.getDate()) {
            meses--;
        }

        setMesesNoAr(meses > 0 ? meses : 1); // Garante a exibição mínima de 1 mês
    }, []);


    return (
        <div className="w-full bg-white">
            {/* --- 1. HERO SECTION --- */}
            {/* Fundo Azul para impacto corporativo, texto branco */}
            <section className="relative w-full py-32 md:py-32 bg-primary overflow-hidden">
                {/* --- INÍCIO DA MODIFICAÇÃO DO BACKGROUND --- */}

                <div className="absolute top-0 right-0 w-full md:w-3/5 h-full pointer-events-none overflow-hidden">
                    {/* CAMADA 1: A Imagem de Fundo */}
                    {/* Usamos style inline para pegar o .src da imagem importada com segurança */}
                    <div
                        className="absolute inset-0 bg-cover bg-center object-cover "
                        style={{
                            backgroundImage: `url(${BgImagem.src})`,
                            filter: "brightness(0.8)",
                        }}
                    ></div>

                    {/* CAMADA 2: O Degradê de Fusão (Overlay) */}

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
                            Chega de currículos perdidos em caixas de e-mail ou redes sociais.
                            A ACI Vagas é a nova plataforma oficial da Associação Comercial e
                            Industrial de Panambi para centralizar e profissionalizar o
                            recrutamento na nossa cidade. Conectamos sua empresa diretamente
                            aos candidatos locais de forma organizada, ágil e confiável.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <ButtonType
                                href="#contato"
                                variant="secondary"
                                size="lg"
                                className="shadow-lg shadow-blue-900/20"
                            >
                                Falar com um consultor
                            </ButtonType>
                            <a
                                href="https://acipanambi.com/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="border border-blue-200 bg-transparent text-blue-100 hover:bg-white/10 hover:text-white hover:border-white cursor-pointer inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed h-14 px-8 text-base"
                            >
                                Conhecer a ACI - Panambi
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- BANCO DE TALENTOS (Busca Ativa) --- */}
            <section className="py-24 bg-gradient-to-b from-gray-50 to-white border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-6 md:px-8">
                    <div className="flex flex-col-reverse md:flex-row items-center gap-16">

                        {/* Visual Ilustrativo (Esquerda) */}
                        <div className="w-full md:w-1/2 flex justify-center relative">
                            {/* Elemento de design flutuante atrás da imagem para dar destaque */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-100 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

                            <div className="relative z-10 w-full max-w-md">
                                <RandomDesignImage />
                            </div>
                        </div>

                        {/* Texto de Venda (Direita) */}
                        <div className="w-full md:w-1/2 space-y-8">
                            <div>
                                <span className="inline-flex items-center gap-2 py-1 px-3 rounded-full bg-emerald-50 text-emerald-600 text-xs font-black tracking-widest uppercase mb-4 border border-emerald-100">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                    Busca Ativa
                                </span>
                                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                                    Acesso exclusivo ao <span className="text-primary">Banco de Talentos</span>
                                </h2>
                                <p className="text-gray-600 mt-4 text-lg font-medium leading-relaxed">
                                    Não espere o candidato perfeito bater na sua porta. Com a ACI Vagas, sua empresa ganha acesso total a um banco repleto de profissionais de Panambi e região. Vá direto à fonte!
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="flex items-start gap-4 group">
                                    <div className="w-12 h-12 shrink-0 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:border-blue-200 group-hover:bg-blue-50 transition-all shadow-sm">
                                        <HiOutlineSearch size={22} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Filtros de Alta Precisão</h4>
                                        <p className="text-gray-500 font-medium mt-1 leading-relaxed">
                                            Encontre exatamente quem você precisa em segundos. Filtre por área de atuação, habilidades, nível de formação, PCD e muito mais.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 group">
                                    <div className="w-12 h-12 shrink-0 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:border-blue-200 group-hover:bg-blue-50 transition-all shadow-sm">
                                        <HiOutlineDocumentText size={22} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Leitura Padronizada</h4>
                                        <p className="text-gray-500 font-medium mt-1 leading-relaxed">
                                            Esqueça a bagunça de PDFs com formatos diferentes. Analise perfis limpos, focados nas habilidades e na trajetória do talento.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4 group">
                                    <div className="w-12 h-12 shrink-0 bg-white border border-gray-100 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary group-hover:border-blue-200 group-hover:bg-blue-50 transition-all shadow-sm">
                                        <HiOutlineCursorClick size={22} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg">Conexão Imediata</h4>
                                        <p className="text-gray-500 font-medium mt-1 leading-relaxed">
                                            Gostou de um perfil? Com apenas um clique, acesse o contato do candidato e inicie o seu processo seletivo na mesma hora.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-4">
                                <ButtonType href="#contato" variant="primary" className="shadow-lg shadow-blue-500/20 px-8 py-4 w-full sm:w-auto flex justify-center hover:scale-105 active:scale-95 transition-all">
                                    Quero ter acesso ao banco
                                </ButtonType>
                            </div>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- 4. NÚMEROS (Social Proof) --- */}
            <section className="relative py-24 bg-primary overflow-hidden">
                {/* Efeitos de fundo: Apenas tons de branco e azul claro para manter o tom corporativo */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -top-32 -left-32 w-96 h-96 bg-white rounded-full blur-3xl mix-blend-screen"></div>
                    <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-blue-300 rounded-full blur-3xl mix-blend-screen opacity-50"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
                </div>

                <div className="max-w-7xl mx-auto px-6 md:px-8 relative z-10">
                    <div className="text-center mb-16 space-y-4">
                        <span className="inline-block py-1 px-4 rounded-full bg-white/10 text-blue-100 text-sm font-bold tracking-widest uppercase border border-white/20 backdrop-blur-sm">
                            Nosso Impacto
                        </span>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight">
                            A força da ACI Vagas
                        </h2>
                        {/* A informação de lançamento inserida de forma elegante no texto */}
                        <p className="text-blue-100 max-w-2xl mx-auto text-lg leading-relaxed">
                            Desde o nosso lançamento em <strong>junho de 2026</strong>, já ajudamos dezenas de empresas a encontrar os melhores candidatos. Os números comprovam:
                        </p>
                    </div>

                    {/* Grid Corporativo: Tons monocromáticos azuis/brancos */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6">

                        {/* 1. Total de Usuários (Candidatos Ativos) */}
                        <div className="flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                            <div className="text-4xl md:text-5xl lg:text-5xl font-black text-white tracking-tighter mb-2">
                                {metricasIniciais.candidatos_ativos}
                            </div>
                            <span className="text-blue-200 font-bold uppercase tracking-wider text-[10px] md:text-xs text-center">
                                Total de Usuários
                            </span>
                        </div>

                        {/* 2. Currículos Disponíveis */}
                        <div className="flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                            <div className="text-4xl md:text-5xl lg:text-5xl font-black text-white tracking-tighter mb-2">
                                {metricasIniciais.curriculos_ativos}
                            </div>
                            <span className="text-blue-200 font-bold uppercase tracking-wider text-[10px] md:text-xs text-center">
                                Currículos Disponíveis
                            </span>
                        </div>

                        {/* 3. Empresas Parceiras */}
                        <div className="flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                            <div className="text-4xl md:text-5xl lg:text-5xl font-black text-white tracking-tighter mb-2">
                                {metricasIniciais.empresas_cadastradas}
                            </div>
                            <span className="text-blue-200 font-bold uppercase tracking-wider text-[10px] md:text-xs text-center">
                                Empresas Parceiras
                            </span>
                        </div>

                        {/* 4. Vagas Divulgadas */}
                        <div className="flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                            <div className="text-4xl md:text-5xl lg:text-5xl font-black text-white tracking-tighter mb-2">
                                {metricasIniciais.vagas_divulgadas}
                            </div>
                            <span className="text-blue-200 font-bold uppercase tracking-wider text-[10px] md:text-xs text-center">
                                Vagas Divulgadas
                            </span>
                        </div>

                        {/* 5. Candidaturas Feitas */}
                        <div className="col-span-2 lg:col-span-1 flex flex-col items-center justify-center p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
                            <div className="text-4xl md:text-5xl lg:text-5xl font-black text-white tracking-tighter mb-2">
                                {metricasIniciais.candidaturas_realizadas}
                            </div>
                            <span className="text-blue-200 font-bold uppercase tracking-wider text-[10px] md:text-xs text-center">
                                Candidaturas Realizadas
                            </span>
                        </div>

                    </div>
                </div>
            </section>

            {/* --- 2. COMO FUNCIONA (STEPS) --- */}
            <section className="py-20 bg-gray-50">
                <div className="max-w-7xl mx-auto px-6 md:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Como funciona?
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Simplificamos o processo para você focar no que importa: as
                            pessoas. Publique vagas ou busque ativamente!
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {/* Passo 1 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 text-9xl font-bold text-gray-50  group-hover:text-blue-50 transition-colors select-none">
                                1
                            </div>
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-primary text-2xl mb-6 relative z-10">
                                <HiOutlineChatAlt2 />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10">
                                Ative seu acesso
                            </h3>
                            <p className="text-gray-600 relative z-10">
                                Converse com a gente e formalize o acesso da sua empresa na plataforma.
                            </p>
                        </div>

                        {/* Passo 2 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 text-9xl font-bold text-gray-50 group-hover:text-blue-50 transition-colors select-none">
                                2
                            </div>
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-primary text-2xl mb-6 relative z-10">
                                <HiOutlineSearch />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10">
                                Divulgue ou Busque
                            </h3>
                            <p className="text-gray-600 relative z-10">
                                Publique sua vaga ou use nossos filtros para procurar o perfil ideal diretamente no Banco de Talentos.
                            </p>
                        </div>

                        {/* Passo 3 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 text-9xl font-bold text-gray-50  group-hover:text-blue-50 transition-colors select-none">
                                3
                            </div>
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-primary text-2xl mb-6 relative z-10">
                                <HiOutlineCursorClick />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10">
                                Avalie e Conecte
                            </h3>
                            <p className="text-gray-600 relative z-10">
                                Receba candidaturas padronizadas ou inicie contato imediato com os profissionais que você encontrou na base.
                            </p>
                        </div>

                        {/* Passo 4 */}
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className="absolute -right-4 -top-4 text-9xl font-bold text-gray-50  group-hover:text-blue-50 transition-colors select-none">
                                4
                            </div>
                            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center text-primary text-2xl mb-6 relative z-10">
                                <HiOutlineCheckCircle />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 relative z-10">
                                Contrate com agilidade
                            </h3>
                            <p className="text-gray-600 relative z-10">
                                Feche a contratação do profissional certo em Panambi e região para o seu time.
                            </p>
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
                                        <h3 className="font-bold text-gray-800 text-lg">
                                            Adeus, caixa de e-mail caótica
                                        </h3>
                                        <p className="text-gray-600 mt-1">
                                            Centralize tudo aqui. Currículos padronizados em um único
                                            painel intuitivo, sem perder arquivos.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 shrink-0 bg-blue-50 rounded-full flex items-center justify-center text-primary text-xl">
                                        <HiOutlineSearch />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">
                                            O radar certo em Panambi
                                        </h3>
                                        <p className="text-gray-600 mt-1">
                                            Encontre talentos locais com mais facilidade. Nossa base é
                                            focada em quem mora ou quer trabalhar na região.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 shrink-0 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-500 text-xl">
                                        <HiOutlineUserGroup />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">
                                            Busca Ativa no Banco de Talentos
                                        </h3>
                                        <p className="text-gray-600 mt-1">
                                            Não espere o candidato bater na sua porta. Navegue pelo nosso
                                            banco de currículos usando filtros inteligentes e vá direto
                                            ao profissional ideal.
                                        </p>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-12 h-12 shrink-0 bg-amber-50 rounded-full flex items-center justify-center text-amber-500 text-xl">
                                        <HiOutlineOfficeBuilding />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-gray-800 text-lg">
                                            Selo de confiança ACI - Panambi
                                        </h3>
                                        <p className="text-gray-600 mt-1">
                                            Sua vaga tem mais credibilidade e alcance ao ser divulgada
                                            na plataforma oficial da Associação Comercial de
                                            Industrial de Panambi.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Imagem / Visual Ilustrativo */}
                        <div className="w-full md:w-1/2 min-h-[400px] flex items-center justify-center relative overflow-hidden">
                            {/* Aqui você colocaria uma imagem real. Como placeholder, uso um padrão abstrato */}
                            <Image
                                src={FtPainel}
                                alt="Ilustração de RH"
                                className="w-full h-auto object-cover rounded-2xl shadow-lg"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 5. FAQ (Especifico para Empresas) --- */}
            <section className="py-24 bg-gray-50">
                <div className="max-w-4xl mx-auto px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-4">
                            Perguntas Frequentes
                        </h2>
                        <p className="text-gray-600">
                            Tire suas dúvidas sobre como contratar pela ACI Vagas.
                        </p>
                    </div>

                    <div className="flex flex-col gap-4">
                        {faqData.map((item, index) => {
                            const isOpen = openIndex === index;
                            return (
                                <div
                                    key={index}
                                    className={`bg-white rounded-xl border transition-all duration-300 ${isOpen ? "border-primary shadow-md" : "border-gray-200 hover:border-blue-300"}`}
                                >
                                    <button
                                        onClick={() => toggleFAQ(index)}
                                        className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                                    >
                                        <span
                                            className={`text-lg font-medium ${isOpen ? "text-primary" : "text-gray-700"}`}
                                        >
                                            {item.question}
                                        </span>
                                        <IoIosArrowDown
                                            className={`text-primary transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
                                        />
                                    </button>
                                    <div
                                        className={`grid overflow-hidden transition-all duration-300 ${isOpen ? "grid-rows-[1fr] opacity-100 pb-6" : "grid-rows-[0fr] opacity-0"}`}
                                    >
                                        <div className="overflow-hidden px-6 text-gray-600">
                                            {item.answer}
                                        </div>
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
