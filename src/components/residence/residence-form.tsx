"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createResidence } from "@/actions/residence"

interface ResidenceFormProps {
  onSuccess?: () => void
}

export function ResidenceForm({ onSuccess }: ResidenceFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError("")

    const result = await createResidence(formData)
    
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else if (result?.success) {
      onSuccess?.()
    }
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Nueva Residencia</CardTitle>
        <CardDescription>
          Registra una nueva casa o departamento
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={handleSubmit} className="space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Residence Info */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" name="name" placeholder="Casa 1 / Dpto 101" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select name="type" defaultValue="HOUSE">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HOUSE">Casa</SelectItem>
                  <SelectItem value="APARTMENT">Departamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="block">Bloque</Label>
              <Input id="block" name="block" placeholder="A" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="floor">Piso</Label>
              <Input id="floor" name="floor" type="number" placeholder="1" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" name="address" placeholder="Calle principal #123" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Estado</Label>
              <Select name="status" defaultValue="OCCUPIED">
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="OCCUPIED">Habitada</SelectItem>
                  <SelectItem value="ABANDONED">Abandonada</SelectItem>
                  <SelectItem value="RENTED">Arrendada</SelectItem>
                  <SelectItem value="ANTICRESIS">Anticresis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="font-medium mb-4">Datos del Propietario</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ownerEmail">Correo</Label>
                <Input id="ownerEmail" name="ownerEmail" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerFirstName">Nombres</Label>
                <Input id="ownerFirstName" name="ownerFirstName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerLastName">Apellidos</Label>
                <Input id="ownerLastName" name="ownerLastName" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerIdentification">Cédula</Label>
                <Input id="ownerIdentification" name="ownerIdentification" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ownerType">Estado Civil</Label>
                <Select name="ownerType" defaultValue="SINGLE">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SINGLE">Soltero/a</SelectItem>
                    <SelectItem value="MARRIED">Casado/a</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="spouseName">Nombre del Cónyuge</Label>
                <Input id="spouseName" name="spouseName" placeholder="Opcional" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="spouseId">Cédula del Cónyuge</Label>
                <Input id="spouseId" name="spouseId" placeholder="Opcional" />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={loading}>
            {loading ? "Guardando..." : "Crear Residencia"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}