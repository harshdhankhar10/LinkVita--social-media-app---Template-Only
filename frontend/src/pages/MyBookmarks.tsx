import Layout from '@/components/Homepage/Layout';
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bookmark, X, Search, Loader, ChevronRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface User {
  _id: string;
  fullName: string;
  userName: string;
  profilePicture: string;
}

interface Post {
  _id: string;
  userId: User;
  content: string;
  mediaUrl: string;
  createdAt: string;
}

const MyBookmarks = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const navigate = useNavigate();

  useEffect(() => {
    const getAllBookmarkedPosts = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${import.meta.env.VITE_REACT_APP_API}/api/v1/post/my-bookmarks`);
        setPosts(res.data.posts);
      } catch (error) {
        console.error('Error fetching bookmarked posts:', error);
        toast.error('Failed to load bookmarked posts');
      } finally {
        setLoading(false);
      }
    };
    getAllBookmarkedPosts();
  }, []);

  const handleRemoveBookmark = async (postId: string) => {
    try {
      await axios.post(`${import.meta.env.VITE_REACT_APP_API}/api/v1/post/bookmark/${postId}`);
      setPosts(posts.filter(post => post._id !== postId));
      toast.success('Removed from bookmarks');
    } catch (error) {
      console.error('Error removing bookmark:', error);
      toast.error('Failed to remove bookmark');
    }
  };

  const filteredPosts = posts.filter(post => 
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.userId.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.userId.userName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-[60vh]">
          <Loader className="animate-spin text-[#B540DD]" size={48} />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Saved Collections</h1>
            <p className="text-gray-500 mt-1">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'saved item' : 'saved items'}
            </p>
          </div>
          
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search your bookmarks..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-[#B540DD] focus:border-transparent transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </motion.div>

        {/* Bookmarks Grid */}
        {filteredPosts.length > 0 ? (
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {filteredPosts.map((post) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="relative group rounded-xl overflow-hidden bg-white border border-gray-100 hover:border-gray-200 transition-all duration-300 shadow-sm hover:shadow-md"
                onClick={() => navigate(`/post/${post._id}`)}
              >
                {post.mediaUrl ? (
                  <div className="aspect-square overflow-hidden">
                    <img 
                      src={post.mediaUrl} 
                      alt="Post content" 
                      className="w-full h-full object-cover cursor-pointer transition-transform duration-500 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col justify-between p-5 cursor-pointer">
                    <p className="text-gray-700 font-medium line-clamp-5 leading-snug">
                      {post.content}
                    </p>
                    <div className="flex justify-end">
                      <ChevronRight className="text-gray-400 group-hover:text-[#B540DD] transition-colors" />
                    </div>
                  </div>
                )}
                
                {/* Remove bookmark button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRemoveBookmark(post._id);
                  }}
                  className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:shadow-md"
                  aria-label="Remove bookmark"
                >
                  <Bookmark size={18} className="text-[#B540DD]" fill="currentColor" />
                </button>
                
                {/* User info */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <div className="flex items-center space-x-2">
                    <img 
                      src={post.userId.profilePicture || '/default-profile.png'} 
                      alt={post.userId.userName} 
                      className="w-7 h-7 rounded-full border-2 border-white/80"
                    />
                    <Link 
                    
                      to={`/profile/${post.userId.userName}`} 
                    >
                      <span className="text-white text-sm font-medium">
                      @{post.userId.userName}
                    </span>
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20"
          >
            <div className="bg-gray-50 p-6 rounded-full mb-5">
              <Bookmark size={40} className="text-gray-300" />
            </div>
            <h3 className="text-2xl font-medium text-gray-800 mb-3 text-center">
              {searchQuery ? 'No bookmarks found' : 'Your collection is empty'}
            </h3>
            <p className="text-gray-500 text-center max-w-md">
              {searchQuery 
                ? 'Try searching with different keywords' 
                : 'Save posts you want to revisit by clicking the bookmark icon'}
            </p>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};

export default MyBookmarks;