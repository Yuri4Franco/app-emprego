import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineBriefcase,
  HiOutlineAcademicCap,
} from "react-icons/hi";

interface PerfilCandidatoProps {
  conta: any;
  detalhes: any;
}

export default function PerfilCandidato({
  conta,
  detalhes,
}: PerfilCandidatoProps) {
  if (!detalhes)
    return (
      <div className="text-gray-500 p-8 text-center border border-dashed rounded-3xl">
        Perfil de candidato incompleto.
      </div>
    );

  return (
    <div className="space-y-6">
      {/* LINHA 1: Informações de Contato e Resumo da Conta */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
            Contato e Endereço
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-700 font-medium">
              <HiOutlineMail className="text-blue-500" size={20} />{" "}
              {conta.email}
            </div>
            <div className="flex items-center gap-3 text-gray-700 font-medium">
              <HiOutlinePhone className="text-blue-500" size={20} />{" "}
              {detalhes.telefone || "Não informado"}
            </div>
            {detalhes.endereco && (
              <div className="flex items-center gap-3 text-gray-700 font-medium">
                <HiOutlineLocationMarker className="text-blue-500" size={20} />
                {detalhes.endereco.cidade} - {detalhes.endereco.uf} (
                {detalhes.endereco.bairro})
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900 text-white p-6 rounded-[32px] shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
            Resumo da Conta
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Criado em:</span>
              <span className="font-bold">
                {new Date(conta.criado_em).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Último Login:</span>
              <span className="font-bold">
                {conta.ultimo_login
                  ? new Date(conta.ultimo_login).toLocaleDateString("pt-BR")
                  : "Nunca"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Candidaturas:</span>
              <span className="font-bold text-emerald-400">
                {detalhes.candidaturas?.length || 0} recentes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LINHA 2: Currículo (Experiência e Formação) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 mb-6">
            <HiOutlineBriefcase className="text-blue-600" /> Experiências
            Profissionais
          </h3>
          <div className="space-y-6">
            {detalhes.experiencias?.length > 0 ? (
              detalhes.experiencias.map((exp: any) => (
                <div
                  key={exp.id_experiencia}
                  className="border-l-2 border-blue-100 pl-4 relative"
                >
                  <div className="absolute w-3 h-3 bg-blue-500 rounded-full -left-[7px] top-1.5 border-2 border-white"></div>
                  <h4 className="font-bold text-gray-900">{exp.cargo}</h4>
                  <p className="text-sm text-blue-600 font-medium">
                    {exp.empresa}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(exp.data_inicio).getFullYear()} -{" "}
                    {exp.atual ? "Atual" : new Date(exp.data_fim).getFullYear()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">
                Nenhuma experiência cadastrada.
              </p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 mb-6">
            <HiOutlineAcademicCap className="text-purple-600" /> Formação
            Acadêmica
          </h3>
          <div className="space-y-6">
            {detalhes.formacoes?.length > 0 ? (
              detalhes.formacoes.map((form: any) => (
                <div
                  key={form.id_formacao}
                  className="border-l-2 border-purple-100 pl-4 relative"
                >
                  <div className="absolute w-3 h-3 bg-purple-500 rounded-full -left-[7px] top-1.5 border-2 border-white"></div>
                  <h4 className="font-bold text-gray-900">{form.curso}</h4>
                  <p className="text-sm text-purple-600 font-medium">
                    {form.instituicao}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {form.nivel} • Conclusão em{" "}
                    {new Date(form.data_conclusao).getFullYear()}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 italic">
                Nenhuma formação cadastrada.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* LINHA 3: Últimas Candidaturas */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <h3 className="text-lg font-black text-gray-800 mb-6">
          Atividade Recente (Últimas Candidaturas)
        </h3>
        {detalhes.candidaturas?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-3 rounded-l-xl">Vaga</th>
                  <th className="p-3">Empresa</th>
                  <th className="p-3 rounded-r-xl">Data da Inscrição</th>
                </tr>
              </thead>
              <tbody>
                {detalhes.candidaturas.map((cand: any, idx: number) => (
                  <tr
                    key={idx}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="p-3 font-bold text-gray-800">
                      {cand.vaga.titulo}
                    </td>
                    <td className="p-3 text-gray-600">
                      {cand.vaga.empresa.nome_fantasia}
                    </td>
                    <td className="p-3 text-gray-500">
                      {new Date(cand.data_candidatura).toLocaleDateString(
                        "pt-BR",
                      )}
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
