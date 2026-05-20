"use client";

// FILE: app/(protected)/notifications/page.tsx
// Client component so we can access localStorage for read/unread state

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Bell, Stethoscope, CreditCard, UserPlus, Info } from "lucide-react";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "appointment" | "diagnosis" | "payment" | "patient" | "general";
  link?: string;
  createdAt: string;
}

const typeConfig = {
  appointment: { icon: Bell, color: "bg-blue-100 text-blue-600" },
  diagnosis: { icon: Stethoscope, color: "bg-purple-100 text-purple-600" },
  payment: { icon: CreditCard, color: "bg-red-100 text-red-600" },
  patient: { icon: UserPlus, color: "bg-green-100 text-green-600" },
  general: { icon: Info, color: "bg-gray-100 text-gray-600" },
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastSeen, setLastSeen] = useState<Date>(new Date(0));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications/all");
        if (res.ok) {
          const data = await res.json();
          setNotifications(data.notifications || []);
        }
      } finally {
        setLoading(false);
      }
    };

    // Get last seen before marking as read
    const stored = localStorage.getItem("notifications_last_seen");
    setLastSeen(stored ? new Date(stored) : new Date(0));

    // Mark all as read now
    localStorage.setItem("notifications_last_seen", new Date().toISOString());

    fetchNotifications();
  }, []);

  const isUnread = (createdAt: string) => new Date(createdAt) > lastSeen;
  const unreadCount = notifications.filter((n) => isUnread(n.createdAt)).length;

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto py-6 px-4 space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl p-4 h-16 animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-gray-400 mt-1">Last 7 days activity</p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <span className="bg-red-100 text-red-600 text-xs font-semibold px-3 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
          <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-3 py-1 rounded-full">
            {notifications.length} total
          </span>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <Bell size={40} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No notifications this week</p>
          <p className="text-gray-300 text-sm mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const config = typeConfig[n.type as keyof typeof typeConfig] || typeConfig.general;
            const Icon = config.icon;
            const unread = isUnread(n.createdAt);

            return (
              <Link
                key={n.id}
                href={n.link || "#"}
                className={`flex items-start gap-4 rounded-xl p-4 transition-all border ${
                  unread
                    ? "bg-blue-50 border-blue-100 hover:border-blue-200"
                    : "bg-white border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className={`p-2 rounded-xl shrink-0 ${config.color}`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm text-gray-800">{n.title}</p>
                    {unread && (
                      <span className="h-2 w-2 rounded-full bg-blue-500 shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                </div>
                <span className="text-xs text-gray-400 shrink-0 mt-0.5">
                  {format(new Date(n.createdAt), "MMM d, h:mm a")}
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
