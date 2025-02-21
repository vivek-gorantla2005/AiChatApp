'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { BACKEND_URL } from '@/backendRoutes';

const Page = () => {
  const [loading, setLoading] = useState(false);
  const [journal, setJournal] = useState(null);
  const [chats, setChats] = useState([]);
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      fetchChats();
    }
  }, [session]);

  const fetchChats = async () => {
    if (!session?.user?.id) return;

    try {
      const res = await fetch(`${BACKEND_URL}/api/getChats?userId=${session.user.id}`);
      const data = await res.json();
      setChats(data);
      console.log("Fetched Chats:", data);
    } catch (error) {
      console.error("Error fetching chats:", error);
    }
  };

  const genJournal = async () => {
    if (!session?.user?.id) return;
    setLoading(true);

    try {
      const messageString = "i built a project for my college application and i was a real time ai chat application and it was cool";

      const res = await fetch(`http://127.0.0.1:5002/Gen_Summary/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ messages: messageString }),
      });

      if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);

      const data = await res.json();
      setJournal(data);
      console.log("Generated Journal:", data);
    } catch (error) {
      console.error("Error generating journal:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-gray-200 p-4">
      <button 
        onClick={genJournal} 
        disabled={loading} 
        className={`px-8 py-4 text-lg font-semibold rounded-full shadow-lg transition-all transform ${
          loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
      >
        {loading ? 'Generating...' : 'Generate Journal'}
      </button>
      
      {journal && (
        <div className="mt-8 p-6 bg-white rounded-xl shadow-2xl w-full max-w-3xl">
          <h3 className="text-2xl font-bold text-center text-blue-700 mb-4">Your Journal</h3>
          <div className="text-base text-gray-800 leading-relaxed">
            {journal.journal.split('\n').map((line, index) => (
              <p key={index} className="mb-2">{line}</p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;
