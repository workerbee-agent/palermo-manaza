"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function createResidence(formData: FormData) {
  const name = formData.get("name") as string
  const type = formData.get("type") as "HOUSE" | "APARTMENT"
  const block = formData.get("block") as string
  const floor = formData.get("floor") as string
  const address = formData.get("address") as string
  const status = (formData.get("status") as string) || "OCCUPIED"
  const ownerEmail = formData.get("ownerEmail") as string
  const ownerFirstName = formData.get("ownerFirstName") as string
  const ownerLastName = formData.get("ownerLastName") as string
  const ownerIdentification = formData.get("ownerIdentification") as string
  const ownerType = (formData.get("ownerType") as "SINGLE" | "MARRIED") || "SINGLE"
  const spouseName = formData.get("spouseName") as string
  const spouseId = formData.get("spouseId") as string

  // Find or create owner user
  let owner = await prisma.user.findUnique({
    where: { email: ownerEmail },
  })

  if (!owner) {
    // Create owner with temporary password
    const { hashPassword } = await import("@/lib/auth")
    const tempPassword = Math.random().toString(36).slice(-8)
    const hashedPassword = await hashPassword(tempPassword)

    owner = await prisma.user.create({
      data: {
        email: ownerEmail,
        password: hashedPassword,
        firstName: ownerFirstName,
        lastName: ownerLastName,
        role: "RESIDENT",
      },
    })
  }

  const residence = await prisma.residence.create({
    data: {
      name,
      type: type as any,
      block,
      floor: floor ? parseInt(floor) : null,
      address,
      status: status as any,
      ownerId: owner.id,
    },
  })

  // Create owner record
  await prisma.owner.create({
    data: {
      residenceId: residence.id,
      type: ownerType as any,
      identification: ownerIdentification,
      spouseName: spouseName || null,
      spouseId: spouseId || null,
    },
  })

  revalidatePath("/dashboard/residences")
  return { success: true, residenceId: residence.id }
}

export async function updateResidence(id: string, formData: FormData) {
  const name = formData.get("name") as string
  const type = formData.get("type") as "HOUSE" | "APARTMENT"
  const block = formData.get("block") as string
  const floor = formData.get("floor") as string
  const address = formData.get("address") as string
  const status = formData.get("status") as string

  await prisma.residence.update({
    where: { id },
    data: {
      name,
      type: type as any,
      block,
      floor: floor ? parseInt(floor) : null,
      address,
      status: status as any,
    },
  })

  revalidatePath("/dashboard/residences")
  return { success: true }
}

export async function updateResidenceStatus(id: string, status: string) {
  await prisma.residence.update({
    where: { id },
    data: { status: status as any },
  })

  revalidatePath("/dashboard/residences")
  return { success: true }
}

export async function assignTenant(
  residenceId: string,
  formData: FormData
) {
  const identification = formData.get("identification") as string
  const name = formData.get("name") as string
  const phone = formData.get("phone") as string
  const email = formData.get("email") as string
  const startDate = formData.get("startDate") as string
  const endDate = formData.get("endDate") as string

  // Update residence status
  await prisma.residence.update({
    where: { id: residenceId },
    data: { status: "RENTED" as any },
  })

  // Create tenant record
  await prisma.tenant.create({
    data: {
      residenceId,
      identification,
      name,
      phone,
      email,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  })

  revalidatePath("/dashboard/residences")
  return { success: true }
}

export async function removeTenant(residenceId: string) {
  await prisma.tenant.delete({
    where: { residenceId },
  })

  await prisma.residence.update({
    where: { id: residenceId },
    data: { status: "OCCUPIED" as any },
  })

  revalidatePath("/dashboard/residences")
  return { success: true }
}

export async function getResidences(filters?: {
  block?: string
  status?: string
  type?: string
}) {
  const where: any = {}

  if (filters?.block) where.block = filters.block
  if (filters?.status) where.status = filters.status
  if (filters?.type) where.type = filters.type

  const residences = await prisma.residence.findMany({
    where,
    include: {
      owner: true,
      tenant: true,
    },
    orderBy: [{ block: "asc" }, { name: "asc" }],
  })

  return residences
}

export async function getResidence(id: string) {
  return prisma.residence.findUnique({
    where: { id },
    include: {
      owner: true,
      tenant: true,
      debts: {
        orderBy: [{ yearConfig: { year: "desc" }, { month: "desc" }],
      },
      payments: {
        orderBy: { paymentDate: "desc" },
      },
    },
  })
}

export async function getResidenceByOwner(ownerId: string) {
  return prisma.residence.findUnique({
    where: { ownerId },
    include: {
      owner: true,
      tenant: true,
      debts: {
        orderBy: [{ yearConfig: { year: "desc" }, { month: "desc" }],
      },
      payments: {
        orderBy: { paymentDate: "desc" },
      },
    },
  })
}