"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Navbar from "@/app/components/Navbar";

interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: { name: string; amount: string; cost: string }[];
  instructions: string[];
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  prep_time_mins: number;
  cook_time_mins: number;
  servings: number;
  estimated_cost_usd: number;
  currency: string;
  diet_type: string;
  meal_type: string;
}

export default function RecipeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecipe();
  }, []);

  const fetchRecipe = async () => {
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
        .from("recipes")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        router.push("/dashboard");
        return;
      }

      setRecipe(data);
    } catch {
      router.push("/dashboard");
    } finally {
      setLoading(false);
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

  if (!recipe) return null;

  const totalMacros = recipe.protein_g + recipe.carbs_g + recipe.fat_g;

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
          <div className="text-xs tracking-wide text-gray-500 mb-2 uppercase">
            {recipe.meal_type} &middot; {recipe.diet_type}
          </div>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-black mb-4">
            {recipe.name}
          </h1>
          <p className="text-gray-600 text-lg">{recipe.description}</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
            <div className="text-xs tracking-wide text-gray-500 mb-1">
              CALORIES
            </div>
            <div className="text-2xl font-extrabold text-black">
              {recipe.calories}
            </div>
          </div>
          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
            <div className="text-xs tracking-wide text-gray-500 mb-1">
              PREP TIME
            </div>
            <div className="text-2xl font-extrabold text-black">
              {recipe.prep_time_mins} min
            </div>
          </div>
          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
            <div className="text-xs tracking-wide text-gray-500 mb-1">
              SERVINGS
            </div>
            <div className="text-2xl font-extrabold text-black">
              {recipe.servings || 1}
            </div>
          </div>
          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
            <div className="text-xs tracking-wide text-gray-500 mb-1">
              EST. COST
            </div>
            <div className="text-2xl font-extrabold text-black">
              ${recipe.estimated_cost_usd}
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm mb-8">
          <h2 className="text-lg font-bold text-black mb-4">
            NUTRITIONAL BREAKDOWN
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            <div>
              <div className="text-xs tracking-wide text-gray-500 mb-1">
                PROTEIN
              </div>
              <div className="text-xl font-extrabold text-black">
                {recipe.protein_g}g
              </div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full">
                <div
                  className="h-2 bg-emerald-500 rounded-full"
                  style={{
                    width: `${totalMacros > 0 ? (recipe.protein_g / totalMacros) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="text-xs tracking-wide text-gray-500 mb-1">
                CARBS
              </div>
              <div className="text-xl font-extrabold text-black">
                {recipe.carbs_g}g
              </div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full">
                <div
                  className="h-2 bg-amber-400 rounded-full"
                  style={{
                    width: `${totalMacros > 0 ? (recipe.carbs_g / totalMacros) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
            <div>
              <div className="text-xs tracking-wide text-gray-500 mb-1">
                FAT
              </div>
              <div className="text-xl font-extrabold text-black">
                {recipe.fat_g}g
              </div>
              <div className="mt-2 h-2 bg-gray-100 rounded-full">
                <div
                  className="h-2 bg-rose-400 rounded-full"
                  style={{
                    width: `${totalMacros > 0 ? (recipe.fat_g / totalMacros) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Ingredients */}
        <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm mb-8">
          <h2 className="text-lg font-bold text-black mb-4">INGREDIENTS</h2>
          <ul className="space-y-3">
            {recipe.ingredients.map(
              (
                ingredient: { name: string; amount: string; cost: string },
                index: number
              ) => (
                <li
                  key={index}
                  className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <span className="font-semibold text-black">
                      {ingredient.name}
                    </span>
                    <span className="text-gray-500 ml-2">
                      {ingredient.amount}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {ingredient.cost}
                  </span>
                </li>
              )
            )}
          </ul>
        </div>

        {/* Instructions */}
        <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
          <h2 className="text-lg font-bold text-black mb-4">INSTRUCTIONS</h2>
          <ol className="space-y-4">
            {recipe.instructions.map((step: string, index: number) => (
              <li key={index} className="flex gap-4">
                <span className="flex-shrink-0 w-8 h-8 bg-[#0D0F11] text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {index + 1}
                </span>
                <p className="text-gray-700 leading-relaxed pt-1">{step}</p>
              </li>
            ))}
          </ol>
        </div>
      </main>
    </div>
  );
}
