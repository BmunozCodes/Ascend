"use client";

import { useState, useEffect } from "react";

type Task = {
  id: string;
  text: string;
  completed: boolean;
};

type Goal = {
  id: string;
  text: string;
  color: string;
  createdAt: string;
  completed: boolean;
  tasks: Task[];
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
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState("");

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
      tasks: [],
    };
    setGoals([...goals, newGoal]);
    setInput("");
  }

  function deleteGoal(id: string) {
    setGoals(goals.filter((g) => g.id !== id));
    if (expandedGoalId === id) setExpandedGoalId(null);
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

  function toggleExpanded(id: string) {
    setExpandedGoalId(expandedGoalId === id ? null : id);
  }

  // --- Task operations ---
  function addTask(goalId: string) {
    if (taskInput.trim() === "") return;
    const newTask: Task = {
      id: crypto.randomUUID(),
      text: taskInput,
      completed: false,
    };
    setGoals(
      goals.map((g) =>
        g.id === goalId ? { ...g, tasks: [...g.tasks, newTask] } : g
      )
    );
    setTaskInput("");
  }

  function toggleTask(goalId: string, taskId: string) {
    setGoals(
      goals.map((g) =>
        g.id === goalId
          ? {
              ...g,
              tasks: g.tasks.map((t) =>
                t.id === taskId ? { ...t, completed: !t.completed } : t
              ),
            }
          : g
      )
    );
  }

  function deleteTask(goalId: string, taskId: string) {
    setGoals(
      goals.map((g) =>
        g.id === goalId
          ? { ...g, tasks: g.tasks.filter((t) => t.id !== taskId) }
          : g
      )
    );
  }

  const completedCount = goals.filter((g) => g.completed).length;
  const totalCount = goals.length;

  const sortedGoals = [...goals].sort((a, b) => {
    if (a.completed === b.completed) return 0;
    return a.completed ? 1 : -1;
  });

  return (
    <main className="flex min-h-screen flex-col items-center p-8">
      <h1 className="text-4xl font-bold mb-2">Ascend</h1>
      <p className="text-gray-600 mb-8">set your goals. climb daily.</p>

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

      {totalCount === 0 ? (
        <div className="mt-12 text-center text-gray-400">
          <p className="text-lg">no goals yet 🎯</p>
          <p className="text-sm mt-1">add your first one above to get started</p>
        </div>
      ) : (
        <ul className="w-full max-w-md space-y-2">
          {sortedGoals.map((goal) => {
            const isExpanded = expandedGoalId === goal.id;
            const taskCompletedCount = goal.tasks.filter((t) => t.completed).length;
            const taskTotalCount = goal.tasks.length;

            return (
              <li
                key={goal.id}
                className={`rounded-lg border ${goal.color}`}
              >
                {/* Goal row */}
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={() => toggleComplete(goal.id)}
                      className="w-5 h-5 cursor-pointer"
                    />
                    <button
                      onClick={() => toggleExpanded(goal.id)}
                      className="flex-1 text-left"
                    >
                      <span
                        className={`text-white font-medium ${
                          goal.completed ? "line-through opacity-60" : ""
                        }`}
                      >
                        {goal.text}
                      </span>
                      {taskTotalCount > 0 && (
                        <span className="text-white/70 text-sm ml-2">
                          ({taskCompletedCount}/{taskTotalCount})
                        </span>
                      )}
                    </button>
                    <span className="text-white/60 text-xs">
                      {isExpanded ? "▲" : "▼"}
                    </span>
                  </div>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-white/70 hover:text-white text-sm ml-2"
                  >
                    delete
                  </button>
                </div>

                {/* Expanded tasks section */}
                {isExpanded && (
                  <div className="bg-white/10 px-4 py-3 border-t border-white/20">
                    {/* Task input */}
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={taskInput}
                        onChange={(e) => setTaskInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") addTask(goal.id);
                        }}
                        placeholder="add a task..."
                        className="flex-1 rounded border border-white/30 bg-white/20 px-3 py-1 text-white placeholder-white/60 text-sm"
                      />
                      <button
                        onClick={() => addTask(goal.id)}
                        className="rounded bg-white/30 hover:bg-white/40 px-3 py-1 text-white text-sm"
                      >
                        add
                      </button>
                    </div>

                    {/* Task list */}
                    {goal.tasks.length === 0 ? (
                      <p className="text-white/60 text-sm italic">
                        no tasks yet
                      </p>
                    ) : (
                      <ul className="space-y-1">
                        {goal.tasks.map((task) => (
                          <li
                            key={task.id}
                            className="flex items-center gap-2 text-sm"
                          >
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => toggleTask(goal.id, task.id)}
                              className="w-4 h-4 cursor-pointer"
                            />
                            <span
                              className={`flex-1 text-white ${
                                task.completed ? "line-through opacity-60" : ""
                              }`}
                            >
                              {task.text}
                            </span>
                            <button
                              onClick={() => deleteTask(goal.id, task.id)}
                              className="text-white/60 hover:text-white text-xs"
                            >
                              ✕
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}