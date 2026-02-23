// Initialize
const express = require('express')
const router = express.Router()
const controller = require('../controllers/reminder.controller')
const authMiddleware = require('../middlewares/auth.middleware')
const asyncHandler = require('../middlewares/asyncHandler')

// Routes
router.post('/', authMiddleware, asyncHandler(controller.createReminder))
router.get('/', authMiddleware, asyncHandler(controller.getReminders))
router.get('/upcoming', authMiddleware, asyncHandler(controller.getUpcoming))
router.put('/:id/paid', authMiddleware, asyncHandler(controller.markAsPaid))
router.delete('/:id', authMiddleware, asyncHandler(controller.deleteReminder))

module.exports = router
