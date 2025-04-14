import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Import i18n configuration
import "./i18n";

// Import e registrar PWA service worker
import { PWA } from "./pwa";

// Registrar o service worker para funcionalidades offline
PWA.register();

// Configurar detecção de status online/offline
PWA.setupOfflineDetection();

// Verificar por atualizações no service worker periodicamente
PWA.checkForUpdates();

// Criar componente root e renderizar aplicação
createRoot(document.getElementById("root")!).render(<App />);
