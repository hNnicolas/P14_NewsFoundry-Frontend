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
  console.log("URL backend utilisée :", process.env.NEXT_PUBLIC_BACKEND_URL);

  const router = useRouter();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [selectedDiscussion, setSelectedDiscussion] =
    useState<DiscussionWithUsername | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  useEffect(() => {
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      if (!response.ok)
        throw new Error("Erreur lors de la récupération des discussions");

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
      console.error("Erreur lors du chargement des discussions:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    router.push("/login");
  };

  const handleDiscussionClick = async (chat_id: number) => {
    setIsLoadingMessages(true);
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${chat_id}`,
        {
          headers: { Authorization: token ? `Bearer ${token}` : "" },
        }
      );
      if (!response.ok) throw new Error("Impossible de récupérer le chat");

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

  // Sidebar.tsx — remplace la fonction sendMessage par celle-ci
  const sendMessage = async (messageContent: string) => {
    if (!selectedDiscussion) return;

    // 1) mise à jour optimiste : ajoute le message utilisateur immédiatement
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
      const token = localStorage.getItem("jwtToken");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/chats/${selectedDiscussion.chat_id}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
          body: JSON.stringify({ message: messageContent }),
        }
      );

      // Log complet de la réponse pour debug
      console.log("sendMessage: response status", res.status, res.statusText);

      const data = await res.json().catch((err) => {
        console.error("Erreur JSON parse:", err);
        return null;
      });

      console.log("sendMessage: body from server:", data);

      if (!res.ok) {
        // Si erreur, on peut afficher un message d'erreur et revenir en arrière
        console.error("Erreur lors de l'envoi du message:", data);
        // Ici on ne remplace pas l'état, ou tu peux retirer le message optimiste si tu veux
        return;
      }

      // Si le serveur renvoie le tableau complet de messages -> on le remplace
      if (data?.messages && Array.isArray(data.messages)) {
        // Assure-toi que messages sont objets {role, content}
        setSelectedDiscussion((prev) =>
          prev ? { ...prev, messages: data.messages } : prev
        );
        return;
      }

      // Sinon, si le serveur renvoie assistant_response, on l'ajoute
      const assistantText = data?.assistant_response;
      if (assistantText) {
        setSelectedDiscussion((prev) =>
          prev
            ? {
                ...prev,
                messages: [
                  ...prev.messages,
                  { role: "assistant", content: assistantText },
                ],
              }
            : prev
        );
      }
    } catch (err) {
      console.error("Erreur lors de l'envoi du message (fetch):", err);
    }
  };

  return (
    <div className="flex h-screen">
      <aside
        className="w-72 border-r border-gray-200 flex flex-col"
        style={{ backgroundColor: "#FBFBFC" }}
      >
        {" "}
        <div className="p-6 border-b border-gray-200">
          <h1
            className="text-xl font-bold flex items-center gap-2"
            style={{ color: "#803CDA" }}
          >
            NEWSFOUNDRY{" "}
            <Image
              src="/images/logo.png"
              alt="Logo Robot de Newsfoundry"
              width={22}
              height={22}
            />{" "}
          </h1>{" "}
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
                className="px-6 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
              >
                <p className="font-medium text-sm" style={{ color: "#2A2A31" }}>
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
            className="flex items-center gap-3 text-gray-600 hover:text-gray-800 transition-colors w-full text-left"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            <span className="text-sm">Se déconnecter</span>
          </button>
        </div>
      </aside>

      <DiscussionModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          selectedDiscussion
            ? selectedDiscussion.title === "Nouvelle conversation" ||
              selectedDiscussion.title === "Discussion"
              ? `Discussion du ${formatDiscussionDate(selectedDiscussion)}`
              : selectedDiscussion.title
            : ""
        }
        messages={selectedDiscussion?.messages || []}
        onSendMessage={sendMessage}
      />
    </div>
  );
}
