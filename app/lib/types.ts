export type Message = {
  role: "user" | "assistant";
  content: string;
  username?: string;
};

export type Discussion = {
  chat_id: number;
  title: string;
  messages: Message[];
  created_at: string | null;
  updated_at: string | null;
};
