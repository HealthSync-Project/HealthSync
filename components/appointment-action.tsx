"use client";

import { AppointmentStatus } from "@/lib/generated/prisma/client";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { useRouter } from "next/navigation";
import { appointmentAction } from "@/app/actions/appointment";

interface ActionProps {
  id: string | number;
  status: string;
  appointmentDate?: Date;
}

export const AppointmentAction = ({ id, status, appointmentDate }: ActionProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");
  const router = useRouter();

  // No actions for completed or cancelled appointments
  if (status === "COMPLETED" || status === "CANCELLED") return null;

  // Overdue — past date only (not today), not completed
  // Strip time so today's appointments are never marked overdue
  const isOverdue = (() => {
    if (!appointmentDate) return false;
    const appt = new Date(appointmentDate);
    const today = new Date();
    appt.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    return appt < today;
  })();
  if (isOverdue) return (
    <span className="text-xs text-red-400 italic">Overdue — no actions available</span>
  );

  const handleAction = async () => {
    try {
      setIsLoading(true);
      const newReason =
        reason ||
        `Appointment has been ${selected.toLowerCase()} on ${new Date().toLocaleDateString()}`;

      const resp = await appointmentAction(
        id,
        selected as AppointmentStatus,
        newReason
      );

      if (resp.success) {
        toast.success(resp.msg);
        setSelected("");
        setReason("");
        if (selected === "COMPLETED") {
          router.push(`/record/appointments/${id}`);
        } else {
          router.refresh();
        }
      } else {
        toast.error(resp.msg);
      }
    } catch (error) {
      console.log(error);
      toast.error("Something went wrong. Try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center gap-2 flex-wrap">
        {/* PENDING → can be Approved or Cancelled */}
        {status === "PENDING" && (
          <>
            <Button
              variant="outline"
              disabled={isLoading}
              className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200"
              onClick={() => setSelected("SCHEDULED")}
            >
              Approve
            </Button>
            <Button
              variant="outline"
              disabled={isLoading}
              className="bg-red-100 text-red-700 border-red-200 hover:bg-red-200"
              onClick={() => setSelected("CANCELLED")}
            >
              Cancel
            </Button>
          </>
        )}

        {/* SCHEDULED → can only be Completed (doctor can't cancel scheduled) */}
        {status === "SCHEDULED" && (
          <Button
            variant="outline"
            disabled={isLoading}
            className="bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200"
            onClick={() => setSelected("COMPLETED")}
          >
            Mark Completed
          </Button>
        )}
      </div>

      {/* Cancellation reason */}
      {selected === "CANCELLED" && (
        <Textarea
          disabled={isLoading}
          className="mt-4"
          placeholder="Enter reason for cancellation..."
          onChange={(e) => setReason(e.target.value)}
        />
      )}

      {/* Confirm action */}
      {selected && (
        <div className="flex items-center justify-between mt-4 bg-gray-50 border rounded-lg p-3">
          <p className="text-sm text-gray-600">
            {selected === "SCHEDULED" && "Approve this appointment?"}
            {selected === "COMPLETED" && "Mark this appointment as completed?"}
            {selected === "CANCELLED" && "Cancel this appointment?"}
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => { setSelected(""); setReason(""); }}
            >
              No
            </Button>
            <Button
              size="sm"
              disabled={isLoading || (selected === "CANCELLED" && !reason)}
              onClick={handleAction}
            >
              {isLoading ? "Processing..." : "Yes"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
