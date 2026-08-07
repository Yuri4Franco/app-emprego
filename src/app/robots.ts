import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Substitua pelo domínio oficial da ACI em produção
  const baseUrl = 'https://www.acivagas.com.br';

  return {
    rules: {
      userAgent: '*',
      allow: [
        '/',
        '/ajuda/',
        '/vagas/',
      ],
      disallow: [
        '/admin/',
        '/empresa/',
        '/candidato/',
        '/entrar',
        '/entrar-empresa',
        '/cadastrar',
        '/recuperar-senha',
        '/verificar-email',
        '/trocar-senha',
        '/confirmar-email',
        '/api/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}