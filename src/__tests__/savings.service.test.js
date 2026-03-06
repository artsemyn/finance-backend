jest.mock("../../lib/prisma", () => ({
    savingsGoal: {
        create: jest.fn(),
        findMany: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
        delete: jest.fn()
    }
}))

const prisma = require("../../lib/prisma")
const savingsService = require("../services/savings.service")

describe("savings.service", () => {
    const userId = "user-1"

    beforeEach(() => {
        jest.clearAllMocks()
    })

    test("createGoal requires title and targetAmount", async () => {
        await expect(
            savingsService.createGoal(
                {
                    targetAmount: 1000000
                },
                userId
            )
        ).rejects.toMatchObject({
            status: 400,
            message: "Title and target amount are required"
        })
    })

    test("createGoal allows optional deadline", async () => {
        prisma.savingsGoal.create.mockResolvedValue({ id: "goal-1" })

        await savingsService.createGoal(
            {
                title: "Emergency Fund",
                targetAmount: 1000000
            },
            userId
        )

        expect(prisma.savingsGoal.create).toHaveBeenCalledWith({
            data: expect.objectContaining({
                title: "Emergency Fund",
                targetAmount: 1000000,
                deadline: null,
                userId
            })
        })
    })

    test("createGoal rejects invalid deadline", async () => {
        await expect(
            savingsService.createGoal(
                {
                    title: "Emergency Fund",
                    targetAmount: 1000000,
                    deadline: "not-a-date"
                },
                userId
            )
        ).rejects.toMatchObject({
            status: 400,
            message: "deadline must be a valid date"
        })
    })

    test("createGoal enforces autoSaveDay range", async () => {
        await expect(
            savingsService.createGoal(
                {
                    title: "Emergency Fund",
                    targetAmount: 1000000,
                    autoSaveDay: 31
                },
                userId
            )
        ).rejects.toMatchObject({
            status: 400,
            message: "autoSaveDay must be between 1 and 28"
        })
    })

    test("getGoals returns user goals sorted by createdAt desc", async () => {
        prisma.savingsGoal.findMany.mockResolvedValue([{ id: "goal-1" }])

        const result = await savingsService.getGoals(userId)

        expect(result).toEqual([{ id: "goal-1" }])
        expect(prisma.savingsGoal.findMany).toHaveBeenCalledWith({
            where: { userId },
            orderBy: { createdAt: "desc" }
        })
    })

    test("updateGoalProgress rejects non-number amount", async () => {
        await expect(
            savingsService.updateGoalProgress("goal-1", "1000", userId)
        ).rejects.toMatchObject({
            status: 400,
            message: "Amount must be a number"
        })
    })

    test("updateGoalProgress rejects missing goal", async () => {
        prisma.savingsGoal.findFirst.mockResolvedValue(null)

        await expect(
            savingsService.updateGoalProgress("goal-1", 1000, userId)
        ).rejects.toMatchObject({
            status: 404,
            message: "Saving goal not found"
        })
    })

    test("updateGoalProgress rejects negative resulting amount", async () => {
        prisma.savingsGoal.findFirst.mockResolvedValue({
            id: "goal-1",
            currentAmount: 500,
            targetAmount: 1000
        })

        await expect(
            savingsService.updateGoalProgress("goal-1", -600, userId)
        ).rejects.toMatchObject({
            status: 400,
            message: "Current amount cannot be negative"
        })
    })

    test("updateGoalProgress rejects amount exceeding target", async () => {
        prisma.savingsGoal.findFirst.mockResolvedValue({
            id: "goal-1",
            currentAmount: 900,
            targetAmount: 1000
        })

        await expect(
            savingsService.updateGoalProgress("goal-1", 200, userId)
        ).rejects.toMatchObject({
            status: 400,
            message: "Current amount cannot exceed target amount"
        })
    })

    test("updateGoalProgress updates currentAmount when valid", async () => {
        prisma.savingsGoal.findFirst.mockResolvedValue({
            id: "goal-1",
            currentAmount: 300,
            targetAmount: 1000
        })
        prisma.savingsGoal.update.mockResolvedValue({
            id: "goal-1",
            currentAmount: 500
        })

        const updated = await savingsService.updateGoalProgress("goal-1", 200, userId)

        expect(updated).toEqual({
            id: "goal-1",
            currentAmount: 500
        })
        expect(prisma.savingsGoal.update).toHaveBeenCalledWith({
            where: { id: "goal-1" },
            data: { currentAmount: 500 }
        })
    })

    test("deleteGoal rejects missing goal", async () => {
        prisma.savingsGoal.findFirst.mockResolvedValue(null)

        await expect(
            savingsService.deleteGoal("goal-1", userId)
        ).rejects.toMatchObject({
            status: 404,
            message: "Saving goal not found"
        })
    })
})
