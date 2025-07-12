import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import defaultUserIcon from "../assets/user.svg";
import fullLogo from "../assets/full_logo_wide.png";

const Navbar = () => {
  const { currentUser } = useAuth();
  const isAuthenticated = !!currentUser;

  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Force dark mode always
    document.documentElement.classList.add("dark");
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    handleResize();
    window.addEventListener("scroll", handleScroll);
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);

  const handleNavClick = () => {
    if (mobileMenuOpen) setMobileMenuOpen(false);
  };

  const baseBg = scrolled
    ? "bg-gray-800 bg-opacity-90 backdrop-blur-sm shadow-lg rounded-full"
    : "bg-gray-800";

  // Mobile version
  if (isMobile) {
    return (
      <>
        <div
          className={`fixed top-0 left-0 right-0 w-full flex justify-between items-center px-4 py-4 ${baseBg} z-50 transition-all duration-300`}
        >
          <Link to="/" className="flex items-center space-x-2">
            <img
              src={fullLogo}
              alt="Align Logo"
              className="w-10 h-10 sm:w-12 sm:h-12 object-contain -ml-4"
            />
          </Link>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Dashboard button - only show if authenticated */}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className="bg-emerald-600 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-opacity-90 text-xs sm:text-sm transition-all duration-300 shadow-sm"
              >
                Dashboard
              </Link>
            )}

            {/* Menu toggle */}
            <button
              onClick={toggleMobileMenu}
              className="text-gray-200 focus:outline-none p-1"
              aria-label="Toggle menu"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>

            {isAuthenticated ? (
              <Link to="/account">
                <img
                  src={currentUser?.photoURL || defaultUserIcon}
                  alt="Profile"
                  className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover cursor-pointer border-2 border-emerald-500"
                />
              </Link>
            ) : (
              <Link
                to="/signup"
                className="bg-emerald-600 text-white font-semibold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full hover:bg-opacity-90 text-xs sm:text-sm transition-all duration-300 shadow-sm"
              >
                Sign Up
              </Link>
            )}
          </div>
        </div>

        <div
          className={`fixed top-16 sm:top-20 inset-x-0 z-40 bg-gray-900 shadow-md transform transition-transform duration-300 ${
            mobileMenuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="px-4 py-3 space-y-2">
            {["/", "/Align", "/contact"].map((path, i) => (
              <Link
                key={path}
                to={path}
                onClick={handleNavClick}
                className="block py-2 text-gray-100 hover:text-emerald-400 transition-colors font-bold"
              >
                {["Home", "About Align", "Contact Us"][i]}
              </Link>
            ))}
            {/* Dashboard in mobile menu - only show if authenticated */}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                onClick={handleNavClick}
                className="block py-2 text-gray-100 hover:text-emerald-400 transition-colors"
              >
                Dashboard
              </Link>
            )}
            {!isAuthenticated && (
              <Link
                to="/login"
                onClick={handleNavClick}
                className="block py-2 text-gray-100 hover:text-emerald-400 transition-colors"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </>
    );
  }

  // Desktop version with proper grid layout for perfect centering
  return (
    <div
      className={`${
        scrolled ? "px-7 py-3.5" : "px-8 py-4"
      } z-50 transition-all duration-300 ${
        scrolled
          ? "fixed top-4 left-4 right-4 mx-auto max-w-5xl"
          : "absolute top-0 left-0 right-0 w-full"
      } ${baseBg}`}
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-center w-full gap-4">
        {/* Left section - Logo */}
        <div className="flex">
          <Link to="/" className="flex items-center flex-shrink-0">
            <img
              src={fullLogo}
              alt="Align Logo"
              className={`object-contain -ml-4 ${
                scrolled
                  ? "h-6 w-auto lg:h-7 lg:w-auto"
                  : "h-7 w-auto lg:h-8 lg:w-auto"
              }`}
            />
          </Link>
        </div>

        {/* Center section - Navigation */}
        <div className="flex justify-center ml-40">
          <div
            className={`hidden lg:flex items-center ${
              scrolled ? "space-x-7" : "space-x-8"
            }`}
          >
            {["/", "/Align", "/contact"].map((path, i) => (
              <Link
                key={path}
                to={path}
                className={`text-gray-100 hover:text-emerald-400 transition-colors whitespace-nowrap font-bold ${
                  scrolled ? "text-base" : "text-lg"
                }`}
              >
                {["Home", "About Align", "Contact Us"][i]}
              </Link>
            ))}
          </div>
        </div>

        {/* Right section - Buttons */}
        <div className="flex justify-end">
          <div
            className={`flex items-center flex-shrink-0 ${
              scrolled ? "space-x-3" : "space-x-4"
            }`}
          >
            {/* Pricing button */}
            <Link
              to="/pricing"
              className={`bg-emerald-600 text-white font-semibold rounded-full hover:bg-opacity-90 transition-colors shadow-sm whitespace-nowrap ${
                scrolled ? "px-5 py-2.5 text-base" : "px-6 py-2.5 text-lg"
              }`}
            >
              Pricing
            </Link>

            {/* Dashboard button - only show if authenticated */}
            {isAuthenticated && (
              <Link
                to="/dashboard"
                className={`bg-emerald-600 text-white font-semibold rounded-full hover:bg-opacity-90 transition-colors shadow-sm whitespace-nowrap ${
                  scrolled ? "px-5 py-2.5 text-base" : "px-6 py-2.5 text-lg"
                }`}
              >
                Dashboard
              </Link>
            )}

            {isAuthenticated ? (
              <Link to="/account" className="flex-shrink-0">
                <img
                  src={currentUser?.photoURL || defaultUserIcon}
                  alt="Profile"
                  className={`rounded-full object-cover cursor-pointer border-2 border-emerald-500 ${
                    scrolled ? "w-9 h-9" : "w-10 h-10"
                  }`}
                />
              </Link>
            ) : (
              <div
                className={`flex items-center ${
                  scrolled ? "space-x-3" : "space-x-4"
                }`}
              >
                <Link
                  to="/login"
                  className={`text-emerald-400 font-semibold hover:text-emerald-300 transition-colors whitespace-nowrap hidden xl:block ${
                    scrolled ? "text-base" : "text-lg"
                  }`}
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className={`bg-emerald-600 text-white font-semibold rounded-full hover:bg-opacity-90 transition-colors shadow-sm whitespace-nowrap ${
                    scrolled ? "px-5 py-2.5 text-base" : "px-6 py-2.5 text-lg"
                  }`}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
