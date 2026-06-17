import { Role, ResidenceType, OccupancyStatus, OwnerType, DebtStatus, PaymentMethod, DocumentType, AgreementStatus, InstallmentStatus, OtpType, NotificationType } from "@prisma/client"

export type Role = Role
export type ResidenceType = ResidenceType
export type OccupancyStatus = OccupancyStatus
export type OwnerType = OwnerType
export type DebtStatus = DebtStatus
export type PaymentMethod = PaymentMethod
export type DocumentType = DocumentType
export type AgreementStatus = AgreementStatus
export type InstallmentStatus = InstallmentStatus
export type OtpType = OtpType
export type NotificationType = NotificationType

export interface UserWithResidence {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string | null
  role: Role
  avatar?: string | null
  isActive: boolean
  residence?: Residence | null
}

export interface ResidenceWithDetails {
  id: string
  name: string
  type: ResidenceType
  block: string
  floor?: number | null
  address: string
  status: OccupancyStatus
  owner: UserWithResidence
  tenant?: Tenant | null
  payments: Payment[]
  debts: Debt[]
}

export interface DebtWithPayments {
  id: string
  residenceId: string
  yearConfigId: string
  month: number
  amount: number
  status: DebtStatus
  dueDate: Date
  payments: Payment[]
}

export interface DashboardStats {
  totalResidences: number
  occupiedCount: number
  abandonedCount: number
  rentedCount: number
  anticresisCount: number
  totalDebt: number
  totalCollected: number
  pendingPayments: number
  overdueDebts: number
}

export interface PaymentReceipt {
  id: string
  residenceName: string
  ownerName: string
  amount: number
  paymentDate: Date
  reference?: string | null
  method: PaymentMethod
  debtMonths: number[]
}