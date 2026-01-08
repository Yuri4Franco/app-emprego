'use client';

import { useState } from "react";
import { IoIosArrowDown } from "react-icons/io"; // Certifique-se de ter react-icons instalado

// Dados do FAQ (Você pode mover isso para um arquivo separado depois se quiser)
const faqData = [
    {
        question: "O que é a ACI Empregos?",
        answer: "A ACI Empregos é uma plataforma online desenvolvida pela ACI - Panambi que conecta candidatos a emprego com empresas da região de Panambi. Nosso objetivo é facilitar o processo de recrutamento, oferecendo uma experiência intuitiva tanto para quem busca uma vaga quanto para as empresas que desejam contratar talentos locais."
    },
    {
        question: "O cadastro é gratuito?",
        answer: "Sim! O cadastro de currículos na ACI Empregos é totalmente gratuito para candidatos. Nossa missão é conectar talentos às melhores oportunidades de Panambi e região sem custos para quem busca emprego."
    },
    {
        question: "Como faço cadastrar meu currículo?",
        answer: "Para cadastrar seu currículo, clique no botão 'Área do Candidato' no topo da página. Se for seu primeiro acesso, selecione 'Cadastre-se', preencha seus dados pessoais e profissionais e pronto! Seu perfil já estará apto para se candidatar às vagas disponíveis."
    },
    {
        question: "Como as empresas entram em contato comigo?",
        answer: "As empresas podem visualizar seu currículo quando você se candidata a uma vaga. Se o seu perfil for compatível com os requisitos da vaga, a empresa poderá entrar em contato diretamente através dos dados fornecidos no seu cadastro. Se o seu curriculo estiver visível em nosso banco de talentos, recrutadores também podem encontrá-lo e entrar em contato proativamente."
    },
    {
        question: "Posso atualizar meu currículo depois de cadastrado?",
        answer: "Sim! Você pode atualizar seu currículo a qualquer momento acessando 'Meu Currículo' na Área do Candidato. Mantenha seus dados sempre atualizados para aumentar suas chances de ser encontrado pelas empresas."
    },
    {
        question: "O que é o Banco de Talentos da ACI - Panambi?",
        answer: "O Banco de Talentos da ACI - Panambi é uma funcionalidade que permite aos candidatos cadastrarem seus currículos em nossa plataforma, mesmo sem se candidatar a uma vaga específica. Isso aumenta suas chances de serem encontrados por recrutadores das maiores empresas de Panambi e região, que frequentemente buscam talentos diretamente em nosso banco."
    },
    {
        question: "Como participar do Banco de Talentos da ACI - Panambi?",
        answer: "Para participar do Banco de Talentos, basta se cadastrar na Área do Candidato e preencher seu currículo. Certifique-se de marcar a opção 'Participar do Banco de Talentos' durante o cadastro ou na seção 'Meu Currículo'. Assim, seu perfil ficará disponível para recrutadores que buscam talentos na nossa plataforma."
    },
    {
        question: "Por quanto tempo meu currículo ficará disponível no Banco de Talentos?",
        answer: "Seu currículo permanecerá por até 6 meses da data de cadastro, após isso ele será desativado automaticamente. Mas não se preocupe, nós entraremos em contato com você 20 dias antes do desativamento. Você pode ativar, desativar ou remover seu currículo a qualquer momento na seção 'Meu Currículo'."
    },
    {
        question: "Esqueci minha senha, e agora?",
        answer: "Sem problemas! Na página de login da Área do Candidato, clique em 'Esqueci minha senha'. Enviaremos um link de recuperação para o e-mail cadastrado em sua conta."
    },
    {
        question: "Posso me candidatar a mais de uma vaga?",
        answer: "Com certeza. Você pode se candidatar a quantas vagas desejar, desde que seu perfil seja compatível com os requisitos solicitados pela empresa."
    }
];

export default function FAQ() {
    // Estado para controlar qual item está aberto (null = nenhum)
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        // Se clicar no que já está aberto, fecha (null). Se não, abre o novo (index).
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="w-full py-20 bg-primary">
            <div className="max-w-4xl mx-auto px-6">

                {/* Cabeçalho da Seção */}
                <div className="text-center mb-12 space-y-4">
                    {/* MUDANÇA 2: Textos em Branco */}
                    <h2 className="text-3xl md:text-4xl font-bold text-white">
                        Dúvidas Frequentes
                    </h2>
                    <p className="text-white/80 max-w-2xl mx-auto">
                        Separamos as principais perguntas para te ajudar a navegar pela plataforma da ACI Empregos.
                    </p>
                </div>

                {/* Lista de Perguntas */}
                <div className="flex flex-col gap-4">
                    {faqData.map((item, index) => {
                        const isOpen = openIndex === index;

                        return (
                            <div
                                key={index}
                                // MUDANÇA 3 e 4: Lógica de Cores dos Cards
                                // Fechado: bg-white/5 (Translúcido), Borda transparente, Sem sombra
                                // Aberto: bg-surface (Branco puro), Borda branca, Sombra
                                className={`rounded-2xl border transition-all duration-300 ${isOpen
                                        ? 'bg-surface border-white shadow-lg'
                                        : 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/30'
                                    }`}
                            >
                                {/* Botão da Pergunta */}
                                <button
                                    onClick={() => toggleFAQ(index)}
                                    className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                                >
                                    {/* MUDANÇA 5: Cor do Texto da Pergunta */}
                                    {/* Aberto: text-primary (Azul escuro) | Fechado: text-white */}
                                    <span className={`text-lg font-medium transition-colors ${isOpen ? 'text-primary' : 'text-white'
                                        }`}>
                                        {item.question}
                                    </span>

                                    {/* MUDANÇA 6: Cor da Seta */}
                                    <IoIosArrowDown
                                        className={`text-xl transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary' : 'rotate-0 text-white'
                                            }`}
                                    />
                                </button>

                                {/* Conteúdo da Resposta */}
                                <div
                                    className={`grid overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100 pb-6' : 'grid-rows-[0fr] opacity-0'
                                        }`}
                                >
                                    <div className="overflow-hidden px-6">
                                        {/* MUDANÇA 7: Cor do Texto da Resposta (Quando aberto, fundo é branco) */}
                                        <p className="text-foreground leading-relaxed">
                                            {item.answer}
                                        </p>
                                    </div>
                                </div>

                            </div>
                        );
                    })}
                </div>

                {/* Call to Action Final */}
                <div className="mt-12 text-center">
                    {/* MUDANÇA 8: Textos do rodapé em branco */}
                    <p className="text-white/80">
                        Ainda tem dúvidas?{' '}
                        {/* Link usando a cor de hover-button para destaque */}
                        <a href="/contato" className="text-hover-button font-bold hover:underline hover:text-white transition-colors">
                            Entre em contato com a gente
                        </a>
                    </p>
                </div>

            </div>
        </section>
    );
}