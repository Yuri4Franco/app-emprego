'use server';

import EmpresasPageClient from "./EmpresasPageClient";

export default async function EmpresasPage() {
  let metricasIniciais = {
    curriculos_ativos: 0,
    empresas_cadastradas: 0,
    vagas_divulgadas: 0,
    candidaturas_realizadas: 0,
    candidatos_ativos: 0,
  };

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/metricas-gerais`, {
      next: { revalidate: 86400 },
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        metricasIniciais = json.data;
      }
    }
  } catch (error) {
    console.error("Erro ao buscar métricas no servidor:", error);
  }
  return <EmpresasPageClient metricasIniciais={metricasIniciais} />;
}