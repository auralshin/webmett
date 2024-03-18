import React, { useState, useRef } from "react";
import { useRouter } from "next/router";
import io from "socket.io-client";
import useSocket from "@/hooks/useSocket";
/**
 * Represents a chat component that enables users to send and receive messages in real-time.
 *
 * @component
 * @example
 * return <Chat messages={messages} setMessages={setMessages} />
 *
 * @param {Object} props - The properties passed to the component.
 * @param {Array} props.messages - The current array of chat messages.
 * @param {Function} props.setMessages - The setter function to update the chat messages.
 */
export default function Chat({ messages, setMessages }) {
  useSocket();
  const router = useRouter();
  const signalingServerRef = useRef();
  const { id: meetingId } = router.query;

  const [newMessage, setNewMessage] = useState("");

  signalingServerRef.current = io();

  /**
   * @dev Handles sending a message. Emits a 'send-message' event to the WebSocket server with the message and room name.
   */
  const handleMessageSend = () => {
    if (newMessage.trim() !== "") {
      setMessages([...messages, { text: newMessage, senderId: "user" }]);
      signalingServerRef.current.emit("send-message", newMessage, meetingId);
      setNewMessage("");
    }
  };

  return (
    <div className="rounded-lg p-8 bg-white h-full w-full text-black flex flex-col justify-between">
      <div className="overflow-y-auto max-h-80">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`mb-2 ${
              message.senderId === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`rounded-lg p-2 bg-gray-100 inline-block ${
                message.senderId === "user" ? "bg-blue-200" : ""
              }`}
            >
              {message.text}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 rounded-l-lg p-2 border border-gray-300 focus:outline-none focus:ring focus:ring-blue-200"
        />
        <button
          onClick={handleMessageSend}
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 focus:outline-none focus:ring focus:ring-blue-200"
        >
          Send
        </button>
      </div>
    </div>
  );
}
