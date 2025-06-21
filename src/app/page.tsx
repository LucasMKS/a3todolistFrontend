"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion"; // Import motion and AnimatePresence
import withAuth from "@/components/withAuth";
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
import { PlusCircle, Folder, Trash2 } from "lucide-react"; // Import icons

import {
  listarGrupos,
  criarGrupo,
  deletarGrupo,
  GrupoResponseDTO,
} from "@/services/api";

function HomePage() {
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight tracking-tight">
            Seus Espaços de Trabalho
          </h1>
          <Dialog
            open={isNewGroupModalOpen}
            onOpenChange={setIsNewGroupModalOpen}
          >
            <DialogTrigger asChild>
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg flex items-center gap-2 px-6 py-3 rounded-lg text-lg">
                <PlusCircle className="h-5 w-5" /> Criar Novo Grupo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] p-6 rounded-lg shadow-xl">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold text-gray-900 mb-2">
                  Criar Novo Grupo
                </DialogTitle>
                <DialogDescription className="text-gray-600 text-base">
                  Dê um nome ao seu novo espaço de organização de tarefas.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Input
                  id="novoNomeGrupo"
                  placeholder="Ex: Projetos Pessoais, Equipe de Marketing"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  disabled={loading}
                  className="w-full p-3 text-lg border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                />
              </div>
              <DialogFooter className="flex justify-end gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsNewGroupModalOpen(false)}
                  disabled={loading}
                  className="px-5 py-2 text-base rounded-md border-gray-300 hover:bg-gray-100"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleCriarGrupo}
                  disabled={loading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 text-base rounded-md transition-colors"
                >
                  {loading ? "Criando..." : "Criar Grupo"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {erro && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 bg-red-100 text-red-800 rounded-lg text-center font-medium shadow-sm border border-red-200"
          >
            {erro}
          </motion.div>
        )}

        {loading && (
          <p className="text-center text-gray-600 text-lg font-medium py-12">
            Carregando seus grupos...
          </p>
        )}

        {!loading && grupos.length === 0 && (
          <div className="text-center py-20 bg-white rounded-xl shadow-md border border-gray-200">
            <p className="text-gray-500 text-2xl italic mb-6">
              Parece que você não possui nenhum grupo ainda.
            </p>
            <p className="text-gray-700 text-lg">
              Clique no botão{" "}
              <span className="font-semibold text-indigo-600">
                "Criar Novo Grupo"
              </span>{" "}
              para começar a organizar suas tarefas!
            </p>
          </div>
        )}

        {/* Grid de grupos */}
        {!loading && grupos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <AnimatePresence>
              {grupos.map((grupo) => (
                <motion.div
                  key={grupo.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  layout // Enables smooth transitions for adding/removing items
                >
                  <Card
                    className="relative p-6 flex flex-col justify-between items-start 
                             bg-white border border-gray-200 rounded-xl shadow-md 
                             hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <Link
                      href={`/grupos/${grupo.id}`}
                      className="flex-grow w-full text-left pb-12 block" // Added pb to create space for button
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <Folder className="h-6 w-6 text-indigo-500" />
                        <h2 className="font-bold text-xl text-gray-800 hover:text-indigo-600 transition-colors">
                          {grupo.nome}
                        </h2>
                      </div>
                      <p className="text-sm text-gray-500">
                        Clique para gerenciar as tarefas deste grupo.
                      </p>
                    </Link>

                    <Button
                      variant="destructive" // Use destructive variant for delete
                      size="icon" // Use icon size for a cleaner look
                      onClick={(e) => {
                        e.preventDefault(); // Prevent navigating to group page
                        handleDeletarGrupo(grupo.id);
                      }}
                      disabled={loading}
                      className="absolute bottom-4 right-4 hover:text-red-600 hover:bg-red-100 transition-colors duration-200"
                    >
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(HomePage);
