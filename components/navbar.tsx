"use client";

import { useAuth, UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import React from "react";

export const Navbar = () => {
  const { userId } = useAuth();
  const pathname = usePathname();

  function formatPathName(): string {
    if (!pathname) return "Overview";

    const splitRoute = pathname.split("/").filter(Boolean);

    const page =
      splitRoute.length > 1
        ? splitRoute[1]
        : splitRoute[0] || "overview";

    return page.replace(/-/g, " ");
  }

  const path = formatPathName();

  return (
    <header className="h-20 px-6 lg:px-8 flex items-center justify-between">

      {/* LEFT */}
      <div>

        <p className="text-sm text-slate-500 mb-1">
          HealthSync
        </p>

        <h1 className="text-3xl font-black tracking-tight text-slate-900 capitalize leading-none">
          {path}
        </h1>

      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">

        {/* NOTIFICATIONS */}
        <button className="relative h-12 w-12 rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl flex items-center justify-center shadow-sm transition-all hover:bg-white/80">

          <Bell size={19} className="text-slate-700" />

          <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-red-500" />

        </button>

        {/* USER */}
        <div className="flex items-center justify-center rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl p-1 shadow-sm">

          {userId && <UserButton />}

        </div>

      </div>

    </header>
  );
};