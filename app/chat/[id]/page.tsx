"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import SideBar from "@/app/components/SideBar";

type Msg = {
  role: string;
  content: string;
  created_at?: string;
};

export default function ChatPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const chatId = params.id;
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const mainRef = useRef<HTMLDivElement | null>(null);
  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwtToken") : null;

  useEffect(() => {
    if (!chatId) return;
    const fetchChat = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${chatId}`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );
        if (!res.ok) throw new Error("Erreur fetch chat");
        const data = await res.json();
        setMessages(
          data.messages.map((m: any) => ({
            role: m.role,
            content: m.content,
            created_at: m.created_at ?? new Date().toISOString(),
          }))
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        setTimeout(
          () =>
            mainRef.current?.scrollTo({
              top: mainRef.current.scrollHeight,
              behavior: "smooth",
            }),
          50
        );
      }
    };
    fetchChat();
  }, [chatId, token]);

  const formatTime = (dateStr?: string | number | Date) => {
    const d = dateStr ? new Date(dateStr) : new Date();
    return `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);
    const userMsg: Msg = {
      role: "user",
      content: input,
      created_at: new Date().toISOString(),
    };
    try {
      setMessages((m) => [...m, userMsg]);
      setInput("");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${chatId}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ message: userMsg.content }),
        }
      );
      const json = await res.json();
      const assistantText =
        json.assistant_response ??
        json.messages?.find((x: any) => x.role === "assistant")?.content;
      if (assistantText) {
        const assistantMsg: Msg = {
          role: "assistant",
          content: assistantText,
          created_at: new Date().toISOString(),
        };
        setMessages((m) => [...m, assistantMsg]);
      }
      setTimeout(
        () =>
          mainRef.current?.scrollTo({
            top: mainRef.current.scrollHeight,
            behavior: "smooth",
          }),
        50
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex min-h-screen bg-[#E5E5EF]">
      <aside
        className="hidden md:block"
        aria-label="Barre latérale de navigation"
      >
        <SideBar />
      </aside>

      <div className="flex-1 flex flex-col h-screen">
        <header className="flex items-center justify-start gap-4 px-4 md:px-6 py-4 bg-white border-b shadow-sm">
          <button
            onClick={() => router.push("/")}
            aria-label="Retour à l'accueil"
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#803CDA]"
          >
            <Image
              src="/images/icons/arrow-back.png"
              alt="Retour"
              width={24}
              height={24}
            />
          </button>

          <div className="text-left">
            <h1 className="text-black font-semibold text-base md:text-lg">
              {messages.length > 0
                ? `Discussion du ${new Intl.DateTimeFormat("fr-FR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                  }).format(
                    new Date(messages[messages.length - 1].created_at!)
                  )}`
                : "Nouvelle discussion"}
            </h1>
            <p className="text-xs md:text-sm text-[#717182]">
              Conversation active
            </p>
          </div>

          <button
            onClick={() => router.push("/generate-review")}
            aria-label="Générer une revue de presse"
            className="ml-auto flex items-center gap-3 bg-[#803CDA] text-white px-4 py-4 rounded-[10px] hover:bg-[#6d2cb8] transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-[#803CDA]"
          >
            <Image
              src="/images/icons/generate-reviews.png"
              alt="Icône générer revue de presse"
              width={12}
              height={12}
              className="object-contain"
            />
            <span className="font-medium text-white">
              Générer une revue de presse
            </span>
          </button>
        </header>

        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto px-4 md:px-6 pt-32 pb-10 bg-[#E5E5EF] flex flex-col justify-start"
          role="main"
          aria-label="Messages de la discussion"
        >
          <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto">
            {loading ? (
              <div className="text-center py-10">
                <div className="w-12 h-12 border-4 border-[#803CDA] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600">Chargement...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Aucun message pour le moment. Commencez la conversation !
              </div>
            ) : (
              messages.map((m: Msg, i: number) => (
                <div
                  key={i}
                  className={`flex items-start gap-3 md:gap-4 w-full ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {m.role === "assistant" && (
                    <div className="flex-shrink-0">
                      <Image
                        src="/images/icons/user-ia.png"
                        alt="IA"
                        width={36}
                        height={36}
                        className="w-8 h-8 md:w-9 md:h-9"
                      />
                    </div>
                  )}

                  <div
                    className={`px-4 py-3 rounded-[15px] max-w-[75%] md:max-w-[65%] text-sm leading-relaxed text-center ${
                      m.role === "user"
                        ? "bg-black text-white md:ml-20"
                        : "bg-[#ECEEF2] text-black shadow-sm md:mr-20"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words text-center">
                      {m.content}
                    </div>
                    <div className="mt-2 text-[11px] md:text-xs opacity-70 text-center">
                      {formatTime(m.created_at)}
                    </div>
                  </div>

                  {m.role === "user" && (
                    <div className="flex-shrink-0">
                      <Image
                        src="/images/icons/user-icon.png"
                        alt="Utilisateur"
                        width={36}
                        height={36}
                        className="w-8 h-8 md:w-9 md:h-9"
                      />
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </main>

        <footer className="bg-white p-3 md:p-4 flex items-center gap-3 border-t shadow-sm">
          <label htmlFor="chat-input" className="sr-only">
            Tapez votre message
          </label>
          <input
            id="chat-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Écrivez un message..."
            className="flex-1 px-4 py-3 rounded-[10px] bg-gray-100 border-none focus:outline-none focus:ring-2 focus:ring-[#803CDA] text-sm md:text-base"
            aria-label="Message"
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            aria-label="Envoyer le message"
            className="p-2 rounded focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
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
              className="w-10 h-10 md:w-11 md:h-11"
            />
          </button>
        </footer>
      </div>
    </div>
  );
}
