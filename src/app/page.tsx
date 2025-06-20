"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

import {
  listarGrupos,
  criarGrupo,
  deletarGrupo,
  GrupoResponseDTO,
} from "@/services/api";

export default function HomePage() {
  const [grupos, setGrupos] = useState<GrupoResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [isNewGroupModalOpen, setIsNewGroupModalOpen] = useState(false);

  async function carregarGrupos() {
    setLoading(true);
    setErro(null);
    try {
      const dados = await listarGrupos();
      setGrupos(dados);
    } catch (e: any) {
      setErro(e.message || "Erro ao carregar grupos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregarGrupos();
  }, []);

  async function handleCriarGrupo() {
    if (!novoNome.trim()) {
      alert("O nome do grupo não pode ser vazio.");
      return;
    }
    setLoading(true);
    setErro(null);
    try {
      await criarGrupo({ nome: novoNome.trim() });
      setNovoNome("");
      setIsNewGroupModalOpen(false);
      await carregarGrupos();
    } catch (e: any) {
      setErro(e.message || "Erro ao criar grupo");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeletarGrupo(id: number) {
    if (
      !confirm(
        "Tem certeza que deseja deletar este grupo? Esta ação é irreversível."
      )
    )
      return;
    setLoading(true);
    setErro(null);
    try {
      await deletarGrupo(id);
      await carregarGrupos();
    } catch (e: any) {
      setErro(e.message || "Erro ao deletar grupo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {" "}
      <div className="max-w-6xl mx-auto space-y-10">
        {" "}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
            Seus Espaços de Trabalho
          </h1>
          <Dialog
            open={isNewGroupModalOpen}
            onOpenChange={setIsNewGroupModalOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md">
                Criar Novo Grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">
                  Criar Novo Grupo
                </DialogTitle>
                <DialogDescription>
                  Dê um nome ao seu novo espaço de organização de tarefas.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  id="novoNomeGrupo"
                  placeholder="Nome do grupo, ex: Projetos Pessoais"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  disabled={loading}
                  className="col-span-3"
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsNewGroupModalOpen(false)}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCriarGrupo}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  {loading ? "Criando..." : "Criar Grupo"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        {erro && (
          <div className="p-4 bg-red-100 text-red-800 rounded-lg text-center font-medium shadow-sm">
            {erro}
          </div>
        )}
        {loading && (
          <p className="text-center text-gray-600 text-lg font-medium py-8">
            Carregando seus grupos...
          </p>
        )}
        {!loading && grupos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-xl italic mb-4">
              Parece que você não possui nenhum grupo ainda.
            </p>
            <p className="text-gray-600">
              Clique em "Criar Novo Grupo" para começar a organizar suas
              tarefas!
            </p>
          </div>
        )}
        {/* Grid de grupos */}
        {!loading && grupos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {" "}
            {/* Responsive grid */}
            {grupos.map((grupo) => (
              <Card
                key={grupo.id}
                className="relative p-6 flex flex-col justify-between items-start 
                           bg-white border border-gray-200 rounded-xl shadow-md 
                           hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <Link
                  href={`/grupos/${grupo.id}`}
                  className="flex-grow w-full text-left"
                >
                  <h2 className="font-bold text-xl text-gray-800 hover:text-indigo-600 transition-colors mb-3">
                    {grupo.nome}
                  </h2>
                  <p className="text-sm text-gray-500 mb-4">
                    Clique para ver as tarefas
                  </p>
                </Link>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.preventDefault();
                    handleDeletarGrupo(grupo.id);
                  }}
                  disabled={loading}
                  className="absolute bottom-4 right-4 text-red-500 hover:bg-red-50 hover:text-red-600"
                >
                  Deletar
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
