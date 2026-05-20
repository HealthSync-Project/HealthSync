import { AvailableDoctors } from "@/components/available-doctor";
import { AppointmentChart } from "@/components/charts/appointment-chart";
import { StatSummary } from "@/components/charts/stat-summary";
import { StatCard } from "@/components/stat-card";
import { RecentAppointments } from "@/components/tables/recent-appointment";
import { Button } from "@/components/ui/button";
import { getDoctorDashboardStats } from "@/utils/services/doctor";
import { currentUser } from "@clerk/nextjs/server";
import {
  BriefcaseBusiness,
  BriefcaseMedical,
  CalendarCheck,
  Users,
} from "lucide-react";
import Link from "next/link";
import React from "react";

const DoctorDashboard = async () => {
  const user = await currentUser();
  const {
    totalMyPatients,
    todayAppointments,
    totalAppointment,
    appointmentCounts,
    availableDoctors,
    monthlyData,
    last5Records,
  } = await getDoctorDashboardStats();

  const cardData = [
    {
      title: "My Patients",
      value: totalMyPatients,
      icon: Users,
      className: "bg-blue-600/15",
      iconClassName: "bg-blue-600/25 text-blue-600",
      note: "Unique patients seen",
      link: "/record/patients",
    },
    {
      title: "Today",
      value: todayAppointments,
      icon: CalendarCheck,
      className: "bg-rose-600/15",
      iconClassName: "bg-rose-600/25 text-rose-600",
      note: "Appointments today",
      link: "/record/appointments",
    },
    {
      title: "Total Appointments",
      value: totalAppointment,
      icon: BriefcaseBusiness,
      className: "bg-yellow-600/15",
      iconClassName: "bg-yellow-600/25 text-yellow-600",
      note: "All time",
      link: "/record/appointments",
    },
    {
      title: "Completed",
      value: appointmentCounts?.COMPLETED,
      icon: BriefcaseMedical,
      className: "bg-emerald-600/15",
      iconClassName: "bg-emerald-600/25 text-emerald-600",
      note: "Consultations done",
      link: "/record/appointments",
    },
  ];

  return (
    <div className="rounded-xl py-6 px-3 flex flex-col xl:flex-row gap-6">
      {/* LEFT */}
      <div className="w-full xl:w-[69%]">
        <div className="bg-white rounded-xl p-4 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-lg xl:text-2xl font-semibold">
                Welcome, Dr. {user?.firstName}
              </h1>
              <p className="text-sm text-gray-400 mt-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/record/doctors/${user?.id}`}>View profile</Link>
            </Button>
          </div>
          <div className="w-full flex flex-wrap gap-2">
            {cardData?.map((el, index) => (
              <StatCard
                key={index}
                title={el?.title}
                value={el?.value!}
                icon={el?.icon}
                className={el?.className}
                iconClassName={el?.iconClassName}
                note={el?.note}
                link={el?.link}
              />
            ))}
          </div>
        </div>

        {/* Pending approvals — quick action for doctor */}
        {(appointmentCounts?.PENDING ?? 0) > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="font-semibold text-yellow-800">
                {appointmentCounts?.PENDING} pending appointment
                {appointmentCounts?.PENDING! > 1 ? "s" : ""} awaiting approval
              </p>
              <p className="text-sm text-yellow-600">
                Review and approve scheduled appointments
              </p>
            </div>
            <Button size="sm" asChild className="bg-yellow-500 hover:bg-yellow-600 text-white">
              <Link href="/record/appointments">Review</Link>
            </Button>
          </div>
        )}

        <div className="h-[500px]">
          <AppointmentChart data={monthlyData!} />
        </div>

        <div className="bg-white rounded-xl p-4 mt-8">
          <RecentAppointments data={last5Records!} />
        </div>
      </div>

      {/* RIGHT */}
      <div className="w-full xl:w-[30%]">
        <div className="w-full h-[450px] mb-8">
          <StatSummary data={appointmentCounts} total={totalAppointment!} />
        </div>
        <AvailableDoctors data={availableDoctors as any} />
      </div>
    </div>
  );
};

export default DoctorDashboard;
