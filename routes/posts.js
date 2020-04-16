const express = require("express")
const posts = express.Router()

const db = require("../data/db")

// General Posts

posts
  .route("/")
  .get(async (req, res, next) => {
    try {
      const posts = await db.find()

      posts.length > 0
        ? res.status(200).json(posts)
        : next({
            code: 500,
            message: "The posts information could not be retrieved",
          })
    } catch (error) {
      next(error)
    }
  })
  .post(validatePost(), async (req, res, next) => {
    try {
      const newPost = await db.insert(req.body)

      newPost
        ? res.status(200).json(newPost)
        : next({
            code: 500,
            message: "There was an error while saving post to the database",
          })
    } catch (error) {
      next(error)
    }
  })

// Posts By ID

posts
  .route("/:id")
  .get(validatePostID(), async (req, res, next) => {
    try {
      const post = await db.findById(req.params.id)
      post.length
        ? res.status(200).json(post)
        : next({
            code: 400,
            message: "Could not find post with specified ID",
          })
    } catch (error) {
      next(error)
    }
  })
  .delete(validatePostID(), async (req, res) => {
    try {
      await db.remove(req.params.id)
      res.status(200).json({ message: "Post has been removed" })
    } catch (error) {
      next({ code: 400, message: "Failed to remove post. Try again later." })
    }
  })

// Comments

posts
  .route("/:id/comments")
  .get(validatePostID(), async (req, res, next) => {
    try {
      const comments = await db.findPostComments(req.params.id)

      comments.length
        ? res.status(200).json(comments)
        : next({
            code: 400,
            message: "Post does not have comments",
          })
    } catch (error) {
      next(error)
    }
  })
  .post(validatePostID(), validateComment(), async (req, res) => {
    res.status(201).json(req.comment)
  })

// Middleware

function validatePost() {
  return function (req, res, next) {
    req.body.title && req.body.contents
      ? next()
      : next({
          code: 400,
          message: "Please provide title and contents for the post",
        })
  }
}

function validatePostID() {
  return async function (req, res, next) {
    try {
      const post = await db.findById(req.params.id)

      post.length > 0
        ? next()
        : res.status(400).json({ message: "Post does not exist" })
    } catch (error) {
      next(error)
    }
  }
}

function validateComment() {
  return async function (req, res, next) {
    if (req.body.text) {
      const comment = { text: req.body.text, post_id: req.params.id }
      db.insertComment(comment)
      req.comment = comment
      next()
    } else {
      next({ code: 400, message: "Please include text for the comment" })
    }
  }
}

module.exports = posts
