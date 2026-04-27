"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/AuthContext";
import Logo from "@/src/assets/logos/logo-transparente-branca.png";
import {
  HiOutlineHome,
  HiOutlineDocumentText,
  HiOutlineBriefcase,
  HiOutlineSupport,
  HiOutlineLogout,
  HiOutlineChartBar,
  HiOutlineOfficeBuilding,
  HiOutlineUsers,
  HiOutlineCog,
  HiOutlineMenuAlt2, // Novo ícone de menu
  HiOutlineX, // Novo ícone de fechar
} from "react-icons/hi";
import { useEffect, useState } from "react";
import api from "@/src/services/api";

// 1. DICIONÁRIO DE MENUS POR TIPO DE USUÁRIO
const MENU_CONFIG = {
  CANDIDATO: [
    { label: "Início", href: "/inicio", icon: <HiOutlineHome size={22} /> },
    { label: "Meu currículo", href: "/meu-curriculo", icon: <HiOutlineDocumentText size={22} /> },
    { label: "Vagas", href: "/ver-vagas", icon: <HiOutlineBriefcase size={22} /> },
    { label: "Minhas candidaturas", href: "/candidaturas", icon: <HiOutlineSupport size={22} /> },
  ],
  ADM: [
    { label: "Dashboard", href: "/admin/dashboard", icon: <HiOutlineChartBar size={22} /> },
    { label: "Vagas", href: "/admin/vagas", icon: <HiOutlineBriefcase size={22} /> },
    { label: "Empresas", href: "/admin/empresas", icon: <HiOutlineOfficeBuilding size={22} /> },
    { label: "Candidatos", href: "/admin/candidatos", icon: <HiOutlineUsers size={22} /> },
  ],
  EMPRESA: [
    { label: "Dashboard", href: "/empresa/dashboard", icon: <HiOutlineChartBar size={22} /> },
    { label: "Minhas Vagas", href: "/empresa/vagas", icon: <HiOutlineBriefcase size={22} /> },
    { label: "Banco de Talentos", href: "/empresa/banco-talentos", icon: <HiOutlineUsers size={22} /> },
    { label: "Configurações", href: "/empresa/configuracoes", icon: <HiOutlineCog size={22} /> },
  ],
};

// 2. DICIONÁRIO DE LABELS DO CARD
const BADGE_CONFIG = {
  CANDIDATO: "Área do Candidato",
  ADM: "Painel Admin",
  EMPRESA: "Painel Empresa",
};

export function Sidebar() {
  const { user, perfil, logout } = useAuth();
  const pathname = usePathname();

  const [vagasPendentes, setVagasPendentes] = useState(0);

  // ESTADO QUE CONTROLA O MENU NO MOBILE
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (user?.role === "ADM") {
      api.get("/admin/vagas/pendentes", { params: { limit: 1 } })
        .then((res) => {
          setVagasPendentes(res.data.meta?.total || 0);
        })
        .catch(console.error);
    }
  }, [user]);

  // Fecha o menu no mobile sempre que o usuário trocar de página (clicar em um link)
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Função inteligente para verificar rota ativa
  const isActive = (path: string) => {
    if (path === "/inicio" && pathname === "/inicio") return true;
    if (path === "/admin/dashboard" && pathname === "/admin/dashboard") return true;
    if (path === "/empresa/dashboard" && pathname === "/empresa/dashboard") return true;

    if (path !== "/inicio" && path !== "/admin/dashboard" && path !== "/empresa/dashboard" && pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  if (!user) return null;

  const role = user.role;
  const currentMenu = MENU_CONFIG[role] || MENU_CONFIG.CANDIDATO;
  const currentBadge = BADGE_CONFIG[role] || "Portal ACI";

  return (
    <>
      {/* ========================================================= */}
      {/* 1. BOTÃO FLUTUANTE MOBILE (Visível apenas em md e menor)  */}
      {/* ========================================================= */}
      <div className="md:hidden fixed top-0 left-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between">
        <Image
          src={Logo}
          alt="Logo ACI Panambi"
          width={120}
          height={30}
          className="object-contain filter invert brightness-0" // Transforma a logo branca em escura pro mobile
        />
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="p-2 bg-primary text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
        >
          <HiOutlineMenuAlt2 size={24} />
        </button>
      </div>

      {/* ========================================================= */}
      {/* 2. OVERLAY ESCURO DO MOBILE (Clica fora pra fechar)       */}
      {/* ========================================================= */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in"
        />
      )}

      {/* ========================================================= */}
      {/* 3. A SIDEBAR PRINCIPAL                                    */}
      {/* ========================================================= */}
      <aside
        className={`
          bg-primary h-[100dvh] w-72 flex flex-col border-r border-white/5 shadow-2xl shrink-0
          /* No Desktop, ela é sempre visível e 'sticky' (gruda no lado esquerdo) */
          md:sticky md:top-0 md:translate-x-0
          /* No Mobile, ela é fixa e escorrega de fora da tela baseada no estado */
          fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >

        {/* BOTÃO FECHAR (Apenas Mobile) */}
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-6 right-6 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <HiOutlineX size={24} />
        </button>

        {/* Logo Section */}
        <div className="p-8 pb-4">
          <div className="relative h-12 w-full mb-8">
            <Image
              src={Logo}
              alt="Logo ACI Panambi"
              fill
              className="object-contain object-left"
              priority
            />
          </div>

          {/* User Profile Card Dinâmico */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] backdrop-blur-sm">
            <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-3">
              {currentBadge}
            </p>
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-white leading-tight line-clamp-1">
                {perfil?.nome || perfil?.nome_fantasia || "Carregando..."}
              </h4>
              <p className="text-[11px] text-white/50 font-medium truncate">
                {perfil?.email || "Aguarde..."}
              </p>
            </div>
          </div>
        </div>

        {/* Navegação Dinâmica */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {currentMenu.map((item) => (
            <MenuLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={isActive(item.href)}
              badge={item.label === "Vagas" && vagasPendentes > 0 ? vagasPendentes : undefined}
            />
          ))}
        </nav>

        {/* Logout Fixo */}
        <div className="p-6">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-5 py-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-2xl transition-all font-bold text-xs uppercase tracking-wider group"
          >
            <HiOutlineLogout
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Sair da Conta
          </button>
        </div>
      </aside>
    </>
  );
}

// Subcomponente de Link para manter organizado
function MenuLink({
  href,
  icon,
  label,
  active,
  badge,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold text-sm transition-all relative group
        ${active
          ? "bg-white text-primary shadow-lg shadow-black/20"
          : "text-white/60 hover:text-white hover:bg-white/5"
        }
      `}
    >
      <div className="flex items-center gap-3">
        {active && <div className="absolute left-0 w-1 h-6 bg-red-500 rounded-r-full" />}
        <span className={`${active ? "text-primary" : "text-white/40 group-hover:text-white"}`}>
          {icon}
        </span>
        {label}
      </div>

      {badge ? (
        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </Link>
  );
}