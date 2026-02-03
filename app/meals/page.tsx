"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";
import Navbar from "@/app/components/Navbar";

interface MealPlan {
  meal_type: string;
  completed: boolean;
  date: string;
  recipes: {
    id: string;
    name: string;
    calories: number;
    prep_time_mins: number;
  } | null;
}

interface GroupedDay {
  date: string;
  meals: MealPlan[];
}

export default function MealsPage() {
  const router = useRouter();
  const [days, setDays] = useState<GroupedDay[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
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
        .from("meal_plans")
        .select(
          `
          meal_type,
          completed,
          date,
          recipes (
            id,
            name,
            calories,
            prep_time_mins
          )
        `
        )
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (error) throw error;

      // Group by date
      const grouped: Record<string, MealPlan[]> = {};
      for (const row of data || []) {
        const meal: MealPlan = {
          meal_type: row.meal_type,
          completed: row.completed,
          date: row.date,
          recipes: Array.isArray(row.recipes) ? row.recipes[0] || null : row.recipes,
        };
        if (!grouped[meal.date]) grouped[meal.date] = [];
        grouped[meal.date].push(meal);
      }

      const sortedDays = Object.entries(grouped)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([date, meals]) => ({ date, meals }));

      setDays(sortedDays);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  const totalMeals = days.reduce((sum, d) => sum + d.meals.length, 0);
  const daysTracked = days.length;
  const totalCalories = days.reduce(
    (sum, d) =>
      sum + d.meals.reduce((s, m) => s + (m.recipes?.calories || 0), 0),
    0
  );
  const avgDailyCalories = daysTracked > 0 ? Math.round(totalCalories / daysTracked) : 0;

  const mealTypeOrder = ["breakfast", "lunch", "dinner", "snack"];

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

  const mealTypeColor: Record<string, string> = {
    breakfast: "bg-amber-100 text-amber-700",
    lunch: "bg-emerald-100 text-emerald-700",
    dinner: "bg-indigo-100 text-indigo-700",
    snack: "bg-pink-100 text-pink-700",
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-14 sm:pt-16 pb-16 sm:pb-[4.5rem]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-black mb-6 sm:mb-8">
          MEALS
        </h1>

        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="text-2xl font-bold text-black">Loading...</div>
          </div>
        ) : days.length === 0 ? (
          <div className="text-center py-24">
            <div className="text-6xl mb-4">🍽</div>
            <h2 className="text-xl font-bold text-black mb-2">No meals yet</h2>
            <p className="text-gray-500 mb-6">
              Generate your first meal plan from the dashboard.
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
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
                <div className="text-xs tracking-wide text-gray-500 mb-1">
                  TOTAL MEALS
                </div>
                <div className="text-2xl font-extrabold text-black">
                  {totalMeals}
                </div>
              </div>
              <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
                <div className="text-xs tracking-wide text-gray-500 mb-1">
                  DAYS TRACKED
                </div>
                <div className="text-2xl font-extrabold text-black">
                  {daysTracked}
                </div>
              </div>
              <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
                <div className="text-xs tracking-wide text-gray-500 mb-1">
                  AVG DAILY CAL
                </div>
                <div className="text-2xl font-extrabold text-black">
                  {avgDailyCalories}
                </div>
              </div>
            </div>

            {/* Timeline grouped by date */}
            <div className="space-y-4">
              {days.map((day) => {
                const sorted = [...day.meals].sort(
                  (a, b) =>
                    mealTypeOrder.indexOf(a.meal_type) -
                    mealTypeOrder.indexOf(b.meal_type)
                );
                const dayCalories = sorted.reduce(
                  (s, m) => s + (m.recipes?.calories || 0),
                  0
                );

                return (
                  <div
                    key={day.date}
                    className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden"
                  >
                    {/* Date header */}
                    <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                      <span className="text-sm font-bold text-black">
                        {formatDate(day.date)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {dayCalories} cal total
                      </span>
                    </div>

                    {/* Meal rows */}
                    <div className="divide-y divide-gray-50">
                      {sorted.map((meal) => (
                        <div
                          key={`${day.date}-${meal.meal_type}`}
                          className="flex items-center gap-3 px-5 py-3"
                        >
                          {/* Meal type pill */}
                          <span
                            className={`px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full whitespace-nowrap ${
                              mealTypeColor[meal.meal_type] ||
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {meal.meal_type}
                          </span>

                          {/* Recipe name */}
                          {meal.recipes ? (
                            <Link
                              href={`/recipe/${meal.recipes.id}`}
                              className="flex-1 text-sm font-medium text-black hover:text-emerald-600 transition-colors truncate"
                            >
                              {meal.recipes.name}
                            </Link>
                          ) : (
                            <span className="flex-1 text-sm text-gray-400 italic">
                              No recipe
                            </span>
                          )}

                          {/* Calories */}
                          {meal.recipes?.calories && (
                            <span className="text-xs text-gray-500 whitespace-nowrap">
                              {meal.recipes.calories} cal
                            </span>
                          )}

                          {/* Prep time */}
                          {meal.recipes?.prep_time_mins && (
                            <span className="text-xs text-gray-400 whitespace-nowrap hidden sm:inline">
                              {meal.recipes.prep_time_mins}m
                            </span>
                          )}

                          {/* Completion status */}
                          {meal.completed ? (
                            <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
                              <svg
                                className="w-3 h-3"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.5"
                                viewBox="0 0 24 24"
                              >
                                <path d="M5 13l4 4L19 7" />
                              </svg>
                            </span>
                          ) : (
                            <span className="w-5 h-5 rounded-full border-2 border-gray-200 flex-shrink-0" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
