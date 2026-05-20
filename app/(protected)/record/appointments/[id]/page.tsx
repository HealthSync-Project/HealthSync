
import { BillsContainer } from "@/components/appointment/bills-container";
import { DiagnosisContainer } from "@/components/appointment/diagnosis-container";
import { PatientDetailsCard } from "@/components/appointment/patient-details-card";
import { PaymentsContainer } from "@/components/appointment/payment-container";
import { VitalSigns } from "@/components/appointment/vital-signs";
import ChartContainer from "@/components/appointment/chart-container";
import { AppointmentAction } from "@/components/appointment-action";
import { getAppointmentWithMedicalRecordsById } from "@/utils/services/appointment";
import { checkRole } from "@/utils/roles";
import { format } from "date-fns";
import {
  Activity,
  Stethoscope,
  FlaskConical,
  Receipt,
  CreditCard,
  BarChart2,
  CalendarCheck,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const AppointmentDetailsPage = async ({ params, searchParams }: Props) => {
  const { id } = await params;
  const search = await searchParams;
  const cat = (search?.cat as string) || "consultation";

  const { data } = await getAppointmentWithMedicalRecordsById(Number(id));

  if (!data) return notFound();

  const isPatient = await checkRole("patient");
  const isDoctor = await checkRole("doctor");
  const isAdmin = await checkRole("admin");

  const tabs = [
    { key: "consultation", label: "Consultation", icon: Stethoscope },
    { key: "charts", label: "Charts", icon: BarChart2 },
    { key: "diagnosis", label: "Diagnosis", icon: FlaskConical },
    { key: "billing", label: "Bills", icon: Receipt },
    { key: "payments", label: "Payments", icon: CreditCard },
  ];

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen gap-6 p-4 2xl:p-6">

      {/* LEFT — main content */}
      <div className="w-full lg:w-[65%] flex flex-col gap-6">

        {/* Appointment header */}
        <div className="bg-white rounded-xl p-5 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CalendarCheck size={18} className="text-blue-500" />
                <h2 className="font-semibold text-lg">Appointment #{data.id}</h2>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                <span>{format(data.appointment_date, "MMM dd, yyyy")}</span>
                <span>•</span>
                <span>{data.time}</span>
                <span>•</span>
                <span className="capitalize">{data.type}</span>
                {data.note && (
                  <>
                    <span>•</span>
                    <span className="italic">"{data.note}"</span>
                  </>
                )}
              </div>
            </div>

            {/* Status + Action */}
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                data.status === "COMPLETED"
                  ? "bg-green-100 text-green-700"
                  : data.status === "SCHEDULED"
                  ? "bg-blue-100 text-blue-700"
                  : data.status === "CANCELLED"
                  ? "bg-red-100 text-red-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}>
                {data.status}
              </span>
              {(isDoctor || isAdmin) && (
                <AppointmentAction id={data.id} status={data.status} appointmentDate={data.appointment_date} />
              )}
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        <div className="flex gap-1 bg-white rounded-xl p-1.5 shadow-sm overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = cat === tab.key;
            return (
              <Link
                key={tab.key}
                href={`/record/appointments/${id}?cat=${tab.key}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </Link>
            );
          })}
        </div>

        {/* CONSULTATION — vitals + diagnosis in one scroll */}
        {cat === "consultation" && (
          <div className="space-y-6">
            <VitalSigns
              id={data.id}
              patientId={data.patient_id}
              doctorId={data.doctor_id}
            />
            <DiagnosisContainer
              id={id}
              patientId={data.patient_id}
              doctorId={data.doctor_id}
            />
          </div>
        )}

        {cat === "charts" && (
          <ChartContainer id={data.patient_id} />
        )}

        {cat === "diagnosis" && (
          <DiagnosisContainer
            id={id}
            patientId={data.patient_id}
            doctorId={data.doctor_id}
          />
        )}

        {cat === "billing" && <BillsContainer id={id} />}

        {cat === "payments" && (
          <PaymentsContainer patientId={data.patient_id} />
        )}

      </div>

      {/* RIGHT — patient sidebar */}
      <div className="w-full lg:w-[35%] space-y-6">
        <PatientDetailsCard
          data={data.patient}
          doctor={data.doctor ?? null}
        />
      </div>

    </div>
  );
};

export default AppointmentDetailsPage;
