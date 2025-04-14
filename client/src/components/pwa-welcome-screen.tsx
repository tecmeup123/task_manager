import { useState, useEffect } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from './ui/dialog';
import { Button } from './ui/button';
import { Download, Wifi, Settings, PanelRight, FileText, CalendarClock } from 'lucide-react';
import { PWA } from '../pwa';
import { useAuth } from '@/hooks/use-auth';

interface WelcomeScreenFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function PWAWelcomeScreen() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { user } = useAuth();

  // Features to showcase in the welcome screen
  const features: WelcomeScreenFeature[] = [
    {
      icon: <Wifi className="h-12 w-12 text-primary" />,
      title: "Offline Access",
      description: "Access your tasks and sessions even when you're offline. Changes will sync when connection is restored."
    },
    {
      icon: <CalendarClock className="h-12 w-12 text-primary" />,
      title: "Training Sessions Management",
      description: "Efficiently manage your training sessions and track task progress across different editions."
    },
    {
      icon: <FileText className="h-12 w-12 text-primary" />,
      title: "Task Tracking",
      description: "Comprehensive task tracking with notifications and due date reminders to stay organized."
    },
    {
      icon: <PanelRight className="h-12 w-12 text-primary" />,
      title: "Performance Analytics",
      description: "Gain insights with performance dashboards to track progress across editions and trainers."
    },
    {
      icon: <Settings className="h-12 w-12 text-primary" />,
      title: "Personalized Settings",
      description: "Configure your preferences, language, and notification settings to match your workflow."
    }
  ];

  useEffect(() => {
    // Only show welcome screen when app is in standalone mode (installed)
    // and it's the first time the user is seeing it
    const isStandalone = PWA.detectStandaloneMode();
    const hasSeenWelcome = localStorage.getItem('pwa_welcome_seen') === 'true';
    const forceShow = localStorage.getItem('force_welcome_screen') === 'true';
    
    // Show if it's a standalone app or if we're forcing it for testing
    if ((isStandalone || forceShow) && !hasSeenWelcome && user) {
      // Slight delay to make sure the app has fully loaded
      const timer = setTimeout(() => {
        setIsOpen(true);
        // Remove force flag after showing
        if (forceShow) {
          localStorage.removeItem('force_welcome_screen');
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleClose = () => {
    // Mark welcome screen as seen
    localStorage.setItem('pwa_welcome_seen', 'true');
    setIsOpen(false);
  };

  const nextSlide = () => {
    if (currentSlide < features.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Welcome to Training Session Manager
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            {user && <span className="block text-lg font-medium mb-2">Hello, {user.username}!</span>}
            Your training management app is now installed on your device
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-6">
          {/* Feature showcase */}
          <div className="flex flex-col items-center py-4">
            {features[currentSlide].icon}
            <h3 className="text-xl font-semibold mt-4">{features[currentSlide].title}</h3>
            <p className="text-center text-muted-foreground mt-2">
              {features[currentSlide].description}
            </p>
          </div>
          
          {/* Slide indicators */}
          <div className="flex justify-center mt-4 space-x-2">
            {features.map((_, index) => (
              <div 
                key={index} 
                className={`h-2 rounded-full transition-all ${
                  currentSlide === index ? 'w-6 bg-primary' : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>
        </div>
        
        <DialogFooter className="sm:justify-between flex">
          <Button 
            variant="outline" 
            onClick={prevSlide}
            disabled={currentSlide === 0}
          >
            Previous
          </Button>
          <Button onClick={nextSlide}>
            {currentSlide === features.length - 1 ? 'Get Started' : 'Next'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}