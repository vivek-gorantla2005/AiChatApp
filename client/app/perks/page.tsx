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
  const conversationKeywords = ["code", "JavaScript", "React", "learning"]; // Example keywords

  // Track goal-related conversations
  const trackConversation = (userMessage: string) => {
    const matched = conversationKeywords.some((word) =>
      userMessage.toLowerCase().includes(word)
    );

    if (matched) {
      setGoalProgress((prev) => Math.min(prev + 10, 100)); 
    } else {
      setGoalProgress((prev) => Math.max(prev - 5, 0));
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6 p-6 min-h-screen bg-gray-100">
      {/* Left Section: Badge System & Goal Tracker */}
      <div className="flex flex-col gap-6">
        {/* Badge System */}
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

        {/* Goal Tracker */}
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

        {/* Goal Setting Modal */}
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

      {/* Right Section: Achievements & Chat Tracker */}
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
      </div>
    </div>
  );
}
