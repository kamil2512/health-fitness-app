async function callOpenRouter(prompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 300000);

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-lite-001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`OpenRouter API error (${response.status}): ${errorBody}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

function cleanJsonResponse(responseText: string): string {
  let clean = responseText.trim();
  if (clean.startsWith("```json")) {
    clean = clean.replace(/```json\n?/, "").replace(/\n?```$/, "");
  } else if (clean.startsWith("```")) {
    clean = clean.replace(/```\n?/, "").replace(/\n?```$/, "");
  }
  return clean;
}

/**
 * Generate a personalized meal recipe using AI
 */
export async function generateMealRecipe(
  mealType: "breakfast" | "lunch" | "dinner",
  profile: {
    age: number;
    gender: string;
    weight_kg: number;
    height_cm: number;
    goal_type: string;
    diet_type: string;
    allergies?: string[];
    city: string;
    country: string;
    blood_pressure_systolic?: number;
    blood_sugar?: number;
  }
) {
  const prompt = `Create a ${mealType} recipe for someone with these details:

Profile:
- Age: ${profile.age}
- Gender: ${profile.gender}
- Current weight: ${profile.weight_kg} kg
- Height: ${profile.height_cm} cm
- Goal: ${profile.goal_type} weight
- Diet type: ${profile.diet_type}
- Food allergies: ${profile.allergies?.join(", ") || "None"}
- Location: ${profile.city}, ${profile.country}
${profile.blood_pressure_systolic ? `- Blood pressure: ${profile.blood_pressure_systolic}/80` : ""}
${profile.blood_sugar ? `- Blood sugar: ${profile.blood_sugar} mg/dL` : ""}

Requirements:
1. Create a healthy ${mealType} recipe suitable for their ${profile.goal_type} weight goal
2. Follow ${profile.diet_type} diet restrictions
3. Avoid any listed allergies
4. Calculate approximate calories and macros (protein, carbs, fat in grams)
5. Estimate ingredient costs in local currency for ${profile.city}, ${profile.country}
6. Provide step-by-step cooking instructions
7. Keep prep time reasonable (under 30 mins for breakfast, under 45 mins for lunch/dinner)
${profile.blood_pressure_systolic && profile.blood_pressure_systolic > 130 ? "8. Low sodium due to high blood pressure" : ""}
${profile.blood_sugar && profile.blood_sugar > 100 ? "9. Low glycemic index due to elevated blood sugar" : ""}

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "name": "Recipe Name",
  "description": "Brief description",
  "ingredients": [
    {"name": "ingredient", "amount": "quantity", "cost": "estimated cost in local currency"}
  ],
  "instructions": ["Step 1", "Step 2"],
  "calories": 500,
  "protein_g": 25,
  "carbs_g": 50,
  "fat_g": 15,
  "prep_time_mins": 20,
  "estimated_cost": "total cost with currency",
  "currency": "USD"
}`;

  const responseText = await callOpenRouter(prompt);
  return JSON.parse(cleanJsonResponse(responseText));
}

/**
 * Generate a personalized workout plan using AI
 */
export async function generateWorkoutPlan(profile: {
  age: number;
  gender: string;
  weight_kg: number;
  height_cm: number;
  goal_type: string;
  equipment: string;
  wake_time: string;
  sleep_time: string;
  work_start?: string;
  work_end?: string;
}) {
  const prompt = `Create a workout plan for someone with these details:

Profile:
- Age: ${profile.age}
- Gender: ${profile.gender}
- Current weight: ${profile.weight_kg} kg
- Height: ${profile.height_cm} cm
- Goal: ${profile.goal_type} weight
- Available equipment: ${profile.equipment}
- Wake time: ${profile.wake_time}
- Sleep time: ${profile.sleep_time}
${profile.work_start ? `- Work hours: ${profile.work_start} - ${profile.work_end}` : ""}

Requirements:
1. Create a workout suitable for their ${profile.goal_type} weight goal
2. Use only: ${profile.equipment === "none" ? "bodyweight exercises" : profile.equipment === "home" ? "home equipment (dumbbells, resistance bands)" : "full gym equipment"}
3. Duration: 30-45 minutes
4. Include warm-up and cool-down
5. Suggest best time to exercise based on their schedule
6. Provide sets, reps, and rest times for each exercise

Return ONLY valid JSON in this exact format (no markdown, no code blocks):
{
  "name": "Workout Name",
  "description": "Brief description",
  "duration_mins": 40,
  "difficulty": "beginner|intermediate|advanced",
  "best_time": "suggested time based on schedule",
  "warmup": [
    {"exercise": "name", "duration": "5 mins"}
  ],
  "exercises": [
    {"name": "exercise", "sets": 3, "reps": 12, "rest": "60s", "notes": "form tips"}
  ],
  "cooldown": [
    {"exercise": "name", "duration": "5 mins"}
  ]
}`;

  const responseText = await callOpenRouter(prompt);
  return JSON.parse(cleanJsonResponse(responseText));
}
