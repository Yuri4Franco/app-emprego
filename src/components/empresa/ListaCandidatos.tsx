"use client";

import { useState, useEffect } from "react";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
  HiOutlineUser,
  HiOutlineCalendar,
  HiOutlineExclamationCircle,
  HiOutlineXCircle,
  HiOutlineClipboardList,
} from "react-icons/hi";

interface Candidato {
  id_candidatura: number;
  nome: string;
  id_usuario: number;
  fora_do_perfil: boolean;
  data_inscricao: string;
  possui_agendamento: boolean;
  data_entrevista: string | null;
}

interface Coluna {
  id_etapa: number;
  nome_etapa: string;
  candidatos: Candidato[];
}

interface ListaCandidatosProps {
  colunasIniciais: Coluna[];
  onAtualizar: () => void;
  onAbrirCandidato: (id: number) => void;
}

export function ListaCandidatos({
  colunasIniciais,
  onAtualizar,
  onAbrirCandidato,
}: ListaCandidatosProps) {
  const [etapaAtivaId, setEtapaAtivaId] = useState<number | null>(null);

  useEffect(() => {
    if (colunasIniciais.length > 0 && !etapaAtivaId) {
      setEtapaAtivaId(colunasIniciais[0].id_etapa);
    }
  }, [colunasIniciais, etapaAtivaId]);

  // 2. Encontra os dados da coluna selecionada
  const colunaAtual = colunasIniciais.find(
    (col) => col.id_etapa === etapaAtivaId,
  );
  const candidatosDaEtapa = colunaAtual?.candidatos || [];

  // Estados para Ações em Massa
  const [selecionados, setSelecionados] = useState<number[]>([]);
  const [isReprovando, setIsReprovando] = useState(false);
  const [motivoLote, setMotivoLote] = useState("");
  const [modalLoteAberto, setModalLoteAberto] = useState(false);

  // Controle de Seleção
  const toggleSelectAll = () => {
    if (selecionados.length === candidatosDaEtapa.length) {
      setSelecionados([]);
    } else {
      setSelecionados(candidatosDaEtapa.map((c) => c.id_candidatura));
    }
  };

  const toggleSelectOne = (id: number) => {
    if (selecionados.includes(id)) {
      setSelecionados(selecionados.filter((item) => item !== id));
    } else {
      setSelecionados([...selecionados, id]);
    }
  };

  const confirmarReprovacaoEmLote = async () => {
    if (selecionados.length === 0) return;
    setIsReprovando(true);
    try {
      await api.post(`/empresa/candidaturas/reprovar-lote`, {
        id_candidaturas: selecionados,
        motivo:
          motivoLote.trim() || "Candidato não atende aos requisitos da etapa.",
      });
      toast.success(`${selecionados.length} candidato(s) reprovado(s).`);
      setModalLoteAberto(false);
      setSelecionados([]);
      onAtualizar();
    } catch (error) {
      toast.error("Erro ao processar reprovação.");
    } finally {
      setIsReprovando(false);
    }
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* 3. NAVEGAÇÃO DE SUB-ABAS (ETAPAS) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {colunasIniciais.map((coluna) => (
          <button
            key={coluna.id_etapa}
            onClick={() => {
              setEtapaAtivaId(coluna.id_etapa);
              setSelecionados([]); // Limpa seleção ao mudar de etapa
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border-2 shrink-0
              ${
                etapaAtivaId === coluna.id_etapa
                  ? "bg-white border-primary text-primary shadow-sm"
                  : "bg-gray-100 border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-200"
              }
            `}
          >
            {coluna.nome_etapa}
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] ${
                etapaAtivaId === coluna.id_etapa
                  ? "bg-primary text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {coluna.candidatos.length}
            </span>
          </button>
        ))}
      </div>

      {/* ÁREA DA TABELA */}
      <div className="w-full bg-white rounded-[32px] shadow-sm border border-gray-100 flex flex-col flex-1 overflow-hidden relative">
        {/* BARRA DE AÇÕES EM MASSA (Contextualizada para a etapa) */}
        {selecionados.length > 0 && (
          <div className="absolute top-0 left-0 right-0 bg-gray-900 text-white p-4 flex items-center justify-between z-10 animate-in slide-in-from-top-4">
            <span className="text-sm font-bold">
              {selecionados.length} selecionado(s) na etapa{" "}
              {colunaAtual?.nome_etapa}
            </span>
            <div className="flex gap-3">
              <button
                onClick={() => setModalLoteAberto(true)}
                className="flex items-center gap-2 bg-red-500 hover:bg-red-600 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tighter transition-colors"
              >
                <HiOutlineXCircle size={18} /> Reprovar Lote
              </button>
            </div>
          </div>
        )}

        {/* LISTAGEM */}
        <div className="overflow-auto flex-1">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100 text-[10px] uppercase tracking-[0.2em] text-gray-400 font-black sticky top-0 z-0">
                <th className="p-5 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      candidatosDaEtapa.length > 0 &&
                      selecionados.length === candidatosDaEtapa.length
                    }
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                  />
                </th>
                <th className="p-5">Candidato</th>
                <th className="p-5">Inscrição</th>
                <th className="p-5 text-center">Perfil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {candidatosDaEtapa.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-20 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-300">
                      <HiOutlineClipboardList size={48} />
                      <p className="font-bold">Nenhum candidato nesta etapa</p>
                    </div>
                  </td>
                </tr>
              ) : (
                candidatosDaEtapa.map((candidato) => (
                  <tr
                    key={candidato.id_candidatura}
                    className={`hover:bg-blue-50/20 transition-colors group ${selecionados.includes(candidato.id_candidatura) ? "bg-blue-50/40" : ""}`}
                  >
                    <td className="p-5 text-center">
                      <input
                        type="checkbox"
                        checked={selecionados.includes(
                          candidato.id_candidatura,
                        )}
                        onChange={() =>
                          toggleSelectOne(candidato.id_candidatura)
                        }
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer"
                      />
                    </td>
                    <td
                      className="p-5 cursor-pointer"
                      onClick={() => onAbrirCandidato(candidato.id_candidatura)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-primary rounded-full flex items-center justify-center font-bold">
                          {candidato.nome.charAt(0)}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-gray-800 text-sm group-hover:text-primary transition-colors cursor-pointer">
                            {candidato.nome}
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium">
                            #{candidato.id_candidatura}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-5 text-xs text-gray-500 font-medium">
                      {new Date(candidato.data_inscricao).toLocaleDateString(
                        "pt-BR",
                      )}
                    </td>
                    <td className="p-5">
                      <div className="flex items-center justify-center gap-3">
                        {candidato.fora_do_perfil && (
                          <HiOutlineExclamationCircle
                            size={18}
                            className="text-red-400"
                            title="Fora do Perfil"
                          />
                        )}
                        {candidato.possui_agendamento ? (
                          <HiOutlineCalendar
                            size={18}
                            className="text-purple-400"
                            title="Entrevista Agendada"
                          />
                        ) : (
                          <HiOutlineUser size={18} className="text-gray-200" />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL DE REPROVAÇÃO (Mesma lógica) */}
      {modalLoteAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-[32px] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black text-gray-800 mb-2">
              Reprovar em Lote
            </h3>
            <p className="text-sm text-gray-500 font-medium mb-6 leading-relaxed">
              Você está reprovando <b>{selecionados.length}</b> candidatos da
              etapa <b>{colunaAtual?.nome_etapa}</b>. Eles serão movidos para o
              status de reprovados.
            </p>

            <textarea
              value={motivoLote}
              onChange={(e) => setMotivoLote(e.target.value)}
              placeholder="Digite o feedback para os candidatos..."
              className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl h-32 outline-none text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none transition-all mb-8"
            />

            <div className="flex gap-4">
              <button
                onClick={() => setModalLoteAberto(false)}
                className="flex-1 py-3 font-bold text-gray-500"
              >
                Cancelar
              </button>
              <button
                onClick={confirmarReprovacaoEmLote}
                disabled={isReprovando}
                className="flex-1 py-3 font-bold text-white bg-red-500 rounded-2xl shadow-lg shadow-red-500/30 disabled:opacity-50"
              >
                {isReprovando ? "Processando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
