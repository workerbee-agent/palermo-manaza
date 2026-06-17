"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createPaymentAgreement(
  residenceId: string,
  formData: FormData
) {
  const totalAmount = parseFloat(formData.get("totalAmount") as string)
  const initialAmount = parseFloat(formData.get("initialAmount") as string)
  const monthlyAmount = parseFloat(formData.get("monthlyAmount") as string)
  const months = parseInt(formData.get("months") as string)
  const createdBy = formData.get("createdBy") as string

  const agreement = await prisma.paymentAgreement.create({
    data: {
      residenceId,
      totalAmount,
      initialAmount,
      monthlyAmount,
      months,
      createdBy,
    },
  })

  // Create installments
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() + 1)

  for (let i = 1; i <= months; i++) {
    const dueDate = new Date(startDate)
    dueDate.setMonth(dueDate.getMonth() + i)

    await prisma.installment.create({
      data: {
        agreementId: agreement.id,
        dueDate,
        amount: monthlyAmount,
      },
    })
  }

  revalidatePath("/dashboard/agreements")
  return { success: true, agreementId: agreement.id }
}

export async function approveAgreement(agreementId: string, approvedBy: string) {
  await prisma.paymentAgreement.update({
    where: { id: agreementId },
    data: {
      approvedBy,
      approvedAt: new Date(),
    },
  })

  // Notify resident
  const agreement = await prisma.paymentAgreement.findUnique({
    where: { id: agreementId },
  })

  if (agreement) {
    const residence = await prisma.residence.findUnique({
      where: { id: agreement.residenceId },
      include: { owner: true },
    })

    if (residence?.owner) {
      await prisma.notification.create({
        data: {
          userId: residence.owner.id,
          title: "Convenio Aprobado",
          message: `Tu convenio de pago ha sido aprobado por administración.`,
          type: "AGREEMENT_APPROVED",
        },
      })
    }
  }

  revalidatePath("/dashboard/agreements")
  return { success: true }
}

export async function cancelAgreement(agreementId: string, userId: string) {
  await prisma.paymentAgreement.update({
    where: { id: agreementId },
    data: { status: "CANCELLED" as any },
  })

  await prisma.auditLog.create({
    data: {
      userId,
      action: "CANCEL_AGREEMENT",
      entity: "PaymentAgreement",
      entityId: agreementId,
    },
  })

  revalidatePath("/dashboard/agreements")
  return { success: true }
}

export async function recordInstallmentPayment(installmentId: string, formData: FormData) {
  const reference = formData.get("reference") as string
  const method = (formData.get("method") as "CASH" | "TRANSFER" | "CHECK" | "DEPOSIT") || "TRANSFER"

  await prisma.installment.update({
    where: { id: installmentId },
    data: {
      status: "PAID" as any,
      paidAt: new Date(),
    },
  })

  // Check if all installments are paid
  const installment = await prisma.installment.findUnique({
    where: { id: installmentId },
    include: { agreement: true },
  })

  if (installment?.agreement) {
    const remaining = await prisma.installment.count({
      where: {
        agreementId: installment.agreement.id,
        status: { not: "PAID" },
      },
    })

    if (remaining === 0) {
      await prisma.paymentAgreement.update({
        where: { id: installment.agreement.id },
        data: { status: "COMPLETED" as any },
      })
    }
  }

  revalidatePath("/dashboard/agreements")
  return { success: true }
}

export async function getAgreements(filters?: {
  residenceId?: string
  status?: string
}) {
  const where: any = {}

  if (filters?.residenceId) where.residenceId = filters.residenceId
  if (filters?.status) where.status = filters.status

  return prisma.paymentAgreement.findMany({
    where,
    include: {
      installments: {
        orderBy: { dueDate: "asc" },
      },
      residence: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getAgreement(id: string) {
  return prisma.paymentAgreement.findUnique({
    where: { id },
    include: {
      installments: {
        orderBy: { dueDate: "asc" },
      },
      residence: {
        include: { owner: true },
      },
    },
  })
}