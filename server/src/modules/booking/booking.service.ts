import { prisma } from "../../lib/prisma";
import { CreateBookingInput, BookingQuery } from "./booking.schema";
import { Prisma } from "@prisma/client";

const BOOKING_INCLUDE = {
  resourceAsset: { include: { category: true } },
  bookedBy: {
    select: { id: true, name: true, email: true, role: true },
  },
} as const;

export async function createBooking(input: CreateBookingInput, userId: string) {
  const startTime = new Date(input.startTime);
  const endTime = new Date(input.endTime);

  // Validate time range
  if (endTime <= startTime) {
    const err: any = new Error("End time must be after start time");
    err.status = 400;
    throw err;
  }

  // Verify resource exists and is bookable
  const asset = await prisma.asset.findUnique({
    where: { id: input.resourceAssetId },
  });

  if (!asset) {
    const err: any = new Error("Resource not found");
    err.status = 404;
    throw err;
  }

  if (!asset.isBookable) {
    const err: any = new Error("This asset is not a bookable resource");
    err.status = 400;
    throw err;
  }

  // Check for conflicting bookings (overlapping time slots)
  const conflict = await prisma.booking.findFirst({
    where: {
      resourceAssetId: input.resourceAssetId,
      status: { in: ["UPCOMING", "ONGOING"] },
      // Overlap: existing.start < new.end AND existing.end > new.start
      startTime: { lt: endTime },
      endTime: { gt: startTime },
    },
  });

  if (conflict) {
    const err: any = new Error(
      "This time slot conflicts with an existing booking"
    );
    err.status = 409;
    throw err;
  }

  const booking = await prisma.booking.create({
    data: {
      resourceAssetId: input.resourceAssetId,
      bookedById: userId,
      departmentId: input.departmentId,
      startTime,
      endTime,
    },
    include: BOOKING_INCLUDE,
  });

  return booking;
}

export async function cancelBooking(id: string, userId: string, userRole: string) {
  const booking = await prisma.booking.findUnique({ where: { id } });

  if (!booking) {
    const err: any = new Error("Booking not found");
    err.status = 404;
    throw err;
  }

  // Only the booker or an admin can cancel
  if (booking.bookedById !== userId && userRole !== "ADMIN") {
    const err: any = new Error("You can only cancel your own bookings");
    err.status = 403;
    throw err;
  }

  if (booking.status === "CANCELLED" || booking.status === "COMPLETED") {
    const err: any = new Error("This booking cannot be cancelled");
    err.status = 400;
    throw err;
  }

  const updated = await prisma.booking.update({
    where: { id },
    data: { status: "CANCELLED" },
    include: BOOKING_INCLUDE,
  });

  return updated;
}

export async function listBookings(query: BookingQuery) {
  const { resourceAssetId, bookedById, status, date, page, limit } = query;

  const where: Prisma.BookingWhereInput = {};

  if (resourceAssetId) where.resourceAssetId = resourceAssetId;
  if (bookedById) where.bookedById = bookedById;
  if (status) where.status = status as any;

  // Filter by date — bookings that overlap the given day
  if (date) {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);

    where.startTime = { lte: dayEnd };
    where.endTime = { gte: dayStart };
  }

  const [data, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      include: BOOKING_INCLUDE,
      orderBy: { startTime: "asc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.booking.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getBookableResources() {
  return prisma.asset.findMany({
    where: { isBookable: true, status: { notIn: ["DISPOSED", "RETIRED"] } },
    include: { category: true },
    orderBy: { name: "asc" },
  });
}
