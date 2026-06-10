import { useAuth } from "../context/AuthContext";
import LandingPage from "./LandingPage";
import AppView from "./AppView";

const LoadingSpinner = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="w-10 h-10 border-2 border-gray-700 border-t-emerald-500 rounded-full animate-spin" />
  </div>
);

const Main = () => {
  const { currentUser, loading } = useAuth();

  if (loading) return <LoadingSpinner />;
  return currentUser ? <AppView /> : <LandingPage />;
};

export default Main;
