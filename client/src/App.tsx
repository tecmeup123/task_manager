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
import AuthPage from "@/pages/auth-page";
import MainLayout from "@/components/layouts/main-layout";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      
      {/* Protected routes wrapped in MainLayout */}
      <ProtectedRoute 
        path="/" 
        component={() => (
          <MainLayout>
            <Home />
          </MainLayout>
        )} 
      />
      <ProtectedRoute 
        path="/tasks" 
        component={() => (
          <MainLayout>
            <Tasks />
          </MainLayout>
        )} 
      />
      <ProtectedRoute 
        path="/tasks/:editionId" 
        component={() => (
          <MainLayout>
            <Tasks />
          </MainLayout>
        )} 
      />
      <ProtectedRoute 
        path="/editions" 
        component={() => (
          <MainLayout>
            <Editions />
          </MainLayout>
        )} 
      />
      <ProtectedRoute 
        path="/trainers" 
        component={() => (
          <MainLayout>
            <Trainers />
          </MainLayout>
        )} 
      />
      <ProtectedRoute 
        path="/reports" 
        component={() => (
          <MainLayout>
            <Reports />
          </MainLayout>
        )} 
      />
      <ProtectedRoute 
        path="/settings" 
        component={() => (
          <MainLayout>
            <Settings />
          </MainLayout>
        )} 
      />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
