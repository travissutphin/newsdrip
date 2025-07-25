import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { NewsDripLogo, LightningIcon } from "@/components/newsdrip-logo";

type View = "subscription" | "dashboard" | "newsletters" | "subscribers" | "analytics";

interface NavigationProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function Navigation({ currentView, onViewChange }: NavigationProps) {
  const { user } = useAuth();

  return (
    <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <NewsDripLogo size="md" />
          </div>
          
          {/* Navigation Tabs */}
          <nav className="hidden md:flex space-x-8">
            <button
              onClick={() => onViewChange("subscription")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                currentView === "subscription"
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
              }`}
              data-testid="nav-subscription"
            >
              Subscribe
            </button>
            <button
              onClick={() => onViewChange("dashboard")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                currentView === "dashboard"
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
              }`}
              data-testid="nav-dashboard"
            >
              Dashboard
            </button>
            <button
              onClick={() => onViewChange("newsletters")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                currentView === "newsletters"
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
              }`}
              data-testid="nav-newsletters"
            >
              Newsletters
            </button>
            <button
              onClick={() => onViewChange("subscribers")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                currentView === "subscribers"
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
              }`}
              data-testid="nav-subscribers"
            >
              Subscribers
            </button>
            <button
              onClick={() => onViewChange("analytics")}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                currentView === "analytics"
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground hover:border-border"
              }`}
              data-testid="nav-analytics"
            >
              Analytics
            </button>
          </nav>
          
          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm font-medium text-foreground">
                {user && typeof user === 'object' && 'email' in user ? String(user.email) : "Admin"}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.href = "/api/logout"}
              data-testid="button-logout"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
