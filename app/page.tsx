"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Sidebar from "@/app/components/sideBar";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    // Vérifie si l'utilisateur est connecté
    const token =
      typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null;
    if (!token) {
      router.replace("/login");
    } else {
      setIsLoading(false);
    }
  }, [router]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);

    try {
      // TODO: appeler ton backend, ex:
      // const res = await fetch("/api/chats", { method: "POST", ... })
      console.log("Message envoyé:", message);

      // Réinitialise l'input
      setMessage("");
      // remet le focus sur l'input pour une saisie continue
      inputRef.current?.focus();
    } catch (err) {
      console.error("Erreur en envoyant le message", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Enter envoie le message (sans shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  if (isLoading) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-[#E5E5EF] p-4"
        role="status"
        aria-live="polite"
      >
        <div className="text-center">
          <div
            className="w-16 h-16 border-4 border-[#803CDA] border-t-transparent rounded-full animate-spin mx-auto mb-4"
            aria-hidden="true"
          />
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#E5E5EF]">
      {/* Sidebar - Menu à gauche (caché sur mobile) */}
      <aside
        className="hidden md:block"
        aria-label="Barre latérale de navigation"
        role="complementary"
      >
        <Sidebar />
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        {/* Navigation avec les 2 boutons */}
        <nav
          className="bg-white px-4 md:px-6 py-3 flex items-center gap-3 md:gap-4 shadow-sm"
          role="navigation"
          aria-label="Navigation principale"
        >
          <div className="flex gap-2 items-center">
            <button
              className="transition-transform hover:scale-105 active:scale-95 rounded-[10px] p-2 focus:outline-none focus:ring-2 focus:ring-[#803CDA]"
              aria-label="Ouvrir le chat"
              title="Chat"
            >
              <Image
                src="/images/button-chat.png"
                alt="Chat"
                width={120}
                height={44}
                className="h-10 w-auto"
                priority
              />
            </button>

            <button
              className="transition-transform hover:scale-105 active:scale-95 bg-[#F5F5F7] rounded-[15px] p-2 focus:outline-none focus:ring-2 focus:ring-[#803CDA]"
              aria-label="Revue de presse"
              title="Revue de presse"
            >
              <Image
                src="/images/button-news.png"
                alt="Revue de presse"
                width={120}
                height={44}
                className="h-10 w-auto"
                priority
              />
            </button>
          </div>
        </nav>

        {/* Zone principale avec la carte centrée */}
        <main
          className="flex-1 flex items-center justify-center p-4 md:p-6 overflow-y-auto"
          role="main"
          aria-labelledby="main-title"
        >
          <div className="bg-white rounded-3xl shadow-lg p-6 md:p-10 max-w-3xl w-full text-center">
            {/* Logo robot — décoratif si image pure, ajouter aria-hidden si non nécessaire */}
            <div className="mb-6 flex justify-center" aria-hidden="true">
              <div
                className="w-20 h-20 bg-[#803CDA] rounded-2xl flex items-center justify-center"
                style={{ minWidth: 80, minHeight: 80 }}
              >
                <Image
                  src="/images/logo.png"
                  alt="Logo de l'assistant"
                  width={50}
                  height={50}
                  className="object-contain"
                />
              </div>
            </div>

            <h1
              id="main-title"
              className="text-2xl md:text-3xl font-bold mb-4"
              style={{ color: "#803CDA" }}
            >
              Assistant Revue de Presse IA
            </h1>

            <p className="text-[#717182] mb-6 leading-relaxed text-sm md:text-base">
              Posez-moi des questions sur l'actualité récente ou demandez-moi de
              générer une revue de presse sur un sujet spécifique.
            </p>

            <section
              aria-labelledby="examples-title"
              className="text-left mx-auto max-w-xl"
            >
              <h2
                id="examples-title"
                className="font-semibold text-gray-700 mb-4 text-sm md:text-base"
              >
                Exemples :
              </h2>

              <ul className="space-y-3" role="list">
                <li className="flex items-start gap-3" role="listitem">
                  <span
                    className="text-[#803CDA] mt-1"
                    aria-hidden="true"
                    style={{ lineHeight: 0 }}
                  >
                    •
                  </span>
                  <span className="text-gray-600 text-sm md:text-base">
                    "Quelles sont les dernières nouvelles en politique ?"
                  </span>
                </li>

                <li className="flex items-start gap-3" role="listitem">
                  <span className="text-[#803CDA] mt-1" aria-hidden="true">
                    •
                  </span>
                  <span className="text-gray-600 text-sm md:text-base">
                    "Génère une revue de presse sur la technologie"
                  </span>
                </li>

                <li className="flex items-start gap-3" role="listitem">
                  <span className="text-[#803CDA] mt-1" aria-hidden="true">
                    •
                  </span>
                  <span className="text-gray-600 text-sm md:text-base">
                    "Résume l'actualité économique de la semaine"
                  </span>
                </li>
              </ul>
            </section>
          </div>
        </main>

        {/* Zone de saisie en bas */}
        <footer
          className="bg-white border-t border-gray-200 px-4 md:px-6 py-3"
          role="contentinfo"
          aria-label="Zone d'envoi de message"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="max-w-4xl mx-auto flex gap-3"
            role="search"
            aria-label="Envoyer un message au chatbot"
          >
            <label htmlFor="chat-input" className="sr-only">
              Tapez votre message
            </label>

            <input
              id="chat-input"
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tapez votre message ici..."
              aria-label="Message"
              className="flex-1 px-4 py-3 bg-gray-100 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#803CDA] text-gray-700 text-sm md:text-base"
            />

            <button
              type="submit"
              onClick={(e) => {
                // Le submit gère l'envoi aussi.
                if ((e as any).target instanceof HTMLButtonElement) {
                  // nothing special
                }
              }}
              disabled={!message.trim() || sending}
              aria-disabled={!message.trim() || sending}
              aria-label="Envoyer le message"
              className="inline-flex items-center justify-center bg-[#803CDA] hover:bg-[#6d32b8] disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-3 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#803CDA]"
            >
              {/* Icon accessible */}
              <svg
                className="w-5 h-5 md:w-6 md:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              <span className="sr-only">Envoyer</span>
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}
