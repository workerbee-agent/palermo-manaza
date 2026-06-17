import { redirect } from "next/navigation"
import { verifyToken } from "@/lib/auth"
import { getDashboardStats } from "@/actions/payments"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Building, Home, Key, AlertTriangle, DollarSign, TrendingUp } from "lucide-react"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { token?: string }
}) {
  const token = searchParams.token
  
  if (!token) {
    redirect("/auth/login")
  }

  const payload = await verifyToken(token)
  
  if (!payload) {
    redirect("/auth/login")
  }

  // For demo purposes, create a mock user
  const user = {
    id: payload.userId,
    firstName: "Admin",
    lastName: "User",
    email: "admin@palermo-manaza.com",
    role: payload.role,
    avatar: null,
  }

  const stats = await getDashboardStats()

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Resumen del conjunto residencial</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Residencias</CardTitle>
              <Building className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalResidences}</div>
              <p className="text-xs text-gray-500">casas y departamentos</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Habitadas</CardTitle>
              <Home className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.occupiedCount}</div>
              <p className="text-xs text-gray-500">
                {stats.totalResidences > 0 
                  ? `${Math.round((stats.occupiedCount / stats.totalResidences) * 100)}%` 
                  : "0%"} ocupacion
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Deuda</CardTitle>
              <DollarSign className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalDebt.toFixed(2)}</div>
              <p className="text-xs text-gray-500">pendiente de cobro</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Cobrado</CardTitle>
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalCollected.toFixed(2)}</div>
              <p className="text-xs text-gray-500">en el año actual</p>
            </CardContent>
          </Card>
        </div>

        {/* Status Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Estado de Ocupación</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Badge variant="default" className="bg-emerald-100 text-emerald-800">
                <Home className="w-3 h-3 mr-1" />
                Habitadas: {stats.occupiedCount}
              </Badge>
              <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                Abandonadas: {stats.abandonedCount}
              </Badge>
              <Badge variant="outline" className="border-blue-500 text-blue-700">
                <Key className="w-3 h-3 mr-1" />
                Arrendadas: {stats.rentedCount}
              </Badge>
              <Badge variant="outline" className="border-orange-500 text-orange-700">
                Anticresis: {stats.anticresisCount}
              </Badge>
              <Badge variant="destructive">
                <AlertTriangle className="w-3 h-3 mr-1" />
                Vencidas: {stats.overdueDebts}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}