"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Checkbox } from "./Checkbox";
import Link from "next/link";
import {
  Sun,
  Moon,
  Plus,
  X,
  Lock,
  ChevronDown,
  BarChart3,
} from "lucide-react";

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

const ACCENTS = [
  "#0EA5E9", // sky
  "#10B981", // emerald
  "#EAB308", // yellow
  "#EC4899", // pink
  "#8B5CF6", // violet
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
      particleCount: 50,
      spread: 55,
      origin: { y: 0.7 },
      colors: ["#C2410C", "#FB923C", "#FED7AA"],
      ticks: 100,
    });
  });
}

function MountainMark({ size = 24, color = "currentColor" }: { size?: number; color?: string }) {
  const scale = size / 52;
  return (
    <svg
      width={size}
      height={size * (32 / 52)}
      viewBox="0 0 52 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M 2 30 L 16 8 L 26 22 L 36 4 L 50 30 Z"
        fill={color}
        stroke={color}
        strokeWidth={1 / scale}
        strokeLinejoin="miter"
      />
    </svg>
  );
}

export default function Home() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [input, setInput] = useState("");
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);
  const [taskInput, setTaskInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastEvaluatedDate, setLastEvaluatedDate] = useState<string | null>(null);
  const [history, setHistory] = useState<Record<string, "complete" | "partial" | "rest">>({});

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
    const savedBest = localStorage.getItem("ascend-best-streak");
    const savedDate = localStorage.getItem("ascend-last-evaluated");
    const savedHistory = localStorage.getItem("ascend-history");
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedBest) setBestStreak(parseInt(savedBest));
    if (savedDate) setLastEvaluatedDate(savedDate);
    if (savedHistory) setHistory(JSON.parse(savedHistory));
  }, []);

  useEffect(() => {
    localStorage.setItem("ascend-streak", String(streak));
  }, [streak]);

  useEffect(() => {
    localStorage.setItem("ascend-best-streak", String(bestStreak));
  }, [bestStreak]);

  useEffect(() => {
    localStorage.setItem("ascend-history", JSON.stringify(history));
  }, [history]);

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

    let outcome: "complete" | "partial" | "rest";

    if (yesterdaysGoals.length === 0) {
      outcome = "rest";
    } else {
      const allCompleted = yesterdaysGoals.every((g) => g.completed);
      if (allCompleted) {
        outcome = "complete";
        setStreak((s) => {
          const next = s + 1;
          setBestStreak((b) => Math.max(b, next));
          return next;
        });
      } else {
        outcome = "partial";
        setStreak(0);
      }
    }

    setHistory((h) => ({ ...h, [yesterday]: outcome }));
    setLastEvaluatedDate(today);
  }, [goals, lastEvaluatedDate]);

  function addGoal() {
    if (input.trim() === "") return;
    const color = ACCENTS[goals.length % ACCENTS.length];
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
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.15 } }}
        transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
        className="group mb-2 overflow-hidden rounded-xl border border-[--border] bg-[--bg-elevated] shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all hover:border-stone-300 hover:shadow-[0_2px_4px_rgba(0,0,0,0.04)] dark:hover:border-stone-700"
      >
        <div className="flex items-center gap-3 px-4 py-3.5">
          <Checkbox
            checked={goal.completed}
            onChange={() => toggleComplete(goal.id)}
            color={goal.color}
            size={22}
          />
          <button
            onClick={() => toggleExpanded(goal.id)}
            className="flex flex-1 items-center justify-between text-left"
          >
            <span
              className={`text-[15px] transition-colors ${
                goal.completed
                  ? "text-[--text-subtle] line-through"
                  : "text-[--text]"
              }`}
            >
              {goal.text}
            </span>
            <div className="flex items-center gap-3">
              {taskTotalCount > 0 && (
                <span className="rounded-md bg-stone-100 px-1.5 py-0.5 font-mono text-[11px] tabular-nums text-[--text-muted] dark:bg-stone-800">
                  {taskCompletedCount}/{taskTotalCount}
                </span>
              )}
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.15 }}
                className="text-[--text-subtle]"
              >
                <ChevronDown size={14} />
              </motion.span>
            </div>
          </button>

          {!isLockedToday &&
            (isLockedTomorrow ? (
              <button
                onClick={() => unlock(goal.id)}
                className="rounded p-1 text-[--text-muted] transition-colors hover:bg-stone-100 hover:text-[--text] dark:hover:bg-stone-800"
                title="Unlock"
                aria-label="Unlock goal from tomorrow"
              >
                <Lock size={14} />
              </button>
            ) : (
              <button
                onClick={() => lockInForTomorrow(goal.id)}
                className="rounded p-1 text-[--text-subtle] opacity-0 transition-all hover:bg-stone-100 hover:text-[--text] group-hover:opacity-100 dark:hover:bg-stone-800"
                title="Lock in for tomorrow"
                aria-label="Lock in for tomorrow"
              >
                <Plus size={14} />
              </button>
            ))}

          <button
            onClick={() => deleteGoal(goal.id)}
            className="rounded p-1 text-[--text-subtle] opacity-0 transition-all hover:bg-stone-100 hover:text-[--text] group-hover:opacity-100 dark:hover:bg-stone-800"
            aria-label="Delete goal"
          >
            <X size={14} />
          </button>
        </div>

        <AnimatePresence initial={false}>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="border-t border-[--border] bg-stone-50 px-4 py-3 dark:bg-stone-900/50">
                <div className="mb-3 flex gap-2">
                  <input
                    type="text"
                    value={taskInput}
                    onChange={(e) => setTaskInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") addTask(goal.id);
                    }}
                    placeholder="Add a task"
                    className="flex-1 rounded border border-[--border] bg-[--bg-elevated] px-3 py-1.5 text-sm text-[--text] placeholder-[--text-subtle]"
                  />
                  <button
                    onClick={() => addTask(goal.id)}
                    className="rounded bg-[--text] px-3 py-1.5 text-sm font-medium text-[--bg-elevated] transition-opacity hover:opacity-80"
                  >
                    Add
                  </button>
                </div>

                {goal.tasks.length === 0 ? (
                  <p className="text-xs italic text-[--text-subtle]">
                    No tasks yet
                  </p>
                ) : (
                  <ul className="space-y-1">
                    <AnimatePresence initial={false}>
                      {goal.tasks.map((task) => (
                        <motion.li
                          key={task.id}
                          layout
                          initial={{ opacity: 0, x: -4 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, transition: { duration: 0.1 } }}
                          transition={{ duration: 0.15 }}
                          className="group/task flex items-center gap-2.5 py-1 text-sm"
                        >
                          <Checkbox
                            checked={task.completed}
                            onChange={() => {
                              toggleTask(goal.id, task.id);
                              if (!task.completed) celebrate();
                            }}
                            color={goal.color}
                            size={16}
                          />
                          <span
                            className={`flex-1 ${
                              task.completed
                                ? "text-[--text-subtle] line-through"
                                : "text-[--text]"
                            }`}
                          >
                            {task.text}
                          </span>
                          <button
                            onClick={() => deleteTask(goal.id, task.id)}
                            className="rounded p-0.5 text-[--text-subtle] opacity-0 transition-opacity hover:text-[--text] group-hover/task:opacity-100"
                            aria-label="Delete task"
                          >
                            <X size={12} />
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
    <main className="min-h-dvh px-5 py-12 sm:px-8">
      <div className="fixed right-5 top-5 z-10 flex gap-2">
        <Link
          href="/stats"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[--border] bg-[--bg-elevated] text-[--text-muted] transition-colors hover:text-[--text]"
          aria-label="View stats"
        >
          <BarChart3 size={16} />
        </Link>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-[--border] bg-[--bg-elevated] text-[--text-muted] transition-colors hover:text-[--text]"
          aria-label="Toggle dark mode"
        >
          {darkMode ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </div>

      <div className="mx-auto flex max-w-md flex-col">
        <header className="mb-10 flex items-center gap-3">
          <MountainMark size={28} color="var(--color-accent)" />
          <h1
            className="font-serif text-[32px] font-medium leading-none tracking-tight text-[--text]"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Ascend
          </h1>
        </header>

        <div className="mb-8 flex items-end justify-between">
          <p className="text-sm text-[--text-muted]">
            Set your goals. Climb daily.
          </p>
          <motion.div
            key={streak}
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-1.5 rounded-full border border-[--color-accent-border] bg-[--color-accent-soft] px-2.5 py-1 dark:border-orange-900/60 dark:bg-orange-950/30"
          >
            <MountainMark size={11} color="var(--color-accent)" />
            <span className="text-xs font-medium tabular-nums text-[--color-accent-text] dark:text-orange-300">
              {streak} {streak === 1 ? "day" : "days"}
            </span>
          </motion.div>
        </div>

        <div className="mb-12 flex gap-2 rounded-lg border border-[--border] bg-[--bg-elevated] p-1.5">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") addGoal();
            }}
            placeholder="What's your goal?"
            className="flex-1 bg-transparent px-2 py-1.5 text-[15px] text-[--text] placeholder-[--text-subtle]"
          />
          <button
            onClick={addGoal}
            className="rounded-md bg-[--text] px-4 py-1.5 text-sm font-medium text-[--bg-elevated] transition-opacity hover:opacity-80"
          >
            Add
          </button>
        </div>

        <section className="mb-10">
          <div className="mb-3 flex items-baseline justify-between">
            <h2
              className="font-serif text-lg font-medium text-[--text]"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              Today
            </h2>
            {todayTotalCount > 0 && (
              <span className="font-mono text-xs tabular-nums text-[--text-muted]">
                {todayCompletedCount}/{todayTotalCount}
              </span>
            )}
          </div>
          {todaysGoals.length === 0 ? (
            <div className="rounded-lg border border-dashed border-[--border] px-4 py-6 text-center">
              <p className="text-sm text-[--text-muted]">
                Nothing locked in for today.
              </p>
              <p className="mt-1 text-xs text-[--text-subtle]">
                Lock in goals below for tomorrow.
              </p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {todaysGoals.map((goal) => renderGoalCard(goal))}
            </AnimatePresence>
          )}
        </section>

        <section className="mb-10">
          <div className="mb-3 flex items-baseline justify-between">
            <h2
              className="font-serif text-lg font-medium text-[--text]"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              Tomorrow
            </h2>
            {tomorrowsGoals.length > 0 && (
              <span className="font-mono text-xs tabular-nums text-[--text-muted]">
                {tomorrowsGoals.length} locked in
              </span>
            )}
          </div>
          {tomorrowsGoals.length === 0 ? (
            <p className="text-sm italic text-[--text-subtle]">
              Lock in goals from below.
            </p>
          ) : (
            <AnimatePresence initial={false}>
              {tomorrowsGoals.map((goal) => renderGoalCard(goal))}
            </AnimatePresence>
          )}
        </section>

        <section className="mb-10">
          <div className="mb-3 flex items-baseline justify-between">
            <h2
              className="font-serif text-lg font-medium text-[--text]"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              All goals
            </h2>
            {otherGoals.length > 0 && (
              <span className="font-mono text-xs tabular-nums text-[--text-muted]">
                {otherGoals.length}
              </span>
            )}
          </div>
          {otherGoals.length === 0 ? (
            <p className="text-sm italic text-[--text-subtle]">
              No unlocked goals.
            </p>
          ) : (
            <AnimatePresence initial={false}>
              {otherGoals.map((goal) => renderGoalCard(goal))}
            </AnimatePresence>
          )}
        </section>
      </div>
    </main>
  );
}