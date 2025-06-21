import axios from "axios";

function salvarToken(token: string) {
  const expiraEm = Date.now() + 24 * 60 * 60 * 1000; // 24h
  localStorage.setItem("token", token);
  localStorage.setItem("token_expira_em", expiraEm.toString());
}

function obterTokenValido(): string | null {
  const token = localStorage.getItem("token");
  const expiraEm = localStorage.getItem("token_expira_em");

  if (!token || !expiraEm) return null;

  const agora = Date.now();
  if (agora > Number(expiraEm)) {
    localStorage.removeItem("token");
    localStorage.removeItem("token_expira_em");
    return null;
  }

  return token;
}

const api = axios.create({
  baseURL:
    "https://a3todolist-production.up.railway.app/api",
});

api.interceptors.request.use((config) => {
  const token = obterTokenValido();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export interface GrupoResponseDTO {
  id: number;
  nome: string;
}

export interface TarefaResponseDTO {
  id: number;
  titulo: string;
  descricao?: string;
  status: "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA";
  grupoId: number;
  dataCriacao: string;
  dataConclusao?: string;
}

export type StatusTarefa = "PENDENTE" | "EM_ANDAMENTO" | "CONCLUIDA";

export interface TarefaRequestDTO {
  grupoId: number;
  titulo: string;
  descricao?: string;
  status: StatusTarefa;
}

interface CriarGrupoRequest {
  nome: string;
}

export interface UsuarioResponseDTO {
  id: number;
  nome: string;
  email: string;
  funcao: string;
}

interface AdicionarUsuarioGrupoRequest {
  email: string;
  funcao: string;
}

export const login = async (email: string, senha: string) => {
  const response = await api.post("/auth/login", { email, senha });
  const { token } = response.data;
  if (token) salvarToken(token);
  return response.data;
};

export const register = async (nome: string, email: string, senha: string) => {
  const response = await api.post("/auth/register", { nome, email, senha });
  const { token } = response.data;
  if (token) salvarToken(token);
  return response.data;
};

// Busca todos os grupos
export async function listarGrupos(): Promise<GrupoResponseDTO[]> {
  const response = await api.get<GrupoResponseDTO[]>("/grupos");
  return response.data;
}

// Busca tarefas de um grupo específico
export async function listarTarefasPorGrupo(
  grupoId: number
): Promise<TarefaResponseDTO[]> {
  const response = await api.get<TarefaResponseDTO[]>(
    `/tarefas/grupo/${grupoId}`
  );
  return response.data;
}

export async function criarGrupo(
  request: CriarGrupoRequest
): Promise<GrupoResponseDTO> {
  const response = await api.post<GrupoResponseDTO>("/grupos", request);
  return response.data;
}

export async function deletarGrupo(id: number): Promise<void> {
  await api.delete(`/grupos/${id}`);
}

export async function criarTarefa(
  request: TarefaRequestDTO
): Promise<TarefaResponseDTO> {
  const response = await api.post<TarefaResponseDTO>("/tarefas", request);
  return response.data;
}

export async function atualizarTarefa(
  id: number,
  request: TarefaRequestDTO
): Promise<TarefaResponseDTO> {
  const response = await api.put<TarefaResponseDTO>(`/tarefas/${id}`, request);
  return response.data;
}

export async function deletarTarefa(id: number): Promise<void> {
  await api.delete(`/tarefas/${id}`);
}

// Listar usuários de um grupo
export async function listarUsuariosPorGrupo(
  grupoId: number
): Promise<UsuarioResponseDTO[]> {
  const response = await api.get<UsuarioResponseDTO[]>(
    `/usuarios/grupo/${grupoId}`
  );
  return response.data;
}

// Adicionar usuário a um grupo
export async function adicionarUsuarioAoGrupo(
  grupoId: number,
  data: AdicionarUsuarioGrupoRequest
): Promise<UsuarioResponseDTO> {
  const response = await api.post<UsuarioResponseDTO>(
    `/usuarios/grupo/${grupoId}`,
    data
  );
  return response.data;
}

// Remover usuário
export async function removerUsuarioDoGrupo(
  grupoId: number,
  usuarioId: number
): Promise<void> {
  const token = localStorage.getItem("token");
  if (!token) {
    throw new Error("Token de autenticação não encontrado.");
  }
  await api.delete(`/grupos/${grupoId}/usuarios/${usuarioId}`);
}

// Atualizar função do usuário
export async function atualizarFuncaoUsuario(
  usuarioId: number,
  funcao: string
): Promise<UsuarioResponseDTO> {
  const response = await api.patch<UsuarioResponseDTO>(
    `/usuarios/${usuarioId}/funcao`,
    null,
    { params: { funcao } }
  );
  return response.data;
}

export default api;
