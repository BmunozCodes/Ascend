"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

function celebrate() {
  import("canvas-confetti").then((confetti) => {
    confetti.default({
      particleCount: 60,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#3b82f6", "#10b981", "#eab308", "#ec4899", "#a855f7"],
    });
  });
}

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
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 py-12 sm:px-8">
      <div className="mx-auto flex max-w-md flex-col items-center">
        {/* Header */}
        <header className="mb-10 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl text-white shadow-md">
            ▲
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Ascend
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Set your goals. Climb daily.
          </p>
        </header>

        {/* Input card */}
        <div className="w-full">
          <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addGoal();
              }}
              placeholder="what's your goal?"
              className="flex-1 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={addGoal}
              className="rounded-xl bg-slate-900 px-5 py-2 font-medium text-white transition hover:bg-slate-700 active:scale-95"
            >
              add
            </button>
          </div>
        </div>

        {/* Stats row */}
        {totalCount > 0 && (
          <div className="mb-3 mt-8 flex w-full items-center justify-between px-1">
            <p className="text-sm font-medium text-slate-600">
              {completedCount} of {totalCount} completed
            </p>
            {completedCount > 0 && (
              <button
                onClick={clearCompleted}
                className="text-sm text-slate-400 transition hover:text-red-500"
              >
                clear completed
              </button>
            )}
          </div>
        )}

        {/* Empty state OR goals list */}
        {totalCount === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-slate-200 text-3xl">
              🎯
            </div>
            <p className="font-medium text-slate-600">No goals yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Add your first one above to start climbing
            </p>
          </div>
        ) : (
          <div className="w-full">
            <AnimatePresence initial={false}>
              {sortedGoals.map((goal) => {
                const isExpanded = expandedGoalId === goal.id;
                const taskCompletedCount = goal.tasks.filter(
                  (t) => t.completed
                ).length;
                const taskTotalCount = goal.tasks.length;

                return (
                  <motion.div
                    key={goal.id}
                    layout
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.9,
                      transition: { duration: 0.2 },
                    }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    className={`mb-2 overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md ${goal.color}`}
                  >
                    {/* Goal row */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <input
                        type="checkbox"
                        checked={goal.completed}
                        onChange={() => toggleComplete(goal.id)}
                        className="h-5 w-5 cursor-pointer accent-white"
                      />
                      <button
                        onClick={() => toggleExpanded(goal.id)}
                        className="flex flex-1 items-center justify-between text-left"
                      >
                        <span
                          className={`font-medium text-white ${
                            goal.completed ? "line-through opacity-60" : ""
                          }`}
                        >
                          {goal.text}
                        </span>
                        <div className="flex items-center gap-2">
                          {taskTotalCount > 0 && (
                            <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs text-white">
                              {taskCompletedCount}/{taskTotalCount}
                            </span>
                          )}
                          <motion.span
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-xs text-white/60"
                          >
                            ▼
                          </motion.span>
                        </div>
                      </button>
                      <button
                        onClick={() => deleteGoal(goal.id)}
                        className="text-white/60 transition hover:scale-110 hover:text-white"
                        aria-label="delete goal"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Expanded tasks section */}
                    <AnimatePresence initial={false}>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/20 bg-white/10 px-4 py-3">
                            <div className="mb-3 flex gap-2">
                              <input
                                type="text"
                                value={taskInput}
                                onChange={(e) => setTaskInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") addTask(goal.id);
                                }}
                                placeholder="add a task..."
                                className="flex-1 rounded-lg border border-white/30 bg-white/20 px-3 py-1.5 text-sm text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/40"
                              />
                              <button
                                onClick={() => addTask(goal.id)}
                                className="rounded-lg bg-white/30 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-white/40 active:scale-95"
                              >
                                add
                              </button>
                            </div>

                            {goal.tasks.length === 0 ? (
                              <p className="text-sm italic text-white/60">
                                no tasks yet
                              </p>
                            ) : (
                              <ul className="space-y-1.5">
                                <AnimatePresence initial={false}>
                                  {goal.tasks.map((task) => (
                                    <motion.li
                                      key={task.id}
                                      layout
                                      initial={{ opacity: 0, x: -10 }}
                                      animate={{ opacity: 1, x: 0 }}
                                      exit={{
                                        opacity: 0,
                                        x: 10,
                                        transition: { duration: 0.15 },
                                      }}
                                      className="flex items-center gap-2 text-sm"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={task.completed}
                                        onChange={() => {
                                          toggleTask(goal.id, task.id);
                                          if (!task.completed) celebrate();
                                        }}
                                        className="h-4 w-4 cursor-pointer accent-white"
                                      />
                                      <span
                                        className={`flex-1 text-white ${
                                          task.completed
                                            ? "line-through opacity-60"
                                            : ""
                                        }`}
                                      >
                                        {task.text}
                                      </span>
                                      <button
                                        onClick={() =>
                                          deleteTask(goal.id, task.id)
                                        }
                                        className="text-xs text-white/60 transition hover:scale-110 hover:text-white"
                                        aria-label="delete task"
                                      >
                                        ✕
                                      </button>
                                    </motion.li>
                                  ))}
                                </AnimatePresence>
                              </ul>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </div>
    </main>
  );
}