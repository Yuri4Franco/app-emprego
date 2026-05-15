"use client"; // O Error boundary PRECISA ser um Client Component no Next.js

import { useEffect } from "react";
import Link from "next/link";
import { HiOutlineExclamationTriangle, HiArrowPath , HiOutlineHome } from "react-icons/hi2";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Aqui você pode integrar com sistemas como Sentry, Datadog ou LogRocket
        console.error("Erro capturado pelo Error Boundary:", error);
    }, [error]);

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 animate-in fade-in duration-700">
            <div className="max-w-md w-full text-center space-y-8 relative">

                {/* Efeito de luz de fundo em vermelho/laranja */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-red-500/10 rounded-full blur-3xl -z-10"></div>

                <div className="flex justify-center">
                    <div className="w-24 h-24 bg-white border border-gray-100 shadow-xl rounded-[28px] flex items-center justify-center text-red-500 animate-bounce">
                        <HiOutlineExclamationTriangle size={48} />
                    </div>
                </div>

                <div className="space-y-3">
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                        Ops! Algo deu errado.
                    </h1>
                    <p className="text-gray-500 font-medium leading-relaxed">
                        Tivemos um problema técnico inesperado ao tentar carregar esta tela. Nossa equipe técnica já foi alertada sobre isso.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <button
                        // O reset() tenta renderizar a página novamente. Perfeito se foi só uma falha rápida de rede.
                        onClick={() => reset()}
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-gray-900 text-white rounded-full text-xs font-black uppercase tracking-widest shadow-lg hover:bg-black hover:-translate-y-0.5 transition-all"
                    >
                        <HiArrowPath  size={18} /> Tentar Novamente
                    </button>

                    <Link
                        href="/"
                        className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-white border border-gray-200 text-gray-700 rounded-full text-xs font-black uppercase tracking-widest hover:border-gray-300 hover:bg-gray-50 transition-all"
                    >
                        <HiOutlineHome size={18} /> Ir para o Início
                    </Link>
                </div>

                {/* Mostra um pequeno hint técnico no ambiente de dev, útil para debugar */}
                {process.env.NODE_ENV === "development" && (
                    <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-xl text-left overflow-auto max-h-32">
                        <p className="text-[10px] font-black text-red-800 uppercase mb-1">Stack de Erro (Apenas em Dev):</p>
                        <code className="text-xs text-red-600 font-mono">
                            {error.message}
                        </code>
                    </div>
                )}
            </div>
        </div>
    );
}