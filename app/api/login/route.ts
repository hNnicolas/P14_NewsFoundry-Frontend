import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    // Récupération du corps de la requête
    const { email, password } = await req.json();
    console.log("[API LOGIN] Received request", {
      email,
      password: password ? "*****" : null,
    });
    console.log({ email, password });

    if (!email || !password) {
      console.log("[API LOGIN] Missing credentials");
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
    if (!backendUrl) {
      console.log("[API LOGIN] Backend URL not defined");
      return NextResponse.json(
        { error: "NEXT_PUBLIC_BACKEND_URL n'est pas défini" },
        { status: 500 }
      );
    }

    const res = await fetch(`${backendUrl}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    let data: any;
    try {
      data = await res.json();
    } catch (err) {
      console.error("[API LOGIN] Failed to parse JSON from backend:", err);
      const text = await res.text();
      console.log("[API LOGIN] Raw backend response:", text);
      return NextResponse.json(
        { error: "Backend returned invalid JSON", raw: text },
        { status: 502 }
      );
    }

    console.log("[API LOGIN] Backend response data:", data);

    if (!res.ok) {
      return NextResponse.json(
        {
          error: data.error || data.detail || "Email ou mot de passe incorrect",
        },
        { status: res.status }
      );
    }

    // Retourne le token pour le frontend
    return NextResponse.json(data);
  } catch (err: any) {
    console.error("[API LOGIN] Error:", err);
    return NextResponse.json(
      { error: err.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
