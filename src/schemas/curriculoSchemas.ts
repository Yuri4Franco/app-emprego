import { z } from "zod";
import { validarCPF } from "@/src/utils/validarCpf";
import { urlFlexivelRegex, mesAnoRegex } from "@/src/utils/curriculoUtils";

export const dadosGeraisSchema = z.object({
  cpf: z
    .string()
    .min(1, "O CPF é obrigatório")
    .refine((val) => validarCPF(val), {
      message: "CPF inválido. Verifique os números digitados.",
    }),
  data_nascimento: z.string().min(1, "Informe sua data de nascimento!"),
  genero: z.string().min(1, "Por favor, informe seu genêro!"),
  telefone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  link_linkedin: z
    .string()
    .regex(urlFlexivelRegex, "Insira um link válido")
    .optional()
    .nullable()
    .or(z.literal("")),
  link_portfolio: z
    .string()
    .regex(urlFlexivelRegex, "Insira um link válido")
    .optional()
    .nullable()
    .or(z.literal("")),
  link_outro: z
    .string()
    .regex(urlFlexivelRegex, "Insira um link válido")
    .optional()
    .nullable()
    .or(z.literal("")),
  objetivo_profissional: z
    .string()
    .max(300, "Tente ser mais direto no objetivo (máx 300 caracteres)")
    .optional()
    .nullable()
    .or(z.literal("")),
  resumo_profissional: z
    .string()
    .optional()
    .nullable()
    .or(z.literal(""))
    .refine((val) => !val || val.trim().length >= 20, {
      message:
        "Se for preencher, escreva pelo menos 20 caracteres para um bom resumo.",
    }),
  pretensao_salarial: z.coerce.number().optional().nullable(),
  sem_pretensao: z.boolean().default(false),
  pcd: z.boolean().default(false),
  tipo_pcd: z.string().optional().nullable(),
  necessidade: z.string().max(300, "Texto muito longo").optional().nullable(),
  disponibilidade_viagem: z.boolean().default(false),
  disponibilidade_mudanca: z.boolean().default(false),
  disponibilidade_sabados: z.boolean().default(false),
  cnh: z
    .array(z.enum(["NAO_POSSUO", "A", "B", "C", "D", "E"]))
    .optional()
    .default(["NAO_POSSUO"]),
  turno_preferido: z
    .array(
      z.enum([
        "MANHÃ",
        "TARDE",
        "NOITE",
        "COMERCIAL",
        "QUALQUER_TURNO",
      ]),
    )
    .max(3, "Máximo 3 turnos")
    .optional()
    .default([]),
  tipo_contato: z
    .array(z.enum(["WHATSAPP", "EMAIL", "LIGACAO", "QUALQUER_UM"]))
    .default(["QUALQUER_UM"]),
  primeiro_emprego: z.boolean().default(false),
  cep: z.string().min(8, "CEP obrigatório").optional().nullable(),
  logradouro: z.string().min(3, "Rua obrigatória").optional().nullable(),
  numero: z.string().min(1, "Nº obrigatório").optional().nullable(),
  complemento: z.string().optional().nullable(),
  bairro: z.string().min(2, "Bairro obrigatório"),
  cidade: z.string().min(2, "Cidade obrigatória").default("Panambi"),
  uf: z.string().length(2, "UF obrigatória").default("RS"),
});

export type DadosGeraisData = z.infer<typeof dadosGeraisSchema>;

export const experienciaSchema = z
  .object({
    empresa: z.string().min(2, "Nome da empresa é obrigatório"),
    cargo: z.string().min(2, "Cargo é obrigatório"),
    atividades: z
      .string()
      .max(1000, "Resumo muito longo")
      .optional()
      .nullable(),
    data_inicio: z.string().regex(mesAnoRegex, "Use o formato MM/AAAA"),
    data_fim: z.string().optional().nullable(),
    atual: z.boolean().default(false),
  })
  // Refine 1: Exige a data final se não for o trabalho atual
  .refine(
    (data) => {
      if (!data.atual && (!data.data_fim || !mesAnoRegex.test(data.data_fim)))
        return false;
      return true;
    },
    { message: "Data final é obrigatória (MM/AAAA)", path: ["data_fim"] }
  )
  // Refine 2: Verifica a ordem cronológica
  .refine(
    (data) => {
      // Se for o trabalho atual ou se as datas não estiverem preenchidas, ignora essa validação
      if (data.atual || !data.data_inicio || !data.data_fim) return true;

      // Só tenta validar se ambas baterem com o regex para evitar quebrar o split
      if (!mesAnoRegex.test(data.data_inicio) || !mesAnoRegex.test(data.data_fim)) return true;

      const [mesInicio, anoInicio] = data.data_inicio.split("/");
      const [mesFim, anoFim] = data.data_fim.split("/");

      // Transforma "05/2024" em 202405
      const valorInicio = parseInt(anoInicio) * 100 + parseInt(mesInicio);
      const valorFim = parseInt(anoFim) * 100 + parseInt(mesFim);

      return valorFim >= valorInicio;
    },
    { message: "A data final não pode ser anterior à data inicial", path: ["data_fim"] }
  );
  
export type ExperienciaData = z.infer<typeof experienciaSchema>;

export const formacaoSchema = z
  .object({
    nivel: z.string().min(2, "Selecione o nível de escolaridade"),
    status: z.string().min(2, "Selecione o status atual"),
    instituicao: z.string().optional().nullable(),
    curso: z.string().optional().nullable(),
    data_conclusao: z.string().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    const isBasico =
      data.nivel === "Ensino Fundamental" || data.nivel === "Ensino Médio";
    const isConcluido = data.status.toUpperCase() === "CONCLUÍDO";

    if (!isBasico && data.nivel !== "") {
      if (!data.instituicao || data.instituicao.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Instituição é obrigatória.",
          path: ["instituicao"],
        });
      }
      if (!data.curso || data.curso.trim().length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Curso é obrigatório.",
          path: ["curso"],
        });
      }
      if (
        isConcluido &&
        (!data.data_conclusao || data.data_conclusao.trim() === "")
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Data de conclusão é obrigatória.",
          path: ["data_conclusao"],
        });
      }
    }
  });

export type FormacaoData = z.infer<typeof formacaoSchema>;
