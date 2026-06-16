import { HiOutlineExclamation, HiOutlineX } from "react-icons/hi";

interface ModalConfirmacaoProps {
  isOpen: boolean;
  tipo: "PAUSAR" | "ENCERRAR" | "EXCLUIR_RASCUNHO" | null;
  tituloVaga: string;
  isProcessing: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function ModalConfirmacaoAcao({
  isOpen,
  tipo,
  tituloVaga,
  isProcessing,
  onClose,
  onConfirm,
}: ModalConfirmacaoProps) {
  if (!isOpen || !tipo) return null;

  const config = {
    PAUSAR: {
      titulo: "Pausar Vaga",
      aviso:
        "A vaga será removida temporariamente da vitrine pública. Nenhum novo candidato poderá se inscrever até que você a reative.",
      btnText: "Sim, Pausar Vaga",
      color: "bg-amber-500 hover:bg-amber-600 shadow-amber-500/30",
      iconColor: "text-amber-500 bg-amber-50",
    },
    ENCERRAR: {
      titulo: "Encerrar Vaga Definitivamente",
      aviso:
        "Atenção: Essa ação é irreversível. A vaga será fechada, os candidatos serão notificados (se configurado) e ela não poderá ser reaberta.",
      btnText: "Encerrar Vaga",
      color: "bg-red-600 hover:bg-red-700 shadow-red-600/30",
      iconColor: "text-red-600 bg-red-50",
    },
    EXCLUIR_RASCUNHO: {
      titulo: "Excluir Rascunho",
      aviso:
        "Você está prestes a excluir este rascunho. Todos os dados preenchidos até agora serão perdidos para sempre.",
      btnText: "Excluir Rascunho",
      color: "bg-red-600 hover:bg-red-700 shadow-red-600/30",
      iconColor: "text-red-600 bg-red-50",
    },
  }[tipo];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-gray-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-[32px] w-full max-w-md p-6 md:p-8 shadow-2xl relative animate-in zoom-in-95">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-gray-400 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors"
        >
          <HiOutlineX size={20} />
        </button>

        <div
          className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${config.iconColor}`}
        >
          <HiOutlineExclamation size={32} />
        </div>

        <h3 className="text-2xl font-black text-gray-900 mb-2">
          {config.titulo}
        </h3>
        <p className="text-sm font-bold text-gray-800 mb-2">
          Vaga: <span className="text-gray-500 font-medium">{tituloVaga}</span>
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mb-8">
          {config.aviso}
        </p>

        <div className="flex flex-col-reverse sm:flex-row gap-3">
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="w-full px-6 py-3.5 rounded-2xl font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isProcessing}
            className={`w-full px-6 py-3.5 rounded-2xl font-black text-white transition-all shadow-lg flex items-center justify-center ${config.color} disabled:opacity-70`}
          >
            {isProcessing ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              config.btnText
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
