import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { LayoutDashboard, Users, Package, LogOut, Menu, X } from "lucide-react";

const AdminSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Get user data from localStorage on component mount
  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  }, []);

  const navItemBase =
    "flex items-center gap-3 px-2 py-2 rounded-md transition-all ease-in-out";

  const handleLinkClass = ({ isActive }) =>
    `${navItemBase} ${isActive
      ? "theme-bg-btn text-white font-medium"
      : "text-gray-800 hover:bg-gradient-to-r from-[#6C63FF] to-[#9C88FF] hover:text-white opacity-50"
    }`;
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // Navigation items configuration
  const navItems = [
    {
      title: 'Main',
      items: [
        { to: '/admin/dashboard', icon: <LayoutDashboard size={18} />, label: 'Dashboard' },
      ],
    },
    {
      title: 'Manage',
      items: [
        { to: '/admin/technicians', icon: <Users size={18} />, label: 'Technician Management' },
        { to: '/admin/tasks', icon: <Package size={18} />, label: 'Task Management' },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Menu Toggle */}
      {!isOpen && (
        <div className="md:hidden fixed top-4 left-4 z-50">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2.5 text-gray-600 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
        </div>
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-white to-gray-50 shadow-xl border-r border-gray-100 z-40 transform transition-all duration-300 ease-in-out flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#6C63FF] to-[#9C88FF] flex items-center justify-center text-white font-bold mr-2">
              S
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-[#6C63FF] to-[#9C88FF] bg-clip-text text-transparent">
              Storyline
            </h2>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1.5 text-gray-500 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-3 py-6 space-y-8 overflow-y-auto">
          {navItems.map((section, index) => (
            <div key={index} className="space-y-1">
              <p className="text-xs font-semibold text-gray-500 px-3 mb-2 uppercase tracking-wider text-nowrap">
                {section.title}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                        ? 'bg-gradient-to-r from-[#6C63FF]/10 to-[#9C88FF]/10 text-[#6C63FF] font-medium'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                      }`
                    }
                    onClick={() => setIsOpen(false)}
                  >
                    <span className={handleLinkClass({ isActive: location.pathname === item.to })}>
                      {item.icon}
                    </span>
                    <span className="text-sm font-medium text-nowrap">{item.label}</span>
                    {location.pathname === item.to && (
                      <span className="ml-auto w-1.5 h-1.5 bg-[#6C63FF] rounded-full"></span>
                    )}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* User & Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#9C88FF] flex items-center justify-center text-white font-medium">
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-gray-500 truncate">{user?.email || 'admin@example.com'}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="mt-3 w-full flex items-center gap-3 text-red-500 hover:bg-red-50 px-4 py-2.5 rounded-xl transition-colors duration-200 text-sm font-medium"
          >
            <LogOut size={18} className="flex-shrink-0" />
            Sign out
          </button>
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  );
};

export default AdminSidebar;
