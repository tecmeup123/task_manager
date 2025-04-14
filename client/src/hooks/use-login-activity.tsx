import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { LoginActivity } from "@shared/schema";

interface UseLoginActivityOptions {
  limit?: number;
}

export function useLoginActivity(options: UseLoginActivityOptions = {}) {
  const { limit = 10 } = options;
  
  const {
    data: activities,
    isLoading,
    error,
    refetch
  } = useQuery<LoginActivity[]>({
    queryKey: ["/api/login-activities", { limit }],
    queryFn: () => fetch(`/api/login-activities?limit=${limit}`).then(res => res.json()),
    enabled: true,
  });

  return {
    activities: activities || [],
    isLoading,
    error,
    refetch
  };
}