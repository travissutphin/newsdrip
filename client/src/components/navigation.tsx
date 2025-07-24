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
    <>
      {/* Desktop Header */}
      <header className="brand-header border-b border-[hsl(var(--mint)/0.3)] sticky top-0 z-50 hidden sm:block">
        <div className="container-width section-padding">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-[hsl(var(--light-orange))]">NewsletterPro</h1>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8">
              <button
                onClick={() => onViewChange("subscription")}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  currentView === "subscription"
                    ? "text-[hsl(var(--light-orange))] border-[hsl(var(--light-orange))]"
                    : "text-[hsl(var(--mint))] border-transparent hover:text-[hsl(var(--light-orange))] hover:border-[hsl(var(--mint))]"
                }`}
              >
                Subscribe
              </button>
              <button
                onClick={() => onViewChange("dashboard")}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  currentView === "dashboard"
                    ? "text-[hsl(var(--light-orange))] border-[hsl(var(--light-orange))]"
                    : "text-[hsl(var(--mint))] border-transparent hover:text-[hsl(var(--light-orange))] hover:border-[hsl(var(--mint))]"
                }`}
              >
                Dashboard
              </button>
              <button
                onClick={() => onViewChange("newsletters")}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  currentView === "newsletters"
                    ? "text-[hsl(var(--light-orange))] border-[hsl(var(--light-orange))]"
                    : "text-[hsl(var(--mint))] border-transparent hover:text-[hsl(var(--light-orange))] hover:border-[hsl(var(--mint))]"
                }`}
              >
                Newsletters
              </button>
              <button
                onClick={() => onViewChange("subscribers")}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  currentView === "subscribers"
                    ? "text-[hsl(var(--light-orange))] border-[hsl(var(--light-orange))]"
                    : "text-[hsl(var(--mint))] border-transparent hover:text-[hsl(var(--light-orange))] hover:border-[hsl(var(--mint))]"
                }`}
              >
                Subscribers
              </button>
              <button
                onClick={() => onViewChange("analytics")}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  currentView === "analytics"
                    ? "text-[hsl(var(--light-orange))] border-[hsl(var(--light-orange))]"
                    : "text-[hsl(var(--mint))] border-transparent hover:text-[hsl(var(--light-orange))] hover:border-[hsl(var(--mint))]"
                }`}
              >
                Analytics
              </button>
          </nav>
          
            {/* User Profile */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                {user && 'profileImageUrl' in user && (user as any).profileImageUrl && (
                  <img 
                    className="h-8 w-8 rounded-full object-cover mr-2" 
                    src={(user as any).profileImageUrl} 
                    alt="Profile" 
                  />
                )}
                <span className="text-sm font-medium text-[hsl(var(--mint))]">
                  {(user && 'firstName' in user && (user as any).firstName) || 
                   (user && 'email' in user && (user as any).email) || 
                   "Admin"}
                </span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.location.href = "/api/logout"}
                className="border-[hsl(var(--mint))] text-[hsl(var(--mint))] hover:bg-[hsl(var(--mint))] hover:text-[hsl(var(--deep-navy))]"
              >
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="brand-header border-b border-[hsl(var(--mint)/0.3)] sticky top-0 z-50 sm:hidden">
        <div className="container-width">
          <div className="flex justify-between items-center h-14 px-4">
            <h1 className="text-xl font-bold text-[hsl(var(--light-orange))]">NewsletterPro</h1>
            <div className="flex items-center">
              <span className="text-xs font-medium text-[hsl(var(--mint))]">
                {(user && 'firstName' in user && (user as any).firstName) || "Admin"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav">
        <button
          onClick={() => onViewChange("subscription")}
          className={`mobile-nav-item ${currentView === "subscription" ? "active" : ""}`}
        >
          <i className="fas fa-user-plus text-sm mb-1"></i>
          <span>Subscribe</span>
        </button>
        <button
          onClick={() => onViewChange("dashboard")}
          className={`mobile-nav-item ${currentView === "dashboard" ? "active" : ""}`}
        >
          <i className="fas fa-chart-line text-sm mb-1"></i>
          <span>Dashboard</span>
        </button>
        <button
          onClick={() => onViewChange("newsletters")}
          className={`mobile-nav-item ${currentView === "newsletters" ? "active" : ""}`}
        >
          <i className="fas fa-newspaper text-sm mb-1"></i>
          <span>Newsletters</span>
        </button>
        <button
          onClick={() => onViewChange("subscribers")}
          className={`mobile-nav-item ${currentView === "subscribers" ? "active" : ""}`}
        >
          <i className="fas fa-users text-sm mb-1"></i>
          <span>Subscribers</span>
        </button>
        <button
          onClick={() => onViewChange("analytics")}
          className={`mobile-nav-item ${currentView === "analytics" ? "active" : ""}`}
        >
          <i className="fas fa-chart-bar text-sm mb-1"></i>
          <span>Analytics</span>
        </button>
      </nav>
    </>
  );
}
