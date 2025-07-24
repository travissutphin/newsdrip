import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";

type View = "subscription" | "dashboard" | "newsletters" | "subscribers" | "analytics";

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-primary">NewsletterPro</h1>
          </div>
          
          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => onViewChange("subscription")}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                currentView === "subscription"
                  ? "text-primary border-primary"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Subscribe
            </button>
            <button
              onClick={() => onViewChange("dashboard")}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                currentView === "dashboard"
                  ? "text-primary border-primary"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => onViewChange("newsletters")}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                currentView === "newsletters"
                  ? "text-primary border-primary"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Newsletters
            </button>
            <button
              onClick={() => onViewChange("subscribers")}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                currentView === "subscribers"
                  ? "text-primary border-primary"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Subscribers
            </button>
            <button
              onClick={() => onViewChange("analytics")}
              className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                currentView === "analytics"
                  ? "text-primary border-primary"
                  : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Analytics
            </button>
          </nav>
          
          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-700">
                {user && typeof user === 'object' && 'email' in user ? String(user.email) : "Admin"}
              </span>
            </div>
            <button
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-3 py-1 rounded text-sm"
              onClick={() => window.location.href = "/api/logout"}
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
