import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { generateMealRecipe } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();
    console.log("[MEALS API] Request received for userId:", userId);

    // Get user profile
    const supabase = await createServerSupabaseClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    console.log("[MEALS API] Profile query result:", { hasProfile: !!profile, hasError: !!error, errorCode: error?.code });

    if (error || !profile) {
      console.log("[MEALS API] Returning 404 - no profile found");
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    console.log("[MEALS API] Profile found, generating meals...");

    // Generate meals for today
    const today = new Date().toISOString().split("T")[0];

    const meals = await Promise.all([
      generateMealRecipe("breakfast", profile),
      generateMealRecipe("lunch", profile),
      generateMealRecipe("dinner", profile),
    ]);

    // Save recipes and meal plans to database
    const savedMeals = await Promise.all(
      meals.map(async (meal, index) => {
        const mealType = ["breakfast", "lunch", "dinner"][index];

        // Insert recipe
        const { data: recipe, error: recipeError } = await supabase
          .from("recipes")
          .insert({
            user_id: userId,
            name: meal.name,
            description: meal.description,
            ingredients: meal.ingredients,
            instructions: meal.instructions,
            calories: meal.calories,
            protein_g: meal.protein_g,
            carbs_g: meal.carbs_g,
            fat_g: meal.fat_g,
            prep_time_mins: meal.prep_time_mins,
            estimated_cost_usd: parseFloat(meal.estimated_cost.replace(/[^0-9.]/g, "")),
            estimated_cost_local: parseFloat(meal.estimated_cost.replace(/[^0-9.]/g, "")),
            currency: meal.currency,
            diet_type: profile.diet_type,
            meal_type: mealType,
          })
          .select()
          .single();

        if (recipeError) throw recipeError;

        // Create or update meal plan entry
        const { error: planError } = await supabase.from("meal_plans").upsert(
          {
            user_id: userId,
            date: today,
            meal_type: mealType,
            recipe_id: recipe.id,
          },
          { onConflict: "user_id,date,meal_type" }
        );

        if (planError) throw planError;

        return { ...meal, id: recipe.id, meal_type: mealType };
      })
    );

    return NextResponse.json({ meals: savedMeals });
  } catch (error: any) {
    console.error("Error generating meals:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate meals" },
      { status: 500 }
    );
  }
}
