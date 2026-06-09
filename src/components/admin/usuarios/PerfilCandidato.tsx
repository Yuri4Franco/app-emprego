import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
  HiOutlineLink,
  HiOutlineHeart,
  HiOutlineTag,
  HiOutlineClock,
  HiOutlineIdentification,
  HiOutlineMoon,
} from "react-icons/hi";
import { FaWhatsapp, FaLinkedin } from "react-icons/fa";

interface PerfilCandidatoProps {
  conta: any;
  detalhes: any;
}

// Helper para tratar as regras de negócio da Formação Acadêmica e evitar o "bug de 1969"
const formatarStatusFormacao = (form: any) => {
  const isBasic = form.nivel === "Ensino Fundamental" || form.nivel === "Ensino Médio";
  const statusUpper = form.status?.toUpperCase() || "";

  const isConcluido = statusUpper === "CONCLUÍDO" || statusUpper === "CONCLUIDO";
  const isCursando = statusUpper === "CURSANDO";
  const isInterrompido = statusUpper === "INTERROMPIDO";

  let statusLabel = form.status;
  if (isConcluido) statusLabel = "Concluído";
  if (isCursando) statusLabel = "Cursando";
  if (isInterrompido) statusLabel = "Incompleto / Trancado";

  // Só mostra o ano se estiver concluído, se NÃO for ensino básico, e se a data for válida (> 1970)
  let anoLabel = "";
  if (isConcluido && !isBasic && form.data_conclusao) {
    const year = new Date(form.data_conclusao).getFullYear();
    if (year > 1970) {
      anoLabel = ` em ${year}`;
    }
  }

  return `${statusLabel}${anoLabel}`;
};

export default function PerfilCandidato({ conta, detalhes }: PerfilCandidatoProps) {
  if (!detalhes)
    return (
      <div className="text-gray-500 p-8 text-center border border-dashed rounded-3xl">
        Perfil de candidato incompleto. Faltam dados no banco para este ID.
      </div>
    );

  return (
    <div className="space-y-6">

      {/* ================= LINHA 1: IDENTIFICAÇÃO E DADOS VITAIS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Bloco 1: Foto, Nome e Resumo */}
        <div className="col-span-2 bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-6 items-start">
          <div className="w-24 h-24 md:w-32 md:h-32 shrink-0 rounded-full border-4 border-gray-50 overflow-hidden shadow-sm relative bg-gray-100">
            {detalhes.foto_url ? (
              <img
                src={detalhes.foto_url}
                alt={`Foto de ${conta.nome}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <img
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(conta.nome)}&background=F3F4F6&color=4B5563`}
                alt="Avatar Gerado"
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="flex-1 space-y-3 w-full">
            <div>
              <h2 className="text-2xl font-black text-gray-900">{conta.nome}</h2>
              <p className="text-blue-600 font-bold text-sm">
                {detalhes.primeiro_emprego ? "Em busca do Primeiro Emprego" : "Profissional com Experiência"}
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
              <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">Objetivo Profissional</p>
              <p className="text-sm font-medium text-gray-700 italic">"{detalhes.objetivo_profissional || "Não informado"}"</p>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              {detalhes.link_linkedin && (
                <a href={detalhes.link_linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs font-bold hover:bg-blue-100 transition-colors">
                  <FaLinkedin size={14} /> LinkedIn
                </a>
              )}
              {detalhes.link_portfolio && (
                <a href={detalhes.link_portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">
                  <HiOutlineLink size={14} /> Portfólio
                </a>
              )}
              {detalhes.link_outro && (
                <a href={detalhes.link_outro} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-200 transition-colors">
                  <HiOutlineLink size={14} /> Outro Link
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bloco 2: Dados Pessoais de Contato */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
            Dados Pessoais
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
              <HiOutlineIdentification className="text-gray-400 shrink-0" size={18} />
              <span>CPF: <span className="font-mono">{detalhes.cpf || "Não informado"}</span></span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
              <HiOutlineMail className="text-blue-500 shrink-0" size={18} />
              <span className="truncate">{conta.email}</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
              <FaWhatsapp className="text-emerald-500 shrink-0" size={18} />
              {detalhes.whatsapp || detalhes.telefone || "Telefone não informado"}
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-700 font-medium">
              <HiOutlineClock className="text-orange-500 shrink-0" size={18} />
              <span>
                {detalhes.data_nascimento ? `${new Date().getFullYear() - new Date(detalhes.data_nascimento).getFullYear()} anos` : "Idade não informada"}
                <span className="text-gray-400 font-normal ml-1">({detalhes.genero || "Gênero não informado"})</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= LINHA 2: ENDEREÇO E PREFERÊNCIAS LOGÍSTICAS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* Endereço Completo */}
        <div className="col-span-2 bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <HiOutlineLocationMarker className="text-red-500" size={18} /> Endereço Completo
          </h3>
          {detalhes.endereco ? (
            <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm font-medium text-gray-700 bg-gray-50 p-5 rounded-2xl border border-gray-100">
              <div><span className="text-gray-400 block text-xs">Rua / Logradouro</span> {detalhes.endereco.logradouro || "-"}</div>
              <div><span className="text-gray-400 block text-xs">Número</span> {detalhes.endereco.numero || "-"}</div>
              <div><span className="text-gray-400 block text-xs">Bairro</span> {detalhes.endereco.bairro || "-"}</div>
              <div><span className="text-gray-400 block text-xs">Complemento</span> {detalhes.endereco.complemento || "-"}</div>
              <div><span className="text-gray-400 block text-xs">Cidade/UF</span> {detalhes.endereco.cidade} - {detalhes.endereco.uf}</div>
              <div><span className="text-gray-400 block text-xs">CEP</span> {detalhes.endereco.cep || "-"}</div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 italic p-4 bg-gray-50 rounded-xl">Nenhum endereço cadastrado.</p>
          )}
        </div>

        {/* Preferências Logísticas */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
            <HiOutlineMoon className="text-indigo-500" size={18} /> Logística
          </h3>
          <div className="space-y-4 text-sm font-medium text-gray-700">
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <span className="text-gray-500">Pretensão:</span>
              <span className="font-bold text-emerald-600">{detalhes.pretensao_salarial ? `R$ ${detalhes.pretensao_salarial}` : "A Combinar"}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <span className="text-gray-500">CNH:</span>
              <span>{detalhes.cnh?.join(", ") || "Não Possui"}</span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <span className="text-gray-500">Turno:</span>
              <span className="text-right max-w-[120px] truncate" title={detalhes.turno_preferido?.join(", ")}>
                {detalhes.turno_preferido?.join(", ")?.replace(/_/g, ' ') || "Qualquer"}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-gray-50 pb-2">
              <span className="text-gray-500">Sábados:</span>
              <span className={detalhes.disponibilidade_sabados ? "text-emerald-600" : "text-gray-400"}>{detalhes.disponibilidade_sabados ? "Disponível" : "Indisponível"}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-500">Viagens/Mudança:</span>
              <span>
                {detalhes.disponibilidade_viagem ? "Sim" : "Não"} / {detalhes.disponibilidade_mudanca ? "Sim" : "Não"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ================= LINHA 3: RESUMO E PCD ================= */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">Sobre o Candidato (Resumo Profissional)</h3>
        <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap bg-gray-50 p-5 rounded-2xl border border-gray-100">
          {detalhes.resumo_profissional || <span className="italic text-gray-400">Nenhum resumo profissional cadastrado.</span>}
        </p>

        {/* Inclusão e Diversidade (Apenas se for PcD) */}
        {detalhes.pcd && (
          <div className="mt-6 p-5 bg-purple-50 rounded-2xl border border-purple-100">
            <div className="flex items-center gap-2 text-purple-800 font-bold mb-2">
              Profissional com Deficiência (PcD)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
              <div>
                <span className="block text-[11px] font-bold text-purple-400 uppercase">Condição / Tipo</span>
                <p className="text-sm text-purple-900 font-medium">{detalhes.tipo_pcd || "Não especificado"}</p>
              </div>
              <div>
                <span className="block text-[11px] font-bold text-purple-400 uppercase">Necessidades Específicas</span>
                <p className="text-sm text-purple-900 font-medium">{detalhes.necessidade || "Nenhuma adaptação solicitada"}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ================= LINHA 4: TAXONOMIAS (ÁREAS E COMPETÊNCIAS) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <HiOutlineTag size={18} className="text-blue-500" /> Áreas de Interesse
          </h3>
          <div className="flex flex-wrap gap-2">
            {detalhes.areas_atuacao?.length > 0 ? (
              detalhes.areas_atuacao.map((a: any) => (
                <span key={a.id_area} className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs font-bold rounded-lg border border-blue-100">
                  {a.area?.nome || "Área não identificada"}
                </span>
              ))
            ) : (
              <span className="text-sm text-gray-400 italic">Nenhuma área selecionada.</span>
            )}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-4">
            <HiOutlineTag size={18} className="text-purple-500" /> Habilidades Técnicas
          </h3>
          <div className="flex flex-wrap gap-2">
            {detalhes.competencias?.length > 0 ? (
              detalhes.competencias.map((c: any) => {
                // Define a cor da tag baseado no nível (Básico, Intermediário, Avançado)
                const isAvancado = c.nivel === "AVANCADO";
                const isBasico = c.nivel === "BASICO";
                const colorClass = isAvancado ? "bg-emerald-50 text-emerald-700 border-emerald-200" : isBasico ? "bg-gray-50 text-gray-600 border-gray-200" : "bg-purple-50 text-purple-700 border-purple-200";

                return (
                  <span key={c.id_competencia} className={`px-3 py-1.5 text-[11px] font-bold rounded-lg border flex items-center gap-1 ${colorClass}`} title={`Nível: ${c.nivel}`}>
                    {c.competencia?.nome || "Desconhecida"}
                    <span className="opacity-50 font-normal ml-1">({c.nivel?.charAt(0)})</span>
                  </span>
                )
              })
            ) : (
              <span className="text-sm text-gray-400 italic">Nenhuma habilidade cadastrada.</span>
            )}
          </div>
        </div>
      </div>

      {/* ================= LINHA 5: EXPERIÊNCIA E FORMAÇÃO (COM CORREÇÃO DE DATAS) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EXPERIÊNCIAS */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 mb-6">
            <HiOutlineBriefcase className="text-blue-600" /> Histórico Profissional
          </h3>
          <div className="space-y-6">
            {detalhes.experiencias?.length > 0 ? (
              detalhes.experiencias.map((exp: any) => {
                const anoInicio = exp.data_inicio ? new Date(exp.data_inicio).getFullYear() : "";
                const anoFim = exp.atual ? "Atual" : (exp.data_fim ? new Date(exp.data_fim).getFullYear() : "");

                return (
                  <div key={exp.id_experiencia} className="border-l-2 border-blue-100 pl-5 relative pb-2">
                    <div className="absolute w-3.5 h-3.5 bg-blue-500 rounded-full -left-[9px] top-1.5 border-2 border-white shadow-sm"></div>
                    <h4 className="font-black text-gray-900 leading-tight">{exp.cargo}</h4>
                    <p className="text-sm text-blue-600 font-bold mb-1">{exp.empresa}</p>
                    <p className="text-xs font-medium text-gray-400 mb-2 px-2 py-0.5 bg-gray-50 rounded-md inline-block">
                      {anoInicio} {anoInicio && anoFim ? "-" : ""} {anoFim}
                    </p>
                    {exp.atividades && (
                      <p className="text-xs text-gray-600 leading-relaxed bg-gray-50/50 p-3 rounded-xl border border-gray-50 mt-1 whitespace-pre-wrap">
                        {exp.atividades}
                      </p>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500 italic text-center">Nenhuma experiência cadastrada.</p>
              </div>
            )}
          </div>
        </div>

        {/* FORMAÇÕES */}
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 mb-6">
            <HiOutlineAcademicCap className="text-purple-600" /> Acadêmico & Cursos
          </h3>
          <div className="space-y-6">
            {detalhes.formacoes?.length > 0 ? (
              detalhes.formacoes.map((form: any) => (
                <div key={form.id_formacao} className="border-l-2 border-purple-100 pl-5 relative pb-2">
                  <div className="absolute w-3.5 h-3.5 bg-purple-500 rounded-full -left-[9px] top-1.5 border-2 border-white shadow-sm"></div>
                  <h4 className="font-black text-gray-900 leading-tight">{form.curso || form.nivel}</h4>
                  {form.instituicao && <p className="text-sm text-purple-600 font-bold mb-1">{form.instituicao}</p>}

                  <div className="flex items-center gap-2 flex-wrap mt-2">
                    <span className="text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md uppercase tracking-wider">
                      {form.nivel}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${form.status?.toUpperCase() === "CONCLUÍDO" || form.status?.toUpperCase() === "CONCLUIDO"
                      ? "bg-emerald-50 text-emerald-600"
                      : form.status?.toUpperCase() === "CURSANDO"
                        ? "bg-blue-50 text-blue-600"
                        : "bg-orange-50 text-orange-600"
                      }`}>
                      {formatarStatusFormacao(form)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                <p className="text-sm text-gray-500 italic text-center">Nenhuma formação cadastrada.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= LINHA 6: CANDIDATURAS RECENTES ================= */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <h3 className="text-lg font-black text-gray-800 mb-6">
          Atividade Recente na Plataforma (Últimas Candidaturas)
        </h3>
        {detalhes.candidaturas?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-[11px] text-gray-400 uppercase tracking-widest font-black">
                <tr>
                  <th className="p-4 rounded-l-xl">Vaga</th>
                  <th className="p-4">Empresa</th>
                  <th className="p-4 rounded-r-xl">Data da Inscrição</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {detalhes.candidaturas.map((cand: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 font-bold text-gray-800">{cand.vaga.titulo}</td>
                    <td className="p-4 font-medium text-gray-600">{cand.vaga.empresa.nome_fantasia}</td>
                    <td className="p-4 text-gray-500 font-medium">
                      {new Date(cand.data_candidatura).toLocaleDateString("pt-BR", {
                        day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            O candidato ainda não se aplicou a nenhuma vaga.
          </p>
        )}
      </div>
    </div>
  );
}