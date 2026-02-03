"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";
import Navbar from "@/app/components/Navbar";

interface Profile {
  id: string;
  name: string;
  weight_kg: number;
  goal_weight_kg: number;
  goal_type: string;
  diet_type: string;
  equipment: string;
}

interface Meal {
  id: string;
  name: string;
  description: string;
  calories: number;
  prep_time_mins: number;
  estimated_cost_usd: number;
  currency: string;
}

interface Workout {
  id: string;
  name: string;
  duration_mins: number;
  difficulty: string;
  notes: string;
}

interface WeightEntry {
  date: string;
  weight_kg: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [meals, setMeals] = useState<{
    breakfast?: Meal;
    lunch?: Meal;
    dinner?: Meal;
  }>({});
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch user profile
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !profileData) {
        router.push("/onboarding");
        return;
      }

      setProfile(profileData);

      // Fetch today's plans and weight log in parallel
      await Promise.all([
        fetchTodaysPlan(user.id),
        fetchWeightLog(user.id),
      ]);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTodaysPlan = async (userId: string) => {
    const supabase = createClient();
    const today = new Date().toISOString().split("T")[0];

    const { data: mealPlans } = await supabase
      .from("meal_plans")
      .select(
        `
        meal_type,
        recipes (
          id,
          name,
          description,
          calories,
          prep_time_mins,
          estimated_cost_usd,
          currency
        )
      `
      )
      .eq("user_id", userId)
      .eq("date", today);

    if (mealPlans) {
      const mealsData: any = {};
      mealPlans.forEach((plan: any) => {
        if (plan.recipes) {
          mealsData[plan.meal_type] = plan.recipes;
        }
      });
      setMeals(mealsData);
    }

    const { data: workoutData } = await supabase
      .from("workout_plans")
      .select("*")
      .eq("user_id", userId)
      .eq("date", today)
      .single();

    if (workoutData) {
      setWorkout(workoutData);
    }
  };

  const fetchWeightLog = async (userId: string) => {
    const supabase = createClient();
    const { data } = await supabase
      .from("weight_log")
      .select("date, weight_kg")
      .eq("user_id", userId)
      .order("date", { ascending: true })
      .limit(14);

    if (data) {
      setWeightEntries(data);
    }
  };

  const generatePlan = async () => {
    if (!profile) return;

    setGenerating(true);
    try {
      const [mealsResponse, workoutResponse] = await Promise.all([
        fetch("/api/generate-meals", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: profile.id }),
        }),
        fetch("/api/generate-workout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: profile.id }),
        }),
      ]);

      if (!mealsResponse.ok) {
        const err = await mealsResponse.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate meals");
      }
      if (!workoutResponse.ok) {
        const err = await workoutResponse.json().catch(() => ({}));
        throw new Error(err.error || "Failed to generate workout");
      }

      const mealsData = await mealsResponse.json();
      const workoutData = await workoutResponse.json();

      const mealsObj: any = {};
      mealsData.meals.forEach((meal: any) => {
        mealsObj[meal.meal_type] = meal;
      });
      setMeals(mealsObj);
      setWorkout(workoutData.workout);
    } catch (error: any) {
      alert(error.message || "Failed to generate plan");
    } finally {
      setGenerating(false);
    }
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

  if (!profile) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] pt-14 sm:pt-16 pb-16 sm:pb-[4.5rem]">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <div className="text-center">
            <p className="text-xl text-black mb-4">Profile not found</p>
            <Link href="/onboarding" className="text-black underline">
              Complete onboarding
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hasPlan = meals.breakfast || meals.lunch || meals.dinner || workout;

  const totalCalories =
    (meals.breakfast?.calories || 0) +
    (meals.lunch?.calories || 0) +
    (meals.dinner?.calories || 0);

  // Mini weight chart
  const renderMiniChart = () => {
    if (weightEntries.length < 2) return null;

    const weights = weightEntries.map((e) => e.weight_kg);
    const minW = Math.min(...weights) - 1;
    const maxW = Math.max(...weights) + 1;
    const range = maxW - minW || 1;

    const width = 300;
    const height = 80;
    const padding = 8;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const points = weightEntries
      .map((entry, i) => {
        const x =
          padding + (i / (weightEntries.length - 1)) * chartWidth;
        const y =
          padding +
          chartHeight -
          ((entry.weight_kg - minW) / range) * chartHeight;
        return `${x},${y}`;
      })
      .join(" ");

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto">
        <polyline
          points={points}
          fill="none"
          stroke="#10b981"
          strokeWidth="2"
        />
        {weightEntries.map((entry, i) => {
          const x =
            padding + (i / (weightEntries.length - 1)) * chartWidth;
          const y =
            padding +
            chartHeight -
            ((entry.weight_kg - minW) / range) * chartHeight;
          return <circle key={i} cx={x} cy={y} r="2" fill="#10b981" />;
        })}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-14 sm:pt-16 pb-16 sm:pb-[4.5rem]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Welcome Section */}
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-black mb-2">
            Welcome back, {profile.name}
          </h1>
          <p className="text-gray-600">{today}</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="text-xs tracking-wide text-gray-500 mb-2">
              CURRENT WEIGHT
            </div>
            <div className="text-3xl font-extrabold text-[#111827]">
              {profile.weight_kg} kg
            </div>
          </div>

          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="text-xs tracking-wide text-gray-500 mb-2">
              GOAL WEIGHT
            </div>
            <div className="text-3xl font-extrabold text-[#111827]">
              {profile.goal_weight_kg} kg
            </div>
          </div>

          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="text-xs tracking-wide text-gray-500 mb-2">
              GOAL
            </div>
            <div className="text-3xl font-extrabold text-[#111827] capitalize">
              {profile.goal_type}
            </div>
          </div>

          {hasPlan && (
            <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-xs tracking-wide text-gray-500 mb-2">
                TODAY'S CALORIES
              </div>
              <div className="text-3xl font-extrabold text-[#111827]">
                {totalCalories}
              </div>
            </div>
          )}
        </div>

        {/* Weight Trend */}
        {weightEntries.length >= 2 && (
          <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm mb-12">
            <div className="flex justify-between items-center mb-4">
              <div className="text-xs tracking-wide text-gray-500">
                WEIGHT TREND
              </div>
              <Link
                href="/weight-log"
                className="text-xs font-semibold text-gray-500 hover:text-black transition-colors"
              >
                VIEW ALL &rarr;
              </Link>
            </div>
            {renderMiniChart()}
          </div>
        )}

        {!hasPlan ? (
          /* CTA to Generate Plan */
          <div className="bg-gradient-to-br from-[#0D0F11] to-[#1a1d21] text-white p-6 sm:p-12 text-center mb-8 sm:mb-12 rounded-2xl">
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-4">Ready to Start?</h2>
            <p className="text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto text-sm sm:text-base">
              We'll use AI to generate personalized meal plans and workout
              routines based on your health metrics and goals.
            </p>
            <button
              onClick={generatePlan}
              disabled={generating}
              className="px-10 py-4 bg-white text-black text-sm font-semibold tracking-wide rounded-xl hover:bg-gray-100 transition-colors disabled:bg-gray-300"
            >
              {generating ? "GENERATING..." : "GENERATE MY PLAN"}
            </button>
          </div>
        ) : (
          <>
            {/* Today's Meals */}
            <div className="mb-12">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-black">
                  TODAY'S MEALS
                </h2>
                <button
                  onClick={generatePlan}
                  disabled={generating}
                  className="px-6 py-2 border border-[#0D0F11] text-black text-xs font-semibold rounded-xl hover:bg-[#0D0F11] hover:text-white transition-colors disabled:bg-gray-300"
                >
                  {generating ? "REGENERATING..." : "REGENERATE"}
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                {(["breakfast", "lunch", "dinner"] as const).map(
                  (mealType) => {
                    const meal = meals[mealType];
                    return (
                      <div
                        key={mealType}
                        className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="text-xs tracking-wide text-gray-500 mb-3 uppercase">
                          {mealType}
                        </div>
                        {meal ? (
                          <Link href={`/recipe/${meal.id}`} className="block">
                            <h3 className="text-lg font-bold text-black mb-2 hover:underline">
                              {meal.name}
                            </h3>
                            <p className="text-sm text-gray-600 mb-4">
                              {meal.description}
                            </p>
                            <div className="text-xs text-gray-500 space-y-1">
                              <div>{meal.calories} cal</div>
                              <div>{meal.prep_time_mins} mins</div>
                              <div>~${meal.estimated_cost_usd}</div>
                            </div>
                          </Link>
                        ) : (
                          <p className="text-gray-500">No meal planned</p>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>

            {/* Today's Workout */}
            <div className="mb-12">
              <h2 className="text-2xl font-extrabold text-black mb-6">
                TODAY'S WORKOUT
              </h2>
              <div className="bg-white p-5 sm:p-8 border border-gray-200 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
                {workout ? (
                  <Link href={`/workout/${workout.id}`} className="block">
                    <div className="text-xs tracking-wide text-gray-500 mb-3">
                      WORKOUT PLAN
                    </div>
                    <h3 className="text-xl font-bold text-black mb-4 hover:underline">
                      {workout.name}
                    </h3>
                    <p className="text-gray-600 mb-6">{workout.notes}</p>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          DURATION
                        </div>
                        <div className="font-semibold text-black">
                          {workout.duration_mins} min
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          DIFFICULTY
                        </div>
                        <div className="font-semibold text-black capitalize">
                          {workout.difficulty}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 mb-1">
                          EQUIPMENT
                        </div>
                        <div className="font-semibold text-black capitalize">
                          {profile.equipment || "None"}
                        </div>
                      </div>
                    </div>
                  </Link>
                ) : (
                  <p className="text-gray-500">No workout planned</p>
                )}
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
