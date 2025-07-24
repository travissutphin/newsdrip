import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";

const newsletterSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(1, "Content is required"),
  categoryIds: z.array(z.number()).min(1, "Please select at least one category"),
});

type NewsletterFormData = z.infer<typeof newsletterSchema>;

interface NewsletterFormProps {
  newsletter?: any;
  onClose: () => void;
}

export default function NewsletterForm({ newsletter, onClose }: NewsletterFormProps) {
  const { toast } = useToast();

  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  const form = useForm<NewsletterFormData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      title: newsletter?.title || "",
      subject: newsletter?.subject || "",
      content: newsletter?.content || "",
      categoryIds: newsletter?.categories?.map((c: any) => c.id) || [],
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
      toast({
        title: "Success",
        description: action === "send" ? "Newsletter sent successfully!" : "Newsletter saved as draft",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
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
    saveMutation.mutate({ ...data, action });
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
            render={() => (
              <FormItem>
                <FormLabel>Categories</FormLabel>
                <div className="flex flex-wrap gap-4">
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
                          <FormLabel className="text-sm text-gray-700">
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
