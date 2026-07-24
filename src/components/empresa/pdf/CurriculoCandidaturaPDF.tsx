import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// Paleta de cores idêntica ao seu Tailwind
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    color: "#1f2937",
    backgroundColor: "#ffffff",
  },

  // Cabeçalho / Identidade
  header: {
    borderBottomWidth: 2,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 15,
    marginBottom: 20,
  },
  nome: { fontSize: 22, fontWeight: "bold", color: "#111827", marginBottom: 6 },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  badge: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    color: "#4b5563",
    fontWeight: "bold",
  },
  badgePrimeiroEmprego: {
    backgroundColor: "#ecfdf5",
    color: "#047857",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    fontSize: 9,
    fontWeight: "bold",
  },

  // Contatos (Sem Paywall!)
  contatoRow: { flexDirection: "row", flexWrap: "wrap", gap: 12, marginTop: 4 },
  contatoItem: { fontSize: 10, color: "#2563eb", fontWeight: "bold" },

  // Títulos de Seção (com a barrinha azul lateral)
  sectionHeader: {
    flexDirection: "row",
    itemsCenter: "center",
    marginBottom: 10,
    marginTop: 15,
  },
  sectionBar: {
    width: 4,
    height: 14,
    backgroundColor: "#2563eb",
    marginRight: 6,
    borderRadius: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#111827",
    textTransform: "uppercase",
    letterSpacing: 1,
  },

  // Blocos de Experiência e Formação (Linha lateral do seu layout)
  timelineItem: {
    borderLeftWidth: 1.5,
    borderLeftColor: "#d1d5db",
    paddingLeft: 12,
    marginLeft: 4,
    marginBottom: 12,
  },
  itemTitle: { fontSize: 12, fontWeight: "bold", color: "#111827" },
  itemSubtitle: {
    fontSize: 10,
    color: "#2563eb",
    fontWeight: "bold",
    marginVertical: 2,
  },
  itemDate: { fontSize: 9, color: "#6b7280", marginBottom: 4 },
  itemDesc: { fontSize: 9.5, color: "#4b5563", lineHeight: 1.4 },

  // Habilidades / Badges
  skillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  skillBadge: {
    backgroundColor: "#eff6ff",
    border: "1pt solid #dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  skillName: { fontSize: 9, fontWeight: "bold", color: "#1e40af" },
  skillLevel: {
    fontSize: 7,
    color: "#3b82f6",
    textTransform: "uppercase",
    marginTop: 1,
  },

  // Grid de Logística
  logisticsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 6,
  },
  logisticsBox: {
    width: "48%",
    backgroundColor: "#f9fafb",
    padding: 8,
    borderRadius: 6,
    border: "1pt solid #f3f4f6",
  },
  logisticsLabel: {
    fontSize: 8,
    color: "#6b7280",
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  logisticsValue: {
    fontSize: 10,
    color: "#111827",
    fontWeight: "bold",
    marginTop: 2,
  },
});

export function CurriculoCandidaturaPDF({ item }: { item: any }) {
  const { curriculo } = item;
  const nome = curriculo?.nome || curriculo?.usuario?.nome || "Candidato";
  const email = curriculo?.email || curriculo?.usuario?.email;

  // Montagem do endereço
  const endereco = [curriculo?.endereco?.cidade, curriculo?.endereco?.uf]
    .filter(Boolean)
    .join("/");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* 1. IDENTIDADE E CONTATO (100% Liberado) */}
        <View style={styles.header}>
          <Text style={styles.nome}>{nome}</Text>

          <View style={styles.badgesRow}>
            {endereco && <Text style={styles.badge}>{endereco}</Text>}
            {curriculo?.genero && (
              <Text style={styles.badge}>{curriculo.genero}</Text>
            )}
            {curriculo?.primeiro_emprego && (
              <Text style={styles.badgePrimeiroEmprego}>1º EMPREGO</Text>
            )}
          </View>

          <View style={styles.contatoRow}>
            {email && <Text style={styles.contatoItem}>E-mail: {email}</Text>}
            {curriculo?.whatsapp && (
              <Text style={styles.contatoItem}>
                WhatsApp: {curriculo.whatsapp}
              </Text>
            )}
            {curriculo?.telefone && !curriculo?.whatsapp && (
              <Text style={styles.contatoItem}>Tel: {curriculo.telefone}</Text>
            )}
            {curriculo?.link_linkedin && (
              <Text style={styles.contatoItem}>
                LinkedIn: {curriculo.link_linkedin}
              </Text>
            )}
          </View>
        </View>

        {/* 2. RESUMO PROFISSIONAL */}
        {(curriculo?.resumo_profissional ||
          curriculo?.objetivo_profissional) && (
          <View style={{ marginBottom: 10 }}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>Resumo / Objetivo</Text>
            </View>
            <Text style={styles.itemDesc}>
              {curriculo.resumo_profissional || curriculo.objetivo_profissional}
            </Text>
          </View>
        )}

        {/* 3. EXPERIÊNCIA PROFISSIONAL */}
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
                  {new Date(exp.data_inicio).toLocaleDateString("pt-BR", {
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  —{" "}
                  {exp.atual
                    ? "Atualmente"
                    : new Date(exp.data_fim).toLocaleDateString("pt-BR", {
                        month: "short",
                        year: "numeric",
                      })}
                </Text>
                {exp.atividades && (
                  <Text style={styles.itemDesc}>{exp.atividades}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* 4. FORMAÇÃO ACADÊMICA */}
        {curriculo?.formacoes?.length > 0 && (
          <View style={{ marginBottom: 10 }} wrap={false}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>Formação Acadêmica</Text>
            </View>

            {curriculo.formacoes.map((form: any, index: number) => (
              <View key={index} style={styles.timelineItem}>
                <Text style={styles.itemTitle}>{form.curso || form.nivel}</Text>
                {form.instituicao && (
                  <Text style={styles.itemSubtitle}>{form.instituicao}</Text>
                )}
                <Text style={styles.itemDate}>
                  {form.nivel} • {form.status}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* 5. HABILIDADES */}
        {curriculo?.competencias?.length > 0 && (
          <View style={{ marginBottom: 15 }} wrap={false}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionBar} />
              <Text style={styles.sectionTitle}>Habilidades Técnicas</Text>
            </View>

            <View style={styles.skillsContainer}>
              {curriculo.competencias.map((comp: any, index: number) => (
                <View key={index} style={styles.skillBadge}>
                  <Text style={styles.skillName}>{comp.nome}</Text>
                  <Text style={styles.skillLevel}>
                    {comp.nivel || "Básico"}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* 6. LOGÍSTICA E PREFERÊNCIAS */}
        <View wrap={false}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionBar} />
            <Text style={styles.sectionTitle}>Disponibilidade & Logística</Text>
          </View>

          <View style={styles.logisticsGrid}>
            <View style={styles.logisticsBox}>
              <Text style={styles.logisticsLabel}>Pretensão Salarial</Text>
              <Text style={styles.logisticsValue}>
                {curriculo?.pretensao_salarial
                  ? `R$ ${curriculo.pretensao_salarial}`
                  : "A Combinar"}
              </Text>
            </View>
            <View style={styles.logisticsBox}>
              <Text style={styles.logisticsLabel}>CNH</Text>
              <Text style={styles.logisticsValue}>
                {curriculo?.cnh?.length
                  ? curriculo.cnh.join(", ")
                  : "Não possui"}
              </Text>
            </View>
            <View style={styles.logisticsBox}>
              <Text style={styles.logisticsLabel}>Disponível para Viagens</Text>
              <Text style={styles.logisticsValue}>
                {curriculo?.disponibilidade_viagem ? "Sim" : "Não"}
              </Text>
            </View>
            <View style={styles.logisticsBox}>
              <Text style={styles.logisticsLabel}>Disponível para Mudança</Text>
              <Text style={styles.logisticsValue}>
                {curriculo?.disponibilidade_mudanca ? "Sim" : "Não"}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
