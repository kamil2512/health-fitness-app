"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Navbar from "@/app/components/Navbar";

interface Profile {
  id: string;
  name: string;
  age: number;
  gender: string;
  weight_kg: number;
  height_cm: number;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  blood_sugar: number | null;
  health_conditions: string[];
  goal_weight_kg: number;
  goal_type: string;
  diet_type: string;
  allergies: string[];
  cuisine_preferences: string[];
  equipment: string;
  wake_time: string;
  sleep_time: string;
  work_start: string;
  work_end: string;
  country: string;
  city: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<Profile>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
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
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error || !data) {
        router.push("/onboarding");
        return;
      }

      setProfile(data);
      setFormData(data);
    } catch {
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          name: formData.name,
          age: formData.age,
          gender: formData.gender,
          weight_kg: formData.weight_kg,
          height_cm: formData.height_cm,
          blood_pressure_systolic: formData.blood_pressure_systolic || null,
          blood_pressure_diastolic: formData.blood_pressure_diastolic || null,
          blood_sugar: formData.blood_sugar || null,
          goal_weight_kg: formData.goal_weight_kg,
          goal_type: formData.goal_type,
          diet_type: formData.diet_type,
          equipment: formData.equipment,
          wake_time: formData.wake_time,
          sleep_time: formData.sleep_time,
          work_start: formData.work_start,
          work_end: formData.work_end,
          country: formData.country,
          city: formData.city,
        })
        .eq("id", profile.id);

      if (error) throw error;

      setProfile({ ...profile, ...formData } as Profile);
      setEditing(false);
    } catch (error: any) {
      alert(error.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
  };

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  if (!profile) return null;

  const bmi = profile.weight_kg / Math.pow(profile.height_cm / 100, 2);

  return (
    <div className="min-h-screen bg-[#FAFAF8] pt-14 sm:pt-16 pb-16 sm:pb-[4.5rem]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-black">
            PROFILE
          </h1>
          {!editing ? (
            <button
              onClick={() => setEditing(true)}
              className="px-6 py-2 border border-[#0D0F11] text-black text-xs font-semibold rounded-xl hover:bg-[#0D0F11] hover:text-white transition-colors"
            >
              EDIT
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setEditing(false);
                  setFormData(profile);
                }}
                className="px-6 py-2 border border-gray-300 text-gray-600 text-xs font-semibold rounded-xl hover:border-gray-400 hover:text-black transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-[#0D0F11] text-white text-xs font-semibold rounded-xl hover:bg-[#1a1d21] transition-colors disabled:bg-gray-300"
              >
                {saving ? "SAVING..." : "SAVE"}
              </button>
            </div>
          )}
        </div>

        {/* Overview stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
            <div className="text-xs tracking-wide text-gray-500 mb-1">
              WEIGHT
            </div>
            <div className="text-2xl font-extrabold text-black">
              {profile.weight_kg} kg
            </div>
          </div>
          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
            <div className="text-xs tracking-wide text-gray-500 mb-1">
              HEIGHT
            </div>
            <div className="text-2xl font-extrabold text-black">
              {profile.height_cm} cm
            </div>
          </div>
          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
            <div className="text-xs tracking-wide text-gray-500 mb-1">BMI</div>
            <div className="text-2xl font-extrabold text-black">
              {bmi.toFixed(1)}
            </div>
          </div>
          <div className="bg-white p-4 border border-gray-200 rounded-2xl shadow-sm">
            <div className="text-xs tracking-wide text-gray-500 mb-1">
              GOAL
            </div>
            <div className="text-2xl font-extrabold text-black capitalize">
              {profile.goal_type}
            </div>
          </div>
        </div>

        {editing ? (
          /* Edit Form */
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-black mb-4">
                BASIC INFORMATION
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    NAME
                  </label>
                  <input
                    type="text"
                    value={formData.name || ""}
                    onChange={(e) => updateField("name", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    AGE
                  </label>
                  <input
                    type="number"
                    value={formData.age || ""}
                    onChange={(e) =>
                      updateField("age", parseInt(e.target.value))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    WEIGHT (KG)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight_kg || ""}
                    onChange={(e) =>
                      updateField("weight_kg", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    HEIGHT (CM)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.height_cm || ""}
                    onChange={(e) =>
                      updateField("height_cm", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  />
                </div>
              </div>
            </div>

            {/* Goals */}
            <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-black mb-4">GOALS</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    GOAL WEIGHT (KG)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.goal_weight_kg || ""}
                    onChange={(e) =>
                      updateField("goal_weight_kg", parseFloat(e.target.value))
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    GOAL TYPE
                  </label>
                  <select
                    value={formData.goal_type || ""}
                    onChange={(e) => updateField("goal_type", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  >
                    <option value="lose">Lose Weight</option>
                    <option value="gain">Gain Muscle</option>
                    <option value="maintain">Maintain Weight</option>
                    <option value="health">Improve Health</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Preferences */}
            <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-black mb-4">PREFERENCES</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    DIET TYPE
                  </label>
                  <select
                    value={formData.diet_type || ""}
                    onChange={(e) => updateField("diet_type", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  >
                    <option value="regular">Regular</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    EQUIPMENT
                  </label>
                  <select
                    value={formData.equipment || ""}
                    onChange={(e) => updateField("equipment", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  >
                    <option value="none">No Equipment</option>
                    <option value="home">Home Equipment</option>
                    <option value="gym">Full Gym</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-black mb-4">SCHEDULE</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    WAKE TIME
                  </label>
                  <input
                    type="time"
                    value={formData.wake_time || ""}
                    onChange={(e) => updateField("wake_time", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    SLEEP TIME
                  </label>
                  <input
                    type="time"
                    value={formData.sleep_time || ""}
                    onChange={(e) => updateField("sleep_time", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    WORK START
                  </label>
                  <input
                    type="time"
                    value={formData.work_start || ""}
                    onChange={(e) => updateField("work_start", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    WORK END
                  </label>
                  <input
                    type="time"
                    value={formData.work_end || ""}
                    onChange={(e) => updateField("work_end", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-black mb-4">LOCATION</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    COUNTRY
                  </label>
                  <input
                    type="text"
                    value={formData.country || ""}
                    onChange={(e) => updateField("country", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-black mb-2 tracking-wide">
                    CITY
                  </label>
                  <input
                    type="text"
                    value={formData.city || ""}
                    onChange={(e) => updateField("city", e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="space-y-6">
            <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-black mb-4">
                BASIC INFORMATION
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-xs tracking-wide text-gray-500 mb-1">
                    NAME
                  </div>
                  <div className="font-semibold text-black">{profile.name}</div>
                </div>
                <div>
                  <div className="text-xs tracking-wide text-gray-500 mb-1">
                    AGE
                  </div>
                  <div className="font-semibold text-black">{profile.age}</div>
                </div>
                <div>
                  <div className="text-xs tracking-wide text-gray-500 mb-1">
                    GENDER
                  </div>
                  <div className="font-semibold text-black capitalize">
                    {profile.gender}
                  </div>
                </div>
                <div>
                  <div className="text-xs tracking-wide text-gray-500 mb-1">
                    LOCATION
                  </div>
                  <div className="font-semibold text-black">
                    {profile.city}, {profile.country}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-black mb-4">
                GOALS & PREFERENCES
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-xs tracking-wide text-gray-500 mb-1">
                    GOAL WEIGHT
                  </div>
                  <div className="font-semibold text-black">
                    {profile.goal_weight_kg} kg
                  </div>
                </div>
                <div>
                  <div className="text-xs tracking-wide text-gray-500 mb-1">
                    GOAL TYPE
                  </div>
                  <div className="font-semibold text-black capitalize">
                    {profile.goal_type}
                  </div>
                </div>
                <div>
                  <div className="text-xs tracking-wide text-gray-500 mb-1">
                    DIET
                  </div>
                  <div className="font-semibold text-black capitalize">
                    {profile.diet_type}
                  </div>
                </div>
                <div>
                  <div className="text-xs tracking-wide text-gray-500 mb-1">
                    EQUIPMENT
                  </div>
                  <div className="font-semibold text-black capitalize">
                    {profile.equipment || "None"}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
              <h2 className="text-lg font-bold text-black mb-4">SCHEDULE</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-xs tracking-wide text-gray-500 mb-1">
                    WAKE TIME
                  </div>
                  <div className="font-semibold text-black">
                    {profile.wake_time || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs tracking-wide text-gray-500 mb-1">
                    SLEEP TIME
                  </div>
                  <div className="font-semibold text-black">
                    {profile.sleep_time || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs tracking-wide text-gray-500 mb-1">
                    WORK START
                  </div>
                  <div className="font-semibold text-black">
                    {profile.work_start || "—"}
                  </div>
                </div>
                <div>
                  <div className="text-xs tracking-wide text-gray-500 mb-1">
                    WORK END
                  </div>
                  <div className="font-semibold text-black">
                    {profile.work_end || "—"}
                  </div>
                </div>
              </div>
            </div>

            {(profile.blood_pressure_systolic || profile.blood_sugar) && (
              <div className="bg-white p-6 border border-gray-200 rounded-2xl shadow-sm">
                <h2 className="text-lg font-bold text-black mb-4">
                  HEALTH METRICS
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  {profile.blood_pressure_systolic && (
                    <div>
                      <div className="text-xs tracking-wide text-gray-500 mb-1">
                        BLOOD PRESSURE
                      </div>
                      <div className="font-semibold text-black">
                        {profile.blood_pressure_systolic}/
                        {profile.blood_pressure_diastolic}
                      </div>
                    </div>
                  )}
                  {profile.blood_sugar && (
                    <div>
                      <div className="text-xs tracking-wide text-gray-500 mb-1">
                        BLOOD SUGAR
                      </div>
                      <div className="font-semibold text-black">
                        {profile.blood_sugar} mg/dL
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Sign out */}
        <div className="mt-10 pt-6 border-t border-gray-200">
          <button
            onClick={handleSignOut}
            className="w-full py-3 text-sm font-semibold text-gray-400 rounded-xl border border-gray-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors"
          >
            SIGN OUT
          </button>
        </div>
      </main>
    </div>
  );
}
