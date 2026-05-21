import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const getDashboardPath = (role?: string) => {
  if (role === 'ADM') return '/admin/dashboard';
  if (role === 'EMPRESA') return '/empresa/dashboard';
  return '/candidato/inicio'; // CANDIDATO é o default
};

export function proxy(request: NextRequest) {
  const token = request.cookies.get('aci_token')?.value;
  const role = request.cookies.get('user_role')?.value;
  const forceChange = request.cookies.get('exigir_troca_senha')?.value === 'true';

  const { pathname } = request.nextUrl;

  if (token && forceChange && pathname !== '/trocar-senha') {
    return NextResponse.redirect(new URL('/trocar-senha', request.url));
  }

  if (pathname === '/trocar-senha' && (!token || !forceChange)) {
    return NextResponse.redirect(new URL(token ? getDashboardPath(role) : '/entrar', request.url));
  }

  if (pathname === '/entrar') {
    if (token) {
      return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
    }
    return NextResponse.next();
  }

  if (!token && (pathname.startsWith('/admin') || pathname.startsWith('/empresa') || pathname.startsWith('/dashboard'))) {
    return NextResponse.redirect(new URL('/entrar', request.url));
  }

  if (pathname.startsWith('/admin') && role !== 'ADM') {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  if (pathname.startsWith('/empresa') && role !== 'EMPRESA') {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  if (pathname.startsWith('/candidato/inicio') && role !== 'CANDIDATO') {
    return NextResponse.redirect(new URL(getDashboardPath(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/empresa/:path*', '/dashboard/:path*', '/entrar', '/trocar-senha'],
};