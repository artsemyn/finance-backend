// Initialize
const express = require("express")
const router = express.Router()
const authMiddleware = require("../middlewares/auth.middleware")
const transactionController = require("../controllers/transaction.controller")
const transactionCategoryController = require("../controllers/transactionCategory.controller")

// Routes for transactions
router.post("/", authMiddleware, transactionController.createTransaction)
router.get("/", authMiddleware, transactionController.getTransactions)
router.get("/categories", authMiddleware, transactionCategoryController.getCategories)
router.post("/categories", authMiddleware, transactionCategoryController.createCategory)
router.patch("/categories/:id", authMiddleware, transactionCategoryController.updateCategory)
router.put("/:id", authMiddleware, transactionController.updateTransaction)
router.delete("/:id", authMiddleware, transactionController.deleteTransaction)

// Route for
router.get("/summary", authMiddleware, transactionController.getSummary)

module.exports = router
