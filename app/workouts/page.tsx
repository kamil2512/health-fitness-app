"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import Navbar from "@/app/components/Navbar";

interface Workout {
  id: string;
  date: string;
  name: string;
  notes: string;
  exercises: { name: string; sets: number; reps: number; rest: string }[];
  duration_mins: number;
  difficulty: string;
  completed: boolean;
}

export default function WorkoutsPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data, error } = await supabase
        .from("workout_plans")
        .select("id, date, name, notes, exercises, duration_mins, difficulty, completed")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;

      setWorkouts((data as Workout[]) || []);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const totalWorkouts = workouts.length;
  const completedCount = workouts.filter((w) => w.completed).length;
  const completionRate =
    totalWorkouts > 0 ? Math.round((completedCount / totalWorkouts) * 100) : 0;
  const avgDuration =
    totalWorkouts > 0
      ? Math.round(
          workouts.reduce((s, w) => s + (w.duration_mins || 0), 0) /
            totalWorkouts
        )
      : 0;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.getTime() === today.getTime()) return "Today";
    if (date.getTime() === yesterday.getTime()) return "Yesterday";

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const difficultyStyle: Record<string, string> = {
    beginner: "bg-green-100 text-green-700",
    intermediate: "bg-amber-100 text-amber-700",
    advanced: "bg-rose-100 text-rose-700",
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-14 sm:pt-16 pb-16 sm:pb-[4.5rem]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-black mb-6 sm:mb-8">
          WORKOUTS
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-2xl font-bold text-black">Loading...</div>
          </div>
        ) : workouts.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">💪</div>
            <h2 className="text-xl font-bold text-black mb-2">
              No workouts yet
            </h2>
            <p className="text-gray-500 mb-6">
              Generate your first workout plan from the dashboard.
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-6 py-3 bg-[#0D0F11] text-white text-sm font-semibold rounded-xl hover:bg-[#1a1d21] transition-colors"
            >
              GO TO DASHBOARD
            </Link>
          </div>
        ) : (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
                <div className="text-xs tracking-wide text-gray-500 mb-1">
                  TOTAL WORKOUTS
                </div>
                <div className="text-2xl font-extrabold text-black">
                  {totalWorkouts}
                </div>
              </div>
              <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
                <div className="text-xs tracking-wide text-gray-500 mb-1">
                  COMPLETED
                </div>
                <div className="text-2xl font-extrabold text-black">
                  {completedCount}
                </div>
              </div>
              <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
                <div className="text-xs tracking-wide text-gray-500 mb-1">
                  COMPLETION RATE
                </div>
                <div className="text-2xl font-extrabold text-black">
                  {completionRate}%
                </div>
              </div>
              <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
                <div className="text-xs tracking-wide text-gray-500 mb-1">
                  AVG DURATION
                </div>
                <div className="text-2xl font-extrabold text-black">
                  {avgDuration}m
                </div>
              </div>
            </div>

            {/* 2-column card grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {workouts.map((workout) => {
                const exerciseCount = workout.exercises?.length || 0;

                return (
                  <Link
                    key={workout.id}
                    href={`/workout/${workout.id}`}
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm p-5 hover:border-gray-300 hover:shadow-md transition-all group"
                  >
                    {/* Date + status */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs font-semibold text-gray-500">
                        {formatDate(workout.date)}
                      </span>
                      {workout.completed ? (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-100 text-emerald-700">
                          Done
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-gray-100 text-gray-500">
                          Pending
                        </span>
                      )}
                    </div>

                    {/* Workout name */}
                    <h3 className="text-base font-bold text-black mb-1 group-hover:text-emerald-600 transition-colors">
                      {workout.name}
                    </h3>

                    {/* Notes (truncated) */}
                    {workout.notes && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                        {workout.notes}
                      </p>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-500">
                        {exerciseCount} exercise{exerciseCount !== 1 ? "s" : ""}
                      </span>
                      {workout.duration_mins && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span className="text-xs text-gray-500">
                            {workout.duration_mins}m
                          </span>
                        </>
                      )}
                      {workout.difficulty && (
                        <>
                          <span className="text-gray-300">·</span>
                          <span
                            className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                              difficultyStyle[workout.difficulty] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {workout.difficulty}
                          </span>
                        </>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
