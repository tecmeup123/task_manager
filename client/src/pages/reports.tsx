import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  FileText, 
  Download, 
  PieChart, 
  Calendar, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  LineChart
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Sample chart component to visualize data
function CompletionRateChart() {
  return (
    <div className="w-full h-64 bg-slate-50 rounded-lg p-4 flex flex-col items-center justify-center">
      <div className="w-full flex justify-between items-end px-4 h-48">
        <div className="bg-blue-500 w-12 h-24 rounded-t-md"></div>
        <div className="bg-blue-500 w-12 h-32 rounded-t-md"></div>
        <div className="bg-blue-500 w-12 h-36 rounded-t-md"></div>
        <div className="bg-blue-500 w-12 h-28 rounded-t-md"></div>
        <div className="bg-blue-500 w-12 h-40 rounded-t-md"></div>
      </div>
      <div className="w-full flex justify-between items-center px-4 pt-2 text-xs text-slate-500">
        <div>Week 1</div>
        <div>Week 2</div>
        <div>Week 3</div>
        <div>Week 4</div>
        <div>Week 5</div>
      </div>
    </div>
  );
}

// Sample donut chart for task status
function TaskStatusChart() {
  return (
    <div className="w-full h-64 bg-slate-50 rounded-lg p-4 flex items-center justify-center">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 rounded-full border-8 border-t-green-500 border-r-amber-500 border-b-red-500 border-l-blue-500 rotate-45"></div>
        <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center">
          <span className="text-sm font-medium">Task Status</span>
        </div>
      </div>
      <div className="ml-6 space-y-2">
        <div className="flex items-center text-sm">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span>Complete (45%)</span>
        </div>
        <div className="flex items-center text-sm">
          <div className="w-3 h-3 bg-amber-500 rounded-full mr-2"></div>
          <span>In Progress (30%)</span>
        </div>
        <div className="flex items-center text-sm">
          <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
          <span>Overdue (15%)</span>
        </div>
        <div className="flex items-center text-sm">
          <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
          <span>Not Started (10%)</span>
        </div>
      </div>
    </div>
  );
}

// Sample line chart for trainer activity
function TrainerActivityChart() {
  return (
    <div className="w-full h-64 bg-slate-50 rounded-lg p-4">
      <div className="w-full h-full flex flex-col">
        <div className="flex-1 relative">
          {/* Grid lines */}
          <div className="absolute inset-0 grid grid-rows-4 gap-0">
            <div className="border-b border-gray-200"></div>
            <div className="border-b border-gray-200"></div>
            <div className="border-b border-gray-200"></div>
            <div className="border-b border-gray-200"></div>
          </div>
          
          {/* Line Chart - Simulated with SVG */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,90 L20,70 L40,60 L60,30 L80,50 L100,20" 
                  stroke="rgb(59, 130, 246)" 
                  strokeWidth="2" 
                  fill="none" />
            <path d="M0,80 L20,85 L40,70 L60,60 L80,40 L100,30" 
                  stroke="rgb(249, 115, 22)" 
                  strokeWidth="2" 
                  fill="none" />
          </svg>
        </div>
        
        {/* X-axis labels */}
        <div className="h-6 flex justify-between items-center px-2 text-xs text-slate-500">
          <div>Jan</div>
          <div>Feb</div>
          <div>Mar</div>
          <div>Apr</div>
          <div>May</div>
          <div>Jun</div>
        </div>
      </div>
    </div>
  );
}

export default function Reports() {
  const [selectedEdition, setSelectedEdition] = useState("all");
  const [selectedDateRange, setSelectedDateRange] = useState("last-30");
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  const handleGenerateReport = () => {
    setIsGeneratingReport(true);
    // Simulate report generation
    setTimeout(() => {
      setIsGeneratingReport(false);
    }, 1500);
  };
  
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-semibold mb-2 md:mb-0">Reports & Analytics</h2>

        <Button 
          variant="default" 
          onClick={handleGenerateReport}
          disabled={isGeneratingReport}
        >
          {isGeneratingReport ? (
            <>
              <Skeleton className="h-4 w-4 rounded-full mr-2 animate-pulse" /> 
              Generating...
            </>
          ) : (
            <>
              <Download className="mr-2 h-4 w-4" />
              Export Reports
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Report Filters</CardTitle>
            <CardDescription>
              Customize your report parameters
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edition">Training Edition</Label>
              <Select 
                value={selectedEdition} 
                onValueChange={setSelectedEdition}
              >
                <SelectTrigger id="edition">
                  <SelectValue placeholder="Select an edition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Editions</SelectItem>
                  <SelectItem value="2504-A">2504-A (Customers)</SelectItem>
                  <SelectItem value="2503-B">2503-B (Partners)</SelectItem>
                  <SelectItem value="2502-A">2502-A (Customers)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="dateRange">Date Range</Label>
              <Select 
                value={selectedDateRange} 
                onValueChange={setSelectedDateRange}
              >
                <SelectTrigger id="dateRange">
                  <SelectValue placeholder="Select date range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="last-7">Last 7 days</SelectItem>
                  <SelectItem value="last-30">Last 30 days</SelectItem>
                  <SelectItem value="last-90">Last 90 days</SelectItem>
                  <SelectItem value="year-to-date">Year to date</SelectItem>
                  <SelectItem value="custom">Custom range</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button className="w-full" onClick={handleGenerateReport} disabled={isGeneratingReport}>
              {isGeneratingReport ? "Generating Report..." : "Generate Report"}
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Report Summary</CardTitle>
            <CardDescription>
              Key metrics at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-slate-500">Completion Rate</div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold">78%</div>
                <div className="text-xs text-green-500">+12% from last month</div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-slate-500">Overdue Tasks</div>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
                <div className="text-2xl font-bold">14</div>
                <div className="text-xs text-red-500">+3 from last week</div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-slate-500">Active Trainers</div>
                  <Users className="h-4 w-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold">8</div>
                <div className="text-xs text-blue-500">2 new this month</div>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-slate-500">Average Completion</div>
                  <Clock className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-bold">4.2 days</div>
                <div className="text-xs text-green-500">-0.8 days improved</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="overview" className="mb-6">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="completion">Task Completion</TabsTrigger>
          <TabsTrigger value="trainer">Trainer Analytics</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart className="h-5 w-5 mr-2" />
                Overall Progress
              </CardTitle>
              <CardDescription>
                Task completion rate across all editions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CompletionRateChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="completion" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <PieChart className="h-5 w-5 mr-2" />
                Task Status Distribution
              </CardTitle>
              <CardDescription>
                Current status of all tasks in selected editions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TaskStatusChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trainer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChart className="h-5 w-5 mr-2" />
                Trainer Activity
              </CardTitle>
              <CardDescription>
                Task assignment and completion metrics by trainer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TrainerActivityChart />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                Training Timeline
              </CardTitle>
              <CardDescription>
                Chronological view of training activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-slate-50 p-6 rounded-lg text-center">
                <p className="text-slate-500">Timeline visualization is currently in development.</p>
                <p className="text-sm text-slate-400 mt-2">Coming soon in the next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Completion Reports
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Analyze training session completion rates and performance metrics.
            </p>
            <Button variant="outline" className="w-full">
              View Report
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Trainer Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Track trainer performance and assignment analytics across sessions.
            </p>
            <Button variant="outline" className="w-full">
              View Report
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-primary" />
              Task Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Detailed task completion analytics and bottleneck identification.
            </p>
            <Button variant="outline" className="w-full">
              View Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}