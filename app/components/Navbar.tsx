"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={active ? 0 : 1.8} strokeLinecap="round" strokeLinejoin="round">
          {active ? (
            <path d="M3 12.5l9-9 9 9V21a1 1 0 01-1 1H4a1 1 0 01-1-1v-8.5z" />
          ) : (
            <>
              <path d="M3 9.5l9-7 9 7V20a2 2 0 01-2 2H5a2 2 0 01-2-2V9.5z" />
              <path d="M9 22V12h6v10" />
            </>
          )}
        </svg>
      ),
    },
    {
      href: "/weight-log",
      label: "Weight",
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
          <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
      ),
    },
    {
      href: "/meals",
      label: "Meals",
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 010 8h-1" />
          <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z" />
          <line x1="6" y1="1" x2="6" y2="4" />
          <line x1="10" y1="1" x2="10" y2="4" />
          <line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      ),
    },
    {
      href: "/workouts",
      label: "Workout",
      icon: (active: boolean) => (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.24 12.24a6 6 0 00-8.49-8.49L5 10.5V19h8.5l6.74-6.76z" />
          <line x1="16" y1="8" x2="2" y2="22" />
          <line x1="17.5" y1="15" x2="9" y2="15" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* ─── Top Bar ─── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 sm:h-16 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-black tracking-tight">
            FitLife
          </Link>

          {/* Profile avatar */}
          <Link
            href="/profile"
            className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              pathname === "/profile"
                ? "bg-emerald-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
        </div>
      </header>

      {/* ─── Bottom Navigation Bar ─── */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-200/60">
        <div className="max-w-lg mx-auto px-2 h-16 sm:h-[4.5rem] flex items-center justify-around">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.label}
                href={item.href}
                className={`relative flex flex-col items-center justify-center gap-0.5 w-16 sm:w-20 py-1.5 rounded-2xl transition-all duration-200 ${
                  active
                    ? "text-emerald-600"
                    : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {/* Active indicator dot */}
                {active && (
                  <span className="absolute -top-1 w-1 h-1 rounded-full bg-emerald-500" />
                )}
                {item.icon(active)}
                <span className={`text-[10px] sm:text-xs font-semibold leading-none mt-0.5 ${active ? "text-emerald-600" : ""}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>

        {/* Safe area for phones with home indicator */}
        <div className="h-[env(safe-area-inset-bottom,0px)] bg-white/90" />
      </nav>
    </>
  );
}
