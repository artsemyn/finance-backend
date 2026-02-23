const prisma = require("../../lib/prisma")

exports.runAutoSavings = async (date = new Date()) => {
    const day = date.getDate()

    const goals = await prisma.savingsGoal.findMany({
        where: {
            autoSaveDay: day,
            monthlyAmount: {
                not: null
            }
        }
    })

    let updatedCount = 0

    for (const goal of goals) {
        const newAmount = goal.currentAmount + goal.monthlyAmount

        if (newAmount <= goal.targetAmount) {
            await prisma.savingsGoal.update({
                where: { id: goal.id },
                data: {
                    currentAmount: {
                        increment: goal.monthlyAmount
                    }
                }
            })
            updatedCount++
        }
    }

    return {
        day,
        processedGoals: goals.length,
        updatedGoals: updatedCount
    }
}
