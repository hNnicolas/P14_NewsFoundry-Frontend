"use client";

import React, { useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (title: string) => void;
};

export default function GenerateReviewModal({
  isOpen,
  onClose,
  onGenerate,
}: Props) {
  const [title, setTitle] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="relative bg-white rounded-[10px] p-8 w-full max-w-lg flex flex-col items-center shadow-lg">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-xl"
          aria-label="Fermer la modale"
        >
          Fermer
        </button>

        {/* Titre */}
        <h2 className="text-center text-2xl font-bold mb-2">
          Générer une revue de presse
        </h2>

        {/* Sous-titre */}
        <p className="text-center text-sm mb-6" style={{ color: "#717182" }}>
          Donner un titre à votre revue de presse
        </p>

        {/* Label et input */}
        <label
          htmlFor="review-title"
          className="self-start mb-2 text-black font-medium"
        >
          Thème de la revue de presse
        </label>
        <input
          id="review-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder=""
          className="w-full p-4 mb-6 rounded bg-[#ECEEF2] text-center text-base"
        />

        {/* Bouton générer */}
        <button
          onClick={() => onGenerate(title)}
          className="w-full py-4 rounded bg-black text-white text-lg hover:bg-gray-800 transition-colors"
        >
          Générer
        </button>
      </div>
    </div>
  );
}
