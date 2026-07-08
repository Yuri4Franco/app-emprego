import { HiOutlineSearch } from "react-icons/hi";

interface VagasFiltrosProps {
  filtroStatus: string;
  setFiltroStatus: (s: string) => void;
  busca: string;
  setBusca: (s: string) => void;
}

export function VagasFiltros({
  filtroStatus,
  setFiltroStatus,
  busca,
  setBusca,
}: VagasFiltrosProps) {
  const tabs = [
    { id: "", label: "Todas" },
    { id: "ATIVA", label: "Ativas" },
    { id: "PAUSADA", label: "Em Triagem" },
    { id: "RASCUNHO", label: "Rascunhos" },
    { id: "EM_ANALISE", label: "Em Análise" },
    { id: "AGUARDANDO_PAGAMENTO", label: "Pagamento" },
    { id: "ENCERRADA", label: "Encerradas" },
  ];

  return (
    <section className="bg-white p-4 md:p-6 rounded-[32px] border border-gray-100 shadow-sm space-y-6">
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFiltroStatus(tab.id)}
            className={`px-5 py-2.5 rounded-full text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
              filtroStatus === tab.id
                ? "bg-primary text-white shadow-md"
                : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700 border border-gray-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="relative group">
        <HiOutlineSearch
          className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
          size={22}
        />
        <input
          type="text"
          placeholder="Buscar vaga por título..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="w-full pl-14 pr-6 py-4 bg-gray-50 border border-gray-200 rounded-[24px] focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 outline-none transition-all text-sm font-medium text-gray-700"
        />
      </div>
    </section>
  );
}
