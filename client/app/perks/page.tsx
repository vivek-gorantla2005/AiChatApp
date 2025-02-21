"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const badges = [
  { name: "Social Butterfly", icon: "🤝", description: "Frequently engages with multiple users." },
  { name: "Positive Vibes", icon: "😊", description: "Maintains a happy and motivating chat mood." },
  { name: "Consistent Chatter", icon: "🔥", description: "Chats regularly without long breaks." },
];

const achievements = [
  { title: "Completed a Hackathon", date: "Feb 2025" },
  { title: "Helped a Friend Debug Code", date: "Jan 2025" },
  { title: "Built a Side Project", date: "Dec 2024" },
];

export default function Page() {
  const [goal, setGoal] = useState("");
  const [goalProgress, setGoalProgress] = useState(0);
  const [isSettingGoal, setIsSettingGoal] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<{ timestamp: string; sender: string; text: string }[]>([]);

  const sendMessage = async () => {
    if (!chatInput.trim() || !goal) return;

    const newMessage = { timestamp: new Date().toISOString(), sender: "User", text: chatInput };
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setChatInput("");

    try {
      const response = await fetch("http://127.0.0.1:5001/track_progress/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages, goal }),
      });

      const data = await response.json();
      if (response.ok) {
        setGoalProgress(data.progress);
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("API Error:", error);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6 p-6 min-h-screen bg-gray-100">
      <div className="flex flex-col gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>🏅 Badge System</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {badges.map((badge, index) => (
                <motion.div key={index} whileHover={{ scale: 1.1 }} className="p-2 bg-gray-100 rounded-lg">
                  <p className="text-lg">{badge.icon} {badge.name}</p>
                  <p className="text-sm text-gray-500">{badge.description}</p>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>🎯 Goal Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            {goal ? (
              <>
                <p className="text-md font-semibold">{goal}</p>
                <Progress value={goalProgress} className="mt-2" />
                <p className="text-sm text-gray-500 mt-2">
                  Your progress updates based on conversations.
                </p>
              </>
            ) : (
              <Button onClick={() => setIsSettingGoal(true)}>Set a Goal</Button>
            )}
          </CardContent>
        </Card>

        {isSettingGoal && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Set Your Goal</CardTitle>
            </CardHeader>
            <CardContent>
              <Input
                placeholder="Enter your goal (e.g., Learn JavaScript)"
                onChange={(e) => setGoal(e.target.value)}
                className="mb-4"
              />
              <Button onClick={() => setIsSettingGoal(false)}>Save Goal</Button>
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex flex-col gap-6">
        {/* Achievements */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>🏆 User Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5">
              {achievements.map((achievement, index) => (
                <li key={index} className="mb-2">
                  <p className="text-md font-semibold">{achievement.title}</p>
                  <p className="text-sm text-gray-500">{achievement.date}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Chat Input & Progress Tracker */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>💬 Chat Tracker</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="h-40 overflow-y-auto border p-2 bg-gray-50 rounded-md">
                {messages.map((msg, index) => (
                  <p key={index} className="text-sm">
                    <span className="font-semibold">{msg.sender}:</span> {msg.text}
                  </p>
                ))}
              </div>
              <Input
                placeholder="Type a message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <Button onClick={sendMessage}>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
