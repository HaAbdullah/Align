import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import fullLogo from "../assets/full_logo_wide.png";

const Footer = () => {
  const { currentUser } = useAuth();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left: Logo + tagline */}
          <div className="flex flex-col gap-3">
            <Link to="/">
              <img src={fullLogo} alt="Align" className="h-8 w-auto object-contain" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              AI-powered resumes, tailored to every job.
            </p>
            <p className="text-gray-600 text-xs">
              © {new Date().getFullYear()} Align. All rights reserved.
            </p>
          </div>

          {/* Center: Navigation */}
          <div className="flex flex-col gap-3">
            <p className="text-gray-300 font-semibold text-sm uppercase tracking-wider mb-1">
              Product
            </p>
            <Link to="/" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
              Home
            </Link>
            <Link to="/about" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
              About
            </Link>
            <Link to="/pricing" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
              Pricing
            </Link>
            <Link to="/contact" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
              Contact
            </Link>
          </div>

          {/* Right: Legal + Account */}
          <div className="flex flex-col gap-3">
            <p className="text-gray-300 font-semibold text-sm uppercase tracking-wider mb-1">
              Account
            </p>
            {currentUser ? (
              <>
                <Link to="/dashboard" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
                  Dashboard
                </Link>
                <Link to="/saved-documents" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
                  My Documents
                </Link>
                <Link to="/settings" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
                  Settings
                </Link>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
                  Log In
                </Link>
                <Link to="/signup" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">
                  Sign Up Free
                </Link>
              </>
            )}
            <div className="border-t border-gray-800 pt-3 mt-1 flex flex-col gap-2">
              <Link to="/privacy" className="text-gray-500 hover:text-gray-400 text-xs transition-colors">
                Privacy Policy
              </Link>
              <Link to="/terms" className="text-gray-500 hover:text-gray-400 text-xs transition-colors">
                Terms of Service
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom strip */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center">
          <p className="text-gray-600 text-xs">
            Built with ❤️ for job seekers everywhere
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
