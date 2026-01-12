'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "@/src/assets/logos/logo-transparente.png";
import NavLinks from "./NavLinks";
import { ButtonType } from "@/src/components/ButtonType";

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);

    // Novos estados para controlar o scroll
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    // 1. Lógica do Scroll (Aparecer/Desaparecer)
    useEffect(() => {
        const controlNavbar = () => {
            if (typeof window !== 'undefined') {
                const currentScrollY = window.scrollY;

                if (currentScrollY > lastScrollY && currentScrollY > 50) {
                    // Se estiver rolando para BAIXO e passou de 50px:
                    // Esconde o header (mas só se o menu mobile estiver fechado)
                    if (!isOpen) {
                        setIsVisible(false);
                    }
                } else {
                    // Se estiver rolando para CIMA: Mostra o header
                    setIsVisible(true);
                }

                setLastScrollY(currentScrollY);
            }
        };

        window.addEventListener('scroll', controlNavbar);

        // Limpeza
        return () => {
            window.removeEventListener('scroll', controlNavbar);
        };
    }, [lastScrollY, isOpen]);


    // 2. Travar o Scroll do Body quando o menu abrir (Mantido igual)
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);


    return (
        <header
            className={`
                fixed top-0 left-0 w-full z-[50] transition-transform duration-300 ease-in-out
                flex items-center justify-between px-6 md:px-16 py-4 bg-white border-b border-gray-200
                ${isVisible ? 'translate-y-0' : '-translate-y-full'} 
                ${isOpen ? '' : 'shadow-md'}
            `}
        >

            {/* LOGO */}
            <div className="h-16 md:h-20 z-[60] relative">
                <Link href="/" className="block h-full hover:opacity-80 transition-opacity" onClick={closeMenu}>
                    <Image
                        src={Logo}
                        alt="ACI Empregos Logo"
                        className="h-full w-auto object-contain"
                        priority
                    />
                </Link>
            </div>

            {/* NAV DESKTOP */}
            <div className="hidden md:flex items-center gap-6">
                <NavLinks direction="row" />
                <ButtonType href="/candidato/login" variant="primary" size="md">
                    Área do Candidato
                </ButtonType>
            </div>

            {/* --- BOTÃO HAMBURGUER --- */}
            <button
                onClick={toggleMenu}
                className="md:hidden relative z-[90] flex flex-col justify-center items-center w-10 h-10 cursor-pointer group"
                aria-label="Menu"
            >
                {/* Barra 1 */}
                <div className={`h-[4px] bg-[#1459ad] rounded-full transition-all duration-300 ease-in-out transform origin-center 
                    ${isOpen ? 'w-[80%] absolute rotate-45' : 'w-[70%] mb-[6px]'}`}
                ></div>

                {/* Barra 2 */}
                <div className={`h-[4px] bg-[#1459ad] rounded-full transition-all duration-300 ease-in-out 
                    ${isOpen ? 'opacity-0 w-0' : 'w-full opacity-100'}`}
                ></div>

                {/* Barra 3 */}
                <div className={`h-[4px] bg-[#1459ad] rounded-full transition-all duration-300 ease-in-out transform origin-center 
                    ${isOpen ? 'w-[80%] absolute -rotate-45' : 'w-[70%] mt-[6px]'}`}
                ></div>
            </button>


            {/* --- MENU MOBILE --- */}
            <div
                className={`fixed inset-0 bg-white z-[60] flex flex-col items-center justify-start transition-transform duration-300 ease-in-out md:hidden h-[100dvh] w-screen overflow-hidden ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col items-center w-full h-full p-8 pt-24 space-y-12 overflow-y-auto">

                    {/* Logo dentro do menu */}
                    <div className="h-24 relative shrink-0">
                        {/* Adicionei onClick={closeMenu} aqui na logo também por garantia */}
                        <Link href="/" onClick={closeMenu}>
                            <Image
                                src={Logo}
                                alt="ACI Empregos Logo"
                                className="h-full w-auto object-contain"
                                priority
                            />
                        </Link>
                    </div>

                    <div className="flex flex-col items-center w-full space-y-4">
                        <h1 className="text-xl font-bold text-[#1459ad]">Menu Principal</h1>

                        {/* AQUI ESTÁ A MÁGICA: Passamos a função closeMenu */}
                        <NavLinks
                            direction="col"
                            className="text-2xl gap-6"
                            onLinkClick={closeMenu}
                        />
                    </div>

                    <div className="w-full h-px bg-gray-100 shrink-0"></div>

                    {/* Wrapper onClick para fechar ao clicar no botão também */}
                    <div className="w-full" onClick={closeMenu}>
                        <ButtonType href="/candidato/login" variant="primary" size="lg" className="w-full py-4 text-lg">
                            Área do Candidato
                        </ButtonType>
                    </div>
                </div>
            </div>
        </header>
    );
}