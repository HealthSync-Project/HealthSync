// FILE: components/appointment/vital-signs.tsx
// REPLACE existing file
// Shows only the latest vital signs reading, with a collapsible history below

import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { calculateBMI } from "@/utils";
import { format } from "date-fns";
import { Separator } from "../ui/separator";
import { checkRole } from "@/utils/roles";
import { AddVitalSigns } from "../dialogs/add-vital-signs";
import { db } from "@/lib/prisma";
import { Activity, ChevronDown, Thermometer, Heart, Wind, Droplets } from "lucide-react";

interface VitalSignsProps {
  id: number | string;
  patientId: string;
  doctorId: string;
  medicalId?: string;
  appointmentId?: string;
}

const VitalItem = ({
  label,
  value,
  icon: Icon,
  color = "text-gray-700",
}: {
  label: string;
  value: string;
  icon?: any;
  color?: string;
}) => (
  <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-1">
    {Icon && <Icon size={16} className="text-gray-400 mb-1" />}
    <p className={`text-xl font-bold ${color}`}>{value}</p>
    <p className="text-xs text-gray-400">{label}</p>
  </div>
);

export const VitalSigns = async ({ id, patientId, doctorId }: VitalSignsProps) => {
  const data = await db.medicalRecords.findFirst({
    where: { appointment_id: Number(id) },
    include: {
      vital_signs: {
        orderBy: { created_at: "desc" },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const vitals = data?.vital_signs || [];
  const latest = vitals[0] || null;
  const history = vitals.slice(1);
  const isPatient = await checkRole("PATIENT");

  const { bmi, status, colorCode } = latest
    ? calculateBMI(latest.weight || 0, latest.height || 0)
    : { bmi: "N/A", status: "N/A", colorCode: "#888" };

  return (
    <section id="vital-signs">
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle>Vital Signs</CardTitle>
            {latest && (
              <p className="text-xs text-gray-400 mt-1">
                Last recorded: {format(latest.created_at, "MMM d, yyyy hh:mm a")}
              </p>
            )}
          </div>
          {!isPatient && (
            <AddVitalSigns
              key={new Date().getTime()}
              patientId={patientId}
              doctorId={doctorId}
              appointmentId={id!.toString()}
              medicalId={data?.id?.toString() || ""}
            />
          )}
        </CardHeader>

        <CardContent>
          {!latest ? (
            <p className="text-gray-400 italic text-sm text-center py-8">
              No vital signs recorded yet.
            </p>
          ) : (
            <>
              {/* Latest reading grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                <VitalItem
                  label="Temperature"
                  value={`${latest.body_temperature}°C`}
                  icon={Thermometer}
                  color={latest.body_temperature > 37.5 ? "text-red-500" : "text-gray-700"}
                />
                <VitalItem
                  label="Blood Pressure"
                  value={`${latest.systolic}/${latest.diastolic} mmHg`}
                  icon={Activity}
                  color={latest.systolic > 140 ? "text-red-500" : "text-gray-700"}
                />
                <VitalItem
                  label="Heart Rate"
                  value={`${latest.heartRate} bpm`}
                  icon={Heart}
                  color="text-rose-500"
                />
                <VitalItem
                  label="BMI"
                  value={`${bmi}`}
                  color={colorCode === "#ff0000" ? "text-red-500" : "text-gray-700"}
                />
                <VitalItem label="Weight" value={`${latest.weight} kg`} />
                <VitalItem label="Height" value={`${latest.height} cm`} />
                {latest.respiratory_rate && (
                  <VitalItem
                    label="Respiratory Rate"
                    value={`${latest.respiratory_rate} /min`}
                    icon={Wind}
                  />
                )}
                {latest.oxygen_saturation && (
                  <VitalItem
                    label="O₂ Saturation"
                    value={`${latest.oxygen_saturation}%`}
                    icon={Droplets}
                    color={latest.oxygen_saturation < 95 ? "text-red-500" : "text-green-600"}
                  />
                )}
              </div>

              {/* BMI status badge */}
              <div className="mt-3 inline-flex items-center gap-2">
                <span className="text-xs text-gray-500">BMI Status:</span>
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ color: colorCode, backgroundColor: `${colorCode}18` }}
                >
                  {status}
                </span>
              </div>

              {/* Previous readings — collapsed */}
              {history.length > 0 && (
                <details className="mt-6">
                  <summary className="flex items-center gap-2 text-sm text-gray-500 cursor-pointer hover:text-gray-800 list-none">
                    <ChevronDown size={16} />
                    {history.length} previous reading{history.length > 1 ? "s" : ""}
                  </summary>
                  <div className="mt-4 space-y-4">
                    {history.map((el) => {
                      const { bmi: hBmi, status: hStatus, colorCode: hColor } =
                        calculateBMI(el.weight || 0, el.height || 0);
                      return (
                        <div key={el.id} className="border rounded-xl p-4">
                          <p className="text-xs text-gray-400 mb-3">
                            {format(el.created_at, "MMM d, yyyy hh:mm a")}
                          </p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                            <div><span className="text-gray-400">Temp: </span>{el.body_temperature}°C</div>
                            <div><span className="text-gray-400">BP: </span>{el.systolic}/{el.diastolic} mmHg</div>
                            <div><span className="text-gray-400">HR: </span>{el.heartRate} bpm</div>
                            <div><span className="text-gray-400">Weight: </span>{el.weight} kg</div>
                            <div><span className="text-gray-400">Height: </span>{el.height} cm</div>
                            <div>
                              <span className="text-gray-400">BMI: </span>
                              <span style={{ color: hColor }}>{hBmi} ({hStatus})</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </details>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
};
