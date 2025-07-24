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
    <div className="min-h-screen bg-background">
      <Navigation currentView={currentView} onViewChange={setCurrentView} />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {renderView()}
      </main>
    </div>
  );
}

function DashboardView({ data, isLoading }: { data: any; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
          <p className="text-gray-600">Monitor your newsletter performance and subscriber engagement</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
        <p className="text-gray-600">Monitor your newsletter performance and subscriber engagement</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-users text-2xl text-primary"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Subscribers</p>
              <p className="text-2xl font-bold text-gray-900">{data.subscriberStats.total}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-envelope text-2xl text-secondary"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Newsletters Sent</p>
              <p className="text-2xl font-bold text-gray-900">{data.newsletterStats.sent}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-chart-line text-2xl text-accent"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Open Rate</p>
              <p className="text-2xl font-bold text-gray-900">{data.deliveryStats.openRate}%</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <i className="fas fa-user-plus text-2xl text-secondary"></i>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">New This Week</p>
              <p className="text-2xl font-bold text-gray-900">{data.subscriberStats.newThisWeek}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
