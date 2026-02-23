// controllers/transaction.controller.js

const transactionService = require("../services/transaction.service")

exports.createTransaction = async (req, res) => {
    const transaction = await transactionService.createTransaction(
        req.body,
        req.userId
    )
    res.status(201).json(transaction)
}

exports.getTransactions = async (req, res) => {
    const transactions = await transactionService.getTransactions(
        req.userId
    )
    res.json(transactions)
}

exports.updateTransaction = async (req, res) => {
    const transaction = await transactionService.updateTransaction(
        req.params.id,
        req.body,
        req.userId
    )
    res.json(transaction)
}

// Controllers Delete Transaction
exports.deleteTransaction = async (req, res) => {
    await transactionService.deleteTransaction(
        req.params.id,
        req.userId
    )
    res.status(204).send()
    return
}

// Controllers Get Summary
exports.getSummary = async (req, res) => {
    const summary = await transactionService.getSummary(
        req.userId,
        req.query.month
    )
    res.json(summary)
}