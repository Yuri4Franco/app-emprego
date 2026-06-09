import {
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineLocationMarker,
  HiOutlineIdentification,
  HiOutlineCollection,
} from "react-icons/hi";

interface PerfilEmpresaProps {
  conta: any;
  detalhes: any;
}

export default function PerfilEmpresa({ conta, detalhes }: PerfilEmpresaProps) {
  if (!detalhes)
    return (
      <div className="text-gray-500 p-8 text-center border border-dashed rounded-3xl">
        Perfil de empresa incompleto.
      </div>
    );

  return (
    <div className="space-y-6">
      {/* LINHA 1: Info Corporativa */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2 bg-white p-6 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-center">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
            Dados Corporativos
          </h3>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-gray-900 font-bold text-lg">
              {detalhes.nome_fantasia}
            </div>
            <div className="flex items-center gap-3 text-gray-700 font-medium">
              <HiOutlineIdentification className="text-purple-500" size={20} />{" "}
              CNPJ: {detalhes.cnpj}
            </div>
            <div className="flex items-center gap-3 text-gray-700 font-medium">
              <HiOutlineMail className="text-purple-500" size={20} />{" "}
              {conta.email}
            </div>
            {detalhes.endereco && (
              <div className="flex items-center gap-3 text-gray-700 font-medium">
                <HiOutlineLocationMarker
                  className="text-purple-500"
                  size={20}
                />
                {detalhes.endereco.cidade} - {detalhes.endereco.uf} (
                {detalhes.endereco.bairro})
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-900 text-white p-6 rounded-[32px] shadow-sm flex flex-col justify-between">
          <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest mb-4">
            Métricas da Empresa
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Plataforma:</span>
              <span className="font-bold">
                {new Date(conta.criado_em).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-700 pb-2">
              <span className="text-gray-400">Último Acesso:</span>
              <span className="font-bold">
                {conta.ultimo_login
                  ? new Date(conta.ultimo_login).toLocaleDateString("pt-BR")
                  : "Nunca"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Vagas:</span>
              <span className="font-bold text-purple-400">
                {detalhes.vagas?.length || 0} publicadas
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* LINHA 2: Vagas Recentes */}
      <div className="bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
        <h3 className="text-lg font-black text-gray-800 flex items-center gap-2 mb-6">
          <HiOutlineCollection className="text-purple-600" /> Últimas Vagas
          Publicadas
        </h3>
        {detalhes.vagas?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="p-3 rounded-l-xl">Título da Vaga</th>
                  <th className="p-3">Data de Criação</th>
                  <th className="p-3 rounded-r-xl">Status Atual</th>
                </tr>
              </thead>
              <tbody>
                {detalhes.vagas.map((vaga: any) => (
                  <tr
                    key={vaga.id_vaga}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <td className="p-3 font-bold text-gray-800">
                      {vaga.titulo}
                    </td>
                    <td className="p-3 text-gray-600">
                      {new Date(vaga.data_publicacao).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-1 rounded-md text-[10px] font-black tracking-widest ${
                          vaga.status === "ATIVA"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {vaga.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 italic">
            Nenhuma vaga registrada recentemente por esta empresa.
          </p>
        )}
      </div>
    </div>
  );
}
