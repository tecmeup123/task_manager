import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, FileText, Download } from "lucide-react";

export default function Reports() {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-semibold mb-2 md:mb-0">Reports</h2>

        <Button variant="default" disabled>
          <Download className="mr-2 h-4 w-4" />
          Export Reports
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Training Reports</CardTitle>
          <CardDescription>
            View and export training analytics and reports.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-neutral-100 p-3 rounded-full mb-4">
              <BarChart className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Reports Coming Soon</h3>
            <p className="text-neutral-500 text-center max-w-md mb-6">
              Our analytics and reporting features are currently under development. Soon you'll be able to generate detailed reports about your training sessions.
            </p>
            <Button variant="outline" disabled>
              This feature is coming soon
            </Button>
          </div>
        </CardContent>
      </Card>
      
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
            <Button variant="outline" className="w-full" disabled>
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
            <Button variant="outline" className="w-full" disabled>
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
            <Button variant="outline" className="w-full" disabled>
              View Report
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}