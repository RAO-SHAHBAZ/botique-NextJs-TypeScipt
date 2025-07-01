"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Edit, Trash2, Package } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { addProduct, getProducts, updateProduct, deleteProduct } from "@/lib/firebase"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"

interface Product {
  id: string
  articleNumber: string
  name: string
  cost: number
  quantity: number
  createdAt: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    articleNumber: "",
    name: "",
    cost: "",
    quantity: "",
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      const data = await getProducts()
      setProducts(data)
    } catch (error) {
      console.error("Error loading products:", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const productData = {
        articleNumber: formData.articleNumber,
        name: formData.name,
        cost: Number.parseFloat(formData.cost),
        quantity: Number.parseInt(formData.quantity),
        createdAt: editingProduct ? editingProduct.createdAt : new Date().toISOString(),
      }

      if (editingProduct) {
        await updateProduct(editingProduct.id, productData)
      } else {
        await addProduct(productData)
      }

      await loadProducts()
      setFormData({ articleNumber: "", name: "", cost: "", quantity: "" })
      setEditingProduct(null)
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error saving product:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      articleNumber: product.articleNumber,
      name: product.name,
      cost: product.cost.toString(),
      quantity: product.quantity.toString(),
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id)
      await loadProducts()
    } catch (error) {
      console.error("Error deleting product:", error)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.articleNumber?.toLowerCase().includes(searchTerm.toLowerCase()),
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
                <Package className="w-7 h-7 text-slate-900" />
                <h1 className="text-3xl font-bold text-slate-900">Product Management</h1>
              </div>
              <p className="text-slate-600">Manage your inventory and product catalog</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  onClick={() => {
                    setEditingProduct(null)
                    setFormData({ articleNumber: "", name: "", cost: "", quantity: "" })
                  }}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium h-10 px-4"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle className="text-slate-900">
                    {editingProduct ? "Edit Product" : "Add New Product"}
                  </DialogTitle>
                  <DialogDescription className="text-slate-600">
                    {editingProduct ? "Update product information" : "Enter product details to add to your inventory"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="articleNumber" className="text-slate-700 font-medium">
                      Article Number
                    </Label>
                    <Input
                      id="articleNumber"
                      value={formData.articleNumber}
                      onChange={(e) => setFormData({ ...formData, articleNumber: e.target.value })}
                      required
                      className="mt-1 border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="name" className="text-slate-700 font-medium">
                      Product Name
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
                    <Label htmlFor="cost" className="text-slate-700 font-medium">
                      Product Cost (PKR)
                    </Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      value={formData.cost}
                      onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                      required
                      className="mt-1 border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                    />
                  </div>
                  <div>
                    <Label htmlFor="quantity" className="text-slate-700 font-medium">
                      Quantity
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      required
                      className="mt-1 border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium h-10"
                    disabled={loading}
                  >
                    {loading ? "Saving..." : editingProduct ? "Update Product" : "Add Product"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Main Content */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Products</CardTitle>
              <CardDescription className="text-slate-600">Manage your product inventory</CardDescription>
              <div className="flex items-center space-x-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search products by name or article number..."
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
                    <TableHead className="text-slate-600 font-medium">Article Number</TableHead>
                    <TableHead className="text-slate-600 font-medium">Product Name</TableHead>
                    <TableHead className="text-slate-600 font-medium">Cost</TableHead>
                    <TableHead className="text-slate-600 font-medium">Quantity</TableHead>
                    <TableHead className="text-slate-600 font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map((product) => (
                    <TableRow key={product.id} className="border-slate-200">
                      <TableCell className="font-medium text-slate-900">{product.articleNumber}</TableCell>
                      <TableCell className="text-slate-900">{product.name}</TableCell>
                      <TableCell className="text-slate-600">PKR {product.cost?.toFixed(2)}</TableCell>
                      <TableCell className="text-slate-600">
                        <div className="flex items-center gap-2">
                          <span>{product.quantity}</span>
                          {product.quantity <= 5 && product.quantity > 0 && (
                            <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">
                              Low Stock
                            </span>
                          )}
                          {product.quantity === 0 && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">Out of Stock</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(product)}
                            className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(product.id)}
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
              {filteredProducts.length === 0 && (
                <div className="text-center py-8 text-slate-500">No products found</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
