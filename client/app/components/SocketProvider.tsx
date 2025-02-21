"use client";

import { useSession } from "next-auth/react";
import { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  senderId: string;
  receiverId: string;
  text: string;
  timestamp?: string;
}

interface Notification {
  id: number;
  message: string;
}

const SocketContext = createContext<any>(null);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { data: session } = useSession();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Record<string, Message[]>>({});
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (!session?.user?.id) return;

    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000", {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 5,
    });

    newSocket.on("connect", () => {
      console.log("Connected to WebSocket");
      newSocket.emit("user_online", session.user.id);
    });

    newSocket.on("receiveMessage", (message: Message) => {
      console.log("New message received:", message);

  
      setMessages((prev) => [...prev, message]);

  
      setConversations((prev) => ({
        ...prev,
        [message.senderId]: [...(prev[message.senderId] || []), message],
      }));
    });

 
    newSocket.on("new_notification", (notification: Notification) => {
      console.log("New notification:", notification);
      setNotifications((prev) => [...prev, notification]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [session?.user?.id]);

  return (
    <SocketContext.Provider value={{ socket, messages, conversations, setMessages, notifications }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
