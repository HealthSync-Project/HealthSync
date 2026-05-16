import { Button } from "@/components/ui/button";
import { getRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  UserRound,
} from "lucide-react";

export default async function Home() {
  const { userId } = await auth();
  const role = await getRole();

  if (userId && role) {
    redirect(`/${role}`);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#EEF2FF] text-slate-900">

      {/* BACKGROUND EFFECTS */}
      <div className="absolute top-0 left-0 h-[500px] w-[500px] rounded-full bg-blue-400/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-[450px] w-[450px] rounded-full bg-purple-500/20 blur-3xl" />

      {/* GRID */}
      <div
         className="absolute inset-0 opacity-[0.35] pointer-events-none"
         style={{
            backgroundImage: `
              linear-gradient(to right, rgba(148,163,184,0.12) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(148,163,184,0.12) 1px, transparent 1px)
              `,
            backgroundSize: "55px 55px",
          }}
      />

      {/* NAVBAR */}
      <nav className="relative z-10">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

          {/* LOGO */}
          <div className="flex items-center gap-3">

            <div className="h-11 w-11 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg shadow-lg">
              H
            </div>

            <h1 className="text-2xl font-black tracking-tight">
              HealthSync
            </h1>

          </div>

          {/* BUTTONS */}
          <div className="flex items-center gap-3">

            <Link href="/sign-in">
              <Button
                variant="ghost"
                className="rounded-2xl text-slate-700 hover:bg-white/70"
              >
                Login
              </Button>
            </Link>

            <Link href="/sign-up">
              <Button className="rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg">
                Get Started
              </Button>
            </Link>

          </div>

        </div>
      </nav>

      {/* HERO */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-24">

        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* LEFT SIDE */}
          <div>

            <div className="inline-flex items-center rounded-full bg-white/70 border border-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm mb-8">
              Hospital Management System
            </div>

            <h1 className="text-5xl md:text-7xl font-black leading-[1.02] tracking-tight mb-8">
              Manage Patients,
              <br />
              Doctors &
              <br />
              Appointments
              <br />
              In One Place.
            </h1>

            <p className="text-lg md:text-xl leading-relaxed text-slate-600 max-w-xl mb-10">
              HealthSync helps hospitals and clinics manage
              healthcare workflows with a clean and modern platform.
            </p>

            <div className="flex flex-wrap gap-4">

              <Link href="/sign-up">
                <Button className="h-12 px-8 rounded-2xl text-base bg-slate-900 hover:bg-slate-800 shadow-xl">
                  Create Account
                </Button>
              </Link>

              <Link href="/sign-in">
                <Button
                  variant="outline"
                  className="h-12 px-8 rounded-2xl text-base border-slate-300 bg-white/70 backdrop-blur-sm hover:bg-white"
                >
                  Access Portal
                </Button>
              </Link>

            </div>

          </div>

          {/* RIGHT SIDE */}
          <div className="relative flex justify-center">

            {/* MAIN VISUAL CARD */}
            <div className="relative w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 p-8 shadow-2xl">

              {/* GLOW */}
              <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-blue-500/30 blur-3xl" />
              <div className="absolute bottom-0 left-0 h-32 w-32 rounded-full bg-purple-500/20 blur-3xl" />

              {/* CONTENT */}
              <div className="relative z-10">

                {/* TOP */}
                <div className="flex items-center justify-between mb-12">

                  <div>
                    <p className="text-slate-400 text-sm">
                      HealthSync Dashboard
                    </p>

                    <h2 className="text-3xl font-black text-white mt-2">
                      Smart Healthcare
                    </h2>
                  </div>

                  <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />

                </div>

                {/* MAIN BLOCK */}
                <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 p-6 mb-5">

                  <p className="text-slate-300 text-sm mb-3">
                    Centralized Management
                  </p>

                  <h3 className="text-3xl font-bold text-white leading-snug">
                    Everything your hospital needs —
                    simplified and connected.
                  </h3>

                </div>

                {/* SMALL CARDS */}
                <div className="grid grid-cols-2 gap-5">

                  <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 p-5">

                    <div className="h-12 w-12 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-4">
                      <UserRound className="text-blue-300" />
                    </div>

                    <p className="text-slate-400 text-sm mb-1">
                      Patients
                    </p>

                    <h3 className="text-2xl font-bold text-white">
                      Managed
                    </h3>

                  </div>

                  <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/10 p-5">

                    <div className="h-12 w-12 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-4">
                      <Stethoscope className="text-purple-300" />
                    </div>

                    <p className="text-slate-400 text-sm mb-1">
                      Doctors
                    </p>

                    <h3 className="text-2xl font-bold text-white">
                      Connected
                    </h3>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </section>

      {/* PORTALS */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pb-28">

        <div className="mb-12">

          <h2 className="text-4xl font-black tracking-tight mb-3">
            Continue As
          </h2>

          <p className="text-lg text-slate-600">
            Select your portal to continue.
          </p>

        </div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* PATIENT */}
          <Link href="/sign-up">

            <div className="group rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white p-8 shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all h-full">

              <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                <UserRound className="text-blue-600" />
              </div>

              <h3 className="text-2xl font-bold mb-4">
                Patient Portal
              </h3>

              <p className="text-slate-600 leading-relaxed mb-8">
                Book appointments, manage records,
                and access prescriptions easily.
              </p>

              <div className="flex items-center gap-2 text-blue-600 font-medium">
                Continue
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition"
                />
              </div>

            </div>

          </Link>

          {/* DOCTOR */}
          <Link href="/sign-in">

            <div className="group rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white p-8 shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all h-full">

              <div className="h-14 w-14 rounded-2xl bg-purple-100 flex items-center justify-center mb-6">
                <Stethoscope className="text-purple-600" />
              </div>

              <h3 className="text-2xl font-bold mb-4">
                Doctor Access
              </h3>

              <p className="text-slate-600 leading-relaxed mb-8">
                Manage schedules, consultations,
                and patient workflows.
              </p>

              <div className="flex items-center gap-2 text-purple-600 font-medium">
                Continue
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition"
                />
              </div>

            </div>

          </Link>

          {/* ADMIN */}
          <Link href="/sign-in">

            <div className="group rounded-[2rem] bg-white/70 backdrop-blur-xl border border-white p-8 shadow-lg hover:-translate-y-1 hover:shadow-2xl transition-all h-full">

              <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
                <ShieldCheck className="text-emerald-600" />
              </div>

              <h3 className="text-2xl font-bold mb-4">
                Admin Dashboard
              </h3>

              <p className="text-slate-600 leading-relaxed mb-8">
                Monitor operations, hospital staff,
                and platform management.
              </p>

              <div className="flex items-center gap-2 text-emerald-600 font-medium">
                Continue
                <ArrowRight
                  size={18}
                  className="group-hover:translate-x-1 transition"
                />
              </div>

            </div>

          </Link>

        </div>

      </section>

      {/* FOOTER */}
      <footer className="relative z-10 px-6 pb-8">

        <div className="max-w-7xl mx-auto border-t border-slate-300 pt-6">

          <p className="text-sm text-slate-500 text-center">
            © 2026 HealthSync — Built for smarter hospital management.
          </p>

        </div>

      </footer>

    </main>
  );
}