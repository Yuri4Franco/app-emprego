// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('aci_token')?.value;
  const role = request.cookies.get('user_role')?.value;
  const forceChange = request.cookies.get('exigir_troca_senha')?.value === 'true';

  const { pathname } = request.nextUrl;

  // 1. REGRA DE OURO: Se precisa trocar senha, não vai para lugar nenhum além de /trocar-senha
  if (token && forceChange && pathname !== '/trocar-senha') {
    return NextResponse.redirect(new URL('/trocar-senha', request.url));
  }

  // 2. Se tentou entrar em /trocar-senha mas NÃO precisa (ou não está logado), tira ele de lá
  if (pathname === '/trocar-senha' && (!token || !forceChange)) {
    const destination = role === 'ADM' ? '/admin' : '/dashboard';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  // 3. Lógica de Login (Redireciona logados para suas homepages)
  if (pathname === '/entrar') {
    if (token) {
      return NextResponse.redirect(new URL(role === 'ADM' ? '/admin' : '/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // 4. Proteção de Rotas (Admin e Dashboard)
  if (pathname.startsWith('/admin')) {
    if (!token || role !== 'ADM') {
      return NextResponse.redirect(new URL('/entrar', request.url));
    }
  }

  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/entrar', request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Adicione o / (raiz) se necessário, para garantir que o middleware rode sempre
  matcher: ['/admin/:path*', '/dashboard/:path*', '/entrar', '/trocar-senha'],
};