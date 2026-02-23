const autoSavingsService = require("../services/autoSavings.service")

exports.runAutoSavings = async (req, res) => {
    const result = await autoSavingsService.runAutoSavings()
    res.status(200).json({
        message: "Auto savings executed",
        ...result
    })
}
