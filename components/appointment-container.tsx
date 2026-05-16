import React from "react";
import { BookAppointment } from "./forms/book-appointment";
import { getPatientById } from "@/utils/services/patient";
import { getDoctors } from "@/utils/services/doctor";

export const AppointmentContainer = async ({
  id,
  defaultDoctorId, // ✅ ADDED
}: {
  id: string;
  defaultDoctorId?: string; // ✅ ADDED
}) => {
  const { data } = await getPatientById(id);
  const { data: doctors } = await getDoctors();

  return (
    <div>
      <BookAppointment
        data={data!}
        doctors={doctors!}
        defaultDoctorId={defaultDoctorId} // ✅ ADDED
      />
    </div>
  );
};