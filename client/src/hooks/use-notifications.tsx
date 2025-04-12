import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";

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
}

export function useNotifications(limit: number = 5, includeRead: boolean = false) {
  const { data: notifications = [], isLoading, error, refetch } = useQuery<Notification[]>({
    queryKey: ["/api/notifications", { limit, includeRead }],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?limit=${limit}&includeRead=${includeRead}`);
      if (!res.ok) {
        throw new Error("Failed to fetch notifications");
      }
      return res.json();
    }
  });

  const { data: unreadCount = 0 } = useQuery<{ count: number }>({
    queryKey: ["/api/notifications/count"],
    queryFn: async () => {
      const res = await fetch("/api/notifications/count");
      if (!res.ok) {
        throw new Error("Failed to fetch unread count");
      }
      return res.json();
    }
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

  return {
    notifications,
    unreadCount: unreadCount.count || 0,
    isLoading,
    error,
    refetch,
    markAsRead: (id: number) => markAsReadMutation.mutate(id),
    markAllAsRead: () => markAllAsReadMutation.mutate(),
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending
  };
}