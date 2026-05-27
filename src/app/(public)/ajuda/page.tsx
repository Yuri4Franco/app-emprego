"use client";

import { useState } from "react";
import Link from "next/link";
import {
    HiOutlineSearch,
    HiOutlineChevronDown,
    HiOutlineSparkles,
} from "react-icons/hi";
import {
    HiOutlineUserPlus,
    HiOutlineDocumentText,
    HiOutlineBriefcase,
    HiOutlineChatBubbleLeftRight
} from "react-icons/hi2";

export default function CentralAjudaPage() {
    const [busca, setBusca] = useState("");
    const [faqAberto, setFaqAberto] = useState<number | null>(null);

    const faqs = [
        {
            id: 1,
            pergunta: "Esqueci a minha senha, o que faço?",
            resposta: "Na tela de login, clique em 'Esqueci minha senha'. Enviaremos um link de recuperação para o seu e-mail cadastrado imediatamente."
        },
        {
            id: 2,
            pergunta: "As empresas podem ver os meus dados de contato?",
            resposta: "Apenas as empresas para as quais você se candidatou ativamente ou que encontraram seu perfil compatível no Banco de Talentos terão acesso ao seu WhatsApp e e-mail para agendar entrevistas."
        },
        {
            id: 3,
            pergunta: "Quanto custa para usar a plataforma?",
            resposta: "Para todos os candidatos e trabalhadores da região, a plataforma é 100% gratuita para sempre. Você pode cadastrar seu perfil e se candidatar a quantas vagas quiser."
        }
    ];

    return (
        <div className="pb-24 animate-in fade-in duration-500">

            {/* BANNER PRINCIPAL (HERO) */}
            <section className="bg-blue-600 px-4 py-16 md:py-20 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -left-24 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-10 -right-10 w-64 h-64 bg-white opacity-10 rounded-full blur-2xl"></div>
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10 space-y-4">
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
                        Como podemos ajudar?
                    </h1>
                    <p className="text-blue-100 text-base md:text-lg font-medium max-w-xl mx-auto">
                        Encontre guias visuais passo a passo e respostas rápidas para tirar o máximo proveito do nosso portal de vagas.
                    </p>

                    <div className="max-w-xl mx-auto pt-4 relative">
                        <HiOutlineSearch className="absolute left-4 top-[34px] -translate-y-1/2 text-gray-400" size={22} />
                        <input
                            type="text"
                            placeholder="Busque por dúvidas (ex: currículo, senha)..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white shadow-xl focus:outline-none focus:ring-4 focus:ring-blue-400/20 transition-all text-sm text-gray-700 placeholder-gray-400"
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                    </div>
                </div>
            </section>

            {/* CONTEÚDO CENTRAL */}
            <div className="max-w-5xl mx-auto p-4 md:p-8 -mt-6 relative z-20 space-y-16">

                {/* SEÇÃO DE TRILHAS / GUIAS COMPLETOS */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                            <HiOutlineSparkles size={20} />
                        </div>
                        <h2 className="text-xl font-black text-gray-900 tracking-tight">Guias Passo a Passo</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                        {/* CARD 1: CRIAR CONTA */}
                        <Link href="/ajuda/como-criar-conta" className="group bg-white p-6 rounded-[24px] border border-gray-200/60 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 bg-gray-50 group-hover:bg-blue-50 group-hover:scale-105 transition-all rounded-2xl flex items-center justify-center text-blue-600 border border-gray-100">
                                <HiOutlineUserPlus size={28} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Como criar sua conta</h3>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">O início de tudo. Aprenda a se registrar e validar seu acesso pelo PC ou celular.</p>
                            </div>
                        </Link>

                        {/* CARD 2: CURRÍCULO 100% */}
                        <Link href="/ajuda/curriculo-100" className="group bg-white p-6 rounded-[24px] border border-gray-200/60 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 bg-gray-50 group-hover:bg-blue-50 group-hover:scale-105 transition-all rounded-2xl flex items-center justify-center text-blue-600 border border-gray-100">
                                <HiOutlineDocumentText size={28} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Currículo 100%</h3>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">Preencha seus dados, experiências e habilidades para atingir a pontuação máxima.</p>
                            </div>
                        </Link>

                        {/* CARD 3: BUSCAR VAGAS */}
                        <Link href="/ajuda/como-buscar-vagas" className="group bg-white p-6 rounded-[24px] border border-gray-200/60 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col items-center text-center gap-4">
                            <div className="w-14 h-14 bg-gray-50 group-hover:bg-blue-50 group-hover:scale-105 transition-all rounded-2xl flex items-center justify-center text-blue-600 border border-gray-100">
                                <HiOutlineBriefcase size={28} />
                            </div>
                            <div className="space-y-1">
                                <h3 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">Buscar e se Candidatar</h3>
                                <p className="text-xs text-gray-500 font-medium leading-relaxed">Como utilizar os filtros inteligentes para achar e disputar as vagas ideais.</p>
                            </div>
                        </Link>

                    </div>
                </section>

                {/* SEÇÃO FAQ (PERGUNTAS FREQUENTES TRADICIONAIS) */}
                <section className="bg-gray-50 p-6 md:p-10 rounded-[32px] border border-gray-200/60">
                    <div className="flex flex-col lg:flex-row gap-10">

                        <div className="lg:w-1/3 space-y-3">
                            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center border border-purple-100">
                                <HiOutlineChatBubbleLeftRight size={24} />
                            </div>
                            <h2 className="text-xl font-black text-gray-900 tracking-tight">Respostas Rápidas</h2>
                            <p className="text-sm text-gray-500 font-medium leading-relaxed">Encontre resoluções diretas para as dúvidas mais comuns do dia a dia da plataforma.</p>
                        </div>

                        <div className="lg:w-2/3 space-y-3">
                            {faqs.map((faq) => (
                                <div
                                    key={faq.id}
                                    className="bg-white border border-gray-200 rounded-2xl overflow-hidden transition-all hover:border-blue-200"
                                >
                                    <button
                                        onClick={() => setFaqAberto(faqAberto === faq.id ? null : faq.id)}
                                        className="w-full px-5 py-4 flex items-center justify-between text-left focus:outline-none"
                                    >
                                        <span className="font-bold text-gray-800 text-sm pr-4">{faq.pergunta}</span>
                                        <HiOutlineChevronDown
                                            size={18}
                                            className={`text-gray-400 transition-transform duration-300 ${faqAberto === faq.id ? "rotate-180 text-blue-600" : ""}`}
                                        />
                                    </button>

                                    <div
                                        className={`px-5 overflow-hidden transition-all duration-300 ease-in-out ${faqAberto === faq.id ? "max-h-40 pb-4 opacity-100" : "max-h-0 opacity-0"
                                            }`}
                                    >
                                        <p className="text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-3">
                                            {faq.resposta}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

            </div>
        </div>
    );
}