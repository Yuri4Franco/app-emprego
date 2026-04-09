// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('aci_token')?.value;
  const role = request.cookies.get('user_role')?.value;

  const { pathname } = request.nextUrl;

  if (pathname === '/entrar' || pathname === '/login') { // Ajuste conforme sua rota
    if (token) {
      // Se for ADM, manda direto pro painel administrativo
      if (role === 'ADM') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      // Se for Candidato ou Empresa, manda pro dashboard comum
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  if (pathname.startsWith('/admin')) {
    if (!token || role !== 'ADM') {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  if (pathname.startsWith('/dashboard') && !token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/login' && token) {
    return role === 'ADM' 
      ? NextResponse.redirect(new URL('/admin', request.url))
      : NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*', '/entrar'],
};