import Comment from "../models/commentModel.js";
import Post from "../models/postModel.js";
import User from "../models/userModel.js";


export async function createComment(req, res) {
    const { postId, content } = req.body;
    const userId = req.user.id;
    try {
        if (!postId || !content) {
            return res.status(400).json({ message: "Post ID and content are required" });
        }
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: "Post not found" });
        }
        const comment = new Comment({ userId, postId, content });
        await comment.save();


        res.status(201).json({success: true, message: "Comment created successfully", comment });
    } catch (error) {
        res.status(500).json({success: false, message: "Internal Server error", error: error.message });
    } 
}

export async function getCommentsForPost(req, res) {
    const { postId } = req.params;
    try {
        if (!postId) {
            return res.status(400).json({ message: "Post ID is required" });
        }
        const comments = await Comment.find({ postId }).populate("userId", "userName profilePicture").sort({ createdAt: -1 });
        res.status(200).json({success: true, comments });
    } catch (error) {
        res.status(500).json({success: false, message: "Internal Server error", error: error.message });
    } 
}

export const likeComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    try {
        if (!commentId) {
            return res.status(400).json({ message: "Comment ID is required" });
        }
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        if (comment.likes.includes(userId)) {
            return res.status(400).json({ message: "You have already liked this comment" });
        }
        comment.likes.push(userId);

        await comment.save();

        res.status(200).json({success: true, message: "Comment liked successfully", comment });
    } catch (error) {
        res.status(500).json({success: false, message: "Internal Server error", error: error.message });
    } 
}

export const unlikeComment = async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user.id;
    try {
        if (!commentId) {
            return res.status(400).json({ message: "Comment ID is required" });
        }
        const comment = await Comment.findById(commentId);
        if (!comment) {
            return res.status(404).json({ message: "Comment not found" });
        }
        if (!comment.likes.includes(userId)) {
            return res.status(400).json({ message: "You have not liked this comment yet" });
        }
        comment.likes = comment.likes.filter((like) => like.toString() !== userId.toString());
        comment.dislikes.push(userId); 
        await comment.save();
        res.status(200).json({success: true, message: "Comment unliked successfully", comment });
    } catch (error) {
        res.status(500).json({success: false, message: "Internal Server error", error: error.message });
    } 
}

