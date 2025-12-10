"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import SideBar from "@/app/components/SideBar";
import Image from "next/image";

export default function PressReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const reviewId = params.id; // ID de la revue générée

  const [review, setReview] = useState<any>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);

  const mainRef = useRef<HTMLDivElement | null>(null);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null;

  // -----------------------------------------------------
  // Chargement de la revue générée
  // -----------------------------------------------------
  useEffect(() => {
    const fetchReview = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/press-reviews/${reviewId}`,
          {
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          }
        );

        const data = await res.json();
        setReview(data.review);
      } catch (err) {
        console.error("Erreur récupération revue :", err);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [reviewId, token]);

  // -----------------------------------------------------
  // Envoi d’un message → renvoie vers le chat
  // -----------------------------------------------------
  const sendMessage = async () => {
    if (!input.trim() || sending) return;

    setSending(true);

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${reviewId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ message: input }),
        }
      );

      setInput("");
      router.push(`/chat/${reviewId}`);
    } catch (err) {
      console.error("Erreur envoi message :", err);
    } finally {
      setSending(false);
    }
  };

  // -----------------------------------------------------
  // Fonction pour générer une revue (corrigée)
  // -----------------------------------------------------
  const handleGenerateReview = async (title: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${reviewId}/generate-press-review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ theme: title }),
        }
      );

      const data = await res.json();
      console.log("Revue de presse générée :", data.review);

      if (data.review?.id) {
        router.push(`/press-review/${data.review.id}`);
      }
    } catch (error) {
      console.error("Erreur génération revue :", error);
    }
  };

  // -----------------------------------------------------
  // Loading
  // -----------------------------------------------------
  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        Chargement…
      </div>
    );

  if (!review)
    return (
      <div className="flex items-center justify-center h-screen">
        Revue introuvable.
      </div>
    );

  return (
    <div className="flex min-h-screen bg-[#E5E5EF]">
      {/* ---- SIDEBAR ---- */}
      <aside className="hidden md:block">
        <SideBar />
      </aside>

      {/* ---- PAGE ---- */}
      <div className="flex-1 flex flex-col h-screen">
        {/* ---- HEADER ---- */}
        <header className="flex items-center px-6 py-4 bg-white border-b shadow-sm">
          {/* Retour */}
          <button
            onClick={() => router.push("/")}
            className="p-2 rounded hover:bg-gray-100 transition-colors"
          >
            <Image
              src="/images/icons/arrow-back.png"
              alt="Retour"
              width={24}
              height={24}
            />
          </button>

          {/* Info revue */}
          <div className="ml-4">
            <h1 className="text-black font-semibold text-lg">
              {review.press_review_title}
            </h1>
            <p className="text-sm text-[#717182]">Revue générée par l’IA</p>
          </div>

          {/* Bouton Chat */}
          <button
            onClick={() => router.push(`/chat/${reviewId}`)}
            className="ml-auto flex items-center gap-3 bg-black text-white px-4 py-3 rounded-[10px] hover:bg-gray-900 transition-colors shadow-sm"
          >
            <Image
              src="/images/icons/chat.png"
              alt="Chat"
              width={14}
              height={14}
            />
            <span className="font-medium">Chat</span>
          </button>
        </header>

        {/* ---- CONTENU ---- */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto px-6 py-10 bg-[#E5E5EF]"
        >
          <div className="bg-white p-8 rounded-[10px] shadow max-w-3xl mx-auto">
            <h2 className="font-semibold text-xl mb-4">
              {review.press_review_title}
            </h2>

            {/* Résumé */}
            <p className="text-[#717182] mb-6">{review.press_review_summary}</p>

            {/* Articles */}
            <div className="whitespace-pre-wrap leading-relaxed text-black">
              {review.press_review_articles}
            </div>
          </div>
        </main>

        {/* ---- FOOTER : DISCUSSION ---- */}
        <footer className="bg-white p-3 md:p-4 flex items-center gap-3 border-t shadow-sm">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrivez un message..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="flex-1 px-4 py-3 rounded-[10px] bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-black text-sm md:text-base"
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            className="p-2 rounded focus:outline-none disabled:opacity-50 transition-opacity"
          >
            <Image
              src={
                !input.trim() || sending
                  ? "/images/send-message.png"
                  : "/images/icons/send-message-active.png"
              }
              alt="Envoyer"
              width={44}
              height={44}
            />
          </button>
        </footer>
      </div>
    </div>
  );
}
