import { redirect } from "next/navigation"
import { verifyToken } from "@/lib/auth"
import { getResidenceByOwner } from "@/actions/residence"
import { getTotalDebtByResidence } from "@/actions/payments"
import { DashboardLayout } from "@/components/dashboard/layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DollarSign, Home, FileText, CreditCard, AlertTriangle } from "lucide-react"

export default async function ResidentDashboardPage({
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

  const user = {
    id: payload.userId,
    firstName: "Residente",
    lastName: "User",
    email: "resident@palermo-manaza.com",
    role: payload.role,
    avatar: null,
  }

  const residence = await getResidenceByOwner(user.id)
  const debtInfo = residence ? await getTotalDebtByResidence(residence.id) : null

  const statusLabels: Record<string, { label: string; variant: any }> = {
    OCCUPIED: { label: "Habitada", variant: "default" },
    ABANDONED: { label: "Abandonada", variant: "secondary" },
    RENTED: { label: "Arrendada", variant: "outline" },
    ANTICRESIS: { label: "Anticresis", variant: "outline" },
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Mi Residencia</h1>
          <p className="text-gray-600">Bienvenido, {user.firstName}</p>
        </div>

        {!residence ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Home className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No tienes una residencia asignada</p>
              <p className="text-sm text-gray-500">Contacta a administración para asignar tu residencia</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Residence Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Home className="w-5 h-5" />
                  {residence.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Tipo</p>
                    <p className="font-medium">{residence.type === "HOUSE" ? "Casa" : "Departamento"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Bloque</p>
                    <p className="font-medium">{residence.block}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Dirección</p>
                    <p className="font-medium">{residence.address}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Estado</p>
                    <Badge variant={statusLabels[residence.status]?.variant || "outline"}>
                      {statusLabels[residence.status]?.label || residence.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Debt Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Deuda Total</CardTitle>
                  <DollarSign className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    ${debtInfo?.total.toFixed(2) || "0.00"}
                  </div>
                  <p className="text-xs text-gray-500">Total pendiente</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Pagos Realizados</CardTitle>
                  <CreditCard className="h-4 w-4 text-emerald-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-emerald-600">
                    {residence.payments.length}
                  </div>
                  <p className="text-xs text-gray-500">en el sistema</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Certificados</CardTitle>
                  <FileText className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {residence.documents.length}
                  </div>
                  <p className="text-xs text-gray-500">disponibles</p>
                </CardContent>
              </Card>
            </div>

            {/* Debt by Year */}
            {debtInfo?.byYear && debtInfo.byYear.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Deuda por Año</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {debtInfo.byYear.map((yearData) => (
                      <div key={yearData.year} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Año {yearData.year}</p>
                          <p className="text-sm text-gray-500">{yearData.months} meses pendiente</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-red-600">${yearData.total.toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Actions */}
            <div className="flex gap-4">
              <Button className="bg-emerald-600 hover:bg-emerald-700">
                <CreditCard className="w-4 h-4 mr-2" />
                Realizar Pago
              </Button>
              <Button variant="outline">
                <FileText className="w-4 h-4 mr-2" />
                Solicitar Certificado
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  )
}