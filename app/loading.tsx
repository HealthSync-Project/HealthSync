import { Activity } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EEF2FF] relative overflow-hidden">

      {/* GRID */}
      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "55px 55px",
        }}
      />

      {/* GLOW */}
      <div className="absolute top-0 left-0 h-[400px] w-[400px] rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[350px] w-[350px] rounded-full bg-purple-400/20 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center">

        {/* Logo */}
        <div className="h-16 w-16 rounded-3xl bg-slate-900 text-white flex items-center justify-center shadow-xl animate-pulse">
          H
        </div>

        <h1 className="mt-6 text-3xl font-black text-slate-900">
          HealthSync
        </h1>

        <p className="mt-2 text-slate-500">
          Loading your healthcare dashboard...
        </p>

        {/* Loader */}
        <div className="mt-8 flex gap-2">
          <div className="h-3 w-3 rounded-full bg-blue-500 animate-bounce" />
          <div
            className="h-3 w-3 rounded-full bg-indigo-500 animate-bounce"
            style={{ animationDelay: "0.15s" }}
          />
          <div
            className="h-3 w-3 rounded-full bg-purple-500 animate-bounce"
            style={{ animationDelay: "0.3s" }}
          />
        </div>

      </div>

    </div>
  );
}