// FILE: components/appointment-actions.tsx
// REPLACE existing file — removed "View Full Details" button (redundant with View modal)

import { checkRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { EllipsisVertical } from "lucide-react";
import { AppointmentActionDialog } from "./appointment-action-dialog";

interface ActionsProps {
  userId: string;
  status: string;
  patientId: string;
  doctorId: string;
  appointmentId: number;
  appointmentDate?: Date;
  appointmentTime?: string;
}

export const AppointmentActionOptions = async ({
  userId,
  patientId,
  doctorId,
  status,
  appointmentId,
  appointmentDate,
  appointmentTime,
}: ActionsProps) => {
  const user = await auth();
  const isAdmin = await checkRole("admin");
  const isPatient = await checkRole("patient");

  const isOverdue = (() => {
    if (!appointmentDate) return false;
    if (status !== "PENDING" && status !== "SCHEDULED") return false;

    const now = new Date();
    const apptDate = new Date(appointmentDate);

    if (appointmentTime) {
      const [timePart, meridiem] = appointmentTime.trim().split(" ");
      const [hoursRaw, minutes] = timePart.split(":").map(Number);
      let hours = hoursRaw;
      if (meridiem?.toUpperCase() === "PM" && hours !== 12) hours += 12;
      if (meridiem?.toUpperCase() === "AM" && hours === 12) hours = 0;
      apptDate.setHours(hours, minutes, 0, 0);
    } else {
      apptDate.setHours(23, 59, 59, 999);
    }

    return apptDate < now;
  })();

  // No 3-dot menu for completed or overdue appointments
  if (status === "COMPLETED" || status === "CANCELLED" || isOverdue) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center justify-center rounded-full p-1"
        >
          <EllipsisVertical size={16} className="text-sm text-gray-500" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3">
        <div className="space-y-3 flex flex-col items-start">
          <span className="text-gray-400 text-xs">Perform Actions</span>
          {isOverdue ? (
            <span className="text-xs text-red-400 italic">No actions — overdue</span>
          ) : null}
          {!isOverdue && status !== "SCHEDULED" && !isPatient && (
            <AppointmentActionDialog
              type="approve"
              id={appointmentId}
              disabled={isAdmin || user.userId === doctorId}
            />
          )}
          {!isOverdue && <AppointmentActionDialog
            type="cancel"
            id={appointmentId}
            disabled={
              status === "PENDING" &&
              (isAdmin || user.userId === doctorId || user.userId === patientId)
            }
          />}
        </div>
      </PopoverContent>
    </Popover>
  );
};
