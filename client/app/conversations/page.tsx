"use client";
import React, { useEffect, useState, useRef } from "react";
import { useSession } from "next-auth/react";
import { BACKEND_URL } from "@/backendRoutes";
import axios from "axios";
import { useSocket } from "../components/SocketProvider";

interface Friend {
  id: string;
  username: string;
}

interface Message {
  senderId: string;
  receiverId: string;
  text: string;
  timestamp?: string;
}

const ConversationsPage = () => {
  const { data: session } = useSession();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [selectedUser, setSelectedUser] = useState<Friend | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);

  const { socket, messages, setMessages, conversations } = useSocket();

  useEffect(() => {
    const fetchFriends = async () => {
      if (!session?.user?.id) return;
      try {
        const response = await fetch(`${BACKEND_URL}/api/getFriends?userId=${session.user.id}`);
        if (!response.ok) throw new Error("Failed to fetch friends");
        const data: Friend[] = await response.json();
        setFriends(data);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    fetchFriends();
  }, [session?.user?.id]);

  
  useEffect(() => {
    if (chatRef.current) {
      setTimeout(() => {
        chatRef.current!.scrollTop = chatRef.current!.scrollHeight;
      }, 100);
    }
  }, [messages]);


  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedUser || !session) return;
  
    const messageData = {
      senderId: session?.user?.id,
      receiverId: selectedUser?.id,
      text: messageInput,
      messageType: "TEXT",
      isRead: false,
      createdAt: new Date().toISOString(),
    };
  
   
    setMessages((prev) => ({
      ...prev,
      [selectedUser.id]: [...(prev[selectedUser.id] || []), messageData], // Append message to selected user's conversation
    }));
  
    setMessageInput("");

    socket?.emit("sendMessage", messageData);
  
    try {
      const res = await axios.post(`${BACKEND_URL}/api/sendMessage`, messageData);
      if (res.status !== 200) {
        console.error("Failed to send message");
      }
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };
  
  

  return (
    <div className="flex h-screen">
      {/* Friends List */}
      <div className="w-1/4 p-4 overflow-y-auto border-r bg-gray-100">
        <h2 className="text-xl font-bold mb-4">Friends</h2>
        {friends.length === 0 ? (
          <p className="text-gray-500">No friends found.</p>
        ) : (
          <ul>
            {friends.map((friend) => (
              <li
                key={friend.id}
                className={`p-3 cursor-pointer hover:bg-gray-200 rounded-lg transition ${
                  selectedUser?.id === friend.id ? "bg-gray-300" : ""
                }`}
                onClick={() => setSelectedUser(friend)}
              >
                <p className="font-bold">{friend.username}</p>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="w-3/4 flex flex-col bg-white p-6">
        {selectedUser ? (
          <>
         
            <div ref={chatRef} className="flex-1 overflow-y-auto bg-gray-50 p-4 rounded-lg" style={{ maxHeight: "65vh" }}>
              {(conversations[selectedUser.id] || []).map((msg, index) => (
                <div key={index} className={`mb-3 flex ${msg.senderId === session?.user?.id ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`p-3 rounded-lg max-w-xs ${
                      msg.senderId === session?.user?.id ? "bg-blue-700 text-white" : "bg-blue-300"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>

          
            <div className="mt-4 flex">
              <input
                type="text"
                className="p-3 border rounded-lg w-full"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
              />
              <button className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg" onClick={sendMessage}>
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <p className="text-lg">Select a friend to start messaging</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsPage;
