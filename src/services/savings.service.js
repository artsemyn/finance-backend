const prisma = require('../../lib/prisma')

exports.createGoal = async (data, userId) => {
    if (!data.title || data.targetAmount === undefined || data.targetAmount === null) {
        const error = new Error('Title and target amount are required')
        error.status = 400
        throw error
    }

    if (data.autoSaveDay !== undefined && data.autoSaveDay !== null && (data.autoSaveDay < 1 || data.autoSaveDay > 28)) {
    const error = new Error("autoSaveDay must be between 1 and 28")
    error.status = 400
    throw error
    }

    let parsedDeadline = null
    if (data.deadline !== undefined && data.deadline !== null && data.deadline !== "") {
        parsedDeadline = new Date(data.deadline)
        if (Number.isNaN(parsedDeadline.getTime())) {
            const error = new Error("deadline must be a valid date")
            error.status = 400
            throw error
        }
    }

    return prisma.savingsGoal.create({
        data:
        {
            ...data,
            deadline: parsedDeadline,
            userId,
        }
    })
}

exports.getGoals = async (userId) => {
    return prisma.savingsGoal.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    })
}

exports.updateGoalProgress = async (id, amount, userId) => {

    if(typeof amount !== 'number' ) {
        const error = new Error('Amount must be a number')
        error.status = 400
        throw error
    }

    const goal = await prisma.savingsGoal.findFirst({
        where: { id, userId },
    })

    if (!goal) {
        const error = new Error('Saving goal not found')
        error.status = 404
        throw error
    }

    const newAmount = goal.currentAmount + amount
    if (newAmount < 0) {
        const error = new Error('Current amount cannot be negative')
        error.status = 400
        throw error
    }

    if (newAmount > goal.targetAmount) {
        const error = new Error('Current amount cannot exceed target amount')
        error.status = 400
        throw error
    }
    
    return prisma.savingsGoal.update({
        where: { id },
        data: {
            currentAmount: newAmount,
        }
    })
}

exports.deleteGoal = async (id, userId) => {
    const goal = await prisma.savingsGoal.findFirst({
        where: { id, userId },
    })

    if (!goal) {
        const error = new Error('Saving goal not found')
        error.status = 404
        throw error
    }

    return prisma.savingsGoal.delete({
        where: { id },
    })
}
