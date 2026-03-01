require("dotenv").config()

if (!process.env.VERCEL) {
    require("./jobs/autoSavings.job")
}

const express = require("express")
const cors = require("cors")
const errorHandler = require("./middlewares/error.middleware")

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req, res) => {
    res.status(200).json({ status: "ok" })
})

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

app.use("/auth", require("./routes/auth.routes"))
app.use("/transactions", require("./routes/transaction.routes"))
app.use("/savings", require("./routes/savings.routes"))
app.use("/reminders", require("./routes/reminder.routes"))
app.use("/internal", require("./routes/internal.routes"))
app.use(errorHandler)

module.exports = app
