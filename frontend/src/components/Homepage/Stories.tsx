import React from "react";
import { Link } from "react-router-dom";
import { PlusIcon, Video, Image as ImageIcon } from "lucide-react";
import { motion } from "framer-motion";
import "./custom.css"

interface StoryItemProps {
  id: string;
  username: string;
  userImage: string; 
  hasStory: boolean;
  watched: boolean;
  isLive?: boolean;
  previewImage?: string;
}

const StoriesReel = () => {
  const stories: StoryItemProps[] = [
    {
      id: "create",
      username: "Your Story",
      userImage: "https://i.pravatar.cc/150?img=65",
      hasStory: false,
      watched: false,
    },
    {
      id: "1",
      username: "design_hub",
      userImage: "https://i.pravatar.cc/150?img=1",
      hasStory: true,
      watched: false,
      previewImage: "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9"
    },
    {
      id: "2",
      username: "travel_diaries",
      userImage: "https://i.pravatar.cc/150?img=3",
      hasStory: true,
      watched: false,
      isLive: true,
      previewImage: "https://images.unsplash.com/photo-1582562124811-c09040d0a901"
    },
    {
      id: "3",
      username: "art_gallery",
      userImage: "https://i.pravatar.cc/150?img=5",
      hasStory: true,
      watched: true,
      previewImage: "https://images.unsplash.com/photo-1721322800607-8c38375eef04"
    },
    {
      id: "4",
      username: "food_lover",
      userImage: "https://i.pravatar.cc/150?img=8",
      hasStory: true,
      watched: false,
    },
    {
      id: "5",
      username: "tech_news",
      userImage: "https://i.pravatar.cc/150?img=12",
      hasStory: true,
      watched: false,
    },
    {
      id: "6",
      username: "fashion_trends",
      userImage: "https://i.pravatar.cc/150?img=20",
      hasStory: true,
      watched: false,
    },
    {
      id: "7",
      username: "nature_pics",
      userImage: "https://i.pravatar.cc/150?img=32",
      hasStory: true,
      watched: true,
    },
    {
        id: "7",
        username: "nature_pics",
        userImage: "https://i.pravatar.cc/150?img=32",
        hasStory: true,
        watched: true,
      }, {
        id: "7",
        username: "nature_pics",
        userImage: "https://i.pravatar.cc/150?img=32",
        hasStory: true,
        watched: true,
      }, {
        id: "7",
        username: "nature_pics",
        userImage: "https://i.pravatar.cc/150?img=32",
        hasStory: true,
        watched: true,
      }, {
        id: "7",
        username: "nature_pics",
        userImage: "https://i.pravatar.cc/150?img=32",
        hasStory: true,
        watched: true,
      },
  ];

  return (
    <div className="w-full ">
      <div className="flex items-center justify-between mb-4 px-2 ">
        <h2 className="text-lg font-semibold text-gray-800">Stories</h2>
        <Link to="/stories" className="text-sm font-medium text-purple-600 hover:text-purple-700 hover:underline">
          See all
        </Link>
      </div>

      <div className="relative">
        <div className="flex space-x-4 overflow-x-auto pb-4 px-2 hide-scrollbar ">
          {stories.map((story) => (
            <motion.div 
              key={story.id}
              whileHover={{ scale: 1.03 }}
              className="flex-shrink-0 w-20"
            >
              <StoryItem {...story} />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StoryItem = ({ id, username, userImage, hasStory, watched, isLive, previewImage }: StoryItemProps) => {
  if (id === "create") {
    return (
      <Link to="/create/story" className="flex flex-col items-center">
        <div className="relative mb-2">
          <div className="w-16 h-16 rounded-full flex items-center justify-center bg-gray-100 border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors">
            <PlusIcon className="w-5 h-5 text-gray-500" />
          </div>
        </div>
        <span className="text-xs text-gray-600 text-center truncate w-full">{username}</span>
      </Link>
    );
  }

  return (
    <Link to={`/stories/${id}`} className="flex flex-col items-center">
      <div className="relative mb-2">
        <div className={`w-16 h-16 rounded-full p-0.5 ${
          hasStory && !watched ? "bg-gradient-to-br from-purple-500 to-pink-500" : "bg-gray-200"
        }`}>
          <div 
            className="w-full h-full rounded-full overflow-hidden border-2 border-white bg-gray-100"
            style={{ 
              backgroundImage: previewImage ? `url(${previewImage})` : undefined,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <img src={userImage} alt={username} className="w-full h-full object-cover" />
          </div>
        </div>

        {isLive && (
          <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-medium shadow-xs">
            LIVE
          </div>
        )}

        {previewImage && (
          <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
            {username.includes("video") ? (
              <Video className="w-3 h-3 text-purple-600" />
            ) : (
              <ImageIcon className="w-3 h-3 text-purple-600" />
            )}
          </div>
        )}
      </div>
      <span className="text-xs text-gray-600 text-center truncate w-full">{username}</span>
    </Link>
  );
};

export default StoriesReel;