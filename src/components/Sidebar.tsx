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
  HiOutlineMenuAlt2,
  HiOutlineX,
  HiOutlineClipboardList,
  HiOutlineBell, // <-- Novo Sino
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
} from "react-icons/hi";
import { useEffect, useState } from "react";
import api from "@/src/services/api";

// 1. DICIONÁRIO DE MENUS POR TIPO DE USUÁRIO
const MENU_CONFIG = {
  CANDIDATO: [
    { label: "Início", href: "/inicio", icon: <HiOutlineHome size={22} /> },
    {
      label: "Meu currículo",
      href: "/meu-curriculo",
      icon: <HiOutlineDocumentText size={22} />,
    },
    { label: "Vagas", href: "/vagas", icon: <HiOutlineBriefcase size={22} /> },
    {
      label: "Minhas candidaturas",
      href: "/candidaturas",
      icon: <HiOutlineClipboardList size={22} />,
    },
  ],
  ADM: [
    {
      label: "Dashboard",
      href: "/admin/dashboard",
      icon: <HiOutlineChartBar size={22} />,
    },
    {
      label: "Vagas",
      href: "/admin/vagas",
      icon: <HiOutlineBriefcase size={22} />,
    },
    {
      label: "Empresas",
      href: "/admin/empresas",
      icon: <HiOutlineOfficeBuilding size={22} />,
    },
    {
      label: "Candidatos",
      href: "/admin/candidatos",
      icon: <HiOutlineUsers size={22} />,
    },
  ],
  EMPRESA: [
    {
      label: "Dashboard",
      href: "/empresa/dashboard",
      icon: <HiOutlineChartBar size={22} />,
    },
    {
      label: "Minhas Vagas",
      href: "/empresa/vagas",
      icon: <HiOutlineBriefcase size={22} />,
    },
    {
      label: "Banco de Talentos",
      href: "/empresa/banco-talentos",
      icon: <HiOutlineUsers size={22} />,
    },
  ],
};

const BADGE_CONFIG = {
  CANDIDATO: "Área do Candidato",
  ADM: "Painel Admin",
  EMPRESA: "Painel Empresa",
};

interface Notificacao {
  id_notificacao: number;
  titulo: string;
  mensagem: string;
  tipo: string;
  lida: boolean;
  link_acao: string | null;
  criado_em: string;
}

export function Sidebar() {
  const { user, perfil, logout } = useAuth();
  const pathname = usePathname();

  // Estados de UI
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  // Estados de Dados
  const [vagasPendentes, setVagasPendentes] = useState(0);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);

  // Fecha menus ao trocar de página
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotificationsOpen(false);
  }, [pathname]);

  // Carregamento de dados iniciais baseados no Role
  useEffect(() => {
    if (!user) return;

    if (user.role === "ADM") {
      api
        .get("/admin/vagas/pendentes", { params: { limit: 1 } })
        .then((res) => setVagasPendentes(res.data.meta?.total || 0))
        .catch(console.error);
    }

    // Busca apenas a CONTAGEM inicial de notificações não lidas
    api
      .get("/notificacoes/nao-lidas")
      .then((res) => setNaoLidas(res.data.data.total_nao_lidas || 0))
      .catch(console.error);
  }, [user]);

  // Função para abrir o painel de notificações e carregar a lista
  const handleOpenNotifications = async () => {
    setIsNotificationsOpen(true);
    try {
      const res = await api.get("/notificacoes");
      setNotificacoes(res.data.data);
    } catch (error) {
      console.error("Erro ao carregar notificações", error);
    }
  };

  // Função para fechar o painel e marcar como lidas silenciosamente no backend
  const handleCloseNotifications = async () => {
    setIsNotificationsOpen(false);
    if (naoLidas > 0) {
      setNaoLidas(0); // Zera o sino na tela imediatamente (Otimista)
      try {
        await api.patch("/notificacoes/marcar-lidas");
      } catch (error) {
        console.error("Erro ao marcar lidas", error);
      }
    }
  };

  const isActive = (path: string) => {
    if (path === "/inicio" && pathname === "/inicio") return true;
    if (path === "/admin/dashboard" && pathname === "/admin/dashboard")
      return true;
    if (path === "/empresa/dashboard" && pathname === "/empresa/dashboard")
      return true;

    if (
      path !== "/inicio" &&
      path !== "/admin/dashboard" &&
      path !== "/empresa/dashboard" &&
      pathname.startsWith(path)
    ) {
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
      {/* 1. BOTÃO FLUTUANTE MOBILE */}
      <div className="md:hidden fixed top-0 left-0 w-full z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 p-4 flex items-center justify-between">
        <Image
          src={Logo}
          alt="Logo ACI Panambi"
          width={120}
          height={30}
          className="object-contain filter invert brightness-0"
        />
        <div className="flex items-center gap-3">
          {/* Sino Mobile */}
          <button
            onClick={handleOpenNotifications}
            className="relative p-2 text-gray-600"
          >
            <HiOutlineBell size={24} />
            {naoLidas > 0 && (
              <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          {/* Hambúrguer */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-primary text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <HiOutlineMenuAlt2 size={24} />
          </button>
        </div>
      </div>

      {/* 2. OVERLAY ESCURO DO MENU MOBILE E NOTIFICAÇÕES */}
      {(isMobileMenuOpen || isNotificationsOpen) && (
        <div
          onClick={() => {
            setIsMobileMenuOpen(false);
            handleCloseNotifications();
          }}
          className={`fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? "z-40 md:hidden" : "z-40"}`}
        />
      )}

      {/* 3. A SIDEBAR PRINCIPAL */}
      <aside
        className={`
          bg-primary h-[100dvh] w-72 flex flex-col border-r border-white/5 shadow-2xl shrink-0
          md:sticky md:top-0 md:translate-x-0
          fixed top-0 left-0 z-50 transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-6 right-6 p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <HiOutlineX size={24} />
        </button>

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

          {/* User Profile Card com o Sino Desktop */}
          <div className="bg-white/5 border border-white/10 p-5 rounded-[24px] backdrop-blur-sm relative group">
            <button
              onClick={handleOpenNotifications}
              className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors"
            >
              <HiOutlineBell size={22} />
              {naoLidas > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-primary animate-pulse"></span>
              )}
            </button>

            <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-3 pr-6">
              {currentBadge}
            </p>
            <div className="space-y-1 pr-6">
              <h4 className="text-sm font-bold text-white leading-tight line-clamp-1">
                {perfil?.nome || perfil?.nome_fantasia || "Carregando..."}
              </h4>
              <p className="text-[11px] text-white/50 font-medium truncate">
                {perfil?.email || "Aguarde..."}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {currentMenu.map((item) => (
            <MenuLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={isActive(item.href)}
              badge={
                item.label === "Vagas" && vagasPendentes > 0
                  ? vagasPendentes
                  : undefined
              }
            />
          ))}
        </nav>

        {/* Rodapé: Configurações e Logout */}
        <div className="p-6 space-y-2 border-t border-white/5">
          <Link
            href="/configuracoes"
            className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold text-xs uppercase tracking-wider ${isActive("/configuracoes") ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"}`}
          >
            <HiOutlineCog size={20} /> Configurações
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-5 py-4 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-2xl transition-all font-bold text-xs uppercase tracking-wider group"
          >
            <HiOutlineLogout
              size={20}
              className="group-hover:-translate-x-1 transition-transform"
            />{" "}
            Sair da Conta
          </button>
        </div>
      </aside>

      {/* 4. DRAWER DE NOTIFICAÇÕES (O Painel Lateral que desliza) */}
      <div
        className={`fixed top-0 right-0 h-[100dvh] w-full max-w-sm bg-white shadow-[0_0_40px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-300 ease-out flex flex-col ${isNotificationsOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-gray-800">Notificações</h2>
            <p className="text-xs text-gray-500 mt-1">Avisos e atualizações</p>
          </div>
          <button
            onClick={handleCloseNotifications}
            className="p-2 bg-white border border-gray-200 text-gray-500 hover:text-red-500 rounded-full hover:bg-gray-50 transition-colors shadow-sm"
          >
            <HiOutlineX size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {notificacoes.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 opacity-50">
              <HiOutlineBell size={48} className="text-gray-300 mb-4" />
              <p className="text-sm font-bold text-gray-500">
                Tudo limpo por aqui!
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Você não tem novas notificações.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {notificacoes.map((notif) => {
                // Define a cor baseada no "tipo" que vem do backend
                const isSucesso =
                  notif.tipo === "SUCESSO" || notif.tipo === "ENTREVISTA";
                const iconColor = isSucesso
                  ? "text-emerald-500 bg-emerald-50"
                  : "text-blue-500 bg-blue-50";
                const Icon = isSucesso
                  ? HiOutlineCheckCircle
                  : HiOutlineInformationCircle;

                return (
                  <div
                    key={notif.id_notificacao}
                    className={`relative p-4 rounded-[20px] transition-colors ${!notif.lida ? "bg-white shadow-sm border border-blue-100" : "hover:bg-gray-50 border border-transparent"}`}
                  >
                    {!notif.lida && (
                      <div className="absolute top-6 left-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                    )}
                    <div className="flex gap-4 pl-3">
                      <div
                        className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${iconColor}`}
                      >
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4
                          className={`text-sm ${!notif.lida ? "font-black text-gray-900" : "font-bold text-gray-700"}`}
                        >
                          {notif.titulo}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                          {notif.mensagem}
                        </p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {new Date(notif.criado_em).toLocaleDateString(
                              "pt-BR",
                              { day: "2-digit", month: "short" },
                            )}
                          </span>
                          {notif.link_acao && (
                            <Link
                              href={notif.link_acao}
                              onClick={handleCloseNotifications}
                              className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:text-blue-800 transition-colors"
                            >
                              Ver Detalhes &rarr;
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

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
      className={`flex items-center justify-between px-5 py-3.5 rounded-2xl font-bold text-sm transition-all relative group ${active ? "bg-white text-primary shadow-lg shadow-black/20" : "text-white/60 hover:text-white hover:bg-white/5"}`}
    >
      <div className="flex items-center gap-3">
        {active && (
          <div className="absolute left-0 w-1 h-6 bg-red-500 rounded-r-full" />
        )}
        <span
          className={`${active ? "text-primary" : "text-white/40 group-hover:text-white"}`}
        >
          {icon}
        </span>
        {label}
      </div>
      {badge ? (
        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">
          {badge > 99 ? "99+" : badge}
        </span>
      ) : null}
    </Link>
  );
}
