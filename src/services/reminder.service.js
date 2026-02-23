const prisma = require("../../lib/prisma")

exports.createReminder = async (data, userId) => {
    if (!data.title || data.amount == null || !data.dueDate || !data.type) {
            const error = new Error("Missing required fields")
            error.status = 400
            throw error
    }

    const parsedAmount = Number(data.amount)
    if (Number.isNaN(parsedAmount)) {
        const error = new Error("amount must be a number")
        error.status = 400
        throw error
    }

    const parsedDueDate = new Date(data.dueDate)
    if (Number.isNaN(parsedDueDate.getTime())) {
        const error = new Error("dueDate is invalid")
        error.status = 400
        throw error
    }

    return prisma.reminder.create({
        data: {
            ...data,
            amount: parsedAmount,
            dueDate: parsedDueDate,
            userId
        }
    })
}

exports.getReminders = async (userId) => {
    return prisma.reminder.findMany({
        where: { userId },
        orderBy: { dueDate: "asc" }
    })
}

exports.getUpcomingReminders = async (userId) => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)

    return prisma.reminder.findMany({
        where: {
            userId,
            isPaid: false,
            dueDate: {
                lte: tomorrow
            }
        },
        orderBy: {
            dueDate: "asc"
        }
    })
}

exports.markAsPaid = async (id, userId) => {
    const reminder = await prisma.reminder.findFirst({
        where: { id, userId },
    })

    if (!reminder) {
        const error = new Error("Reminder not found")
        error.status = 404
        throw error
    }

    return prisma.reminder.update({
        where: { id },
        data: { isPaid: true }
    })
}

exports.deleteReminder = async (id, userId) => {
    return prisma.reminder.deleteMany({
        where: { id, userId }
    })
}
