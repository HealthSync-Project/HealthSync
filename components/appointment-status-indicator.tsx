// FILE: components/appointment-status-indicator.tsx
// REPLACE existing file
// Shows CANCELLED for overdue PENDING/SCHEDULED appointments (display only, no DB change)

import { cn } from "@/lib/utils";
import { AppointmentStatus } from "@/lib/generated/prisma/client";

const status_color = {
  PENDING: "bg-yellow-600/15 text-yellow-600",
  SCHEDULED: "bg-emerald-600/15 text-emerald-600",
  CANCELLED: "bg-red-600/15 text-red-600",
  COMPLETED: "bg-blue-600/15 text-blue-600",
};

export const AppointmentStatusIndicator = ({
  status,
  appointmentDate,
  appointmentTime,
}: {
  status: AppointmentStatus;
  appointmentDate?: Date;
  appointmentTime?: string; // e.g. "11:30 AM"
}) => {
  const isOverdue = (() => {
    if (!appointmentDate) return false;
    if (status !== "PENDING" && status !== "SCHEDULED") return false;

    const now = new Date();
    const apptDate = new Date(appointmentDate);

    // Build a full datetime by combining the date with the time string
    if (appointmentTime) {
      const [timePart, meridiem] = appointmentTime.trim().split(" ");
      const [hoursRaw, minutes] = timePart.split(":").map(Number);
      let hours = hoursRaw;
      if (meridiem?.toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (meridiem?.toUpperCase() === "AM" && hours === 12) hours = 0;
      apptDate.setHours(hours, minutes, 0, 0);
    } else {
      // No time given — only mark overdue if the date itself is past (not today)
      apptDate.setHours(23, 59, 59, 999);
    }

    return apptDate < now;
  })();

  const displayStatus = isOverdue ? "CANCELLED" : status;
  const displayLabel = isOverdue ? "Overdue" : status.toLowerCase();

  return (
    <div className="flex flex-col gap-0.5">
      <p
        className={cn(
          "w-fit px-2 py-1 rounded-full capitalize text-xs lg:text-sm",
          status_color[displayStatus]
        )}
      >
        {displayLabel}
      </p>
      {isOverdue && (
        <span className="text-xs text-gray-400 pl-1">Not attended</span>
      )}
    </div>
  );
};
