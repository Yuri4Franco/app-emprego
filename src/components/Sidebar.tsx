"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/src/AuthContext";
import Logo from "@/src/assets/logos/logo-transparente-branca.webp";
import LogoCor from "@/src/assets/logos/logo-transparente.webp";
// ✨ NOVO: Importação da logo minimizada (apenas o ícone)
import LogoMinimizado from "@/src/assets/logos/logo-lupa-transparente-branca.webp";
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
  HiOutlineBell,
  HiOutlineCheckCircle,
  HiOutlineInformationCircle,
  HiOutlineCollection,
  // ✨ NOVO: Ícones para o botão de expandir/minimizar
  HiOutlineChevronLeft,
  HiOutlineChevronRight,
} from "react-icons/hi";
import { useEffect, useState } from "react";
import api from "@/src/services/api";

// 1. DICIONÁRIO DE MENUS POR TIPO DE USUÁRIO
const MENU_CONFIG = {
  CANDIDATO: [
    { label: "Início", href: "/candidato/inicio", icon: <HiOutlineHome size={22} /> },
    { label: "Meu currículo", href: "/candidato/meu-curriculo", icon: <HiOutlineDocumentText size={22} /> },
    { label: "Vagas", href: "/candidato/vagas", icon: <HiOutlineBriefcase size={22} /> },
    { label: "Minhas candidaturas", href: "/candidato/candidaturas", icon: <HiOutlineClipboardList size={22} /> },
  ],
  ADM: [
    { label: "Dashboard", href: "/admin/dashboard", icon: <HiOutlineChartBar size={22} /> },
    { label: "Gestão de Vagas", href: "/admin/vagas", icon: <HiOutlineBriefcase size={22} /> },
    { label: "Gestão de Empresas", href: "/admin/empresas", icon: <HiOutlineOfficeBuilding size={22} /> },
    { label: "Base de Usuários", href: "/admin/usuarios", icon: <HiOutlineUsers size={22} /> },
    { label: "Gestão do Catálogo", href: "/admin/catalogo", icon: <HiOutlineCollection size={22} /> },
  ],
  EMPRESA: [
    { label: "Visão Geral", href: "/empresa/dashboard", icon: <HiOutlineChartBar size={22} /> },
    { label: "Perfil da Empresa", href: "/empresa/minhas-informacoes", icon: <HiOutlineOfficeBuilding size={22} /> },
    { label: "Gestão de Vagas", href: "/empresa/vagas", icon: <HiOutlineBriefcase size={22} /> },
    { label: "Banco de Talentos", href: "/empresa/banco-talentos", icon: <HiOutlineUsers size={22} /> },
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
  // ✨ NOVO: Controle da Sidebar Minimizada
  const [isMinimized, setIsMinimized] = useState(false);

  // Estados de Scroll (Menu Mobile)
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Estados de Dados
  const [vagasPendentes, setVagasPendentes] = useState(0);
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [naoLidas, setNaoLidas] = useState(0);

  // 1. Lógica do Scroll da Barra Mobile
  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== "undefined") {
        const currentScrollY = window.scrollY;
        if (currentScrollY > lastScrollY && currentScrollY > 50) {
          if (!isMobileMenuOpen && !isNotificationsOpen) {
            setIsVisible(false);
          }
        } else {
          setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
      }
    };

    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY, isMobileMenuOpen, isNotificationsOpen]);

  // 2. Travar o Scroll do Body quando algum menu lateral abrir
  useEffect(() => {
    if (isMobileMenuOpen || isNotificationsOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen, isNotificationsOpen]);

  // Fecha menus ao trocar de página
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsNotificationsOpen(false);
  }, [pathname]);

  // Carregamento de dados iniciais
  useEffect(() => {
    if (!user) return;
    if (user.role === "ADM") {
      api
        .get("/admin/vagas/pendentes", { params: { limit: 1 } })
        .then((res) => setVagasPendentes(res.data.meta?.total || 0))
        .catch(console.error);
    }

    api
      .get("/notificacoes/nao-lidas")
      .then((res) => setNaoLidas(res.data.data.total_nao_lidas || 0))
      .catch(console.error);
  }, [user]);

  const handleOpenNotifications = async () => {
    setIsNotificationsOpen(true);
    try {
      const res = await api.get("/notificacoes");
      setNotificacoes(res.data.data);
    } catch (error) {
      console.error("Erro ao carregar notificações", error);
    }
  };

  const handleCloseNotifications = async () => {
    setIsNotificationsOpen(false);
    if (naoLidas > 0) {
      setNaoLidas(0);
      try {
        await api.patch("/notificacoes/marcar-lidas");
      } catch (error) {
        console.error("Erro ao marcar lidas", error);
      }
    }
  };

  const isActive = (path: string) => {
    if (path === "/inicio" && pathname === "/inicio") return true;
    if (path === "/admin/dashboard" && pathname === "/admin/dashboard") return true;
    if (path === "/empresa/dashboard" && pathname === "/empresa/dashboard") return true;
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
      {/* 1. ESPAÇADOR FANTASMA PRO MOBILE NÃO COBRIR O CONTEÚDO */}
      <div className="md:hidden h-[76px] w-full shrink-0"></div>

      {/* 2. BARRA FLUTUANTE MOBILE (Com esconderijo automático) */}
      <div
        className={`md:hidden fixed top-0 left-0 w-full z-40 bg-white border-b border-gray-200 p-4 flex items-center justify-between transition-transform duration-300 ease-in-out ${isVisible ? "translate-y-0" : "-translate-y-full"
          }`}
      >
        <div className="h-14 relative shrink-0">
          <Image
            src={LogoCor}
            alt="ACI Vagas Logo"
            className="h-full w-auto object-contain"
            priority
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
        <div className="flex items-center gap-3">
          <button onClick={handleOpenNotifications} className="relative p-2 text-gray-600">
            <HiOutlineBell size={24} />
            {naoLidas > 0 && (
              <span className="absolute top-1 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            )}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 bg-primary text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          >
            <HiOutlineMenuAlt2 size={24} />
          </button>
        </div>
      </div>

      {/* 3. OVERLAY ESCURO PARA NOTIFICAÇÕES E MENU MOBILE */}
      {(isNotificationsOpen || isMobileMenuOpen) && (
        <div
          onClick={() => {
            handleCloseNotifications();
            setIsMobileMenuOpen(false);
          }}
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 z-40"
        />
      )}

      {/* 4. A SIDEBAR PRINCIPAL */}
      <aside
        className={`
          bg-primary h-[100dvh] flex flex-col border-r border-white/5 shadow-2xl shrink-0
          fixed top-0 left-0 z-50 transition-all duration-300 ease-in-out
          md:sticky md:top-0 md:translate-x-0
          ${isMobileMenuOpen ? "w-[280px] translate-x-0" : "w-[280px] -translate-x-full"}
          ${isMinimized ? "md:w-[92px]" : "md:w-72"}
        `}
      >
        {/* ✨ NOVO: Botão de Minimizar (Acessível) */}
        <button
          onClick={() => setIsMinimized(!isMinimized)}
          aria-label={isMinimized ? "Expandir menu de navegação" : "Recolher menu de navegação"}
          title={isMinimized ? "Expandir menu" : "Minimizar menu"}
          className="hidden md:flex absolute -right-4 top-10 z-50 items-center justify-center w-8 h-8 bg-blue-500 hover:bg-blue-400 border-[3px] border-primary rounded-full text-white shadow-md shadow-black/20 transition-all hover:scale-110 cursor-pointer"
        >
          {isMinimized ? <HiOutlineChevronRight size={18} strokeWidth={2.5} /> : <HiOutlineChevronLeft size={18} strokeWidth={2.5} />}
        </button>

        <button
          onClick={() => setIsMobileMenuOpen(false)}
          className="md:hidden absolute top-6 right-6 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-50 cursor-pointer"
        >
          <HiOutlineX size={28} />
        </button>

        {/* Header da Sidebar */}
        <div className={`p-6 pb-2 mt-4 md:mt-0 transition-all ${isMinimized ? "px-4" : "px-6"}`}>
          {/* ✨ NOVO: Troca de logo conforme o estado */}
          <div className="relative h-14 w-full mb-6">
            <Image
              src={isMinimized ? LogoMinimizado : Logo}
              alt="Logo ACI Panambi"
              fill
              className={`object-contain transition-all ${isMinimized ? "object-center scale-90" : "object-center md:object-center lg:object-left"}`}
              priority
            />
          </div>

          {/* Info Usuário e Sino */}
          <div className={`bg-white/5 border border-white/10 rounded-[20px] backdrop-blur-sm relative group overflow-hidden transition-all ${isMinimized ? "p-3 flex justify-center" : "p-4"}`}>

            <button
              onClick={handleOpenNotifications}
              title="Notificações"
              className={`text-white/50 hover:text-white transition-colors cursor-pointer ${isMinimized ? "block" : "absolute top-4 right-4 hidden md:block"}`}
            >
              <HiOutlineBell size={22} />
              {naoLidas > 0 && (
                <span className={`absolute bg-red-500 rounded-full border-2 border-primary animate-pulse ${isMinimized ? "-top-1 -right-1 w-3 h-3" : "-top-0.5 -right-0.5 w-2.5 h-2.5"}`}></span>
              )}
            </button>

            {/* Esconde os textos quando minimizado */}
            {!isMinimized && (
              <div className="animate-in fade-in pr-6">
                <p className="text-[10px] font-black text-blue-300 uppercase tracking-[0.2em] mb-2">
                  {currentBadge}
                </p>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-white leading-tight line-clamp-1">
                    {perfil?.empresa?.nome_fantasia || perfil?.nome || "Carregando..."}
                  </h4>
                  <p className="text-[11px] text-white/50 font-medium truncate">
                    {perfil?.email || "Aguarde..."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Links Principais */}
        <nav className={`flex-1 py-4 space-y-2 overflow-y-auto hide-scrollbar transition-all ${isMinimized ? "px-3" : "px-4"}`}>
          {currentMenu.map((item) => (
            <MenuLink
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={isActive(item.href)}
              isMinimized={isMinimized}
              badge={item.label === "Vagas" && vagasPendentes > 0 ? vagasPendentes : undefined}
            />
          ))}
        </nav>

        {/* Rodapé: Configurações e Logout */}
        <div className={`p-5 space-y-2 border-t border-white/5 shrink-0 transition-all ${isMinimized ? "px-3" : "px-5"}`}>
          <Link
            href="/configuracoes"
            title="Configurações"
            className={`w-full flex items-center rounded-2xl transition-all font-bold text-xs uppercase tracking-wider ${isMinimized ? "justify-center p-3" : "gap-3 px-5 py-3"} ${isActive("/configuracoes") ? "bg-white/10 text-white" : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
          >
            <HiOutlineCog size={20} className="shrink-0" />
            {!isMinimized && <span className="truncate">Configurações</span>}
          </Link>
          <button
            onClick={logout}
            title="Sair da Conta"
            className={`w-full flex items-center text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-2xl transition-all font-bold text-xs uppercase tracking-wider group cursor-pointer ${isMinimized ? "justify-center p-3" : "gap-3 px-5 py-3"}`}
          >
            <HiOutlineLogout size={20} className={`shrink-0 ${!isMinimized && "group-hover:-translate-x-1 transition-transform"}`} />
            {!isMinimized && <span className="truncate">Sair da Conta</span>}
          </button>
        </div>
      </aside>

      {/* 5. DRAWER DE NOTIFICAÇÕES (Mantido intacto do seu código) */}
      <div
        className={`fixed top-0 right-0 h-[100dvh] w-full max-w-sm bg-white shadow-[0_0_40px_rgba(0,0,0,0.1)] z-50 transform transition-transform duration-300 ease-out flex flex-col ${isNotificationsOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {/* ... (O restante do Drawer de Notificações fica idêntico ao que você enviou) ... */}
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
              <p className="text-sm font-bold text-gray-500">Tudo limpo por aqui!</p>
              <p className="text-xs text-gray-400 mt-1">Você não tem novas notificações.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notificacoes.map((notif) => {
                const isSucesso = notif.tipo === "SUCESSO" || notif.tipo === "ENTREVISTA";
                const iconColor = isSucesso ? "text-emerald-500 bg-emerald-50" : "text-blue-500 bg-blue-50";
                const Icon = isSucesso ? HiOutlineCheckCircle : HiOutlineInformationCircle;

                return (
                  <div
                    key={notif.id_notificacao}
                    className={`relative p-4 rounded-[20px] transition-colors ${!notif.lida ? "bg-white shadow-sm border border-blue-100" : "hover:bg-gray-50 border border-transparent"
                      }`}
                  >
                    {!notif.lida && <div className="absolute top-6 left-2 w-1.5 h-1.5 bg-blue-500 rounded-full"></div>}
                    <div className="flex gap-4 pl-3">
                      <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center ${iconColor}`}>
                        <Icon size={20} />
                      </div>
                      <div>
                        <h4 className={`text-sm ${!notif.lida ? "font-black text-gray-900" : "font-bold text-gray-700"}`}>
                          {notif.titulo}
                        </h4>
                        <p className="text-xs text-gray-500 mt-1 leading-relaxed">{notif.mensagem}</p>
                        <div className="flex items-center justify-between mt-3">
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                            {new Date(notif.criado_em).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
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

// ✨ COMPONENTE ATUALIZADO: MenuLink recebe `isMinimized` e aplica tooltip + oculta labels
function MenuLink({ href, icon, label, active, badge, isMinimized }: any) {
  return (
    <Link
      href={href}
      title={isMinimized ? label : undefined}
      className={`flex items-center rounded-2xl font-bold text-sm transition-all relative group ${isMinimized ? "justify-center p-3" : "justify-between px-5 py-3"
        } ${active
          ? "bg-white text-primary shadow-lg shadow-black/20"
          : "text-white/60 hover:text-white hover:bg-white/5"
        }`}
    >
      <div className={`flex items-center ${isMinimized ? "justify-center" : "gap-3"}`}>
        {active && (
          <div className="absolute left-0 w-1 h-6 bg-red-500 rounded-r-full" />
        )}
        <span className={`shrink-0 ${active ? "text-primary" : "text-white/40 group-hover:text-white"}`}>
          {icon}
        </span>

        {/* Oculta o label com animação fade out */}
        {!isMinimized && <span className="truncate whitespace-nowrap animate-in fade-in">{label}</span>}
      </div>

      {/* Se não estiver minimizado e tiver badge numérico normal */}
      {!isMinimized && badge && (
        <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm shrink-0">
          {badge > 99 ? "99+" : badge}
        </span>
      )}

      {/* ✨ Se ESTIVER minimizado, o badge vira apenas um indicador (bolinha) no canto */}
      {isMinimized && badge && (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 border-2 border-primary rounded-full shadow-sm shrink-0"></span>
      )}
    </Link>
  );
}