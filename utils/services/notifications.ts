import { db } from "@/lib/prisma";

const ONE_WEEK_AGO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d;
};

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "appointment" | "diagnosis" | "payment" | "patient" | "general";
  link?: string;
  createdAt: Date;
}

export async function getAdminNotifications(): Promise<Notification[]> {
  const since = ONE_WEEK_AGO();

  const [newPatients, pendingAppointments, unpaidBills, newDiagnoses] =
    await Promise.all([
      db.patient.findMany({
        where: { created_at: { gte: since } },
        select: { id: true, first_name: true, last_name: true, created_at: true },
        orderBy: { created_at: "desc" },
        take: 10,
      }),
      db.appointment.findMany({
        where: { status: "PENDING", created_at: { gte: since } },
        include: {
          patient: { select: { first_name: true, last_name: true } },
          doctor: { select: { name: true } },
        },
        orderBy: { created_at: "desc" },
        take: 10,
      }),
      db.payment.findMany({
        where: { status: "UNPAID", created_at: { gte: since } },
        include: {
          patient: { select: { first_name: true, last_name: true } },
        },
        orderBy: { created_at: "desc" },
        take: 10,
      }),
      db.diagnosis.findMany({
        where: { created_at: { gte: since } },
        include: {
          medical: { include: { patient: { select: { first_name: true, last_name: true } } } },
        },
        orderBy: { created_at: "desc" },
        take: 5,
      }),
    ]);

  const notifications: Notification[] = [];

  pendingAppointments.forEach((a) => {
    notifications.push({
      id: `appt-${a.id}`,
      title: "New Appointment Request",
      message: `${a.patient.first_name} ${a.patient.last_name} booked with Dr. ${a.doctor.name}`,
      type: "appointment",
      link: `/record/appointments`,
      createdAt: a.created_at,
    });
  });

  newPatients.forEach((p) => {
    notifications.push({
      id: `patient-${p.id}`,
      title: "New Patient Registered",
      message: `${p.first_name} ${p.last_name} joined the system`,
      type: "patient",
      link: `/record/patients`,
      createdAt: p.created_at,
    });
  });

  unpaidBills.forEach((b) => {
    notifications.push({
      id: `bill-${b.id}`,
      title: "Unpaid Bill",
      message: `${b.patient.first_name} ${b.patient.last_name} has an outstanding bill of ${b.total_amount.toFixed(2)}`,
      type: "payment",
      link: `/record/billing`,
      createdAt: b.created_at,
    });
  });

  newDiagnoses.forEach((d) => {
    const patient = d.medical?.patient;
    notifications.push({
      id: `diag-${d.id}`,
      title: "New Diagnosis Added",
      message: `Diagnosis recorded for ${patient?.first_name} ${patient?.last_name}`,
      type: "diagnosis",
      link: `/record/medical-records`,
      createdAt: d.created_at,
    });
  });

  return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getDoctorNotifications(doctorId: string): Promise<Notification[]> {
  const since = ONE_WEEK_AGO();

  const [pendingAppointments, completedAppointments, newDiagnoses] =
    await Promise.all([
      db.appointment.findMany({
        where: { doctor_id: doctorId, status: "PENDING", created_at: { gte: since } },
        include: { patient: { select: { first_name: true, last_name: true } } },
        orderBy: { created_at: "desc" },
        take: 10,
      }),
      db.appointment.findMany({
        where: { doctor_id: doctorId, status: "COMPLETED", updated_at: { gte: since } },
        include: { patient: { select: { first_name: true, last_name: true } } },
        orderBy: { updated_at: "desc" },
        take: 5,
      }),
      db.diagnosis.findMany({
        where: { doctor_id: doctorId, created_at: { gte: since } },
        include: {
          medical: { include: { patient: { select: { first_name: true, last_name: true } } } },
        },
        orderBy: { created_at: "desc" },
        take: 5,
      }),
    ]);

  const notifications: Notification[] = [];

  pendingAppointments.forEach((a) => {
    notifications.push({
      id: `appt-${a.id}`,
      title: "Appointment Awaiting Approval",
      message: `${a.patient.first_name} ${a.patient.last_name} — ${new Date(a.appointment_date).toLocaleDateString()}`,
      type: "appointment",
      link: `/record/appointments`,
      createdAt: a.created_at,
    });
  });

  completedAppointments.forEach((a) => {
    notifications.push({
      id: `completed-${a.id}`,
      title: "Consultation Completed",
      message: `Visit with ${a.patient.first_name} ${a.patient.last_name} marked complete`,
      type: "appointment",
      link: `/record/appointments/${a.id}`,
      createdAt: a.updated_at,
    });
  });

  newDiagnoses.forEach((d) => {
    const patient = d.medical?.patient;
    notifications.push({
      id: `diag-${d.id}`,
      title: "Diagnosis Recorded",
      message: `You added a diagnosis for ${patient?.first_name} ${patient?.last_name}`,
      type: "diagnosis",
      link: `/record/medical-records`,
      createdAt: d.created_at,
    });
  });

  return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}

export async function getPatientNotifications(patientId: string): Promise<Notification[]> {
  const since = ONE_WEEK_AGO();

  const [appointments, diagnoses, bills] = await Promise.all([
    db.appointment.findMany({
      where: { patient_id: patientId, updated_at: { gte: since } },
      include: { doctor: { select: { name: true, specialization: true } } },
      orderBy: { updated_at: "desc" },
      take: 10,
    }),
    db.diagnosis.findMany({
      where: {
        patient_id: patientId,
        created_at: { gte: since },
      },
      include: { doctor: { select: { name: true } } },
      orderBy: { created_at: "desc" },
      take: 5,
    }),
    db.payment.findMany({
      where: { patient_id: patientId, status: { in: ["UNPAID", "PART"] }, created_at: { gte: since } },
      orderBy: { created_at: "desc" },
      take: 5,
    }),
  ]);

  const notifications: Notification[] = [];

  appointments.forEach((a) => {
    const statusMessages: Record<string, string> = {
      SCHEDULED: `Your appointment with Dr. ${a.doctor.name} has been confirmed`,
      COMPLETED: `Your consultation with Dr. ${a.doctor.name} is complete`,
      CANCELLED: `Your appointment with Dr. ${a.doctor.name} was cancelled`,
      PENDING: `Your appointment request with Dr. ${a.doctor.name} is pending`,
    };
    notifications.push({
      id: `appt-${a.id}`,
      title: `Appointment ${a.status.charAt(0) + a.status.slice(1).toLowerCase()}`,
      message: statusMessages[a.status] || `Appointment status updated`,
      type: "appointment",
      link: `/record/appointments`,
      createdAt: a.updated_at,
    });
  });

  diagnoses.forEach((d) => {
    notifications.push({
      id: `diag-${d.id}`,
      title: "New Diagnosis & Prescription",
      message: `Dr. ${d.doctor.name} added a diagnosis${d.prescribed_medications ? " with prescription" : ""}`,
      type: "diagnosis",
      link: `/record/medical-records`,
      createdAt: d.created_at,
    });
  });

  bills.forEach((b) => {
    notifications.push({
      id: `bill-${b.id}`,
      title: b.status === "PART" ? "Partial Payment Pending" : "Bill Due",
      message: `Outstanding amount: ${(b.total_amount - b.amount_paid).toFixed(2)}`,
      type: "payment",
      link: `/record/billing`,
      createdAt: b.created_at,
    });
  });

  return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
}