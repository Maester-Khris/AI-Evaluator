import { useState } from "react";
import { ChatWindow } from "./ChatWindow";
import { INITIAL_MOCK_MESSAGES } from "../constants";

export const ChatContainer = () => {
  // Logic lives here, isolated from App.tsx
  const [messages, setMessages] = useState<any[]>(INITIAL_MOCK_MESSAGES);
  const handleSendMessage = async (text: string) => {
    // 1. Optimistic Update (Show user message immediately)
    const newMsg = { role: 'user', content: text };
    setMessages((prev) => [...prev, newMsg]);

    // 2. Placeholder for Backend Call (Node/Python)
    console.log("Sending to backend:", text);
  };

  return (
    <ChatWindow>
      <ChatWindow.Messages messages={messages} />
      <ChatWindow.Input onSubmit={handleSendMessage} />
    </ChatWindow>
  );
};