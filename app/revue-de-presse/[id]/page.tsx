"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SideBar from "@/app/components/SideBar";
import Image from "next/image";

type Article = {
  title: string;
  summary: string;
  url: string;
};

type Review = {
  title: string;
  summary: string;
  articles: Article[];
  additional_articles: Article[];
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

  const mainRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const fetchReview = async () => {
      try {
        setLoading(true);

        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("jwtToken")
            : null;

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${reviewId}/press-review`,
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : "",
            },
          }
        );

        if (!res.ok) throw new Error("Revue introuvable");

        const data = await res.json();

        setReview({
          title: data.title,
          summary: data.summary,
          articles: data.articles,
          additional_articles: data.additional_articles ?? [],
        });
      } catch (err) {
        console.error("Erreur chargement revue :", err);
        setReview(null);
      } finally {
        setLoading(false);
      }
    };

    fetchReview();
  }, [reviewId]);

  const theme = searchParams.get("theme") ?? "Votre thème";
  const weekNumber = getWeekNumber(new Date());

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
    } catch (err) {
      console.error("Erreur envoi message :", err);
      alert("Erreur lors de l'envoi du message.");
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#E5E5EF]">
        Chargement de la revue de presse…
      </div>
    );
  }

  if (!review) {
    return (
      <div
        className="flex items-center justify-center h-screen bg-[#E5E5EF]"
        role="alert"
        aria-live="polite"
      >
        Revue introuvable.
      </div>
    );
  }

  function formatReviewDate(date: Date): string {
    return new Intl.DateTimeFormat("fr-FR", {
      weekday: "long",
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  const handleCopy = () => {
    const textToCopy = `
ACTUALITÉS ${theme} – SEMAINE ${weekNumber}

${review.summary}

${review.articles
  .map(
    (a, i) => `${i + 1}. ${a.title}\n${a.summary}${a.url ? `\n${a.url}` : ""}`
  )
  .join("\n\n")}
    `.trim();

    navigator.clipboard.writeText(textToCopy);
  };

  return (
    <div className="flex min-h-screen bg-[#E5E5EF]">
      <aside className="hidden md:block">
        <SideBar />
      </aside>

      <div className="flex-1 flex flex-col h-screen">
        <header className="flex items-center px-6 py-4 bg-white border-b shadow-sm gap-3">
          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/chat/${reviewId}`)}
              className="flex items-center gap-2 bg-[#E5E5EF] px-4 py-3 rounded-[10px] hover:bg-gray-200"
            >
              <Image
                src="/images/icons/chat.png"
                alt=""
                width={14}
                height={14}
              />
              <span className="font-medium">Chat</span>
            </button>

            <button
              disabled
              className="flex items-center gap-2 bg-[#803CDA] px-4 py-3 rounded-[10px] cursor-not-allowed"
            >
              <Image
                src="/images/icons/generate-reviews.png"
                alt=""
                width={14}
                height={14}
              />
              <span className="font-medium text-white">Revue de presse</span>
            </button>
          </div>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto px-6 py-10">
          <div className="max-w-4xl mx-auto space-y-6">
            <article className="bg-white rounded-[14px] p-6 shadow">
              <div className="flex justify-between mb-6">
                <div>
                  <h2 className="text-sm font-semibold uppercase">
                    ACTUALITÉS {theme} – SEMAINE {weekNumber}
                  </h2>
                  <div className="flex items-center gap-2 text-sm mt-1">
                    <Image
                      src="/images/icons/calendar.png"
                      alt=""
                      width={14}
                      height={14}
                    />
                    <span>{formatReviewDate(new Date())}</span>
                  </div>
                </div>

                <button
                  onClick={handleCopy}
                  className="bg-[#2E2F36] text-white px-4 py-2 rounded-md"
                >
                  Copier
                </button>
              </div>

              <p className="mb-6 whitespace-pre-line">{review.summary}</p>

              {review.articles.map((article, idx) => (
                <div key={idx} className="mb-5">
                  <p className="font-semibold">{article.title}</p>
                  <p>{article.summary}</p>
                </div>
              ))}
            </article>

            {review.additional_articles?.length > 0 && (
              <article className="bg-white rounded-[14px] p-6 shadow">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-black mb-4">
                  AUTRES ARTICLES SUR LE THÈME
                </h3>

                <div className="space-y-5 text-sm text-[#2E2F36] leading-relaxed">
                  {review.additional_articles.map((article, idx) => (
                    <div key={idx}>
                      <p className="font-semibold">{article.title}</p>
                      <p>{article.summary}</p>

                      {article.url && (
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 text-sm hover:underline"
                        >
                          Lire la source
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </article>
            )}
          </div>
        </main>

        <footer className="bg-white p-4 flex gap-3 border-t">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Écrivez un message..."
            className="flex-1 px-4 py-3 rounded-[10px] bg-gray-100"
          />
          <button onClick={sendMessage} disabled={!input.trim() || sending}>
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
