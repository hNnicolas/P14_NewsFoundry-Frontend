"use client";

import React, { useEffect, useRef, useState } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
  onGenerate: (theme: string) => void | Promise<void>;
};

export default function GenerateReviewModal({
  isOpen,
  onClose,
  chatId,
  onGenerate,
}: Props) {
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
    if (e.key === "Enter" && !loading && title.trim()) {
      handleGenerate();
    }
  };

  const handleGenerate = async () => {
    if (!title.trim() || loading) return;

    setLoading(true);
    try {
      await onGenerate(title.trim());
      onClose();
    } catch (err) {
      console.error("Erreur lors de la génération :", err);
      alert("Erreur lors de la génération. Veuillez réessayer.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-4"
      role="presentation"
      onKeyDown={handleKeyDown}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="generate-review-title"
        aria-describedby="generate-review-description"
        className="relative w-full max-w-lg rounded-xl bg-white p-6 sm:p-8 shadow-xl"
      >
        <button
          onClick={onClose}
          aria-label="Fermer la fenêtre"
          className="absolute right-4 top-4 rounded p-2 text-sm text-gray-500 hover:text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#803CDA]"
        >
          ✕
        </button>

        <h2
          id="generate-review-title"
          className="mb-2 mt-4 text-center text-xl sm:text-2xl font-bold text-black"
        >
          Générer une revue de presse
        </h2>

        <p
          id="generate-review-description"
          className="mb-6 text-center text-sm text-[#717182]"
        >
          Indiquez le thème principal de votre revue de presse.
        </p>

        <label htmlFor="review-theme" className="sr-only">
          Thème de la revue de presse
        </label>

        <input
          ref={inputRef}
          id="review-theme"
          name="review-theme"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ex : intelligence artificielle"
          aria-required="true"
          aria-invalid={!title.trim() && loading}
          className="w-full rounded-lg bg-[#ECEEF2] px-4 py-3 text-center text-base text-black outline-none focus:ring-2 focus:ring-[#803CDA]"
        />

        <button
          onClick={handleGenerate}
          disabled={loading || !title.trim()}
          className="mt-6 w-full rounded-lg bg-black py-3 text-base sm:text-lg font-medium text-white transition-colors hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Génération en cours…" : "Générer la revue"}
        </button>
      </div>
    </div>
  );
}
