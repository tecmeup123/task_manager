// Registrar o service worker
export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    // Em desenvolvimento, o service worker pode ter conflitos com o HMR do Vite
    // Em produção, isso funcionará normalmente
    const isProduction = import.meta.env.PROD;
    
    // Só registramos o service worker em produção ou se forçado
    if (isProduction || localStorage.getItem('forcePWA') === 'true') {
      window.addEventListener('load', async () => {
        try {
          // Tentar registrar o service worker
          const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/'
          });
          console.log('Service Worker registrado com sucesso:', registration.scope);
        } catch (error) {
          console.error('Falha ao registrar Service Worker:', error);
        }
      });
    } else {
      console.log('Service Worker desativado em desenvolvimento');
      
      // Para testar em desenvolvimento, você pode habilitar com:
      // localStorage.setItem('forcePWA', 'true')
    }
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

// Detectar quando o aplicativo está sendo executado no modo standalone (instalado)
export function detectStandaloneMode(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         ('standalone' in navigator && (navigator as any).standalone === true);
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

// Exportar todas as funções relacionadas ao PWA
export const PWA = {
  register: registerServiceWorker,
  checkForUpdates,
  setupInstallPrompt,
  detectStandaloneMode,
  setupOfflineDetection
};