"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SideBar from "@/components/SideBar";

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const isDisabled = !message.trim();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");

    if (!storedToken) {
      router.replace("/login");
      return;
    }

    setToken(storedToken);
    setIsLoading(false);
  }, [router]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    setSending(true);

    try {
      setMessage("");
      inputRef.current?.focus();
    } catch (err) {
      console.error("Erreur en envoyant le message", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
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
      <aside
        className="hidden md:block"
        aria-label="Barre latérale de navigation"
        role="complementary"
        tabIndex={0}
      >
        <SideBar />
      </aside>

      <div className="flex-1 flex flex-col">
        <nav
          className="bg-white px-4 md:px-6 py-3 flex items-center gap-3 md:gap-4 shadow-sm"
          role="navigation"
          aria-label="Navigation principale"
        >
          <div className="flex gap-2 items-center">
            <button
              onClick={async () => {
                try {
                  const token = localStorage.getItem("jwtToken");
                  if (!token) {
                    console.error("❌ Aucun token JWT trouvé !");
                    return;
                  }

                  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
                  if (!backendUrl) {
                    console.error("❌ NEXT_PUBLIC_BACKEND_URL non défini !");
                    return;
                  }

                  const res = await fetch(`${backendUrl}/chats`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ message: "Bonjour !" }),
                  });

                  const text = await res.text();

                  if (!res.ok) {
                    console.error("❌ Backend error :", res.status, text);
                    return;
                  }

                  const data = JSON.parse(text);

                  if (data.chat_id) {
                    router.push(`/chat/${data.chat_id}`);
                  } else {
                    console.error("❌ Pas de chat_id dans la réponse !");
                  }
                } catch (err) {
                  console.error("Erreur création chat :", err);
                }
              }}
              className="transition-transform hover:scale-105 active:scale-95 rounded-[10px] p-2 focus:outline-none focus:ring-2 focus:ring-[#803CDA]"
              tabIndex={0}
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
              disabled
              tabIndex={-1}
              aria-disabled="true"
              aria-label="Revue de presse (indisponible)"
              title="Revue de presse indisponible"
              className="
    bg-[#F5F5F7]
    rounded-[15px]
    opacity-50
    cursor-not-allowed
    focus:outline-none
  "
            >
              <Image
                src="/images/button-news.png"
                alt="Revue de presse indisponible"
                width={120}
                height={44}
                className="h-10 w-auto grayscale"
                priority
              />
            </button>
          </div>
        </nav>

        <main
          className="flex-1 flex items-center justify-center p-4 md:p-6 overflow-y-auto"
          role="main"
          aria-labelledby="main-title"
          tabIndex={-1}
        >
          <div
            className="bg-white rounded-[15px] shadow-lg p-6 md:p-10 max-w-lg w-auto text-center"
            tabIndex={0}
          >
            <div
              className="mb-6 flex justify-center"
              tabIndex={0}
              aria-label="Logo de l'assistant"
            >
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ minWidth: 80, minHeight: 80 }}
              >
                <Image
                  src="/images/logo.png"
                  alt="Logo de l'assistant"
                  width={60}
                  height={60}
                  className="object-contain"
                />
              </div>
            </div>

            <h1
              id="main-title"
              className="text-2xl md:text-3xl mb-8"
              style={{ color: "#803CDA" }}
              tabIndex={0}
            >
              Assistant Revue de Presse IA
            </h1>

            <p
              className="text-[#717182] mb-6 leading-relaxed text-sm md:text-base"
              tabIndex={0}
            >
              Posez-moi des questions sur l'actualité récente ou demandez-moi de
              générer une revue de presse sur un sujet spécifique.
            </p>

            <section
              aria-labelledby="examples-title"
              className="mx-auto text-center"
              role="region"
              tabIndex={0}
            >
              <h2
                id="examples-title"
                className="font-semibold text-gray-700 mb-2 text-sm md:text-base text-center"
                tabIndex={0}
              >
                Exemples :
              </h2>

              <ul className="space-y-3 inline-block text-left" role="list">
                <li
                  className="flex items-center gap-3"
                  role="listitem"
                  tabIndex={0}
                >
                  <span className="text-[#803CDA]" aria-hidden="true">
                    •
                  </span>
                  <span className="text-gray-600 text-sm md:text-base">
                    "Quelles sont les dernières nouvelles en politique ?"
                  </span>
                </li>

                <li
                  className="flex items-center gap-3"
                  role="listitem"
                  tabIndex={0}
                >
                  <span className="text-[#803CDA]" aria-hidden="true">
                    •
                  </span>
                  <span className="text-gray-600 text-sm md:text-base">
                    "Génère une revue de presse sur la technologie"
                  </span>
                </li>

                <li
                  className="flex items-center gap-3"
                  role="listitem"
                  tabIndex={0}
                >
                  <span className="text-[#803CDA]" aria-hidden="true">
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
              onClick={async () => {
                if (!message.trim()) return;

                try {
                  const token = localStorage.getItem("jwtToken");
                  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;
                  if (!token || !backendUrl) return;

                  // Appel top-news
                  const res = await fetch(`${backendUrl}/top-news`, {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ user_message: message }),
                  });

                  if (!res.ok) {
                    console.error("❌ Erreur top-news:", await res.text());
                    return;
                  }

                  const data = await res.json();

                  // 🔹 Redirection vers le chat créé
                  if (data.chat_id) {
                    router.push(`/chat/${data.chat_id}`);
                  } else {
                    console.error("❌ chat_id manquant dans la réponse");
                  }
                } catch (err) {
                  console.error("❌ Erreur bouton Revue de presse :", err);
                }
              }}
              disabled={!message.trim()}
              aria-label="Générer une revue de presse"
              title="Revue de presse"
              className="
    p-2 rounded
    focus:outline-none
    focus:ring-2 focus:ring-[#803CDA]
    disabled:opacity-50
    disabled:cursor-not-allowed
    transition-opacity
  "
            >
              <Image
                src={
                  !message.trim()
                    ? "/images/send-message.png"
                    : "/images/icons/send-message-active.png"
                }
                alt=""
                aria-hidden="true"
                width={44}
                height={44}
                className="w-10 h-10 md:w-11 md:h-11"
              />
            </button>
          </form>
        </footer>
      </div>
    </div>
  );
}
