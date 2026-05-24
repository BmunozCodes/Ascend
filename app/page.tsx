"use client";

import { useState, useEffect } from "react";

type Goal = {
  id: string;
  text: string;
  color: string;
  createdAt: string;
  completed: boolean;
};

const COLORS = [
  "bg-blue-500 border-blue-700",
  "bg-green-500 border-green-700",
  "bg-yellow-500 border-yellow-700",
  "bg-pink-500 border-pink-700",
  "bg-purple-500 border-purple-700",
];

export default function Home() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("ascend-goals");
    if (saved) {
      setGoals(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ascend-goals", JSON.stringify(goals));
  }, [goals]);

  function addGoal() {
    if (input.trim() === "") return;
    const color = COLORS[goals.length % COLORS.length];
    const newGoal: Goal = {
      id: crypto.randomUUID(),
      text: input,
      color,
      createdAt: new Date().toISOString(),
      completed: false,
    };
    setGoals([...goals, newGoal]);
    setInput("");
  }

  function deleteGoal(id: string) {
    setGoals(goals.filter((g) => g.id !== id));
  }

  function toggleComplete(id: string) {
    setGoals(
      goals.map((g) =>
        g.id === id ? { ...g, completed: !g.completed } : g
      )
    );
  }

  function clearCompleted() {
    setGoals(goals.filter((g) => !g.completed));
  }

  // --- derived values: computed from state, not stored separately ---
  const completedCount = goals.filter((g) => g.completed).length;
  const totalCount = goals.length;

  // Sort: incomplete goals first, completed at the bottom
  const sortedGoals = [...goals].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-2">Ascend</h1>
      <p className="text-gray-600 mb-8">set your goals. climb daily.</p>

      {/* Input + add button */}
      <div className="flex gap-2 w-full max-w-md">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="what's your goal?"
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
        />
        <button
          onClick={addGoal}
          className="rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
        >
          add
        </button>
      </div>

      {/* Stats header — only shows if there's at least one goal */}
      {totalCount > 0 && (
        <div className="flex items-center justify-between w-full max-w-md mt-8 mb-2 px-1">
          <p className="text-sm text-gray-600">
            {completedCount} of {totalCount} completed
          </p>
          {completedCount > 0 && (
            <button
              onClick={clearCompleted}
              className="text-sm text-gray-500 hover:text-red-600"
            >
              clear completed
            </button>
          )}
        </div>
      )}

      {/* Empty state — shown when no goals */}
      {totalCount === 0 ? (
        <div className="mt-12 text-center text-gray-400">
          <p className="text-lg">no goals yet 🎯</p>
          <p className="text-sm mt-1">add your first one above to get started</p>
        </div>
      ) : (
        <ul className="w-full max-w-md space-y-2">
          {sortedGoals.map((goal) => (
            <li
              key={goal.id}
              className={`flex items-center justify-between rounded-lg border px-4 py-3 ${goal.color}`}
            >
              <div className="flex items-center gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={goal.completed}
                  onChange={() => toggleComplete(goal.id)}
                  className="w-5 h-5 cursor-pointer"
                />
                <span
                  className={`text-white font-medium ${
                    goal.completed ? "line-through opacity-60" : ""
                  }`}
                >
                  {goal.text}
                </span>
              </div>
              <button
                onClick={() => deleteGoal(goal.id)}
                className="text-white/70 hover:text-white text-sm"
              >
                delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}