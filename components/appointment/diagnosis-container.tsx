// FILE: components/appointment/diagnosis-container.tsx
// REPLACE existing file — removed import of deleted medical-history-card.tsx, inlined it

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { NoDataFound } from "../no-data-found";
import { AddDiagnosis } from "../dialogs/add-diagnosis";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { checkRole } from "@/utils/roles";
import { db } from "@/lib/prisma";
import { Diagnosis, Doctor } from "@/lib/generated/prisma/client";

interface ExtendedDiagnosis extends Diagnosis {
  doctor: Doctor;
}

// Inlined from deleted medical-history-card.tsx
const DiagnosisCard = ({
  record,
  index,
}: {
  record: ExtendedDiagnosis;
  index: number;
}) => {
  return (
    <Card className="shadow-none">
      <div className="space-y-6 pt-4 p-4">
        <div className="flex gap-x-6 justify-between">
          <div>
            <span className="text-sm text-gray-500">Record ID</span>
            <p className="text-xl font-medium"># {record.id}</p>
          </div>
          {index === 0 && (
            <div className="px-4 h-8 text-center bg-blue-100 rounded-full font-semibold text-blue-600 flex items-center">
              <span>Recent</span>
            </div>
          )}
          <div>
            <span className="text-sm text-gray-500">Date</span>
            <p className="text-xl font-medium">
              {record.created_at.toLocaleDateString()}
            </p>
          </div>
        </div>

        <Separator />

        <div>
          <span className="text-sm text-gray-500">Diagnosis</span>
          <p className="text-lg text-muted-foreground">{record.diagnosis}</p>
        </div>

        <Separator />

        <div>
          <span className="text-sm text-gray-500">Symptoms</span>
          <p className="text-lg text-muted-foreground">{record.symptoms}</p>
        </div>

        <Separator />

        <div>
          <span className="text-sm text-gray-500">Additional Note</span>
          <p className="text-lg text-muted-foreground">{record.notes || "—"}</p>
        </div>

        <Separator />

        <div>
          <span className="text-sm text-gray-500">Doctor</span>
          <p className="text-lg text-muted-foreground">{record.doctor.name}</p>
          <span className="text-sm text-gray-400">{record.doctor.specialization}</span>
        </div>

        {record.prescribed_medications && (
          <>
            <Separator />
            <div>
              <span className="text-sm text-gray-500">Prescribed Medications</span>
              <p className="text-lg text-muted-foreground">{record.prescribed_medications}</p>
            </div>
          </>
        )}

        {record.follow_up_plan && (
          <>
            <Separator />
            <div>
              <span className="text-sm text-gray-500">Follow-up Plan</span>
              <p className="text-lg text-muted-foreground">{record.follow_up_plan}</p>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export const DiagnosisContainer = async ({
  patientId,
  doctorId,
  id,
}: {
  patientId: string;
  doctorId: string;
  id: string;
}) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const data = await db.medicalRecords.findFirst({
    where: { appointment_id: Number(id) },
    include: {
      diagnosis: {
        include: { doctor: true },
        orderBy: { created_at: "desc" },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const diagnosis = data?.diagnosis || null;
  const isPatient = await checkRole("PATIENT");

  return (
    <div>
      {diagnosis?.length === 0 || !diagnosis ? (
        <div className="flex flex-col items-center justify-center mt-20">
          <NoDataFound note="No diagnosis found" />
          <AddDiagnosis
            key={new Date().getTime()}
            patientId={patientId}
            doctorId={doctorId}
            appointmentId={id}
            medicalId={data?.id.toString() || ""}
          />
        </div>
      ) : (
        <section className="space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Medical Records</CardTitle>
              {!isPatient && (
                <AddDiagnosis
                  key={new Date().getTime()}
                  patientId={patientId}
                  doctorId={doctorId}
                  appointmentId={id}
                  medicalId={data?.id.toString() || ""}
                />
              )}
            </CardHeader>
            <CardContent className="space-y-8">
              {diagnosis?.map((record, index) => (
                <div key={record.id}>
                  <DiagnosisCard record={record} index={index} />
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
};
