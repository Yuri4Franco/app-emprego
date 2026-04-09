export interface EmpresaListagem {
  id_empresa: number;
  nome_fantasia: string;
  cnpj: string;
  tipo_vinculo_aci: "ASSOCIADO" | "NAO_ASSOCIADO";
  cidade: string;
  bairro: string;
  vagas_count: number;
  responsavel: {
    nome: string;
    email: string;
    status: "ATIVO" | "PENDENTE" | "BLOQUEADO";
  } | null;
}