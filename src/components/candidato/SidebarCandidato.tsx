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
} from "react-icons/hi";

export default function SidebarCandidato() {
  const { perfil, logout } = useAuth();
  const pathname = usePathname();

  // Função para verificar se a rota está ativa
  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true;
    if (path !== "/" && pathname.startsWith(path)) return true;
    return false;
  };

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
          />
        </div>

        {/* User Profile Card - Focado no Candidato */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] backdrop-blur-sm">
          <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-3">
            Área do Candidato
          </p>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white leading-tight line-clamp-1">
              {perfil?.nome || "Carregando..."}
            </h4>
            <p className="text-[11px] text-white/50 font-medium truncate">
              {perfil?.email || "Seu perfil na ACI"}
            </p>
          </div>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-4 py-6 space-y-1.5">
        <MenuLink
          href="/inicio"
          icon={<HiOutlineHome size={22} />}
          label="Início"
          active={isActive("/inicio")}
        />
        <MenuLink
          href="/meu-curriculo"
          icon={<HiOutlineDocumentText size={22} />}
          label="Meu Currículo"
          active={isActive("/meu-curriculo")}
        />
        <MenuLink
          href="/ver-vagas"
          icon={<HiOutlineBriefcase size={22} />}
          label="Vagas"
          active={isActive("/ver-vagas")}
        />
        <MenuLink
          href="/suporte-para-candidato"
          icon={<HiOutlineSupport size={22} />}
          label="Suporte"
          active={isActive("/suporte-para-candidato")}
        />
      </nav>

      {/* Logout */}
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

// O componente MenuLink pode ser o mesmo
function MenuLink({
  href,
  icon,
  label,
  active,
}: {
  href: string;
  icon: any;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`
        flex items-center gap-3 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all relative group
        ${
          active
            ? "bg-white text-primary shadow-lg shadow-black/20"
            : "text-white/60 hover:text-white hover:bg-white/5"
        }
      `}
    >
      {/* Indicador lateral para o item ativo */}
      {active && (
        <div className="absolute left-0 w-1 h-6 bg-red-500 rounded-r-full" />
      )}

      <span
        className={`${active ? "text-primary" : "text-white/40 group-hover:text-white"}`}
      >
        {icon}
      </span>
      {label}
    </Link>
  );
}
