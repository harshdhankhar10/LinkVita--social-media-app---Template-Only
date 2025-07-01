import { Link } from "react-router-dom";
import {
  Home,
  Search,
  PlusSquare,
  Heart,
  User,
  MessageCircle,
  Clapperboard,
  Bell,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import "../components/Homepage/custom.css";

interface User {
  userName?: string;
  fullName?: string;
  profilePicture: string;
}

const Navbar = () => {
  const { auth }  = useAuth();
  const userInfo = auth?.user;
  
  const [user, setUser] = useState<User>({
    userName: "",
    fullName: "",
    profilePicture: ""
  });

  useEffect(()=>{
    if(auth){
      setUser({
        userName: userInfo?.userName || "",
        fullName: userInfo?.fullName || "",
        profilePicture: userInfo?.profilePicture || ""
      })
    }
  }, [auth])

  
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const stories = [
    {
      id: "1",
      username: "traveler",
      fullname: "Travel Enthusiast",
      avatar: "https://i.pravatar.cc/150?img=1",
      isLive: true,
    },
    {
      id: "2",
      username: "chef",
      fullname: "Master Chef",
      avatar: "https://i.pravatar.cc/150?img=3",
      hasUnseen: true,
    },
    {
      id: "3",
      username: "artist",
      fullname: "Digital Artist",
      avatar: "https://i.pravatar.cc/150?img=5",
      isReel: true,
    },
    {
      id: "4",
      username: "gamer",
      fullname: "Pro Gamer",
      avatar: "https://i.pravatar.cc/150?img=7",
      isLive: false,
    },
    {
      id: "5",
      username: "photographer",
      fullname: "Nature Photographer",
      avatar: "https://i.pravatar.cc/150?img=9",
      hasUnseen: true,
    },
    {
      id: "6",
      username: "musician",
      fullname: "Music Producer",
      avatar: "https://i.pravatar.cc/150?img=11",
      isReel: true,
    },
    {
      id: "7",
      username: "explorer",
      fullname: "World Explorer",
      avatar: "https://i.pravatar.cc/150?img=13",
      isLive: true,
    },
    {
      id: "8",
      username: "dancer",
      fullname: "Professional Dancer",
      avatar: "https://i.pravatar.cc/150?img=15",
      hasUnseen: true,
    },
    {
      id: "9",
      username: "writer",
      fullname: "Bestselling Author",
      avatar: "https://i.pravatar.cc/150?img=17",
      isReel: true,
    },
    {
      id: "10",
      username: "designer",
      fullname: "UI/UX Designer",
      avatar: "https://i.pravatar.cc/150?img=19",
      isLive: false,
    },
  ];

  const StoryReel = ({ className = "" }) => (
    <div
      className={`flex space-x-4 overflow-x-auto hide-scrollbar lg:max-w-xl ${className} lg:relative  lg:left-86`}
    >
      {stories.map((story) => (
        <div
          key={story.id}
          className="flex-shrink-0 flex flex-col items-center relative"
        >
          <Link
            to={`/${story.isReel ? "reels" : "stories"}/${story.id}`}
            className="group flex flex-col items-center"
          >
            <div
              className={`w-12 h-12 md:w-14 md:h-14 rounded-full p-0.5 mb-1 ${
                story.hasUnseen
                  ? "bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600"
                  : "bg-gray-200"
              }`}
            >
              <div className="w-full h-full rounded-full border-2 border-white overflow-hidden">
                <img
                  src={story.avatar}
                  alt={story.username}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <p className="text-xs font-medium text-gray-700 truncate max-w-[70px]">
              {story.username}
            </p>
            {story.isLive && (
              <div className="absolute top-0 right-0 bg-red-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                LIVE
              </div>
            )}
            {story.isReel && (
              <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs px-1 py-0.5 rounded-full font-bold">
                REEL
              </div>
            )}
          </Link>
        </div>
      ))}
    </div>
  );

  const ProfileSection = () => (
    <div className="hidden lg:flex items-center space-x-4 lg:relative lg:right-24">
      <Link
        to={`/profile/${user?.userName}`}
        className="flex items-center gap-3 px-3 py-2"
      >
        <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-indigo-200 shadow-sm">
          <img
            src={user?.profilePicture || "https://i.pravatar.cc/150?img=random"}
            alt={user?.userName}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex flex-col leading-tight">
          <span className="text-md font-semibold text-gray-900">
            {user?.userName || "@anonymous"}
          </span>
          <span className="text-xm text-gray-500">
            {user?.fullName || "Anonymous User"}
          </span>
        </div>
      </Link>
    </div>
  );
  

  return (
    <div className="flex flex-col">
      <div
        className={`w-full py-4 transition-all duration-300 ${
          scrolled ? "shadow-sm" : ""
        }`}
      >
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="hidden lg:flex items-center justify-between h-16">
          

            <div className="hidden lg:flex flex-1 mx-8">
              <StoryReel className="justify-center" />
            </div>

            <ProfileSection />
          </div>
        </div>

        <div className="lg:hidden w-full bg-white border-t border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <StoryReel />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;