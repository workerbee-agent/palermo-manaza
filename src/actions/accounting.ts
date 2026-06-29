'use server'

import { prisma } from '@/lib/db'
import { revalidatePath } from 'next/cache'

// Tipos
export type TransactionType = 'INCOME' | 'EXPENSE'

export interface TransactionInput {
  type: TransactionType
  category: string
  amount: number
  description: string
  reference?: string
  date: Date
}

export interface TransactionWithDetails {
  id: string
  type: TransactionType
  category: string
  amount: number
  description: string
  reference?: string | null
  date: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
}

// Validar permisos de tesorería
// En producción, esto vendría de la sesión real
async function validateTreasurer(userRole?: string): Promise<boolean> {
  if (!userRole) return false
  return ['ADMIN', 'PRESIDENT', 'TREASURER'].includes(userRole)
}

// Obtener todas las transacciones con filtros
export async function getTransactions(filters?: {
  type?: TransactionType
  category?: string
  month?: number
  year?: number
}): Promise<TransactionWithDetails[]> {
  const where: any = {}
  
  if (filters?.type) where.type = filters.type
  if (filters?.category) where.category = filters.category
  if (filters?.month && filters?.year) {
    where.date = {
      gte: new Date(filters.year, filters.month - 1, 1),
      lt: new Date(filters.year, filters.month, 1)
    }
  }
  
  return await prisma.transaction.findMany({
    where,
    orderBy: { date: 'desc' }
  }) as TransactionWithDetails[]
}

// Obtener saldo actual
export async function getCurrentBalance(): Promise<{
  totalIncome: number
  totalExpense: number
  balance: number
}> {
  const [totalIncome, totalExpense] = await Promise.all([
    prisma.transaction.aggregate({
      where: { type: 'INCOME' },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: { type: 'EXPENSE' },
      _sum: { amount: true }
    })
  ])
  
  const income = totalIncome._sum.amount || 0
  const expense = totalExpense._sum.amount || 0
  
  return {
    totalIncome: income,
    totalExpense: expense,
    balance: income - expense
  }
}

// Obtener resumen mensual
export async function getMonthlySummary(year: number, month: number) {
  const startDate = new Date(year, month - 1, 1)
  const endDate = new Date(year, month, 1)
  
  const [income, expense] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        type: 'INCOME',
        date: { gte: startDate, lt: endDate }
      },
      _sum: { amount: true }
    }),
    prisma.transaction.aggregate({
      where: {
        type: 'EXPENSE',
        date: { gte: startDate, lt: endDate }
      },
      _sum: { amount: true }
    })
  ])
  
  return {
    income: income._sum.amount || 0,
    expense: expense._sum.amount || 0,
    balance: (income._sum.amount || 0) - (expense._sum.amount || 0)
  }
}

// Crear transacción (solo tesorero/presidente)
export async function createTransaction(
  data: TransactionInput,
  userId?: string,
  userRole?: string
): Promise<TransactionWithDetails> {
  const hasPermission = await validateTreasurer(userRole)
  if (!hasPermission) {
    throw new Error('No tienes permisos para registrar transacciones')
  }
  
  const transaction = await prisma.transaction.create({
    data: {
      type: data.type,
      category: data.category,
      amount: data.amount,
      description: data.description,
      reference: data.reference,
      date: data.date,
      createdBy: userId || 'system'
    }
  })
  
  revalidatePath('/dashboard/accounting')
  return transaction as TransactionWithDetails
}

// Actualizar transacción
export async function updateTransaction(
  id: string,
  data: Partial<TransactionInput>
): Promise<TransactionWithDetails> {
  const hasPermission = await validateTreasurer()
  if (!hasPermission) {
    throw new Error('No tienes permisos para editar transacciones')
  }
  
  const transaction = await prisma.transaction.update({
    where: { id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  })
  
  revalidatePath('/dashboard/accounting')
  return transaction as TransactionWithDetails
}

// Eliminar transacción
export async function deleteTransaction(id: string): Promise<void> {
  const hasPermission = await validateTreasurer()
  if (!hasPermission) {
    throw new Error('No tienes permisos para eliminar transacciones')
  }
  
  await prisma.transaction.delete({ where: { id } })
  revalidatePath('/dashboard/accounting')
}

// Obtener categorías por tipo
export function getCategoriesByType(type: TransactionType): string[] {
  if (type === 'INCOME') {
    return [
      'CUOTA_CONDOMINAL',
      'EXPENSA',
      'MULTA',
      'EVENTO',
      'OTRO'
    ]
  }
  
  return [
    'MANTENIMIENTO',
    'SERVICIOS',
    'INSUMOS',
    'ABOGADO',
    'OTRO'
  ]
}