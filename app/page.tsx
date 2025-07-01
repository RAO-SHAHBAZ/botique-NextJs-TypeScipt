"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, Package, ShoppingCart, BarChart3, TrendingUp, Building2 } from "lucide-react"
import { getCustomers, getProducts, getSales } from "@/lib/firebase"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"

export default function Dashboard() {
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    sales: 0,
    revenue: 0,
  })

  useEffect(() => {
    const loadStats = async () => {
      try {
        const [customers, products, sales] = await Promise.all([getCustomers(), getProducts(), getSales()])

        const revenue = sales.reduce((sum: number, sale: any) => sum + sale.totalAmount, 0)

        setStats({
          customers: customers.length,
          products: products.length,
          sales: sales.length,
          revenue,
        })
      } catch (error) {
        console.error("Error loading stats:", error)
      }
    }

    loadStats()
  }, [])

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-slate-900" />
              <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
            </div>
            <p className="text-slate-600 text-lg">Manage your boutique business efficiently</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Customers</CardTitle>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.customers}</div>
                <p className="text-xs text-slate-500 mt-1">Active customers</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Products</CardTitle>
                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 text-emerald-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.products}</div>
                <p className="text-xs text-slate-500 mt-1">In inventory</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Sales</CardTitle>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <ShoppingCart className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">{stats.sales}</div>
                <p className="text-xs text-slate-500 mt-1">Completed orders</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Revenue</CardTitle>
                <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-slate-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">PKR {stats.revenue.toFixed(0)}</div>
                <p className="text-xs text-slate-500 mt-1">Total earnings</p>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle className="text-slate-900 text-lg">Customer Management</CardTitle>
                <CardDescription className="text-slate-600">Add and manage customer information</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/customers">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-10">
                    Manage Customers
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <Package className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle className="text-slate-900 text-lg">Product Catalog</CardTitle>
                <CardDescription className="text-slate-600">Manage inventory and product details</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/products">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-10">
                    Manage Products
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <ShoppingCart className="w-6 h-6 text-orange-600" />
                </div>
                <CardTitle className="text-slate-900 text-lg">Sales Management</CardTitle>
                <CardDescription className="text-slate-600">Process orders and generate invoices</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/sales">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-10">
                    Manage Sales
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardHeader className="pb-4">
                <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-slate-600" />
                </div>
                <CardTitle className="text-slate-900 text-lg">Business Analytics</CardTitle>
                <CardDescription className="text-slate-600">View reports and performance metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/pnl">
                  <Button className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-10">
                    View Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}
