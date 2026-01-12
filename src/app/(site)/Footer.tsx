'use client';

import Image from "next/image";
import Link from "next/link";
import Logo from "@/src/assets/logos/logo-transparente.png";
import { FaInstagram, FaLinkedin, FaFacebookSquare, FaWhatsapp, FaExternalLinkAlt } from "react-icons/fa";
import { HiOutlineMail, HiOutlineLocationMarker, HiOutlinePhone } from "react-icons/hi";

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full bg-white border-t border-gray-200 pt-16 pb-8 shadow-[0px_-10px_15px_-3px_rgba(0,0,0,0.1)]">
            <div className="max-w-7xl mx-auto px-6 md:px-8">

                {/* --- GRID PRINCIPAL --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* COLUNA 1: Marca e Sobre */}
                    <div className="space-y-10">
                        <div className="h-16 relative w-40">
                            <Image
                                src={Logo}
                                alt="Logo ACI Panambi"
                                className="object-contain object-left"
                            />
                        </div>
                        <p className="text-gray-500 text-sm leading-relaxed">
                            Conectando talentos e empresas para impulsionar o desenvolvimento de Panambi e região. Uma iniciativa da Associação Comercial e Industrial.
                        </p>
                        <div className="flex items-center gap-4">
                            {/* Redes Sociais com Hover na cor da marca */}
                            <a href="https://www.instagram.com/acipanambirs/" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1459ad] transition-colors text-2xl">
                                <FaInstagram />
                            </a>
                            <a href="https://www.facebook.com/acipanambirs" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1459ad] transition-colors text-2xl">
                                <FaFacebookSquare />
                            </a>
                            <a href="https://br.linkedin.com/company/associa%C3%A7%C3%A3o-comercial-e-industrial" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#1459ad] transition-colors text-2xl">
                                <FaLinkedin />
                            </a>
                        </div>
                    </div>

                    {/* COLUNA 2: Links Rápidos */}
                    <div>
                        <h3 className="text-gray-900 font-bold mb-6">Navegação</h3>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <Link href="/" className="text-gray-600 hover:text-[#1459ad] transition-colors">Início</Link>
                            </li>
                            <li>
                                <Link href="/vagas" className="text-gray-600 hover:text-[#1459ad] transition-colors">Vagas Disponíveis</Link>
                            </li>
                            <li>
                                <Link href="/empresas" className="text-gray-600 hover:text-[#1459ad] transition-colors">Para Empresas</Link>
                            </li>
                            <li>
                                <Link href="https://acipanambi.com/" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#1459ad] transition-colors">Sobre a ACI <FaExternalLinkAlt className="inline text-[10px] relative -top-0.5" /> </Link>
                            </li>
                            <li>
                                <Link href="/login" className="text-gray-600 hover:text-[#1459ad] transition-colors">Área do Candidato</Link>
                            </li>
                        </ul>
                    </div>

                    {/* COLUNA 3: Legal & Suporte */}
                    <div>
                        <h3 className="text-gray-900 font-bold mb-6">Suporte</h3>
                        <ul className="space-y-4 text-sm">
                            <li>
                                <Link href="/faq" className="text-gray-600 hover:text-[#1459ad] transition-colors">Dúvidas Frequentes</Link>
                            </li>
                            <li>
                                <Link href="/termos" className="text-gray-600 hover:text-[#1459ad] transition-colors">Termos de Uso</Link>
                            </li>
                            <li>
                                <Link href="/privacidade" className="text-gray-600 hover:text-[#1459ad] transition-colors">Política de Privacidade</Link>
                            </li>
                        </ul>
                    </div>

                    {/* COLUNA 4: Contato (Essencial para Instituições) */}
                    <div>
                        <h3 className="text-gray-900 font-bold mb-6">Contato</h3>
                        <ul className="space-y-4 text-sm text-gray-600">
                            <li className="flex items-start gap-3">
                                <HiOutlineLocationMarker className="text-xl text-[#1459ad] shrink-0" />
                                <span>
                                    R. Konrad Adenauer, 555 - Sala B - Centro, Panambi - RS, 98280-000
                                </span>
                            </li>
                            <li className="flex items-center gap-3">
                                <HiOutlinePhone className="text-xl text-[#1459ad] shrink-0" />
                                <span>(55) 3375-9350</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <HiOutlineMail className="text-xl text-[#1459ad] shrink-0" />
                                <span>recepcao@aci.panambi.com.br</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <FaWhatsapp className="text-xl text-[#1459ad] shrink-0" />
                                <a href="https://wa.me/555533759350" target="_blank" rel="noopener noreferrer" className="hover:text-[#1459ad] transition-colors">Falar no WhatsApp</a>
                            </li>
                        </ul>
                    </div>

                </div>

                {/* --- RODAPÉ INFERIOR (Copyright) --- */}
                <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-sm text-gray-500 text-center md:text-left">
                        &copy; {currentYear} ACI Panambi. Todos os direitos reservados.
                    </p>

                    <p className="text-sm text-gray-400 flex items-center gap-1">
                        Desenvolvido por
                        <a
                            href="https://www.linkedin.com/in/yuri-antunes-franco-a20792140/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-gray-600 hover:text-[#1459ad] transition-colors"
                        >
                            Yuri Antunes Franco
                        </a>
                    </p>
                </div>

            </div>
        </footer>
    );
}