"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, DollarSign, Package, BarChart3 } from "lucide-react"
import { getSales } from "@/lib/firebase"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"

interface Sale {
  id: string
  customerId: string
  customerName: string
  items: any[]
  totalAmount: number
  totalCost: number
  profit: number
  date: string
}

interface MonthlyData {
  month: string
  sales: number
  cost: number
  profit: number
  transactions: number
}

export default function PNLPage() {
  const [sales, setSales] = useState<Sale[]>([])
  const [filteredSales, setFilteredSales] = useState<Sale[]>([])
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([])
  const [selectedPeriod, setSelectedPeriod] = useState("all")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSalesData()
  }, [])

  useEffect(() => {
    filterSalesData()
  }, [sales, selectedPeriod, startDate, endDate])

  const loadSalesData = async () => {
    try {
      const salesData = await getSales()
      setSales(salesData)
    } catch (error) {
      console.error("Error loading sales data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterSalesData = () => {
    let filtered = [...sales]

    if (selectedPeriod === "custom" && startDate && endDate) {
      filtered = sales.filter((sale) => {
        const saleDate = new Date(sale.date)
        const start = new Date(startDate)
        const end = new Date(endDate)
        return saleDate >= start && saleDate <= end
      })
    } else if (selectedPeriod === "thisMonth") {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      filtered = sales.filter((sale) => new Date(sale.date) >= startOfMonth)
    } else if (selectedPeriod === "lastMonth") {
      const now = new Date()
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      filtered = sales.filter((sale) => {
        const saleDate = new Date(sale.date)
        return saleDate >= startOfLastMonth && saleDate <= endOfLastMonth
      })
    } else if (selectedPeriod === "thisYear") {
      const now = new Date()
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      filtered = sales.filter((sale) => new Date(sale.date) >= startOfYear)
    }

    setFilteredSales(filtered)
    generateMonthlyData(filtered)
  }

  const generateMonthlyData = (salesData: Sale[]) => {
    const monthlyMap = new Map<string, MonthlyData>()

    salesData.forEach((sale) => {
      const date = new Date(sale.date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      const monthName = date.toLocaleDateString("en-US", { year: "numeric", month: "long" })

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthName,
          sales: 0,
          cost: 0,
          profit: 0,
          transactions: 0,
        })
      }

      const monthData = monthlyMap.get(monthKey)!
      monthData.sales += sale.totalAmount || 0
      monthData.cost += sale.totalCost || 0
      monthData.profit += sale.profit || 0
      monthData.transactions += 1
    })

    const sortedData = Array.from(monthlyMap.values()).sort(
      (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime(),
    )

    setMonthlyData(sortedData)
  }

  const totalSales = filteredSales.reduce((sum, sale) => sum + (sale.totalAmount || 0), 0)
  const totalCost = filteredSales.reduce((sum, sale) => sum + (sale.totalCost || 0), 0)
  const totalProfit = filteredSales.reduce((sum, sale) => sum + (sale.profit || 0), 0)
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0

  if (loading) {
    return (
      <ProtectedRoute>
        <Navbar />
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-slate-900"></div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <BarChart3 className="w-7 h-7 text-slate-900" />
              <h1 className="text-3xl font-bold text-slate-900">Business Analytics</h1>
            </div>
            <p className="text-slate-600">Track your business performance and profitability</p>
          </div>

          {/* Filter Controls */}
          <Card className="bg-white border-slate-200 shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-slate-900">Filter Period</CardTitle>
              <CardDescription className="text-slate-600">Select the time period for analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="period" className="text-slate-700 font-medium">
                    Period
                  </Label>
                  <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                    <SelectTrigger className="mt-1 border-slate-200 focus:border-slate-900 focus:ring-slate-900">
                      <SelectValue placeholder="Select period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="thisMonth">This Month</SelectItem>
                      <SelectItem value="lastMonth">Last Month</SelectItem>
                      <SelectItem value="thisYear">This Year</SelectItem>
                      <SelectItem value="custom">Custom Range</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {selectedPeriod === "custom" && (
                  <>
                    <div>
                      <Label htmlFor="startDate" className="text-slate-700 font-medium">
                        Start Date
                      </Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="mt-1 border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                      />
                    </div>
                    <div>
                      <Label htmlFor="endDate" className="text-slate-700 font-medium">
                        End Date
                      </Label>
                      <Input
                        id="endDate"
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="mt-1 border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                      />
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Sales</CardTitle>
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">PKR {totalSales.toFixed(2)}</div>
                <p className="text-xs text-slate-500 mt-1">{filteredSales.length} transactions</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Cost</CardTitle>
                <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Package className="h-4 w-4 text-orange-600" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900">PKR {totalCost.toFixed(2)}</div>
                <p className="text-xs text-slate-500 mt-1">Cost of goods sold</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Total Profit</CardTitle>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    totalProfit >= 0 ? "bg-emerald-100" : "bg-red-100"
                  }`}
                >
                  {totalProfit >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${totalProfit >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  PKR {totalProfit.toFixed(2)}
                </div>
                <p className="text-xs text-slate-500 mt-1">Net profit/loss</p>
              </CardContent>
            </Card>

            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-600">Profit Margin</CardTitle>
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    profitMargin >= 0 ? "bg-emerald-100" : "bg-red-100"
                  }`}
                >
                  {profitMargin >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-emerald-600" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-600" />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${profitMargin >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  {profitMargin.toFixed(1)}%
                </div>
                <p className="text-xs text-slate-500 mt-1">Profit percentage</p>
              </CardContent>
            </Card>
          </div>

          {/* Monthly Breakdown */}
          <Card className="bg-white border-slate-200 shadow-sm mb-6">
            <CardHeader>
              <CardTitle className="text-slate-900">Monthly Breakdown</CardTitle>
              <CardDescription className="text-slate-600">Month-wise profit and loss analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="text-slate-600 font-medium">Month</TableHead>
                    <TableHead className="text-slate-600 font-medium">Transactions</TableHead>
                    <TableHead className="text-slate-600 font-medium">Sales</TableHead>
                    <TableHead className="text-slate-600 font-medium">Cost</TableHead>
                    <TableHead className="text-slate-600 font-medium">Profit</TableHead>
                    <TableHead className="text-slate-600 font-medium">Margin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlyData.map((month, index) => {
                    const margin = month.sales > 0 ? (month.profit / month.sales) * 100 : 0
                    return (
                      <TableRow key={index} className="border-slate-200">
                        <TableCell className="font-medium text-slate-900">{month.month}</TableCell>
                        <TableCell className="text-slate-600">{month.transactions}</TableCell>
                        <TableCell className="text-slate-900">PKR {month.sales.toFixed(2)}</TableCell>
                        <TableCell className="text-slate-600">PKR {month.cost.toFixed(2)}</TableCell>
                        <TableCell
                          className={month.profit >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}
                        >
                          PKR {month.profit.toFixed(2)}
                        </TableCell>
                        <TableCell
                          className={margin >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}
                        >
                          {margin.toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
              {monthlyData.length === 0 && (
                <div className="text-center py-8 text-slate-500">No data available for the selected period</div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Recent Transactions</CardTitle>
              <CardDescription className="text-slate-600">Latest sales in the selected period</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="text-slate-600 font-medium">Invoice #</TableHead>
                    <TableHead className="text-slate-600 font-medium">Customer</TableHead>
                    <TableHead className="text-slate-600 font-medium">Date</TableHead>
                    <TableHead className="text-slate-600 font-medium">Sales</TableHead>
                    <TableHead className="text-slate-600 font-medium">Cost</TableHead>
                    <TableHead className="text-slate-600 font-medium">Profit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSales.slice(0, 10).map((sale) => (
                    <TableRow key={sale.id} className="border-slate-200">
                      <TableCell className="font-medium text-slate-900">#{sale.id}</TableCell>
                      <TableCell className="text-slate-900">{sale.customerName}</TableCell>
                      <TableCell className="text-slate-600">{new Date(sale.date).toLocaleDateString()}</TableCell>
                      <TableCell className="text-slate-900">PKR {(sale.totalAmount || 0).toFixed(2)}</TableCell>
                      <TableCell className="text-slate-600">PKR {(sale.totalCost || 0).toFixed(2)}</TableCell>
                      <TableCell
                        className={
                          (sale.profit || 0) >= 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"
                        }
                      >
                        PKR {(sale.profit || 0).toFixed(2)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredSales.length === 0 && (
                <div className="text-center py-8 text-slate-500">No transactions found for the selected period</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
