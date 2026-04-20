"use server";

import {
  ReviewFormValues,
  reviewSchema,
} from "@/components/dialogs/review-form";
import { db } from "@/lib/prisma";
import { clerkClient } from "@clerk/nextjs/server";

export async function deleteDataById(
  id: string,
  deleteType: "doctor" | "staff" | "patient" | "payment" | "bill"
) {
  try {
    const client = await clerkClient();

    switch (deleteType) {
      case "doctor":
        await db.doctor.delete({ where: { id } });
        await client.users.deleteUser(id);
        break;

      case "staff":
        await db.staff.delete({ where: { id } });
        await client.users.deleteUser(id);
        break;

      case "patient":
        await db.patient.delete({ where: { id } });
        await client.users.deleteUser(id);
        break;

      case "payment":
        await db.payment.delete({ where: { id: Number(id) } });
        break;

      default:
        return { success: false, message: "Invalid delete type", status: 400 };
    }

    return {
      success: true,
      message: "Data deleted successfully",
      status: 200,
    };
  } catch (error: any) {
    console.log("DELETE ERROR:", error.message);
    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}

export async function createReview(values: ReviewFormValues) {
  try {
    const validatedFields = reviewSchema.parse(values);

    await db.rating.create({
      data: {
        ...validatedFields,
      },
    });

    return {
      success: true,
      message: "Review created successfully",
      status: 200,
    };
  } catch (error) {
    console.log(error);

    return {
      success: false,
      message: "Internal Server Error",
      status: 500,
    };
  }
}