"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Navbar from "@/app/components/Navbar";

interface Exercise {
  name: string;
  sets: number;
  reps: number;
  rest: string;
  notes?: string;
}

interface WarmupCooldown {
  exercise: string;
  duration: string;
}

interface Workout {
  id: string;
  name: string;
  notes: string;
  exercises: Exercise[];
  warmup: WarmupCooldown[];
  cooldown: WarmupCooldown[];
  duration_mins: number;
  difficulty: string;
  equipment_needed: string;
  completed: boolean;
}

export default function WorkoutDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkedExercises, setCheckedExercises] = useState<Set<number>>(
    new Set()
  );

  useEffect(() => {
    fetchWorkout();
  }, []);

  const fetchWorkout = async () => {
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
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        router.push("/dashboard");
        return;
      }

      setWorkout(data);
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const toggleExercise = (index: number) => {
    setCheckedExercises((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const markComplete = async () => {
    if (!workout) return;
    const supabase = createClient();
    await supabase
      .from("workout_plans")
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq("id", workout.id);

    setWorkout({ ...workout, completed: true });
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

  if (!workout) return null;

  const completedCount = checkedExercises.size;
  const totalExercises = workout.exercises?.length || 0;

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-14 sm:pt-16 pb-16 sm:pb-[4.5rem]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Back link */}
        <button
          onClick={() => router.push("/dashboard")}
          className="text-sm font-semibold text-gray-500 hover:text-black transition-colors mb-8 block"
        >
          &larr; BACK TO DASHBOARD
        </button>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs tracking-wide text-gray-500 uppercase">
              {workout.difficulty}
            </span>
            {workout.completed && (
              <span className="text-xs tracking-wide text-white bg-emerald-500 px-2.5 py-1 rounded-full">
                COMPLETED
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-black mb-4">
            {workout.name}
          </h1>
          <p className="text-gray-600 text-lg">{workout.notes}</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-8 sm:mb-12">
          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
            <div className="text-xs tracking-wide text-gray-500 mb-1">
              DURATION
            </div>
            <div className="text-2xl font-extrabold text-black">
              {workout.duration_mins} min
            </div>
          </div>
          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
            <div className="text-xs tracking-wide text-gray-500 mb-1">
              DIFFICULTY
            </div>
            <div className="text-2xl font-extrabold text-black capitalize">
              {workout.difficulty}
            </div>
          </div>
          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
            <div className="text-xs tracking-wide text-gray-500 mb-1">
              EQUIPMENT
            </div>
            <div className="text-2xl font-extrabold text-black capitalize">
              {workout.equipment_needed || "None"}
            </div>
          </div>
        </div>

        {/* Warmup */}
        {workout.warmup && workout.warmup.length > 0 && (
          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm mb-6">
            <h2 className="text-lg font-bold text-black mb-4">WARM-UP</h2>
            <ul className="space-y-3">
              {workout.warmup.map((item: WarmupCooldown, index: number) => (
                <li
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="font-semibold text-black">
                    {item.exercise}
                  </span>
                  <span className="text-sm text-gray-500">{item.duration}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Exercises */}
        <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm mb-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold text-black">EXERCISES</h2>
            <span className="text-sm text-gray-500">
              {completedCount}/{totalExercises} done
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-gray-100 rounded-full mb-6">
            <div
              className="h-1.5 bg-emerald-500 rounded-full transition-all duration-300"
              style={{
                width: `${totalExercises > 0 ? (completedCount / totalExercises) * 100 : 0}%`,
              }}
            />
          </div>

          <ul className="space-y-4">
            {workout.exercises?.map((exercise: Exercise, index: number) => (
              <li
                key={index}
                className={`p-4 border rounded-xl transition-all cursor-pointer ${
                  checkedExercises.has(index)
                    ? "border-emerald-500 bg-emerald-50"
                    : "border-gray-200 hover:border-gray-400"
                }`}
                onClick={() => toggleExercise(index)}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`flex-shrink-0 w-6 h-6 border-2 rounded-md flex items-center justify-center mt-0.5 ${
                      checkedExercises.has(index)
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-gray-300"
                    }`}
                  >
                    {checkedExercises.has(index) && (
                      <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <div
                      className={`font-bold text-black ${checkedExercises.has(index) ? "line-through opacity-50" : ""}`}
                    >
                      {exercise.name}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      {exercise.sets} sets &times; {exercise.reps} reps
                      &middot; Rest {exercise.rest}
                    </div>
                    {exercise.notes && (
                      <div className="text-xs text-gray-400 mt-1">
                        {exercise.notes}
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Cooldown */}
        {workout.cooldown && workout.cooldown.length > 0 && (
          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm mb-8">
            <h2 className="text-lg font-bold text-black mb-4">COOL-DOWN</h2>
            <ul className="space-y-3">
              {workout.cooldown.map((item: WarmupCooldown, index: number) => (
                <li
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <span className="font-semibold text-black">
                    {item.exercise}
                  </span>
                  <span className="text-sm text-gray-500">{item.duration}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Complete button */}
        {!workout.completed && (
          <button
            onClick={markComplete}
            disabled={completedCount < totalExercises}
            className="w-full py-4 bg-[#0D0F11] text-white text-sm font-semibold tracking-wide rounded-xl hover:bg-[#1a1d21] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {completedCount < totalExercises
              ? `COMPLETE ALL EXERCISES TO FINISH (${completedCount}/${totalExercises})`
              : "MARK WORKOUT AS COMPLETE"}
          </button>
        )}
      </main>
    </div>
  );
}
