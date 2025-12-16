"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SideBar from "@/components/SideBar";
import Image from "next/image";

type Article = {
  title: string;
  summary: string;
  url?: string;
};

type Review = {
  title: string;
  summary: string;
  articles: Article[];
};

function getWeekNumber(date: Date): number {
  const d = new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  );
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export default function PressReviewPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reviewId = params.id;

  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<Review | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");
  const [token, setToken] = useState<string | null>(null);

  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");

    if (!storedToken) {
      router.replace("/login");
      return;
    }

    setToken(storedToken);
  }, [router]);

  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");

    if (!storedToken) {
      router.replace("/login");
      return;
    }

    setToken(storedToken);
  }, [router]);

  const theme = searchParams.get("theme") ?? "Votre thème";
  const weekNumber = getWeekNumber(new Date());

  const formatReviewDate = (date: Date) =>
    new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

  const handleCopyArticle = (article: Article) => {
    const text = `
ACTUALITÉS ${theme} – SEMAINE ${weekNumber}

${article.title}

${article.summary}
${article.url ? `\nSource : ${article.url}` : ""}
    `.trim();

    navigator.clipboard.writeText(text);
    setCopyMessage(`Article « ${article.title} » copié dans le presse-papiers`);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);

    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${reviewId}/messages`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: input }),
        }
      );
      setInput("");
      router.push(`/chat/${reviewId}`);
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex items-center justify-center h-screen bg-[#E5E5EF]"
        role="status"
        aria-live="polite"
      >
        Chargement de la revue de presse…
      </div>
    );
  }

  if (!review) {
    return (
      <div
        className="flex items-center justify-center h-screen bg-[#E5E5EF]"
        role="alert"
      >
        Revue introuvable.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#E5E5EF]">
      <aside className="hidden md:block">
        <SideBar />
      </aside>

      <div className="flex-1 flex flex-col h-screen">
        <header className="flex items-center px-6 py-4 bg-white border-b shadow-sm gap-3">
          <nav className="flex gap-3" aria-label="Navigation principale">
            <button
              onClick={() => router.push(`/chat/${reviewId}`)}
              className="flex items-center gap-2 bg-[#E5E5EF] px-4 py-3 rounded-[10px] focus-visible:outline focus-visible:outline-2"
            >
              <Image
                src="/images/icons/chat.png"
                alt=""
                width={14}
                height={14}
              />
              <span className="font-medium text-gray-900">Chat</span>
            </button>

            <button
              disabled
              aria-current="page"
              className="flex items-center gap-2 bg-[#803CDA] px-4 py-3 rounded-[10px]"
            >
              <Image
                src="/images/icons/generate-reviews.png"
                alt=""
                width={14}
                height={14}
              />
              <span className="font-medium text-white">Revue de presse</span>
            </button>
          </nav>
        </header>

        <main
          ref={mainRef}
          role="main"
          className="flex-1 overflow-y-auto px-6 py-10"
        >
          <div className="max-w-4xl mx-auto space-y-8">
            <header>
              <h1 className="text-2xl font-semibold text-[#0a0a0a]">
                Revue de Presse
              </h1>
              <p className="text-sm mt-1 text-[#5b5c6d]">
                Consultez et gérez vos revues de presse générées par l'IA
              </p>
            </header>

            <div aria-live="polite" className="sr-only">
              {copyMessage}
            </div>

            <section className="space-y-6">
              {review.articles.map((article, idx) => (
                <article
                  key={idx}
                  tabIndex={0}
                  className="bg-white rounded-[14px] p-6 shadow focus-visible:outline focus-visible:outline-2"
                >
                  <header className="flex justify-between mb-6">
                    <div tabIndex={0}>
                      <h2 className="text-sm font-semibold uppercase">
                        ACTUALITÉS {theme} – SEMAINE {weekNumber}
                      </h2>

                      <div
                        tabIndex={0}
                        className="flex items-center gap-2 text-sm mt-1 text-[#5b5c6d]"
                      >
                        <Image
                          src="/images/icons/calendar.png"
                          alt=""
                          aria-hidden="true"
                          width={14}
                          height={14}
                        />
                        <span>{formatReviewDate(new Date())}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCopyArticle(article)}
                      className="bg-[#2E2F36] text-white px-4 py-2 rounded-md text-sm focus-visible:outline focus-visible:outline-2"
                      aria-label={`Copier l’article ${article.title}`}
                    >
                      Copier
                    </button>
                  </header>

                  <h3 tabIndex={0} className="text-lg font-semibold mb-3">
                    {article.title}
                  </h3>

                  <p
                    tabIndex={0}
                    className="text-[#2E2F36] leading-relaxed whitespace-pre-line"
                  >
                    {article.summary}
                  </p>
                </article>
              ))}
            </section>
          </div>
        </main>

        <footer className="bg-white p-4 flex gap-3 border-t">
          <label htmlFor="chat-message" className="sr-only">
            Message du chat
          </label>

          <input
            id="chat-message"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Écrivez un message..."
            className="flex-1 px-4 py-3 rounded-[10px] bg-gray-100 focus-visible:outline focus-visible:outline-2"
          />

          <button
            onClick={sendMessage}
            disabled={!input.trim() || sending}
            aria-label="Envoyer le message"
            className="focus-visible:outline focus-visible:outline-2"
          >
            <Image
              src={
                !input.trim() || sending
                  ? "/images/send-message.png"
                  : "/images/icons/send-message-active.png"
              }
              alt=""
              width={44}
              height={44}
            />
          </button>
        </footer>
      </div>
    </div>
  );
}
