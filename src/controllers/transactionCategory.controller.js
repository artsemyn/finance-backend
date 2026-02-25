const transactionCategoryService = require("../services/transactionCategory.service")

exports.getCategories = async (req, res) => {
    const categories = await transactionCategoryService.getCategories(req.userId)
    res.json(categories)
}

exports.createCategory = async (req, res) => {
    const category = await transactionCategoryService.createCategory(
        req.body,
        req.userId
    )
    res.status(201).json(category)
}

exports.updateCategory = async (req, res) => {
    const category = await transactionCategoryService.updateCategory(
        req.params.id,
        req.body,
        req.userId
    )
    res.json(category)
}
