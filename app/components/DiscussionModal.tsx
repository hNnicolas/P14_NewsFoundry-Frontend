"use client";

import { FC, useState, useEffect, useRef } from "react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  messages: Message[];
  chatId: number;
  onSendMessage: (messageContent: string) => void;
}

const DiscussionModal: FC<Props> = ({
  open,
  onClose,
  title,
  messages,
  chatId,
  onSendMessage,
}) => {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage(input);
    setInput("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-2 md:p-6 pointer-events-none">
      <div className="bg-white rounded-xl p-4 md:p-6 w-full max-w-[95%] md:max-w-md lg:max-w-lg xl:max-w-xl max-h-[90vh] overflow-y-auto relative pointer-events-auto shadow-lg flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900 md:top-4 md:right-4"
          aria-label="Fermer la discussion"
        >
          ✕
        </button>

        <h2 className="text-lg md:text-xl font-bold mb-3 md:mb-4 truncate">
          {title}
        </h2>

        <div className="flex-1 overflow-y-auto space-y-3 mb-3 md:mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`px-3 py-2 rounded-lg break-words ${
                msg.role === "user"
                  ? "bg-blue-100 text-blue-800 text-right"
                  : "bg-green-100 text-green-800 text-left"
              }`}
            >
              <strong>{msg.role === "user" ? "Vous" : "Assistant"}:</strong>{" "}
              {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 items-end">
          <label htmlFor="messageInput" className="sr-only">
            Écrire un message
          </label>
          <textarea
            id="messageInput"
            className="flex-1 border border-gray-300 rounded px-2 py-1 resize-none h-12 md:h-16"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrire un message..."
          />
          <button
            onClick={handleSend}
            className="bg-[#803CDA] text-white px-4 py-2 rounded hover:bg-[#692bb5] flex-shrink-0"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscussionModal;
