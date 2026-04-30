// src/utils/vaga-adapter.ts
import { JobProps } from "@/src/components/JobCard";

const TRADUCAO_NIVEL: Record<string, string> = {
  JOVEM_APRENDIZ: "Jovem Aprendiz",
  ESTAGIO: "Estágio",
  TRAINEE: "Trainee",
  OPERACIONAL: "Operacional / Auxiliar",
  ASSISTENTE: "Assistente",
  JUNIOR: "Júnior",
  PLENO: "Pleno",
  SENIOR: "Sênior",
  ESPECIALISTA: "Especialista",
  SUPERVISAO: "Supervisão / Coordenação",
  GERENCIA: "Gerência",
  DIRETORIA: "Diretoria",
};

const TRADUCAO_CONTRATO: Record<string, string> = {
  CLT_EFETIVO: "CLT Efetivo",
  CLT_TEMPORARIO: "CLT Temporário",
  PJ: "PJ (Pejotinha)",
  FREELANCER: "Freelancer",
  ESTAGIO: "Estágio",
};

export const formatarTempo = (dataISO: string) => {
  if (!dataISO) return "Recentemente";
  const dias = Math.floor(
    (new Date().getTime() - new Date(dataISO).getTime()) / (1000 * 3600 * 24),
  );
  if (dias < 7) return `${dias} dias`;
  if (dias < 30) return `${Math.floor(dias / 7)} sem`;
  return `${Math.floor(dias / 30)} mês(es)`;
};



export const formatarSalario = (vaga: any) => {
  if (vaga.ocultar_salario) return undefined;
  if (vaga.salario_a_combinar) return "A combinar";
  if (vaga.faixa_salarial_de && vaga.faixa_salarial_ate) {
    return `R$ ${vaga.faixa_salarial_de} - R$ ${vaga.faixa_salarial_ate}`;
  }
  if (vaga.faixa_salarial_de) return `A partir de R$ ${vaga.faixa_salarial_de}`;
  return undefined;
};

export const mapearVagaBackendParaFrontend = (vagaBackend: any): JobProps => {
  return {
    id: vagaBackend.id_vaga,
    company: vagaBackend.empresa_confidencial
      ? "Empresa Confidencial"
      : vagaBackend.empresa?.nome_fantasia || "Empresa Confidencial",
    title: vagaBackend.titulo,
    location: vagaBackend.cidade || "Panambi",
    type: vagaBackend.modelo_trabalho,
    contract: TRADUCAO_CONTRATO[vagaBackend.tipo_contrato] || vagaBackend.tipo_contrato.replace('_', ' '),
    nivel: vagaBackend.nivel_hierarquico !== "NAO_SE_APLICA" 
           ? (TRADUCAO_NIVEL[vagaBackend.nivel_hierarquico] || vagaBackend.nivel_hierarquico) 
           : undefined,
    salary: formatarSalario(vagaBackend),
    datePosted: formatarTempo(vagaBackend.data_publicacao),
    isNew:
      Math.floor(
        (new Date().getTime() -
          new Date(vagaBackend.data_publicacao).getTime()) /
          (1000 * 3600 * 24),
      ) <= 3,
    isMember: true,
    pcdType: null,
  };
};
