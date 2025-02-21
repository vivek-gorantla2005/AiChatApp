"use client";

import React from "react";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";

const MoodDashboard = () => {
  const moodData = [
    { timestamp: "2025-02-22", message: "I am feeling great today!", sentiment: "POSITIVE", score: 0.95, topic: "Good Mood" },
    { timestamp: "2025-02-23", message: "I am stressed.", sentiment: "NEGATIVE", score: 0.85, topic: "Workload" },
    { timestamp: "2025-02-24", message: "I have a meeting tomorrow.", sentiment: "NEUTRAL", score: 0.75, topic: "Upcoming Meeting" },
    { timestamp: "2025-02-25", message: "I have a project due next week.", sentiment: "NEGATIVE", score: 0.80, topic: "Project Deadline" },
    { timestamp: "2025-02-26", message: "I need to catch up on some reading.", sentiment: "NEUTRAL", score: 0.70, topic: "Reading Goals" },
  ];

  const sentimentCounts = moodData.reduce((acc, curr) => {
    acc[curr.sentiment] = (acc[curr.sentiment] || 0) + 1;
    return acc;
  }, {});

  const barChartData = Object.keys(sentimentCounts).map((sentiment) => ({
    sentiment,
    count: sentimentCounts[sentiment],
  }));

  const COLORS = { POSITIVE: "#28a745", NEGATIVE: "#dc3545", NEUTRAL: "#ffc107" };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Mood & Interest Dashboard</h1>

      <div className="bg-white shadow-lg p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Mood Trends Over Time</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={moodData}>
            <XAxis dataKey="timestamp" />
            <YAxis domain={[0.6, 1]} />
            <Tooltip />
            <Line type="monotone" dataKey="score" stroke="#8884d8" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white shadow-lg p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Sentiment Distribution</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={barChartData}>
            <XAxis dataKey="sentiment" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#007bff" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white shadow-lg p-4 rounded-lg mb-6">
        <h2 className="text-xl font-semibold mb-2">Sentiment Proportions</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={barChartData}
              dataKey="count"
              nameKey="sentiment"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label
            >
              {barChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.sentiment]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white shadow-lg p-4 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">What Triggered These Emotions?</h2>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Date</th>
              <th className="border p-2">Sentiment</th>
              <th className="border p-2">Topic</th>
            </tr>
          </thead>
          <tbody>
            {moodData.map((entry, index) => (
              <tr key={index} className="text-center">
                <td className="border p-2">{entry.timestamp}</td>
                <td className={`border p-2 ${entry.sentiment === "POSITIVE" ? "text-green-600" : entry.sentiment === "NEGATIVE" ? "text-red-600" : "text-yellow-600"}`}>
                  {entry.sentiment}
                </td>
                <td className="border p-2">{entry.topic}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default MoodDashboard;
