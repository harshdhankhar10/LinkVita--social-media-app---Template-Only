import express from 'express';
const router = express.Router();

import {createPost, getPostsForUser, getPostDetails, bookmarkPost, likePost, getBookmarkedPosts} from "../controllers/postController.js";
import {requireSignIn} from "../middleware/authMiddleware.js";


router.post('/create', requireSignIn, createPost);
router.get('/user/:userName', getPostsForUser);
router.get('/my-bookmarks', requireSignIn, getBookmarkedPosts);
router.get('/:id', getPostDetails);
router.post('/like/:postId', requireSignIn, likePost);
router.post('/bookmark/:postId', requireSignIn, bookmarkPost);


export default router;