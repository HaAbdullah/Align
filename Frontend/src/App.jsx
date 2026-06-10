import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Main from "./pages/Main";
import SignUp from "./pages/SignUp";
import Login from "./pages/Login";
import Account from "./pages/Account";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Pricing from "./pages/Pricing";
import Success from "./pages/Success";
import SavedDocuments from "./pages/SavedDocuments";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Settings from "./pages/Settings";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UsageProvider } from "./context/UsageContext";

import "./App.css";
import "./firebase/firebase";

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-gray-700 border-t-emerald-500 rounded-full animate-spin" />
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!currentUser) return <Navigate to="/login" />;
  return children;
};

function AppContent() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/success" element={<Success />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/help" element={<Navigate to="/contact" replace />} />

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/saved-documents"
          element={
            <ProtectedRoute>
              <SavedDocuments />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <UsageProvider>
          <AppContent />
        </UsageProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
