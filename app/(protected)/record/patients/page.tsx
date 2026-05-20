// FILE: app/(protected)/record/patients/page.tsx
// REPLACE existing file

import { ActionDialog } from "@/components/action-dialog";
import { ViewAction } from "@/components/action-options";
import { Pagination } from "@/components/pagination";
import { ProfileImage } from "@/components/profile-image";
import SearchInput from "@/components/search-input";
import { Table } from "@/components/tables/table";
import { SearchParamsProps } from "@/types";
import { calculateAge } from "@/utils";
import { checkRole, getRole } from "@/utils/roles";
import { DATA_LIMIT } from "@/utils/seetings";
import { auth } from "@clerk/nextjs/server";
import { getAllPatients } from "@/utils/services/patient";
import { Patient } from "@/lib/generated/prisma/client";
import { format } from "date-fns";
import { Users } from "lucide-react";

const columns = [
  { header: "Patient Name", key: "name" },
  { header: "Gender/Phone", key: "gender", className: "hidden md:table-cell" },
  { header: "Email", key: "email", className: "hidden lg:table-cell" },
  { header: "Address", key: "address", className: "hidden xl:table-cell" },
  { header: "Last Visit", key: "visit", className: "hidden lg:table-cell" },
  { header: "Actions", key: "action" },
];

interface PatientProps extends Patient {
  appointments: {
    medical: {
      created_at: Date;
      treatment_plan: string;
    }[];
  }[];
}

const PatientList = async (props: SearchParamsProps) => {
  const searchParams = await props.searchParams;
  const page = (searchParams?.p || "1") as string;
  const searchQuery = (searchParams?.q || "") as string;

  const { userId } = await auth();
  const role = await getRole();

  const { data, totalPages, totalRecords, currentPage } = await getAllPatients({
    page,
    search: searchQuery,
    userId: userId!,
    role,
  });
  const isAdmin = await checkRole("admin");

  if (!data) return null;

  const renderRow = (item: PatientProps) => {
    const lastVisit = item?.appointments[0]?.medical[0] || null;
    const name = item?.first_name + " " + item?.last_name;

    return (
      <tr
        key={item?.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-slate-50"
      >
        {/* Patient Name + Age */}
        <td className="flex items-center gap-4 p-4">
          <ProfileImage
            url={item?.img!}
            name={name}
            bgColor={item?.colorCode!}
            textClassName="text-black"
          />
          <div>
            <h3 className="uppercase">{name}</h3>
            <span className="text-sm capitalize">
              {calculateAge(item?.date_of_birth)}
            </span>
          </div>
        </td>

        {/* Gender + Phone merged */}
        <td className="hidden md:table-cell">
          <p className="capitalize">{item?.gender?.toLowerCase()}</p>
          <p className="text-xs text-gray-400">{item?.phone}</p>
        </td>

        <td className="hidden lg:table-cell">{item?.email}</td>
        <td className="hidden xl:table-cell">{item?.address}</td>

        {/* Last Visit */}
        <td className="hidden lg:table-cell">
          {lastVisit ? (
            <p>{format(lastVisit.created_at, "MMM dd, yyyy")}</p>
          ) : (
            <span className="text-gray-400 italic text-xs">No visits yet</span>
          )}
        </td>

        {/* Actions — View + Delete only, no edit, no 3-dot menu */}
        <td>
          <div className="flex items-center gap-2">
            <ViewAction href={`/patient/${item?.id}`} />
            {isAdmin && (
              <ActionDialog
                type="delete"
                id={item.id}
                deleteType="patient"
              />
            )}
          </div>
        </td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-xl py-6 px-3 2xl:px-6">
      <div className="flex items-center justify-between">
        <div className="hidden lg:flex items-center gap-1">
          <Users size={20} className="text-gray-500" />
          <p className="text-2xl font-semibold">{totalRecords}</p>
          <span className="text-gray-600 text-sm xl:text-base">total patients</span>
        </div>
        <div className="w-full lg:w-fit flex items-center justify-between lg:justify-start gap-2">
          <SearchInput />
        </div>
      </div>

      <div className="mt-4">
        <Table columns={columns} data={data} renderRow={renderRow} />
        {totalPages && (
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            totalRecords={totalRecords}
            limit={DATA_LIMIT}
          />
        )}
      </div>
    </div>
  );
};

export default PatientList;
