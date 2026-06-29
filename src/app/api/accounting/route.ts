import { NextRequest, NextResponse } from 'next/server'
import { getTransactions, getCurrentBalance, getMonthlySummary } from '@/actions/accounting'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const month = searchParams.get('month')
  const year = searchParams.get('year')
  const type = searchParams.get('type')
  const category = searchParams.get('category')
  
  // Verificar si es una solicitud de balance
  if (searchParams.get('balance')) {
    const balance = await getCurrentBalance()
    return NextResponse.json(balance)
  }
  
  // Verificar si es una solicitud de resumen mensual
  if (searchParams.get('summary')) {
    const summary = await getMonthlySummary(
      parseInt(year || new Date().getFullYear().toString()),
      parseInt(month || (new Date().getMonth() + 1).toString())
    )
    return NextResponse.json(summary)
  }
  
  // Obtener transacciones
  const transactions = await getTransactions({
    type: type as 'INCOME' | 'EXPENSE' | undefined,
    category: category || undefined,
    month: month ? parseInt(month) : undefined,
    year: year ? parseInt(year) : undefined,
  })
  
  return NextResponse.json(transactions)
}