// Intialize
const express = require("express")
const router = express.Router()
const controller = require("../controllers/savings.controller")
const authMiddleware = require("../middlewares/auth.middleware")
const asyncHandler = require("../middlewares/asyncHandler")

// Routes
router.post("/", authMiddleware, asyncHandler(controller.createGoal))
router.get("/", authMiddleware, asyncHandler(controller.getGoals))
router.put("/:id/progress", authMiddleware, asyncHandler(controller.updateGoalProgress))
router.delete("/:id", authMiddleware, asyncHandler(controller.deleteGoal))

module.exports = router
