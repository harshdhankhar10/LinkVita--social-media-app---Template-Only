import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
    },
    content: {
        type: String,
        required: true,
    },
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }],
}, {
    timestamps: true
})

const Comment = mongoose.model("Comment", commentSchema)
export default Comment