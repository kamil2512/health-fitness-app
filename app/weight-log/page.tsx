"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Navbar from "@/app/components/Navbar";

interface WeightEntry {
  id: string;
  date: string;
  weight_kg: number;
  notes: string | null;
}

export default function WeightLogPage() {
  const router = useRouter();
  const [entries, setEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [goalWeight, setGoalWeight] = useState<number | null>(null);

  useEffect(() => {
    checkUserAndFetch();
  }, []);

  const checkUserAndFetch = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("goal_weight_kg")
      .eq("id", user.id)
      .single();

    if (profile) {
      setGoalWeight(profile.goal_weight_kg);
    }

    await fetchEntries();
  };

  const fetchEntries = async () => {
    try {
      const response = await fetch("/api/weight-log");
      const data = await response.json();
      if (data.entries) {
        setEntries(data.entries);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch("/api/weight-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weight_kg: parseFloat(weight),
          date,
          notes: notes || undefined,
        }),
      });

      if (!response.ok) throw new Error("Failed to save");

      setWeight("");
      setNotes("");
      await fetchEntries();
    } catch {
      alert("Failed to log weight");
    } finally {
      setSaving(false);
    }
  };

  // Chart data - reverse to show oldest first
  const chartEntries = [...entries].reverse().slice(-30);

  const renderChart = () => {
    if (chartEntries.length < 2) return null;

    const weights = chartEntries.map((e) => e.weight_kg);
    const minW = Math.min(...weights) - 2;
    const maxW = Math.max(...weights) + 2;
    const range = maxW - minW || 1;

    const width = 700;
    const height = 200;
    const padding = 40;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = chartEntries
      .map((entry, i) => {
        const x = padding + (i / (chartEntries.length - 1)) * chartWidth;
        const y =
          padding +
          chartHeight -
          ((entry.weight_kg - minW) / range) * chartHeight;
        return `${x},${y}`;
      })
      .join(" ");

    // Goal line
    const goalY =
      goalWeight !== null
        ? padding +
          chartHeight -
          ((goalWeight - minW) / range) * chartHeight
        : null;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const y = padding + chartHeight * (1 - ratio);
          const val = (minW + range * ratio).toFixed(1);
          return (
            <g key={ratio}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={padding - 8}
                y={y + 4}
                textAnchor="end"
                className="fill-gray-400"
                fontSize="10"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Goal line */}
        {goalY !== null &&
          goalY >= padding &&
          goalY <= padding + chartHeight && (
            <>
              <line
                x1={padding}
                y1={goalY}
                x2={width - padding}
                y2={goalY}
                stroke="#f59e0b"
                strokeWidth="1.5"
                strokeDasharray="6 4"
              />
              <text
                x={width - padding + 4}
                y={goalY + 4}
                className="fill-amber-500"
                fontSize="10"
              >
                Goal
              </text>
            </>
          )}

        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
        />

        {/* Dots */}
        {chartEntries.map((entry, i) => {
          const x = padding + (i / (chartEntries.length - 1)) * chartWidth;
          const y =
            padding +
            chartHeight -
            ((entry.weight_kg - minW) / range) * chartHeight;
          return <circle key={i} cx={x} cy={y} r="3" fill="#10b981" />;
        })}
      </svg>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] pt-14 sm:pt-16 pb-16 sm:pb-[4.5rem]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-2xl font-bold text-black">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-14 sm:pt-16 pb-16 sm:pb-[4.5rem]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-black mb-6 sm:mb-8">
          WEIGHT LOG
        </h1>

        {/* Log Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm mb-8"
        >
          <h2 className="text-lg font-bold text-black mb-4">LOG YOUR WEIGHT</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                WEIGHT (KG)
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                placeholder="70.0"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                DATE
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                NOTES (OPTIONAL)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                placeholder="Morning weigh-in"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="mt-4 px-8 py-3 bg-[#0D0F11] text-white text-sm font-semibold tracking-wide rounded-xl hover:bg-[#1a1d21] transition-colors disabled:bg-gray-300"
          >
            {saving ? "SAVING..." : "LOG WEIGHT"}
          </button>
        </form>

        {/* Chart */}
        {chartEntries.length >= 2 && (
          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm mb-8">
            <h2 className="text-lg font-bold text-black mb-4">
              WEIGHT TREND (LAST 30 ENTRIES)
            </h2>
            {renderChart()}
          </div>
        )}

        {/* History */}
        <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-black mb-4">HISTORY</h2>
          {entries.length === 0 ? (
            <p className="text-gray-500">
              No entries yet. Log your first weight above.
            </p>
          ) : (
            <div className="space-y-2">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <span className="font-semibold text-black">
                      {entry.weight_kg} kg
                    </span>
                    {entry.notes && (
                      <span className="text-gray-500 text-sm ml-3">
                        {entry.notes}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
