const prisma = require("../../lib/prisma")

const VALID_TYPES = new Set(["income", "expense"])

const createError = (message, status = 400) => {
    const error = new Error(message)
    error.status = status
    return error
}

const normalizeType = (rawType) => {
    if (typeof rawType !== "string") {
        throw createError('Type must be either "income" or "expense"', 400)
    }

    const normalizedType = rawType.trim()
    if (!VALID_TYPES.has(normalizedType)) {
        throw createError('Type must be either "income" or "expense"', 400)
    }

    return normalizedType
}

const normalizeCategoryName = (rawName) => {
    if (typeof rawName !== "string") {
        throw createError("Category must be a string", 400)
    }

    const normalized = rawName.trim().replace(/\s+/g, " ")
    if (!normalized) {
        throw createError("Category must be a non-empty string", 400)
    }

    if (normalized.length > 50) {
        throw createError("Category must be 50 characters or fewer", 400)
    }

    return normalized
}

const getCategoryScopeFilter = (userId) => ({
    OR: [
        { userId: null },
        { userId }
    ]
})

const findMatchingCategory = async (userId, type, name, excludeId) => {
    return prisma.transactionCategory.findFirst({
        where: {
            ...getCategoryScopeFilter(userId),
            type,
            isActive: true,
            ...(excludeId ? { id: { not: excludeId } } : {}),
            name: {
                equals: name,
                mode: "insensitive"
            }
        }
    })
}

const mapCategory = (category) => ({
    id: category.id,
    name: category.name,
    type: category.type,
    isDefault: category.userId === null
})

exports.getCategories = async (userId) => {
    const categories = await prisma.transactionCategory.findMany({
        where: {
            ...getCategoryScopeFilter(userId),
            isActive: true,
            type: {
                in: ["income", "expense"]
            }
        },
        orderBy: [
            { type: "asc" },
            { name: "asc" }
        ]
    })

    const grouped = {
        income: [],
        expense: []
    }

    for (const category of categories) {
        if (category.type === "income" || category.type === "expense") {
            grouped[category.type].push(mapCategory(category))
        }
    }

    return grouped
}

exports.createCategory = async (payload, userId) => {
    if (!payload || typeof payload !== "object") {
        throw createError("Invalid request body", 400)
    }

    const type = normalizeType(payload.type)
    const name = normalizeCategoryName(payload.name)

    const duplicate = await findMatchingCategory(userId, type, name)
    if (duplicate) {
        throw createError("Category already exists", 409)
    }

    const category = await prisma.transactionCategory.create({
        data: {
            name,
            type,
            userId
        }
    })

    return mapCategory(category)
}

exports.updateCategory = async (id, payload, userId) => {
    if (!payload || typeof payload !== "object") {
        throw createError("Invalid request body", 400)
    }

    const existing = await prisma.transactionCategory.findFirst({
        where: { id }
    })

    if (!existing) {
        throw createError("Category not found", 404)
    }

    if (existing.userId === null) {
        throw createError("Cannot modify default category", 403)
    }

    if (existing.userId !== userId) {
        throw createError("Category not found", 404)
    }

    const data = {}

    if (payload.name !== undefined) {
        const normalizedName = normalizeCategoryName(payload.name)
        const duplicate = await findMatchingCategory(
            userId,
            existing.type,
            normalizedName,
            existing.id
        )
        if (duplicate) {
            throw createError("Category already exists", 409)
        }
        data.name = normalizedName
    }

    if (payload.isActive !== undefined) {
        if (typeof payload.isActive !== "boolean") {
            throw createError("isActive must be a boolean", 400)
        }
        data.isActive = payload.isActive
    }

    if (Object.keys(data).length === 0) {
        throw createError("No fields to update", 400)
    }

    const updated = await prisma.transactionCategory.update({
        where: { id },
        data
    })

    return mapCategory(updated)
}

exports.resolveCategoryForType = async (userId, type, rawCategory) => {
    if (rawCategory === undefined) {
        return undefined
    }

    if (rawCategory === null) {
        return null
    }

    const name = normalizeCategoryName(rawCategory)

    const existing = await prisma.transactionCategory.findFirst({
        where: {
            ...getCategoryScopeFilter(userId),
            isActive: true,
            type,
            name: {
                equals: name,
                mode: "insensitive"
            }
        }
    })

    if (!existing) {
        throw createError("Invalid category for transaction type", 400)
    }

    return existing.name
}

exports.assertExistingCategoryStillValid = async (userId, type, category) => {
    if (!category) {
        return
    }

    const existing = await prisma.transactionCategory.findFirst({
        where: {
            ...getCategoryScopeFilter(userId),
            isActive: true,
            type,
            name: {
                equals: category,
                mode: "insensitive"
            }
        }
    })

    if (!existing) {
        throw createError(
            "Existing category is invalid for updated type",
            400
        )
    }
}

exports.__private = {
    normalizeType,
    normalizeCategoryName
}
