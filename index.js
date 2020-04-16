const express = require("express")
const server = express()
const cors = require("cors")
const postRouter = require("./routes/posts")

server.use(express.json())
server.use(cors())
server.use("/posts", postRouter)
server.use(errorHandler())

server.get("/", (req, res) => {
  res.status(200).json({ api: "running" })
})

function errorHandler() {
  return function (err, req, res, next) {
    err.code && err.message
      ? res.status(err.code).json({ error: err.message })
      : res.status(500).json({ error: "Something went wrong!" })
  }
}

const PORT = 5000
server.listen(PORT, () => console.log(`listening on port ${PORT}`))
