"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as api from "@/services/api";

export default function RegisterPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  function validarEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    if (!nome || !email || !senha) {
      setErro("Todos os campos são obrigatórios.");
      return;
    }

    if (!validarEmail(email)) {
      setErro("E-mail inválido.");
      return;
    }

    try {
      const { token } = await api.register(nome, email, senha);
      localStorage.setItem("token", token);
      router.push("/");
    } catch (e) {
      setErro("Erro ao registrar. Tente novamente.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {erro && <p className="text-red-600 text-sm">{erro}</p>}
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Criar Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister} className="space-y-4">
            <Input
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
            <Input
              placeholder="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              placeholder="Senha"
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <Button type="submit" className="w-full">
              Registrar
            </Button>
          </form>
          <p className="text-center text-sm">
            Já tem uma conta?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Entrar
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
