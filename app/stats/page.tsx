"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";

type Outcome = "complete" | "partial" | "rest";
type History = Record<string, Outcome>;

function dateString(d: Date): string {
  return d.toISOString().split("T")[0];
}

function buildHeatmapDates(): Date[][] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalDays = 112;
  const start = new Date(today);
  start.setDate(start.getDate() - (totalDays - 1));

  const startDow = start.getDay();
  start.setDate(start.getDate() - startDow);

  const weeks: Date[][] = [];
  const current = new Date(start);

  while (current <= today) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    weeks.push(week);
  }
  return weeks;
}

function outcomeColor(outcome: Outcome | undefined, isFuture: boolean): string {
  if (isFuture) return "transparent";
  if (outcome === "complete") return "#C2410C";
  if (outcome === "partial") return "#FED7AA";
  if (outcome === "rest") return "#F5F5F4";
  return "#F5F5F4";
}

function outcomeColorDark(outcome: Outcome | undefined, isFuture: boolean): string {
  if (isFuture) return "transparent";
  if (outcome === "complete") return "#C2410C";
  if (outcome === "partial") return "#7C2D12";
  if (outcome === "rest") return "#292524";
  return "#1C1917";
}

export default function StatsPage() {
  const [history, setHistory] = useState<History>({});
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [darkMode, setDarkMode] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);

  useEffect(() => {
    const savedHistory = localStorage.getItem("ascend-history");
    const savedStreak = localStorage.getItem("ascend-streak");
    const savedBest = localStorage.getItem("ascend-best-streak");
    const savedDark = localStorage.getItem("ascend-dark-mode");
    if (savedHistory) setHistory(JSON.parse(savedHistory));
    if (savedStreak) setStreak(parseInt(savedStreak));
    if (savedBest) setBestStreak(parseInt(savedBest));
    if (savedDark) setDarkMode(savedDark === "true");
  }, []);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [darkMode]);

  const totalDaysClimbed = Object.values(history).filter(
    (o) => o === "complete"
  ).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = dateString(today);

  function passRate(days: number): { hit: number; total: number } {
    let hit = 0;
    let total = 0;
    for (let i = 1; i <= days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = dateString(d);
      const outcome = history[key];
      if (outcome && outcome !== "rest") {
        total++;
        if (outcome === "complete") hit++;
      }
    }
    return { hit, total };
  }

  const week = passRate(7);
  const month = passRate(30);

  const weeks = buildHeatmapDates();
  const totalEntries = Object.keys(history).length;
  const showEmptyState = totalEntries < 3;

  return (
    <main className="min-h-dvh px-5 py-12 sm:px-8">
      <div className="mx-auto flex max-w-md flex-col">
        <header className="mb-10 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-[--text-muted] transition-colors hover:text-[--text]"
          >
            <ArrowLeft size={16} />
            Back
          </Link>
          <h1
            className="font-serif text-2xl font-medium text-[--text]"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Stats
          </h1>
          <div className="w-12" />
        </header>

        <section className="mb-12 grid grid-cols-3 gap-3">
          <StatCard label="Current" value={streak} />
          <StatCard label="Best" value={bestStreak} />
          <StatCard label="Total" value={totalDaysClimbed} />
        </section>

        <section className="mb-12">
          <div className="mb-4 flex items-baseline justify-between">
            <h2
              className="font-serif text-lg font-medium text-[--text]"
              style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
            >
              The climb
            </h2>
            <p className="text-xs text-[--text-subtle]">Last 16 weeks</p>
          </div>

          <div className="relative rounded-xl border border-[--border] bg-[--bg-elevated] p-4">
            <div className="flex gap-[3px]">
              {weeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {week.map((date, di) => {
                    const key = dateString(date);
                    const outcome = history[key];
                    const isFuture = date > today;
                    const isToday = key === todayStr;
                    const color = darkMode
                      ? outcomeColorDark(outcome, isFuture)
                      : outcomeColor(outcome, isFuture);

                    return (
                      <motion.div
                        key={di}
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          duration: 0.2,
                          delay: (wi * 7 + di) * 0.004,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        onMouseEnter={() => setHoveredDate(key)}
                        onMouseLeave={() => setHoveredDate(null)}
                        className="h-3 w-3 cursor-pointer rounded-[3px]"
                        style={{
                          backgroundColor: color,
                          outline: isToday ? `1.5px solid #C2410C` : "none",
                          outlineOffset: "1px",
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

            {hoveredDate && (
              <div className="mt-3 text-xs text-[--text-muted]">
                <span className="font-medium text-[--text]">
                  {new Date(hoveredDate + "T12:00:00").toLocaleDateString(
                    "en-US",
                    {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                    }
                  )}
                </span>
                <span className="ml-2 text-[--text-subtle]">
                  {history[hoveredDate] === "complete" && "Summited"}
                  {history[hoveredDate] === "partial" && "Partial climb"}
                  {history[hoveredDate] === "rest" && "Rest day"}
                  {!history[hoveredDate] &&
                    (new Date(hoveredDate) > today ? "Future" : "No data")}
                </span>
              </div>
            )}

            <div className="mt-4 flex items-center gap-3 text-[11px] text-[--text-subtle]">
              <span>Less</span>
              <div className="flex gap-[3px]">
                <div
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: darkMode ? "#292524" : "#F5F5F4" }}
                />
                <div
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: darkMode ? "#7C2D12" : "#FED7AA" }}
                />
                <div
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: "#C2410C" }}
                />
              </div>
              <span>More</span>
            </div>

            {showEmptyState && (
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <p className="rounded-md bg-[--bg-elevated]/90 px-3 py-1.5 text-xs font-medium text-[--text-muted]">
                  Start your climb — lock in goals daily
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="mb-12">
          <h2
            className="mb-4 font-serif text-lg font-medium text-[--text]"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            Pass rate
          </h2>

          <div className="space-y-3">
            <PassRateRow label="Last 7 days" hit={week.hit} total={week.total} />
            <PassRateRow label="Last 30 days" hit={month.hit} total={month.total} />
          </div>
        </section>
      </div>
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-[--border] bg-[--bg-elevated] p-4 text-center">
      <p
        className="font-serif text-3xl font-medium leading-none tabular-nums text-[--text]"
        style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
      >
        {value}
      </p>
      <p className="mt-2 text-xs uppercase tracking-wider text-[--text-muted]">
        {label}
      </p>
    </div>
  );
}

function PassRateRow({
  label,
  hit,
  total,
}: {
  label: string;
  hit: number;
  total: number;
}) {
  const pct = total === 0 ? 0 : Math.round((hit / total) * 100);
  return (
    <div className="rounded-lg border border-[--border] bg-[--bg-elevated] px-4 py-3">
      <div className="mb-2 flex items-baseline justify-between">
        <p className="text-sm text-[--text]">{label}</p>
        <p className="font-mono text-xs tabular-nums text-[--text-muted]">
          {hit}/{total || "—"}
          {total > 0 && ` · ${pct}%`}
        </p>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-stone-100 dark:bg-stone-800">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: total === 0 ? "0%" : `${pct}%` }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
          className="h-full rounded-full bg-[--color-accent]"
        />
      </div>
    </div>
  );
}