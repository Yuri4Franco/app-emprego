import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const getDashboardPath = (role?: string) => {
  if (role === "ADM") return "/admin/dashboard";
  if (role === "EMPRESA") return "/empresa/dashboard";
  return "/candidato/inicio";
};

// FUNÇÃO AUXILIAR: Constrói a URL usando o domínio real
const buildAbsoluteUrl = (path: string, request: NextRequest) => {
  // Pega o domínio oficial da variável de ambiente (se definida)
  // ou extrai dos cabeçalhos passados pelo Nginx (X-Forwarded-Host ou Host)
  const host =
    process.env.NEXT_PUBLIC_APP_URL ||
    request.headers.get("x-forwarded-host") ||
    request.headers.get("host");

  // Garante HTTPS em produção, HTTP apenas em desenvolvimento real
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";

  // Retorna a URL limpa (ex: https://acivagas.com.br/admin/dashboard)
  // Se o NEXT_PUBLIC_APP_URL já contiver "https://", o construtor URL lida bem com isso
  try {
    return new URL(path, process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`);
  } catch (e) {
    // Fallback de emergência (garante que não quebre, mas continua evitando o request.url direto)
    return new URL(path, `https://${host}`);
  }
};

export function proxy(request: NextRequest) {
  const token = request.cookies.get("aci_token")?.value;
  const role = request.cookies.get("user_role")?.value;
  const forceChange = request.cookies.get("exigir_troca_senha")?.value === "true";

  const { pathname } = request.nextUrl;

  if (
    token &&
    forceChange &&
    pathname !== "/trocar-senha" &&
    pathname !== "/termos" &&
    pathname !== "/privacidade"
  ) {
    return NextResponse.redirect(buildAbsoluteUrl("/trocar-senha", request));
  }

  if (pathname === "/trocar-senha" && (!token || !forceChange)) {
    const fallbackLogin = role === "EMPRESA" ? "/entrar-empresa" : "/entrar";
    return NextResponse.redirect(
      buildAbsoluteUrl(token ? getDashboardPath(role) : fallbackLogin, request)
    );
  }

  // Verifica tanto a rota geral quanto a de empresa
  if (pathname === "/entrar" || pathname === "/entrar-empresa") {
    if (token) {
      return NextResponse.redirect(buildAbsoluteUrl(getDashboardPath(role), request));
    }
    return NextResponse.next();
  }

  if (
    !token &&
    (pathname.startsWith("/admin") ||
      pathname.startsWith("/empresa") ||
      pathname.startsWith("/candidato"))
  ) {
    // Redirecionamento inteligente baseado no escopo da rota desejada
    const redirectPath = pathname.startsWith("/empresa")
      ? "/entrar-empresa"
      : "/entrar";
    return NextResponse.redirect(buildAbsoluteUrl(redirectPath, request));
  }

  if (pathname.startsWith("/admin") && role !== "ADM") {
    return NextResponse.redirect(buildAbsoluteUrl(getDashboardPath(role), request));
  }

  if (pathname.startsWith("/empresa") && role !== "EMPRESA") {
    return NextResponse.redirect(buildAbsoluteUrl(getDashboardPath(role), request));
  }

  if (pathname.startsWith("/candidato") && role !== "CANDIDATO") {
    return NextResponse.redirect(buildAbsoluteUrl(getDashboardPath(role), request));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/empresa/:path*",
    "/candidato/:path*",
    "/entrar",
    "/entrar-empresa",
    "/trocar-senha",
  ],
};