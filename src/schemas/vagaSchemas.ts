// src/schemas/vagaSchemas.ts
import { z } from "zod";

export const vagaSchema = z.object({
  titulo: z.string().min(5, "Título muito curto"),
  id_area_atuacao: z.coerce.number().min(1, "Selecione uma área profissional"),
  nivel_hierarquico: z.string().min(1, "Selecione o nível"),
  modelo_trabalho: z.string().min(1, "Selecione o modelo"),
  tipo_contrato: z.string().min(1, "Selecione o contrato"),
  tipo_salario: z.enum(["FAIXA", "COMBINAR", "OCULTO"]).default("FAIXA"),
  salario_de: z.coerce.number().optional(),
  salario_ate: z.coerce.number().optional(),
  empresa_confidencial: z.boolean().default(false),
  descricao: z.string().min(15, "Descrição detalhada é obrigatória"),
  responsabilidades: z.string().min(10, "Informe as responsabilidades"),
  requisitos_obrigatorios: z.string().optional().default(""),
  diferenciais: z.string().optional().default(""),
  cidade: z.string().min(2, "Cidade obrigatória").default("Panambi"),
  uf: z.string().length(2, "UF obrigatória").default("RS"),
  beneficios_ids: z.array(z.number()).default([]),
  tipo_diversidade: z.string().default("AMPLA_CONCORRENCIA"),
  data_encerramento: z.string().optional().refine((val) => {
    if (!val) return true;
    const dataEscolhida = new Date(`${val}T12:00:00`);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return dataEscolhida >= hoje;
  }, "A data de encerramento não pode estar no passado."),
  data_fechamento: z.string().optional().refine((val) => {
    if (!val) return true;
    const dataEscolhida = new Date(`${val}T12:00:00`);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    return dataEscolhida >= hoje;
  }, "A data de fechamento não pode estar no passado."),
  etapas: z.array(
    z.object({
      nome: z.string().min(2, "Nome da etapa é obrigatório"),
      requer_agendamento: z.boolean().default(false),
    })
  ),
});

export type VagaFormData = z.infer<typeof vagaSchema>;

export const ESTADOS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", 
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", 
  "SP", "SE", "TO",
];