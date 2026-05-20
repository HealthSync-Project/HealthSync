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
}

export const AppointmentActionOptions = async ({
  userId,
  patientId,
  doctorId,
  status,
  appointmentId,
  appointmentDate,
}: ActionsProps) => {
  const user = await auth();
  const isAdmin = await checkRole("admin");
  const isPatient = await checkRole("patient");
  const isOverdue = appointmentDate && new Date(appointmentDate) < new Date() &&
    (status === "PENDING" || status === "SCHEDULED");

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
