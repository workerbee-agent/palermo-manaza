import { redirect } from "next/navigation"
import { verifyToken } from "@/lib/auth"
import { getFines } from "@/actions/fines"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Search, Filter, AlertTriangle } from "lucide-react"

export default async function FinesPage({
  searchParams,
}: {
  searchParams: { token?: string; status?: string }
}) {
  const token = searchParams.token
  
  if (!token) {
    redirect("/auth/login")
  }

  const payload = await verifyToken(token)
  
  if (!payload) {
    redirect("/auth/login")
  }

  const user = {
    id: payload.userId,
    firstName: "Admin",
    lastName: "User",
    email: "admin@palermo-manaza.com",
    role: payload.role,
    avatar: null,
  }

  const fines = await getFines({
    status: searchParams.status,
  })

  const statusLabels: Record<string, { label: string; variant: any }> = {
    PENDING: { label: "Pendiente", variant: "destructive" },
    PAID: { label: "Pagada", variant: "default" },
    CANCELLED: { label: "Cancelada", variant: "secondary" },
    WAITING_APPROVAL: { label: "Esperando Aprobación", variant: "outline" },
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Multas</h1>
            <p className="text-gray-600">Gestiona las multas del conjunto</p>
          </div>
          {(user.role === "ADMIN" || user.role === "PRESIDENT" || user.role === "TREASURER") && (
            <Button className="bg-red-600 hover:bg-red-700">
              <Plus className="w-4 h-4 mr-2" />
              Nueva Multa
            </Button>
          )}
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar multa..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Residencia</TableHead>
                <TableHead>Monto</TableHead>
                <TableHead>Motivo</TableHead>
                <TableHead>Fecha Límite</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fines.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    No hay multas registradas
                  </TableCell>
                </TableRow>
              ) : (
                fines.map((fine) => (
                  <TableRow key={fine.id}>
                    <TableCell className="font-medium">
                      {fine.residence.name}
                    </TableCell>
                    <TableCell>${fine.amount.toFixed(2)}</TableCell>
                    <TableCell>{fine.reason}</TableCell>
                    <TableCell>
                      {new Date(fine.dueDate).toLocaleDateString("es-EC")}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusLabels[fine.status]?.variant || "outline"}>
                        {statusLabels[fine.status]?.label || fine.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </DashboardLayout>
  )
}