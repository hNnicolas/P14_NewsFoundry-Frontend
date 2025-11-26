"use server";

import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  try {
    const email = formData.get("email")?.toString();
    const password = formData.get("password")?.toString();
    console.log("[loginAction] Email:", email);
    console.log("[loginAction] Password:", password ? "******" : "empty");

    if (!email || !password) {
      throw new Error("Email et mot de passe requis");
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    console.log("[loginAction] Backend URL:", backendUrl);

    if (!backendUrl) {
      throw new Error("La variable NEXT_PUBLIC_BACKEND_URL n'est pas définie.");
    }

    const res = await fetch(`${backendUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });

    console.log("[loginAction] fetch status:", res.status);

    let data;
    try {
      data = await res.json();
      console.log("[loginAction] Response JSON:", data);
    } catch (err) {
      console.error("[loginAction] Failed to parse JSON:", err);
      throw new Error("Erreur lors de la lecture de la réponse du backend");
    }

    if (!res.ok) {
      throw new Error(
        data.detail || data.error || "Erreur lors de la connexion"
      );
    }

    console.log("[loginAction] Token reçu:", data.token);

    // Stockage token côté client
    if (typeof window !== "undefined" && data.token) {
      localStorage.setItem("jwtToken", data.token);
    }

    redirect("/");
  } catch (err) {
    console.error("[loginAction] Erreur:", err);
    throw err;
  }
}
