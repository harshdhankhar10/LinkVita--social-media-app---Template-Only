import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  MoveLeft, Heart, MessageSquare, Share2, Bookmark, MoreHorizontal, 
  Smile, Image, MapPin, Calendar, X, Send, ThumbsUp, ThumbsDown 
} from 'lucide-react';
import Spinner from '../Spinner';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import EmojiPicker from 'emoji-picker-react';

interface User {
  _id: string;
  fullName: string;
  userName: string;
  profilePicture: string;
  bookmarks: string[];

}

interface Comment {
  _id: string;
  user: User;
  content: string;
  createdAt: string;
  likes: string[];
  dislikes: string[];
  userId: string;
  postId: string;
}

interface Post {
  _id: string;
  userId: User;
  content: string;
  mediaUrl: string;
  likes: string[];
  comments: Comment[];
  hashtags: string[];
  peopleTagged: User[];
  location: string;
  visibility: string;
  createdAt: string;
  updatedAt: string;
  fullName: string;
  userName: string;
  profilePicture: string;
}

const PostInfo: React.FC = () => {
  const auth = useAuth();
  const currentLoggedInUser = auth?.auth?.user;
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [isBookmarkAnimating, setIsBookmarkAnimating] = useState(false);
  const username = currentLoggedInUser?.userName;
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [allComments, setAllComments] = useState<Comment[]>([]);
  const [activeCommentReaction, setActiveCommentReaction] = useState<{[key: string]: 'like' | 'dislike' | null}>({});

  useEffect(() => {
    const getPostDetails = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API}/api/v1/post/${id}`);
        setPost(response.data.post);
        setIsLiked(response.data.post.likes.includes(currentLoggedInUser?._id));      
      } catch (error) {
        console.error('Error fetching post details:', error);
        setError('Failed to fetch post details');
      } finally {
        setLoading(false);
      }
    };

    getPostDetails();
  }, [id, currentLoggedInUser]);

  useEffect(() => {
    const getUserInfo = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API}/api/v1/user/user/${username}`);
        setIsBookmarked(response.data.user.bookmarks.includes(id));
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    }
    if (username) {
      getUserInfo();
    }
  }, [username, id]);

  useEffect(() => {
    const getAllComments = async () => {
      try {
        const response = await axios.get(`${import.meta.env.VITE_REACT_APP_API}/api/v1/comment/${id}`);
        setAllComments(response.data.comments);
        
        // Initialize comment reactions state
        const reactions: {[key: string]: 'like' | 'dislike' | null} = {};
        response.data.comments.forEach((comment: Comment) => {
          if (comment.likes.includes(currentLoggedInUser?._id)) {
            reactions[comment._id] = 'like';
          } else if (comment.dislikes.includes(currentLoggedInUser?._id)) {
            reactions[comment._id] = 'dislike';
          } else {
            reactions[comment._id] = null;
          }
        });
        setActiveCommentReaction(reactions);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    }
    getAllComments();
  }, [id, currentLoggedInUser?._id]);

  const handleLike = async () => {
    if (!currentLoggedInUser) {
      toast.error('You need to be logged in to like a post');
      return;
    };
    try {
      setIsLikeAnimating(true);
      await axios.post(`${import.meta.env.VITE_REACT_APP_API}/api/v1/post/like/${id}`);
      
      setIsLiked(!isLiked);
      if (post) {
        setPost({
          ...post,
          likes: isLiked 
            ? post.likes.filter(id => id !== currentLoggedInUser?._id)
            : [...post.likes, currentLoggedInUser?._id]
        });
      }
      
      setTimeout(() => setIsLikeAnimating(false), 500);
    } catch (error) {
      console.error('Error liking post:', error);
      setIsLikeAnimating(false);
    }
  };

  const handleBookmarkPost = async () => {
    if (!currentLoggedInUser) {
      toast.error('You need to be logged in to save a post');
      return;
    };
    try {
      setIsBookmarkAnimating(true);
      await axios.post(`${import.meta.env.VITE_REACT_APP_API}/api/v1/post/bookmark/${id}`);
      
      setIsBookmarked(!isBookmarked);
      setTimeout(() => setIsBookmarkAnimating(false), 500);
    } catch (error) {
      console.error('Error saving post:', error);
      setIsBookmarkAnimating(false);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_API}/api/v1/comment/create`,
        { content: comment, postId: id },
      );
      
      if(response.data.success){
        toast.success('Comment added successfully!');
        setAllComments([...allComments, response.data.comment]);
        setActiveCommentReaction({
          ...activeCommentReaction,
          [response.data.comment._id]: null
        });
      }

      setComment('');
      setShowCommentBox(false);
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Failed to add comment');
    }
  };

  const handleCommentLike = async (commentId: string) => {
    if (!currentLoggedInUser) {
      toast.error('You need to be logged in to react to comments');
      return;
    }

    try {
      const currentReaction = activeCommentReaction[commentId];
      let newReaction: 'like' | 'unlike' | null = null;
      
      if (currentReaction !== 'like') {
        // Like the comment
        await axios.post(`${import.meta.env.VITE_REACT_APP_API}/api/v1/comment/like/${commentId}`);
        newReaction = 'like';
      } else {
        // Remove like
        await axios.delete(`${import.meta.env.VITE_REACT_APP_API}/api/v1/comment/like/${commentId}`);
        newReaction = null;
      }

      // Update the comment in state
      setAllComments(allComments.map(comment => {
        if (comment._id === commentId) {
          if (currentReaction === 'like') {
            // Remove like
            return {
              ...comment,
              likes: comment.likes.filter(id => id !== currentLoggedInUser._id)
            };
          } else {
            // Add like (and remove dislike if present)
            const newLikes = [...comment.likes, currentLoggedInUser._id];
            const newDislikes = comment.dislikes.filter(id => id !== currentLoggedInUser._id);
            return {
              ...comment,
              likes: newLikes,
              dislikes: newDislikes
            };
          }
        }
        return comment;
      }));

      // Update the reaction state
      setActiveCommentReaction({
        ...activeCommentReaction,
        [commentId]: newReaction
      });

    } catch (error) {
      console.error('Error liking comment:', error);
      toast.error('Failed to react to comment');
    }
  };

  const handleCommentDislike = async (commentId: string) => {
    if (!currentLoggedInUser) {
      toast.error('You need to be logged in to react to comments');
      return;
    }

    try {
      const currentReaction = activeCommentReaction[commentId];
      let newReaction: 'like' | 'unlike' | null = null;
      
      if (currentReaction !== 'dislike') {
        // Dislike the comment
        await axios.post(`${import.meta.env.VITE_REACT_APP_API}/api/v1/comment/unlike/${commentId}`);
        newReaction = 'dislike';
      } else {
        // Remove dislike
        await axios.delete(`${import.meta.env.VITE_REACT_APP_API}/api/v1/comment/unlike/${commentId}`);
        newReaction = null;
      }

      // Update the comment in state
      setAllComments(allComments.map(comment => {
        if (comment._id === commentId) {
          if (currentReaction === 'dislike') {
            // Remove dislike
            return {
              ...comment,
              dislikes: comment.dislikes.filter(id => id !== currentLoggedInUser._id)
            };
          } else {
            // Add dislike (and remove like if present)
            const newDislikes = [...comment.dislikes, currentLoggedInUser._id];
            const newLikes = comment.likes.filter(id => id !== currentLoggedInUser._id);
            return {
              ...comment,
              likes: newLikes,
              dislikes: newDislikes
            };
          }
        }
        return comment;
      }));

      // Update the reaction state
      setActiveCommentReaction({
        ...activeCommentReaction,
        [commentId]: newReaction
      });

    } catch (error) {
      console.error('Error disliking comment:', error);
      toast.error('Failed to react to comment');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) return `${interval}y`;
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) return `${interval}mo`;
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) return `${interval}d`;
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) return `${interval}h`;
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) return `${interval}m`;
    
    return `${Math.floor(seconds)}s`;
  };

  if (loading) return <Layout><div className="flex justify-center items-center h-screen"><Spinner /></div></Layout>;
  if (error) return <Layout><div className="flex justify-center items-center h-screen text-red-500">{error}</div></Layout>;
  if (!post) return <Layout><div className="flex justify-center items-center h-screen">Post not found</div></Layout>;

  return (
    <Layout>
      <div className="max-w-2xl mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200 p-4 flex items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="mr-6 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
            aria-label="Go back"
          >
            <MoveLeft size={24} className="text-gray-800" />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Post</h1>
        </div>

        {/* Post Content */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              <img 
                src={post.userId.profilePicture || '/default-profile.png'} 
                alt={post.userId.userName} 
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-profile.png';
                }}
              />
              <div>
                <p className="font-semibold text-gray-900">{post.userId.fullName}</p>
                <p className="text-gray-500 text-sm">@{post.userId.userName}</p>
              </div>
            </div>
            <button 
              className="text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
              aria-label="More options"
            >
              <MoreHorizontal size={20} />
            </button>
          </div>

          <p className="mb-4 text-gray-800 whitespace-pre-line break-words">{post.content}</p>
          
          {post.mediaUrl && (
            <div className="rounded-lg overflow-hidden mb-4 border border-gray-200 bg-gray-100">
              <img 
                src={post.mediaUrl} 
                alt="Post media" 
                className="w-full h-auto max-h-[500px] object-contain mx-auto"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-image.png';
                }}
              />
            </div>
          )}

          {post.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {post.hashtags.map((tag, index) => (
                <span 
                  key={index} 
                  className="text-blue-500 hover:text-blue-600 text-sm cursor-pointer transition-colors duration-200"
                  onClick={() => navigate(`/explore/tags/${tag}`)}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {post.peopleTagged.length > 0 && (
            <div className="flex items-center flex-wrap gap-2 mb-3">
              <span className="text-gray-500 text-sm">Tagged:</span>
              {post.peopleTagged.map(user => (
                <span 
                  key={user._id} 
                  className="text-blue-500 hover:text-blue-600 text-sm cursor-pointer transition-colors duration-200"
                  onClick={() => navigate(`/profile/${user.userName}`)}
                >
                  @{user.userName}
                </span>
              ))}
            </div>
          )}

          {post.location && (
            <div className="flex items-center text-gray-500 text-sm mb-2">
              <MapPin size={16} className="mr-1" />
              <span>{post.location}</span>
            </div>
          )}

          <div className="flex items-center text-gray-500 text-sm">
            <Calendar size={16} className="mr-1" />
            <span>{formatDate(post.createdAt)}</span>
            <span className="mx-2">·</span>
            <span>{formatTimeAgo(post.createdAt)} ago</span>
          </div>
        </div>

        {/* Post Actions */}
        <div className="p-4 border-b border-gray-200 flex justify-between">
          <div className="flex items-center space-x-6">
            <button 
              onClick={handleLike}
              className={`flex items-center space-x-1 group relative transition-colors duration-200 ${
                isLiked ? 'text-red-500' : 'text-gray-500 hover:text-red-500'
              }`}
              aria-label={isLiked ? 'Unlike post' : 'Like post'}
            >
              <div className={`${isLikeAnimating ? 'animate-ping scale-150' : ''} absolute opacity-75`}></div>
              <Heart 
                size={22} 
                fill={isLiked ? 'currentColor' : 'none'} 
                className={`transition-transform duration-200 ${isLikeAnimating ? 'scale-125' : 'group-hover:scale-110'}`}
              />
              <span className="text-sm">{post.likes.length}</span>
            </button>
            
            <button 
              onClick={() => setShowCommentBox(!showCommentBox)}
              className={`flex items-center space-x-1 transition-colors duration-200 ${
                showCommentBox ? 'text-blue-500' : 'text-gray-500 hover:text-blue-500'
              }`}
              aria-label="Comment on post"
            >
              <MessageSquare size={22} />
              <span className="text-sm">{allComments.length}</span>
            </button>
            
            <button 
              className="flex items-center text-gray-500 hover:text-green-500 transition-colors duration-200"
              aria-label="Share post"
            >
              <Share2 size={22} />
            </button>
          </div>
          
          <button 
            onClick={handleBookmarkPost}
            className={`group relative transition-colors duration-200 ${
              isBookmarked ? 'text-yellow-500' : 'text-gray-500 hover:text-yellow-500'
            }`}
            aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
          >
            <div className={`${isBookmarkAnimating ? 'animate-ping scale-150' : ''} absolute opacity-75`}></div>
            <Bookmark 
              size={22} 
              fill={isBookmarked ? 'currentColor' : 'none'} 
              className={`transition-transform duration-200 ${isBookmarkAnimating ? 'scale-125' : 'group-hover:scale-110'}`}
            />
          </button>
        </div>

        {/* Comment Input */}
        {showCommentBox && (
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <form onSubmit={handleCommentSubmit} className="flex items-center space-x-2">
              <img 
                src={currentLoggedInUser?.profilePicture || '/default-profile.png'}
                alt="Your profile" 
                className="w-8 h-8 rounded-full object-cover border border-gray-200"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/default-profile.png';
                }}
              />
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  className="w-full border border-gray-300 rounded-full py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-400 transition-all duration-200"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button 
                  type="button"
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="absolute right-2 top-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label="Toggle emoji picker"
                >
                  <Smile size={20} />
                </button>
                {showEmojiPicker && (
                  <div className="absolute right-0 bottom-10 z-10">
                    <EmojiPicker 
                      onEmojiClick={(emojiObject) => {
                        setComment(prev => prev + emojiObject.emoji);
                        setShowEmojiPicker(false);
                      }}
                      width={300}
                      height={350}
                    />
                  </div>
                )}
              </div>
              <button 
                type="submit" 
                disabled={!comment.trim()}
                className={`p-2 rounded-full transition-colors duration-200 ${
                  comment.trim() 
                    ? 'text-blue-500 hover:bg-blue-50' 
                    : 'text-gray-300 cursor-not-allowed'
                }`}
                aria-label="Post comment"
              >
                <Send size={20} />
              </button>
            </form>
          </div>
        )}

        {/* Comments List */}
        <div className="divide-y divide-gray-100">
          {allComments.map((comment) => (
            <div key={comment._id} className="p-4 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex items-start space-x-3">
                <img 
                  src={comment?.userId?.profilePicture || '/default-profile.png'}
                  alt={comment?.userId?.userName} 
                  className="w-8 h-8 rounded-full object-cover border border-gray-200"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/default-profile.png';
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <p className="font-semibold text-sm text-gray-900 truncate">{comment?.userId?.fullName}</p>
                    <p className="text-gray-500 text-xs truncate">@{comment?.userId?.userName}</p>
                    <span className="text-gray-400 text-xs">· {formatTimeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-800 break-words">{comment.content}</p>
                  
                  {/* Comment Reactions */}
                  <div className="flex items-center mt-2 space-x-4">
                    <button 
                      onClick={() => handleCommentLike(comment._id)}
                      className={`flex items-center text-xs transition-colors duration-200 ${
                        activeCommentReaction[comment._id] === 'like' 
                          ? 'text-blue-500' 
                          : 'text-gray-500 hover:text-blue-500'
                      }`}
                      aria-label="Like comment"
                    >
                      <ThumbsUp 
                        size={14} 
                        className="mr-1" 
                        fill={activeCommentReaction[comment._id] === 'like' ? 'currentColor' : 'none'}
                      />
                      <span>{comment?.likes?.length}</span>
                    </button>
                    
                    <button 
                      onClick={() => handleCommentDislike(comment._id)}
                      className={`flex items-center text-xs transition-colors duration-200 ${
                        activeCommentReaction[comment._id] === 'dislike' 
                          ? 'text-red-500' 
                          : 'text-gray-500 hover:text-red-500'
                      }`}
                      aria-label="Dislike comment"
                    >
                      <ThumbsDown 
                        size={14} 
                        className="mr-1" 
                        fill={activeCommentReaction[comment._id] === 'dislike' ? 'currentColor' : 'none'}
                      />
                      <span>{comment.dislikes?.length}</span>
                    </button>
                    
                  </div>
                </div>
                <button 
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  aria-label="More comment options"
                >
                  <MoreHorizontal size={16} />
                </button>
              </div>
              <div className='mb-12'>

              </div>
            </div>
          ))}
          
          {allComments.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <MessageSquare size={24} className="mx-auto mb-2" />
              <p>No comments yet</p>
              <p className="text-sm">Be the first to comment</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PostInfo;