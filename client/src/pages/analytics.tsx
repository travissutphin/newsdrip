import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";

export default function AnalyticsView() {
  const { data: analyticsData, isLoading } = useQuery({
    queryKey: ["/api/admin/analytics"],
  });

  const { data: dashboardData } = useQuery({
    queryKey: ["/api/admin/dashboard"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Analytics & Insights</h2>
          <p className="text-gray-600">Track newsletter performance and subscriber engagement</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const stats = dashboardData?.deliveryStats || {};
  const deliveries = analyticsData?.deliveries || [];
  const categories = analyticsData?.categories || [];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Analytics & Insights</h2>
        <p className="text-gray-600">Track newsletter performance and subscriber engagement</p>
      </div>

      {/* Performance Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalDeliveries}</p>
              </div>
              <div className="text-primary">
                <i className="fas fa-paper-plane text-2xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Successful Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.successfulDeliveries}</p>
              </div>
              <div className="text-secondary">
                <i className="fas fa-check-circle text-2xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Failed Deliveries</p>
                <p className="text-2xl font-bold text-gray-900">{stats.failedDeliveries}</p>
              </div>
              <div className="text-red-500">
                <i className="fas fa-exclamation-triangle text-2xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Open Rate</p>
                <p className="text-2xl font-bold text-gray-900">{stats.openRate}%</p>
              </div>
              <div className="text-accent">
                <i className="fas fa-chart-line text-2xl"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Deliveries */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Recent Delivery Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Newsletter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Opened</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    No delivery data available. Deliveries will appear here after newsletters are sent.
                  </td>
                </tr>
              ) : (
                deliveries.slice(0, 10).map((delivery: any) => (
                  <tr key={delivery.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      Newsletter #{delivery.newsletterId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={
                          delivery.method === "email"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-green-100 text-green-800"
                        }
                      >
                        <i className={`fas fa-${delivery.method === "email" ? "envelope" : "sms"} mr-1`}></i>
                        {delivery.method.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant={delivery.status === "sent" ? "default" : "destructive"}
                        className={
                          delivery.status === "sent"
                            ? "bg-secondary text-white"
                            : "bg-red-500 text-white"
                        }
                      >
                        {delivery.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(delivery.sentAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {delivery.openedAt ? new Date(delivery.openedAt).toLocaleString() : "-"}
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
