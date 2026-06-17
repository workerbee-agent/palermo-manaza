"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createFine(
  residenceId: string,
  formData: FormData
) {
  const amount = parseFloat(formData.get("amount") as string)
  const reason = formData.get("reason") as string
  const dueDate = formData.get("dueDate") as string
  const createdBy = formData.get("createdBy") as string

  const fine = await prisma.fine.create({
    data: {
      residenceId,
      amount,
      reason,
      dueDate: new Date(dueDate),
      createdBy,
    },
  })

  await prisma.auditLog.create({
    data: {
      userId: createdBy,
      action: "CREATE_FINE",
      entity: "Fine",
      entityId: fine.id,
      details: JSON.stringify({ amount, reason }),
    },
  })

  revalidatePath("/dashboard/fines")
  revalidatePath(`/dashboard/residences/${residenceId}`)
  return { success: true, fineId: fine.id }
}

export async function updateFineStatus(
  fineId: string,
  status: "PENDING" | "PAID" | "CANCELLED" | "WAITING_APPROVAL",
  userId: string
) {
  await prisma.fine.update({
    where: { id: fineId },
    data: { status: status as any },
  })

  await prisma.auditLog.create({
    data: {
      userId,
      action: "UPDATE_FINE_STATUS",
      entity: "Fine",
      entityId: fineId,
      details: JSON.stringify({ status }),
    },
  })

  revalidatePath("/dashboard/fines")
  return { success: true }
}

export async function requestFineDeletion(
  fineId: string,
  requestedBy: string,
  reason: string
) {
  await prisma.fine.update({
    where: { id: fineId },
    data: { status: "WAITING_APPROVAL" as any },
  })

  // Notify president
  const users = await prisma.user.findMany({
    where: { role: "PRESIDENT" },
  })

  for (const user of users) {
    await prisma.notification.create({
      data: {
        userId: user.id,
        title: "Solicitud de Eliminación de Multa",
        message: `Razón: ${reason}`,
        type: "SYSTEM",
      },
    })
  }

  return { success: true }
}

export async function approveFineDeletion(
  fineId: string,
  approvedBy: string
) {
  await prisma.fine.update({
    where: { id: fineId },
    data: { status: "CANCELLED" as any },
  })

  await prisma.auditLog.create({
    data: {
      userId: approvedBy,
      action: "APPROVE_FINE_DELETION",
      entity: "Fine",
      entityId: fineId,
    },
  })

  revalidatePath("/dashboard/fines")
  return { success: true }
}

export async function payFine(
  fineId: string,
  formData: FormData
) {
  const amount = parseFloat(formData.get("amount") as string)
  const paymentDate = formData.get("paymentDate") as string
  const method = (formData.get("method") as "CASH" | "TRANSFER" | "CHECK" | "DEPOSIT") || "TRANSFER"
  const reference = formData.get("reference") as string

  await prisma.finePayment.create({
    data: {
      fineId,
      amount,
      paymentDate: new Date(paymentDate),
      method: method as any,
      reference: reference || null,
    },
  })

  await prisma.fine.update({
    where: { id: fineId },
    data: { status: "PAID" as any },
  })

  revalidatePath("/dashboard/fines")
  return { success: true }
}

export async function getFines(filters?: {
  residenceId?: string
  status?: string
}) {
  const where: any = {}

  if (filters?.residenceId) where.residenceId = filters.residenceId
  if (filters?.status) where.status = filters.status

  return prisma.fine.findMany({
    where,
    include: {
      residence: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getFine(id: string) {
  return prisma.fine.findUnique({
    where: { id },
    include: {
      residence: true,
      payments: true,
    },
  })
}

export async function getTotalFinesByResidence(residenceId: string) {
  const fines = await prisma.fine.findMany({
    where: { residenceId, status: { not: "PAID" } },
  })

  return fines.reduce((sum, fine) => sum + fine.amount, 0)
}