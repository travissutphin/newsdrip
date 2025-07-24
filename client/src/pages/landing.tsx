import { useState } from "react";
import { Button } from "@/components/ui/button";
import SubscriptionForm from "@/components/subscription-form";

export default function Landing() {
  const [showSubscription, setShowSubscription] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary">NewsletterPro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={showSubscription ? "default" : "outline"}
                onClick={() => setShowSubscription(true)}
              >
                Subscribe
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/api/login"}
              >
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <SubscriptionForm />
      </main>
    </div>
  );
}
