'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createTransaction } from '@/actions/accounting'
import { ArrowLeft, Loader2 } from 'lucide-react'

const INCOME_CATEGORIES = [
  { value: 'CUOTA_CONDOMINAL', label: 'Cuota Condominal' },
  { value: 'EXPENSA', label: 'Expensa' },
  { value: 'MULTA', label: 'Multa' },
  { value: 'EVENTO', label: 'Evento' },
  { value: 'OTRO', label: 'Otro' },
]

const EXPENSE_CATEGORIES = [
  { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
  { value: 'SERVICIOS', label: 'Servicios' },
  { value: 'INSUMOS', label: 'Insumos' },
  { value: 'ABOGADO', label: 'Abogado' },
  { value: 'OTRO', label: 'Otro' },
]

export default function NewTransactionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [type, setType] = useState<'INCOME' | 'EXPENSE'>('INCOME')
  const [category, setCategory] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [reference, setReference] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])

  const categories = type === 'INCOME' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!amount || !description || !category) {
        setError('Por favor completa todos los campos requeridos')
        setLoading(false)
        return
      }

      await createTransaction({
        type,
        category,
        amount: parseFloat(amount),
        description,
        reference: reference || undefined,
        date: new Date(date),
      })

      router.push('/dashboard/accounting')
    } catch (err: any) {
      setError(err.message || 'Error al crear la transacción')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/accounting">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Nueva Transacción</h1>
          <p className="text-gray-500">Registrar ingreso o egreso</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos de la Transacción</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Tipo */}
            <div className="space-y-2">
              <Label htmlFor="type">Tipo de Transacción *</Label>
              <Select
                value={type}
                onValueChange={(value) => {
                  setType(value as 'INCOME' | 'EXPENSE')
                  setCategory('')
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INCOME">Ingreso</SelectItem>
                  <SelectItem value="EXPENSE">Egreso</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Categoría */}
            <div className="space-y-2">
              <Label htmlFor="category">Categoría *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Monto */}
            <div className="space-y-2">
              <Label htmlFor="amount">Monto (USD) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            {/* Fecha */}
            <div className="space-y-2">
              <Label htmlFor="date">Fecha *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <Label htmlFor="description">Descripción *</Label>
              <Input
                id="description"
                placeholder="Descripción de la transacción"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Referencia */}
            <div className="space-y-2">
              <Label htmlFor="reference">Referencia (opcional)</Label>
              <Input
                id="reference"
                placeholder="Número de comprobante, referencia, etc."
                value={reference}
                onChange={(e) => setReference(e.target.value)}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Link href="/dashboard/accounting" className="flex-1">
                <Button variant="outline" type="button" className="w-full">
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Registrar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}