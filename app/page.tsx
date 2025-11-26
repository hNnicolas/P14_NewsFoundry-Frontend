"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Vérifie si l’utilisateur est connecté
    const token = localStorage.getItem("token"); // ou autre méthode
    if (!token) {
      router.replace("/login"); // redirection vers login
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Bienvenue sur NEWSFOUNDRY</h1>
    </div>
  );
}
