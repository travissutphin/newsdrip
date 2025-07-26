import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState, useRef } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Bold, Italic, Link, List, AlignLeft } from "lucide-react";


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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Rich text formatting functions
  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = before + selectedText + after;
    
    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    
    // Update form value
    form.setValue('content', newValue);
    
    // Reset focus and cursor position
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const formatBold = () => insertFormatting('**', '**');
  const formatItalic = () => insertFormatting('*', '*');
  const formatLink = () => {
    const url = prompt('Enter URL:');
    if (url) {
      const textarea = textareaRef.current;
      const selectedText = textarea?.value.substring(textarea.selectionStart, textarea.selectionEnd) || 'link text';
      insertFormatting(`[${selectedText}](`, `${url})`);
    }
  };
  const insertParagraph = () => insertFormatting('\n\n');
  const insertBulletList = () => insertFormatting('\n- ');

  return (
    <div className="bg-card rounded-lg shadow-sm border border-border p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mr-3">
            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 2L3 14h6l-2 8 10-12h-6l2-8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground">
            {newsletter ? "Edit Newsletter" : "Create New Newsletter"}
          </h3>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-muted-foreground hover:text-foreground">
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
                  <FormLabel className="text-foreground">Newsletter Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter newsletter title" {...field} className="bg-background border-border text-foreground" />
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
                  <FormLabel className="text-foreground">Email Subject</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email subject line" {...field} className="bg-background border-border text-foreground" />
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
                <FormLabel className="text-foreground">Category</FormLabel>
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
                          className="border-border text-primary"
                        />
                        <FormLabel 
                          htmlFor={`category-${category.id}`}
                          className="text-sm text-foreground cursor-pointer"
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
                <FormLabel className="text-foreground">Newsletter Content</FormLabel>
                
                {/* Formatting Toolbar */}
                <div className="flex items-center gap-2 p-2 bg-muted/50 border border-border rounded-t-md">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={formatBold}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    title="Bold (Ctrl+B)"
                  >
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={formatItalic}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    title="Italic (Ctrl+I)"
                  >
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={formatLink}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    title="Insert Link"
                  >
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={insertBulletList}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    title="Bullet List"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={insertParagraph}
                    className="h-8 w-8 p-0 hover:bg-muted"
                    title="New Paragraph"
                  >
                    <AlignLeft className="h-4 w-4" />
                  </Button>
                </div>

                <FormControl>
                  <Textarea
                    ref={textareaRef}
                    placeholder="Write your newsletter content here...

Use the toolbar above for formatting:
• **bold text** for bold
• *italic text* for italic  
• [link text](https://example.com) for links
• - item for bullet points

Or use keyboard shortcuts: Ctrl+B for bold, Ctrl+I for italic"
                    rows={12}
                    className="resize-none bg-background border-border text-foreground rounded-t-none border-t-0"
                    {...field}
                    onKeyDown={(e) => {
                      if (e.ctrlKey || e.metaKey) {
                        if (e.key === 'b') {
                          e.preventDefault();
                          formatBold();
                        } else if (e.key === 'i') {
                          e.preventDefault();
                          formatItalic();
                        }
                      }
                    }}
                  />
                </FormControl>
                
                {/* Format Preview */}
                <div className="mt-2 p-3 bg-muted/30 border border-border rounded-md">
                  <p className="text-xs text-muted-foreground mb-2 font-medium">Preview formatting:</p>
                  <div className="text-sm text-foreground">
                    <p><strong>**Bold text**</strong> renders as <strong>bold text</strong></p>
                    <p><em>*Italic text*</em> renders as <em>italic text</em></p>
                    <p><span className="text-primary">[Link text](url)</span> creates clickable links</p>
                    <p><span className="text-muted-foreground">- Bullet points</span> create lists</p>
                  </div>
                </div>
                
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={onClose} className="border-border text-foreground hover:bg-muted">
              Cancel
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={form.handleSubmit((data) => onSubmit(data, "draft"))}
              disabled={saveMutation.isPending}
              className="border-border text-foreground hover:bg-muted"
            >
              {saveMutation.isPending ? "Saving..." : "Save Draft"}
            </Button>
            <Button
              type="button"
              onClick={form.handleSubmit((data) => onSubmit(data, "send"))}
              disabled={saveMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
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
