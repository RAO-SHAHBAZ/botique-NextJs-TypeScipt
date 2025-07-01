"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Search, Printer, Trash2, ShoppingCart } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { getCustomers, getProducts, addSale, getSales, updateProduct } from "@/lib/firebase"
import { ProtectedRoute } from "@/components/protected-route"
import { Navbar } from "@/components/navbar"

// Add these imports at the top
import { Check, ChevronsUpDown } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

interface Product {
  id: string
  articleNumber: string
  name: string
  cost: number
  quantity: number
}

interface SaleItem {
  productId: string
  productName: string
  articleNumber: string
  quantity: number
  sellPrice: number
  costPrice: number
  total: number
}

interface Sale {
  id: string
  customerId: string
  customerName: string
  items: SaleItem[]
  totalAmount: number
  totalCost: number
  profit: number
  date: string
}

export default function SalesPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [sales, setSales] = useState<Sale[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [saleItems, setSaleItems] = useState<SaleItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const itemsPerPage = 10

  // Form states for adding items
  const [selectedProduct, setSelectedProduct] = useState("")
  const [quantity, setQuantity] = useState("")
  const [sellPrice, setSellPrice] = useState("")

  // Add these state variables after the existing state declarations
  const [customerSearchOpen, setCustomerSearchOpen] = useState(false)
  const [productSearchOpen, setProductSearchOpen] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [customersData, productsData, salesData] = await Promise.all([getCustomers(), getProducts(), getSales()])
      setCustomers(customersData)
      setProducts(productsData)
      setSales(salesData)
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const addItemToSale = () => {
    if (!selectedProduct || !quantity || !sellPrice) return

    const product = products.find((p) => p.id === selectedProduct)
    if (!product) return

    const newItem: SaleItem = {
      productId: product.id,
      productName: product.name,
      articleNumber: product.articleNumber,
      quantity: Number.parseInt(quantity),
      sellPrice: Number.parseFloat(sellPrice),
      costPrice: product.cost,
      total: Number.parseInt(quantity) * Number.parseFloat(sellPrice),
    }

    setSaleItems([...saleItems, newItem])
    setSelectedProduct("")
    setQuantity("")
    setSellPrice("")
  }

  const removeItemFromSale = (index: number) => {
    setSaleItems(saleItems.filter((_, i) => i !== index))
  }

  const completeSale = async () => {
    if (!selectedCustomer || saleItems.length === 0) return

    setLoading(true)
    try {
      const customer = customers.find((c) => c.id === selectedCustomer)
      if (!customer) return

      const totalAmount = saleItems.reduce((sum, item) => sum + item.total, 0)
      const totalCost = saleItems.reduce((sum, item) => sum + item.costPrice * item.quantity, 0)
      const profit = totalAmount - totalCost

      const newSale: Omit<Sale, "id"> = {
        customerId: selectedCustomer,
        customerName: customer.name,
        items: saleItems,
        totalAmount,
        totalCost,
        profit,
        date: new Date().toISOString(),
      }

      await addSale(newSale)

      // Update product quantities
      for (const item of saleItems) {
        const product = products.find((p) => p.id === item.productId)
        if (product) {
          await updateProduct(product.id, {
            ...product,
            quantity: product.quantity - item.quantity,
          })
        }
      }

      await loadData()

      // Reset form
      setSelectedCustomer("")
      setSaleItems([])
      setIsDialogOpen(false)
    } catch (error) {
      console.error("Error completing sale:", error)
    } finally {
      setLoading(false)
    }
  }

  const printInvoice = (sale: Sale) => {
    const customer = customers.find((c) => c.id === sale.customerId)
    if (!customer) return

    const invoiceContent = `
    <html>
      <head>
        <title>Invoice #${sale.id}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; color: #1e293b; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #1e293b; padding-bottom: 20px; }
          .company-name { font-size: 28px; font-weight: bold; color: #1e293b; margin-bottom: 8px; }
          .invoice-title { font-size: 24px; color: #64748b; margin-bottom: 20px; }
          .invoice-details { display: flex; justify-content: space-between; margin-bottom: 20px; }
          .customer-info { margin-bottom: 30px; }
          .customer-title { color: #1e293b; font-size: 18px; font-weight: bold; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
          th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
          th { background-color: #f8fafc; color: #1e293b; font-weight: 600; }
          .total-section { text-align: right; background-color: #f8fafc; padding: 20px; border-radius: 8px; }
          .total-amount { font-size: 24px; font-weight: bold; color: #1e293b; }
          .footer { text-align: center; margin-top: 40px; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-name">Boutique Manager</div>
          <div class="invoice-title">SALES INVOICE</div>
          <div class="invoice-details">
            <div><strong>Invoice #:</strong> ${sale.id}</div>
            <div><strong>Date:</strong> ${new Date(sale.date).toLocaleDateString()}</div>
          </div>
        </div>
        
        <div class="customer-info">
          <div class="customer-title">Bill To:</div>
          <div><strong>${customer.name}</strong></div>
          ${customer.email ? `<div>Email: ${customer.email}</div>` : ""}
          ${customer.phone ? `<div>Phone: ${customer.phone}</div>` : ""}
          ${customer.address ? `<div>Address: ${customer.address}</div>` : ""}
        </div>

        <table>
          <thead>
            <tr>
              <th>Article #</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${sale.items
              .map(
                (item) => `
              <tr>
                <td>${item.articleNumber}</td>
                <td>${item.productName}</td>
                <td>${item.quantity}</td>
                <td>PKR ${item.sellPrice.toFixed(2)}</td>
                <td>PKR ${item.total.toFixed(2)}</td>
              </tr>
            `,
              )
              .join("")}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-amount">Total Amount: PKR ${sale.totalAmount.toFixed(2)}</div>
        </div>

        <div class="footer">
          <p>Thank you for your business!</p>
          <p>Generated by Boutique Manager</p>
        </div>
      </body>
    </html>
  `

    const printWindow = window.open("", "_blank")
    if (printWindow) {
      printWindow.document.write(invoiceContent)
      printWindow.document.close()
      printWindow.print()
    }
  }

  const filteredSales = sales.filter(
    (sale) => sale.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || sale.id?.includes(searchTerm),
  )

  const paginatedSales = filteredSales.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
  const totalPages = Math.ceil(filteredSales.length / itemsPerPage)

  return (
    <ProtectedRoute>
      <Navbar />
      <div className="min-h-screen bg-slate-50">
        <div className="container mx-auto p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <ShoppingCart className="w-7 h-7 text-slate-900" />
                <h1 className="text-3xl font-bold text-slate-900">Sales Management</h1>
              </div>
              <p className="text-slate-600">Process sales and generate invoices</p>
            </div>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-slate-900 hover:bg-slate-800 text-white font-medium h-10 px-4">
                  <Plus className="mr-2 h-4 w-4" />
                  New Sale
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl bg-white">
                <DialogHeader>
                  <DialogTitle className="text-slate-900">Create New Sale</DialogTitle>
                  <DialogDescription className="text-slate-600">
                    Select customer and add products to create a new sale
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-6">
                  {/* ---------- Customer combobox ---------- */}
                  <div>
                    <Label htmlFor="customer" className="text-slate-700 font-medium">
                      Select Customer
                    </Label>
                    <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={customerSearchOpen}
                          className="w-full justify-between mt-1 border-slate-200 focus:border-slate-900 focus:ring-slate-900 bg-transparent"
                        >
                          {selectedCustomer
                            ? customers.find((c) => c.id === selectedCustomer)?.name
                            : "Select customer..."}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-0">
                        <Command>
                          <CommandInput placeholder="Search customers..." />
                          <CommandList>
                            <CommandEmpty>No customer found.</CommandEmpty>
                            <CommandGroup>
                              {customers.map((c) => (
                                <CommandItem
                                  key={c.id}
                                  value={c.name}
                                  onSelect={() => {
                                    setSelectedCustomer(c.id)
                                    setCustomerSearchOpen(false)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      selectedCustomer === c.id ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  <div className="flex flex-col">
                                    <span className="font-medium">{c.name}</span>
                                    {c.email && <span className="text-xs text-slate-500">{c.email}</span>}
                                    {c.phone && <span className="text-xs text-slate-500">{c.phone}</span>}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* ---------- Product / Qty / Price grid ---------- */}
                  <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-2">
                      <Label htmlFor="product" className="text-slate-700 font-medium">
                        Product
                      </Label>
                      <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={productSearchOpen}
                            className="w-full justify-between mt-1 border-slate-200 focus:border-slate-900 focus:ring-slate-900 bg-transparent"
                          >
                            {selectedProduct
                              ? products.find((p) => p.id === selectedProduct)?.name
                              : "Select product..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0">
                          <Command>
                            <CommandInput placeholder="Search products..." />
                            <CommandList>
                              <CommandEmpty>No product found.</CommandEmpty>
                              <CommandGroup>
                                {products
                                  .filter((p) => p.quantity > 0)
                                  .map((p) => (
                                    <CommandItem
                                      key={p.id}
                                      value={`${p.name} ${p.articleNumber}`}
                                      onSelect={() => {
                                        setSelectedProduct(p.id)
                                        setProductSearchOpen(false)
                                      }}
                                    >
                                      <Check
                                        className={cn(
                                          "mr-2 h-4 w-4",
                                          selectedProduct === p.id ? "opacity-100" : "opacity-0",
                                        )}
                                      />
                                      <div className="flex flex-col">
                                        <span className="font-medium">{p.name}</span>
                                        <div className="flex gap-2 text-xs text-slate-500">
                                          <span>#{p.articleNumber}</span>
                                          <span>• Stock: {p.quantity}</span>
                                          <span>• Cost: PKR {p.cost.toFixed(2)}</span>
                                        </div>
                                      </div>
                                    </CommandItem>
                                  ))}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="quantity" className="text-slate-700 font-medium">
                        Quantity
                      </Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="Qty"
                        className="mt-1 border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                      />
                    </div>

                    <div>
                      <Label htmlFor="sellPrice" className="text-slate-700 font-medium">
                        Sell Price (PKR)
                      </Label>
                      <Input
                        id="sellPrice"
                        type="number"
                        step="0.01"
                        value={sellPrice}
                        onChange={(e) => setSellPrice(e.target.value)}
                        placeholder="Price per unit"
                        className="mt-1 border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                      />
                    </div>

                    <div className="col-span-4 flex justify-end">
                      <Button
                        onClick={addItemToSale}
                        className="bg-slate-900 hover:bg-slate-800 text-white font-medium h-10 mt-2"
                      >
                        Add Item
                      </Button>
                    </div>
                  </div>
                </div>

                {saleItems.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-slate-900">Sale Items</h3>
                    <Table>
                      <TableHeader>
                        <TableRow className="border-slate-200">
                          <TableHead className="text-slate-600 font-medium">Article #</TableHead>
                          <TableHead className="text-slate-600 font-medium">Product</TableHead>
                          <TableHead className="text-slate-600 font-medium">Qty</TableHead>
                          <TableHead className="text-slate-600 font-medium">Price</TableHead>
                          <TableHead className="text-slate-600 font-medium">Total</TableHead>
                          <TableHead className="text-slate-600 font-medium">Action</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {saleItems.map((item, index) => (
                          <TableRow key={index} className="border-slate-200">
                            <TableCell className="text-slate-900">{item.articleNumber}</TableCell>
                            <TableCell className="text-slate-900">{item.productName}</TableCell>
                            <TableCell className="text-slate-600">{item.quantity}</TableCell>
                            <TableCell className="text-slate-600">PKR {item.sellPrice.toFixed(2)}</TableCell>
                            <TableCell className="text-slate-900 font-medium">PKR {item.total.toFixed(2)}</TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => removeItemFromSale(index)}
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    <div className="text-right mt-4 p-4 bg-slate-50 rounded-lg">
                      <p className="text-lg font-semibold text-slate-900">
                        Total: PKR {saleItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-3 pt-4 border-t border-slate-200">
                  <Button
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                    className="border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={completeSale}
                    disabled={!selectedCustomer || saleItems.length === 0 || loading}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-medium"
                  >
                    {loading ? "Processing..." : "Complete Sale"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Main Content */}
          <Card className="bg-white border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900">Sales History</CardTitle>
              <CardDescription className="text-slate-600">View and manage all sales transactions</CardDescription>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Search sales..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-slate-200 focus:border-slate-900 focus:ring-slate-900"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-200">
                    <TableHead className="text-slate-600 font-medium">Invoice #</TableHead>
                    <TableHead className="text-slate-600 font-medium">Customer</TableHead>
                    <TableHead className="text-slate-600 font-medium">Items</TableHead>
                    <TableHead className="text-slate-600 font-medium">Total Amount</TableHead>
                    <TableHead className="text-slate-600 font-medium">Profit</TableHead>
                    <TableHead className="text-slate-600 font-medium">Date</TableHead>
                    <TableHead className="text-slate-600 font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSales.map((sale) => (
                    <TableRow key={sale.id} className="border-slate-200">
                      <TableCell className="font-medium text-slate-900">#{sale.id}</TableCell>
                      <TableCell className="text-slate-900">{sale.customerName}</TableCell>
                      <TableCell className="text-slate-600">{sale.items?.length || 0} items</TableCell>
                      <TableCell className="text-slate-900 font-medium">PKR {sale.totalAmount?.toFixed(2)}</TableCell>
                      <TableCell className="text-emerald-600 font-medium">PKR {sale.profit?.toFixed(2)}</TableCell>
                      <TableCell className="text-slate-600">{new Date(sale.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => printInvoice(sale)}
                          className="border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {filteredSales.length === 0 && <div className="text-center py-8 text-slate-500">No sales found</div>}

              {totalPages > 1 && (
                <div className="flex justify-center space-x-2 mt-6 pt-4 border-t border-slate-200">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Previous
                  </Button>
                  <span className="flex items-center px-4 text-slate-600">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Next
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
