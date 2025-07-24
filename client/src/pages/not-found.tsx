import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, Home } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-900"
      data-testid="not-found-page"
    >
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6">
          <div className="flex items-center mb-4 gap-3">
            <AlertCircle className="h-8 w-8 text-red-500" data-testid="error-icon" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100" data-testid="error-title">
              404 - Page Not Found
            </h1>
          </div>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-400" data-testid="error-message">
            The page you're looking for doesn't exist or has been moved.
          </p>

          <div className="mt-6 flex gap-2">
            <Link href="/">
              <Button variant="default" className="flex items-center gap-2" data-testid="button-home">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
            <Button 
              variant="outline" 
              onClick={() => window.history.back()}
              data-testid="button-back"
            >
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
