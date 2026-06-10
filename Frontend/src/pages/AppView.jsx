import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useUsage } from "../context/UsageContext";
import Chat from "../components/Chat";
import { FileText, TrendingUp, Zap } from "lucide-react";

const AppView = () => {
  const { currentUser } = useAuth();
  const { userTier, usageCount, getCurrentTierInfo, getRemainingGenerations } = useUsage();

  const currentTier = getCurrentTierInfo();
  const remaining = getRemainingGenerations();
  const isUnlimited = currentTier.limit === -1;
  const firstName = currentUser?.displayName?.split(" ")[0] || "there";
  const photoURL = currentUser?.photoURL;

  const usagePct = isUnlimited ? 100 : Math.round((usageCount / currentTier.limit) * 100);
  const isNearLimit = !isUnlimited && remaining <= 1;

  return (
    <div className="w-full min-h-screen bg-gray-900 text-gray-100">
      {/* Top strip — sits just below the navbar */}
      <div className="w-full bg-gray-900 border-b border-gray-800 pt-20">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between gap-4">

          {/* Left: avatar + greeting */}
          <div className="flex items-center gap-3">
            {photoURL ? (
              <img
                src={photoURL}
                alt={firstName}
                className="w-8 h-8 rounded-full object-cover border border-gray-700 flex-shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                {firstName[0].toUpperCase()}
              </div>
            )}
            <span className="text-gray-300 text-sm">
              Hey, <span className="text-white font-semibold">{firstName}</span>
            </span>
          </div>

          {/* Right: usage + actions */}
          <div className="flex items-center gap-4">
            {/* Usage */}
            <div className="flex items-center gap-2">
              {isUnlimited ? (
                <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium bg-emerald-900/30 border border-emerald-800/50 px-2.5 py-1 rounded-full">
                  <Zap className="w-3 h-3" />
                  Unlimited
                </span>
              ) : (
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${
                  isNearLimit
                    ? "text-yellow-400 bg-yellow-900/20 border-yellow-800/50"
                    : "text-gray-400 bg-gray-800 border-gray-700"
                }`}>
                  {usageCount}/{currentTier.limit} this month
                  {isNearLimit && " ·⚠"}
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-4 bg-gray-700" />

            {/* Documents */}
            <Link
              to="/saved-documents"
              className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Documents</span>
            </Link>

            {/* Upgrade */}
            {userTier !== "PREMIUM_PLUS" && (
              <Link
                to="/pricing"
                className="flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-full transition-colors"
              >
                <TrendingUp className="w-3 h-3" />
                Upgrade
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* The app */}
      <div className="w-full pt-8 pb-16">
        <Chat />
      </div>
    </div>
  );
};

export default AppView;
