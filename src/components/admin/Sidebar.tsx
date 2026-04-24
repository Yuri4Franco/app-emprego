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
} from "react-icons/hi";
import { useEffect, useState } from "react";
import api from "@/src/services/api";

// 1. DICIONÁRIO DE MENUS POR TIPO DE USUÁRIO
const MENU_CONFIG = {
  CANDIDATO: [
    { label: "Início", href: "/inicio", icon: <HiOutlineHome size={22} /> },
    { label: "Meu Currículo", href: "/meu-curriculo", icon: <HiOutlineDocumentText size={22} /> },
    { label: "Vagas", href: "/ver-vagas", icon: <HiOutlineBriefcase size={22} /> },
    { label: "Suporte", href: "/suporte-para-candidato", icon: <HiOutlineSupport size={22} /> },
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

  useEffect(() => {
    if (user?.role === "ADM") {
      api.get("/admin/vagas/pendentes", { params: { limit: 1 } })
        .then((res) => {
          setVagasPendentes(res.data.meta?.total || 0);
        })
        .catch(console.error);
    }
  }, [user]);

  // Função inteligente para verificar rota ativa
  const isActive = (path: string) => {
    // Casos exatos para dashboards e início para não bugar com sub-rotas
    if (path === "/inicio" && pathname === "/inicio") return true;
    if (path === "/admin/dashboard" && pathname === "/admin/dashboard") return true;
    if (path === "/empresa/dashboard" && pathname === "/empresa/dashboard") return true;

    // Para as outras abas (ex: /admin/vagas/nova deve deixar /admin/vagas ativo)
    if (path !== "/inicio" && path !== "/admin/dashboard" && path !== "/empresa/dashboard" && pathname.startsWith(path)) {
      return true;
    }
    return false;
  };

  // Se o contexto ainda está carregando ou não tem usuário, podemos retornar nulo 
  // (ou um skeleton) para evitar que a sidebar pisque errada antes do redirecionamento
  if (!user) return null;

  const role = user.role; // "CANDIDATO", "ADM" ou "EMPRESA"
  const currentMenu = MENU_CONFIG[role] || MENU_CONFIG.CANDIDATO; // Fallback de segurança
  const currentBadge = BADGE_CONFIG[role] || "Portal ACI";

  return (
    <aside className="w-72 bg-primary h-screen flex flex-col sticky top-0 border-r border-white/5 shadow-2xl">

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

      {/* A MÁGICA DO BADGE AQUI */}
      {badge ? (
        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </Link>
  );
}