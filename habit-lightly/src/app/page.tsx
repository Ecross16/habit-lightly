"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Habit Lightly — full single-file habit tracker (client component)
 * - Add/delete habits with color tags
 * - Mark today's completion per habit (tap-friendly)
 * - Auto-saves to localStorage
 * - Streaks per habit
 * - Today progress bar
 * - 7-day activity heat strip
 * - Lightweight motivational message (seeded by user/day)
 *
 * Tailwind CSS recommended. Mobile-first.
 */

type Habit = {
  id: string;
  name: string;
  color: string;
  createdAt: string; // ISO
  archived?: boolean;
};

type State = {
  userId: string;
  habits: Habit[];
  // days[YYYY-MM-DD] = array of habitIds completed that day
  days: Record<string, string[]>;
  lastSeen?: string; // ISO date
};

const LS_KEY = "HL_STATE_V1";

const DEFAULT_COLORS = [
  "#ef4444", // red-500
  "#f59e0b", // amber-500
  "#22c55e", // green-500
  "#06b6d4", // cyan-500
  "#3b82f6", // blue-500
  "#a855f7", // purple-500
  "#ec4899", // pink-500
];

function uid() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return "id-" + Math.random().toString(36).slice(2, 10);
}

function toLocalDateKey(d = new Date()) {
  // YYYY-MM-DD in local time
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function shiftLocalDateKey(key: string, days: number) {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + days);
  return toLocalDateKey(dt);
}

function getStreak(habitId: string, days: Record<string, string[]>, todayKey = toLocalDateKey()) {
  let streak = 0;
  let cursor = todayKey;
  // count backwards as long as the habit is in that day
  // include today if completed
  while (days[cursor]?.includes(habitId)) {
    streak += 1;
    cursor = shiftLocalDateKey(cursor, -1);
  }
  return streak;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function pick<T>(arr: T[], indexSeed: number) {
  if (arr.length === 0) return undefined as unknown as T;
  const i = Math.abs(indexSeed) % arr.length;
  return arr[i];
}

// Simple, built-in messages so this file is self-contained.
// If you prefer your lib, swap `getDailyMessage` with your own `getMessageForUser(userId)`.
const MESSAGES = [
  "Your next win starts here.",
  "Small steps, steady light.",
  "Make it easy. Make it daily.",
  "Show up for five minutes—then keep going.",
  "Direction over speed. Consistency over intensity.",
  "Momentum is your superpower.",
  "Little by little becomes a lot.",
];

function stableHash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
  return h | 0;
}

function getDailyMessage(userId: string, dayKey: string) {
  const seed = stableHash(userId + "::" + dayKey);
  return pick(MESSAGES, seed);
}

export default function Home() {
  const [state, setState] = useState<State | null>(null);
  const [newHabitName, setNewHabitName] = useState("");
  const [color, setColor] = useState(DEFAULT_COLORS[0]);
  const todayKey = toLocalDateKey();

  // hydrate from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const saved: State = JSON.parse(raw);
        setState(saved);
      } else {
        const initial: State = {
          userId: uid(),
          habits: [
            {
              id: uid(),
              name: "Check-in",
              color: "#22c55e",
              createdAt: new Date().toISOString(),
            },
          ],
          days: {},
          lastSeen: new Date().toISOString(),
        };
        setState(initial);
      }
    } catch {
      // fallback if parse fails
      setState({
        userId: uid(),
        habits: [],
        days: {},
        lastSeen: new Date().toISOString(),
      });
    }
  }, []);

  // persist on change (debounced)
  useEffect(() => {
    if (!state) return;
    const t = setTimeout(() => localStorage.setItem(LS_KEY, JSON.stringify(state)), 150);
    return () => clearTimeout(t);
  }, [state]);

  const activeHabits = useMemo(() => (state?.habits || []).filter(h => !h.archived), [state]);
  const completedToday = useMemo(
    () => new Set(state?.days?.[todayKey] || []),
    [state?.days, todayKey]
  );
  const todayProgress = useMemo(() => {
    const total = activeHabits.length;
    const done = [...completedToday].filter(id => activeHabits.some(h => h.id === id)).length;
    const pct = total === 0 ? 0 : Math.round((done / total) * 100);
    return { total, done, pct };
  }, [activeHabits, completedToday]);

  const weeklyKeys = useMemo(() => {
    const keys: string[] = [];
    for (let i = 6; i >= 0; i--) keys.push(shiftLocalDateKey(todayKey, -i));
    return keys;
  }, [todayKey]);

  const weeklyCounts = useMemo(() => {
    if (!state) return Array(7).fill(0);
    return weeklyKeys.map(k => state.days[k]?.length || 0);
  }, [state, weeklyKeys]);

  const message = useMemo(() => {
    if (!state) return "";
    return getDailyMessage(state.userId, todayKey);
  }, [state, todayKey]);

  function addHabit() {
    const name = newHabitName.trim();
    if (!name) return;
    setState(s => {
      if (!s) return s;
      const exists = s.habits.some(h => h.name.toLowerCase() === name.toLowerCase());
      const newHabit: Habit = {
        id: uid(),
        name,
        color,
        createdAt: new Date().toISOString(),
      };
      return {
        ...s,
        habits: exists ? s.habits : [...s.habits, newHabit],
      };
    });
    setNewHabitName("");
  }

  function deleteHabit(id: string) {
    setState(s => {
      if (!s) return s;
      const nextDays: State["days"] = {};
      for (const [k, arr] of Object.entries(s.days)) {
        nextDays[k] = arr.filter(hid => hid !== id);
      }
      return {
        ...s,
        habits: s.habits.filter(h => h.id !== id),
        days: nextDays,
      };
    });
  }

  function toggleToday(habitId: string) {
    setState(s => {
      if (!s) return s;
      const current = new Set(s.days[todayKey] || []);
      if (current.has(habitId)) current.delete(habitId);
      else current.add(habitId);
      return {
        ...s,
        days: { ...s.days, [todayKey]: [...current] },
      };
    });
  }

  function markDay(habitId: string, dayKey: string, done: boolean) {
    setState(s => {
      if (!s) return s;
      const current = new Set(s.days[dayKey] || []);
      if (done) current.add(habitId);
      else current.delete(habitId);
      return {
        ...s,
        days: { ...s.days, [dayKey]: [...current] },
      };
    });
  }

  function streakFor(habitId: string) {
    if (!state) return 0;
    return getStreak(habitId, state.days, todayKey);
  }

  if (!state) {
    return (
      <main className="flex h-screen items-center justify-center bg-neutral-900 text-neutral-100">
        <div className="animate-pulse text-center">
          <div className="mb-3 h-3 w-40 rounded bg-neutral-700" />
          <div className="mx-auto mb-2 h-7 w-56 rounded bg-neutral-700" />
          <div className="mx-auto h-7 w-40 rounded bg-neutral-700" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-600 via-violet-600 to-purple-700 text-white">
      <div className="mx-auto max-w-md px-5 pb-20 pt-10">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-3xl font-extrabold tracking-tight">Habit Lightly</h1>
          <p className="mt-2 text-sm opacity-90">{message}</p>
        </header>

        {/* Add habit */}
        <section className="mb-6 rounded-xl bg-white/10 p-4 backdrop-blur">
          <div className="mb-3 flex gap-2 overflow-x-auto">
            {DEFAULT_COLORS.map(c => (
              <button
                key={c}
                aria-label={`choose color ${c}`}
                className="h-8 w-8 shrink-0 rounded-full ring-offset-2 transition hover:scale-105"
                style={{
                  backgroundColor: c,
                  outline: color === c ? "3px solid rgba(255,255,255,0.9)" : "none",
                }}
                onClick={() => setColor(c)}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addHabit()}
              placeholder="Add a habit (e.g., Drink water)"
              className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-white placeholder-white/70 outline-none focus:border-white"
            />
            <button
              onClick={addHabit}
              className="rounded-lg bg-white px-3 py-2 text-sm font-semibold text-indigo-700 disabled:opacity-60"
              disabled={!newHabitName.trim()}
            >
              Add
            </button>
          </div>
        </section>

        {/* Today progress */}
        <section className="mb-6">
          <div className="mb-2 flex items-end justify-between">
            <span className="text-sm opacity-90">Today</span>
            <span className="text-sm opacity-90">
              {todayProgress.done}/{todayProgress.total} · {todayProgress.pct}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/20">
            <div
              className="h-full rounded-full bg-white"
              style={{ width: `${todayProgress.pct}%` }}
            />
          </div>
        </section>

        {/* Habit list */}
        <section className="space-y-3">
          {activeHabits.length === 0 && (
            <div className="rounded-xl bg-white/10 p-4 text-sm opacity-90">
              No habits yet. Add one above to get started.
            </div>
          )}

          {activeHabits.map((habit) => {
            const done = completedToday.has(habit.id);
            const streak = streakFor(habit.id);
            return (
              <div
                key={habit.id}
                className="flex items-center justify-between rounded-xl bg-white/10 p-3"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="inline-block h-4 w-4 rounded-full ring-2 ring-white/60"
                    style={{ backgroundColor: habit.color }}
                  />
                  <div>
                    <div className="text-base font-semibold">{habit.name}</div>
                    <div className="mt-0.5 text-xs opacity-90">
                      Streak: <span className="font-bold">{streak}</span> day{streak === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleToday(habit.id)}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
                      done
                        ? "bg-white text-indigo-700"
                        : "bg-white/15 text-white hover:bg-white/25"
                    }`}
                    aria-pressed={done}
                  >
                    {done ? "Done" : "Mark"}
                  </button>
                  <button
                    onClick={() => deleteHabit(habit.id)}
                    className="rounded-lg bg-white/10 px-2 py-2 text-xs text-white/90 hover:bg-white/20"
                    aria-label={`Delete ${habit.name}`}
                    title="Delete habit"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })}
        </section>

        {/* Weekly strip (7 days, total completions heat) */}
        <section className="mt-8 rounded-xl bg-white/10 p-4">
          <div className="mb-2 text-sm opacity-90">Past 7 days</div>
          <div className="grid grid-cols-7 gap-2">
            {weeklyKeys.map((k, i) => {
              const count = weeklyCounts[i];
              // scale lightness by count vs max possible (activeHabits.length)
              const ratio =
                activeHabits.length > 0 ? clamp(count / activeHabits.length, 0, 1) : 0;
              const bg = `rgba(255,255,255,${0.15 + 0.6 * ratio})`;
              const isToday = k === todayKey;
              return (
                <div key={k} className="flex flex-col items-center text-xs">
                  <div
                    className={`h-8 w-8 rounded-md ring-1 ring-white/30 ${isToday ? "ring-2" : ""}`}
                    style={{ backgroundColor: bg }}
                    title={`${k}: ${count} completion${count === 1 ? "" : "s"}`}
                    onClick={() => {
                      // quick toggle overall: mark/unmark the first habit for that day to encourage retro actions
                      const first = activeHabits[0]?.id;
                      if (first) {
                        const has = state.days[k]?.includes(first) ?? false;
                        markDay(first, k, !has);
                      }
                    }}
                  />
                  <span className="mt-1 opacity-80">{k.slice(5).replace("-", "/")}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Footer spacing for mobile */}
        <div className="h-12" />
      </div>
    </main>
  );
}