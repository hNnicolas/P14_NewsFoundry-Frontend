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

export default function Sidebar() {
  const router = useRouter();

  const [token, setToken] = useState<string | null>(null);

  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] =
    useState<DiscussionWithUsername | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  /* ============================
     Récupération sécurisée du token
     ============================ */
  useEffect(() => {
    const storedToken = localStorage.getItem("jwtToken");

    if (!storedToken) {
      router.replace("/login");
      return;
    }

    setToken(storedToken);
  }, [router]);

  /* ============================
     Chargement des discussions
     ============================ */
  useEffect(() => {
    if (!token) return;

    const fetchDiscussions = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des discussions");
        }

        const data = await response.json();

        const chats: Discussion[] = data.map((chat: any) => ({
          chat_id: chat.chat_id,
          title: chat.title,
          messages: chat.messages,
          created_at: chat.created_at ?? null,
          updated_at: chat.updated_at ?? null,
        }));

        setDiscussions(chats);
      } catch (error) {
        console.error("Erreur chargement discussions :", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDiscussions();
  }, [token]);

  /* ============================
     Logout
     ============================ */
  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    router.push("/login");
  };

  /* ============================
     Ouverture d’une discussion
     ============================ */
  const handleDiscussionClick = async (chat_id: number) => {
    if (!token) return;

    setIsLoadingMessages(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${chat_id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Impossible de récupérer le chat");
      }

      const data: Discussion = await response.json();

      const messagesWithUsernames: Message[] = data.messages.map((msg) => ({
        ...msg,
        username: msg.role === "user" ? "Vous" : "Assistant",
      }));

      setSelectedDiscussion({ ...data, messages: messagesWithUsernames });
      setModalOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingMessages(false);
    }
  };

  /* ============================
     Format date
     ============================ */
  const formatDiscussionDate = (discussion: Discussion) => {
    const dateStr = discussion.updated_at || discussion.created_at;

    return dateStr
      ? new Intl.DateTimeFormat("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }).format(new Date(dateStr))
      : "Date inconnue";
  };

  /* ============================
     Envoi d’un message
     ============================ */
  const sendMessage = async (messageContent: string) => {
    if (!selectedDiscussion || !token) return;

    // Optimistic UI
    setSelectedDiscussion((prev) =>
      prev
        ? {
            ...prev,
            messages: [
              ...prev.messages,
              { role: "user", content: messageContent },
            ],
          }
        : prev
    );

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${selectedDiscussion.chat_id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ message: messageContent }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        console.error("Erreur API :", data);
        return;
      }

      if (data?.assistant_response) {
        setSelectedDiscussion((prev) =>
          prev
            ? {
                ...prev,
                messages: [
                  ...prev.messages,
                  { role: "assistant", content: data.assistant_response },
                ],
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Erreur envoi message :", err);
    }
  };

  /* ============================
     RENDER
     ============================ */
  return (
    <div className="flex h-screen">
      <aside
        className="w-72 border-r border-gray-200 flex flex-col"
        style={{ backgroundColor: "#FBFBFC" }}
      >
        <div className="p-6 border-b border-gray-200">
          <h1
            className="text-xl font-bold flex items-center gap-2"
            style={{ color: "#803CDA" }}
          >
            NEWSFOUNDRY
            <Image
              src="/images/logo.png"
              alt="Logo Robot de Newsfoundry"
              width={22}
              height={22}
            />
          </h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="w-8 h-8 border-2 border-[#803CDA] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : discussions.length > 0 ? (
            discussions.map((discussion) => (
              <div
                key={discussion.chat_id}
                onClick={() => handleDiscussionClick(discussion.chat_id)}
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
              >
                <p className="font-medium text-sm text-[#2A2A31]">
                  {discussion.title &&
                  discussion.title !== "Nouvelle conversation" &&
                  discussion.title !== "Discussion"
                    ? discussion.title
                    : "Discussion du"}
                </p>

                <p className="text-[#717182] text-xs mt-1">
                  {formatDiscussionDate(discussion)}
                </p>
              </div>
            ))
          ) : (
            <div className="px-6 py-8 text-center text-gray-500 text-sm">
              Aucune discussion pour le moment
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 text-gray-600 hover:text-gray-800 w-full text-left"
          >
            <span className="text-sm">Se déconnecter</span>
          </button>
        </div>
      </aside>

      {selectedDiscussion && (
        <DiscussionModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={
            selectedDiscussion.title === "Nouvelle conversation" ||
            selectedDiscussion.title === "Discussion"
              ? `Discussion du ${formatDiscussionDate(selectedDiscussion)}`
              : selectedDiscussion.title
          }
          messages={selectedDiscussion.messages}
          chatId={selectedDiscussion.chat_id}
          onSendMessage={sendMessage}
        />
      )}
    </div>
  );
}
