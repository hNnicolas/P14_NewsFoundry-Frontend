"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import DiscussionModal from "./DiscussionModal";

type Message = {
  role: "user" | "assistant";
  content: string;
  username?: string;
};

type Discussion = {
  chat_id: number;
  title: string;
  messages: Message[];
  created_at: string | null;
  updated_at: string | null;
};

type DiscussionWithUsername = Discussion & { messages: Message[] };

export default function SideBar() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] =
    useState<DiscussionWithUsername | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");
    if (!storedToken) {
      router.replace("/login");
      return;
    }
    setToken(storedToken);
  }, [router]);

  useEffect(() => {
    if (!token) return;

    const fetchDiscussions = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        if (!res.ok) throw new Error();

        const data = await res.json();
        setDiscussions(data);
      } catch (err) {
        console.error("Erreur chargement discussions", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscussions();
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    router.push("/login");
  };

  const openDiscussion = async (chat_id: number) => {
    if (!token) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${chat_id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!res.ok) throw new Error();

      const data: Discussion = await res.json();

      setSelectedDiscussion({
        ...data,
        messages: data.messages.map((m) => ({
          ...m,
          username: m.role === "user" ? "Vous" : "Assistant",
        })),
      });

      setModalOpen(true);
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (d: Discussion) =>
    new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(d.updated_at || d.created_at || Date.now()));

  return (
    <aside
      className="w-72 border-r border-gray-200 flex flex-col h-screen"
      style={{ backgroundColor: "#FBFBFC" }}
      role="navigation"
      aria-label="Historique des discussions"
    >
      <header className="p-6 border-b border-gray-200">
        <h1
          className="text-xl font-bold flex items-center gap-2"
          style={{ color: "#803CDA" }}
          tabIndex={0}
        >
          NEWSFOUNDRY
          <Image src="/images/logo.png" alt="" width={22} height={22} />
        </h1>
      </header>

      <nav
        className="flex-1 overflow-y-auto"
        aria-label="Liste des discussions"
      >
        {isLoading ? (
          <div className="flex justify-center py-8" role="status">
            <div className="w-8 h-8 border-2 border-[#803CDA] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : discussions.length > 0 ? (
          <ul role="list">
            {discussions.map((discussion) => (
              <li key={discussion.chat_id}>
                <button
                  onClick={() => openDiscussion(discussion.chat_id)}
                  className="
                    w-full text-left px-6 py-4 border-b border-gray-100
                    hover:bg-gray-50
                    focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#803CDA]
                  "
                  aria-label={`Ouvrir la discussion ${discussion.title}`}
                >
                  <p className="font-medium text-sm text-[#2A2A31]">
                    {discussion.title || "Discussion"}
                  </p>
                  <p className="text-xs text-[#717182] mt-1">
                    {formatDate(discussion)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="px-6 py-8 text-center text-gray-500 text-sm">
            Aucune discussion pour le moment
          </p>
        )}
      </nav>

      {/* FOOTER */}
      <footer className="p-6 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="
            w-full text-left text-sm text-gray-600
            hover:text-gray-800
            focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#803CDA]
          "
        >
          Se déconnecter
        </button>
      </footer>

      {selectedDiscussion && (
        <DiscussionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={selectedDiscussion.title}
          messages={selectedDiscussion.messages}
          chatId={selectedDiscussion.chat_id}
          onSendMessage={() => {}}
        />
      )}
    </aside>
  );
}
