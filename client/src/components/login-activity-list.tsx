import { LoginActivity } from "@shared/schema";
import { format } from "date-fns";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { useLoginActivity } from "@/hooks/use-login-activity";

interface LoginActivityListProps {
  limit?: number;
}

export function LoginActivityList({ limit = 5 }: LoginActivityListProps) {
  const { activities, isLoading, error } = useLoginActivity({ limit });
  
  // Helper to format activity data
  const formatDate = (date: Date) => {
    return format(new Date(date), "MMM d, yyyy h:mm a");
  };
  
  const formatDeviceInfo = (userAgent?: string | null) => {
    if (!userAgent) return "Unknown device";
    
    // Very simple UA parsing - in a real app, would use a proper UA parser library
    const isMobile = /mobile/i.test(userAgent);
    const isChrome = /chrome/i.test(userAgent) && !/edge|opr/i.test(userAgent);
    const isFirefox = /firefox/i.test(userAgent);
    const isSafari = /safari/i.test(userAgent) && !/chrome|edge|opr/i.test(userAgent);
    const isEdge = /edge/i.test(userAgent);
    const isWindows = /windows/i.test(userAgent);
    const isMac = /mac/i.test(userAgent);
    const isLinux = /linux/i.test(userAgent);
    
    let browser = "Unknown browser";
    if (isChrome) browser = "Chrome";
    else if (isFirefox) browser = "Firefox";
    else if (isSafari) browser = "Safari";
    else if (isEdge) browser = "Edge";
    
    let os = "Unknown OS";
    if (isWindows) os = "Windows";
    else if (isMac) os = "MacOS";
    else if (isLinux) os = "Linux";
    
    return `${browser}${isMobile ? " Mobile" : ""} - ${os}`;
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive">Error loading login history</p>
      </div>
    );
  }
  
  if (!activities.length) {
    return (
      <div className="p-4 text-center">
        <p className="text-muted-foreground">No login activity recorded</p>
      </div>
    );
  }
  
  return (
    <div className="border rounded-md">
      <div className="bg-muted px-4 py-2 border-b">
        <div className="grid grid-cols-12 font-medium">
          <div className="col-span-4">Date & Time</div>
          <div className="col-span-3">IP Address</div>
          <div className="col-span-4">Device</div>
          <div className="col-span-1 text-center">Status</div>
        </div>
      </div>
      
      {activities.map((activity) => (
        <div key={activity.id} className="px-4 py-2 border-b last:border-b-0">
          <div className="grid grid-cols-12">
            <div className="col-span-4 text-sm">{formatDate(activity.timestamp)}</div>
            <div className="col-span-3 text-sm">{activity.ipAddress || "Unknown"}</div>
            <div className="col-span-4 text-sm">{formatDeviceInfo(activity.userAgent)}</div>
            <div className="col-span-1 flex justify-center">
              {activity.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}