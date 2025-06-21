"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import * as api from "@/services/api";
import { motion } from "framer-motion"; // Import motion

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false); // Add loading state for button
  const router = useRouter();

  const handleLogin = async () => {
    setErro(""); // Clear previous errors
    setLoading(true); // Set loading true
    try {
      await api.login(email, senha);
      router.push("/");
    } catch (err: any) {
      setErro(
        err?.response?.data?.message ||
          "Erro ao fazer login. Verifique suas credenciais."
      );
    } finally {
      setLoading(false); // Set loading false
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 p-4">
      {" "}
      {/* Consistent gradient background */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="w-full max-w-sm p-6 sm:p-8 rounded-lg shadow-xl border border-gray-200">
          {" "}
          {/* Larger padding, stronger shadow, border */}
          <CardHeader className="pb-6">
            {" "}
            {/* Increased padding bottom */}
            <CardTitle className="text-center text-3xl font-extrabold text-gray-900 tracking-tight">
              {" "}
              {/* Larger, bolder title */}
              Bem-vindo de volta!
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {" "}
            {/* Increased space */}
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="p-3 text-base border-gray-300 focus:border-indigo-500 focus:ring-indigo-500" // Styled input
            />
            <Input
              type="password"
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
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
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 text-lg font-semibold rounded-md transition-colors" // Stronger button
              onClick={handleLogin}
              disabled={loading} // Disable during loading
            >
              {loading ? "Entrando..." : "Entrar"}
            </Button>
            <p className="text-center text-sm text-gray-600 mt-4">
              {" "}
              {/* Adjusted text color and margin */}
              Não possui conta?{" "}
              <a
                href="/registrar"
                className="text-indigo-600 hover:underline font-semibold"
              >
                {" "}
                {/* Indigo link, bolder */}
                Registre-se
              </a>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
