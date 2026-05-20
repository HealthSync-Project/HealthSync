"use server";

import { VitalSignsFormData } from "@/components/dialogs/add-vital-signs";
import { db } from "@/lib/prisma";
import { AppointmentSchema, VitalSignsSchema } from "@/lib/schema";
import { auth } from "@clerk/nextjs/server";
import { AppointmentStatus } from "@/lib/generated/prisma/client";
import { checkRole } from "@/utils/roles";

export async function createNewAppointment(data: any) {
  try {
    const validatedData = AppointmentSchema.safeParse(data);
    if (!validatedData.success) {
      return { success: false, msg: "Invalid data" };
    }
    const validated = validatedData.data;

    await db.appointment.create({
      data: {
        patient_id: data.patient_id,
        doctor_id: validated.doctor_id,
        time: validated.time,
        type: validated.type,
        appointment_date: new Date(validated.appointment_date),
        note: validated.note,
      },
    });

    return { success: true, message: "Appointment booked successfully" };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}

export async function appointmentAction(
  id: string | number,
  status: AppointmentStatus,
  reason: string
) {
  try {
    const { userId } = await auth();
    const isDoctor = await checkRole("doctor");

    // Get current appointment
    const current = await db.appointment.findUnique({
      where: { id: Number(id) },
    });

    if (!current) {
      return { success: false, msg: "Appointment not found" };
    }

    // ✅ Status flow guard — no going backwards
    const flow: AppointmentStatus[] = ["PENDING", "SCHEDULED", "COMPLETED", "CANCELLED"];
    const currentIndex = flow.indexOf(current.status);
    const newIndex = flow.indexOf(status);

    // Allow CANCELLED from PENDING or SCHEDULED only
    if (status === "CANCELLED") {
      if (current.status === "COMPLETED") {
        return { success: false, msg: "Cannot cancel a completed appointment" };
      }
      // ✅ Doctor cannot cancel a SCHEDULED appointment
      if (isDoctor && current.status === "SCHEDULED") {
        return { success: false, msg: "Doctors cannot cancel a scheduled appointment" };
      }
    }

    // ✅ No going backwards (e.g. COMPLETED → SCHEDULED)
    if (status !== "CANCELLED" && newIndex < currentIndex) {
      return {
        success: false,
        msg: `Cannot change status from ${current.status} to ${status}`,
      };
    }

    // ✅ Cannot complete a future appointment
    if (status === "COMPLETED" && new Date(current.appointment_date) > new Date()) {
      return {
        success: false,
        msg: "Cannot complete an appointment that hasn't happened yet",
      };
    }

    await db.appointment.update({
      where: { id: Number(id) },
      data: { status, reason },
    });

    return {
      success: true,
      error: false,
      msg: `Appointment ${status.toLowerCase()} successfully`,
    };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}

export async function addVitalSigns(
  data: VitalSignsFormData,
  appointmentId: string,
  doctorId: string
) {
  try {
    const { userId } = await auth();
    if (!userId) return { success: false, msg: "Unauthorized" };

    const validatedData = VitalSignsSchema.parse(data);

    let medicalRecord = null;

    if (!validatedData.medical_id) {
      medicalRecord = await db.medicalRecords.create({
        data: {
          patient_id: validatedData.patient_id,
          appointment_id: Number(appointmentId),
          doctor_id: doctorId,
        },
      });
    }

    const med_id = validatedData.medical_id || medicalRecord?.id;

    await db.vitalSigns.create({
      data: {
        ...validatedData,
        medical_id: Number(med_id!),
      },
    });

    return { success: true, msg: "Vital signs added successfully" };
  } catch (error) {
    console.log(error);
    return { success: false, msg: "Internal Server Error" };
  }
}