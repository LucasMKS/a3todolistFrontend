"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as api from "@/services/api";
import { motion } from "framer-motion"; // Import motion

export default function RegisterPage() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state for button
  const router = useRouter();

  function validarEmail(email: string) {
    return /\S+@\S+\.\S+/.test(email);
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setErro(""); // Clear previous errors
    setLoading(true); // Set loading true

    if (!nome || !email || !senha) {
      setErro("Todos os campos são obrigatórios.");
      setLoading(false);
      return;
    }

    if (!validarEmail(email)) {
      setErro("E-mail inválido.");
      setLoading(false);
      return;
    }

    try {
      await api.register(nome, email, senha);
      router.push("/"); // Redirect to home/dashboard after successful registration
    } catch (e: any) {
      setErro(
        e?.response?.data?.message || "Erro ao registrar. Tente novamente."
      );
    } finally {
      setLoading(false); // Set loading false
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      {" "}
      {/* Consistent gradient background */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-md p-6 sm:p-8 rounded-lg shadow-xl border border-gray-200">
          {" "}
          {/* Larger padding, stronger shadow, border */}
          <CardHeader className="pb-6">
            <CardTitle className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
              Criar Sua Conta
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleRegister} className="space-y-6">
              {" "}
              {/* Increased space */}
              <Input
                placeholder="Seu Nome Completo" // More descriptive placeholder
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                required
                className="p-3 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" // Styled input
              />
              <Input
                placeholder="Seu Email" // More descriptive placeholder
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="p-3 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" // Styled input
              />
              <Input
                placeholder="Crie uma Senha" // More descriptive placeholder
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
                className="p-3 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" // Styled input
              />
              {erro && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-sm font-medium text-center" // Redder, centered, medium font
                >
                  {erro}
                </motion.p>
              )}
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-lg font-semibold rounded-md transition-colors" // Stronger button
                disabled={loading} // Disable during loading
              >
                {loading ? "Registrando..." : "Registrar"}
              </Button>
            </form>
            <p className="text-center text-sm text-gray-600 mt-4">
              {" "}
              {/* Adjusted text color and margin */}
              Já tem uma conta?{" "}
              <a
                href="/login"
                className="text-indigo-600 hover:underline font-semibold"
              >
                {" "}
                {/* Indigo link, bolder */}
                Entrar
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
