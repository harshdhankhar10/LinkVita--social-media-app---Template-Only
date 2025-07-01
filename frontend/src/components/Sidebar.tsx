import { Link } from "react-router-dom";
import { Home, Users, Bell, Bookmark, User, Settings, TrendingUp, MessageSquare } from "lucide-react";
import { useLocation } from "react-router-dom";

const Sidebar = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const menuItems = [
    { name: "Home", icon: Home, path: "/", active: currentPath === "/" },
    { name: "Explore", icon: TrendingUp, path: "/explore", active: currentPath === "/explore" },
    { name: "Notifications", icon: Bell, path: "/notifications", active: currentPath === "/notifications", notifications: 5 },
    { name: "Messages", icon: MessageSquare, path: "/messages", active: currentPath === "/messages", notifications: 2 },
    { name: "Bookmarks", icon: Bookmark, path: "/bookmarks", active: currentPath === "/bookmarks" },
    { name: "Communities", icon: Users, path: "/communities", active: currentPath === "/communities" },
    { name: "Profile", icon: User, path: "/profile", active: currentPath === "/profile" },
    { name: "Settings", icon: Settings, path: "/settings", active: currentPath === "/settings" },
  ];

  return (
    <div className="fixed top-0 h-screen w-64 bg-white border-r border-gray-200 flex flex-col overflow-y-auto">
      <div className="px-6 py-5 border-b border-gray-200">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            LinkVita
          </span>
        </Link>
      </div>

      <div className="flex-1 px-3 py-4">
        <nav>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    item.active
                      ? "bg-purple-50 text-purple-600 font-medium"
                      : "hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${item.active ? "text-purple-600" : "text-gray-500"}`} />
                  <span className="text-sm">{item.name}</span>
                  {item.notifications && (
                    <div className="ml-auto bg-pink-500 text-white text-xs font-medium h-5 min-w-5 rounded-full flex items-center justify-center px-1">
                      {item.notifications}
                    </div>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      
      <div className="px-3 pb-6">
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-gray-100">
          <h4 className="font-medium text-sm mb-2 text-gray-900">Premium Membership</h4>
          <p className="text-xs text-gray-600 mb-3">Unlock exclusive features and enhance your experience!</p>
          <button className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">
            Upgrade Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;