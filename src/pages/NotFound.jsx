import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      <h1 className="text-6xl font-bold text-gray-400 mb-4">404</h1>
      <p className="text-xl text-gray-700 mb-4">Oops! Page not found.</p>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        The page you are looking for might have been removed, had its name
        changed, or is temporarily unavailable.
      </p>
      <Link
        to="/admin/dashboard"
        className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;
