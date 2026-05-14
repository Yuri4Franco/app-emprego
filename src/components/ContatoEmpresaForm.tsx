"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import toast from "react-hot-toast";
import { HiOutlineCheckCircle } from "react-icons/hi";
import api from "@/src/services/api";
import { ButtonType } from "@/src/components/ButtonType"; // Ajuste o caminho se necessário

// 1. Validação do formulário
const contatoSchema = z.object({
  nome: z.string().min(3, "Digite o nome da empresa ou o seu nome."),
  email: z.string().email("Digite um e-mail válido."),
  assunto: z.string().min(1, "Selecione um assunto."),
  mensagem: z.string().min(10, "A mensagem deve ter pelo menos 10 caracteres."),
});

type ContatoData = z.infer<typeof contatoSchema>;

export default function ContatoSection() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContatoData>({
    resolver: zodResolver(contatoSchema),
  });

  // 2. Função de Envio
  const onSubmit = async (data: ContatoData) => {
    setIsSubmitting(true);
    try {
      // Bate no endpoint público do seu backend
      await api.post("/site/contato", data);
      
      toast.success("Mensagem enviada! Em breve entraremos em contato.");
      reset(); // Limpa o formulário
    } catch (error) {
      toast.error("Ocorreu um erro ao enviar a mensagem. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contato" className="py-24 bg-white scroll-mt-20">
      <div className="max-w-6xl mx-auto px-6 md:px-8">
        <div className="bg-primary rounded-3xl p-8 md:p-16 flex flex-col md:flex-row gap-12 shadow-2xl relative overflow-hidden">
          
          {/* Decorativo */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>

          {/* Texto */}
          <div className="w-full md:w-1/2 text-white relative z-10">    
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Pronto para encontrar os melhores talentos?
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Preencha o formulário ao lado e um de nossos consultores entrará
              em contato para ativar o cadastro da sua empresa.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-blue-100">
                <HiOutlineCheckCircle className="text-2xl text-blue-300" />
                <span>Atendimento personalizado</span>
              </div>
              <div className="flex items-center gap-3 text-blue-100">
                <HiOutlineCheckCircle className="text-2xl text-blue-300" />
                <span>Condições exclusivas para associados</span>
              </div>
              <div className="flex items-center gap-3 text-blue-100">
                <HiOutlineCheckCircle className="text-2xl text-blue-300" />
                <span>Suporte para cadastro de vagas</span>
              </div>
            </div>
          </div>

          {/* O Formulário */}
          <div className="w-full md:w-1/2 bg-white rounded-2xl p-8 shadow-lg relative z-10">
            <h3 className="text-gray-800 font-bold text-xl mb-6">Fale Conosco</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome da Empresa ou Responsável
                </label>
                <input
                  type="text"
                  {...register("nome")}
                  className={`w-full p-3 rounded-lg border outline-none transition-all ${
                    errors.nome ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                  }`}
                  placeholder="Ex: ACI Panambi"
                />
                {errors.nome && <p className="text-red-500 text-xs mt-1 font-bold">{errors.nome.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail Profissional
                </label>
                <input
                  type="email"
                  {...register("email")}
                  className={`w-full p-3 rounded-lg border outline-none transition-all ${
                    errors.email ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                  }`}
                  placeholder="rh@suaempresa.com.br"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 font-bold">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assunto
                </label>
                <select
                  {...register("assunto")}
                  className="w-full p-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all bg-white"
                >
                  <option value="Quero cadastrar minha empresa">Quero cadastrar minha empresa</option>
                  <option value="Dúvidas sobre planos">Dúvidas sobre planos</option>
                  <option value="Suporte técnico">Suporte técnico</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem
                </label>
                <textarea
                  rows={4}
                  {...register("mensagem")}
                  className={`w-full p-3 rounded-lg border outline-none transition-all resize-none ${
                    errors.mensagem ? "border-red-500 focus:ring-red-500" : "border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary"
                  }`}
                  placeholder="Como podemos ajudar?"
                ></textarea>
                {errors.mensagem && <p className="text-red-500 text-xs mt-1 font-bold">{errors.mensagem.message}</p>}
              </div>

              <ButtonType 
                type="submit" 
                variant="primary" 
                size="lg" 
                disabled={isSubmitting}
                className="w-full justify-center mt-2 disabled:opacity-70"
              >
                {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
              </ButtonType>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}