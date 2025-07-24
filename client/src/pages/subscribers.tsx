import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useState } from "react";

export default function SubscribersView() {
  const [searchTerm, setSearchTerm] = useState("");
  const [methodFilter, setMethodFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const { toast } = useToast();

  const { data: subscribers, isLoading } = useQuery({
    queryKey: ["/api/admin/subscribers"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/admin/subscribers/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/subscribers"] });
      toast({ title: "Success", description: "Subscriber removed successfully" });
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
        description: "Failed to remove subscriber",
        variant: "destructive",
      });
    },
  });

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to remove this subscriber?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredSubscribers = (subscribers || []).filter((subscriber: any) => {
    const matchesSearch = 
      subscriber.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      subscriber.phone?.includes(searchTerm);
    const matchesMethod = !methodFilter || subscriber.contactMethod === methodFilter;
    const matchesStatus = !statusFilter || (statusFilter === "active" ? subscriber.isActive : !subscriber.isActive);
    
    return matchesSearch && matchesMethod && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Subscriber Management</h2>
            <p className="text-gray-600">View and manage your newsletter subscribers</p>
          </div>
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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Subscriber Management</h2>
          <p className="text-gray-600">View and manage your newsletter subscribers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label htmlFor="filter-method" className="block text-sm font-medium text-gray-700 mb-2">Contact Method</label>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Methods" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Methods</SelectItem>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-2">
            <label htmlFor="search-subscribers" className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <Input
              id="search-subscribers"
              placeholder="Search subscribers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Subscriber Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categories</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscribers?.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    {!subscribers || subscribers.length === 0 
                      ? "No subscribers found. Subscribers will appear here when they sign up."
                      : "No subscribers match your filters."}
                  </td>
                </tr>
              ) : (
                filteredSubscribers?.map((subscriber: any) => (
                  <tr key={subscriber.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {subscriber.email || subscriber.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={
                          subscriber.contactMethod === "email"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        <i className={`fas fa-${subscriber.contactMethod === "email" ? "envelope" : "sms"} mr-1`}></i>
                        {subscriber.contactMethod.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <div className="flex flex-wrap gap-1">
                        {subscriber.categories?.map((category: any) => (
                          <Badge key={category.id} variant="outline">
                            {category.name}
                          </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {subscriber.frequency}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={subscriber.isActive ? "default" : "secondary"}
                        className={
                          subscriber.isActive
                            ? "bg-secondary text-white"
                            : "bg-gray-100 text-gray-800"
                        }
                      >
                        {subscriber.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(subscriber.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(subscriber.id)}
                        className="text-red-600 hover:text-red-700"
                        disabled={deleteMutation.isPending}
                      >
                        Remove
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
