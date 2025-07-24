import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";


const newsletterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  categoryIds: z.array(z.number()).min(1, "Please select a category"),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterFormProps {
  newsletter?: any;
  onClose: () => void;
}

export default function NewsletterForm({ newsletter, onClose }: NewsletterFormProps) {
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: categories } = useQuery<any[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      title: newsletter?.title || "",
      subject: newsletter?.subject || "",
      content: newsletter?.content || "",
      categoryIds: newsletter?.categories?.length ? [newsletter.categories[0].id] : [],
    },
  });

  const saveMutation = useMutation({
    mutationFn: async (data: NewsletterFormData & { action: "draft" | "send" }) => {
      if (newsletter) {
        const response = await apiRequest("PUT", `/api/admin/newsletters/${newsletter.id}`, data);
        return await response.json();
      } else {
        const response = await apiRequest("POST", "/api/admin/newsletters", data);
        return await response.json();
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletters"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/dashboard"] });
      
      const action = variables.action;
      const response = data as any;
      
      // Show detailed delivery info for sent newsletters
      if (action === "send" && response.deliveryStats) {
        const stats = response.deliveryStats;
        toast({
          title: "Newsletter Sent!",
          description: `Sent to ${stats.total} subscribers (${stats.sent} delivered, ${stats.pending} pending, ${stats.failed} failed)`,
        });
      } else {
        toast({
          title: "Success",
          description: response.message || (action === "send" ? "Newsletter sent successfully!" : "Newsletter saved as draft"),
        });
      }
      onClose();
    },
    onError: (error) => {
      console.error("Newsletter save error:", error);
      
      // Check if it's an auth error
      if (error instanceof Error && error.message.includes("401")) {
        toast({
          title: "Authentication Required",
          description: "Please log in to continue.",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 1000);
        return;
      }
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save newsletter",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NewsletterFormData, action: "draft" | "send") => {
    // Add authorId from the current user
    const payload = {
      ...data,
      authorId: (user as any)?.id || "admin", // Use user ID from auth or fallback
      action
    };
    saveMutation.mutate(payload);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">
          {newsletter ? "Edit Newsletter" : "Create New Newsletter"}
        </h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <i className="fas fa-times"></i>
        </Button>
      </div>

      <Form {...form}>
        <form className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Newsletter Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter newsletter title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email subject line" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="categoryIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <FormControl>
                  <RadioGroup
                    value={field.value?.[0]?.toString() || ""}
                    onValueChange={(value) => {
                      field.onChange(value ? [parseInt(value)] : []);
                    }}
                    className="flex flex-wrap gap-4"
                  >
                    {(categories || []).map((category: any) => (
                      <div key={category.id} className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={category.id.toString()}
                          id={`category-${category.id}`}
                        />
                        <FormLabel 
                          htmlFor={`category-${category.id}`}
                          className="text-sm text-gray-700 cursor-pointer"
                        >
                          {category.name}
                        </FormLabel>
                      </div>
                    ))}
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Newsletter Content</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write your newsletter content here..."
                    rows={12}
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={form.handleSubmit((data) => onSubmit(data, "draft"))}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              type="button"
              onClick={form.handleSubmit((data) => onSubmit(data, "send"))}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Sending...
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane mr-2"></i>
                  Send Newsletter
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
