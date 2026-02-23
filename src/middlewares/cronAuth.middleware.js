module.exports = (req, res, next) => {
    const expectedSecret = process.env.CRON_SECRET

    if (!expectedSecret) {
        return res.status(500).json({ error: "CRON_SECRET is not configured" })
    }

    const authHeader = req.headers.authorization || ""
    const bearerToken = authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null
    const providedSecret = bearerToken || req.headers["x-cron-secret"]

    if (providedSecret !== expectedSecret) {
        return res.status(401).json({ error: "Unauthorized cron request" })
    }

    next()
}
