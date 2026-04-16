// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Função auxiliar para definir a rota principal de cada perfil
const getDashboardPath = (role?: string) => {
  if (role === 'ADM') return '/admin/dashboard';
  if (role === 'EMPRESA') return '/empresa/dashboard';
  return '/inicio'; // CANDIDATO é o default
};

export function middleware(request: NextRequest) {
  const token = request.cookies.get('aci_token')?.value;
  const role = request.cookies.get('user_role')?.value;
  const forceChange = request.cookies.get('exigir_troca_senha')?.value === 'true';

  const { pathname } = request.nextUrl;

  // 1. REGRA DE OURO: Se precisa trocar senha, não vai para lugar nenhum além de /trocar-senha
  if (token && forceChange && pathname !== '/trocar-senha') {
    return NextResponse.redirect(new URL('/trocar-senha', request.url));
  }

  // 2. Se tentou entrar em /trocar-senha mas NÃO precisa (ou não está logado)
  if (pathname === '/trocar-senha' && (!token || !forceChange)) {
    return NextResponse.redirect(new URL(token ? getDashboardPath(role) : '/entrar', request.url));
  }

  // 3. Lógica de Login (Redireciona logados para suas homepages)
  if (pathname === '/entrar') {
    if (token) {
      return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
    }
    return NextResponse.next();
  }

  // 4. Bloqueia usuários NÃO logados de acessar rotas protegidas
  if (!token && (pathname.startsWith('/admin') || pathname.startsWith('/empresa') || pathname.startsWith('/dashboard'))) {
    return NextResponse.redirect(new URL('/entrar', request.url));
  }

  // 5. Proteção de Rotas Específicas por Perfil
  if (pathname.startsWith('/admin') && role !== 'ADM') {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  if (pathname.startsWith('/empresa') && role !== 'EMPRESA') {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  // Opcional: Garante que apenas candidatos acessem a raiz /dashboard
  // Se quiser que a empresa também veja /dashboard, basta remover esse 'if'
  if (pathname.startsWith('/inicio') && role !== 'CANDIDATO') {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  // IMPORTANTE: Adicionamos o /empresa/:path* no matcher
  matcher: ['/admin/:path*', '/empresa/:path*', '/dashboard/:path*', '/entrar', '/trocar-senha'],
};