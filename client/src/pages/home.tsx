import { useState } from "react";
import Navigation from "@/components/navigation";
import SubscriptionView from "@/pages/subscription";
import NewslettersView from "@/pages/newsletters";
import SubscribersView from "@/pages/subscribers";
import AnalyticsView from "@/pages/analytics";
import { useQuery } from "@tanstack/react-query";

type View = "subscription" | "dashboard" | "newsletters" | "subscribers" | "analytics";

export default function Home() {
  const [currentView, setCurrentView] = useState<View>("dashboard");

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["/api/admin/dashboard"],
    enabled: currentView === "dashboard",
  });

  const renderView = () => {
    switch (currentView) {
      case "subscription":
        return <SubscriptionView />;
      case "newsletters":
        return <NewslettersView />;
      case "subscribers":
        return <SubscribersView />;
      case "analytics":
        return <AnalyticsView />;
      default:
        return <DashboardView data={dashboardData} isLoading={isLoading} />;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-16 sm:pb-0">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="container-width section-padding">
        {renderView()}
      </main>
    </div>
  );
}

function DashboardView({ data, isLoading }: { data: any; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Hero Section */}
        <div className="brand-hero rounded-lg p-6 sm:p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--deep-navy))] mb-2">Dashboard Overview</h2>
          <p className="text-[hsl(var(--deep-navy)/0.8)] text-sm sm:text-base">Monitor your newsletter performance and subscriber engagement</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 animate-pulse">
              <div className="h-3 sm:h-4 bg-muted rounded mb-2"></div>
              <div className="h-6 sm:h-8 bg-muted rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="brand-hero rounded-lg p-6 sm:p-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--deep-navy))] mb-2">Dashboard Overview</h2>
        <p className="text-[hsl(var(--deep-navy)/0.8)] text-sm sm:text-base">Monitor your newsletter performance and subscriber engagement</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-users text-xl sm:text-2xl text-[hsl(var(--sage-green))]"></i>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Subscribers</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{data.subscriberStats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-envelope text-xl sm:text-2xl text-primary"></i>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Newsletters Sent</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{data.newsletterStats.sent}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-chart-line text-xl sm:text-2xl text-accent-foreground"></i>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Open Rate</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{data.deliveryStats.openRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-user-plus text-xl sm:text-2xl text-secondary"></i>
            </div>
            <div className="ml-3 sm:ml-4">
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">New This Week</p>
              <p className="text-lg sm:text-2xl font-bold text-foreground">{data.subscriberStats.newThisWeek}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
