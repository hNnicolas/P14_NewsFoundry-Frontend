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
  const chatId = params.id;

  const theme = searchParams.get("theme") ?? "Actualités";
  const weekNumber = getWeekNumber(new Date());

  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState<Review | null>(null);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [copyMessage, setCopyMessage] = useState("");

  const mainRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) router.replace("/login");
  }, [router]);

  const fetchReview = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${chatId}/press-review`,
        { headers: { Authorization: token ? `Bearer ${token}` : "" } }
      );

      if (!res.ok) {
        setReview(null);
        return;
      }

      const data = await res.json();
      setReview(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReview();
  }, [chatId]);

  const generateReview = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("jwtToken");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${chatId}/generate-press-review`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ theme }),
        }
      );

      if (!res.ok) throw new Error("Erreur génération");

      await fetchReview();
    } finally {
      setLoading(false);
    }
  };

  const handleCopyArticle = (article: Article) => {
    const text = `
ACTUALITÉS ${theme} – SEMAINE ${weekNumber}

${article.title}

${article.summary}
${article.url ? `\nSource : ${article.url}` : ""}
`.trim();

    navigator.clipboard.writeText(text);
    setCopyMessage(`Article « ${article.title} » copié`);
  };

  const sendMessage = async () => {
    if (!input.trim() || sending) return;
    setSending(true);

    try {
      const token = localStorage.getItem("jwtToken");

      await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${chatId}/messages`,
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
      router.push(`/chat/${chatId}`);
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
      <div className="flex flex-col items-center justify-center h-screen gap-6 bg-[#E5E5EF]">
        <p>Aucune revue de presse générée pour cette discussion.</p>
        <button
          onClick={generateReview}
          className="bg-[#803CDA] text-white px-6 py-3 rounded-lg"
        >
          Générer la revue de presse
        </button>
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
          <nav className="flex gap-3">
            <button
              onClick={() => router.push(`/chat/${chatId}`)}
              className="flex items-center gap-2 bg-[#E5E5EF] px-4 py-3 rounded-[10px]"
            >
              <Image
                src="/images/icons/chat.png"
                alt=""
                width={14}
                height={14}
              />
              <span>Chat</span>
            </button>

            <button
              disabled
              className="flex items-center gap-2 bg-[#803CDA] px-4 py-3 rounded-[10px]"
            >
              <Image
                src="/images/icons/generate-reviews.png"
                alt=""
                width={14}
                height={14}
              />
              <span className="text-white">Revue de presse</span>
            </button>
          </nav>
        </header>

        <main ref={mainRef} className="flex-1 overflow-y-auto px-6 py-10">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* TITRE + SYNTHÈSE */}
            <div className="bg-white rounded-xl p-6 shadow">
              <h1 className="text-2xl font-bold mb-4">{review.title}</h1>
              <p className="text-[#2E2F36] whitespace-pre-line">
                {review.summary}
              </p>
            </div>

            {/* AUCUN ARTICLE */}
            {review.articles.length === 0 && (
              <div className="bg-white rounded-xl p-6 shadow text-center">
                <p>Aucun article n’a pu être extrait pour cette revue.</p>
              </div>
            )}

            {/* ARTICLES */}
            {review.articles.map((article, idx) => (
              <article key={idx} className="bg-white rounded-xl p-6 shadow">
                <header className="flex justify-between mb-4">
                  <h2 className="text-sm font-semibold uppercase">
                    ACTUALITÉS {theme} – SEMAINE {weekNumber}
                  </h2>
                  <button
                    onClick={() => handleCopyArticle(article)}
                    className="bg-[#2E2F36] text-white px-4 py-2 rounded-md text-sm"
                  >
                    Copier
                  </button>
                </header>

                <h3 className="text-lg font-semibold mb-2">{article.title}</h3>

                <p className="text-[#2E2F36] whitespace-pre-line">
                  {article.summary}
                </p>
              </article>
            ))}
          </div>
        </main>

        <footer className="bg-white p-4 flex gap-3 border-t">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder="Écrivez un message..."
            className="flex-1 px-4 py-3 rounded-lg bg-gray-100"
          />
          <button onClick={sendMessage} disabled={!input.trim()}>
            <Image
              src="/images/icons/send-message-active.png"
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
