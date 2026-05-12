import Store from "../models/storeModel.js"
import asyncHandler from "express-async-handler"

const getStores = asyncHandler(async (req, res) => {
  const filter = {}
  if (req.query.isActive !== undefined) {
    filter.isActive = req.query.isActive === "true"
  }
  const stores = await Store.find(filter)
  res.json(stores)
})

const createStore = asyncHandler(async (req, res) => {
  const { name, address, phone, gstin } = req.body

  if (!name) {
    res.status(400)
    throw new Error("Store name is required")
  }

  const store = await Store.create({ name, address, phone, gstin })
  res.status(201).json(store)
})

const getStoreById = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id)

  if (!store) {
    res.status(404)
    throw new Error("Store not found")
  }

  res.json(store)
})

const updateStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id)

  if (!store) {
    res.status(404)
    throw new Error("Store not found")
  }

  store.name = req.body.name ?? store.name
  store.address = req.body.address ?? store.address
  store.phone = req.body.phone ?? store.phone
  store.gstin = req.body.gstin ?? store.gstin
  store.isActive = req.body.isActive ?? store.isActive

  const updatedStore = await store.save()
  res.json(updatedStore)
})

const deleteStore = asyncHandler(async (req, res) => {
  const store = await Store.findById(req.params.id)

  if (!store) {
    res.status(404)
    throw new Error("Store not found")
  }

  store.isActive = false
  await store.save()
  res.json({ message: "Store deactivated" })
})

export { getStores, createStore, getStoreById, updateStore, deleteStore }
