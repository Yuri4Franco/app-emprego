import { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://www.acivagas.com.br";
  // Ajuste para a URL real da sua API no ambiente de produção
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333"; 

  // 1. Busca os IDs das vagas de forma otimizada
  let vagasDinamicas: MetadataRoute.Sitemap = [];
  
  try {
    // Usamos revalidate: 3600 (1 hora) para o Next não bater no backend a cada segundo
    const response = await fetch(`${apiUrl}/vagas/sitemap`, { 
      next: { revalidate: 3600 } 
    });
    
    if (response.ok) {
      const vagas = await response.json();
      
      vagasDinamicas = vagas.map((vaga: any) => ({
        url: `${baseUrl}/vagas/${vaga.id_vaga}`,
        // Usa a data de atualização, se não tiver, usa a de criação
        lastModified: new Date(vaga.data_atualizacao || vaga.criada_em),
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error("Erro ao buscar vagas para o sitemap:", error);
    // Em caso de falha na API, o sitemap estático ainda será gerado
  }

  // 2. Define as rotas estáticas que você já tinha
  const rotasEstaticas: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
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

  // 3. Retorna tudo junto
  return [...rotasEstaticas, ...vagasDinamicas];
}