import React, { useState, useEffect } from "react";
import {
  Grid,
  Bookmark,
  Tag,
  Settings,
  Edit,
  Lock,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Link,
  X,
  ChevronLeft,
  UserPlus,
  Search,
} from "lucide-react";
import { MdArticle } from "react-icons/md";
import { Link as LinkPath, useLocation } from "react-router-dom";

import Layout from "./Layout";
import CreatePost from "./CreatePost";
import { useParams } from "react-router-dom";
import axios from "axios";
import Spinner from "../Spinner";
import { useAuth } from "@/context/AuthContext";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

interface User {
  _id: string;
  fullName: string;
  userName: string;
  profilePicture: string;
  isVerified: boolean;
}

interface Post {
  _id: string;
  content: string;
  mediaUrl: string;
  likes: string[];
  dislikes: string[];
  comments: string[];
  hashtags: string[];
  createdAt: string;
}

interface UserData {
  _id: string;
  fullName: string;
  userName: string;
  profilePicture: string;
  bio: string;
  gender: string;
  role: string;
  isProfilePrivate: boolean;
  followers: User[];
  following: User[];
  posts: Post[];
  savedPosts: string[];
  blockedUsers: string[];
  socialLinks: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
    website: string;
  };
  preferences: {
    language: string;
    theme: string;
    notifications: boolean;
    privacy: string;
  };
}

const MyProfile: React.FC = () => {
  const auth = useAuth();
  const currentLoggedInUser = auth?.auth?.user;
  const [activeTab, setActiveTab] = useState<"posts" | "saved" | "tagged">(
    "posts"
  );
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [showFollowingModal, setShowFollowingModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [apiPosts, setApiPosts] = useState<Post[]>([]);
  const { userName } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_API}/api/v1/user/user/${userName}`
        );
        setUserData(response.data.user);
        setApiPosts(response.data.posts || []);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch user data");
      } finally {
        setLoading(false);
      }
    };

    getUserData();
  }, [userName]);

  const followUser = async () => {
    if (!userData) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API}/api/v1/user/follow/`,
        {
          userId: userData._id,
        }
      );
      window.location.reload();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to follow user");
    }
  };

  const unfollowUser = async () => {
    if (!userData) return;
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API}/api/v1/user/unfollow/`,
        {
          userId: userData._id,
        }
      );
      setUserData((prev) => ({
        ...prev!,
        followers: prev!.followers.filter(
          (follower) => follower._id !== currentLoggedInUser?._id
        ),
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to unfollow user");
    }
  };

  const handleRemoveFollower = async (userId: string) => {
    if (!userData) return;
  };

  const handleUnfollowUser = async (userId: string) => {
    try {
      await axios.post(
        `${import.meta.env.VITE_REACT_APP_API}/api/v1/user/unfollow/${userId}`
      );
      setUserData((prev) => ({
        ...prev!,
        following: prev!.following.filter((user) => user._id !== userId),
      }));
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to unfollow user");
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const handlePostCreated = (newPost: Post): void => {
    setApiPosts((prevPosts) => [newPost, ...prevPosts]);
  };

  const UserListItem: React.FC<{
    user: User;
    isFollowing?: boolean;
    onRemove: (userId: string) => void;
  }> = ({ user, isFollowing = false, onRemove }) => {
    const isCurrentUser = user._id === currentLoggedInUser?._id;

    return (
      <div className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={user.profilePicture}
              alt={user.userName}
              className="w-12 h-12 rounded-full object-cover border border-gray-200"
            />
          </div>
          <div>
            <p className="font-medium text-gray-900">{user.fullName}</p>
            <p className="text-sm text-gray-500">@{user.userName}</p>
          </div>
        </div>
        {!isCurrentUser &&
          (isFollowing ? (
            <button
              onClick={() => onRemove(user._id)}
              className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors"
            >
              Following
            </button>
          ) : (
            <button
              onClick={() => onRemove(user._id)}
              className="px-3 py-1.5 text-sm font-medium rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              Remove
            </button>
          ))}
      </div>
    );
  };

  const FollowersFollowingModal: React.FC<{
    type: "followers" | "following";
    onClose: () => void;
  }> = ({ type, onClose }) => {
    const isFollowers = type === "followers";
    const title = isFollowers ? "Followers" : "Following";
    const users = isFollowers ? userData?.followers : userData?.following;
    const filteredUsers = users?.filter((user) =>
      user.userName.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" onClick={onClose}>
            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
          </div>

          <div className="inline-block align-bottom bg-white rounded-t-lg sm:rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full w-full fixed bottom-0 sm:relative">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={onClose}
                  className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>
                <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                <div className="w-6"></div>
              </div>

              <div className="relative mb-4">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder={`Search ${title.toLowerCase()}`}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="border-t border-gray-200 pt-2">
                <p className="text-sm text-gray-500 mb-3">
                  {formatNumber(users?.length || 0)} {title.toLowerCase()}
                </p>
                <div className="max-h-[60vh] overflow-y-auto">
                  {filteredUsers && filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <UserListItem
                        key={user._id}
                        user={user}
                        isFollowing={!isFollowers}
                        onRemove={
                          isFollowers
                            ? handleRemoveFollower
                            : handleUnfollowUser
                        }
                      />
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <p className="text-gray-500">
                        No {title.toLowerCase()} found
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading)
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <Spinner />
        </div>
      </Layout>
    );
  if (error)
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen text-red-500">
          {error}
        </div>
      </Layout>
    );
  if (!userData)
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          User not found
        </div>
      </Layout>
    );

  const isCurrentUser = userData._id === currentLoggedInUser?._id;
  const isFollowing = userData.followers.some(
    (follower) => follower._id === currentLoggedInUser?._id
  );

  return (
    <Layout>
      <Helmet>
        <title>
          {userData.fullName} (@{userData.userName}) - My Profile
        </title>
        <meta name="description" content={`Profile of ${userData.fullName}`} />
        <meta
          name="keywords"
          content={`profile, ${userData.fullName}, ${userData.userName}`}
        />
        <meta name="author" content={userData.fullName} />
      </Helmet>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            <div className="flex-shrink-0 relative self-start mx-auto md:mx-0">
              <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border border-pink-500 p-0.5">
                <img
                  src={userData.profilePicture}
                  alt={userData.userName}
                  className="w-full h-full object-cover rounded-full border-4 border-white"
                />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div className="text-center md:text-left">
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                    {userData.fullName}
                  </h1>
                  <p className="text-gray-600">@{userData.userName}</p>
                </div>

                {isCurrentUser ? (
                  <div className="flex gap-2 justify-center md:justify-start">
                    <button
                      onClick={() => setIsCreatePostOpen(true)}
                      className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-white rounded-lg text-xs sm:text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 cursor-pointer transition-colors"
                    >
                      <Edit size={14} className="hidden sm:block" />
                      Create Post
                    </button>
                    <button className="p-1.5 sm:p-2 bg-gray-50 hover:bg-gray-100 text-gray-800 rounded-lg transition-colors">
                      <Settings size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2 justify-center md:justify-start">
                    {isFollowing ? (
                      <button
                        onClick={unfollowUser}
                        className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-medium border border-gray-300 hover:bg-gray-100 transition-colors"
                      >
                        Following
                      </button>
                    ) : (
                      <button
                        onClick={followUser}
                        className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-white rounded-lg text-xs sm:text-sm font-medium bg-gradient-to-r from-purple-600 to-pink-600 cursor-pointer transition-colors"
                      >
                        <UserPlus size={14} className="hidden sm:block" />
                        Follow
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4 md:mb-6">
                <p className="text-gray-700 text-center md:text-left mb-3 sm:mb-4">
                  {userData.bio}
                </p>

                {userData.socialLinks.website && (
                  <div className="flex justify-center md:justify-start mb-4">
                    <a
                      href={
                        userData.socialLinks.website.startsWith("http")
                          ? userData.socialLinks.website
                          : `https://${userData.socialLinks.website}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-1.5 text-xs sm:text-sm"
                    >
                      <Link size={14} className="text-gray-400" />
                      {userData.socialLinks.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}

                <div className="flex justify-between sm:justify-start sm:gap-6 pt-3 border-t border-gray-100">
                  <div className="text-center hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors">
                    <div className="font-bold text-gray-900">
                      {formatNumber(apiPosts.length)}
                    </div>
                    <div className="text-xs text-gray-500">Posts</div>
                  </div>
                  <button
                    onClick={() => setShowFollowersModal(true)}
                    className="text-center hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                  >
                    <div className="font-bold text-gray-900 cursor-pointer">
                      {formatNumber(userData.followers.length)}
                    </div>
                    <div className="text-xs text-gray-500">Followers</div>
                  </button>
                  <button
                    onClick={() => setShowFollowingModal(true)}
                    className="text-center hover:bg-gray-50 rounded-lg px-2 py-1 transition-colors"
                  >
                    <div className="font-bold text-gray-900 cursor-pointer">
                      {formatNumber(userData.following.length)}
                    </div>
                    <div className="text-xs text-gray-500">Following</div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex-1 py-3 sm:py-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 
                ${
                  activeTab === "posts"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent border-b-2 border-gradient-to-r border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Grid size={14} />
              Posts
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`flex-1 py-3 sm:py-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 
                ${
                  activeTab === "saved"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent border-b-2 border-gradient-to-r border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Bookmark size={14} />
              Saved
            </button>
            <button
              onClick={() => setActiveTab("tagged")}
              className={`flex-1 py-3 sm:py-4 text-xs sm:text-sm font-medium flex items-center justify-center gap-1 sm:gap-2 
                ${
                  activeTab === "tagged"
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent border-b-2 border-gradient-to-r border-purple-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
            >
              <Tag size={14} />
              Tagged
            </button>
          </div>

          <div className="p-2 sm:p-4">
            {activeTab === "posts" && (
              <div>
                <div className="grid grid-cols-3 gap-1 sm:gap-2 md:gap-3">
                  {apiPosts.map((post) => (
                    <div
                      key={post._id}
                      className="relative group rounded-lg overflow-hidden aspect-square bg-gray-100"
                    >
                      <LinkPath to={`/post/${post._id}`}>
                        <img
                          src={post.mediaUrl}
                          alt={`Post ${post._id}`}
                          className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-300"
                        />
                      </LinkPath>
                    </div>
                  ))}
                </div>
                {apiPosts.length === 0 && (
                  <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-center">
                    <div className="bg-gray-100 p-4 sm:p-6 rounded-full mb-3 sm:mb-4">
                      <Grid
                        size={windowWidth > 640 ? 32 : 24}
                        className="text-gray-400"
                      />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                      No Posts Yet
                    </h3>
                    <p className="text-gray-500 text-sm sm:text-base max-w-xs sm:max-w-md">
                      {isCurrentUser
                        ? "You have not posted anything yet. Create your first post!"
                        : "The user has not posted anything yet. Check back later!"}
                    </p>
                  </div>
                )}
              </div>
            )}

            {activeTab === "saved" && (
              <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-center">
                <div className="bg-gray-100 p-4 sm:p-6 rounded-full mb-3 sm:mb-4">
                  <Bookmark
                    size={windowWidth > 640 ? 32 : 24}
                    className="text-gray-400"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  Your Saved Posts
                </h3>
                <p className="text-gray-500 text-sm sm:text-base max-w-xs sm:max-w-md">
                  {isCurrentUser ? (
                    <LinkPath
                      to="/bookmarks"
                      className="text-purple-600 hover:underline"
                    >
                      View all saved posts
                    </LinkPath>
                  ) : (
                    "Only the user can view their saved posts"
                  )}
                </p>
              </div>
            )}

            {activeTab === "tagged" && (
              <div className="py-8 sm:py-12 flex flex-col items-center justify-center text-center">
                <div className="bg-gray-100 p-4 sm:p-6 rounded-full mb-3 sm:mb-4">
                  <Tag
                    size={windowWidth > 640 ? 32 : 24}
                    className="text-gray-400"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">
                  Photos of You
                </h3>
                <p className="text-gray-500 text-sm sm:text-base max-w-xs sm:max-w-md">
                  When people tag you in photos, they'll appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showFollowersModal && (
        <FollowersFollowingModal
          type="followers"
          onClose={() => {
            setShowFollowersModal(false);
            setSearchTerm("");
          }}
        />
      )}

      {showFollowingModal && (
        <FollowersFollowingModal
          type="following"
          onClose={() => {
            setShowFollowingModal(false);
            setSearchTerm("");
          }}
        />
      )}

      <CreatePost
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
        onPostCreated={handlePostCreated}
      />
    </Layout>
  );
};

export default MyProfile;
