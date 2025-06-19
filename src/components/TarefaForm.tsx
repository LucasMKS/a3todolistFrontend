import { useState } from "react";
import { criarTarefa } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Importa StatusTarefa do seu arquivo de tipos (ajuste o caminho conforme seu projeto)
import { StatusTarefa } from "@/services/api";

interface TarefaFormProps {
  grupoId: number;
  onTarefaCriada: () => void;
  onClose: () => void;
}

export default function TarefaForm({
  grupoId,
  onTarefaCriada,
  onClose,
}: TarefaFormProps) {
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  // Aqui o estado tem o tipo StatusTarefa
  const [status, setStatus] = useState<StatusTarefa>("PENDENTE");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      await criarTarefa({ grupoId, titulo, descricao, status });
      setTitulo("");
      setDescricao("");
      setStatus("PENDENTE");
      onTarefaCriada();
      onClose();
    } catch (err) {
      console.error("Erro ao criar tarefa:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input
        placeholder="Título da tarefa"
        value={titulo}
        onChange={(e) => setTitulo(e.target.value)}
        required
      />
      <Textarea
        placeholder="Descrição (opcional)"
        value={descricao}
        onChange={(e) => setDescricao(e.target.value)}
      />
      <select
        value={status}
        onChange={(e) => setStatus(e.target.value as StatusTarefa)} // cast aqui
        className="w-full border rounded px-3 py-2"
      >
        <option value="PENDENTE">Pendente</option>
        <option value="EM_ANDAMENTO">Em andamento</option>
        <option value="CONCLUIDA">Concluída</option>
      </select>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Criar Tarefa"}
        </Button>
      </div>
    </form>
  );
}
