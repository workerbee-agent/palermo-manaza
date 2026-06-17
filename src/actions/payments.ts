"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"
import { generateCertificatePdf } from "./documents"

export async function createPayment(formData: FormData) {
  const residenceId = formData.get("residenceId") as string
  const debtId = formData.get("debtId") as string
  const amount = parseFloat(formData.get("amount") as string)
  const paymentDate = formData.get("paymentDate") as string
  const method = (formData.get("method") as "CASH" | "TRANSFER" | "CHECK" | "DEPOSIT") || "TRANSFER"
  const reference = formData.get("reference") as string
  const observation = formData.get("observation") as string
  const userId = formData.get("userId") as string

  // Generate receipt number
  const lastPayment = await prisma.payment.findFirst({
    orderBy: { createdAt: "desc" },
  })
  const receiptNumber = `PM-${Date.now().toString(36).toUpperCase()}`

  const payment = await prisma.payment.create({
    data: {
      residenceId,
      userId,
      debtId: debtId || null,
      amount,
      paymentDate: new Date(paymentDate),
      method: method as any,
      reference: reference || null,
      observation: observation || null,
    },
  })

  // Update debt status if payment covers full debt
  if (debtId) {
    const debt = await prisma.debt.findUnique({
      where: { id: debtId },
      include: { yearConfig: true },
    })

    if (debt && amount >= debt.amount) {
      await prisma.debt.update({
        where: { id: debtId },
        data: { status: "PAID" as any },
      })
    } else if (debt && amount < debt.amount) {
      await prisma.debt.update({
        where: { id: debtId },
        data: { status: "PARTIAL" as any },
      })
    }
  }

  revalidatePath("/dashboard/payments")
  revalidatePath(`/dashboard/residences/${residenceId}`)
  return { success: true, paymentId: payment.id, receiptNumber }
}

export async function getPayments(filters?: {
  residenceId?: string
  year?: number
  month?: number
}) {
  const where: any = {}

  if (filters?.residenceId) where.residenceId = filters.residenceId

  const payments = await prisma.payment.findMany({
    where,
    include: {
      residence: true,
      user: true,
      debt: {
        include: { yearConfig: true },
      },
    },
    orderBy: { paymentDate: "desc" },
  })

  return payments
}

export async function getPayment(id: string) {
  return prisma.payment.findUnique({
    where: { id },
    include: {
      residence: {
        include: { owner: true },
      },
      user: true,
      debt: {
        include: { yearConfig: true },
      },
    },
  })
}

export async function getResidenceDebt(residenceId: string) {
  const debts = await prisma.debt.findMany({
    where: { residenceId },
    include: { yearConfig: true },
    orderBy: [{ yearConfig: { year: "desc" }, { month: "desc" }],
  })

  return debts
}

export async function getTotalDebtByResidence(residenceId: string) {
  const debts = await prisma.debt.findMany({
    where: { residenceId, status: { not: "PAID" } },
    include: { yearConfig: true },
  })

  const total = debts.reduce((sum, debt) => sum + debt.amount, 0)
  const byYear = await Promise.all(
    [...new Set(debts.map((d) => d.yearConfig.year))].map(async (year) => {
      const yearDebts = debts.filter((d) => d.yearConfig.year === year)
      return {
        year,
        total: yearDebts.reduce((sum, d) => sum + d.amount, 0),
        months: yearDebts.length,
      }
    })
  )

  return { total, byYear }
}

export async function generateYearDebts(year: number, userId: string) {
  const yearConfig = await prisma.yearConfig.findUnique({
    where: { year },
  })

  if (!yearConfig) {
    return { error: "Configuración del año no encontrada" }
  }

  const residences = await prisma.residence.findMany({
    include: { owner: true },
  })

  const monthlyAmount = yearConfig.amount / 12

  // Create debts for each residence for each month
  const debts = []
  for (const residence of residences) {
    for (let month = 1; month <= 12; month++) {
      const dueDate = new Date(year, month - 1, yearConfig.dueDay)
      
      const existingDebt = await prisma.debt.findFirst({
        where: {
          residenceId: residence.id,
          yearConfigId: yearConfig.id,
          month,
        },
      })

      if (!existingDebt) {
        const debt = await prisma.debt.create({
          data: {
            residenceId: residence.id,
            yearConfigId: yearConfig.id,
            month,
            amount: monthlyAmount,
            dueDate,
          },
        })
        debts.push(debt)
      }
    }
  }

  // Log action
  await prisma.auditLog.create({
    data: {
      userId,
      action: "GENERATE_DEBTS",
      entity: "YearConfig",
      entityId: yearConfig.id,
      details: JSON.stringify({ year, count: debts.length }),
    },
  })

  revalidatePath("/dashboard/debts")
  return { success: true, count: debts.length }
}

export async function createYearConfig(
  year: number,
  amount: number,
  dueDay: number = 10,
  userId: string
) {
  const existing = await prisma.yearConfig.findUnique({
    where: { year },
  })

  if (existing) {
    await prisma.yearConfig.update({
      where: { year },
      data: { amount, dueDay },
    })
  } else {
    await prisma.yearConfig.create({
      data: { year, amount, dueDay },
    })
  }

  await prisma.auditLog.create({
    data: {
      userId,
      action: "CREATE_YEAR_CONFIG",
      entity: "YearConfig",
      entityId: year.toString(),
      details: JSON.stringify({ year, amount, dueDay }),
    },
  })

  revalidatePath("/dashboard/year-config")
  return { success: true }
}

export async function getYearConfigs() {
  return prisma.yearConfig.findMany({
    orderBy: { year: "desc" },
  })
}

export async function getDashboardStats() {
  const [
    totalResidences,
    occupiedCount,
    abandonedCount,
    rentedCount,
    anticresisCount,
    allDebts,
    allPayments,
    overdueDebts,
  ] = await Promise.all([
    prisma.residence.count(),
    prisma.residence.count({ where: { status: "OCCUPIED" } }),
    prisma.residence.count({ where: { status: "ABANDONED" } }),
    prisma.residence.count({ where: { status: "RENTED" } }),
    prisma.residence.count({ where: { status: "ANTICRESIS" } }),
    prisma.debt.findMany({ where: { status: { not: "PAID" } } }),
    prisma.payment.findMany(),
    prisma.debt.findMany({
      where: {
        status: { not: "PAID" },
        dueDate: { lt: new Date() },
      },
    }),
  ])

  const totalDebt = allDebts.reduce((sum, d) => sum + d.amount, 0)
  const totalCollected = allPayments.reduce((sum, p) => sum + p.amount, 0)

  return {
    totalResidences,
    occupiedCount,
    abandonedCount,
    rentedCount,
    anticresisCount,
    totalDebt,
    totalCollected,
    pendingPayments: allPayments.filter(
      (p) => new Date(p.paymentDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    ).length,
    overdueDebts: overdueDebts.length,
  }
}