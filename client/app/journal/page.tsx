'use client'
import { useState } from "react";

export default function Journal() {
  const [journal, setJournal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchJournal = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("http://127.0.0.1:5000/Gen_Summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages:
            "Today I had a great discussion with my team about our new AI project. We also planned some weekend activities!",
        }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
      } else {
        setJournal(data.journal);
      }
    } catch (err) {
      setError("Failed to fetch journal data.");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-xl p-6 w-full max-w-2xl">
        <h1 className="text-2xl font-semibold text-center mb-4">📖 AI Journal</h1>

        <button
          onClick={fetchJournal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md w-full"
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate Journal"}
        </button>

        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {journal && (
          <div className="mt-6 border-t pt-4 space-y-3">
            {journal.split("\n").map((line, index) => (
              <p key={index} className="text-gray-700">
                {line}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
