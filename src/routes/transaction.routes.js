// Initialize
const express = require("express")
const router = express.Router()
const authMiddleware = require("../middlewares/auth.middleware")
const transactionController = require("../controllers/transaction.controller")

// Routes for transactions
router.post("/", authMiddleware, transactionController.createTransaction)
router.get("/", authMiddleware, transactionController.getTransactions)
router.put("/:id", authMiddleware, transactionController.updateTransaction)
router.delete("/:id", authMiddleware, transactionController.deleteTransaction)

// Route for
router.get("/summary", authMiddleware, transactionController.getSummary)

module.exports = router