import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  // Substitua pelo domínio oficial da plataforma
  const baseUrl = "https://www.acivagas.com.br";

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0, // A página inicial é a mais importante (prioridade máxima)
    },
    {
      url: `${baseUrl}/para-empresas`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
{
      url: `${baseUrl}/vagas`,
      lastModified: new Date(),
      changeFrequency: 'always',
      priority: 0.9, 
    },
    {
      url: `${baseUrl}/ajuda`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ajuda/como-criar-conta`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/ajuda/curriculo-100`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];
}
