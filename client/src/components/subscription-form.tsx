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
import { LightningIcon } from "@/components/newsdrip-logo";

const subscriptionSchema = z.object({
  contactMethod: z.enum(["email", "sms"]),
  email: z.string().email("Please enter a valid email address").optional(),
  phone: z.string().min(10, "Please enter a valid phone number").optional(),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  categoryIds: z.array(z.number()).min(1, "Please select at least one category"),
  website: z.string().optional(), // Honeypot field
  confirmSubscription: z.boolean().optional(), // Additional honeypot
  timestamp: z.number().optional(), // Timing validation
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
  const [formStartTime] = useState(Date.now());
  const { toast } = useToast();

  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useQuery({
    queryKey: ["/api/categories"],
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Type for categories
  interface Category {
    id: number;
    name: string;
    description: string;
  }

  const typedCategories = categories as Category[];

  const form = useForm<SubscriptionFormData>({
    resolver: zodResolver(subscriptionSchema),
    defaultValues: {
      contactMethod: "email",
      frequency: "weekly",
      categoryIds: [],
      website: "", // Honeypot field should remain empty
      confirmSubscription: false, // Additional honeypot
      timestamp: formStartTime,
    },
  });

  const contactMethod = form.watch("contactMethod");

  const subscribeMutation = useMutation({
    mutationFn: async (data: SubscriptionFormData) => {
      try {
        const response = await apiRequest("POST", "/api/subscribe", data);
        return await response.json();
      } catch (error) {
        console.error("Subscription error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      setIsSubscribed(true);
      toast({
        title: "Successfully subscribed!",
        description: "You'll start receiving updates based on your preferences.",
      });
    },
    onError: (error) => {
      console.error("Subscription mutation error:", error);
      toast({
        title: "Subscription failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SubscriptionFormData) => {
    // Add timing validation
    const submissionData = {
      ...data,
      timestamp: formStartTime,
      submissionTime: Date.now() - formStartTime
    };
    subscribeMutation.mutate(submissionData);
  };

  if (isSubscribed) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-8 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <LightningIcon className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-2xl font-bold text-primary mb-2">Welcome to NewsDrip!</h3>
          <p className="text-muted-foreground mb-6">
            Thank you for subscribing! You'll receive curated news updates based on your preferences.
            <br />The gist of what matters, delivered fast.
          </p>
          <Button
            variant="outline"
            onClick={() => setIsSubscribed(false)}
            data-testid="button-subscribe-another"
          >
            Subscribe Another Contact
          </Button>
        </div>
      </div>
    );
  }

  // Handle loading and error states
  if (categoriesLoading) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Stay Informed
          </h2>
          <p className="text-muted-foreground text-lg">
            Loading subscription options...
          </p>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-10 bg-muted rounded"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (categoriesError) {
    return (
      <div className="bg-card rounded-xl shadow-sm border border-border p-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Stay Informed
          </h2>
          <p className="text-destructive text-lg">
            Unable to load subscription options. Please refresh the page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm border border-border p-8">
      <div className="mb-8 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-2">
          Stay Informed
        </h2>
        <p className="text-muted-foreground text-lg">
          Get the gist of what matters. No fluff, just the essentials.
        </p>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Contact Method Selection */}
          <FormField
            control={form.control}
            name="contactMethod"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base font-medium text-foreground">
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

          {/* Hidden honeypot fields - invisible to users, detectable by bots */}
          <div className="hidden" aria-hidden="true">
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Leave this field empty"
                      {...field}
                      tabIndex={-1}
                      autoComplete="off"
                      data-testid="honeypot-website"
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="confirmSubscription"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      tabIndex={-1}
                      data-testid="honeypot-confirm"
                    />
                    <Label>I want to unsubscribe</Label>
                  </div>
                </FormItem>
              )}
            />
          </div>

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
                      data-testid="input-email"
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
                <FormLabel className="text-base font-medium text-foreground">
                  Choose your interests
                </FormLabel>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                  {typedCategories.map((category) => (
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
                          <FormLabel className="text-sm font-medium text-[#ffffff]">
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
                <FormLabel className="text-base font-medium text-foreground">How often would you like to receive updates?</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-frequency">
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
