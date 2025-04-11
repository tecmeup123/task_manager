import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface WeekProgressIndicatorProps {
  currentWeek: number;
  totalWeeks?: number;
}

export default function WeekProgressIndicator({ 
  currentWeek, 
  totalWeeks = 13 // From week -5 to week 8 (total 14 weeks)
}: WeekProgressIndicatorProps) {
  // Calculate the percentage of the training completed
  // Assuming weeks go from -5 to 8 (total of 14 weeks)
  // Week -5 = 0%, Week 8 = 100%
  const adjustedCurrentWeek = currentWeek + 5; // Adjust for negative weeks
  const progressPercentage = Math.round((adjustedCurrentWeek / totalWeeks) * 100);
  
  // Determine color based on progress
  const getProgressColor = () => {
    if (progressPercentage < 25) return "bg-blue-500";
    if (progressPercentage < 50) return "bg-yellow-500";
    if (progressPercentage < 75) return "bg-orange-500";
    return "bg-green-500";
  };

  // Week phases
  const getPhase = () => {
    if (currentWeek < 0) return "Preparation";
    if (currentWeek <= 2) return "Initial";
    if (currentWeek <= 5) return "Middle";
    return "Final";
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant={
            currentWeek < 0 ? "outline" : 
            currentWeek <= 2 ? "default" : 
            currentWeek <= 5 ? "secondary" : 
            "destructive"
          }>
            Week {currentWeek}
          </Badge>
          <span className="text-xs text-muted-foreground">{getPhase()} Phase</span>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center cursor-help text-muted-foreground">
                <Info className="h-3.5 w-3.5 mr-1" />
                <span className="text-xs">{progressPercentage}% complete</span>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">
                Training progression from Week -5 to Week 8
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      
      <Progress value={progressPercentage} className="h-2" indicatorClassName={getProgressColor()} />
    </div>
  );
}