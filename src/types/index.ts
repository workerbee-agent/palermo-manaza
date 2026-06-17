import { FineStatus, FinePayment } from "@prisma/client"

export type FineStatus = FineStatus

export interface FineWithDetails {
  id: string
  residenceId: string
  amount: number
  reason: string
  status: FineStatus
  dueDate: Date
  createdBy: string
  createdAt: Date
  residence?: {
    id: string
    name: string
    owner: { firstName: string; lastName: string }
  }
  payments: FinePayment[]
}

export interface DashboardStats {
  totalResidences: number
  occupiedCount: number
  abandonedCount: number
  rentedCount: number
  anticresisCount: number
  totalDebt: number
  totalFines: number
  totalCollected: number
  pendingPayments: number
  overdueDebts: number
}