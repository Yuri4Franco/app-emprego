"use client";

import { useRouter } from "next/navigation";
import { HiOutlineArrowLeft, HiBookmark, HiOutlineBookmark, HiOutlinePrinter, HiOutlineLockClosed } from "react-icons/hi";

interface BarraAcoesProps {
    acessoLiberado: boolean;
    isFavorito: boolean;
    isFavoriting: boolean;
    onToggleFavorito: () => void;
    onPrint: () => void;
}

export function BarraAcoes({
    acessoLiberado,
    isFavorito,
    isFavoriting,
    onToggleFavorito,
    onPrint,
}: BarraAcoesProps) {
    const router = useRouter();

    return (
        <div className="sticky top-4 md:top-8 z-50 flex flex-col-reverse sm:flex-row items-center justify-between gap-3 mb-8 print:hidden bg-white/80 backdrop-blur-md p-3 md:p-4 rounded-3xl md:rounded-full border border-gray-200/80 shadow-lg shadow-gray-200/40">

            {/* Voltar */}
            <button
                onClick={() => router.back()}
                className="group w-full sm:w-auto flex items-center justify-center gap-2 text-gray-500 hover:text-blue-600 font-bold transition-all bg-white sm:bg-transparent px-6 py-3.5 sm:py-3 rounded-full border border-gray-200 sm:border-transparent hover:bg-white hover:border-blue-100 hover:shadow-sm"
            >
                <HiOutlineArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                Voltar <span className="hidden sm:inline">para Vitrine</span>
            </button>

            {/* Controles da Empresa */}
            <div className="flex w-full sm:w-auto gap-2">
                {/* Botão Favoritar */}
                <button
                    onClick={onToggleFavorito}
                    disabled={isFavoriting}
                    className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3.5 sm:py-3 rounded-full font-bold transition-all border disabled:opacity-70 ${isFavorito
                            ? "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"
                            : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50 shadow-sm"
                        }`}
                >
                    {isFavorito ? <HiBookmark size={18} /> : <HiOutlineBookmark size={18} />}
                    {isFavorito ? "Salvo" : "Salvar"}
                </button>

                {/* Botão de Imprimir (Só se liberado) ou Bloqueado */}
                {acessoLiberado ? (
                    <button
                        onClick={onPrint}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3.5 sm:py-3 rounded-full font-bold hover:bg-blue-700 transition-all shadow-md hover:shadow-xl hover:shadow-blue-600/20 active:translate-y-0"
                    >
                        <HiOutlinePrinter size={20} />
                        Imprimir <span className="hidden sm:inline">PDF</span>
                    </button>
                ) : (
                    <button
                        disabled
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gray-100 text-gray-400 px-6 py-3.5 sm:py-3 rounded-full font-bold border border-gray-200 cursor-not-allowed"
                    >
                        <HiOutlineLockClosed size={20} />
                        Impressão Bloqueada
                    </button>
                )}
            </div>
        </div>
    );
}