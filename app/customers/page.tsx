"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Users } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { addCustomer, getCustomers, updateCustomer, deleteCustomer } from "@/lib/firebase"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  createdAt: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  })

  useEffect(() => {
    loadCustomers()
  }, [])

  const loadCustomers = async () => {
    try {
      const data = await getCustomers()
      setCustomers(data)
    } catch (error) {
      console.error("Error loading customers:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, formData)
      } else {
        await addCustomer({
          ...formData,
          createdAt: new Date().toISOString(),
        })
      }

      await loadCustomers()
      setFormData({ name: "", email: "", phone: "", address: "" })
      setEditingCustomer(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving customer:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (customer: Customer) => {
    setEditingCustomer(customer)
    setFormData({
      name: customer.name,
      email: customer.email,
      phone: customer.phone,
      address: customer.address,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCustomer(id)
      await loadCustomers()
    } catch (error) {
      console.error("Error deleting customer:", error)
    }
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone?.includes(searchTerm),
  )

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Users className="w-7 h-7 text-slate-900" />
                <h1 className="text-3xl font-bold text-slate-900">Customer Management</h1>
              </div>
              <p className="text-slate-600">Add and manage your customer database</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingCustomer(null)
                    setFormData({ name: "", email: "", phone: "", address: "" })
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium h-10 px-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Customer
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle className="text-slate-900">
                    {editingCustomer ? "Edit Customer" : "Add New Customer"}
                  </DialogTitle>
                  <DialogDescription className="text-slate-600">
                    {editingCustomer ? "Update customer information" : "Enter customer details. Only name is required."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name" className="text-slate-700 font-medium">
                      Name *
                    </Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="mt-1 border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className="text-slate-700 font-medium">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-slate-700 font-medium">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address" className="text-slate-700 font-medium">
                      Address
                    </Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="mt-1 border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-10"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : editingCustomer ? "Update Customer" : "Add Customer"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Main Content */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Customers</CardTitle>
              <CardDescription className="text-slate-600">Manage your customer database</CardDescription>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search customers by name, email, or phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                  />
                </div>
                {searchTerm && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchTerm("")}
                    className="border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="text-slate-600 font-medium">Name</TableHead>
                    <TableHead className="text-slate-600 font-medium">Email</TableHead>
                    <TableHead className="text-slate-600 font-medium">Phone</TableHead>
                    <TableHead className="text-slate-600 font-medium">Address</TableHead>
                    <TableHead className="text-slate-600 font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer) => (
                    <TableRow key={customer.id} className="border-slate-200">
                      <TableCell className="font-medium text-slate-900">{customer.name}</TableCell>
                      <TableCell className="text-slate-600">{customer.email || "-"}</TableCell>
                      <TableCell className="text-slate-600">{customer.phone || "-"}</TableCell>
                      <TableCell className="text-slate-600">{customer.address || "-"}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(customer)}
                            className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(customer.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {filteredCustomers.length === 0 && (
                <div className="text-center py-8 text-slate-500">No customers found</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
