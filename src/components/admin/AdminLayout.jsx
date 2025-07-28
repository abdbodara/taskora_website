import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import AdminSidebar from "./AdminSidebar";

const AdminLayout = ({ children }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      const sidebar = document.getElementById('admin-sidebar');
      const menuButton = document.getElementById('mobile-menu-button');

      if (isMobileMenuOpen &&
        !sidebar?.contains(e.target) &&
        !menuButton?.contains(e.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileMenuOpen]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row relative">
      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-30 bg-white shadow-sm">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center">
            <button
              id="mobile-menu-button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 p-2 rounded-md"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="ml-2 text-xl font-semibold text-gray-800">
              Storyline Admin
            </h1>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <div
        id="admin-sidebar"
        className={`fixed inset-y-0 left-0 transform ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 z-40 transition-transform duration-300 ease-in-out w-64`}
      >
        <AdminSidebar />
      </div>

      {/* Backdrop for mobile */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content */}
      <main className="flex-1 md:ml-64 transition-all duration-300 pt-14 md:pt-0">
        <div className="p-4 md:p-6">
          {children}
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 mt-8 py-4 px-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Storyline Admin. All rights reserved.</p>
          <p className="mt-1 text-xs">v1.0.0</p>
        </footer>
      </main>

      {/* Scroll to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white p-3 rounded-full shadow-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 z-20"
        aria-label="Scroll to top"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
};

export default AdminLayout;
