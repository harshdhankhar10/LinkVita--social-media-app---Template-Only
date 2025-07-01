import express from "express"
const router = express.Router()

import {createComment, getCommentsForPost, likeComment, unlikeComment} from "../controllers/commentController.js"
import {requireSignIn} from "../middleware/authMiddleware.js"

router.post("/create", requireSignIn, createComment)
router.get("/:postId", getCommentsForPost)
router.post("/like/:commentId", requireSignIn, likeComment)
router.post("/unlike/:commentId", requireSignIn, unlikeComment)


export default router