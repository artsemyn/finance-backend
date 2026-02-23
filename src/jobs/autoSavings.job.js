const cron = require("node-cron")
const autoSavingsService = require("../services/autoSavings.service")

cron.schedule("0 0 * * *", async () => {
    console.log("Running auto savings job...")

    try {
        const result = await autoSavingsService.runAutoSavings()
        console.log("Auto savings job finished", result)
    } catch (error) {
        console.error("Auto savings job failed", error)
    }
})
