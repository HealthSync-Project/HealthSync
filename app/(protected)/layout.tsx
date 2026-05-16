import { Navbar } from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import { getPatientFullDataById } from "@/utils/services/patient";
import { auth } from "@clerk/nextjs/server";
import React from "react";
import Mira from "@/components/chatbot";

const ProtectedLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { sessionClaims, userId } = await auth();
  const role = (sessionClaims?.metadata as any)?.role;

  // Fetch patient data only if role is patient
  const patientData = role === "patient" && userId
    ? (await getPatientFullDataById(userId)).data
    : null;

  return (
    <div className="relative flex min-h-screen overflow-hidden bg-[#EEF2FF]">

      {/* BACKGROUND GLOWS */}
      <div className="absolute top-[-120px] left-[-120px] h-[300px] w-[300px] rounded-full bg-blue-400/10 blur-3xl" />
      <div className="absolute bottom-[-140px] right-[-120px] h-[320px] w-[320px] rounded-full bg-purple-400/10 blur-3xl" />

      {/* GRID */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="h-full w-full bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:72px_72px]" />
      </div>

      {/* SIDEBAR */}
      <div className="relative z-10 w-[78px] lg:w-[260px] flex-shrink-0 border-r border-white/40 bg-white/50 backdrop-blur-xl">
        <Sidebar />
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-10 flex flex-1 flex-col overflow-hidden">
        <div className="border-b border-white/40 bg-white/40 backdrop-blur-xl">
          <Navbar />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">
            {children}
          </div>
        </main>
      </div>

      {/* CHATBOT - patients only, full data */}
      {role === "patient" && patientData && (
        <Mira
          patientData={{
            id: userId!,
            name: `${patientData?.first_name} ${patientData?.last_name}`,
            gender: patientData?.gender,
            blood_group: (patientData as any)?.blood_group,
            allergies: (patientData as any)?.allergies,
            medical_conditions: (patientData as any)?.medical_conditions,
            medical_history: (patientData as any)?.medical_history,
            lastVisit: (patientData as any)?.lastVisit,
          }}
        />
      )}

    </div>
  );
};

export default ProtectedLayout;