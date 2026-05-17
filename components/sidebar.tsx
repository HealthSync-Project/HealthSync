import {
  Bell,
  LayoutDashboard,
  List,
  ListOrdered,
  Logs,
  LucideIcon,
  Pill,
  Receipt,
  Settings,
  SquareActivity,
  User,
  UserRound,
  Users,
  UsersRound,
} from "lucide-react";

import Link from "next/link";
import React from "react";

import { getRole } from "@/utils/roles";
import { LogoutButton } from "./logout-button";

const ACCESS_LEVELS_ALL = [
  "admin",
  "doctor",
  "nurse",
  "lab technician",
  "patient",
];

const SidebarIcon = ({ icon: Icon }: { icon: LucideIcon }) => {
  return <Icon className="size-5" />;
};

export const Sidebar = async () => {
  const role = await getRole();

  const SIDEBAR_LINKS = [
    {
      label: "MENU",
      links: [
        {
          name: "Dashboard",
          href: "/",
          access: ACCESS_LEVELS_ALL,
          icon: LayoutDashboard,
        },
        {
          name: "Profile",
          href: "/patient/self",
          access: ["patient"],
          icon: User,
        },
      ],
    },
    {
      label: "MANAGEMENT",
      links: [
        {
          name: "Users",
          href: "/record/users",
          access: ["admin"],
          icon: Users,
        },
        {
          name: "Doctors",
          href: "/record/doctors",
          access: ["admin"],
          icon: User,
        },
        {
          name: "Staffs",
          href: "/record/staffs",
          access: ["admin", "doctor"],
          icon: UserRound,
        },
        {
          name: "Patients",
          href: "/record/patients",
          access: ["admin", "doctor", "nurse"],
          icon: UsersRound,
        },
        {
          name: "Appointments",
          href: "/record/appointments",
          access: ["admin", "doctor", "nurse"],
          icon: ListOrdered,
        },
        {
          name: "Medical Records",
          href: "/record/medical-records",
          access: ["admin", "doctor", "nurse"],
          icon: SquareActivity,
        },
        {
          name: "Billing Overview",
          href: "/record/billing",
          access: ["admin", "doctor"],
          icon: Receipt,
        },
        {
          name: "Patient Management",
          href: "/nurse/patient-management",
          access: ["nurse"],
          icon: Users,
        },
        {
          name: "Administer Medications",
          href: "/nurse/administer-medications",
          access: ["admin", "doctor", "nurse"],
          icon: Pill,
        },
        {
          name: "Appointments",
          href: "/record/appointments",
          access: ["patient"],
          icon: ListOrdered,
        },
        {
          name: "Records",
          href: "/patient/records",
          access: ["patient"],
          icon: List,
        },
        {
          name: "Prescription",
          href: "#",
          access: ["patient"],
          icon: Pill,
        },
        {
          name: "Billing",
          href: "/patient/billing",
          access: ["patient"],
          icon: Receipt,
        },
      ],
    },
    {
      label: "SYSTEM",
      links: [
        {
          name: "Notifications",
          href: "/notifications",
          access: ACCESS_LEVELS_ALL,
          icon: Bell,
        },
        {
          name: "Audit Logs",
          href: "/admin/audit-logs",
          access: ["admin"],
          icon: Logs,
        },
        {
          name: "Settings",
          href: "/admin/system-settings",
          access: ["admin"],
          icon: Settings,
        },
      ],
    },
  ];

  return (
    <aside className="flex h-screen flex-col justify-between overflow-y-auto border-r border-white/40 bg-white/55 backdrop-blur-2xl px-4 py-6">

      {/* TOP */}
      <div>

        {/* BRANDING */}
        <div className="mb-12 flex items-center gap-4 px-2">

          {/* LOGO */}
          <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-900 text-white shadow-[0_10px_30px_rgba(15,23,42,0.25)]">

            <span className="text-2xl font-black tracking-tight">
              H
            </span>

          </div>

          {/* TEXT */}
          <div className="hidden lg:block">

            <h1 className="text-2xl font-black tracking-tight text-slate-900">
              HealthSync
            </h1>

            <p className="mt-0.5 text-sm capitalize text-slate-500">
              {role}
            </p>

          </div>

        </div>

        {/* NAVIGATION */}
        <div className="space-y-8">

          {SIDEBAR_LINKS.map((section) => (
            <div key={section.label}>

              {/* LABEL */}
              <p className="mb-3 hidden px-3 text-xs font-bold uppercase tracking-[0.24em] text-slate-400 lg:block">

                {section.label}

              </p>

              {/* LINKS */}
              <div className="space-y-1.5">

                {section.links.map((link) => {
                  if (link.access.includes(role.toLowerCase())) {
                    return (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="
                          group flex items-center justify-center lg:justify-start
                          gap-3 rounded-2xl px-3 py-3
                          text-slate-600 transition-all duration-200
                          hover:bg-white hover:text-slate-900
                          hover:shadow-[0_4px_20px_rgba(15,23,42,0.06)]
                        "
                      >

                        {/* ICON */}
                        <div className="flex items-center justify-center text-slate-500 group-hover:text-slate-900 transition-colors">

                          <SidebarIcon icon={link.icon} />

                        </div>

                        {/* TEXT */}
                        <span className="hidden text-sm font-medium lg:block">

                          {link.name}

                        </span>

                      </Link>
                    );
                  }
                })}

              </div>

            </div>
          ))}

        </div>

      </div>

      {/* BOTTOM */}
      <div className="mt-8 border-t border-white/40 pt-6">

        <LogoutButton />

      </div>

    </aside>
  );
};