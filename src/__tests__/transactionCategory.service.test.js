jest.mock("../../lib/prisma", () => ({
    transactionCategory: {
        findMany: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn()
    }
}))

const prisma = require("../../lib/prisma")
const service = require("../services/transactionCategory.service")

describe("transactionCategory.service", () => {
    const userId = "user-1"

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test("returns grouped categories (global + user)", async () => {
        prisma.transactionCategory.findMany.mockResolvedValue([
            { id: "1", name: "Salary", type: "income", userId: null },
            { id: "2", name: "Food", type: "expense", userId: null },
            { id: "3", name: "Bonus+", type: "income", userId }
        ])

        const grouped = await service.getCategories(userId)

        expect(grouped.income).toHaveLength(2)
        expect(grouped.expense).toHaveLength(1)
        expect(grouped.income[0]).toEqual(
            expect.objectContaining({ isDefault: true })
        )
        expect(grouped.income[1]).toEqual(
            expect.objectContaining({ isDefault: false })
        )
    })

    test("creates user category", async () => {
        prisma.transactionCategory.findFirst.mockResolvedValue(null)
        prisma.transactionCategory.create.mockResolvedValue({
            id: "cat-1",
            name: "Side Hustle",
            type: "income",
            userId
        })

        const created = await service.createCategory(
            { name: "Side Hustle", type: "income" },
            userId
        )

        expect(created).toEqual({
            id: "cat-1",
            name: "Side Hustle",
            type: "income",
            isDefault: false
        })
    })

    test("rejects duplicate category", async () => {
        prisma.transactionCategory.findFirst.mockResolvedValue({
            id: "existing"
        })

        await expect(
            service.createCategory({ name: "Food", type: "expense" }, userId)
        ).rejects.toMatchObject({
            status: 409,
            message: "Category already exists"
        })
    })

    test("rejects modification of default category", async () => {
        prisma.transactionCategory.findFirst.mockResolvedValue({
            id: "default-expense-food",
            type: "expense",
            userId: null
        })

        await expect(
            service.updateCategory(
                "default-expense-food",
                { name: "Dining" },
                userId
            )
        ).rejects.toMatchObject({
            status: 403,
            message: "Cannot modify default category"
        })
    })

    test("validates transaction category by type", async () => {
        prisma.transactionCategory.findFirst.mockResolvedValue({
            id: "cat-1",
            name: "Food",
            type: "expense",
            userId: null
        })

        const resolved = await service.resolveCategoryForType(
            userId,
            "expense",
            " food "
        )

        expect(resolved).toBe("Food")
    })
})
