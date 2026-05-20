"use client";
import { useAuth, UserButton } from "@clerk/nextjs";
import { Bell } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import Link from "next/link";

export const Navbar = () => {
  const { userId } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notification count and compare with last seen timestamp
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch("/api/notifications/count");
        if (!res.ok) return;
        const { notifications } = await res.json();
        
        const lastSeen = localStorage.getItem("notifications_last_seen");
        const lastSeenDate = lastSeen ? new Date(lastSeen) : new Date(0);
        
        // Count notifications newer than last seen
        const unread = notifications.filter(
          (n: { createdAt: string }) => new Date(n.createdAt) > lastSeenDate
        ).length;
        
        setUnreadCount(unread);
      } catch {}
    };
    fetchCount();
  }, [pathname]);

  // Mark all as read when visiting notifications page
  useEffect(() => {
    if (pathname === "/notifications") {
      localStorage.setItem("notifications_last_seen", new Date().toISOString());
      setUnreadCount(0);
    }
  }, [pathname]);

  function formatPathName(): string {
    if (!pathname) return "Overview";
    const segments = pathname.split("/").filter(Boolean);
    const last = segments[segments.length - 1];
    const isIdSegment = !isNaN(Number(last));

    if (isIdSegment) {
      const section = segments[segments.length - 2];
      const titleMap: Record<string, string> = {
        appointments: "Patient Record",
        "medical-records": "Medical Record",
        billing: "Billing Detail",
        doctors: "Doctor Profile",
        patients: "Patient Profile",
        staffs: "Staff Profile",
        users: "User Profile",
      };
      return titleMap[section] || section.replace(/-/g, " ");
    }

    const page = segments.length > 1 ? segments[1] : segments[0] || "overview";
    return page.replace(/-/g, " ");
  }

  const path = formatPathName();

  return (
    <header className="h-20 px-6 lg:px-8 flex items-center justify-between">
      <div>
        <p className="text-sm text-slate-500 mb-1">HealthSync</p>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 capitalize leading-none">
          {path}
        </h1>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/notifications">
          <button className="relative h-12 w-12 rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl flex items-center justify-center shadow-sm transition-all hover:bg-white/80">
            <Bell size={19} className="text-slate-700" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>
        </Link>
        <div className="flex items-center justify-center rounded-2xl border border-white/60 bg-white/60 backdrop-blur-xl p-1 shadow-sm">
          {userId && <UserButton />}
        </div>
      </div>
    </header>
  );
};
