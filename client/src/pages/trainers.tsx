import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Users } from "lucide-react";

export default function Trainers() {
  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <h2 className="text-2xl font-semibold mb-2 md:mb-0">Trainers</h2>

        <Button variant="default">
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Trainer
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Trainers Management</CardTitle>
          <CardDescription>
            Manage trainers for your training programs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <div className="bg-neutral-100 p-3 rounded-full mb-4">
              <Users className="h-10 w-10 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Trainers Management Coming Soon</h3>
            <p className="text-neutral-500 text-center max-w-md mb-6">
              This feature is currently under development. Soon you'll be able to manage your training staff and assign them to sessions.
            </p>
            <Button variant="outline" disabled>
              This feature is coming soon
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}