import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: { type: String, required: true },
    mediaUrl: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    // shares: [{ type: mongoose.Schema.Types.ObjectId, ref: "Share" }],
    hashtags: [{ type: String }],
    peopleTagged: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    location: { type: String },
    visibility: {
      type: String,
      enum: ["public", "friends", "private"],
      default: "public",
    },
    isPostScheduled: { type: Boolean, default: false },
    scheduledTime: { type: Date },
    isCommentAllowed: { type: Boolean, default: true },
    isShareAllowed: { type: Boolean, default: true },
    isPostEdited: { type: Boolean, default: false },

    // Additional fields 
    
  },
  {
    timestamps: true,
  }
);

const Post = mongoose.model("Post", postSchema);

export default Post;
