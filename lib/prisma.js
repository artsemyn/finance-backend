const { PrismaClient } = require("@prisma/client")
const { PrismaPg } = require("@prisma/adapter-pg")
const { Pool } = require("pg")

const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error("DATABASE_URL is required to initialize Prisma")
}

const adapter = new PrismaPg(new Pool({ connectionString }))
const prisma = new PrismaClient({ adapter })

module.exports = prisma
