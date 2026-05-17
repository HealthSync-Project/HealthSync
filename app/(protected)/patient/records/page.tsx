import { MedicalHistoryContainer } from "@/components/medical-history-container";
import { auth } from "@clerk/nextjs/server";
import React from "react";

const PatientRecords = async () => {
  const { userId } = await auth();

  return (
    <div className="bg-gray-100/60 h-full rounded-xl py-6 px-3 2xl:p-6">
      {/*<h1 className="text-2xl font-semibold mb-6">Medical Records</h1>*/}
      <MedicalHistoryContainer patientId={userId!} />
    </div>
  );
};

export default PatientRecords;