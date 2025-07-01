import { initializeApp } from "firebase/app"
import { getDatabase, ref, push, set, get, remove, update } from "firebase/database"

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
export const database = getDatabase(app)

// Customer operations
export const addCustomer = async (customer: any) => {
  const customersRef = ref(database, "customers")
  const newCustomerRef = push(customersRef)
  await set(newCustomerRef, { ...customer, id: newCustomerRef.key })
  return newCustomerRef.key
}

export const getCustomers = async () => {
  const customersRef = ref(database, "customers")
  const snapshot = await get(customersRef)
  if (snapshot.exists()) {
    return Object.values(snapshot.val())
  }
  return []
}

export const updateCustomer = async (id: string, customer: any) => {
  const customerRef = ref(database, `customers/${id}`)
  await update(customerRef, customer)
}

export const deleteCustomer = async (id: string) => {
  const customerRef = ref(database, `customers/${id}`)
  await remove(customerRef)
}

// Product operations
export const addProduct = async (product: any) => {
  const productsRef = ref(database, "products")
  const newProductRef = push(productsRef)
  await set(newProductRef, { ...product, id: newProductRef.key })
  return newProductRef.key
}

export const getProducts = async () => {
  const productsRef = ref(database, "products")
  const snapshot = await get(productsRef)
  if (snapshot.exists()) {
    return Object.values(snapshot.val())
  }
  return []
}

export const updateProduct = async (id: string, product: any) => {
  const productRef = ref(database, `products/${id}`)
  await update(productRef, product)
}

export const deleteProduct = async (id: string) => {
  const productRef = ref(database, `products/${id}`)
  await remove(productRef)
}

// Sales operations
export const addSale = async (sale: any) => {
  const salesRef = ref(database, "sales")
  const newSaleRef = push(salesRef)
  await set(newSaleRef, { ...sale, id: newSaleRef.key })
  return newSaleRef.key
}

export const getSales = async () => {
  const salesRef = ref(database, "sales")
  const snapshot = await get(salesRef)
  if (snapshot.exists()) {
    return Object.values(snapshot.val())
  }
  return []
}
