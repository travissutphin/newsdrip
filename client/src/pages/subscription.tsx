import SubscriptionForm from "@/components/subscription-form";

export default function SubscriptionView() {
  return (
    <div className="max-w-2xl mx-auto">
      {/* Hero Section */}
      <div className="brand-hero rounded-lg p-6 sm:p-8 text-center mb-6 sm:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--deep-navy))] mb-4">Stay Informed</h2>
        <p className="text-sm sm:text-lg text-[hsl(var(--deep-navy)/0.8)]">Get the latest updates delivered straight to your inbox or phone. Choose your preferred topics and delivery method.</p>
      </div>
      <SubscriptionForm />
    </div>
  );
}
