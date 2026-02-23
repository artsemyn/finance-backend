const express = require("express")
const router = express.Router()
const internalController = require("../controllers/internal.controller")
const cronAuth = require("../middlewares/cronAuth.middleware")
const asyncHandler = require("../middlewares/asyncHandler")

router.get("/auto-savings/run", cronAuth, asyncHandler(internalController.runAutoSavings))

module.exports = router
