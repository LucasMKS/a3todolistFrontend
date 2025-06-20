"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
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
import { Trash2 } from "lucide-react";

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
  const [funcaoNovoUsuario, setFuncaoNovoUsuario] = useState("USER");
  const [loadingAdicionarUsuario, setLoadingAdicionarUsuario] = useState(false);

  // Controle modal e drawer
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const [isAdicionarUsuarioOpen, setIsAdicionarUsuarioOpen] = useState(false);
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
    if (!emailNovoUsuario.trim() || !funcaoNovoUsuario.trim()) {
      alert("Informe o e-mail e a função do usuário");
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
      setFuncaoNovoUsuario("");
      await fetchUsuarios();
      alert("Usuário adicionado com sucesso!");
      setIsAdicionarUsuarioOpen(false);
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
        fetchTarefas();
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
    <Card key={tarefa.id} className="p-3 space-y-1 bg-white shadow-sm mb-3">
      {editandoId === tarefa.id ? (
        <>
          <Input
            value={formEdicao.titulo}
            onChange={(e) =>
              setFormEdicao((f) => ({ ...f, titulo: e.target.value }))
            }
          />
          <Textarea
            value={formEdicao.descricao}
            onChange={(e) =>
              setFormEdicao((f) => ({ ...f, descricao: e.target.value }))
            }
          />
          <select
            className="w-full border rounded px-2 py-1 text-sm"
            value={formEdicao.status}
            onChange={(e) =>
              setFormEdicao((f) => ({
                ...f,
                status: e.target.value as StatusTarefa,
              }))
            }
          >
            <option value="PENDENTE">Pendente</option>
            <option value="EM_ANDAMENTO">Em andamento</option>
            <option value="CONCLUIDA">Concluída</option>
          </select>
          <div className="flex gap-2 mt-2 justify-end">
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
              Salvar
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setEditandoId(null)}
            >
              Cancelar
            </Button>
          </div>
        </>
      ) : (
        <>
          <h3 className="font-semibold text-base">{tarefa.titulo}</h3>
          {tarefa.descricao && (
            <p className="text-gray-600 text-sm">{tarefa.descricao}</p>
          )}
          <p className="text-xs text-gray-500">
            Status: {formatStatus(tarefa.status)}
          </p>
          <div className="flex gap-2 mt-2 justify-end">
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
  );

  return (
    <div>
      {" "}
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Tarefas do Grupo {grupoId}</h1>
          <div className="flex gap-4 items-center mt-4">
            <Input
              placeholder="Filtrar por título"
              value={filtroTitulo}
              onChange={(e) => setFiltroTitulo(e.target.value)}
              className="w-64"
            />

            <Select
              value={filtroStatus}
              onValueChange={(value) =>
                setFiltroStatus(value as StatusTarefa | "TODOS")
              }
            >
              <SelectTrigger className="w-52">
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
          <div className="flex gap-2">
            {/* Botão para abrir o modal de criação de tarefa */}
            <Dialog
              open={isNewTaskModalOpen}
              onOpenChange={setIsNewTaskModalOpen}
            >
              <DialogTrigger asChild>
                <Button>Criar Nova Tarefa</Button>
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
                  }}
                  onClose={() => setIsNewTaskModalOpen(false)}
                />
              </DialogContent>
            </Dialog>

            {/* Botão para abrir o modal de adicionar usuário */}
            <Dialog
              open={isAdicionarUsuarioOpen}
              onOpenChange={setIsAdicionarUsuarioOpen}
            >
              <DialogTrigger asChild>
                <Button variant="secondary">Adicionar Pessoa</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Adicionar Pessoa</DialogTitle>
                  <DialogDescription>
                    Informe o e-mail e a função da pessoa para adicionar ao
                    grupo.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <Input
                    placeholder="Email"
                    value={emailNovoUsuario}
                    onChange={(e) => setEmailNovoUsuario(e.target.value)}
                    type="email"
                  />
                  <Button
                    onClick={handleAdicionarUsuario}
                    disabled={loadingAdicionarUsuario}
                  >
                    {loadingAdicionarUsuario ? "Adicionando..." : "Adicionar"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Sheet
              open={isUsuariosDrawerOpen}
              onOpenChange={setIsUsuariosDrawerOpen}
            >
              <SheetTrigger asChild>
                <Button variant="outline"> Ver Membros</Button>
              </SheetTrigger>
              <SheetContent className="w-72 sm:w-80">
                {" "}
                <SheetHeader>
                  <SheetTitle>Membros do Grupo</SheetTitle>
                  <SheetDescription>
                    Gerencie os usuários que fazem parte deste grupo.
                  </SheetDescription>
                </SheetHeader>
                {/* Adicionar novo membro */}
                <div className="p-4 border-2 border-black-200">
                  <h3 className="text-md font-semibold mb-3 flex items-center gap-2">
                    Adicionar Novo Membro
                  </h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Email do novo membro"
                      value={emailNovoUsuario}
                      onChange={(e) => setEmailNovoUsuario(e.target.value)}
                      type="email"
                    />

                    <Button
                      onClick={handleAdicionarUsuario}
                      disabled={loadingAdicionarUsuario}
                      className="w-full"
                    >
                      {loadingAdicionarUsuario
                        ? "Adicionando..."
                        : "Adicionar Membro"}
                    </Button>
                  </div>
                </div>
                {/* Lista de Membros */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {loadingUsuario ? (
                    <p className="text-gray-500">Carregando membros...</p>
                  ) : erroUsuario ? (
                    <div className="p-3 bg-red-100 text-red-700 rounded text-sm">
                      Erro: {erroUsuario}
                    </div>
                  ) : usuarios.length === 0 ? (
                    <p className="text-gray-500">Nenhum membro neste grupo.</p>
                  ) : (
                    usuarios.map((usuario) => (
                      <Card key={usuario.id} className="p-3 flex  gap-2">
                        <div>
                          <p className="font-semibold">
                            {usuario.nome || "Nome não disponível"}
                          </p>
                          <p className="text-sm text-gray-600">
                            {usuario.email}
                          </p>
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
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
                    ))
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* Erro geral */}
        {erro && (
          <div className="p-3 bg-red-200 text-red-800 rounded">{erro}</div>
        )}

        {/* Se desejar pode mostrar o erro do usuário também */}
        {erroUsuario && (
          <div className="p-3 bg-red-200 text-red-800 rounded">
            {erroUsuario}
          </div>
        )}

        {loading && <p>Carregando tarefas...</p>}

        {!loading && !erro && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-100 p-4 rounded-lg shadow-md min-h-[300px]">
              <h2 className="text-xl font-semibold mb-4 text-center text-gray-700">
                Pendente ({tarefasPorStatus.PENDENTE.length})
              </h2>
              {tarefasPorStatus.PENDENTE.length === 0 && (
                <p className="text-gray-500 text-center text-sm">
                  Nenhuma tarefa pendente.
                </p>
              )}
              <div className="space-y-3">
                {tarefasPorStatus.PENDENTE.map(renderTaskCard)}
              </div>
            </div>

            {/* Em Andamento Column */}
            <div className="bg-blue-50 p-4 rounded-lg shadow-md min-h-[300px]">
              <h2 className="text-xl font-semibold mb-4 text-center text-blue-700">
                Em Andamento ({tarefasPorStatus.EM_ANDAMENTO.length})
              </h2>
              {tarefasPorStatus.EM_ANDAMENTO.length === 0 && (
                <p className="text-gray-500 text-center text-sm">
                  Nenhuma tarefa em andamento.
                </p>
              )}
              <div className="space-y-3">
                {tarefasPorStatus.EM_ANDAMENTO.map(renderTaskCard)}
              </div>
            </div>

            {/* Concluída Column */}
            <div className="bg-green-50 p-4 rounded-lg shadow-md min-h-[300px]">
              <h2 className="text-xl font-semibold mb-4 text-center text-green-700">
                Concluída ({tarefasPorStatus.CONCLUIDA.length})
              </h2>
              {tarefasPorStatus.CONCLUIDA.length === 0 && (
                <p className="text-gray-500 text-center text-sm">
                  Nenhuma tarefa concluída.
                </p>
              )}
              <div className="space-y-3">
                {tarefasPorStatus.CONCLUIDA.map(renderTaskCard)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
