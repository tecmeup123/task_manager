import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient, getQueryFn } from "@/lib/queryClient";
import { useAuth } from "./use-auth";

export interface Notification {
  id: number;
  type: string;
  userId: number;
  title: string;
  message: string;
  entityType: string;
  entityId: number | null;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  metadata?: any;
}

export function useNotifications(limit: number = 10, includeRead: boolean = false) {
  const { user } = useAuth();
  
  // Only fetch notifications if user is logged in
  const { data: notifications = [], isLoading, error, refetch } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", { limit, includeRead }],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user, // Only run the query if the user is logged in
    refetchOnWindowFocus: false,
    retry: 1
  });

  // Only fetch unread count if user is logged in
  const { data: unreadCount = { count: 0 } } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/count"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    enabled: !!user, // Only run the query if the user is logged in
    refetchOnWindowFocus: false,
    retry: 1
  });

  const markAsReadMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("POST", `/api/notifications/mark-read/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
    }
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/notifications/mark-all-read");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
    }
  });

  const createTestNotificationMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/notifications/test");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
      queryClient.invalidateQueries({ queryKey: ["/api/notifications/count"] });
    }
  });

  return {
    notifications,
    unreadCount: unreadCount && typeof unreadCount === 'object' ? unreadCount.count : 0,
    isLoading,
    error,
    refetch,
    markAsRead: (id: number) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    createTestNotification: () => createTestNotificationMutation.mutate(),
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isCreatingTest: createTestNotificationMutation.isPending
  };
}