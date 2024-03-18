import { create } from "zustand";

const useMessageStore = create((set) => ({
  messages: [],
  setMessages: (newMessage) =>
    set((state) => ({
      messages: [...state.messages, newMessage],
    })),
}));

export { useMessageStore };
