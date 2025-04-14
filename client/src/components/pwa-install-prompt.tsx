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

  // Verificar status de instalação
  useEffect(() => {
    const isStandalone = PWA.detectStandaloneMode();
    setIsInstallable(!isStandalone);

    // Monitorar evento de instalação
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      // @ts-ignore - Tipo personalizado não está disponível no TypeScript padrão
      const promptFn = PWA.setupInstallPrompt()(e);
      setInstallPromptFn(() => promptFn);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Monitorar status online/offline
    const handleConnectionChange = (e: Event) => {
      // @ts-ignore - Acessando detalhe personalizado do evento
      const online = (e as CustomEvent)?.detail?.online ?? navigator.onLine;
      setIsOnline(online);
      
      if (!online) {
        toast({
          title: "Você está offline",
          description: "Algumas funcionalidades podem estar limitadas",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Conexão restaurada",
          description: "Todas as funcionalidades estão disponíveis",
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
          {isOnline ? 'Instalar App' : 'Modo Offline Disponível'}
        </Button>
      </div>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="bottom" className="rounded-t-xl">
          <SheetHeader className="text-left">
            <SheetTitle>Instalar Training Session Manager</SheetTitle>
            <SheetDescription>
              Instale o aplicativo no seu dispositivo para acessar mesmo quando estiver offline e ter uma experiência mais fluida.
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-2">
              <h3 className="text-sm font-semibold">Benefícios:</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Acesso mesmo quando estiver sem internet</li>
                <li>• Melhor desempenho e carregamento mais rápido</li>
                <li>• Visualização e gerenciamento de tarefas offline</li>
                <li>• Experiência similar a um aplicativo nativo</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Agora não
              </Button>
              <Button onClick={handleInstall} className="gap-2">
                <Download className="h-4 w-4" />
                Instalar
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}