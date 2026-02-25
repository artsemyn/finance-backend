jest.mock("../../lib/prisma", () => ({
    transaction: {
        create: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        aggregate: jest.fn()
    },
    transactionCategory: {
        findFirst: jest.fn()
    }
}))

const prisma = require("../../lib/prisma")
const transactionService = require("../services/transaction.service")

describe("transaction.service create/update validation", () => {
    const userId = "user-1"

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test("accepts numeric amount", async () => {
        prisma.transaction.create.mockResolvedValue({ id: "tx-1" })

        await transactionService.createTransaction(
            {
                title: "Salary",
                amount: 1200.5,
                type: "income",
                date: "2026-02-01"
            },
            userId
        )

        const createCallData = prisma.transaction.create.mock.calls[0][0].data
        expect(createCallData.amount.toString()).toBe("1200.5")
    })

    test("accepts numeric string amount", async () => {
        prisma.transaction.create.mockResolvedValue({ id: "tx-2" })

        await transactionService.createTransaction(
            {
                title: "Groceries",
                amount: "250.75",
                type: "expense",
                date: "2026-02-02"
            },
            userId
        )

        const createCallData = prisma.transaction.create.mock.calls[0][0].data
        expect(createCallData.amount.toString()).toBe("250.75")
    })

    test("rejects invalid amount", async () => {
        await expect(
            transactionService.createTransaction(
                {
                    title: "Bad amount",
                    amount: "abc",
                    type: "income",
                    date: "2026-02-03"
                },
                userId
            )
        ).rejects.toMatchObject({
            status: 400,
            message: "Amount must be a valid number"
        })
    })

    test("rejects zero or negative amount", async () => {
        await expect(
            transactionService.createTransaction(
                {
                    title: "Zero amount",
                    amount: 0,
                    type: "income",
                    date: "2026-02-03"
                },
                userId
            )
        ).rejects.toMatchObject({
            status: 400,
            message: "Amount must be greater than 0"
        })

        await expect(
            transactionService.createTransaction(
                {
                    title: "Negative amount",
                    amount: -10,
                    type: "expense",
                    date: "2026-02-03"
                },
                userId
            )
        ).rejects.toMatchObject({
            status: 400,
            message: "Amount must be greater than 0"
        })
    })

    test("rejects invalid type and invalid date", async () => {
        await expect(
            transactionService.createTransaction(
                {
                    title: "Bad type",
                    amount: 10,
                    type: "transfer",
                    date: "2026-02-03"
                },
                userId
            )
        ).rejects.toMatchObject({
            status: 400,
            message: 'Type must be either "income" or "expense"'
        })

        await expect(
            transactionService.createTransaction(
                {
                    title: "Bad date",
                    amount: 10,
                    type: "expense",
                    date: "2026-02-30"
                },
                userId
            )
        ).rejects.toMatchObject({
            status: 400,
            message: "Date must be a valid ISO date"
        })
    })

    test("rejects invalid category for transaction type", async () => {
        prisma.transactionCategory.findFirst.mockResolvedValue(null)

        await expect(
            transactionService.createTransaction(
                {
                    title: "Bad category",
                    amount: 10,
                    type: "income",
                    category: "Food",
                    date: "2026-02-03"
                },
                userId
            )
        ).rejects.toMatchObject({
            status: 400,
            message: "Invalid category for transaction type"
        })
    })
})
