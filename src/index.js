require("dotenv").config()
require("./jobs/autoSavings.job")

//Initialize
const express = require("express")
const cors = require("cors")
const errorHandler = require("./middlewares/error.middleware")
const PORT = Number(process.env.PORT) || 3000

//Server Instance
const app = express()

//Middleware & Parse JSON
app.use(cors())
app.use(express.json())

// Health checks for platform probes
app.get("/", (req, res) => {
    res.status(200).json({ status: "ok" })
})

app.get("/health", (req, res) => {
    res.status(200).json({ status: "ok" })
})

//Route
app.use("/auth", require("./routes/auth.routes"))
app.use("/transactions", require("./routes/transaction.routes"))
app.use("/savings", require("./routes/savings.routes"))
app.use("/reminders", require("./routes/reminder.routes"))
app.use(errorHandler)

//Running server from response
app.listen(PORT, () =>{
    console.log(`Server running on port ${PORT}`)
})
