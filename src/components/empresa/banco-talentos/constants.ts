export interface CandidatoResumo {
  id_candidato: number;
  identificacao_publica: string;
  cidade: string;
  uf: string;
  primeiro_emprego: boolean;
  pcd: boolean;
  areas: string[];
  experiencias: any[];
  formacoes?: any[];
  cnh?: string[];
  turno_preferido?: string[];
  disponibilidade_sabados?: boolean;
}

export interface Competencia {
  id_competencia: number;
  nome: string;
}

export const turnosOptions = [
  { value: "COMERCIAL", label: "Comercial" },
  { value: "MANHÃ", label: "Manhã" },
  { value: "TARDE", label: "Tarde" },
  { value: "NOITE", label: "Noite" },
];

export const escolaridadeOptions = [
  { value: "MEDIO_COMPLETO", label: "Ens. Médio" },
  { value: "TECNICO", label: "Técnico" },
  { value: "SUPERIOR_CURSANDO", label: "Sup. Cursando" },
  { value: "SUPERIOR_COMPLETO", label: "Sup. Completo" },
];

export const cnhOptions = [
  { value: "A", label: "A" },
  { value: "B", label: "B" },
  { value: "C", label: "C" },
  { value: "D", label: "D" },
  { value: "E", label: "E" },
];

export const generoOptions = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMININO", label: "Feminino" },
];

export const gerarCodigoTalento = (id: number) => {
  const scrambledId = id * 9973 + 12345;
  return `TAL-${scrambledId.toString(36).toUpperCase()}`;
};

// Função utilitária para adicionar/remover itens de um array de filtros
export const toggleArrayItem = (array: string[], item: string) => {
  return array.includes(item)
    ? array.filter((i) => i !== item)
    : [...array, item];
};
