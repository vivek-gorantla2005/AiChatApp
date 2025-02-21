'use client';
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { BACKEND_URL } from "@/backendRoutes";
import axios from "axios";

const friendsData = [
  { name: "Summu", username: "summu", avatar: "https://randomuser.me/api/portraits/men/1.jpg", id: "a55ae2f0-50ad-440f-b8ff-904a67a2a45d" },
  { name: "John Doe", username: "john_doe", avatar: "https://randomuser.me/api/portraits/men/2.jpg", id: "ce233c3f-fc97-44ef-ab34-18c8609536da" },
  { name: "Sridevi", username: "sridevi", avatar: "https://randomuser.me/api/portraits/women/2.jpg", id: "ebca946b-44ee-4e22-ba9d-afa57fae5782" },
];

export default function AddFriends() {
  const { data: session } = useSession();
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sentRequests, setSentRequests] = useState(new Set());

  // Load sent requests from localStorage
  useEffect(() => {
    const storedRequests = JSON.parse(localStorage.getItem("sentRequests")) || [];
    setSentRequests(new Set(storedRequests));
  }, []);

  const sendFriendReq = async () => {
    if (!session?.user?.id || !selectedUser?.id) return;

    setLoading(true);
    setError("");

    try {
      const res = await axios.post(`${BACKEND_URL}/api/sendFriendReq`, {
        followerId: session.user.id,
        followingId: selectedUser.id,
      });

      if (res.status === 200) {
        const updatedRequests = new Set([...sentRequests, selectedUser.id]);
        setSentRequests(updatedRequests);
        localStorage.setItem("sentRequests", JSON.stringify([...updatedRequests]));
      }
    } catch (err) {
      console.error(err);
      setError("Failed to send friend request. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Filter friends based on search input
  const filteredFriends = friendsData.filter((user) =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen p-4">
      {/* Left Section - Search & Friend List */}
      <div className="w-1/3 border-r p-4">
        <Input
          placeholder="Search for friends..."
          className="mb-4"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <h2 className="text-lg font-semibold mb-2">Suggested Friends</h2>
        {filteredFriends.length > 0 ? (
          filteredFriends.map((user) => (
            <div
              key={user.id}
              className="flex items-center p-2 cursor-pointer hover:bg-gray-100 rounded"
              onClick={() => {
                setSelectedUser(user);
                setError(""); // Reset error on new selection
              }}
            >
              <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
              <span>{user.name}</span>
            </div>
          ))
        ) : (
          <p className="text-gray-500">No friends found</p>
        )}
      </div>

      {/* Right Section - Selected User Details */}
      <div className="w-2/3 p-4 flex">
        {selectedUser ? (
          <Card className="w-96">
            <CardHeader>
              <CardTitle>{selectedUser.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center">
                <img src={selectedUser.avatar} alt={selectedUser.name} className="w-20 h-20 rounded-full mb-4" />
                <p className="text-gray-600">@{selectedUser.username}</p>

                {error && <p className="text-red-500 mt-2">{error}</p>}

                <Button
                  className="mt-4"
                  onClick={sendFriendReq}
                  disabled={loading || sentRequests.has(selectedUser.id)}
                >
                  {loading ? "Sending..." : sentRequests.has(selectedUser.id) ? "Request Sent ✅" : "Send Friend Request"}
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <p className="text-gray-500">Select a user to see details</p>
        )}
      </div>
    </div>
  );
}
