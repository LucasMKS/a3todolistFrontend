"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { LogOut, Home, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Navbar() {
  const router = useRouter();

  function handleLogout() {
    localStorage.removeItem("token");
    router.push("/login");
  }

  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-indigo-800 text-white shadow-lg sticky top-0 z-50">
      {" "}
      {/* Changed background to a solid darker indigo */}
      <Link href="/" className="flex items-center gap-2 group">
        <Home className="h-6 w-6 text-white group-hover:text-indigo-200 transition-colors" />{" "}
        {/* Lighter hover color */}
        <h1 className="text-2xl font-extrabold tracking-tight group-hover:text-indigo-200 transition-colors">
          {" "}
          {/* Lighter hover color */}
          TaskFlow
        </h1>
      </Link>
      <div className="flex items-center space-x-4">
        {/* Botão "Sair" */}
        <Button
          variant="ghost"
          className="text-white hover:bg-white hover:bg-opacity-20 transition-colors duration-200 flex items-center gap-2 rounded-full px-4 py-2" // Added rounded-full and more padding
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </nav>
  );
}
