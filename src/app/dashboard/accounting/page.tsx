import { getCurrentBalance, getTransactions, getMonthlySummary } from '@/actions/accounting'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ArrowDownCircle,
  ArrowUpCircle,
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default async function AccountingPage({
  searchParams,
}: {
  searchParams: { month?: string; year?: string; role?: string }
}) {
  const currentMonth = new Date().getMonth() + 1
  const currentYear = new Date().getFullYear()
  const month = searchParams.month ? parseInt(searchParams.month) : currentMonth
  const year = searchParams.year ? parseInt(searchParams.year) : currentYear
  
  // En producción, el rol vendría de la sesión real
  const userRole = searchParams.role || 'RESIDENT'

  const [balance, transactions, monthlySummary] = await Promise.all([
    getCurrentBalance(),
    getTransactions({ month, year }),
    getMonthlySummary(year, month),
  ])

  const canEdit = ['ADMIN', 'PRESIDENT', 'TREASURER'].includes(userRole)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD',
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Contabilidad</h1>
          <p className="text-gray-500">Gestión de ingresos y egresos del conjunto</p>
        </div>
        {canEdit && (
          <Link href="/dashboard/accounting/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nueva Transacción
            </Button>
          </Link>
        )}
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Saldo Actual
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(balance.balance)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total ingresos - Total egresos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Ingresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(balance.totalIncome)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              Acumulado histórico
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Egresos Totales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">
              {formatCurrency(balance.totalExpense)}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              <TrendingDown className="w-3 h-3 inline mr-1" />
              Acumulado histórico
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen del Mes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-sm text-gray-500">Ingresos</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(monthlySummary.income)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Egresos</p>
              <p className="text-xl font-bold text-red-600">
                {formatCurrency(monthlySummary.expense)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p
                className={`text-xl font-bold ${
                  monthlySummary.balance >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {formatCurrency(monthlySummary.balance)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Transacciones</span>
            <div className="flex gap-2">
              <Link
                href={`/dashboard/accounting?month=${month > 1 ? month - 1 : 12}&year=${month === 1 ? year - 1 : year}`}
              >
                <Button variant="outline" size="sm">
                  ← Mes Anterior
                </Button>
              </Link>
              <span className="flex items-center px-3 text-sm font-medium">
                {format(new Date(year, month - 1, 1), 'MMMM yyyy', { locale: es })}
              </span>
              <Link
                href={`/dashboard/accounting?month=${month < 12 ? month + 1 : 1}&year=${month === 12 ? year + 1 : year}`}
              >
                <Button variant="outline" size="sm">
                  Mes Siguiente →
                </Button>
              </Link>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <DollarSign className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No hay transacciones registradas este mes</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell>
                      {format(new Date(tx.date), 'dd/MM/yyyy')}
                    </TableCell>
                    <TableCell>
                      {tx.type === 'INCOME' ? (
                        <span className="inline-flex items-center text-green-600">
                          <ArrowUpCircle className="w-4 h-4 mr-1" />
                          Ingreso
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-red-600">
                          <ArrowDownCircle className="w-4 h-4 mr-1" />
                          Egreso
                        </span>
                      )}
                    </TableCell>
                    <TableCell>{tx.category}</TableCell>
                    <TableCell>{tx.description}</TableCell>
                    <TableCell className="text-right font-medium">
                      <span
                        className={
                          tx.type === 'INCOME' ? 'text-green-600' : 'text-red-600'
                        }
                      >
                        {tx.type === 'INCOME' ? '+' : '-'}
                        {formatCurrency(tx.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}