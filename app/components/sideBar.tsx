"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

type Discussion = {
  id: string;
  title: string;
  date: string;
};

export default function Sidebar() {
  const router = useRouter();
  const [discussions, setDiscussions] = useState<Discussion[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Charger les discussions depuis le backend
    fetchDiscussions();
  }, []);

  const fetchDiscussions = async () => {
    try {
      const token = localStorage.getItem("token");

      // TODO: Remplacer par votre endpoint backend Python
      // const response = await fetch('http://votre-backend/api/discussions', {
      //   headers: {
      //     'Authorization': `Bearer ${token}`
      //   }
      // });
      // const data = await response.json();
      // setDiscussions(data);

      // Données mock en attendant
      setDiscussions([
        { id: "1", title: "Discussion du", date: "10/12/2026" },
        { id: "2", title: "Discussion du", date: "10/12/2026" },
        { id: "3", title: "Discussion du", date: "10/12/2026" },
        { id: "4", title: "Discussion du", date: "10/12/2026" },
        { id: "5", title: "Discussion du", date: "10/12/2026" },
        { id: "6", title: "Discussion du", date: "10/12/2026" },
        { id: "7", title: "Discussion du", date: "10/12/2026" },
        { id: "8", title: "Discussion du", date: "10/12/2026" },
      ]);
      setIsLoading(false);
    } catch (error) {
      console.error("Erreur lors du chargement des discussions:", error);
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Supprimer le token
    localStorage.removeItem("token");
    // Rediriger vers la page de login
    router.push("/login");
  };

  const handleDiscussionClick = (discussionId: string) => {
    // TODO: Naviguer vers la discussion ou charger les messages
    console.log("Discussion cliquée:", discussionId);
    // router.push(`/chat/${discussionId}`);
  };

  return (
    <aside className="w-72 bg-white border-r border-gray-200 flex flex-col h-screen">
      {/* En-tête avec logo */}
      <div className="p-6 border-b border-gray-200">
        <h1
          className="text-xl font-bold flex items-center gap-2"
          style={{ color: "#803CDA" }}
        >
          NEWSFOUNDRY
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={22}
            height={22}
            className="inline-block"
          />
        </h1>
      </div>

      {/* Liste des discussions */}
      <div className="flex-1 overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-8 h-8 border-2 border-[#803CDA] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : discussions.length > 0 ? (
          discussions.map((discussion) => (
            <div
              key={discussion.id}
              onClick={() => handleDiscussionClick(discussion.id)}
              className="px-6 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 transition-colors"
            >
              <p className="text-gray-800 font-medium text-sm">
                {discussion.title}
              </p>
              <p className="text-[#717182] text-xs mt-1">{discussion.date}</p>
            </div>
          ))
        ) : (
          <div className="px-6 py-8 text-center text-gray-500 text-sm">
            Aucune discussion pour le moment
          </div>
        )}
      </div>

      {/* Bouton déconnexion */}
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
  );
}
