import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase-server";
import { generateWorkoutPlan } from "@/lib/ai";

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // Get user profile
    const supabase = await createServerSupabaseClient();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    // Generate workout for today
    const workout = await generateWorkoutPlan(profile);

    const today = new Date().toISOString().split("T")[0];

    // Save workout to database (upsert to handle regeneration)
    const { data: savedWorkout, error: workoutError } = await supabase
      .from("workout_plans")
      .upsert(
        {
          user_id: userId,
          date: today,
          name: workout.name,
          exercises: workout.exercises,
          duration_mins: workout.duration_mins,
          equipment_needed: profile.equipment,
          difficulty: workout.difficulty,
          warmup: workout.warmup,
          cooldown: workout.cooldown,
          notes: `Best time: ${workout.best_time}. ${workout.description}`,
        },
        { onConflict: "user_id,date" }
      )
      .select()
      .single();

    if (workoutError) throw workoutError;

    return NextResponse.json({ workout: { ...workout, id: savedWorkout.id } });
  } catch (error: any) {
    console.error("Error generating workout:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate workout" },
      { status: 500 }
    );
  }
}
