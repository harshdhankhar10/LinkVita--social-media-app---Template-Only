import Post from "../models/postModel.js";
import slugify from "slugify";
import User from "../models/userModel.js";

export const createPost = async (req, res) =>{
    try {
        const {content, mediaUrl, hashtags, peopleTagged, location, visibility
            , isPostScheduled, scheduledTime, isCommentAllowed, isShareAllowed} = req.body;
        const userId = req.user.id;

        if (!content ) {
            return res.status(400).json({ success: false, message: "Please provide all required fields" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const post = new Post({
            userId,
            content,
            mediaUrl,
            hashtags,
            peopleTagged,
            location,
            visibility,
            isPostScheduled,
            scheduledTime,
            isCommentAllowed,
            isShareAllowed
        });
        
        await post.save();

        return res.status(201).json({ success: true, message: "Your post has been created successfully", post });

        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getPostsForUser = async (req, res) => {
    try {
        const {userName} = req.params;
        const user = await User.findOne({userName});
        const posts = await Post.find({userId: user._id}).populate("userId", "userName profilePicture fullName").sort({ createdAt: -1 });
        if (!posts) {
            return res.status(404).json({ success: false, message: "No posts found" });
        }
        return res.status(200).json({ success: true, posts });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const getPostDetails = async (req, res) => {
    try {
        const {id} = req.params;
        const post = await Post.findById(id).populate("userId", "userName profilePicture fullName").sort({ createdAt: -1 });
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }

        return res.status(200).json({ success: true, post });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}

export const likePost = async (req, res) =>{
    try {
        const { postId } = req.params;
        const userId = req.user.id; 
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        const isAlreadyLiked = post.likes.includes(userId);
        const user = await User.findById(userId);
        if (isAlreadyLiked) {
            post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
            await post.save();
            return res.status(200).json({ success: true, message: "Post unliked successfully", post, user });
        } else {
            post.likes.push(userId);
            await post.save();
            return res.status(200).json({ success: true, message: "Post liked successfully", post, user });
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something Went Wrong" });
    }
}

export const bookmarkPost = async (req, res) => {
    try {
        const { postId } = req.params;
        const userId = req.user.id; 
        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ success: false, message: "Post not found" });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const isAlreadyBookmarked = user.bookmarks.includes(postId);
        if (isAlreadyBookmarked) {
            user.bookmarks = user.bookmarks.filter((id) => id.toString() !== postId.toString());
            await user.save();
            return res.status(200).json({ success: true, message: "Post removed from bookmarks", user });
        } else {
            user.bookmarks.push(postId);
            await user.save();
            return res.status(200).json({ success: true, message: "Post bookmarked successfully", user });
        }
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Something Went Wrong" });
    }
}

// Get all my bookmarked posts

export const getBookmarkedPosts = async (req, res) => {
    try {
        const userId = req.user.id; 
        const user = await User.findById(userId).populate("bookmarks");
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        const posts = user.bookmarks;
        for (let i = 0; i < posts.length; i++) {
            posts[i] = await Post.findById(posts[i]._id).populate("userId", "userName profilePicture fullName");
        }
        if (!posts) {
            return res.status(404).json({ success: false, message: "No bookmarked posts found" });
        }
        return res.status(200).json({ success: true, posts });
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
}


