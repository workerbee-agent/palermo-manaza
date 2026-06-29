import Link from "next/link";
import { Building2, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-zinc-100 dark:from-black dark:to-zinc-900">
      <div className="container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-6xl">🏠</span>
          </div>
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Palermo Manaza
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Sistema de Gestión del Conjunto Residencial
          </p>
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Residencias
              </CardTitle>
              <CardDescription>
                Gestión de casas y departamentos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600">
                Control de estado: habitada, abandonada, arrendada o en anticresis.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <LogIn />
                Pagos
              </CardTitle>
              <CardDescription>
                Cuotas y expensas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600">
                Registro de pagos en línea y presenciales con aprobación.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus />
                Residentes
              </CardTitle>
              <CardDescription>
                Propietarios y tenants
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-zinc-600">
                Gestión de propietarios, cónyuges y arrendatarios.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link href="/auth/login">
            <Button size="lg" className="gap-2">
              <LogIn className="w-5 h-5" />
              Iniciar Sesión
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button variant="outline" size="lg" className="gap-2">
              <UserPlus className="w-5 h-5" />
              Registrarse
            </Button>
          </Link>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center text-sm text-zinc-500">
          <p>© 2026 Palermo Manaza. Todos los derechos reservados.</p>
        </footer>
      </div>
    </div>
  );
}