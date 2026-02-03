"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      // Redirect to onboarding after successful signup
      router.push("/onboarding");
    } catch (error: any) {
      setError(error.message || "An error occurred during sign up");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center px-4 sm:px-8 py-8">
      <div className="w-full max-w-md animate-[fadeInUp_0.5s_ease-out_both]">
        {/* Logo/Back to Home */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block text-xl font-bold text-black mb-3">
            FitLife
          </Link>
          <h1 className="text-3xl md:text-4xl font-extrabold text-black mb-2">
            Start Your Journey
          </h1>
          <p className="text-sm text-gray-600">
            Create your account to get personalized wellness plans
          </p>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSignUp} className="bg-white p-8 space-y-5 rounded-2xl shadow-sm border border-gray-200">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 text-sm rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-semibold text-black mb-2 tracking-wide">
              EMAIL
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-black mb-2 tracking-wide">
              PASSWORD
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none transition-all text-black"
              placeholder="At least 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-10 py-3 bg-[#0D0F11] text-white text-sm font-semibold tracking-wide rounded-xl hover:bg-[#1a1d21] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
          </button>

          <div className="text-center pt-2 border-t border-gray-200">
            <p className="text-gray-600 text-xs pt-3">
              Already have an account?{" "}
              <Link href="/login" className="text-black font-semibold hover:underline">
                Sign in
              </Link>
            </p>
            <p className="text-xs text-gray-500 mt-3 leading-relaxed">
              By signing up, you agree this app provides wellness suggestions, not medical advice.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
