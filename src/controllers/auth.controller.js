// Initialize
const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const prisma = require("../../lib/prisma")

// Controllers Register
exports.register = async (req, res) => {
    const { email, password } = req.body

    // Make user and check if exists
    try {
        const hashedPassword = await bcrypt.hash(password, 10)
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword
            }
        })

        res.json({ message: "User created", user })
    } catch (error) {
        res.status(400).json({ error: "User already exists"})
    }
}

// Controllers Login
exports.login = async (req, res) => {
    const { email, password } = req.body

    // Find user and check password
    const user = await prisma.user.findUnique({
        where: { email }
    })

    if (!user) {
        return res.status(401).json({ error: "User not found" })
    }

    const valid = await bcrypt.compare(password, user.password)

    if (!valid) {
        return res.status(401).json({ error: "Invalid password" })
    }

    // Generate JWT
    const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    )
    res.json({ token })
}

// Controllers Me
exports.me = async (req, res) => {
    const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
            id: true,
            email: true,
            createdAt: true
        }
    })
    res.json(user)
}