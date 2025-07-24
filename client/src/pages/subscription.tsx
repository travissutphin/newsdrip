import SubscriptionForm from "@/components/subscription-form";

export default function SubscriptionView() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">Stay Informed</h2>
        <p className="text-lg text-gray-600">Get the latest updates delivered straight to your inbox or phone. Choose your preferred topics and delivery method.</p>
      </div>
      <SubscriptionForm />
    </div>
  );
}
