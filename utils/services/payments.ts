// FILE: utils/services/payments.ts
// REPLACE your existing file entirely

import { db } from "@/lib/prisma";
import { Prisma } from "@/lib/generated/prisma/client";

export async function getPaymentRecords({
  page,
  limit,
  search,
  userId,
  role,
}: {
  page: number | string;
  limit?: number | string;
  search?: string;
  userId?: string;
  role?: string;
}) {
  try {
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page);
    const LIMIT = Number(limit) || 10;
    const SKIP = (PAGE_NUMBER - 1) * LIMIT;

    // Role-based access filter
    let accessFilter: Prisma.PaymentWhereInput = {};

    if (role === "patient" && userId) {
      // Patient sees only their own bills
      accessFilter = { patient_id: userId };
    } else if (role === "doctor" && userId) {
      // Doctor sees only bills from their appointments
      accessFilter = {
        appointment: { doctor_id: userId },
      };
    }
    // admin sees everything — no filter

    // Search filter
    const searchFilter: Prisma.PaymentWhereInput = search
      ? {
          OR: [
            { patient: { first_name: { contains: search, mode: "insensitive" } } },
            { patient: { last_name: { contains: search, mode: "insensitive" } } },
            { patient_id: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const where: Prisma.PaymentWhereInput = {
      AND: [accessFilter, searchFilter],
    };

    const [data, totalRecords] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          patient: {
            select: {
              first_name: true,
              last_name: true,
              date_of_birth: true,
              img: true,
              colorCode: true,
              gender: true,
              phone: true,
            },
          },
        },
        skip: SKIP,
        take: LIMIT,
        orderBy: { created_at: "desc" },
      }),
      db.payment.count({ where }),
    ]);

    const totalPages = Math.ceil(totalRecords / LIMIT);

    return {
      success: true,
      data,
      totalRecords,
      totalPages,
      currentPage: PAGE_NUMBER,
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}

export async function getPatientPaymentRecords({
  page,
  limit,
  search,
  patientId,
}: {
  page: number | string;
  limit?: number | string;
  search?: string;
  patientId: string;
}) {
  try {
    const PAGE_NUMBER = Number(page) <= 0 ? 1 : Number(page);
    const LIMIT = Number(limit) || 10;
    const SKIP = (PAGE_NUMBER - 1) * LIMIT;

    const where: Prisma.PaymentWhereInput = {
      patient_id: patientId,
      OR: search
        ? [
            { patient: { first_name: { contains: search, mode: "insensitive" } } },
            { patient: { last_name: { contains: search, mode: "insensitive" } } },
          ]
        : undefined,
    };

    const [data, totalRecords] = await Promise.all([
      db.payment.findMany({
        where,
        include: {
          patient: {
            select: {
              first_name: true,
              last_name: true,
              date_of_birth: true,
              img: true,
              colorCode: true,
              gender: true,
              phone: true,
            },
          },
        },
        skip: SKIP,
        take: LIMIT,
        orderBy: { created_at: "desc" },
      }),
      db.payment.count({ where }),
    ]);

    const totalPages = Math.ceil(totalRecords / LIMIT);

    return {
      success: true,
      data,
      totalRecords,
      totalPages,
      currentPage: PAGE_NUMBER,
      status: 200,
    };
  } catch (error) {
    console.log(error);
    return { success: false, message: "Internal Server Error", status: 500 };
  }
}