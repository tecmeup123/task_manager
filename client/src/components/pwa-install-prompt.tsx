import { useState, useEffect } from 'react';
import { PWA } from '../pwa';
import { Button } from './ui/button';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle 
} from './ui/sheet';
import { Download, Wifi, WifiOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function PWAInstallPrompt() {
  const [isInstallable, setIsInstallable] = useState(false);
  const [installPromptFn, setInstallPromptFn] = useState<(() => void) | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  // Check installation status
  useEffect(() => {
    const isStandalone = PWA.detectStandaloneMode();
    setIsInstallable(!isStandalone);

    // Monitor installation event
    const handleBeforeInstallPrompt = (e: Event) => {
      console.log('Before install prompt event fired');
      e.preventDefault();
      
      // Store the event for later use
      // @ts-ignore - Custom type not available in standard TypeScript
      setInstallPromptFn(() => {
        return () => {
          // @ts-ignore
          e.prompt();
          // @ts-ignore
          return e.userChoice.then((choiceResult: {outcome: string}) => {
            if (choiceResult.outcome === 'accepted') {
              console.log('User accepted the install prompt');
              setIsInstallable(false);
            } else {
              console.log('User dismissed the install prompt');
            }
          });
        };
      });
      
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Monitor online/offline status
    const handleConnectionChange = (e: Event) => {
      // @ts-ignore - Accessing custom event detail
      const online = (e as CustomEvent)?.detail?.online ?? navigator.onLine;
      setIsOnline(online);
      
      if (!online) {
        toast({
          title: "You are offline",
          description: "Some features may be limited",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Connection restored",
          description: "All features are available",
          variant: "default"
        });
      }
    };

    document.addEventListener('connectionChange', handleConnectionChange);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      document.removeEventListener('connectionChange', handleConnectionChange);
    };
  }, [toast]);

  const handleInstall = () => {
    if (installPromptFn) {
      installPromptFn();
      setIsInstallable(false);
    }
  };

  // Se o app já está instalado ou não pode ser instalado, não mostre nada
  if (!isInstallable || PWA.detectStandaloneMode()) {
    return null;
  }

  return (
    <>
      <div className="fixed bottom-4 right-4 z-50">
        <Button 
          size="sm" 
          variant="default"
          className="rounded-full shadow-lg flex items-center gap-2 py-6 px-4"
          onClick={() => setIsOpen(true)}
        >
          {isOnline ? 
            <Wifi className="h-4 w-4" /> : 
            <WifiOff className="h-4 w-4" />
          }
          {isOnline ? 'Install App' : 'Offline Mode Available'}
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader className="text-left">
            <SheetTitle>Install Training Session Manager</SheetTitle>
            <SheetDescription>
              Install the app on your device to access even when you're offline and have a smoother experience.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">Benefits:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Access even when you're offline</li>
                <li>• Better performance and faster loading</li>
                <li>• View and manage tasks offline</li>
                <li>• Experience similar to a native app</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Not now
              </Button>
              <Button onClick={handleInstall} className="gap-2">
                <Download className="h-4 w-4" />
                Install
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}