import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { CheckCircle, Mail, MessageSquare, Clock } from "lucide-react";

const preferencesSchema = z.object({
  email: z.string().email("Please enter a valid email address").optional().or(z.literal("")),
  phone: z.string().min(10, "Please enter a valid phone number").optional().or(z.literal("")),
  contactMethod: z.enum(["email", "sms"]),
  frequency: z.enum(["daily", "weekly", "monthly"]),
  categoryIds: z.array(z.number()).min(1, "Please select at least one category"),
  isActive: z.boolean(),
}).refine((data) => {
  if (data.contactMethod === "email" && (!data.email || data.email === "")) {
    return false;
  }
  if (data.contactMethod === "sms" && (!data.phone || data.phone === "")) {
    return false;
  }
  return true;
}, {
  message: "Please provide contact information for your selected method",
  path: ["email"],
});

type PreferencesFormData = z.infer<typeof preferencesSchema>;

export default function PreferencesPage() {
  const [location] = useLocation();
  const { toast } = useToast();
  const [isUpdated, setIsUpdated] = useState(false);
  
  // Get token from URL params using window.location.search
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (!token) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-card rounded-lg shadow-sm border border-border p-8">
            <div className="text-primary mb-4">
              <Mail className="h-12 w-12 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Invalid Link</h1>
            <p className="text-muted-foreground">
              This preferences link is invalid or has expired. Please check your email for the latest link.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const { data: categories } = useQuery<any[]>({
    queryKey: ["/api/categories"],
    retry: 1,
  });

  const { data: subscriber, isLoading } = useQuery<any>({
    queryKey: ["/api/preferences", token],
    retry: false,
  });

  const form = useForm<PreferencesFormData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      email: "",
      phone: "",
      contactMethod: "email",
      frequency: "weekly",
      categoryIds: [],
      isActive: true,
    },
  });

  // Update form when subscriber data loads
  useEffect(() => {
    if (subscriber) {
      form.reset({
        email: subscriber.email || "",
        phone: subscriber.phone || "",
        contactMethod: subscriber.contactMethod || "email",
        frequency: subscriber.frequency || "weekly",
        categoryIds: subscriber.categories?.map((c: any) => c.id) || [],
        isActive: subscriber.isActive ?? true,
      });
    }
  }, [subscriber, form]);

  const contactMethod = form.watch("contactMethod");
  const isActive = form.watch("isActive");

  const updateMutation = useMutation({
    mutationFn: async (data: PreferencesFormData) => {
      const response = await apiRequest("PUT", `/api/preferences/${token}`, data);
      return await response.json();
    },
    onSuccess: (data) => {
      console.log("Update successful:", data);
      setIsUpdated(true);
      // Invalidate and refetch the preferences query to show updated data
      queryClient.invalidateQueries({ queryKey: ["/api/preferences", token] });
      toast({
        title: "Preferences Updated",
        description: "Your subscription preferences have been successfully updated.",
      });
    },
    onError: (error) => {
      console.error("Update preferences error:", error);
      console.error("Form errors:", form.formState.errors);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update preferences",
        variant: "destructive",
      });
    },
  });

  const unsubscribeMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/unsubscribe/${token}`, {});
      return await response.json();
    },
    onSuccess: (data) => {
      console.log("Unsubscribe successful:", data);
      setIsUpdated(true);
      // Invalidate and refetch the preferences query to show updated data
      queryClient.invalidateQueries({ queryKey: ["/api/preferences", token] });
      toast({
        title: "Unsubscribed",
        description: "You have been successfully unsubscribed from all newsletters.",
      });
      // Update form to reflect unsubscribed state
      form.setValue("isActive", false);
      form.setValue("categoryIds", []); // Clear all categories
    },
    onError: (error) => {
      console.error("Unsubscribe error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to unsubscribe",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PreferencesFormData) => {
    console.log("Form submitted with data:", data);
    console.log("Form validation errors:", form.formState.errors);
    console.log("Form is valid:", form.formState.isValid);
    
    // Clean up empty strings to undefined for API
    const cleanedData = {
      ...data,
      email: data.email || undefined,
      phone: data.phone || undefined,
    };
    
    console.log("Cleaned data for API:", cleanedData);
    updateMutation.mutate(cleanedData);
  };

  const handleUnsubscribe = () => {
    if (confirm("Are you sure you want to unsubscribe from all newsletters? This will deactivate your subscription and remove all category preferences.")) {
      console.log("Unsubscribing user...");
      unsubscribeMutation.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your preferences...</p>
        </div>
      </div>
    );
  }

  if (!subscriber) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-card rounded-lg shadow-sm border border-border p-8">
            <div className="text-primary mb-4">
              <Mail className="h-12 w-12 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Link Expired</h1>
            <p className="text-muted-foreground">
              This preferences link has expired or is no longer valid. Please subscribe again to manage your preferences.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (isUpdated && !isActive) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <div className="bg-card rounded-lg shadow-sm border border-border p-8">
            <div className="text-green-500 mb-4">
              <CheckCircle className="h-12 w-12 mx-auto" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-4">Unsubscribed</h1>
            <p className="text-muted-foreground">
              You have been successfully unsubscribed from all newsletters. We're sorry to see you go!
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              You can resubscribe anytime by visiting our website.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-card rounded-lg shadow-lg border border-border">
          {/* Header */}
          <div className="px-6 py-6 border-b border-border">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 2L3 14h6l-2 8 10-12h-6l2-8z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Manage Your Preferences</h1>
                <p className="text-sm text-muted-foreground">Update your NewsDrip subscription settings</p>
              </div>
            </div>
          </div>

          {/* Success Message */}
          {isUpdated && (
            <div className="px-6 py-4 bg-green-500/10 border-b border-green-500/20" data-testid="success-message">
              <div className="flex items-center">
                <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                <p className="text-sm text-green-600 dark:text-green-400">
                  {isActive 
                    ? "Your preferences have been updated successfully!" 
                    : "Your subscription has been deactivated successfully!"}
                </p>
              </div>
            </div>
          )}

          {/* Form */}
          <div className="px-6 py-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Subscription Status */}
                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-border bg-card/50 p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-active-subscription"
                          className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium text-foreground">
                          Active Subscription
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Receive newsletters and updates from NewsDrip
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {isActive && (
                  <>
                    {/* Contact Method */}
                    <FormField
                      control={form.control}
                      name="contactMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium text-foreground">How would you like to be contacted?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex space-x-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="email" id="email" className="border-primary text-primary" />
                                <FormLabel htmlFor="email" className="flex items-center cursor-pointer text-foreground">
                                  <Mail className="h-4 w-4 mr-2 text-primary" />
                                  Email
                                </FormLabel>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="sms" id="sms" className="border-primary text-primary" />
                                <FormLabel htmlFor="sms" className="flex items-center cursor-pointer text-foreground">
                                  <MessageSquare className="h-4 w-4 mr-2 text-primary" />
                                  SMS
                                </FormLabel>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Contact Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {contactMethod === "email" && (
                        <FormField
                          control={form.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-foreground">Email Address</FormLabel>
                              <FormControl>
                                <Input
                                  type="email"
                                  placeholder="Enter your email address"
                                  data-testid="input-email"
                                  className="border-border bg-background text-foreground placeholder:text-muted-foreground"
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
                              <FormLabel className="text-foreground">Phone Number</FormLabel>
                              <FormControl>
                                <Input
                                  type="tel"
                                  placeholder="Enter your phone number"
                                  data-testid="input-phone"
                                  className="border-border bg-background text-foreground placeholder:text-muted-foreground"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    {/* Frequency */}
                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base font-medium text-foreground flex items-center">
                            <Clock className="h-4 w-4 mr-2 text-primary" />
                            How often would you like to receive newsletters?
                          </FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              value={field.value}
                              className="flex space-x-6"
                            >
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="daily" id="daily" className="border-primary text-primary" />
                                <FormLabel htmlFor="daily" className="cursor-pointer text-foreground">Daily</FormLabel>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="weekly" id="weekly" className="border-primary text-primary" />
                                <FormLabel htmlFor="weekly" className="cursor-pointer text-foreground">Weekly</FormLabel>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem value="monthly" id="monthly" className="border-primary text-primary" />
                                <FormLabel htmlFor="monthly" className="cursor-pointer text-foreground">Monthly</FormLabel>
                              </div>
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Categories */}
                    <FormField
                      control={form.control}
                      name="categoryIds"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-base font-medium text-foreground">
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
                                        className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                      />
                                    </FormControl>
                                    <FormLabel className="text-sm font-medium text-foreground">
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
                  </>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-border">
                  <Button
                    type="submit"
                    disabled={updateMutation.isPending}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
                    data-testid="button-update-preferences"
                  >
                    {updateMutation.isPending ? "Updating..." : "Update Preferences"}
                  </Button>
                  
                  {isActive && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleUnsubscribe}
                      disabled={unsubscribeMutation.isPending}
                      className="flex-1 border-border text-foreground hover:bg-muted"
                      data-testid="button-unsubscribe"
                    >
                      {unsubscribeMutation.isPending ? "Unsubscribing..." : "Unsubscribe"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Need help? Contact us at{" "}
            <a href="mailto:support@newsdrip.com" className="text-primary hover:underline">
              support@newsdrip.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}