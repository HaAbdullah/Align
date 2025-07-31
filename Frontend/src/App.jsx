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
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { UsageProvider } from "./context/UsageContext";

import "./App.css";
import "./firebase/firebase";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return children;
};

function AppContent() {
  const { currentUser } = useAuth();

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/success" element={<Success />} />
        <Route path="/saved-documents" element={<SavedDocuments />} />

        {/* Protected routes */}
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <Account />
            </ProtectedRoute>
          }
        />
        {/* Add more protected routes here when needed */}
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
