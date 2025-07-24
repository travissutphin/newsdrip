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

  const { data: newsletters, isLoading } = useQuery({
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Newsletter Management</h2>
          <p className="text-gray-600">Create, edit, and send newsletters to your subscribers</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <i className="fas fa-plus mr-2"></i>Create Newsletter
        </Button>
      </div>

      {showForm && (
        <NewsletterForm
          newsletter={editingNewsletter}
          onClose={handleFormClose}
        />
      )}

      {/* Newsletter List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Newsletters</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {!newsletters || newsletters.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
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
