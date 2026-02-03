async function callOpenRouter(systemPrompt: string, prompt: string): Promise<string> {
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
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
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
  const healthConstraints: string[] = [];
  if (profile.blood_pressure_systolic && profile.blood_pressure_systolic > 130) {
    healthConstraints.push("- CRITICAL: Use LOW SODIUM ingredients only. No added salt, soy sauce, or cured meats. Blood pressure is elevated.");
  }
  if (profile.blood_sugar && profile.blood_sugar > 100) {
    healthConstraints.push("- CRITICAL: Use LOW GLYCEMIC INDEX ingredients only. No white rice, white bread, or refined sugars. Blood sugar is elevated.");
  }

  const systemPrompt = `You are a professional nutritionist and chef who specializes in local cuisine from ${profile.city}, ${profile.country}.

Your expertise:
- Deep knowledge of ingredients commonly found in local markets, grocery stores, and supermarkets in ${profile.city}, ${profile.country}
- Understanding of local food culture, seasonal produce, and regional staples
- Ability to create nutritious meals using locally sourced, easily accessible ingredients

Rules you MUST follow:
1. ONLY use ingredients that a person in ${profile.city}, ${profile.country} can easily buy at their local market or grocery store
2. Prefer local staples and regional produce over imported or specialty items
3. Use local names for ingredients when appropriate, but always include a common English name
4. Price estimates must reflect actual local market prices in ${profile.city}, ${profile.country}
5. Return ONLY valid JSON - no markdown, no code blocks, no extra text`;

  const prompt = `Create a ${mealType} recipe for this person:

Person: ${profile.age}-year-old ${profile.gender}, ${profile.weight_kg}kg, ${profile.height_cm}cm
Goal: ${profile.goal_type} weight
Diet: ${profile.diet_type}
Allergies: ${profile.allergies?.join(", ") || "None"}
Location: ${profile.city}, ${profile.country}
${healthConstraints.length > 0 ? `\nHealth constraints:\n${healthConstraints.join("\n")}` : ""}

Think step by step:
1. First, consider what ingredients are commonly available in ${profile.city} markets right now
2. Then, pick ingredients that fit a ${profile.diet_type} diet and ${profile.goal_type} weight goal
3. Build a ${mealType} recipe using ONLY those local ingredients
4. Calculate accurate macros and local pricing

Constraints:
- Prep time: ${mealType === "breakfast" ? "under 20 minutes" : "under 40 minutes"}
- Calories: ${profile.goal_type === "lose" ? "300-500" : profile.goal_type === "gain" ? "500-800" : "400-600"} cal range for ${mealType}
- All ingredients must be available in ${profile.city}, ${profile.country}

Return JSON in this exact format:
{
  "name": "Recipe Name",
  "description": "Brief description mentioning local ingredients used",
  "ingredients": [
    {"name": "ingredient", "amount": "quantity", "cost": "price in local currency"}
  ],
  "instructions": ["Step 1", "Step 2"],
  "calories": 500,
  "protein_g": 25,
  "carbs_g": 50,
  "fat_g": 15,
  "prep_time_mins": 20,
  "estimated_cost": "total cost with currency symbol",
  "currency": "LOCAL_CURRENCY_CODE"
}`;

  const responseText = await callOpenRouter(systemPrompt, prompt);
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
  const equipmentDescription =
    profile.equipment === "none"
      ? "bodyweight exercises only (no equipment)"
      : profile.equipment === "home"
      ? "home equipment (dumbbells, resistance bands, yoga mat)"
      : "full gym equipment (barbells, machines, cables, dumbbells)";

  // Pre-calculate available time windows so the AI doesn't have to guess
  const freeWindows: string[] = [];
  if (profile.work_start) {
    freeWindows.push(`Morning free window: ${profile.wake_time} to ${profile.work_start}`);
    freeWindows.push(`Evening free window: ${profile.work_end} to ${profile.sleep_time}`);
  } else {
    freeWindows.push(`Full day free window: ${profile.wake_time} to ${profile.sleep_time}`);
  }

  const systemPrompt = `You are a certified personal trainer creating workout plans.

CRITICAL SCHEDULING RULES - NEVER VIOLATE THESE:
- This person wakes up at ${profile.wake_time} and sleeps at ${profile.sleep_time}
${profile.work_start ? `- They work from ${profile.work_start} to ${profile.work_end}` : "- They have no fixed work schedule"}
- The workout MUST be scheduled AFTER ${profile.wake_time} (wake time)
- The workout MUST END BEFORE ${profile.sleep_time} (sleep time)
${profile.work_start ? `- The workout must NOT overlap with work hours (${profile.work_start} - ${profile.work_end})` : ""}
- Allow at least 30 minutes after wake time before intense exercise
- The "best_time" field MUST be a specific time like "07:00 AM" that falls within a free window

Available free windows for exercise:
${freeWindows.join("\n")}

Return ONLY valid JSON - no markdown, no code blocks, no extra text.`;

  const prompt = `Create a workout plan for this person:

Person: ${profile.age}-year-old ${profile.gender}, ${profile.weight_kg}kg, ${profile.height_cm}cm
Goal: ${profile.goal_type} weight
Equipment: ${equipmentDescription}

Schedule:
- Wakes up: ${profile.wake_time}
- Sleeps: ${profile.sleep_time}
${profile.work_start ? `- Works: ${profile.work_start} to ${profile.work_end}` : "- No fixed work hours"}

Think step by step:
1. Calculate the free time windows: ${freeWindows.join(", ")}
2. Pick the best window that fits a 30-45 min workout (prefer morning if enough time before work)
3. Verify the chosen time is AFTER ${profile.wake_time} and does NOT overlap with work hours
4. Design exercises appropriate for ${profile.goal_type} goal using ${equipmentDescription}

Constraints:
- Duration: 30-45 minutes total (including warmup and cooldown)
- best_time must be a specific clock time (e.g. "07:00 AM") within a free window
- Include 5 min warmup and 5 min cooldown
- ${profile.goal_type === "lose" ? "Focus on cardio and high-intensity intervals for fat burning" : profile.goal_type === "gain" ? "Focus on strength training with progressive overload" : "Balance of cardio and strength for overall fitness"}

Return JSON in this exact format:
{
  "name": "Workout Name",
  "description": "Brief description",
  "duration_mins": 40,
  "difficulty": "beginner|intermediate|advanced",
  "best_time": "HH:MM AM/PM - must be within a free window",
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

  const responseText = await callOpenRouter(systemPrompt, prompt);
  return JSON.parse(cleanJsonResponse(responseText));
}
