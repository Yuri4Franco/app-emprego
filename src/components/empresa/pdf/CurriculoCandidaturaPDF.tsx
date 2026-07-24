import { Document, Page, Text, View, StyleSheet, Image } from "@react-pdf/renderer";

// Mapeamento de rótulos mais amigáveis para os Enums do banco
const turnoLabels: Record<string, string> = {
  QUALQUER_TURNO: "Qualquer Turno",
  COMERCIAL: "Comercial",
  MANHA: "Manhã",
  TARDE: "Tarde",
  NOITE: "Noite",
};

const contatoLabels: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  EMAIL: "E-mail",
  LIGACAO: "Ligação",
  QUALQUER_UM: "Qualquer canal",
};

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", color: "#1f2937", backgroundColor: "#ffffff" },

  // Cabeçalho com Foto
  headerContainer: { flexDirection: "row", gap: 16, borderBottomWidth: 2, borderBottomColor: "#e5e7eb", paddingBottom: 16, marginBottom: 16 },
  photoWrapper: { width: 70, height: 70, borderRadius: 8, overflow: "hidden", backgroundColor: "#f3f4f6", border: "1pt solid #e5e7eb", shrink: 0 },
  photo: { width: "100%", height: "100%", objectFit: "cover" },
  photoPlaceholder: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center", backgroundColor: "#f8fafc" },
  photoInitial: { fontSize: 28, fontWeight: "bold", color: "#cbd5e1" },

  headerInfo: { flex: 1 },
  nome: { fontSize: 20, fontWeight: "bold", color: "#111827", marginBottom: 6 },
  badgesRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 8 },
  badge: { backgroundColor: "#f3f4f6", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, fontSize: 8.5, color: "#4b5563", fontWeight: "bold" },
  badgePrimeiroEmprego: { backgroundColor: "#ecfdf5", color: "#047857", paddingHorizontal: 6, paddingVertical: 3, borderRadius: 4, fontSize: 8.5, fontWeight: "bold" },

  // Endereço e Contatos
  enderecoText: { fontSize: 9, color: "#6b7280", marginBottom: 6, lineHeight: 1.3 },
  contatoRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginTop: 2 },
  contatoItem: { fontSize: 9, color: "#2563eb", fontWeight: "bold" },

  // Seções e Barras
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8, marginTop: 14 },
  sectionBar: { width: 3.5, height: 13, backgroundColor: "#2563eb", marginRight: 6, borderRadius: 2 },
  sectionBarPcd: { width: 3.5, height: 13, backgroundColor: "#10b981", marginRight: 6, borderRadius: 2 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", color: "#111827", textTransform: "uppercase", letterSpacing: 0.8 },

  // Textos e Blocos
  textBody: { fontSize: 9.5, color: "#4b5563", lineHeight: 1.5, textAlign: "justify" },
  timelineItem: { borderLeftWidth: 1.5, borderLeftColor: "#d1d5db", paddingLeft: 10, marginLeft: 3, marginBottom: 10 },
  itemTitle: { fontSize: 11, fontWeight: "bold", color: "#111827" },
  itemSubtitle: { fontSize: 9.5, color: "#2563eb", fontWeight: "bold", marginVertical: 1.5 },
  itemDate: { fontSize: 8.5, color: "#6b7280", marginBottom: 3 },

  // Bloco PcD
  pcdBox: { backgroundColor: "#ecfdf5", border: "1pt solid #a7f3d0", padding: 10, borderRadius: 6, marginBottom: 10 },
  pcdTitle: { fontSize: 9.5, fontWeight: "bold", color: "#065f46", marginBottom: 2 },
  pcdDesc: { fontSize: 9, color: "#047857", lineHeight: 1.4 },

  // Habilidades
  skillsContainer: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 4 },
  skillBadge: { backgroundColor: "#eff6ff", border: "1pt solid #dbeafe", paddingHorizontal: 7, paddingVertical: 3, borderRadius: 5 },
  skillName: { fontSize: 8.5, fontWeight: "bold", color: "#1e40af" },
  skillLevel: { fontSize: 6.5, color: "#3b82f6", textTransform: "uppercase", marginTop: 0.5 },

  // Grid de Logística Completo
  logisticsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 4 },
  logisticsBox: { width: "48.5%", backgroundColor: "#f8fafc", padding: 8, borderRadius: 5, border: "1pt solid #e2e8f0" },
  logisticsLabel: { fontSize: 7.5, color: "#64748b", textTransform: "uppercase", fontWeight: "bold" },
  logisticsValue: { fontSize: 9.5, color: "#0f172a", fontWeight: "bold", marginTop: 2 }
});

export function CurriculoCandidaturaPDF({ item }: { item: any }) {
  const { curriculo } = item;
  const nome = curriculo?.nome || curriculo?.usuario?.nome || "Candidato";
  const email = curriculo?.email || curriculo?.usuario?.email;

  // Validação segura de foto para não travar a engine do PDF caso a URL venha inválida/nula
  const getFotoCompatiblePdf = (url?: string) => {
    if (!url || typeof url !== "string" || !url.startsWith("http")) return null;

    // Se a foto for do Cloudinary, trocamos a extensão final ou injetamos f_jpg
    if (url.includes("cloudinary.com")) {
      return url.replace(/\.webp$/i, ".jpg").replace("/image/upload/", "/image/upload/f_jpg,q_auto/");
    }

    return url;
  };

  const fotoUrlCompativel = getFotoCompatiblePdf(curriculo?.foto_url);
  const fotoValida = !!fotoUrlCompativel;

  // Formatação do endereço completo
  const end = curriculo?.endereco;
  const enderecoCompleto = end ? [
    end.logradouro ? `${end.logradouro}${end.numero ? `, nº ${end.numero}` : ""}` : null,
    end.complemento ? `(${end.complemento})` : null,
    end.bairro ? `Bairro ${end.bairro}` : null,
    end.cidade ? `${end.cidade}/${end.uf || ""}` : null,
    end.cep ? `CEP: ${end.cep}` : null
  ].filter(Boolean).join(" • ") : null;

  // Formatação de arrays e enums
  const cnhFormatada = curriculo?.cnh?.length && !curriculo.cnh.includes("NAO_POSSUO")
    ? curriculo.cnh.join(", ")
    : "Não possui";

  const turnosFormatados = Array.isArray(curriculo?.turno_preferido) && curriculo.turno_preferido.length > 0
    ? curriculo.turno_preferido.map((t: string) => turnoLabels[t] || t).join(", ")
    : "Qualquer Turno";

  const contatosPreferidos = Array.isArray(curriculo?.tipo_contato) && curriculo.tipo_contato.length > 0
    ? curriculo.tipo_contato.map((c: string) => contatoLabels[c] || c).join(", ")
    : "Qualquer canal";

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        {/* 1. CABEÇALHO COM FOTO E IDENTIDADE */}
        <View style={styles.headerContainer}>

          {/* Box de Foto com Fallback para Inicial do Nome */}
          <View style={styles.photoWrapper}>
            {fotoValida ? (
              /* ✨ Agora passamos a URL convertida para JPG que o React-PDF aceita! */
              <Image src={fotoUrlCompativel} style={styles.photo} />
            ) : (
              <View style={styles.photoPlaceholder}>
                <Text style={styles.photoInitial}>{nome.charAt(0).toUpperCase()}</Text>
              </View>
            )}
          </View>

          {/* Dados Pessoais e Endereço */}
          <View style={styles.headerInfo}>
            <Text style={styles.nome}>{nome}</Text>

            <View style={styles.badgesRow}>
              {curriculo?.data_nascimento && (
                <Text style={styles.badge}>
                  {Math.floor((new Date().getTime() - new Date(curriculo.data_nascimento).getTime()) / (365.25 * 24 * 60 * 60 * 1000))} anos
                </Text>
              )}
              {curriculo?.genero && <Text style={styles.badge}>{curriculo.genero}</Text>}
              {curriculo?.primeiro_emprego && <Text style={styles.badgePrimeiroEmprego}>1º EMPREGO</Text>}
              {curriculo?.pcd && <Text style={{ ...styles.badge, backgroundColor: "#d1fae5", color: "#065f46" }}>PcD</Text>}
            </View>

            {enderecoCompleto && <Text style={styles.enderecoText}>{enderecoCompleto}</Text>}

            <View style={styles.contatoRow}>
              {email && <Text style={styles.contatoItem}>E-mail: {email}</Text>}
              {curriculo?.whatsapp && <Text style={styles.contatoItem}>WhatsApp: {curriculo.whatsapp}</Text>}
              {curriculo?.telefone && !curriculo?.whatsapp && <Text style={styles.contatoItem}>Tel: {curriculo.telefone}</Text>}
              {curriculo?.link_linkedin && <Text style={styles.contatoItem}>LinkedIn: {curriculo.link_linkedin.replace(/^https?:\/\/(www\.)?/, "")}</Text>}
              {curriculo?.link_portfolio && <Text style={styles.contatoItem}>Portfólio: {curriculo.link_portfolio.replace(/^https?:\/\/(www\.)?/, "")}</Text>}
              {curriculo?.link_outro && <Text style={styles.contatoItem}>Link: {curriculo.link_outro.replace(/^https?:\/\/(www\.)?/, "")}</Text>}
            </View>
          </View>
        </View>

        {/* 2. PERFIL INCLUSIVO (PCD) */}
        {curriculo?.pcd && (
          <View style={styles.pcdBox} wrap={false}>
            <Text style={styles.pcdTitle}>Pessoa com Deficiência (PcD) {curriculo.tipo_pcd ? `— ${curriculo.tipo_pcd}` : ""}</Text>
            {curriculo.necessidade && <Text style={styles.pcdDesc}>Acessibilidade/Adaptação necessária: {curriculo.necessidade}</Text>}
          </View>
        )}

        {/* 3. OBJETIVO PROFISSIONAL (SEPARADO) */}
        {curriculo?.objetivo_profissional && (
          <View style={{ marginBottom: 10 }}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>Objetivo Profissional</Text>
            </View>
            <Text style={styles.textBody}>{curriculo.objetivo_profissional}</Text>
          </View>
        )}

        {/* 4. RESUMO PROFISSIONAL (SEPARADO) */}
        {curriculo?.resumo_profissional && (
          <View style={{ marginBottom: 10 }}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>Resumo Profissional</Text>
            </View>
            <Text style={styles.textBody}>{curriculo.resumo_profissional}</Text>
          </View>
        )}

        {/* 5. EXPERIÊNCIA PROFISSIONAL */}
        {curriculo?.experiencias?.length > 0 && (
          <View style={{ marginBottom: 10 }}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>Experiência Profissional</Text>
            </View>

            {curriculo.experiencias.map((exp: any, index: number) => (
              <View key={index} style={styles.timelineItem} wrap={false}>
                <Text style={styles.itemTitle}>{exp.cargo}</Text>
                <Text style={styles.itemSubtitle}>{exp.empresa}</Text>
                <Text style={styles.itemDate}>
                  {new Date(exp.data_inicio).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })} — {" "}
                  {exp.atual ? "Atualmente" : new Date(exp.data_fim).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                </Text>
                {exp.atividades && <Text style={styles.textBody}>{exp.atividades}</Text>}
              </View>
            ))}
          </View>
        )}

        {/* 6. FORMAÇÃO ACADÊMICA */}
        {curriculo?.formacoes?.length > 0 && (
          <View style={{ marginBottom: 10 }} wrap={false}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>Formação Acadêmica</Text>
            </View>

            {curriculo.formacoes.map((form: any, index: number) => (
              <View key={index} style={styles.timelineItem}>
                <Text style={styles.itemTitle}>{form.curso || form.nivel}</Text>
                {form.instituicao && <Text style={styles.itemSubtitle}>{form.instituicao}</Text>}
                <Text style={styles.itemDate}>{form.nivel} • {form.status}</Text>
              </View>
            ))}
          </View>
        )}

        {/* 7. HABILIDADES */}
        {curriculo?.competencias?.length > 0 && (
          <View style={{ marginBottom: 14 }} wrap={false}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>Habilidades Técnicas</Text>
            </View>

            <View style={styles.skillsContainer}>
              {curriculo.competencias.map((comp: any, index: number) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillName}>{comp.nome}</Text>
                  <Text style={styles.skillLevel}>{comp.nivel || "Básico"}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 8. DISPONIBILIDADE E LOGÍSTICA COMPLETA */}
        <View wrap={false}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>Disponibilidade & Preferências Logísticas</Text>
          </View>

          <View style={styles.logisticsGrid}>
            <View style={styles.logisticsBox}>
              <Text style={styles.logisticsLabel}>Pretensão Salarial</Text>
              <Text style={styles.logisticsValue}>
                {curriculo?.pretensao_salarial ? `R$ ${curriculo.pretensao_salarial}` : "A Combinar"}
              </Text>
            </View>

            <View style={styles.logisticsBox}>
              <Text style={styles.logisticsLabel}>CNH (Carteira de Motorista)</Text>
              <Text style={styles.logisticsValue}>{cnhFormatada}</Text>
            </View>

            <View style={styles.logisticsBox}>
              <Text style={styles.logisticsLabel}>Disponível para Sábados</Text>
              <Text style={styles.logisticsValue}>{curriculo?.disponibilidade_sabados ? "Sim, com disponibilidade" : "Não disponível"}</Text>
            </View>

            <View style={styles.logisticsBox}>
              <Text style={styles.logisticsLabel}>Turnos Preferidos</Text>
              <Text style={styles.logisticsValue}>{turnosFormatados}</Text>
            </View>

            <View style={styles.logisticsBox}>
              <Text style={styles.logisticsLabel}>Viagens</Text>
              <Text style={styles.logisticsValue}>{curriculo?.disponibilidade_viagem ? "Disponível para viagens" : "Não disponível"}</Text>
            </View>

            <View style={styles.logisticsBox}>
              <Text style={styles.logisticsLabel}>Mudança de Cidade/Estado</Text>
              <Text style={styles.logisticsValue}>{curriculo?.disponibilidade_mudanca ? "Disponível para mudança" : "Não disponível"}</Text>
            </View>

            <View style={{ ...styles.logisticsBox, width: "100%" }}>
              <Text style={styles.logisticsLabel}>Canais de Contato Preferidos</Text>
              <Text style={{ ...styles.logisticsValue, color: "#2563eb" }}>{contatosPreferidos}</Text>
            </View>
          </View>
        </View>

      </Page>
    </Document>
  );
}