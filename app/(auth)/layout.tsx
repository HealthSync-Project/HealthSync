import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#EEF2FF]">

      {/* BACKGROUND GLOWS */}
      <div className="absolute top-[-120px] left-[-120px] h-[320px] w-[320px] rounded-full bg-blue-400/20 blur-3xl" />

      <div className="absolute bottom-[-140px] right-[-100px] h-[320px] w-[320px] rounded-full bg-purple-400/20 blur-3xl" />

      {/* GRID */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative z-10 min-h-screen max-w-7xl mx-auto px-6 flex items-center">

        <div className="grid lg:grid-cols-2 gap-16 items-center w-full">

          {/* LEFT SIDE */}
          <div className="hidden lg:flex flex-col justify-center">

            {/* LOGO */}
            <div className="h-14 w-14 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-2xl font-black shadow-xl mb-8">
              H
            </div>

            {/* HEADING */}
            <h1 className="text-6xl font-black leading-[1.02] tracking-tight text-slate-900 mb-6">
              Welcome to
              <br />
              HealthSync.
            </h1>

            {/* TEXT */}
            <p className="text-xl leading-relaxed text-slate-600 max-w-lg">
              Manage patients, appointments,
              doctors, and hospital workflows
              from one modern healthcare platform.
            </p>

            {/* ACCENT */}
            <div className="mt-10 h-1 w-28 rounded-full bg-gradient-to-r from-blue-500 to-purple-500" />

          </div>

          {/* RIGHT SIDE */}
          <div className="relative flex justify-center lg:justify-end">

            {/* SOFT BACKDROP */}
            <div className="absolute h-[500px] w-[500px] rounded-full bg-white/40 blur-3xl" />

            {/* MOBILE BRANDING */}
            <div className="lg:hidden absolute -top-28 left-1/2 -translate-x-1/2 flex flex-col items-center">

              <div className="h-14 w-14 rounded-3xl bg-slate-900 text-white flex items-center justify-center text-2xl font-black shadow-xl mb-4">
                H
              </div>

              <h1 className="text-4xl font-black tracking-tight text-slate-900">
                HealthSync
              </h1>

            </div>

            {/* CLERK FORM */}
            <div className="relative z-10">
              {children}
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default AuthLayout;