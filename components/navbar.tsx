"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Home, Users, Package, ShoppingCart, BarChart3, LogOut, Building2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

export function Navbar() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const navigation = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Products", href: "/products", icon: Package },
    { name: "Sales", href: "/sales", icon: ShoppingCart },
    { name: "Analytics", href: "/pnl", icon: BarChart3 },
  ]

  return (
    <nav className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Boutique Manager</span>
          </Link>

          <div className="flex items-center space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    size="sm"
                    className={cn(
                      "flex items-center space-x-2 h-9 px-3",
                      isActive
                        ? "bg-slate-900 text-white hover:bg-slate-800"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden md:inline font-medium">{item.name}</span>
                  </Button>
                </Link>
              )
            })}

            <div className="ml-4 pl-4 border-l border-slate-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-slate-600 hover:text-slate-900 hover:bg-slate-100 h-9 px-3"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden md:inline ml-2 font-medium">Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}
