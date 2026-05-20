import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { checkRole } from "@/utils/roles";
import { ReviewForm } from "../dialogs/review-form";

const AppointmentQuickLinks = async ({ staffId }: { staffId: string }) => {
  const isPatient = await checkRole("patient");

  return (
    <Card className="w-full rounded-xl bg-white shadow-none">
      <CardHeader>
        <CardTitle>Quick Links</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-2">
        <Link
          href="?cat=charts"
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-600"
        >
          Charts
        </Link>
        <Link
          href="?cat=appointments"
          className="px-4 py-2 rounded-lg bg-violet-100 text-violet-600"
        >
          Appointment
        </Link>
        <Link
          href="?cat=diagnosis"
          className="px-4 py-2 rounded-lg bg-blue-100 text-blue-600"
        >
          Diagnosis
        </Link>
        <Link
          href="?cat=billing"
          className="px-4 py-2 rounded-lg bg-green-100 text-green-600"
        >
          Bills
        </Link>
        <Link
          href="?cat=payments"
          className="px-4 py-2 rounded-lg bg-purple-100 text-purple-600"
        >
          Payments
        </Link>
        <Link
          href="?cat=lab-test"
          className="px-4 py-2 rounded-lg bg-orange-100 text-orange-600"
        >
          Lab Test
        </Link>
        {!isPatient && <ReviewForm staffId={staffId} />}
      </CardContent>
    </Card>
  );
};

export default AppointmentQuickLinks;
