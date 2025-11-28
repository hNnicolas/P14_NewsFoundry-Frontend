"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Sidebar from "@/app/components/sideBar";

type Msg = { role: string; content: string };

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

  // fetch chat
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
        setMessages(data.messages || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
        // scroll bottom
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
    try {
      // append locally optimistically
      const userMsg: Msg = { role: "user", content: input };
      setMessages((m) => [...m, userMsg]);
      setInput("");
      // POST to backend
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
      // backend returns assistant_response and messages potentially
      const assistantText =
        json.assistant_response ??
        json.messages?.find((x: any) => x.role === "assistant")?.content;
      if (assistantText) {
        setMessages((m) => [
          ...m,
          { role: "assistant", content: assistantText },
        ]);
      }
      // scroll bottom
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
      {/* Sidebar */}
      <aside
        className="hidden md:block"
        aria-label="Barre latérale de navigation"
        role="complementary"
      >
        <Sidebar />
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-4 md:px-6 py-4 bg-white border-b shadow-sm">
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

          <div className="text-center">
            <h1 className="text-black font-semibold text-base md:text-lg">
              Nouvelle discussion
            </h1>
            <p className="text-xs md:text-sm text-[#717182]">
              Conversation active
            </p>
          </div>

          <button
            onClick={() => router.push("/generate-review")}
            aria-label="Générer une revue de presse"
            className="p-2 rounded hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#803CDA]"
          >
            <Image
              src="/images/icons/generate-reviews.png"
              alt="Générer une revue de presse"
              width={120}
              height={44}
              className="h-10 w-auto"
            />
          </button>
        </header>

        {/* Messages area */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto px-4 md:px-6 py-6 bg-[#E5E5EF]"
          role="main"
          aria-label="Messages de la discussion"
        >
          <div className="flex flex-col gap-6 max-w-3xl mx-auto">
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
              messages.map((m: any, i: number) => (
                <div
                  key={i}
                  className={`flex items-end gap-3 md:gap-4 ${
                    m.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* IA icon left */}
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

                  {/* Bubble */}
                  <div
                    className={`px-4 py-3 rounded-[15px] max-w-[75%] md:max-w-[65%] text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-black text-white"
                        : "bg-white text-black shadow-sm"
                    }`}
                  >
                    <div className="whitespace-pre-wrap break-words">
                      {m.content}
                    </div>
                    <div className="mt-2 text-[11px] md:text-xs opacity-70">
                      {formatTime(m.created_at ?? m.time ?? undefined)}
                    </div>
                  </div>

                  {/* User icon right */}
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

        {/* Footer */}
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
