const service = require("../services/reminder.service")

exports.createReminder = async (req, res) => {
    const reminder = await service.createReminder(req.body, req.userId)
    res.status(201).json(reminder)
}

exports.getReminders = async (req, res) => {
    const reminders = await service.getReminders(req.userId)
    res.json(reminders)
}

exports.getUpcoming = async (req, res) => {
    const reminders = await service.getUpcomingReminders(req.userId)
    res.json(reminders)
}

exports.markAsPaid = async (req, res) => {
    const reminder = await service.markAsPaid(req.params.id, req.userId)
    res.json(reminder)
}

exports.deleteReminder = async (req, res) => {
    const reminder = await service.deleteReminder(req.params.id, req.userId)
    res.status(204).send()
}