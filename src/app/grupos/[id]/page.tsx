"use client";

import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  listarTarefasPorGrupo,
  atualizarTarefa,
  deletarTarefa,
  TarefaResponseDTO,
  TarefaRequestDTO,
  StatusTarefa,
  listarUsuariosPorGrupo,
  adicionarUsuarioAoGrupo,
  removerUsuarioDoGrupo,
  UsuarioResponseDTO,
} from "@/services/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import TarefaForm from "@/components/TarefaForm";
import { Trash2, UserPlus, ListPlus, Users } from "lucide-react";

interface GrupoPageProps {
  params: {
    id: string;
  };
}

const formatStatus = (status: string): string => {
  switch (status) {
    case "PENDENTE":
      return "Pendente";
    case "EM_ANDAMENTO":
      return "Em andamento";
    case "CONCLUIDA":
      return "Concluída";
    default:
      return status;
  }
};

export default function GrupoPage({ params }: GrupoPageProps) {
  const grupoId = Number(params.id);

  // Estados para tarefas
  const [tarefas, setTarefas] = useState<TarefaResponseDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingAtualizacao, setLoadingAtualizacao] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Estados para usuários
  const [usuarios, setUsuarios] = useState<UsuarioResponseDTO[]>([]);
  const [loadingUsuario, setLoadingUsuario] = useState(false);
  const [erroUsuario, setErroUsuario] = useState<string | null>(null);
  const [filtroTitulo, setFiltroTitulo] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<StatusTarefa | "TODOS">(
    "TODOS"
  );

  // Novo usuário para o Dialog
  const [emailNovoUsuario, setEmailNovoUsuario] = useState("");
  const [funcaoNovoUsuario, setFuncaoNovoUsuario] = useState("USER"); // Default role set

  const [loadingAdicionarUsuario, setLoadingAdicionarUsuario] = useState(false);

  // Controle modal e drawer
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isUsuariosDrawerOpen, setIsUsuariosDrawerOpen] = useState(false);

  // Editar tarefa
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [formEdicao, setFormEdicao] = useState<{
    titulo: string;
    descricao: string;
    status: StatusTarefa;
  }>({
    titulo: "",
    descricao: "",
    status: "PENDENTE",
  });

  // Buscar tarefas
  async function fetchTarefas() {
    setLoading(true);
    setErro(null);
    try {
      const dados = await listarTarefasPorGrupo(grupoId);
      setTarefas(dados);
    } catch (e: any) {
      setErro(e.message || "Erro ao carregar tarefas");
    } finally {
      setLoading(false);
    }
  }

  // Buscar usuários
  async function fetchUsuarios() {
    setLoadingUsuario(true);
    setErroUsuario(null);
    try {
      const dados = await listarUsuariosPorGrupo(grupoId);
      setUsuarios(dados);
    } catch (e: any) {
      setErroUsuario(e.message || "Erro ao carregar usuários");
    } finally {
      setLoadingUsuario(false);
    }
  }

  useEffect(() => {
    if (!isNaN(grupoId)) {
      fetchTarefas();
      fetchUsuarios();
    }
  }, [grupoId]);

  // Adicionar usuário ao grupo
  async function handleAdicionarUsuario() {
    if (!emailNovoUsuario.trim()) {
      alert("Informe o e-mail do usuário");
      return;
    }

    setLoadingAdicionarUsuario(true);
    setErroUsuario(null);
    try {
      await adicionarUsuarioAoGrupo(grupoId, {
        email: emailNovoUsuario.trim(),
        funcao: funcaoNovoUsuario.trim(),
      });
      setEmailNovoUsuario("");
      setFuncaoNovoUsuario("USER"); // Reset to default
      await fetchUsuarios();
      alert("Usuário adicionado com sucesso!");
    } catch (e: any) {
      setErroUsuario(e.message || "Erro ao adicionar usuário");
    } finally {
      setLoadingAdicionarUsuario(false);
    }
  }

  // Remover usuário do grupo
  async function handleRemoverUsuario(usuarioId: number, usuarioNome: string) {
    if (confirm(`Tem certeza que deseja remover ${usuarioNome} deste grupo?`)) {
      setLoadingUsuario(true);
      setErroUsuario(null);
      try {
        await removerUsuarioDoGrupo(grupoId, usuarioId);
        await fetchUsuarios();
        alert(`${usuarioNome} removido do grupo com sucesso!`);
      } catch (e: any) {
        setErroUsuario(e.message || "Erro ao remover usuário do grupo");
      } finally {
        setLoadingUsuario(false);
      }
    }
  }

  // Atualizar tarefa
  async function handleAtualizar(
    id: number,
    updatedFields: { titulo: string; descricao: string; status: StatusTarefa }
  ) {
    setLoadingAtualizacao(true);
    try {
      const payload: TarefaRequestDTO = {
        grupoId,
        titulo: updatedFields.titulo,
        descricao: updatedFields.descricao,
        status: updatedFields.status,
      };

      const tarefaAtualizada = await atualizarTarefa(id, payload);
      setEditandoId(null);
      setTarefas((tarefasAntigas) =>
        tarefasAntigas.map((t) => (t.id === id ? tarefaAtualizada : t))
      );
    } catch (err) {
      console.error("Erro ao atualizar tarefa", err);
    } finally {
      setLoadingAtualizacao(false);
    }
  }

  async function handleExcluir(id: number) {
    if (confirm("Deseja realmente excluir esta tarefa?")) {
      try {
        await deletarTarefa(id);
        fetchTarefas(); // Re-fetch all tasks to ensure consistency
      } catch (err) {
        console.error("Erro ao excluir tarefa", err);
      }
    }
  }

  const tarefasFiltradas = useMemo(() => {
    return tarefas.filter((t) => {
      const tituloMatch = t.titulo
        .toLowerCase()
        .includes(filtroTitulo.toLowerCase());
      const statusMatch = filtroStatus === "TODOS" || t.status === filtroStatus;
      return tituloMatch && statusMatch;
    });
  }, [tarefas, filtroTitulo, filtroStatus]);

  const tarefasPorStatus = useMemo(() => {
    return {
      PENDENTE: tarefasFiltradas.filter((t) => t.status === "PENDENTE"),
      EM_ANDAMENTO: tarefasFiltradas.filter((t) => t.status === "EM_ANDAMENTO"),
      CONCLUIDA: tarefasFiltradas.filter((t) => t.status === "CONCLUIDA"),
    };
  }, [tarefasFiltradas]);

  const renderTaskCard = (tarefa: TarefaResponseDTO) => (
    <motion.div
      key={tarefa.id}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="p-4  bg-white shadow-md rounded-lg border border-gray-200">
        {editandoId === tarefa.id ? (
          <>
            <Input
              value={formEdicao.titulo}
              onChange={(e) =>
                setFormEdicao((f) => ({ ...f, titulo: e.target.value }))
              }
              className="text-lg font-semibold"
              placeholder="Título da tarefa"
            />
            <Textarea
              value={formEdicao.descricao}
              onChange={(e) =>
                setFormEdicao((f) => ({ ...f, descricao: e.target.value }))
              }
              placeholder="Descrição da tarefa (opcional)"
              rows={3}
            />
            <Select
              value={formEdicao.status}
              onValueChange={(value) =>
                setFormEdicao((f) => ({
                  ...f,
                  status: value as StatusTarefa,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="EM_ANDAMENTO">Em andamento</SelectItem>
                <SelectItem value="CONCLUIDA">Concluída</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex gap-2 mt-4 justify-end">
              <Button
                size="sm"
                onClick={() =>
                  handleAtualizar(tarefa.id, {
                    titulo: formEdicao.titulo,
                    descricao: formEdicao.descricao,
                    status: formEdicao.status,
                  })
                }
                disabled={loadingAtualizacao}
              >
                {loadingAtualizacao ? "Salvando..." : "Salvar"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditandoId(null)}
              >
                Cancelar
              </Button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-bold text-lg text-gray-800">{tarefa.titulo}</h3>
            {tarefa.descricao && (
              <p className="text-gray-600 text-sm leading-relaxed">
                {tarefa.descricao}
              </p>
            )}
            <div
              className={`text-xs font-medium px-2 py-1 rounded-full inline-block max-w-fit ${
                tarefa.status === "PENDENTE"
                  ? "bg-gray-100 text-gray-700"
                  : tarefa.status === "EM_ANDAMENTO"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {formatStatus(tarefa.status)}
            </div>
            <div className="flex gap-2 justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditandoId(tarefa.id);
                  setFormEdicao({
                    titulo: tarefa.titulo,
                    descricao: tarefa.descricao || "",
                    status: tarefa.status,
                  });
                }}
              >
                Editar
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleExcluir(tarefa.id)}
              >
                Excluir
              </Button>
            </div>
          </>
        )}
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      {" "}
      {/* Changed background to a lighter gray */}
      <div className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">
            Tarefas do Grupo {grupoId}
          </h1>
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              placeholder="Filtrar por título..."
              value={filtroTitulo}
              onChange={(e) => setFiltroTitulo(e.target.value)}
              className="w-full sm:w-64"
            />

            <Select
              value={filtroStatus}
              onValueChange={(value) =>
                setFiltroStatus(value as StatusTarefa | "TODOS")
              }
            >
              <SelectTrigger className="w-full sm:w-52">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="TODOS">Todos</SelectItem>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="EM_ANDAMENTO">Em andamento</SelectItem>
                <SelectItem value="CONCLUIDA">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 justify-end">
          {/* Botão para abrir o modal de criação de tarefa */}
          <Dialog
            open={isNewTaskModalOpen}
            onOpenChange={setIsNewTaskModalOpen}
          >
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                {" "}
                {/* Stronger blue */}
                <ListPlus className="h-5 w-5" /> Criar Nova Tarefa
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Nova Tarefa</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes para adicionar uma nova tarefa a este
                  grupo.
                </DialogDescription>
              </DialogHeader>
              <TarefaForm
                grupoId={grupoId}
                onTarefaCriada={(novaTarefa) => {
                  setTarefas((tarefasAntigas) => [
                    ...tarefasAntigas,
                    novaTarefa,
                  ]);
                  setIsNewTaskModalOpen(false);
                }}
                onClose={() => setIsNewTaskModalOpen(false)}
              />
            </DialogContent>
          </Dialog>

          {/* Botão para abrir o drawer de membros */}
          <Sheet
            open={isUsuariosDrawerOpen}
            onOpenChange={setIsUsuariosDrawerOpen}
          >
            <SheetTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 border-blue-500 text-blue-700 hover:bg-blue-50"
              >
                {" "}
                {/* Styled outline button */}
                <Users className="h-5 w-5" /> Ver Membros
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[400px] flex flex-col">
              <SheetHeader>
                <SheetTitle>Membros do Grupo</SheetTitle>
                <SheetDescription>
                  Gerencie os usuários que fazem parte deste grupo.
                </SheetDescription>
              </SheetHeader>

              {/* Adicionar novo membro - now within the Sheet */}
              <div className="p-4 border border-dashed border-blue-300 rounded-lg bg-blue-50 mb-6">
                {" "}
                {/* Blue dashed border and background */}
                <h3 className="text-md font-semibold mb-3 flex items-center gap-2 text-blue-800">
                  <UserPlus className="h-4 w-4" /> Adicionar Novo Membro
                </h3>
                <div className="space-y-3">
                  <Input
                    placeholder="Email do novo membro"
                    value={emailNovoUsuario}
                    onChange={(e) => setEmailNovoUsuario(e.target.value)}
                    type="email"
                    className="focus:ring-blue-500 focus:border-blue-500"
                  />
                  <Select
                    value={funcaoNovoUsuario}
                    onValueChange={setFuncaoNovoUsuario}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a função" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ADMIN">Administrador</SelectItem>
                      <SelectItem value="USER">Usuário</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    onClick={handleAdicionarUsuario}
                    disabled={loadingAdicionarUsuario}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {loadingAdicionarUsuario
                      ? "Adicionando..."
                      : "Adicionar Membro"}
                  </Button>
                </div>
              </div>

              {/* Lista de Membros */}
              <div className="flex-1 overflow-y-auto space-y-3">
                {loadingUsuario ? (
                  <p className="text-gray-500 text-center">
                    Carregando membros...
                  </p>
                ) : erroUsuario ? (
                  <div className="p-3 bg-red-100 text-red-700 rounded text-sm border border-red-200">
                    Erro: {erroUsuario}
                  </div>
                ) : usuarios.length === 0 ? (
                  <p className="text-gray-500 text-center">
                    Nenhum membro neste grupo.
                  </p>
                ) : (
                  <AnimatePresence>
                    {usuarios.map((usuario) => (
                      <motion.div
                        key={usuario.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Card className="p-3 flex items-center justify-between gap-3 shadow-sm hover:shadow-md transition-shadow">
                          <div>
                            <p className="font-medium text-gray-800">
                              {usuario.nome || "Nome não disponível"}
                            </p>
                            <p className="text-sm text-gray-600">
                              {usuario.email}
                            </p>
                          </div>
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() =>
                              handleRemoverUsuario(
                                usuario.id!,
                                usuario.nome || usuario.email
                              )
                            }
                            disabled={loadingUsuario}
                            className="flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </Card>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Erro geral */}
        {erro && (
          <div className="p-4 bg-red-100 text-red-800 rounded-lg border border-red-200 shadow-sm">
            {erro}
          </div>
        )}

        {loading && (
          <p className="text-center text-lg text-gray-600 mt-8">
            Carregando tarefas...
          </p>
        )}

        {!loading && !erro && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Pending Column */}
            <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 flex flex-col min-h-[300px]">
              {" "}
              {/* Changed border to a subtle gray */}
              <h2 className="text-2xl font-bold mb-5 text-center text-gray-800">
                Pendente{" "}
                <span className="text-gray-500 text-lg">
                  ({tarefasPorStatus.PENDENTE.length})
                </span>
              </h2>
              {tarefasPorStatus.PENDENTE.length === 0 && (
                <p className="text-gray-500 text-center text-sm italic py-4">
                  Nenhuma tarefa pendente.
                </p>
              )}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
                <AnimatePresence>
                  {tarefasPorStatus.PENDENTE.map(renderTaskCard)}
                </AnimatePresence>
              </div>
            </div>

            {/* In Progress Column */}
            <div className="bg-white p-5 rounded-xl shadow-lg border border-blue-200 flex flex-col min-h-[300px]">
              {" "}
              {/* Changed border to a subtle blue */}
              <h2 className="text-2xl font-bold mb-5 text-center text-blue-700">
                Em Andamento{" "}
                <span className="text-blue-500 text-lg">
                  ({tarefasPorStatus.EM_ANDAMENTO.length})
                </span>
              </h2>
              {tarefasPorStatus.EM_ANDAMENTO.length === 0 && (
                <p className="text-gray-500 text-center text-sm italic py-4">
                  Nenhuma tarefa em andamento.
                </p>
              )}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
                <AnimatePresence>
                  {tarefasPorStatus.EM_ANDAMENTO.map(renderTaskCard)}
                </AnimatePresence>
              </div>
            </div>

            {/* Completed Column */}
            <div className="bg-white p-5 rounded-xl shadow-lg border border-green-200 flex flex-col min-h-[300px]">
              {" "}
              {/* Changed border to a subtle green */}
              <h2 className="text-2xl font-bold mb-5 text-center text-green-700">
                Concluída{" "}
                <span className="text-green-500 text-lg">
                  ({tarefasPorStatus.CONCLUIDA.length})
                </span>
              </h2>
              {tarefasPorStatus.CONCLUIDA.length === 0 && (
                <p className="text-gray-500 text-center text-sm italic py-4">
                  Nenhuma tarefa concluída.
                </p>
              )}
              <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
                <AnimatePresence>
                  {tarefasPorStatus.CONCLUIDA.map(renderTaskCard)}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
