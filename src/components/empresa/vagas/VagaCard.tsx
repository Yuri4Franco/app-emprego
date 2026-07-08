import { useRouter } from "next/navigation";
import {
  HiOutlinePencilAlt,
  HiOutlineClock,
  HiOutlineX,
  HiOutlineCheckCircle,
  HiOutlinePause,
  HiOutlineTrash,
  HiOutlineExclamation,
  HiOutlineOfficeBuilding,
  HiOutlineLocationMarker,
  HiOutlineUsers,
  HiOutlineDotsVertical,
  HiOutlineDuplicate,
  HiOutlineChevronRight,
  HiOutlineStop,
  HiOutlinePlay,
  HiOutlineDocumentReport
} from "react-icons/hi";

const STATUS_MAP: Record<string, any> = {
  RASCUNHO: { label: "Rascunho", color: "bg-gray-100 text-gray-600 border-gray-200", icon: <HiOutlinePencilAlt /> },
  EM_ANALISE: { label: "Em Análise", color: "bg-amber-50 text-amber-600 border-amber-200", icon: <HiOutlineClock /> },
  REPROVADA: { label: "Reprovada", color: "bg-red-50 text-red-600 border-red-200", icon: <HiOutlineX /> },
  ATIVA: { label: "Aceitando Candidaturas", color: "bg-emerald-50 text-emerald-600 border-emerald-200", icon: <HiOutlineCheckCircle /> },
  PAUSADA: { label: "Em Triagem", color: "bg-blue-50 text-primary border-blue-200", icon: <HiOutlinePause /> },
  ENCERRADA: { label: "Encerrada", color: "bg-gray-200 text-gray-500 border-gray-300", icon: <HiOutlineTrash /> },
  AGUARDANDO_PAGAMENTO: { label: "Aguardando Pagamento", color: "bg-purple-50 text-purple-600 border-purple-200", icon: <HiOutlineExclamation /> },
};

interface VagaCardProps {
  vaga: any;
  menuAberto: number | null;
  setMenuAberto: (id: number | null) => void;
  isDuplicating: boolean;
  onDuplicar: (id: number) => void;
  onAcaoConfirma: (id: number, titulo: string, tipo: "PAUSAR" | "ENCERRAR" | "EXCLUIR_RASCUNHO" | "REABRIR") => void;
}

export function VagaCard({ vaga, menuAberto, setMenuAberto, isDuplicating, onDuplicar, onAcaoConfirma }: VagaCardProps) {
  const router = useRouter();

  // Condicionais de estado
  const isAtivaOuPausada = vaga.status === "ATIVA" || vaga.status === "PAUSADA";
  const isRascunho = vaga.status === "RASCUNHO";
  const isReprovada = vaga.status === "REPROVADA";
  const isEncerrada = vaga.status === "ENCERRADA";
  const isAguardando = vaga.status === "EM_ANALISE" || vaga.status === "AGUARDANDO_PAGAMENTO";

  // Lógica de Roteamento Inteligente
  const handleCardClick = () => {
    if (isRascunho || isReprovada) router.push(`/empresa/vagas/${vaga.id_vaga}/editar`);
    else if (isEncerrada) router.push(`/empresa/vagas/${vaga.id_vaga}/historico`);
    else if (isAtivaOuPausada) router.push(`/empresa/vagas/${vaga.id_vaga}/gestao`);
  };

  // Lógica de Datas Inteligente
  let textoData = "";
  let dataExibicao = "";

  if (isEncerrada && vaga.data_encerramento) {
    textoData = "Encerrada em";
    dataExibicao = vaga.data_encerramento;
  } else if (isAtivaOuPausada && vaga.data_publicacao) {
    textoData = "Publicada em";
    dataExibicao = vaga.data_publicacao;
  } else if (vaga.data_atualizacao && !isRascunho) {
    textoData = "Atualizada em";
    dataExibicao = vaga.data_atualizacao;
  } else {
    textoData = "Criada em";
    dataExibicao = vaga.criada_em || vaga.createdAt;
  }

  const dataFormatada = dataExibicao
    ? new Date(dataExibicao).toLocaleDateString("pt-BR")
    : "Data indisponível";

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white p-5 md:p-6 rounded-[32px] border shadow-sm hover:shadow-xl transition-all group cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-6 relative ${menuAberto === vaga.id_vaga ? "border-blue-200 z-50" : "border-gray-100 z-10 hover:border-blue-200"
        }`}
    >
      <div className="absolute inset-0 rounded-[32px] overflow-hidden pointer-events-none">
        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center gap-5 md:gap-6 w-full">

        {/* ================= INFORMAÇÕES DA VAGA ================= */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3 mb-1">
            <div className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border flex items-center gap-1.5 w-fit ${STATUS_MAP[vaga.status]?.color || STATUS_MAP.RASCUNHO.color}`}>
              {STATUS_MAP[vaga.status]?.icon}
              {STATUS_MAP[vaga.status]?.label}
            </div>
          </div>

          <h3 className="text-lg md:text-xl font-black text-gray-800 group-hover:text-primary transition-colors pr-8">
            {vaga.titulo || "Vaga sem título"}
          </h3>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-bold text-gray-400 uppercase tracking-widest">
            {vaga.area_profissional && (
              <span className="flex items-center gap-1.5 text-gray-500">
                <HiOutlineOfficeBuilding size={14} /> {vaga.area_profissional}
              </span>
            )}
            <span className="flex items-center gap-1.5 text-gray-500">
              <HiOutlineLocationMarker size={14} /> {vaga.endereco?.cidade || "Local não definido"} - {vaga.endereco?.uf || ""}
            </span>
            <span className="flex items-center gap-1.5 text-gray-400">
              <HiOutlineClock size={14} />
              {textoData} {dataFormatada}
            </span>
          </div>

          {/* MOTIVO DA REPROVAÇÃO */}
          {isReprovada && vaga.observacoes_admin && (
            <div className="mt-3 p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-700 font-medium">
              <strong className="block text-red-800 mb-1">Motivo da Reprovação:</strong>
              {vaga.observacoes_admin}
            </div>
          )}
        </div>

        {/* ================= MÉTRICAS E AÇÕES ================= */}
        <div className="flex items-center justify-between md:justify-end gap-4 md:gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-gray-100">

          {/* Mostra Candidatos APENAS se estiver Ativa ou Pausada */}
          {isAtivaOuPausada && (
            <div className="text-center px-4 md:px-6 md:border-r border-gray-100">
              <p className="text-2xl font-black text-primary leading-none">{vaga._count?.candidaturas || 0}</p>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1.5">Candidatos</p>
            </div>
          )}

          <div className="flex items-center gap-2 relative z-10">
            {/* BOTÕES PRINCIPAIS */}
            {isEncerrada ? (
              <button onClick={(e) => { e.stopPropagation(); router.push(`/empresa/vagas/${vaga.id_vaga}/historico`); }} className="flex items-center gap-2 px-4 py-3 bg-gray-50 text-gray-600 rounded-[16px] hover:bg-gray-100 transition-all shadow-sm font-bold text-sm">
                <HiOutlineDocumentReport size={18} /> <span className="hidden sm:block">Ver Histórico</span>
              </button>
            ) : isRascunho || isReprovada ? (
              <button onClick={(e) => { e.stopPropagation(); router.push(`/empresa/vagas/${vaga.id_vaga}/editar`); }} className="flex items-center gap-2 px-4 py-3 bg-blue-50 text-blue-700 rounded-[16px] hover:bg-primary hover:text-white transition-all shadow-sm font-bold text-sm">
                <HiOutlinePencilAlt size={18} /> <span className="hidden sm:block">Editar</span>
              </button>
            ) : isAguardando ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 text-gray-500 rounded-[16px] font-bold text-sm border border-gray-200">
                <HiOutlineClock size={18} /> <span className="hidden sm:block">Em Processamento</span>
              </div>
            ) : (
              <button onClick={(e) => { e.stopPropagation(); router.push(`/empresa/vagas/${vaga.id_vaga}/gestao`); }} className="flex items-center gap-2 px-4 py-3 bg-emerald-50 text-emerald-700 rounded-[16px] hover:bg-emerald-500 hover:text-white transition-all shadow-sm font-bold text-sm">
                <HiOutlineUsers size={18} /> <span className="hidden sm:block">Gestão</span>
              </button>
            )}

            {/* DROPDOWN DE AÇÕES */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuAberto(menuAberto === vaga.id_vaga ? null : vaga.id_vaga);
                }}
                className="p-3 text-gray-400 hover:text-primary bg-gray-50 hover:bg-blue-50 rounded-[16px] transition-all"
              >
                {isDuplicating ? <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div> : <HiOutlineDotsVertical size={20} />}
              </button>

              {menuAberto === vaga.id_vaga && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-100 shadow-xl rounded-2xl overflow-hidden z-50 animate-in fade-in zoom-in-95">

                  {/* VER HISTÓRICO (Apenas Encerrada) */}
                  {isEncerrada && (
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/empresa/vagas/${vaga.id_vaga}/historico`); }} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-50">
                      <HiOutlineDocumentReport size={18} /> Histórico da Vaga
                    </button>
                  )}

                  {/* EDITAR (Ativa, Pausada, Em Análise, etc - Exceto Encerrada) */}
                  {!isEncerrada && (
                    <button onClick={(e) => { e.stopPropagation(); router.push(`/empresa/vagas/${vaga.id_vaga}/editar`); }} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-gray-50">
                      <HiOutlinePencilAlt size={18} /> Editar Vaga
                    </button>
                  )}

                  {/* DUPLICAR (Sempre disponível) */}
                  <button onClick={(e) => { e.stopPropagation(); onDuplicar(vaga.id_vaga); }} className={`w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-gray-600 hover:bg-blue-50 hover:text-blue-700 transition-colors ${isAtivaOuPausada || isRascunho ? "border-b border-gray-50" : ""}`}>
                    <HiOutlineDuplicate size={18} /> Duplicar Vaga
                  </button>

                  {/* PAUSAR (Apenas Ativas) */}
                  {vaga.status === "ATIVA" && (
                    <button onClick={(e) => { e.stopPropagation(); onAcaoConfirma(vaga.id_vaga, vaga.titulo, "PAUSAR"); }} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-amber-600 hover:bg-amber-50 transition-colors border-b border-gray-50">
                      <HiOutlinePause size={18} /> Pausar Candidaturas
                    </button>
                  )}

                  {/* REABRIR (Apenas Pausadas) */}
                  {vaga.status === "PAUSADA" && (
                    <button onClick={(e) => { e.stopPropagation(); onAcaoConfirma(vaga.id_vaga, vaga.titulo, "REABRIR"); }} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors border-b border-gray-50">
                      <HiOutlinePlay size={18} /> Reativar Candidaturas
                    </button>
                  )}

                  {/* ENCERRAR (Ativas e Pausadas) */}
                  {isAtivaOuPausada && (
                    <button onClick={(e) => { e.stopPropagation(); onAcaoConfirma(vaga.id_vaga, vaga.titulo, "ENCERRAR"); }} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                      <HiOutlineStop size={18} /> Encerrar Vaga
                    </button>
                  )}

                  {/* EXCLUIR RASCUNHO (Apenas Rascunho) */}
                  {isRascunho && (
                    <button onClick={(e) => { e.stopPropagation(); onAcaoConfirma(vaga.id_vaga, vaga.titulo, "EXCLUIR_RASCUNHO"); }} className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors">
                      <HiOutlineTrash size={18} /> Excluir Rascunho
                    </button>
                  )}

                </div>
              )}
            </div>

            <div className="hidden md:flex ml-2 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all">
              <HiOutlineChevronRight size={24} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}