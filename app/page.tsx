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
  lockedInFor: string | null;
};

const COLORS = [
  "bg-blue-500 border-blue-700",
  "bg-green-500 border-green-700",
  "bg-yellow-500 border-yellow-700",
  "bg-pink-500 border-pink-700",
  "bg-purple-500 border-purple-700",
];

function todayString(): string {
  return new Date().toISOString().split("T")[0];
}

function tomorrowString(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split("T")[0];
}

function yesterdayString(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

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
  const [darkMode, setDarkMode] = useState(false);
  const [streak, setStreak] = useState(0);
  const [lastEvaluatedDate, setLastEvaluatedDate] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("ascend-dark-mode");
    if (saved !== null) {
      setDarkMode(saved === "true");
    } else {
      const systemPrefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
      setDarkMode(systemPrefersDark);
    }
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("ascend-dark-mode", String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    const saved = localStorage.getItem("ascend-goals");
    if (saved) {
      setGoals(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("ascend-goals", JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    const savedStreak = localStorage.getItem("ascend-streak");
    const savedDate = localStorage.getItem("ascend-last-evaluated");
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedDate) setLastEvaluatedDate(savedDate);
  }, []);

  useEffect(() => {
    localStorage.setItem("ascend-streak", String(streak));
  }, [streak]);

  useEffect(() => {
    if (lastEvaluatedDate) {
      localStorage.setItem("ascend-last-evaluated", lastEvaluatedDate);
    }
  }, [lastEvaluatedDate]);

  useEffect(() => {
    const today = todayString();
    if (lastEvaluatedDate === today) return;
    if (lastEvaluatedDate === null) {
      setLastEvaluatedDate(today);
      return;
    }
    const yesterday = yesterdayString();
    const yesterdaysGoals = goals.filter((g) => g.lockedInFor === yesterday);
    if (yesterdaysGoals.length === 0) {
      // Rest day — streak frozen
    } else {
      const allCompleted = yesterdaysGoals.every((g) => g.completed);
      if (allCompleted) {
        setStreak((s) => s + 1);
      } else {
        setStreak(0);
      }
    }
    setLastEvaluatedDate(today);
  }, [goals, lastEvaluatedDate]);

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
      lockedInFor: null,
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

  function lockInForTomorrow(goalId: string) {
    setGoals(
      goals.map((g) =>
        g.id === goalId ? { ...g, lockedInFor: tomorrowString() } : g
      )
    );
  }

  function unlock(goalId: string) {
    setGoals(
      goals.map((g) =>
        g.id === goalId ? { ...g, lockedInFor: null } : g
      )
    );
  }

  const today = todayString();
  const tomorrow = tomorrowString();

  const todaysGoals = goals.filter((g) => g.lockedInFor === today);
  const tomorrowsGoals = goals.filter((g) => g.lockedInFor === tomorrow);
  const otherGoals = goals.filter(
    (g) => g.lockedInFor !== today && g.lockedInFor !== tomorrow
  );

  const todayCompletedCount = todaysGoals.filter((g) => g.completed).length;
  const todayTotalCount = todaysGoals.length;

  function renderGoalCard(goal: Goal) {
    const isExpanded = expandedGoalId === goal.id;
    const taskCompletedCount = goal.tasks.filter((t) => t.completed).length;
    const taskTotalCount = goal.tasks.length;
    const isLockedToday = goal.lockedInFor === today;
    const isLockedTomorrow = goal.lockedInFor === tomorrow;

    return (
      <motion.div
        key={goal.id}
        layout
        initial={{ opacity: 0, y: -10, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className={`mb-2 overflow-hidden rounded-2xl border shadow-sm transition-shadow hover:shadow-md ${goal.color}`}
      >
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

          {!isLockedToday && (
            isLockedTomorrow ? (
              <button
                onClick={() => unlock(goal.id)}
                className="rounded-full bg-white/20 px-2 py-1 text-xs text-white transition hover:bg-white/30"
                title="Unlock"
              >
                🔒
              </button>
            ) : (
              <button
                onClick={() => lockInForTomorrow(goal.id)}
                className="rounded-full bg-white/20 px-2 py-1 text-xs text-white transition hover:bg-white/30"
                title="Lock in for tomorrow"
              >
                +
              </button>
            )
          )}

          <button
            onClick={() => deleteGoal(goal.id)}
            className="text-white/60 transition hover:scale-110 hover:text-white"
            aria-label="delete goal"
          >
            ✕
          </button>
        </div>

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
                  <p className="text-sm italic text-white/60">no tasks yet</p>
                ) : (
                  <ul className="space-y-1.5">
                    <AnimatePresence initial={false}>
                      {goal.tasks.map((task) => (
                        <motion.li
                          key={task.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 10, transition: { duration: 0.15 } }}
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
                              task.completed ? "line-through opacity-60" : ""
                            }`}
                          >
                            {task.text}
                          </span>
                          <button
                            onClick={() => deleteTask(goal.id, task.id)}
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
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 px-4 py-12 transition-colors duration-300 sm:px-8 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <button
        onClick={() => setDarkMode(!darkMode)}
        className="fixed right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-lg shadow-md ring-1 ring-slate-200 backdrop-blur transition hover:scale-110 dark:bg-slate-800/80 dark:ring-slate-700"
        aria-label="toggle dark mode"
      >
        {darkMode ? "☀️" : "🌙"}
      </button>

      <div className="mx-auto flex max-w-md flex-col items-center">
        <header className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-2xl text-white shadow-md">
            ▲
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Ascend
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Set your goals. Climb daily.
          </p>

          <motion.div
            key={streak}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="mt-4 flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-100 to-red-100 px-4 py-1.5 shadow-sm ring-1 ring-orange-200 dark:from-orange-950 dark:to-red-950 dark:ring-orange-900"
          >
            <span className="text-lg">🔥</span>
            <span className="text-sm font-bold text-orange-900 dark:text-orange-200">
              {streak} day{streak === 1 ? "" : "s"}
            </span>
          </motion.div>
        </header>

        <div className="w-full">
          <div className="flex gap-2 rounded-2xl bg-white p-2 shadow-sm ring-1 ring-slate-200 transition-colors dark:bg-slate-800 dark:ring-slate-700">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addGoal();
              }}
              placeholder="add a new goal..."
              className="flex-1 rounded-xl px-3 py-2 text-slate-900 placeholder-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder-slate-500"
            />
            <button
              onClick={addGoal}
              className="rounded-xl bg-slate-900 px-5 py-2 font-medium text-white transition hover:bg-slate-700 active:scale-95 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
            >
              add
            </button>
          </div>
        </div>

        <section className="mt-8 w-full">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Today
            </h2>
            {todayTotalCount > 0 && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {todayCompletedCount}/{todayTotalCount}
              </span>
            )}
          </div>
          {todaysGoals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white/40 p-6 text-center dark:border-slate-700 dark:bg-slate-900/40">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Nothing locked in for today.
              </p>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                Lock in goals today for tomorrow!
              </p>
            </div>
          ) : (
            <div className="w-full">
              <AnimatePresence initial={false}>
                {todaysGoals.map((goal) => renderGoalCard(goal))}
              </AnimatePresence>
            </div>
          )}
        </section>

        <section className="mt-8 w-full">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Tomorrow
            </h2>
            {tomorrowsGoals.length > 0 && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {tomorrowsGoals.length} locked in
              </span>
            )}
          </div>
          {tomorrowsGoals.length === 0 ? (
            <p className="px-1 text-sm italic text-slate-400 dark:text-slate-500">
              Lock in goals from below ↓
            </p>
          ) : (
            <div className="w-full">
              <AnimatePresence initial={false}>
                {tomorrowsGoals.map((goal) => renderGoalCard(goal))}
              </AnimatePresence>
            </div>
          )}
        </section>

        <section className="mt-8 w-full">
          <div className="mb-3 flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              All Goals
            </h2>
            {otherGoals.length > 0 && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {otherGoals.length}
              </span>
            )}
          </div>
          {otherGoals.length === 0 ? (
            <p className="px-1 text-sm italic text-slate-400 dark:text-slate-500">
              No unlocked goals.
            </p>
          ) : (
            <div className="w-full">
              <AnimatePresence initial={false}>
                {otherGoals.map((goal) => renderGoalCard(goal))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}