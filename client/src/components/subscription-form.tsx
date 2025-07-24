import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const subscriptionSchema = z.object({
  contactMethod: z.enum(["email", "sms"]),
  email: z.string().email("Please enter a valid email address").optional(),
  phone: z.string().min(10, "Please enter a valid phone number").optional(),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  categoryIds: z.array(z.number()).min(1, "Please select at least one category"),
}).refine((data) => {
  if (data.contactMethod === "email" && !data.email) {
    return false;
  }
  if (data.contactMethod === "sms" && !data.phone) {
    return false;
  }
  return true;
}, {
  message: "Please provide contact information for your selected method",
  path: ["email"],
});

type SubscriptionFormData = z.infer<typeof subscriptionSchema>;

export default function SubscriptionForm() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      contactMethod: "email",
      frequency: "weekly",
      categoryIds: [],
    },
  });

  const contactMethod = form.watch("contactMethod");

  const subscribeMutation = useMutation({
    mutationFn: async (data: SubscriptionFormData) => {
      const response = await apiRequest("POST", "/api/subscribe", data);
      return await response.json();
    },
    onSuccess: () => {
      setIsSubscribed(true);
      toast({
        title: "Successfully subscribed!",
        description: "You'll start receiving updates based on your preferences.",
      });
    },
    onError: (error) => {
      toast({
        title: "Subscription failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubscriptionFormData) => {
    subscribeMutation.mutate(data);
  };

  if (isSubscribed) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
        <div className="mb-4">
          <i className="fas fa-check-circle text-4xl text-secondary"></i>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">You're all set!</h3>
        <p className="text-gray-600 mb-6">
          Thank you for subscribing. You'll receive updates based on your selected preferences.
        </p>
        <Button
          variant="outline"
          onClick={() => setIsSubscribed(false)}
        >
          Subscribe Another Contact
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Contact Method Selection */}
          <FormField
            control={form.control}
            name="contactMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium text-gray-900">
                  How would you like to receive updates?
                </FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="mt-4 space-y-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email" />
                      <Label htmlFor="email" className="flex items-center">
                        <i className="fas fa-envelope mr-2 text-gray-400"></i>
                        Email notifications
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="sms" id="sms" />
                      <Label htmlFor="sms" className="flex items-center">
                        <i className="fas fa-sms mr-2 text-gray-400"></i>
                        SMS text messages
                      </Label>
                    </div>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Contact Information */}
          {contactMethod === "email" && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {contactMethod === "sms" && (
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter your phone number"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {/* Category Preferences */}
          <FormField
            control={form.control}
            name="categoryIds"
            render={() => (
              <FormItem>
                <FormLabel className="text-base font-medium text-gray-700">
                  Choose your interests
                </FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {(categories || []).map((category: any) => (
                    <FormField
                      key={category.id}
                      control={form.control}
                      name="categoryIds"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(category.id)}
                              onCheckedChange={(checked) => {
                                const current = field.value || [];
                                if (checked) {
                                  field.onChange([...current, category.id]);
                                } else {
                                  field.onChange(current.filter((id) => id !== category.id));
                                }
                              }}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-medium text-gray-700">
                            {category.name}
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Frequency Selection */}
          <FormField
            control={form.control}
            name="frequency"
            render={({ field }) => (
              <FormItem>
                <FormLabel>How often would you like to receive updates?</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full"
            disabled={subscribeMutation.isPending}
          >
            {subscribeMutation.isPending ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Subscribing...
              </>
            ) : (
              <>
                <i className="fas fa-bell mr-2"></i>
                Subscribe Now
              </>
            )}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            By subscribing, you agree to receive updates. You can unsubscribe at any time.
          </p>
        </form>
      </Form>
    </div>
  );
}
