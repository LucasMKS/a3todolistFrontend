"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import * as api from "@/services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const router = useRouter();

  const handleLogin = async () => {
    try {
      const { token } = await api.login(email, senha);
      localStorage.setItem("token", token);
      router.push("/");
    } catch (err: any) {
      setErro(err?.response?.data?.message || "Erro ao fazer login");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <Card className="w-full max-w-sm p-6">
        <CardHeader>
          <CardTitle className="text-center text-xl">Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            type="password"
            placeholder="Senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />
          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          <Button className="w-full" onClick={handleLogin}>
            Entrar
          </Button>
          <p className="text-center text-sm">
            Não possui conta?{" "}
            <a href="/registrar" className="text-blue-600 hover:underline">
              Registre-se
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
