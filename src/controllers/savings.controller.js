const service = require("../services/savings.service")

exports.createGoal = async (req, res) => {
    const goal = await service.createGoal(req.body, req.userId)
    res.status(201).json(goal)
}

exports.getGoals = async (req, res) => {
    const goals = await service.getGoals(req.userId)
    res.json(goals)
}

exports.updateGoalProgress = async (req, res) => {
    const goal = await service.updateGoalProgress(
        req.params.id, 
        req.body.amount, 
        req.userId)
    res.json(goal)
}

exports.deleteGoal = async (req, res) => {
    await service.deleteGoal(req.params.id, req.userId)
    res.status(204).send()
}

