import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-[#FAFAF8]/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="px-4 sm:px-8 md:px-16 py-4 sm:py-6 flex items-center justify-between max-w-[1600px] mx-auto">
          <div className="text-xl sm:text-2xl font-bold tracking-tight text-black">FitLife</div>
          <Link
            href="/signup"
            className="px-5 sm:px-8 py-2.5 sm:py-3 border border-black bg-transparent text-black text-xs sm:text-sm font-semibold tracking-wide rounded-xl hover:bg-black hover:text-white transition-all duration-300"
          >
            GET STARTED
          </Link>
        </div>
      </nav>

      {/* Hero Section with Image */}
      <main className="px-4 sm:px-8 md:px-16">
        <div className="max-w-[1600px] mx-auto pt-12 sm:pt-20 md:pt-32 pb-16 sm:pb-32">
          <div className="grid md:grid-cols-2 gap-8 sm:gap-16 items-center">
            <div>
              <p className="text-xs tracking-[0.4em] uppercase mb-12 text-gray-600 font-medium animate-[fadeInUp_0.6s_ease-out_both]">
                ACHIEVE YOUR WELLNESS GOALS
              </p>

              <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight leading-[0.9] mb-8 sm:mb-12 text-black animate-[fadeInUp_0.6s_ease-out_0.1s_both]">
                EAT WELL.
                <br />
                TRAIN HARD.
                <br />
                <span className="text-emerald-500">LIVE BETTER.</span>
              </h1>

              <p className="text-base md:text-lg text-gray-700 leading-relaxed mb-10 max-w-lg animate-[fadeInUp_0.6s_ease-out_0.2s_both]">
                AI-powered meal plans and workout routines personalized to your health metrics, goals, and daily schedule. Everything you need to transform your wellness journey.
              </p>
              <Link
                href="/signup"
                className="inline-block px-10 py-4 bg-[#0D0F11] text-white text-sm font-semibold tracking-wide rounded-xl hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300 animate-[fadeInUp_0.6s_ease-out_0.3s_both]"
              >
                START TODAY
              </Link>
            </div>

            <div className="relative h-[300px] sm:h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800&q=80&fit=crop"
                alt="Fitness and wellness"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>
        </div>

        {/* Features - Vertical with Images */}
        <div className="max-w-[1600px] mx-auto py-16 sm:py-32">
          <div className="text-center mb-12 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-extrabold text-black mb-6">
              EVERYTHING YOU NEED
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Comprehensive tools designed to support your complete wellness transformation
            </p>
          </div>

          {/* Feature 1 - Image Left */}
          <div className="grid md:grid-cols-2 gap-8 sm:gap-16 items-center mb-16 sm:mb-32">
            <div className="relative h-[250px] sm:h-[400px] md:h-[500px] overflow-hidden order-2 md:order-1">
              <img
                src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80&fit=crop"
                alt="Healthy meal preparation"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="order-1 md:order-2">
              <div className="text-xs tracking-[0.3em] uppercase text-gray-400 font-medium mb-6">
                01
              </div>
              <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-black mb-6 sm:mb-8">
                Personalized Nutrition
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                AI-generated meal plans with detailed recipes and ingredient costs tailored to your location.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Every meal is designed around your health metrics, dietary preferences, and nutritional goals. Get step-by-step cooking instructions and shopping lists that fit your budget.
              </p>
            </div>
          </div>

          {/* Feature 2 - Image Right */}
          <div className="grid md:grid-cols-2 gap-8 sm:gap-16 items-center mb-16 sm:mb-32">
            <div>
              <div className="text-xs tracking-[0.3em] uppercase text-gray-400 font-medium mb-6">
                02
              </div>
              <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-black mb-6 sm:mb-8">
                Smart Training
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Workouts precisely calibrated to your schedule and available equipment.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Whether you have a full gym, basic home equipment, or nothing at all, get personalized exercise routines that match your fitness level and adapt as you progress.
              </p>
            </div>
            <div className="relative h-[250px] sm:h-[400px] md:h-[500px] overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&q=80&fit=crop"
                alt="Workout training"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
          </div>

          {/* Feature 3 - Image Left */}
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="relative h-[250px] sm:h-[400px] md:h-[500px] overflow-hidden order-2 md:order-1">
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80&fit=crop"
                alt="Progress tracking and analytics"
                className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700"
              />
            </div>
            <div className="order-1 md:order-2">
              <div className="text-xs tracking-[0.3em] uppercase text-gray-400 font-medium mb-6">
                03
              </div>
              <h3 className="text-2xl sm:text-4xl md:text-5xl font-extrabold text-black mb-6 sm:mb-8">
                Progress Tracking
              </h3>
              <p className="text-gray-600 text-lg leading-relaxed mb-6">
                Monitor your journey with comprehensive weight logs and visual charts.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Track your progress toward your goal weight, log completed meals and workouts, and celebrate milestones with data-driven insights that keep you motivated.
              </p>
            </div>
          </div>
        </div>

        {/* Statement Section */}
        <div className="max-w-[1600px] mx-auto py-16 sm:py-32">
          <div className="border-t border-b border-black py-12 sm:py-20 text-center">
            <h2 className="text-3xl sm:text-4xl md:text-6xl font-bold max-w-4xl mx-auto leading-tight text-black mb-8 sm:mb-10">
              Wellness should be accessible to everyone.
            </h2>
            <p className="mt-8 text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Whether you're just starting out or pushing to new heights, our AI-powered platform adapts to your unique needs, health metrics, and lifestyle to provide a personalized wellness experience.
            </p>
            <Link
              href="/signup"
              className="inline-block mt-12 px-10 py-4 border border-black bg-transparent text-black text-sm font-semibold tracking-wide rounded-xl hover:bg-black hover:text-white transition-all duration-300"
            >
              JOIN TODAY
            </Link>
          </div>
        </div>

        {/* Black Section */}
        <div className="bg-gradient-to-br from-[#0D0F11] to-[#1a1d21] text-white py-16 sm:py-32 -mx-4 sm:-mx-8 md:-mx-16 px-4 sm:px-8 md:px-16 mt-16 sm:mt-32">
          <div className="max-w-[1600px] mx-auto text-center">
            <h2 className="text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-extrabold mb-8 sm:mb-10 leading-tight">
              YOUR HEALTH IS
              <br />
              YOUR WEALTH
            </h2>
            <p className="max-w-2xl mx-auto text-base md:text-lg text-gray-400 mb-14 leading-relaxed">
              Join thousands who've transformed their lives with personalized nutrition and fitness guidance. Start your journey today with our free plan.
            </p>
            <Link
              href="/signup"
              className="inline-block px-10 py-4 bg-white text-black text-sm font-semibold tracking-wide rounded-xl hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300"
            >
              GET STARTED
            </Link>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="max-w-[1600px] mx-auto mt-16 sm:mt-32 mb-12 sm:mb-20">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm p-8 md:p-10 hover:shadow-md transition-all duration-300">
            <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
              <span className="font-bold tracking-wide">IMPORTANT:</span> This app provides general wellness suggestions and is not medical advice. Always consult a healthcare professional before starting any diet or exercise program, especially if you have existing health conditions. The meal and exercise recommendations are generated by AI and should be reviewed for your individual needs.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 sm:py-10 px-4 sm:px-8 md:px-16 mt-12 sm:mt-20">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600 font-medium">&copy; 2026 FitLife</p>
          <p className="text-sm text-gray-600">Your wellness journey starts here.</p>
        </div>
      </footer>
    </div>
  );
}
