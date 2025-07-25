import { useState } from "react";
import { Button } from "@/components/ui/button";
import { NewsDripLogo } from "@/components/newsdrip-logo";
import SubscriptionForm from "@/components/subscription-form";

export default function Landing() {
  const [showSubscription, setShowSubscription] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <NewsDripLogo size="md" />
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant={showSubscription ? "default" : "outline"}
                onClick={() => setShowSubscription(true)}
                data-testid="button-subscribe"
              >
                Subscribe
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-admin-login"
              >
                Admin Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <NewsDripLogo size="xl" className="justify-center mb-6" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            Get the news that matters.
            <span className="text-primary"> Fast.</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed">
            Skip the noise. NewsDrip delivers essential insights directly to your inbox. 
            The gist of what's happening, without the fluff.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={() => setShowSubscription(true)}
              data-testid="button-get-started"
              className="px-8 py-4 text-lg"
            >
              Get Started Free
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-admin-dashboard"
              className="px-8 py-4 text-lg"
            >
              Admin Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <SubscriptionForm />
      </main>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Choose NewsDrip?
            </h2>
            <p className="text-muted-foreground text-lg">
              Experience news consumption the way it should be
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">Get breaking news and insights delivered instantly to your inbox.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Curated Quality</h3>
              <p className="text-muted-foreground">Only the essential news that impacts your world. No clickbait.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Personalized</h3>
              <p className="text-muted-foreground">Choose your topics and frequency. Your news, your way.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
