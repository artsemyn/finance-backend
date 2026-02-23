// services/transaction.service.js
const prisma = require("../../lib/prisma")

exports.createTransaction = async (data, userId) => {
    if (!data.type || !data.amount || !data.type) {
        const error = new Error("Missing required fields")
        error.status = 400
        throw error
    }

    const transaction = await prisma.transaction.create({
        data: {
            ...data,
            date: data.date ? new Date(data.date) : new Date(),
            userId
        }
    })
    return transaction
}

exports.getTransactions = async (userId) => {
    return prisma.transaction.findMany({
        where: { userId },
        orderBy: { date: "desc" }
    })
}

exports.updateTransaction = async (id, data, userId) => {
    const existing = await prisma.transaction.findFirst({
        where: {
            id,
            userId
        }
    })

    if (!existing) {
        const error = new Error("Transaction not found")
        error.status = 404
        throw error
    }

    return prisma.transaction.update({
        where: {
            id,
        },        
        data: {
            ...data,
            date: data.date ? new Date(data.date) : undefined
        }
    })
}

exports.deleteTransaction = async (id, userId) => {
    const existing = await prisma.transaction.findFirst({
        where: {
            id,
            userId
        }
    })

    if (!existing) {
        const error = new Error("Transaction not found")
        error.status = 404
        throw error
    }
    return prisma.transaction.deleteMany({
        where: {
            id,
        }
    })
}

exports.getSummary = async (userId, month) => {
    const startDate = month
        ? new Date(`${month}-01`)
        : new Date(new Date().getFullYear(), new Date().getMonth(), 1)
    
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + 1)

    const income = await prisma.transaction.aggregate({
            _sum: {
                amount: true
            },
        where: {
            userId,
            type: "income",
            date: {
                gte: startDate,
                lt: endDate
            }
        }
    })

    const expense = await prisma.transaction.aggregate({
        _sum: {
            amount: true
        },
        where: {
            userId,
            type: "expense",
            date: {
                gte: startDate,
                lt: endDate
            }
        }
    })

    return { 
        totalIncome: income._sum.amount || 0,
        totalExpense: expense._sum.amount || 0,
        balance: (income._sum.amount || 0) - (expense._sum.amount || 0)
    }
}