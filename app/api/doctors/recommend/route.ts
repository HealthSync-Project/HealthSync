import { db } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { specialization } = await req.json();

    if (!specialization) {
      return Response.json(
        { doctors: [] },
        { status: 200 }
      );
    }

    const doctors = await db.doctor.findMany({
      where: {
        specialization: {
          contains: specialization,
          mode: "insensitive",
        },
      },

      select: {
        id: true,
        name: true,
        specialization: true,
        img: true,
        colorCode: true,
        department: true,
        type: true,
      },

      take: 3,
    });

    return Response.json({ doctors });

  } catch (error) {
    console.error(error);

    return Response.json(
      { doctors: [] },
      { status: 500 }
    );
  }
}