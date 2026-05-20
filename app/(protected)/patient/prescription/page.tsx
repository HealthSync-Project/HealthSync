

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { format } from "date-fns";
import { Pill, Calendar, User, FileText, ClipboardList } from "lucide-react";
import { notFound } from "next/navigation";

const PrescriptionPage = async () => {
  const { userId } = await auth();
  if (!userId) return notFound();

  const diagnoses = await db.diagnosis.findMany({
    where: {
      patient_id: userId,
      prescribed_medications: { not: null },
    },
    include: {
      doctor: {
        select: { name: true, specialization: true, img: true, colorCode: true },
      },
      medical: {
        select: { appointment_id: true },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Prescriptions</h1>
          <p className="text-sm text-gray-400 mt-1">
            All prescriptions from your doctors
          </p>
        </div>
        <span className="bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full">
          {diagnoses.length} total
        </span>
      </div>

      {diagnoses.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm">
          <Pill size={40} className="text-gray-300 mx-auto mb-4" />
          <p className="text-gray-400 font-medium">No prescriptions yet</p>
          <p className="text-gray-300 text-sm mt-1">
            Prescriptions from your doctors will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {diagnoses.map((d, index) => (
            <div
              key={d.id}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-100"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 p-2 rounded-xl">
                    <Pill size={20} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      Prescription #{diagnoses.length - index}
                    </p>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mt-0.5">
                      <Calendar size={12} />
                      <span>{format(d.created_at, "MMM dd, yyyy")}</span>
                    </div>
                  </div>
                </div>

                {/* Doctor */}
                <div className="text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <User size={13} className="text-gray-400" />
                    <p className="text-sm font-medium">{d.doctor.name}</p>
                  </div>
                  <p className="text-xs text-gray-400 capitalize">
                    {d.doctor.specialization}
                  </p>
                </div>
              </div>

              {/* Diagnosis */}
              <div className="bg-gray-50 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <FileText size={13} className="text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Diagnosis
                  </span>
                </div>
                <p className="text-sm text-gray-700">{d.diagnosis}</p>
              </div>

              {/* Prescribed medications */}
              <div className="bg-blue-50 rounded-lg p-3 mb-3">
                <div className="flex items-center gap-1.5 mb-1">
                  <Pill size={13} className="text-blue-500" />
                  <span className="text-xs font-semibold text-blue-600 uppercase tracking-wide">
                    Prescribed Medications
                  </span>
                </div>
                <p className="text-sm text-gray-700">{d.prescribed_medications}</p>
              </div>

              {/* Follow up plan */}
              {d.follow_up_plan && (
                <div className="bg-amber-50 rounded-lg p-3 mb-3">
                  <div className="flex items-center gap-1.5 mb-1">
                    <ClipboardList size={13} className="text-amber-500" />
                    <span className="text-xs font-semibold text-amber-600 uppercase tracking-wide">
                      Follow-up Plan
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{d.follow_up_plan}</p>
                </div>
              )}

              {/* Notes */}
              {d.notes && (
                <p className="text-xs text-gray-400 mt-2 italic">{d.notes}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrescriptionPage;
