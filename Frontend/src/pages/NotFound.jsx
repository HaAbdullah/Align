import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-center px-4">
      <p className="text-8xl font-bold text-emerald-500 mb-4">404</p>
      <h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-gray-400 mb-8 max-w-sm">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-full transition-all duration-200 hover:scale-105"
      >
        Back to Home
      </Link>
    </div>
  );
};

export default NotFound;
