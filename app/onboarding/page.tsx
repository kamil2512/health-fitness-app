"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: "",
    age: "",
    gender: "",
    weight_kg: "",
    height_cm: "",

    // Step 2: Health Metrics
    blood_pressure_systolic: "",
    blood_pressure_diastolic: "",
    blood_sugar: "",
    health_conditions: [] as string[],

    // Step 3: Goals
    goal_weight_kg: "",
    goal_type: "",

    // Step 4: Schedule
    wake_time: "",
    sleep_time: "",
    work_start: "",
    work_end: "",

    // Step 5: Preferences
    diet_type: "",
    allergies: [] as string[],
    cuisine_preferences: [] as string[],
    equipment: "",

    // Step 6: Location
    country: "",
    city: "",
  });

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 6) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) throw new Error("No user found");

      // Insert profile data
      const { error } = await supabase.from("profiles").insert({
        id: user.id,
        name: formData.name,
        age: parseInt(formData.age),
        gender: formData.gender,
        weight_kg: parseFloat(formData.weight_kg),
        height_cm: parseFloat(formData.height_cm),
        blood_pressure_systolic: formData.blood_pressure_systolic ? parseInt(formData.blood_pressure_systolic) : null,
        blood_pressure_diastolic: formData.blood_pressure_diastolic ? parseInt(formData.blood_pressure_diastolic) : null,
        blood_sugar: formData.blood_sugar ? parseFloat(formData.blood_sugar) : null,
        health_conditions: formData.health_conditions,
        goal_weight_kg: parseFloat(formData.goal_weight_kg),
        goal_type: formData.goal_type,
        diet_type: formData.diet_type,
        allergies: formData.allergies,
        cuisine_preferences: formData.cuisine_preferences,
        equipment: formData.equipment,
        wake_time: formData.wake_time,
        sleep_time: formData.sleep_time,
        work_start: formData.work_start,
        work_end: formData.work_end,
        country: formData.country,
        city: formData.city,
      });

      if (error) throw error;

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error: any) {
      alert(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4 sm:px-8 py-8 overflow-y-auto">
      <div className="w-full max-w-2xl animate-[fadeInUp_0.5s_ease-out_both]">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-black mb-2">
            Let's Personalize Your Plan
          </h1>
          <p className="text-sm text-gray-600">
            Step {currentStep} of 6
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-1.5 bg-gray-100 w-full rounded-full">
            <div
              className="h-1.5 bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${(currentStep / 6) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Steps */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl shadow-sm border border-gray-200">
          {currentStep === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold mb-6 text-black">Basic Information</h2>

              <div>
                <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                  FULL NAME
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData("name", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  placeholder="Your name"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    AGE
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => updateFormData("age", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                    placeholder="25"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    GENDER
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => updateFormData("gender", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                    required
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    WEIGHT (KG)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight_kg}
                    onChange={(e) => updateFormData("weight_kg", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                    placeholder="70.0"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    HEIGHT (CM)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.height_cm}
                    onChange={(e) => updateFormData("height_cm", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                    placeholder="175.0"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold mb-6 text-black">Health Metrics (Optional)</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    BLOOD PRESSURE (SYSTOLIC)
                  </label>
                  <input
                    type="number"
                    value={formData.blood_pressure_systolic}
                    onChange={(e) => updateFormData("blood_pressure_systolic", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                    placeholder="120"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    BLOOD PRESSURE (DIASTOLIC)
                  </label>
                  <input
                    type="number"
                    value={formData.blood_pressure_diastolic}
                    onChange={(e) => updateFormData("blood_pressure_diastolic", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                    placeholder="80"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                  BLOOD SUGAR (MG/DL)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.blood_sugar}
                  onChange={(e) => updateFormData("blood_sugar", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  placeholder="100"
                />
              </div>

              <p className="text-xs text-gray-500 mt-4">
                These metrics help us provide better health recommendations. You can skip this step.
              </p>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold mb-6 text-black">Your Goals</h2>

              <div>
                <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                  GOAL WEIGHT (KG)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.goal_weight_kg}
                  onChange={(e) => updateFormData("goal_weight_kg", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  placeholder="65.0"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                  YOUR GOAL
                </label>
                <div className="space-y-2">
                  {["lose", "gain", "maintain", "health"].map((goal) => (
                    <button
                      key={goal}
                      type="button"
                      onClick={() => updateFormData("goal_type", goal)}
                      className={`w-full px-4 py-3 border text-left rounded-xl transition-all ${
                        formData.goal_type === goal
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-gray-300 hover:border-gray-400 text-black"
                      }`}
                    >
                      {goal === "lose" && "Lose Weight"}
                      {goal === "gain" && "Gain Muscle"}
                      {goal === "maintain" && "Maintain Weight"}
                      {goal === "health" && "Improve Health"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold mb-6 text-black">Daily Schedule</h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    WAKE TIME
                  </label>
                  <input
                    type="time"
                    value={formData.wake_time}
                    onChange={(e) => updateFormData("wake_time", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    SLEEP TIME
                  </label>
                  <input
                    type="time"
                    value={formData.sleep_time}
                    onChange={(e) => updateFormData("sleep_time", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    WORK START
                  </label>
                  <input
                    type="time"
                    value={formData.work_start}
                    onChange={(e) => updateFormData("work_start", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    WORK END
                  </label>
                  <input
                    type="time"
                    value={formData.work_end}
                    onChange={(e) => updateFormData("work_end", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 5 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold mb-6 text-black">Preferences</h2>

              <div>
                <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                  DIET TYPE
                </label>
                <div className="space-y-2">
                  {["regular", "vegetarian", "vegan"].map((diet) => (
                    <button
                      key={diet}
                      type="button"
                      onClick={() => updateFormData("diet_type", diet)}
                      className={`w-full px-4 py-3 border text-left rounded-xl transition-all ${
                        formData.diet_type === diet
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-gray-300 hover:border-gray-400 text-black"
                      }`}
                    >
                      {diet.charAt(0).toUpperCase() + diet.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                  AVAILABLE EQUIPMENT
                </label>
                <div className="space-y-2">
                  {["none", "home", "gym"].map((equip) => (
                    <button
                      key={equip}
                      type="button"
                      onClick={() => updateFormData("equipment", equip)}
                      className={`w-full px-4 py-3 border text-left rounded-xl transition-all ${
                        formData.equipment === equip
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-gray-300 hover:border-gray-400 text-black"
                      }`}
                    >
                      {equip === "none" && "No Equipment (Bodyweight)"}
                      {equip === "home" && "Home Equipment (Dumbbells, Bands)"}
                      {equip === "gym" && "Full Gym Access"}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 6 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold mb-6 text-black">Location</h2>

              <div>
                <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                  COUNTRY
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => updateFormData("country", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  placeholder="United States"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                  CITY
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateFormData("city", e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  placeholder="New York"
                  required
                />
              </div>

              <p className="text-xs text-gray-500 mt-4">
                We use your location to provide accurate ingredient pricing and local meal options.
              </p>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-8 py-3 border border-gray-300 rounded-xl text-black text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:border-gray-400 transition-colors"
            >
              BACK
            </button>

            {currentStep < 6 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3 bg-[#0D0F11] text-white text-sm font-semibold rounded-xl hover:bg-[#1a1d21] transition-colors"
              >
                NEXT
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-[#0D0F11] text-white text-sm font-semibold rounded-xl hover:bg-[#1a1d21] transition-colors disabled:bg-gray-300"
              >
                {loading ? "SAVING..." : "COMPLETE"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
