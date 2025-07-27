import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import NewsletterForm from "@/components/newsletter-form";
import AINewsletterGenerator from "@/components/ai-newsletter-generator";
import { isUnauthorizedError } from "@/lib/authUtils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, ExternalLink, Trash2, Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NewslettersView() {
  const [showForm, setShowForm] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"manual" | "ai">("manual");
  const { toast } = useToast();

  const { data: newsletters, isLoading } = useQuery<any[]>({
    queryKey: ["/api/admin/newsletters"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/newsletters/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletters"] });
      toast({ title: "Success", description: "Newsletter deleted successfully" });
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
        description: "Failed to delete newsletter",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (newsletter: any) => {
    setEditingNewsletter(newsletter);
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this newsletter?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingNewsletter(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-foreground">NewsDrip Newsletter Management</h2>
            <p className="text-muted-foreground">Create, edit, and send newsletters to your subscribers</p>
          </div>
          <Button disabled>
            <i className="fas fa-plus mr-2"></i>Create Newsletter
          </Button>
        </div>
        <div className="bg-card rounded-lg shadow-sm border border-border p-6 animate-pulse">
          <div className="h-4 bg-muted rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 2L3 14h6l-2 8 10-12h-6l2-8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">NewsDrip Newsletter Management</h2>
            <p className="text-muted-foreground">Create, edit, and send newsletters to your subscribers</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-primary hover:bg-primary/90 text-primary-foreground">
          <i className="fas fa-plus mr-2"></i>Create Newsletter
        </Button>
      </div>

      {showForm && (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="manual">Manual Creation</TabsTrigger>
            <TabsTrigger value="ai" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Generator
            </TabsTrigger>
          </TabsList>
          <TabsContent value="manual">
            <NewsletterForm
              newsletter={editingNewsletter}
              onClose={handleFormClose}
            />
          </TabsContent>
          <TabsContent value="ai">
            <AINewsletterGenerator 
              onNewsletterCreated={(newsletterId) => {
                handleFormClose();
                queryClient.invalidateQueries({ queryKey: ["/api/admin/newsletters"] });
                toast({
                  title: "Success",
                  description: "AI-generated newsletter created successfully!",
                });
              }}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Email Delivery Info Panel */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <i className="fas fa-info-circle text-primary"></i>
          </div>
          <div className="ml-3">
            <h4 className="text-sm font-medium text-foreground">Email Delivery Information</h4>
            <div className="mt-2 text-sm text-muted-foreground">
              <p>Your newsletters are being sent to all subscribers with matching categories. However, email delivery depends on several factors:</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li><strong>✓ Delivered:</strong> Email successfully sent and accepted</li>
                <li><strong>⏳ Pending:</strong> Waiting for domain verification or rate limiting</li>
                <li><strong>✗ Failed:</strong> Delivery failed due to invalid email or service issues</li>
              </ul>
              <p className="mt-2">
                To improve delivery rates, consider verifying your sending domain with Resend at{" "}
                <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                  resend.com/domains
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter List */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">Recent Newsletters</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Categories</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Delivery</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sent Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {!newsletters || newsletters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                    No newsletters found. Create your first newsletter to get started.
                  </td>
                </tr>
              ) : (
                newsletters.map((newsletter: any) => (
                  <tr key={newsletter.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-foreground">{newsletter.title}</div>
                      <div className="text-sm text-muted-foreground">{newsletter.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={newsletter.status === "sent" ? "default" : "secondary"}
                        className={
                          newsletter.status === "sent"
                            ? "bg-primary text-primary-foreground"
                            : "bg-yellow-500/10 text-yellow-600 border-yellow-500"
                        }
                      >
                        {newsletter.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <div className="flex flex-wrap gap-1">
                        {newsletter.categories?.map((category: any) => (
                          <Badge key={category.id} variant="outline" className="border-border text-foreground">
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {newsletter.deliveryStats ? (
                        <div className="space-y-1">
                          <div className="text-xs text-muted-foreground">
                            {newsletter.deliveryStats.total} recipients
                          </div>
                          <div className="flex gap-2">
                            {newsletter.deliveryStats.sent > 0 && (
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500">
                                ✓ {newsletter.deliveryStats.sent}
                              </Badge>
                            )}
                            {newsletter.deliveryStats.pending > 0 && (
                              <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500">
                                ⏳ {newsletter.deliveryStats.pending}
                              </Badge>
                            )}
                            {newsletter.deliveryStats.failed > 0 && (
                              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">
                                ✗ {newsletter.deliveryStats.failed}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {newsletter.sentAt
                        ? new Date(newsletter.sentAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-muted"
                            data-testid={`dropdown-newsletter-${newsletter.id}`}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Open menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-[160px]">
                          <DropdownMenuItem
                            onClick={() => handleEdit(newsletter)}
                            className="cursor-pointer"
                            data-testid={`edit-newsletter-${newsletter.id}`}
                          >
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          {newsletter.status === 'sent' && (
                            <DropdownMenuItem
                              onClick={() => {
                                const slug = newsletter.title.toLowerCase()
                                  .replace(/[^a-z0-9\s-]/g, '')
                                  .replace(/\s+/g, '-')
                                  .replace(/-+/g, '-')
                                  .trim();
                                window.open(`/newsletters/${slug}-${newsletter.id}.html`, '_blank');
                              }}
                              className="cursor-pointer"
                              data-testid={`view-newsletter-${newsletter.id}`}
                            >
                              <ExternalLink className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() => handleDelete(newsletter.id)}
                            className="cursor-pointer text-destructive focus:text-destructive"
                            disabled={deleteMutation.isPending}
                            data-testid={`delete-newsletter-${newsletter.id}`}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
