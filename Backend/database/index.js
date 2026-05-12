import mongoose from "mongoose"
import { db } from "../config.js"

const hasCredentials = db.user && db.password
const dbURI = hasCredentials
  ? `mongodb://${db.user}:${db.password}@${db.host}:${db.port}/${db.name}`
  : `mongodb://${db.host}:${db.port}/${db.name}`

mongoose.connect(dbURI).catch(err => console.error(err))

mongoose.connection.on("connected", () => {
  console.log(`Mongoose connected to ${db.host}:${db.port}/${db.name}`)
})

mongoose.connection.on("error", err => {
  console.error(`Mongoose connection error: ${err}`)
})

mongoose.connection.on("disconnected", () => {
  console.log("Mongoose disconnected")
})
