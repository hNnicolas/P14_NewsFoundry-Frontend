"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();

    if (!email || !password) {
      setError("Email et mot de passe requis");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Email ou mot de passe incorrect");
        setLoading(false);
        return;
      }

      localStorage.setItem("jwtToken", data.token);
      router.replace("/");
    } catch {
      setError("Erreur réseau, veuillez réessayer");
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      {/* Background full screen */}
      <Image
        src="/images/login-background.jpg"
        alt="background"
        fill
        className="object-cover z-0"
        priority
        unoptimized
      />

      {/* Form container */}
      <div
        className="bg-white shadow-xl p-10 w-[420px] relative z-10"
        style={{ borderRadius: "15px" }}
      >
        {/* Title + Logo */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-xl font-semibold text-purple-600">NEWSFOUNDRY</h1>
          <Image src="/images/logo.png" alt="logo" width={28} height={28} />
        </div>

        <p className="text-gray-500 text-sm mb-6 text-center">
          Connectez-vous pour accéder à votre assistant d’actualités IA
        </p>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="text-left">
            <label className="text-sm font-medium text-gray-700">
              Adresse email
            </label>
            <input
              type="email"
              name="email"
              placeholder="votre.email@exemple.com"
              className="w-full mt-1 p-3 border rounded-md bg-gray-50 outline-none focus:ring-2 focus:ring-purple-300 transition"
              required
            />
          </div>

          <div className="text-left">
            <label className="text-sm font-medium text-gray-700">
              Mot de passe
            </label>
            <input
              type="password"
              name="password"
              placeholder="Mot de passe"
              className="w-full mt-1 p-3 border rounded-md bg-gray-50 outline-none focus:ring-2 focus:ring-purple-300 transition"
              required
            />
          </div>

          {/* Bouton unique */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full h-12 relative ${
              loading ? "opacity-40 cursor-not-allowed" : ""
            }`}
          >
            <div
              className={`absolute inset-0 bg-center bg-contain bg-no-repeat transition-all duration-150 ${
                loading
                  ? "bg-[url('/images/login-button.png')]"
                  : "bg-[url('/images/login-button.png')] hover:bg-[url('/images/login-button-hover.png')]"
              }`}
            />
            <span className="sr-only">Se connecter</span>
          </button>
        </form>
      </div>
    </div>
  );
}
