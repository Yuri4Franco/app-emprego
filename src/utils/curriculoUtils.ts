// src/utils/curriculoUtils.ts

export const maskCPF = (value: string | undefined | null) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})/, "$1-$2")
    .replace(/(-\d{2})\d+?$/, "$1");
};

export const maskMesAno = (value: string | undefined | null) => {
  if (!value) return "";
  let v = value.replace(/\D/g, "");
  if (v.length >= 3) {
    v = v.substring(0, 2) + "/" + v.substring(2, 6);
  }
  return v.substring(0, 7);
};

export const maskCEP = (value: string | undefined | null) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{3})\d+?$/, "$1");
};

export const maskTelefone = (value: string | undefined | null) => {
  if (!value) return "";
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4,5})(\d{4})/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

// Regex e Constantes
export const urlFlexivelRegex = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/;
export const mesAnoRegex = /^(0[1-9]|1[0-2])\/\d{4}$/;

export const descricoesTurno: Record<string, string> = {
  QUALQUER_TURNO: "Disponível para trabalhar em qualquer turno.",
  HORARIO_COMERCIAL: "Trabalho durante o horário comercial padrão (Manhã e Tarde).",
  PRIMEIRO_TURNO: "Trabalho no 1º turno (geralmente manhã/início da tarde).",
  SEGUNDO_TURNO: "Trabalho no 2º turno (geralmente tarde/noite).",
  TERCEIRO_TURNO: "Trabalho no 3º turno (geralmente madrugada).",
};

export const descricoesCnh: Record<string, string> = {
  NAO_POSSUO: "Não possuo carteira de habilitação no momento.",
  A: "Moto (Veículos motorizados de 2 ou 3 rodas).",
  B: "Carro (Veículos de passeio).",
  C: "Caminhão (Veículos de carga acima de 3,5 ton).",
  D: "Ônibus/Vans (Transporte de passageiros).",
  E: "Carretas (Veículos articulados).",
};