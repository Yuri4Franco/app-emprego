"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HiOutlineChartBar,
  HiOutlineBriefcase,
  HiOutlineOfficeBuilding,
  HiOutlineUsers,
  HiOutlineLocationMarker,
  HiOutlineLogout,
  HiOutlineCog,
} from "react-icons/hi";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

// Sugestão de Menu para o ACI Empregos
const menuItems = [
  { name: "Dashboard", href: "/admin/dashboard", icon: HiOutlineChartBar },
  { name: "Vagas", href: "/admin/vagas", icon: HiOutlineBriefcase },
  { name: "Empresas", href: "/admin/empresas", icon: HiOutlineOfficeBuilding },
  { name: "Candidatos", href: "/admin/candidatos", icon: HiOutlineUsers },
  { name: "Configurações", href: "/admin/configuracoes", icon: HiOutlineCog },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("aci_token");
    Cookies.remove("user_role");
    router.push("/entrar");
    router.refresh();
  };

  return (
    <aside className="w-64 bg-primary text-white h-screen sticky top-0 flex flex-col shadow-xl">
      {/* Header da Sidebar */}
      <div className="p-6 border-b border-blue-800">
        <h1 className="text-xl font-bold tracking-tight">
          ACI <span className="text-blue-400">Painel</span>
        </h1>
        <p className="text-xs text-blue-300 mt-1 uppercase tracking-widest font-semibold">
          Administrador
        </p>
      </div>

      {/* Menu de Navegação */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-900/50"
                  : "text-blue-100 hover:bg-blue-800 hover:text-white"
              }`}
            >
              <item.icon
                className={`text-xl ${isActive ? "text-white" : "text-blue-300 group-hover:text-white"}`}
              />
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer da Sidebar (Logout) */}
      <div className="p-4 border-t border-blue-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 text-blue-200 hover:text-white hover:bg-red-500/10 rounded-xl transition-colors group"
        >
          <HiOutlineLogout className="text-xl group-hover:text-red-400" />
          <span className="font-medium">Sair da conta</span>
        </button>
      </div>
    </aside>
  );
}
