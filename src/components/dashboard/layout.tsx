"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Home,
  Building,
  Users,
  Receipt,
  FileText,
  Handshake,
  Settings,
  LogOut,
  Menu,
  Bell,
  ChevronDown,
  UserCircle,
} from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: React.ReactNode
  roles?: string[]
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: <Home className="w-5 h-5" />,
  },
  {
    title: "Residencias",
    href: "/dashboard/residences",
    icon: <Building className="w-5 h-5" />,
    roles: ["ADMIN", "PRESIDENT", "TREASURER", "SECRETARY"],
  },
  {
    title: "Pagos",
    href: "/dashboard/payments",
    icon: <Receipt className="w-5 h-5" />,
    roles: ["ADMIN", "PRESIDENT", "TREASURER"],
  },
  {
    title: "Deudas",
    href: "/dashboard/debts",
    icon: <Receipt className="w-5 h-5" />,
    roles: ["ADMIN", "PRESIDENT", "TREASURER"],
  },
  {
    title: "Convenios",
    href: "/dashboard/agreements",
    icon: <Handshake className="w-5 h-5" />,
    roles: ["ADMIN", "PRESIDENT", "TREASURER"],
  },
  {
    title: "Documentos",
    href: "/dashboard/documents",
    icon: <FileText className="w-5 h-5" />,
    roles: ["ADMIN", "PRESIDENT", "TREASURER"],
  },
  {
    title: "Usuarios",
    href: "/dashboard/users",
    icon: <Users className="w-5 h-5" />,
    roles: ["ADMIN"],
  },
  {
    title: "Configuración",
    href: "/dashboard/settings",
    icon: <Settings className="w-5 h-5" />,
    roles: ["ADMIN"],
  },
]

interface DashboardLayoutProps {
  children: React.ReactNode
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
    role: string
    avatar?: string | null
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const filteredNavItems = navItems.filter(
    (item) => !item.roles || item.roles.includes(user.role)
  )

  const handleLogout = () => {
    router.push("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-white px-6 pb-4">
          <div className="flex h-16 shrink-0 items-center">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🏠</span>
              <span className="font-bold text-lg">Palermo Manaza</span>
            </div>
          </div>
          <nav className="flex flex-1 flex-col gap-y-2">
            {filteredNavItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                {item.icon}
                {item.title}
              </Link>
            ))}
          </nav>
          <div className="mt-auto pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden sticky top-0 z-40 flex h-16 w-full items-center gap-x-4 border-b bg-white px-4 shadow-sm">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <div className="flex h-full flex-col">
              <div className="flex h-16 shrink-0 items-center gap-2 border-b pb-4">
                <span className="text-2xl">🏠</span>
                <span className="font-bold text-lg">Palermo Manaza</span>
              </div>
              <nav className="flex flex-1 flex-col gap-y-2 py-4">
                {filteredNavItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                      "text-gray-700 hover:bg-gray-100"
                    )}
                  >
                    {item.icon}
                    {item.title}
                  </Link>
                ))}
              </nav>
              <div className="border-t pt-4">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="flex flex-1 items-center justify-between">
          <span className="font-bold">Palermo Manaza</span>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <UserCircle className="h-6 w-6" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span>{user.firstName} {user.lastName}</span>
                    <span className="text-xs font-normal text-gray-500">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="lg:pl-64">
        <div className="lg:hidden h-16" />
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  )
}