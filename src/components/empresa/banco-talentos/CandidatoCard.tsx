// _components/CandidatoCard.tsx
import Link from "next/link";
import {
  HiOutlineStar,
  HiOutlineAcademicCap,
  HiOutlineClock,
  HiOutlineIdentification,
  HiOutlineCalendar,
  HiOutlineUser,
  HiOutlineLocationMarker,
  HiOutlineChevronRight,
  HiOutlineTag,
  HiOutlineCheckCircle,
} from "react-icons/hi";
import {
  CandidatoResumo,
  gerarCodigoTalento,
  turnosOptions,
} from "./constants";

export default function CandidatoCard({
  candidato,
}: {
  candidato: CandidatoResumo;
}) {
  const badgesDoCandidato = [];

  const pctCompleto = (candidato as any).perfil_completo_pct;
  if (pctCompleto !== undefined && pctCompleto !== null) {
    badgesDoCandidato.push({
      label: `Perfil ${pctCompleto}%`,
      icon: HiOutlineCheckCircle,
      color:
        pctCompleto === 100
          ? "bg-blue-50 text-green-700 border-green-200"
          : "bg-orange-50 text-orange-700 border-orange-200",
    });
  }

  // ================= LÓGICA DE BADGES (MANTIDA) =================
  if (candidato.primeiro_emprego) {
    badgesDoCandidato.push({
      label: "1º Emprego",
      icon: HiOutlineStar,
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
    });
  }

  if (candidato.formacoes && candidato.formacoes.length > 0) {
    const niveis = candidato.formacoes.map((f) => f.nivel);
    let nivelPrincipal = "";

    if (niveis.some((n) => n?.includes("Mestrado") || n?.includes("Doutorado")))
      nivelPrincipal = "Mestrado/Doutorado";
    else if (niveis.some((n) => n?.includes("Pós")))
      nivelPrincipal = "Pós-Graduação";
    else if (
      niveis.some((n) => n?.includes("Graduação") || n?.includes("Tecnólogo"))
    )
      nivelPrincipal = "Ensino Superior";
    else if (niveis.some((n) => n?.includes("Técnico")))
      nivelPrincipal = "Curso Técnico";
    else if (niveis.some((n) => n?.includes("Médio")))
      nivelPrincipal = "Ensino Médio";
    else if (niveis.some((n) => n?.includes("Fundamental")))
      nivelPrincipal = "Ensino Fundamental";

    if (nivelPrincipal) {
      badgesDoCandidato.push({
        label: nivelPrincipal,
        icon: HiOutlineAcademicCap,
        color: "bg-gray-50 text-gray-600 border-gray-200",
      });
    }
  }

  if (candidato.turno_preferido && candidato.turno_preferido.length > 0) {
    if (candidato.turno_preferido.includes("QUALQUER_TURNO")) {
      badgesDoCandidato.push({
        label: "Qualquer Turno",
        icon: HiOutlineClock,
        color: "bg-gray-50 text-gray-600 border-gray-200",
      });
    } else {
      const turnosNomes = candidato.turno_preferido
        .map((t) => turnosOptions.find((opt) => opt.value === t)?.label || t)
        .join(", ");
      badgesDoCandidato.push({
        label: turnosNomes,
        icon: HiOutlineClock,
        color: "bg-gray-50 text-gray-600 border-gray-200",
      });
    }
  }

  if (
    candidato.cnh &&
    candidato.cnh.length > 0 &&
    !candidato.cnh.includes("NAO_POSSUO")
  ) {
    badgesDoCandidato.push({
      label: `CNH: ${candidato.cnh.join(", ")}`,
      icon: HiOutlineIdentification,
      color: "bg-gray-50 text-gray-600 border-gray-200",
    });
  }

  if (candidato.disponibilidade_sabados) {
    badgesDoCandidato.push({
      label: "Sábados",
      icon: HiOutlineCalendar,
      color: "bg-gray-50 text-gray-600 border-gray-200",
    });
  }

  // ================= LÓGICA DEMOGRÁFICA SEGURA =================
  // Aceita tanto se o backend mandar 'idade' calculada ou a data de nascimento bruta
  const dataNasc = (candidato as any).data_nascimento;
  const idadeDirect = (candidato as any).idade;
  const idade =
    idadeDirect ??
    (dataNasc
      ? new Date().getFullYear() - new Date(dataNasc).getFullYear()
      : null);

  const generoRaw = (candidato as any).genero;
  const genero = generoRaw
    ? generoRaw.charAt(0) + generoRaw.slice(1).toLowerCase()
    : null;

  return (
    <Link
      href={`/empresa/banco-talentos/${candidato.id_candidato}`}
      className={`block bg-surface p-6 md:p-7 rounded-[32px] border shadow-sm transition-all duration-300 group relative overflow-hidden ${
        candidato.pcd
          ? "border-blue-200 hover:border-blue-400 hover:shadow-blue-100"
          : "border-gray-100 hover:border-primary/30 hover:shadow-lg"
      }`}
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-gray-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none group-hover:bg-primary/5 transition-colors"></div>

      <div className="flex flex-col md:flex-row justify-between gap-6 relative z-10">
        <div className="space-y-4 flex-1">
          {/* 1. TOPO: BADGES */}
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="px-2.5 py-1 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-sm">
              {gerarCodigoTalento(candidato.id_candidato)}
            </span>

            {candidato.pcd && (
              <span className="flex items-center gap-1 px-2.5 py-1 bg-purple-600 text-white text-[10px] font-black uppercase tracking-widest rounded-md shadow-sm">
                <HiOutlineUser size={12} strokeWidth={2.5} /> PcD
              </span>
            )}

            {badgesDoCandidato.map((badge, i) => (
              <span
                key={i}
                className={`flex items-center gap-1 px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-md border ${badge.color}`}
              >
                <badge.icon size={13} strokeWidth={2} />
                {badge.label}
              </span>
            ))}
          </div>

          {/* 2. MEIO: NOVO LAYOUT DE LISTA DE CARGOS SEQUENCIAIS */}
          <div className="py-2 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
            {/* Bloco de Experiência */}
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                ÚLTIMOS CARGOS
              </p>

              {candidato.primeiro_emprego ||
              !candidato.experiencias ||
              candidato.experiencias.length === 0 ? (
                <div className="flex items-center h-full">
                  <h3 className="text-base font-black text-emerald-600 tracking-wide">
                    Em busca do Primeiro Emprego
                  </h3>
                </div>
              ) : (
                <div className="flex flex-col gap-2 pl-1">
                  {candidato.experiencias
                    .slice(0, 3)
                    .map((exp: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-2.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5 bg-primary" />
                        <span className="text-gray-800 font-bold leading-tight text-sm leading-tight">
                          {exp.cargo}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* Bloco de Formação Acadêmica */}
            <div className="space-y-2 md:border-l md:border-gray-50 md:pl-6 pt-3 md:pt-0 border-t border-gray-50 md:border-t-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                Principais Formações
              </p>

              {!candidato.formacoes || candidato.formacoes.length === 0 ? (
                <p className="text-sm text-gray-400 italic mt-1">
                  Não informada
                </p>
              ) : (
                <div className="flex flex-col gap-2 pl-1">
                  {(() => {
                    // 1. Dicionário de Pesos para garantir que o mais importante fique no topo
                    const pesoNivel: Record<string, number> = {
                      "Mestrado / Doutorado": 70,
                      "Pós-Graduação / Especialização": 60,
                      "Superior (Tecnólogo)": 50,
                      Graduação: 50,
                      "Curso Técnico": 40,
                      "Ensino Médio": 30,
                      "Ensino Fundamental": 20,
                      "Curso Complementar": 10,
                    };

                    const pesoStatus: Record<string, number> = {
                      CONCLUÍDO: 3,
                      CONCLUIDO: 3,
                      CURSANDO: 2,
                      INTERROMPIDO: 1,
                    };

                    // 2. Ordenação Inteligente
                    const formacoesOrdenadas = [...candidato.formacoes].sort(
                      (a, b) => {
                        // Critério 1: Nível da Formação
                        const pA = pesoNivel[a.nivel] || 0;
                        const pB = pesoNivel[b.nivel] || 0;
                        if (pA !== pB) return pB - pA;

                        // Critério 2: Status (Concluído > Cursando)
                        const sA = pesoStatus[a.status?.toUpperCase()] || 0;
                        const sB = pesoStatus[b.status?.toUpperCase()] || 0;
                        if (sA !== sB) return sB - sA;

                        // Critério 3: Data mais recente (Se existir)
                        const dataA = a.data_conclusao
                          ? new Date(a.data_conclusao).getTime()
                          : 0;
                        const dataB = b.data_conclusao
                          ? new Date(b.data_conclusao).getTime()
                          : 0;
                        return dataB - dataA;
                      },
                    );

                    // 3. Renderiza apenas os 3 mais relevantes
                    return formacoesOrdenadas
                      .slice(0, 3)
                      .map((form: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2 text-sm"
                        >
                          <HiOutlineAcademicCap
                            className="text-primary shrink-0 mt-0.5"
                            size={16}
                          />
                          <span className="text-gray-800 font-bold leading-tight">
                            {form.curso || form.nivel}
                            {form.curso && form.nivel && (
                              <span className="text-gray-400 font-normal text-[11px] uppercase tracking-wider block mt-0.5">
                                {form.nivel}
                              </span>
                            )}
                          </span>
                        </div>
                      ));
                  })()}
                </div>
              )}
            </div>
          </div>
          {/* 3. RODAPÉ INFORMATIVO: DADOS DEMOGRÁFICOS E ÁREAS */}
          <div className="pt-4 border-t border-gray-50 space-y-3">
            {/* Demográfico e Localização */}
            <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-gray-600">
              {(idade || genero) && (
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl">
                  <HiOutlineUser className="text-gray-400" size={16} />
                  {idade && `${idade} anos`}
                  {idade && genero && " • "}
                  {genero}
                </span>
              )}

              <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-xl">
                <HiOutlineLocationMarker className="text-gray-400" size={16} />
                {candidato.cidade}, {candidato.uf}
              </span>
            </div>

            {/* Todas as Áreas de Atuação */}
            {candidato.areas && candidato.areas.length > 0 && (
              <div className="flex flex-col items-start gap-2 pt-1">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  ÁREAS DE INTERESSE
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {candidato.areas.map((area, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-black uppercase tracking-widest text-primary bg-blue-50/60 border border-blue-100/80 px-2.5 py-1 rounded-lg"
                    >
                      {area}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* SETA DE NAVEGAÇÃO */}
        <div className="shrink-0 hidden md:flex items-center justify-center">
          <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all shadow-sm">
            <HiOutlineChevronRight
              size={22}
              className="group-hover:translate-x-0.5 transition-transform"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}
