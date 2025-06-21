"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function withAuth(Component: React.FC<any>) {
  return function ProtectedComponent(props: any) {
    const router = useRouter();
    const [isValid, setIsValid] = useState(false);

    useEffect(() => {
      const token = obterTokenValido();
      if (!token) {
        router.push("/login");
      } else {
        setIsValid(true);
      }
    }, []);

    if (!isValid) return null; // ou um spinner de carregamento

    return <Component {...props} />;
  };
}
