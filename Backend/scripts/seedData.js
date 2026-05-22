import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcryptjs"

// Load env
dotenv.config()

import User from "../models/userModel.js"
import Store from "../models/storeModel.js"
import Category from "../models/categoryModel.js"
import Product from "../models/productModel.js"
import Supplier from "../models/supplierModel.js"
import Sale from "../models/saleModel.js"
import PurchaseOrder from "../models/purchaseOrderModel.js"
import InventoryLog from "../models/inventoryLogModel.js"

const dbURI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/stockly"

const seed = async () => {
  try {
    console.log(`Connecting to MongoDB at ${dbURI}...`)
    await mongoose.connect(dbURI)
    console.log("Connected to database.")

    // Clear existing collections
    console.log("Clearing existing collections...")
    await User.deleteMany({})
    await Store.deleteMany({})
    await Category.deleteMany({})
    await Product.deleteMany({})
    await Supplier.deleteMany({})
    await Sale.deleteMany({})
    await PurchaseOrder.deleteMany({})
    await InventoryLog.deleteMany({})
    console.log("Collections cleared.")

    // 1. Create Store
    console.log("Creating store...")
    const store = await Store.create({
      name: "StockUp Supermarket",
      location: "Downtown Plaza, Suite 4",
      phone: "+15550199",
      email: "info@stockup.com",
    })
    console.log(`Store created: ${store.name} (${store._id})`)

    // 2. Create Users
    console.log("Creating users...")
    const adminUser = await User.create({
      name: "Admin User",
      email: "admin@stockup.com",
      password: "password123", // Hashes via schema pre-save hook
      role: "admin",
      store: store._id,
    })
    const cashierUser = await User.create({
      name: "Cashier User",
      email: "cashier@stockup.com",
      password: "password123",
      role: "cashier",
      store: store._id,
    })
    console.log("Users created.")

    // 3. Create Suppliers
    console.log("Creating suppliers...")
    const supplier1 = await Supplier.create({
      name: "Global Distributors",
      contactPerson: "Sarah Jenkins",
      email: "orders@globaldist.com",
      mobile: "+15550188",
      address: "100 Logistics Blvd",
      isActive: true,
      performance: {
        reliabilityScore: 98,
        qualityRating: 4.8,
        onTimeDeliveryRate: 95,
      }
    })
    const supplier2 = await Supplier.create({
      name: "Fresh Farms Co",
      contactPerson: "John Miller",
      email: "sales@freshfarmsco.com",
      mobile: "+15550177",
      address: "Rural Route 4, Green Valley",
      isActive: true,
      performance: {
        reliabilityScore: 92,
        qualityRating: 4.9,
        onTimeDeliveryRate: 88,
      }
    })
    const supplier3 = await Supplier.create({
      name: "Delta Wholesale",
      contactPerson: "Mike Ross",
      email: "support@deltawh.com",
      mobile: "+15550166",
      address: "74 Enterprise Ave",
      isActive: true,
      performance: {
        reliabilityScore: 85,
        qualityRating: 4.2,
        onTimeDeliveryRate: 80,
      }
    })
    console.log("Suppliers created.")

    // 4. Create Categories
    console.log("Creating categories...")
    const catGroceries = await Category.create({ name: "Groceries", description: "Foodgrains, oils, spices, and cooking essentials", isActive: true })
    const catBeverages = await Category.create({ name: "Beverages", description: "Soft drinks, juices, energy drinks, and water", isActive: true })
    const catDairy = await Category.create({ name: "Dairy", description: "Milk, butter, cheese, and yogurt", isActive: true })
    const catBakery = await Category.create({ name: "Bakery", description: "Breads, cakes, cookies, and buns", isActive: true })
    const catSnacks = await Category.create({ name: "Snacks", description: "Chips, chocolates, biscuits, and dry snacks", isActive: true })
    console.log("Categories created.")

    // 5. Create Products
    console.log("Creating products...")
    const product1 = await Product.create({
      sku: "PRD-MILK001",
      name: "Organic Whole Milk 1L",
      category: catDairy._id,
      buyingPrice: 1.80,
      sellingPrice: 2.99,
      mrp: 3.49,
      unit: "liter",
      quantity: 45,
      minStock: 10,
      maxStock: 100,
      location: "Aisle 2 / Shelf C",
      supplier: supplier2._id,
      barcode: "789012345601",
      expiryDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // Expiry 12 days from now
      isActive: true,
    })

    const product2 = await Product.create({
      sku: "PRD-BREAD02",
      name: "Whole Wheat Bread 400g",
      category: catBakery._id,
      buyingPrice: 1.10,
      sellingPrice: 2.29,
      mrp: 2.49,
      unit: "piece",
      quantity: 4, // Under minStock!
      minStock: 10,
      maxStock: 50,
      location: "Aisle 1 / Shelf A",
      supplier: supplier1._id,
      barcode: "789012345602",
      expiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Expiry 3 days from now
      isActive: true,
    })

    const product3 = await Product.create({
      sku: "PRD-COLA003",
      name: "Coca Cola 500ml",
      category: catBeverages._id,
      buyingPrice: 0.70,
      sellingPrice: 1.49,
      mrp: 1.79,
      unit: "piece",
      quantity: 120,
      minStock: 25,
      maxStock: 200,
      location: "Aisle 4 / Cooler 2",
      supplier: supplier1._id,
      barcode: "789012345603",
      isActive: true,
    })

    const product4 = await Product.create({
      sku: "PRD-RICE004",
      name: "Basmati Rice Premium 5kg",
      category: catGroceries._id,
      buyingPrice: 7.50,
      sellingPrice: 11.99,
      mrp: 12.99,
      unit: "pack",
      quantity: 25,
      minStock: 8,
      maxStock: 50,
      location: "Aisle 3 / Shelf D",
      supplier: supplier3._id,
      barcode: "789012345604",
      isActive: true,
    })

    const product5 = await Product.create({
      sku: "PRD-COOKIE5",
      name: "Chocolate Chip Cookies",
      category: catSnacks._id,
      buyingPrice: 1.25,
      sellingPrice: 2.49,
      mrp: 2.99,
      unit: "pack",
      quantity: 0, // Out of stock!
      minStock: 15,
      maxStock: 80,
      location: "Aisle 5 / Shelf B",
      supplier: supplier1._id,
      barcode: "789012345605",
      isActive: true,
    })
    console.log("Products created.")

    // 6. Create Historical Sales (last 7 days)
    console.log("Creating sales history...")
    const productCatalog = [product1, product2, product3, product4]
    const paymentMethods = ["cash", "upi", "card"]
    
    let invoiceCount = 1

    for (let dayOffset = 6; dayOffset >= 0; dayOffset--) {
      const saleDate = new Date()
      saleDate.setDate(saleDate.getDate() - dayOffset)
      
      // Random number of sales per day (between 3 and 6)
      const numSales = Math.floor(Math.random() * 4) + 3
      console.log(`- Day -${dayOffset}: generating ${numSales} sales for ${saleDate.toLocaleDateString()}`)

      for (let s = 0; s < numSales; s++) {
        // Random sale time during business hours (9 AM to 9 PM)
        const hour = Math.floor(Math.random() * 12) + 9
        const minute = Math.floor(Math.random() * 60)
        const specificSaleDate = new Date(saleDate)
        specificSaleDate.setHours(hour, minute, 0, 0)

        // Select 1-3 random products for this sale
        const numItems = Math.floor(Math.random() * 2) + 1
        const saleItems = []
        let subtotal = 0

        // Shuffle catalog to pick unique items
        const shuffledCatalog = [...productCatalog].sort(() => 0.5 - Math.random())

        for (let i = 0; i < numItems; i++) {
          const prod = shuffledCatalog[i]
          const qty = Math.floor(Math.random() * 2) + 1 // 1 or 2 items
          const itemTotal = Number((prod.sellingPrice * qty).toFixed(2))

          saleItems.push({
            product: prod._id,
            name: prod.name,
            quantity: qty,
            unitPrice: prod.sellingPrice,
            totalPrice: itemTotal,
          })

          subtotal += itemTotal
        }

        subtotal = Number(subtotal.toFixed(2))
        const discountPercent = Math.random() > 0.7 ? 5 : 0 // 30% chance of 5% discount
        const discountAmount = Number((subtotal * (discountPercent / 100)).toFixed(2))
        const taxPercent = 8 // 8% sales tax
        const taxableBase = subtotal - discountAmount
        const taxAmount = Number((taxableBase * (taxPercent / 100)).toFixed(2))
        const total = Number((taxableBase + taxAmount).toFixed(2))

        const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)]
        
        const yr = String(specificSaleDate.getFullYear()).slice(-2)
        const mo = String(specificSaleDate.getMonth() + 1).padStart(2, "0")
        const dy = String(specificSaleDate.getDate()).padStart(2, "0")
        const invoiceNo = `${yr}${mo}${dy}-${String(invoiceCount++).padStart(4, "0")}`

        // Create sale record directly
        await Sale.create({
          invoiceNo,
          customer: null,
          items: saleItems,
          subtotal,
          discountPercent,
          discountAmount,
          taxPercent,
          taxAmount,
          total,
          paymentMethod,
          amountTendered: total,
          changeAmount: 0,
          status: "completed",
          cashier: cashierUser._id,
          store: store._id,
          createdAt: specificSaleDate,
          updatedAt: specificSaleDate,
        })
      }
    }

    console.log("Sales history created successfully.")
    console.log("Database seeded successfully! Admin Login: admin@stockup.com / password123")
    process.exit(0)
  } catch (error) {
    console.error("Error seeding database:", error)
    process.exit(1)
  }
}

seed()
