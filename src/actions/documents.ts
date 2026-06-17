"use server"

import { prisma } from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function generateCertificatePdf(
  certificateType: "CERTIFICATE_EXPENSAS" | "CERTIFICATE_DEBT" | "CERTIFICATE_OWNERSHIP" | "CERTIFICATE_TENANT",
  residenceId: string,
  issuedBy: string
) {
  const residence = await prisma.residence.findUnique({
    where: { id: residenceId },
    include: {
      owner: true,
      tenant: true,
    },
  })

  if (!residence) {
    return { error: "Residencia no encontrada" }
  }

  let title = ""
  let content = ""

  switch (certificateType) {
    case "CERTIFICATE_EXPENSAS":
      title = "Certificado de Expensas"
      const debts = await prisma.debt.findMany({
        where: { residenceId, status: { not: "PAID" } },
        include: { yearConfig: true },
      })
      const totalDebt = debts.reduce((sum, d) => sum + d.amount, 0)
      content = `Total pendiente: $${totalDebt.toFixed(2)}`
      break

    case "CERTIFICATE_DEBT":
      title = "Certificado de Deuda"
      const allDebts = await prisma.debt.findMany({
        where: { residenceId },
        include: { yearConfig: true },
        orderBy: [{ yearConfig: { year: "desc" }, { month: "desc" }],
      })
      content = `Deudas pendientes: ${allDebts.filter((d) => d.status !== "PAID").length}`
      break

    case "CERTIFICATE_OWNERSHIP":
      title = "Certificado de Propiedad"
      content = `Propietario: ${residence.owner.firstName} ${residence.owner.lastName}`
      break

    case "CERTIFICATE_TENANT":
      title = "Certificado de Arrendatario"
      if (!residence.tenant) {
        return { error: "No hay arrendatario registrado" }
      }
      content = `Arrendatario: ${residence.tenant.name}`
      break
  }

  // Create document record
  const document = await prisma.document.create({
    data: {
      residenceId,
      type: certificateType,
      issuedAt: new Date(),
      issuedBy,
    },
  })

  // Notify owner
  await prisma.notification.create({
    data: {
      userId: residence.owner.id,
      title: `Certificado Emitido: ${title}`,
      message: `Se ha generado un ${title} para tu residencia.`,
      type: "DOCUMENT_ISSUED",
    },
  })

  revalidatePath("/dashboard/documents")
  return {
    success: true,
    documentId: document.id,
    title,
    content,
    residenceName: residence.name,
    ownerName: `${residence.owner.firstName} ${residence.owner.lastName}`,
  }
}

export async function getDocuments(filters?: {
  residenceId?: string
  type?: string
}) {
  const where: any = {}

  if (filters?.residenceId) where.residenceId = filters.residenceId
  if (filters?.type) where.type = filters.type

  return prisma.document.findMany({
    where,
    include: {
      residence: true,
    },
    orderBy: { createdAt: "desc" },
  })
}

export async function getDocument(id: string) {
  return prisma.document.findUnique({
    where: { id },
    include: {
      residence: {
        include: { owner: true },
      },
    },
  })
}

export async function deleteDebt(debtId: string, approvedBy: string) {
  // This requires presidential approval, so it's handled via API with approval flow
  await prisma.debt.update({
    where: { id: debtId },
    data: { status: "CANCELLED" as any },
  })

  await prisma.auditLog.create({
    data: {
      userId: approvedBy,
      action: "DELETE_DEBT",
      entity: "Debt",
      entityId: debtId,
      details: JSON.stringify({ approvedBy }),
    },
  })

  revalidatePath("/dashboard/debts")
  return { success: true }
}

export async function requestDebtDeletion(
  debtId: string,
  requestedBy: string,
  reason: string
) {
  // Create pending request - needs presidential approval
  await prisma.notification.create({
    data: {
      userId: requestedBy, // Will be sent to president
      title: "Solicitud de Eliminación de Deuda",
      message: `Solicitud para eliminar deuda: ${reason}`,
      type: "SYSTEM",
    },
  })

  return { success: true }
}