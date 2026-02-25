// services/transaction.service.js
const { Prisma } = require("@prisma/client")
const prisma = require("../../lib/prisma")
const transactionCategoryService = require("./transactionCategory.service")

const ISO_DATE_ONLY_REGEX = /^\d{4}-\d{2}-\d{2}$/
const ISO_DATETIME_REGEX =
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/
const NUMERIC_STRING_REGEX = /^[+-]?(?:\d+\.?\d*|\.\d+)$/

const createBadRequestError = (message) => {
    const error = new Error(message)
    error.status = 400
    return error
}

const normalizeAmount = (rawAmount) => {
    if (rawAmount === undefined || rawAmount === null) {
        throw createBadRequestError("Amount is required")
    }

    let normalizedAmountString

    if (typeof rawAmount === "number") {
        if (!Number.isFinite(rawAmount)) {
            throw createBadRequestError("Amount must be a valid number")
        }
        normalizedAmountString = rawAmount.toString()
    } else if (typeof rawAmount === "string") {
        const trimmed = rawAmount.trim()
        if (!trimmed || !NUMERIC_STRING_REGEX.test(trimmed)) {
            throw createBadRequestError("Amount must be a valid number")
        }
        normalizedAmountString = trimmed
    } else {
        throw createBadRequestError("Amount must be a valid number")
    }

    const numericAmount = Number(normalizedAmountString)
    if (!Number.isFinite(numericAmount)) {
        throw createBadRequestError("Amount must be a valid number")
    }

    if (numericAmount <= 0) {
        throw createBadRequestError("Amount must be greater than 0")
    }

    return normalizedAmountString
}

const toPrismaAmount = (normalizedAmountString) => {
    if (Prisma.Decimal) {
        return new Prisma.Decimal(normalizedAmountString)
    }

    // Float fallback for schemas that still use Float
    const floatAmount = Number(normalizedAmountString)
    if (!Number.isFinite(floatAmount)) {
        throw createBadRequestError("Amount must be a valid number")
    }
    return floatAmount
}

const normalizeType = (rawType) => {
    if (typeof rawType !== "string") {
        throw createBadRequestError('Type must be either "income" or "expense"')
    }

    const normalizedType = rawType.trim()
    if (normalizedType !== "income" && normalizedType !== "expense") {
        throw createBadRequestError('Type must be either "income" or "expense"')
    }

    return normalizedType
}

const parseIsoDate = (rawDate) => {
    if (typeof rawDate !== "string") {
        throw createBadRequestError("Date must be a valid ISO date")
    }

    const dateString = rawDate.trim()

    if (ISO_DATE_ONLY_REGEX.test(dateString)) {
        const date = new Date(`${dateString}T00:00:00.000Z`)
        if (
            Number.isNaN(date.getTime()) ||
            date.toISOString().slice(0, 10) !== dateString
        ) {
            throw createBadRequestError("Date must be a valid ISO date")
        }
        return date
    }

    if (ISO_DATETIME_REGEX.test(dateString)) {
        const date = new Date(dateString)
        if (Number.isNaN(date.getTime())) {
            throw createBadRequestError("Date must be a valid ISO date")
        }
        return date
    }

    throw createBadRequestError("Date must be a valid ISO date")
}

const validateOptionalString = (value, fieldName) => {
    if (value === undefined) {
        return undefined
    }

    if (value === null) {
        return null
    }

    if (typeof value !== "string") {
        throw createBadRequestError(`${fieldName} must be a string`)
    }

    return value
}

const normalizeOptionalCategoryInput = (value) => {
    if (value === undefined || value === null) {
        return value
    }

    if (typeof value !== "string") {
        throw createBadRequestError("Category must be a string")
    }

    const normalized = value.trim()
    if (!normalized) {
        throw createBadRequestError("Category must be a non-empty string")
    }

    return normalized
}

const toNumber = (value) => {
    if (value === null || value === undefined) {
        return 0
    }
    if (typeof value === "number") {
        return value
    }
    if (typeof value === "object" && typeof value.toNumber === "function") {
        return value.toNumber()
    }
    return Number(value)
}

const buildCreateTransactionData = (data, userId) => {
    if (!data || typeof data !== "object") {
        throw createBadRequestError("Invalid request body")
    }

    if (typeof data.title !== "string" || !data.title.trim()) {
        throw createBadRequestError("Title is required")
    }

    const normalizedAmount = normalizeAmount(data.amount)
    const normalizedType = normalizeType(data.type)

    return {
        title: data.title.trim(),
        amount: toPrismaAmount(normalizedAmount),
        type: normalizedType,
        category: normalizeOptionalCategoryInput(data.category),
        date: data.date !== undefined ? parseIsoDate(data.date) : new Date(),
        note: validateOptionalString(data.note, "Note"),
        userId
    }
}

const buildUpdateTransactionData = (data) => {
    if (!data || typeof data !== "object") {
        throw createBadRequestError("Invalid request body")
    }

    const updateData = {}

    if (data.title !== undefined) {
        if (typeof data.title !== "string" || !data.title.trim()) {
            throw createBadRequestError("Title must be a non-empty string")
        }
        updateData.title = data.title.trim()
    }

    if (data.amount !== undefined) {
        const normalizedAmount = normalizeAmount(data.amount)
        updateData.amount = toPrismaAmount(normalizedAmount)
    }

    if (data.type !== undefined) {
        updateData.type = normalizeType(data.type)
    }

    if (data.category !== undefined) {
        updateData.category = normalizeOptionalCategoryInput(data.category)
    }

    if (data.date !== undefined) {
        updateData.date = parseIsoDate(data.date)
    }

    if (data.note !== undefined) {
        updateData.note = validateOptionalString(data.note, "Note")
    }

    return updateData
}

const applyCreateCategoryRule = async (createData, userId) => {
    if (createData.category === undefined || createData.category === null) {
        return createData
    }

    const resolvedCategory = await transactionCategoryService.resolveCategoryForType(
        userId,
        createData.type,
        createData.category
    )

    return {
        ...createData,
        category: resolvedCategory
    }
}

const applyUpdateCategoryRule = async (existingTransaction, updateData, userId) => {
    const resolvedType = updateData.type || existingTransaction.type
    const hasCategoryUpdate = Object.prototype.hasOwnProperty.call(
        updateData,
        "category"
    )

    if (hasCategoryUpdate) {
        if (updateData.category === null) {
            return updateData
        }

        const resolvedCategory = await transactionCategoryService.resolveCategoryForType(
            userId,
            resolvedType,
            updateData.category
        )

        return {
            ...updateData,
            category: resolvedCategory
        }
    }

    if (updateData.type !== undefined) {
        await transactionCategoryService.assertExistingCategoryStillValid(
            userId,
            resolvedType,
            existingTransaction.category
        )
    }

    return updateData
}

exports.createTransaction = async (data, userId) => {
    const createData = buildCreateTransactionData(data, userId)
    const createDataWithCategoryRule = await applyCreateCategoryRule(
        createData,
        userId
    )

    const transaction = await prisma.transaction.create({
        data: createDataWithCategoryRule
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

    const updateData = buildUpdateTransactionData(data)
    const updateDataWithCategoryRule = await applyUpdateCategoryRule(
        existing,
        updateData,
        userId
    )

    return prisma.transaction.update({
        where: {
            id,
        },
        data: updateDataWithCategoryRule
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

    const totalIncome = toNumber(income._sum.amount)
    const totalExpense = toNumber(expense._sum.amount)

    return { 
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense
    }
}

exports.__private = {
    normalizeAmount,
    normalizeType,
    parseIsoDate,
    toPrismaAmount,
    buildCreateTransactionData,
    buildUpdateTransactionData,
    normalizeOptionalCategoryInput
}
