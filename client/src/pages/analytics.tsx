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
          <div className="flex items-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 2L3 14h6l-2 8 10-12h-6l2-8z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">NewsDrip Analytics & Insights</h2>
              <p className="text-muted-foreground">Track newsletter performance and subscriber engagement</p>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-card rounded-lg shadow-sm border border-border p-6 animate-pulse">
              <div className="h-4 bg-muted rounded mb-2"></div>
              <div className="h-8 bg-muted rounded"></div>
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
        <div className="flex items-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-4">
            <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 2L3 14h6l-2 8 10-12h-6l2-8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">NewsDrip Analytics & Insights</h2>
            <p className="text-muted-foreground">Track newsletter performance and subscriber engagement</p>
          </div>
        </div>
      </div>

      {/* Performance Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Deliveries</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalDeliveries}</p>
              </div>
              <div className="text-primary">
                <i className="fas fa-paper-plane text-2xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Successful Deliveries</p>
                <p className="text-2xl font-bold text-foreground">{stats.successfulDeliveries}</p>
              </div>
              <div className="text-green-600">
                <i className="fas fa-check-circle text-2xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Deliveries</p>
                <p className="text-2xl font-bold text-foreground">{stats.failedDeliveries}</p>
              </div>
              <div className="text-destructive">
                <i className="fas fa-exclamation-triangle text-2xl"></i>
              </div>
            </div>
          </div>
          
          <div className="bg-card rounded-lg shadow-sm border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Rate</p>
                <p className="text-2xl font-bold text-foreground">{stats.openRate}%</p>
              </div>
              <div className="text-primary">
                <i className="fas fa-chart-line text-2xl"></i>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Deliveries */}
      <div className="bg-card rounded-lg shadow-sm border border-border">
        <div className="px-6 py-4 border-b border-border">
          <h3 className="text-lg font-medium text-foreground">Recent Delivery Status</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Newsletter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Method</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Sent Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Opened</th>
              </tr>
            </thead>
            <tbody className="bg-card divide-y divide-border">
              {deliveries.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-muted-foreground">
                    No delivery data available. Deliveries will appear here after newsletters are sent.
                  </td>
                </tr>
              ) : (
                deliveries.slice(0, 10).map((delivery: any) => (
                  <tr key={delivery.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                      Newsletter #{delivery.newsletterId}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge
                        variant="outline"
                        className={
                          delivery.method === "email"
                            ? "bg-primary/10 text-primary border-primary"
                            : "bg-green-500/10 text-green-600 border-green-500"
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
                            ? "bg-primary text-primary-foreground"
                            : "bg-destructive text-destructive-foreground"
                        }
                      >
                        {delivery.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(delivery.sentAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
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
