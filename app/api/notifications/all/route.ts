import { getAdminNotifications, getDoctorNotifications, getPatientNotifications } from "@/utils/services/notifications";
import { getRole } from "@/utils/roles";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { userId } = await auth();
    const role = await getRole();

    let notifications: any[] = [];

    if (role === "admin") {
      notifications = await getAdminNotifications();
    } else if (role === "doctor" && userId) {
      notifications = await getDoctorNotifications(userId);
    } else if (role === "patient" && userId) {
      notifications = await getPatientNotifications(userId);
    }

    return NextResponse.json({ notifications });
  } catch (error) {
    return NextResponse.json({ notifications: [] });
  }
}