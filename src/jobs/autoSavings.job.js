const cron = require("node-cron")
const prisma = require("../../lib/prisma")

cron.schedule("0 0 * * *", async () => {
    console.log("Running auto savings job...")

    const today = new Date()
    const day = today.getDate()

    const goals = await prisma.savingsGoal.findMany({
        where: {
            autoSaveDay: day,
            monthlyAmount: {
                not: null
            }
        }
    })

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
        }
    }

    console.log("Auto savings job finished")
})