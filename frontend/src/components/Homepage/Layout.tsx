
import React from "react";
import Sidebar from "../Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  showSidebars?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, showSidebars = true }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <main className="flex-grow container px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {showSidebars && (
            <div className="hidden lg:block lg:col-span-3">
              <Sidebar />
            </div>
          )}
          
          <div className={`col-span-1 ${showSidebars ? 'lg:col-span-9' : 'lg:col-span-12'}`}>
            {children}
          </div>
        </div>
        
        {showSidebars && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden z-40">
            <div className="flex justify-around items-center py-2">
              <MobileNavItem icon="home" label="Home" path="/" />
              <MobileNavItem icon="search" label="Explore" path="/explore" />
              <MobileNavItem icon="bell" label="Notifications" path="/notifications" />
              <MobileNavItem icon="message-square" label="Messages" path="/messages" />
              <MobileNavItem icon="user" label="Profile" path="/profile" />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

// Mobile Navigation Item Component
const MobileNavItem = ({ icon, label, path }: { icon: string; label: string; path: string }) => {
  const navigate = window.location.pathname === path;
  
  // Import icons dynamically
  const getIcon = () => {
    switch (icon) {
      case "home":
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${navigate ? 'text-social-purple' : 'text-gray-600'}`}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
      case "search":
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${navigate ? 'text-social-purple' : 'text-gray-600'}`}><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>;
      case "bell":
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${navigate ? 'text-social-purple' : 'text-gray-600'}`}><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"></path><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"></path></svg>;
      case "message-square":
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${navigate ? 'text-social-purple' : 'text-gray-600'}`}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
      case "user":
        return <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`${navigate ? 'text-social-purple' : 'text-gray-600'}`}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
      default:
        return null;
    }
  };

  return (
    <a href={path} className="flex flex-col items-center px-3">
      {getIcon()}
      <span className={`text-xs mt-1 ${navigate ? 'text-social-purple font-medium' : 'text-gray-600'}`}>{label}</span>
    </a>
  );
};

export default Layout;
