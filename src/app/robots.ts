import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  // Substitua pelo domínio oficial da ACI em produção
  const baseUrl = 'https://www.acivagas.com.br';

  return {
    rules: {
      userAgent: '*', // Aplica-se a todos os motores de busca (Googlebot, Bingbot, etc.)
      allow: [
        '/',
        '/ajuda/', // Permite a indexação de todos os tutoriais e guias
        '/vagas/', // Se no futuro tiver uma página pública para listar vagas
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
        '/ativar',
        '/api/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}