import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import NewsletterForm from "@/components/newsletter-form";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function NewslettersView() {
  const [showForm, setShowForm] = useState(false);
  const [editingNewsletter, setEditingNewsletter] = useState<any>(null);
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
            <h2 className="text-2xl font-bold text-gray-900">Newsletter Management</h2>
            <p className="text-gray-600">Create, edit, and send newsletters to your subscribers</p>
          </div>
          <Button disabled>
            <i className="fas fa-plus mr-2"></i>Create Newsletter
          </Button>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Hero Section */}
      <div className="brand-hero rounded-lg p-6 sm:p-8 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-[hsl(var(--deep-navy))] mb-2">Newsletter Management</h2>
        <p className="text-[hsl(var(--deep-navy)/0.8)] text-sm sm:text-base mb-4">Create, edit, and send newsletters to your subscribers</p>
        <Button onClick={() => setShowForm(true)} className="btn-primary">
          <i className="fas fa-plus mr-2"></i>Create Newsletter
        </Button>
      </div>

      {showForm && (
        <NewsletterForm
          newsletter={editingNewsletter}
          onClose={handleFormClose}
        />
      )}

      {/* Email Delivery Info Panel */}
      <div className="bg-[hsl(var(--mint)/0.3)] border border-[hsl(var(--mint))] rounded-lg p-4 sm:p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <i className="fas fa-info-circle text-[hsl(var(--sage-green))]"></i>
          </div>
          <div className="ml-3">
            <h4 className="text-sm sm:text-base font-medium text-[hsl(var(--deep-navy))]">Email Delivery Information</h4>
            <div className="mt-2 text-xs sm:text-sm text-[hsl(var(--deep-navy)/0.8)]">
              <p>Your newsletters are being sent to all subscribers with matching categories. However, email delivery depends on several factors:</p>
              <ul className="mt-2 list-disc list-inside space-y-1">
                <li><strong>✓ Delivered:</strong> Email successfully sent and accepted</li>
                <li><strong>⏳ Pending:</strong> Waiting for domain verification or rate limiting</li>
                <li><strong>✗ Failed:</strong> Delivery failed due to invalid email or service issues</li>
              </ul>
              <p className="mt-2">
                To improve delivery rates, consider verifying your sending domain with Resend at{" "}
                <a href="https://resend.com/domains" target="_blank" rel="noopener noreferrer" className="underline">
                  resend.com/domains
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Newsletter List */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="px-4 sm:px-6 py-4 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">Recent Newsletters</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="brand-section">
              <tr>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden sm:table-cell">Status</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Categories</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Delivery</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider hidden md:table-cell">Sent Date</th>
                <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {!newsletters || newsletters.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 sm:px-6 py-8 text-center text-muted-foreground">
                    No newsletters found. Create your first newsletter to get started.
                  </td>
                </tr>
              ) : (
                newsletters.map((newsletter: any) => (
                  <tr key={newsletter.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{newsletter.title}</div>
                      <div className="text-sm text-gray-500">{newsletter.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={newsletter.status === "sent" ? "default" : "secondary"}
                        className={
                          newsletter.status === "sent"
                            ? "bg-secondary text-white"
                            : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {newsletter.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {newsletter.categories?.map((category: any) => (
                          <Badge key={category.id} variant="outline">
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {newsletter.deliveryStats ? (
                        <div className="space-y-1">
                          <div className="text-xs text-gray-600">
                            {newsletter.deliveryStats.total} recipients
                          </div>
                          <div className="flex gap-2">
                            {newsletter.deliveryStats.sent > 0 && (
                              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                ✓ {newsletter.deliveryStats.sent}
                              </Badge>
                            )}
                            {newsletter.deliveryStats.pending > 0 && (
                              <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                ⏳ {newsletter.deliveryStats.pending}
                              </Badge>
                            )}
                            {newsletter.deliveryStats.failed > 0 && (
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                ✗ {newsletter.deliveryStats.failed}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {newsletter.sentAt
                        ? new Date(newsletter.sentAt).toLocaleDateString()
                        : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(newsletter)}
                        className="text-primary hover:text-blue-700 mr-4"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(newsletter.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={deleteMutation.isPending}
                      >
                        Delete
                      </Button>
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
