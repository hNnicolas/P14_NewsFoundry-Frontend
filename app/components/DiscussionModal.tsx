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
  onSendMessage: (message: string) => void;
}

const DiscussionModal: FC<Props> = ({
  open,
  onClose,
  title,
  messages,
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
    if (input.trim() === "") return;
    onSendMessage(input);
    setInput("");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto relative pointer-events-auto shadow-lg flex flex-col">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
        >
          ✕
        </button>

        <h2 className="text-lg font-bold mb-4">{title}</h2>

        <div className="space-y-3 flex-1 overflow-y-auto mb-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`px-3 py-2 rounded-lg ${
                msg.role === "user"
                  ? "bg-blue-100 text-blue-800 text-right"
                  : "bg-green-100 text-green-800 text-left"
              }`}
            >
              <strong>{msg.role}:</strong> {msg.content}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2">
          <textarea
            className="flex-1 border border-gray-300 rounded px-2 py-1"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Écrire un message..."
          />
          <button
            onClick={handleSend}
            className="bg-[#803CDA] text-white px-4 py-2 rounded hover:bg-[#692bb5]"
          >
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
};

export default DiscussionModal;
