import { redirect } from "next/navigation"
import { verifyToken } from "@/lib/auth"
import { getResidences } from "@/actions/residence"
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
import { Plus, Building, Search, Filter } from "lucide-react"

export default async function ResidencesPage({
  searchParams,
}: {
  searchParams: { token?: string; block?: string; status?: string }
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

  const residences = await getResidences({
    block: searchParams.block,
    status: searchParams.status,
  })

  const statusLabels: Record<string, { label: string; variant: any }> = {
    OCCUPIED: { label: "Habitada", variant: "default" },
    ABANDONED: { label: "Abandonada", variant: "secondary" },
    RENTED: { label: "Arrendada", variant: "outline" },
    ANTICRESIS: { label: "Anticresis", variant: "outline" },
  }

  const typeLabels: Record<string, string> = {
    HOUSE: "Casa",
    APARTMENT: "Depto",
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Residencias</h1>
            <p className="text-gray-600">Gestiona las casas y departamentos</p>
          </div>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Plus className="w-4 h-4 mr-2" />
            Nueva Residencia
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por nombre o bloque..."
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
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Bloque</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead>Propietario</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {residences.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                    No hay residencias registradas
                  </TableCell>
                </TableRow>
              ) : (
                residences.map((residence) => (
                  <TableRow key={residence.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {residence.name}
                      </div>
                    </TableCell>
                    <TableCell>{typeLabels[residence.type]}</TableCell>
                    <TableCell>{residence.block}</TableCell>
                    <TableCell>{residence.address}</TableCell>
                    <TableCell>
                      {residence.owner.firstName} {residence.owner.lastName}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusLabels[residence.status]?.variant || "outline"}>
                        {statusLabels[residence.status]?.label || residence.status}
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