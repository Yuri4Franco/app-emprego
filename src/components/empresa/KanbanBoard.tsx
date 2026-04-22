"use client";

import { useState, useEffect } from "react";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import api from "@/src/services/api";
import toast from "react-hot-toast";
import {
  HiOutlineCalendar,
  HiOutlineExclamationCircle,
  HiOutlineUser,
  HiStar,
  HiOutlineEye,
  HiOutlineEyeOff,
  HiOutlineFilter
} from "react-icons/hi";
import { FaWhatsapp } from "react-icons/fa";

interface Candidato {
  id_candidatura: number;
  nome: string;
  id_usuario: number;
  fora_do_perfil: boolean;
  data_inscricao: string;
  possui_agendamento: boolean;
  data_entrevista: string | null;
  avaliacao_nota?: number | null;
  whatsapp?: string | null;
}

interface Coluna {
  id_etapa: number;
  nome_etapa: string;
  candidatos: Candidato[];
}

interface KanbanBoardProps {
  colunasIniciais: Coluna[];
  onAtualizar: () => void;
  onAbrirCandidato: (id: number) => void;
}

export function KanbanBoard({
  colunasIniciais,
  onAtualizar,
  onAbrirCandidato,
}: KanbanBoardProps) {

  const [colunas, setColunas] = useState<Coluna[]>(colunasIniciais);

  const [termoBusca, setTermoBusca] = useState("");
  const [filtroSemAvaliacao, setFiltroSemAvaliacao] = useState(false);
  const [filtroNovos, setFiltroNovos] = useState(false);
  const [colunasOcultas, setColunasOcultas] = useState<number[]>([]);

  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setColunas(colunasIniciais);
  }, [colunasIniciais]);

  useEffect(() => setIsBrowser(true), []);
  if (!isBrowser) return null;

  // Função para ocultar/mostrar colunas
  const toggleColuna = (id_etapa: number) => {
    if (colunasOcultas.includes(id_etapa)) {
      setColunasOcultas(colunasOcultas.filter(id => id !== id_etapa));
    } else {
      setColunasOcultas([...colunasOcultas, id_etapa]);
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    const sourceColIndex = colunas.findIndex(
      (c) => c.id_etapa.toString() === source.droppableId,
    );
    const destColIndex = colunas.findIndex(
      (c) => c.id_etapa.toString() === destination.droppableId,
    );
    const newColunas = [...colunas];
    const sourceCol = newColunas[sourceColIndex];
    const destCol = newColunas[destColIndex];

    const sourceCandidatos = [...sourceCol.candidatos];
    const [candidatoMovido] = sourceCandidatos.splice(source.index, 1);

    const destCandidatos = [...destCol.candidatos];
    destCandidatos.splice(destination.index, 0, candidatoMovido);

    newColunas[sourceColIndex] = { ...sourceCol, candidatos: sourceCandidatos };
    newColunas[destColIndex] = { ...destCol, candidatos: destCandidatos };

    setColunas(newColunas);

    try {
      await api.patch(
        `/empresa/candidaturas/${candidatoMovido.id_candidatura}/mover`,
        {
          id_etapa_destino: destCol.id_etapa,
        },
      );
      onAtualizar();
    } catch (error) {
      console.error(error);
      toast.error("Erro ao mover candidato. Desfazendo ação...");
      setColunas(colunasIniciais);
    }
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden">

      {/* ================= BARRA DE FERRAMENTAS ================= */}
      <div className="mb-4 px-2 flex flex-col gap-4">

        {/* Linha 1: Busca e Filtros Rápidos */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <input
            type="text"
            placeholder="Buscar candidato por nome..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="w-full sm:max-w-md px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:border-primary focus:ring-2 focus:ring-blue-50 transition-all shadow-sm"
          />

          <div className="flex flex-wrap gap-3">
            <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer transition-colors font-bold select-none
              ${filtroSemAvaliacao ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}
            `}>
              <input
                type="checkbox"
                className="hidden"
                checked={filtroSemAvaliacao}
                onChange={() => setFiltroSemAvaliacao(!filtroSemAvaliacao)}
              />
              Sem Avaliação
            </label>

            <label className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm cursor-pointer transition-colors font-bold select-none
              ${filtroNovos ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}
            `}>
              <input
                type="checkbox"
                className="hidden"
                checked={filtroNovos}
                onChange={() => setFiltroNovos(!filtroNovos)}
              />
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Apenas Novos
            </label>
          </div>
        </div>

        {/* Linha 2: Controle de Colunas (Visibilidade) */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest shrink-0">
            Exibir Etapas:
          </span>
          {colunas.map((col) => {
            const isOculta = colunasOcultas.includes(col.id_etapa);
            return (
              <button
                key={col.id_etapa}
                onClick={() => toggleColuna(col.id_etapa)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 border
                  ${isOculta
                    ? "bg-transparent border-dashed border-gray-300 text-gray-400 hover:bg-gray-50"
                    : "bg-blue-50 border-blue-100 text-primary hover:bg-blue-100"}
                `}
              >
                {isOculta ? <HiOutlineEyeOff size={14} /> : <HiOutlineEye size={14} />}
                {col.nome_etapa}
              </button>
            );
          })}
        </div>
      </div>
      {/* ======================================================== */}

      <div className="flex-1 w-full overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-gray-300">
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex gap-6 h-full items-start px-2">

            {colunas.map((coluna) => {
              // 1. SE A COLUNA ESTÁ NA LISTA DE OCULTAS, NÃO RENDERIZA NADA!
              if (colunasOcultas.includes(coluna.id_etapa)) return null;

              // 2. APLICA TODOS OS FILTROS COMBINADOS
              const candidatosFiltrados = coluna.candidatos.filter(c => {
                // Filtro de Nome
                const matchNome = c.nome.toLowerCase().includes(termoBusca.toLowerCase());

                // Filtro Sem Avaliação
                const matchAvaliacao = filtroSemAvaliacao
                  ? (c.avaliacao_nota === null || c.avaliacao_nota === undefined)
                  : true;

                // Filtro de Novos (Inscrito nas últimas 48h)
                const diasInscrito = Math.floor((new Date().getTime() - new Date(c.data_inscricao).getTime()) / (1000 * 3600 * 24));
                const matchNovo = filtroNovos ? diasInscrito <= 2 : true;

                return matchNome && matchAvaliacao && matchNovo;
              });

              return (
                <div
                  key={coluna.id_etapa}
                  className="bg-gray-100/80 rounded-3xl w-80 flex flex-col max-h-full border border-gray-200/60 shadow-sm shrink-0 animate-in zoom-in-95 duration-200"
                >
                  {/* Header da Coluna */}
                  <div className="p-5 border-b border-gray-200/60 flex items-center justify-between bg-white/50 rounded-t-3xl">
                    <h3 className="font-black text-gray-700 uppercase tracking-widest text-xs">
                      {coluna.nome_etapa}
                    </h3>
                    <span className="bg-gray-200 text-gray-600 px-2.5 py-1 rounded-full text-xs font-bold">
                      {candidatosFiltrados.length}
                    </span>
                  </div>

                  {/* Área Soltável (Droppable) */}
                  <Droppable droppableId={coluna.id_etapa.toString()}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className={`flex-1 overflow-y-auto p-4 flex flex-col gap-3 min-h-[150px] transition-colors rounded-b-3xl
                        ${snapshot.isDraggingOver ? "bg-blue-50/50" : ""}
                      `}
                      >
                        {candidatosFiltrados.map((candidato, index) => (
                          <Draggable key={candidato.id_candidatura.toString()} draggableId={candidato.id_candidatura.toString()} index={index}>
                            {(provided, snapshot) => {

                              // LÓGICA DE CORES BASEADA NA AVALIAÇÃO
                              let cardColorClass = "bg-white border-gray-200 hover:border-gray-300 shadow-sm";
                              let iconBgClass = "bg-blue-100 text-primary";

                              if (candidato.avaliacao_nota) {
                                if (candidato.avaliacao_nota >= 4) {
                                  cardColorClass = "bg-amber-50/30 border-amber-300 hover:border-amber-400 shadow-amber-100";
                                  iconBgClass = "bg-amber-100 text-amber-600";
                                } else if (candidato.avaliacao_nota <= 2) {
                                  cardColorClass = "bg-gray-50 border-gray-200 opacity-75 hover:opacity-100";
                                  iconBgClass = "bg-gray-200 text-gray-500";
                                }
                              }

                              const diasInscrito = Math.floor((new Date().getTime() - new Date(candidato.data_inscricao).getTime()) / (1000 * 3600 * 24));
                              const isNovo = diasInscrito <= 2;

                              return (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  onClick={() => onAbrirCandidato(candidato.id_candidatura)}
                                  className={`p-4 rounded-2xl border transition-all cursor-pointer group
                                  ${snapshot.isDragging ? "shadow-2xl border-primary scale-105 rotate-2 bg-white opacity-100" : cardColorClass}
                                `}
                                >
                                  <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shrink-0 ${iconBgClass}`}>
                                        <HiOutlineUser size={20} />
                                      </div>
                                      <div className="flex-1 min-w-0">
                                        <p className="font-bold text-gray-800 truncate text-sm">
                                          {candidato.nome}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                          <p className="text-[10px] text-gray-400 font-medium">#{candidato.id_candidatura}</p>

                                          {candidato.avaliacao_nota && (
                                            <div className="flex items-center text-amber-400">
                                              <span className="text-[10px] font-black">{candidato.avaliacao_nota}</span>
                                              <HiStar size={12} />
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>

                                    {candidato.whatsapp && (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          const zapLimpo = candidato.whatsapp!.replace(/\D/g, '');
                                          window.open(`https://wa.me/55${zapLimpo}`, '_blank');
                                        }}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-emerald-500 hover:bg-emerald-50 rounded-full transition-all"
                                        title="Chamar no WhatsApp"
                                      >
                                        <FaWhatsapp size={18} />
                                      </button>
                                    )}
                                  </div>

                                  {/* Tags do Candidato */}
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {isNovo && (
                                      <span className="flex items-center text-[9px] font-black uppercase bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-lg border border-emerald-200">
                                        Novo
                                      </span>
                                    )}

                                    {candidato.fora_do_perfil && (
                                      <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-red-50 text-red-600 px-2 py-1 rounded-lg">
                                        <HiOutlineExclamationCircle size={14} /> Fora do Perfil
                                      </span>
                                    )}

                                    {candidato.possui_agendamento && (
                                      <span className="flex items-center gap-1 text-[10px] font-black uppercase bg-purple-50 text-purple-600 px-2 py-1 rounded-lg">
                                        <HiOutlineCalendar size={14} />
                                        {candidato.data_entrevista ? new Date(candidato.data_entrevista).toLocaleDateString('pt-BR') : "Agendado"}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )
                            }}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </div>
              )
            })}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
}