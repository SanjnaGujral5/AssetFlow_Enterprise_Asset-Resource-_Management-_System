import { prisma } from "../../lib/prisma";

async function refreshBookingStatuses() {
  const now = new Date();

  await prisma.booking.updateMany({
    where: {
      status: { in: ["UPCOMING", "ONGOING"] },
      endTime: { lte: now },
    },
    data: { status: "COMPLETED" },
  });

  await prisma.booking.updateMany({
    where: {
      status: "UPCOMING",
      startTime: { lte: now },
      endTime: { gt: now },
    },
    data: { status: "ONGOING" },
  });
}

export async function listBookings(query: { mine?: string; userId?: string }) {
  await refreshBookingStatuses();

  const where: any = {};

  if (query.mine === "true" && query.userId) {
    where.bookedById = query.userId;
  }

  return prisma.booking.findMany({
    where,
    orderBy: { startTime: "asc" },
    include: { resourceAsset: true, bookedBy: true },
  });
}

export async function createBooking(input: {
  resourceAssetId: string;
  departmentId?: string;
  startTime: string;
  endTime: string;
  bookedById: string;
}) {
  const asset = await prisma.asset.findUnique({ where: { id: input.resourceAssetId } });

  if (!asset) {
    const err: any = new Error("Asset not found");
    err.status = 404;
    throw err;
  }

  if (!asset.isBookable) {
    const err: any = new Error("This asset is not bookable");
    err.status = 400;
    throw err;
  }

  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  if (start >= end) {
    const err: any = new Error("End time must be after start time");
    err.status = 400;
    throw err;
  }

  const conflict = await prisma.booking.findFirst({
    where: {
      resourceAssetId: input.resourceAssetId,
      status: { in: ["UPCOMING", "ONGOING"] },
      NOT: [
        {
          OR: [
            { startTime: { gte: end } },
            { endTime: { lte: start } },
          ],
        },
      ],
    },
  });

  if (conflict) {
    const err: any = new Error("Booking conflict with an existing reservation");
    err.status = 409;
    throw err;
  }

  return prisma.booking.create({
    data: {
      resourceAssetId: input.resourceAssetId,
      bookedById: input.bookedById,
      departmentId: input.departmentId,
      startTime: start,
      endTime: end,
      status: "UPCOMING",
    },
  });
}

export async function cancelBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    const err: any = new Error("Booking not found");
    err.status = 404;
    throw err;
  }

  if (booking.status === "COMPLETED" || booking.status === "CANCELLED") {
    const err: any = new Error("Booking cannot be cancelled");
    err.status = 409;
    throw err;
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { status: "CANCELLED" },
  });
}

export async function rescheduleBooking(
  bookingId: string,
  input: { startTime: string; endTime: string }
) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) {
    const err: any = new Error("Booking not found");
    err.status = 404;
    throw err;
  }

  if (booking.status !== "UPCOMING") {
    const err: any = new Error("Only upcoming bookings can be rescheduled");
    err.status = 409;
    throw err;
  }

  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  if (start >= end) {
    const err: any = new Error("End time must be after start time");
    err.status = 400;
    throw err;
  }

  const conflict = await prisma.booking.findFirst({
    where: {
      resourceAssetId: booking.resourceAssetId,
      status: { in: ["UPCOMING", "ONGOING"] },
      id: { not: bookingId },
      NOT: [
        {
          OR: [
            { startTime: { gte: end } },
            { endTime: { lte: start } },
          ],
        },
      ],
    },
  });

  if (conflict) {
    const err: any = new Error("Booking conflict with an existing reservation");
    err.status = 409;
    throw err;
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { startTime: start, endTime: end },
  });
}
