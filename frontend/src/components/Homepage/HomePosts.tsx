import React, { useState, useRef, useEffect } from 'react';
import { Heart, MessageCircle, Bookmark, MoreHorizontal, Send, MapPin, Share2, AlertTriangle, UserPlus, VolumeX, X } from 'lucide-react';

const HomePosts = () => {
  const [likedPosts, setLikedPosts] = useState({});
  const [savedPosts, setSavedPosts] = useState({});
  const [openDropdown, setOpenDropdown] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [followedUsers, setFollowedUsers] = useState([]);
  const dropdownRef = useRef(null);

  const handleLike = (postId) => {
    setLikedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const handleSave = (postId) => {
    setSavedPosts(prev => ({
      ...prev,
      [postId]: !prev[postId]
    }));
  };

  const toggleDropdown = (postId) => {
    setOpenDropdown(openDropdown === postId ? null : postId);
  };

  const closeDropdown = () => {
    setOpenDropdown(null);
  };

  const handleFollow = (userId) => {
    setFollowedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId) 
        : [...prev, userId]
    );
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        closeDropdown();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const posts = [
    {
      id: 1,
      username: "travel_enthusiast",
      userImage: "https://randomuser.me/api/portraits/women/44.jpg",
      location: "Bali, Indonesia",
      image: "https://images.unsplash.com/photo-1617965215075-b1f768dc8a61?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c3Vuc2V0JTIwdmlld3xlbnwwfHwwfHx8MA%3D%3D",
      caption: "Sunset views in Uluwatu never disappoint 🌅 #TravelBali #Wanderlust",
      likes: 1243,
      comments: 89,
      timeAgo: "2h",
      verified: true,
      topComment: {
        username: "beachlife",
        text: "This place is on my bucket list! Gorgeous view 😍"
      }
    },
    {
      id: 2,
      username: "foodie_adventures",
      userImage: "https://randomuser.me/api/portraits/men/32.jpg",
      location: "Tokyo, Japan",
      image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80",
      caption: "Omakase experience at Sukiyabashi Jiro 🍣 Once in a lifetime!",
      likes: 3567,
      comments: 214,
      timeAgo: "5h",
      verified: true,
      topComment: {
        username: "sushi_lover",
        text: "The best sushi in Japan! How was the fatty tuna?"
      }
    },
    {
      id: 3,
      username: "urban_explorer",
      userImage: "https://randomuser.me/api/portraits/women/68.jpg",
      location: "New York City",
      image: "https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1200&q=80",
      caption: "The city that never sleeps 🌃 #NYC #ConcreteJungle",
      likes: 892,
      comments: 42,
      timeAgo: "8h",
      topComment: {
        username: "ny_native",
        text: "Great shot of my hometown! 🗽"
      }
    }
  ];

  const suggestedAccounts = [
    {
      id: 101,
      username: "photography_love",
      fullName: "Photography World",
      avatar: "https://randomuser.me/api/portraits/women/23.jpg",
      isVerified: true
    },
    {
      id: 102,
      username: "travel_addict",
      fullName: "Globe Trotter",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      isVerified: false
    },
    {
      id: 103,
      username: "food_master",
      fullName: "Chef Special",
      avatar: "https://randomuser.me/api/portraits/women/67.jpg",
      isVerified: true
    },
    {
      id: 104,
      username: "fitness_guru",
      fullName: "Healthy Living",
      avatar: "https://randomuser.me/api/portraits/men/12.jpg",
      isVerified: false
    },
    {
      id: 105,
      username: "tech_geek",
      fullName: "Tech Updates",
      avatar: "https://randomuser.me/api/portraits/women/89.jpg",
      isVerified: true
    }
  ];

  const formatCaption = (caption) => {
    const parts = caption.split(/(#\w+)/g);
    return parts.map((part, index) => {
      if (part.startsWith('#')) {
        return <span key={index} className="text-blue-500 hover:underline cursor-pointer font-medium">{part}</span>;
      }
      return part;
    });
  };

  return (
    <div className="flex justify-center lg:justify-between max-w-6xl mx-auto lg:ml-32">
      <div className="lg:min-w-118 lg:w-118 pb-10">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-xl mb-8 shadow-lg overflow-hidden border border-gray-100">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                    <img src={post.userImage} alt={post.username} className="w-full h-full object-cover" />
                  </div>
                  {post.verified && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                      <div className="text-white text-xs font-bold">✓</div>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center">
                    <p className="font-semibold text-sm hover:underline cursor-pointer">{post.username}</p>
                  </div>
                  {post.location && (
                    <div className="flex items-center text-xs text-gray-500">
                      <MapPin size={10} className="mr-1" />
                      <span className="hover:underline cursor-pointer">{post.location}</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="relative" ref={dropdownRef}>
                <button 
                  className="text-gray-500 hover:text-gray-700 p-1 rounded-full transition-colors focus:outline-none"
                  onClick={() => toggleDropdown(post.id)}
                >
                  <MoreHorizontal size={18} />
                </button>
                
                {openDropdown === post.id && (
                  <div className="absolute right-0 top-8 w-56 bg-white rounded-lg shadow-xl border border-gray-100 z-20 py-1 text-sm">
                    <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center text-red-500">
                      <AlertTriangle size={14} className="mr-2" />
                      <span>Report</span>
                    </button>
                    <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center">
                      <UserPlus size={14} className="mr-2" />
                      <span>Follow</span>
                    </button>
                    <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center">
                      <VolumeX size={14} className="mr-2" />
                      <span>Mute</span>
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center">
                      <Share2 size={14} className="mr-2" />
                      <span>Share</span>
                    </button>
                    <button className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center" onClick={closeDropdown}>
                      <X size={14} className="mr-2" />
                      <span>Cancel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="w-full h-118 bg-gray-50 relative overflow-hidden">
              <img 
                src={post.image} 
                alt={post.caption} 
                className="w-full h-full object-cover"
              />
            </div>

            <div className="px-4 py-3">
              <div className="flex justify-between mb-3">
                <div className="flex space-x-5">
                  <button 
                    className="transition-colors focus:outline-none"
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart 
                      className={likedPosts[post.id] ? "text-red-500 fill-red-500" : "text-gray-800"} 
                      size={26} 
                    />
                  </button>
                  <button className="transition-colors focus:outline-none">
                    <MessageCircle className="text-gray-800" size={26} />
                  </button>
                  <button className="transition-colors focus:outline-none">
                    <Send className="text-gray-800" size={26} />
                  </button>
                </div>
                <button 
                  className="transition-colors focus:outline-none"
                  onClick={() => handleSave(post.id)}
                >
                  <Bookmark 
                    className={savedPosts[post.id] ? "text-black fill-black" : "text-gray-800"} 
                    size={26} 
                  />
                </button>
              </div>

              <p className="font-semibold text-sm mb-3">
                {(likedPosts[post.id] ? post.likes + 1 : post.likes).toLocaleString()} likes
              </p>

              <p className="text-sm mb-3 leading-relaxed">
                <span className="font-semibold mr-2 hover:underline cursor-pointer">{post.username}</span>
                {formatCaption(post.caption)}
              </p>

              <button className="text-gray-500 text-xs mb-2 hover:underline focus:outline-none">
                View all {post.comments} comments
              </button>

              {post.topComment && (
                <p className="text-sm mb-2 leading-relaxed">
                  <span className="font-semibold mr-2 hover:underline cursor-pointer">{post.topComment.username}</span>
                  {post.topComment.text}
                </p>
              )}

              <p className="text-gray-400 text-xs uppercase tracking-wide mt-3">{post.timeAgo}</p>
            </div>

            <div className="flex items-center px-4 py-3 border-t border-gray-100">
              <input 
                type="text" 
                placeholder="Add a comment..." 
                className="text-sm w-full bg-transparent focus:outline-none placeholder-gray-400"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
              />
              <button 
                className={`text-blue-500 font-semibold text-sm ml-2 ${commentText.trim() ? 'opacity-100' : 'opacity-50'}`}
                disabled={!commentText.trim()}
              >
                Post
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hidden lg:block lg:min-w-76 lg:ml-40 ">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-gray-500">Suggested for you</h3>
            <button className="text-sm font-semibold text-gray-900 hover:text-gray-600">See All</button>
          </div>
          
          <div className="space-y-4">
            {suggestedAccounts.map(account => (
              <div key={account.id} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm">
                      <img src={account.avatar} alt={account.username} className="w-full h-full object-cover" />
                    </div>
                    {account.isVerified && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center border-2 border-white">
                        <div className="text-white text-xs font-bold">✓</div>
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-sm hover:underline cursor-pointer">{account.username}</p>
                    <p className="text-xs text-gray-500">{account.fullName}</p>
                  </div>
                </div>
                <button 
                  onClick={() => handleFollow(account.id)}
                  className={`text-xs font-semibold px-3 py-1 rounded-lg ${followedUsers.includes(account.id) ? 'text-gray-500 bg-gray-100' : 'text-blue-500 hover:text-blue-600'}`}
                >
                  {followedUsers.includes(account.id) ? 'Following' : 'Follow'}
                </button>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 text-center text-xs text-gray-500 space-y-2">
  <div className="flex justify-center flex-wrap gap-x-4 gap-y-1">
    <a href="/privacy-policy" className="hover:underline hover:text-indigo-600">Privacy Policy</a>
    <a href="/terms" className="hover:underline hover:text-indigo-600">Terms</a>
    <a href="/about" className="hover:underline hover:text-indigo-600">About</a>
    <a href="/contact" className="hover:underline hover:text-indigo-600">Contact</a>
  </div>
  <p className="pt-2 text-[14px] text-gray-400">
    © {new Date().getFullYear()} | All rights reserved. <span className="font-semibold text-gray-500">LinkVita</span>
  </p>
</div>

      </div>
    </div>
  );
};

export default HomePosts;