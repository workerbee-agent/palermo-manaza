import { NextRequest, NextResponse } from 'next/server'
import { createTransaction } from '@/actions/accounting'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, category, amount, description, reference, date, userId, userRole } = body
    
    // Validaciones
    if (!type || !category || !amount || !description || !date) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }
    
    if (!['INCOME', 'EXPENSE'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de transacción inválido' },
        { status: 400 }
      )
    }
    
    const transaction = await createTransaction(
      {
        type,
        category,
        amount: parseFloat(amount),
        description,
        reference,
        date: new Date(date),
      },
      userId,
      userRole
    )
    
    return NextResponse.json(transaction, { status: 201 })
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error al crear la transacción' },
      { status: 403 }
    )
  }
}