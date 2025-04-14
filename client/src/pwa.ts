// Register the service worker
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // In development, service worker might conflict with Vite's HMR
    // But we'll force it to register for testing purposes
    
    // Force PWA features in development mode to test installation
    localStorage.setItem('forcePWA', 'true');
    
    window.addEventListener('load', async () => {
      try {
        // Try to register the service worker
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
          scope: '/'
        });
        console.log('Service Worker registered successfully:', registration.scope);
      } catch (error) {
        console.error('Failed to register Service Worker:', error);
      }
    });
  }
}

// Função para verificar atualizações no service worker
export function checkForUpdates() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      // Recarregar a página quando o service worker for atualizado
      window.location.reload();
    });

    // Verificar se há atualizações periodicamente
    setInterval(() => {
      navigator.serviceWorker.getRegistration().then(registration => {
        if (registration) {
          registration.update();
        }
      });
    }, 60 * 60 * 1000); // Verificar a cada hora
  }
}

// Função para mostrar um prompt de instalação personalizado
export function setupInstallPrompt() {
  let deferredPrompt: any;

  window.addEventListener('beforeinstallprompt', (e) => {
    // Prevenir o prompt automático do navegador
    e.preventDefault();
    // Armazenar o evento para uso posterior
    deferredPrompt = e;

    // Essa função pode ser chamada de um botão "Instalar App" na UI
    return () => {
      if (deferredPrompt) {
        // Mostrar o prompt
        deferredPrompt.prompt();
        // Aguardar pela resposta do usuário
        deferredPrompt.userChoice.then((choiceResult: {outcome: string}) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('Usuário aceitou a instalação do PWA');
          } else {
            console.log('Usuário recusou a instalação do PWA');
          }
          deferredPrompt = null;
        });
      }
    };
  });
}

// Detect when the app is running in standalone mode (installed)
export function detectStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         ('standalone' in navigator && (navigator as any).standalone === true);
}

// Function to force the welcome screen to show (for testing purposes)
export function resetWelcomeScreen(): void {
  localStorage.removeItem('pwa_welcome_seen');
  localStorage.setItem('force_welcome_screen', 'true');
  console.log("Welcome screen has been reset. Refresh the page to see it.");
}

// Verificar status da conexão do usuário
export function setupOfflineDetection() {
  function updateOnlineStatus() {
    const status = navigator.onLine ? 'online' : 'offline';
    console.log(`Application is now ${status}`);
    
    // Você pode disparar eventos personalizados ou atualizar a UI baseado no status
    document.dispatchEvent(new CustomEvent('connectionChange', { 
      detail: { online: navigator.onLine } 
    }));
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  // Verificar status inicial
  updateOnlineStatus();
}

// Export all PWA-related functions
export const PWA = {
  register: registerServiceWorker,
  checkForUpdates,
  setupInstallPrompt,
  detectStandaloneMode,
  resetWelcomeScreen,
  setupOfflineDetection
};