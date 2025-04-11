import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Tasks from "@/pages/tasks";
import Editions from "@/pages/editions";
import Trainers from "@/pages/trainers";
import Reports from "@/pages/reports";
import Settings from "@/pages/settings";
import MainLayout from "@/components/layouts/main-layout";

function Router() {
  return (
    <MainLayout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/tasks" component={Tasks} />
        <Route path="/tasks/:editionId" component={Tasks} />
        <Route path="/editions" component={Editions} />
        <Route path="/trainers" component={Trainers} />
        <Route path="/reports" component={Reports} />
        <Route path="/settings" component={Settings} />
        {/* Fallback to 404 */}
        <Route component={NotFound} />
      </Switch>
    </MainLayout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
