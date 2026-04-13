"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/AuthContext";
import {
    HiOutlineUser,
    HiOutlineBriefcase,
    HiOutlineSearchCircle,
    HiOutlineSupport,
    HiOutlineLogout,
    HiOutlineOfficeBuilding
} from "react-icons/hi";

export default function SidebarEmpresa() {
    const { perfil, logout } = useAuth();
    const pathname = usePathname();

    // Função auxiliar para verificar se a rota está ativa
    const isActive = (path: string) => pathname === path;

    return (
        <aside className="w-72 bg-primary h-screen border-r border-gray-100 flex flex-col sticky top-0">

            {/* Cabeçalho do Menu: Identificação */}
            <div className="p-8 mb-2">
                <div className="mb-6">
                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                        Bem-vindo(a)
                    </p>
                </div>

                <div className="flex flex-col gap-1">
                    <h4 className="text-lg font-bold text-white leading-tight break-words">
                        {perfil?.nome || "Carregando..."}
                    </h4>
                    <div className="flex items-center gap-1.5 text-gray-400">
                        <p className="text-xs font-medium truncate">
                            {perfil?.empresa?.nome_fantasia || "Empresa ACI"}
                        </p>
                    </div>
                </div>
            </div>

            {/* Navegação Principal */}
            <nav className="flex-1 px-4 space-y-1 text-white">
                <MenuLink
                    href="/dashboard/perfil"
                    icon={<HiOutlineUser size={22} />}
                    label="Minhas Informações"
                    active={isActive("/dashboard/perfil")}
                />
                <MenuLink
                    href="/dashboard/vagas"
                    icon={<HiOutlineBriefcase size={22} />}
                    label="Gestão de Vagas"
                    active={isActive("/dashboard/vagas")}
                />
                <MenuLink
                    href="/dashboard/talentos"
                    icon={<HiOutlineSearchCircle size={22} />}
                    label="Banco de Talentos ACI"
                    active={isActive("/dashboard/talentos")}
                />
                <MenuLink
                    href="/dashboard/suporte"
                    icon={<HiOutlineSupport size={22} />}
                    label="Suporte"
                    active={isActive("/dashboard/suporte")}
                />
            </nav>

            {/* Rodapé: Botão de Sair */}
            <div className="p-4 border-t border-gray-50">
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-red-500 hover:bg-red-50 rounded-2xl transition-all font-bold text-sm group"
                >
                    <HiOutlineLogout size={22} className="group-hover:scale-110 transition-transform" />
                    Sair do Portal
                </button>
            </div>
        </aside>
    );
}

// Subcomponente para os links do menu para manter o código limpo
function MenuLink({ href, icon, label, active }: { href: string; icon: any; label: string; active: boolean }) {
    return (
        <Link
            href={href}
            className={`
        flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold text-sm transition-all
        ${active
                    ? "bg-hover-button text-white shadow-sm shadow-blue-100/50"
                    : "text-gray-500 hover:text-white hover:bg-hover-button text-white"
                }
      `}
        >
            <span className="text-white">
                {icon}
            </span>
            {label}
        </Link>
    );
}