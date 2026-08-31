import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone } from 'lucide-react';

export const InstallAppBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Detecta se já está instalado como app (standalone)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                         (window.navigator as any).standalone === true;
    if (isStandalone) {
      return; // Já está instalado, não exibe o banner
    }

    // Detecta se é iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      setIsInstallable(true);
    }

    // Listener para navegadores baseados em Chromium (Android / Chrome / Edge)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      alert("No iPhone: toque no botão de Compartilhar (ícone de quadrado com seta) e selecione 'Adicionar à Tela de Início'.");
    }
  };

  if (!isInstallable || isDismissed) {
    return null;
  }

  return (
    <div 
      className="animate-slide-up"
      style={{
        margin: '0 20px 14px 20px',
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(37, 99, 235, 0.08) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.35)',
        borderRadius: 'var(--radius-card)',
        padding: '14px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        position: 'relative'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            backgroundColor: '#3B82F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
          }}>
            <Smartphone size={20} color="#FFFFFF" />
          </div>
          <div>
            <h4 style={{ fontSize: '14px', fontWeight: 800, color: '#FFFFFF' }}>
              Instalar Aplicativo
            </h4>
            <p className="label-subtle" style={{ fontSize: '11px', color: '#93C5FD' }}>
              Adicionar à gaveta de apps do celular
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#A1A1AA',
            padding: '4px',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>
      </div>

      <p style={{ fontSize: '12px', color: '#E2E8F0', lineHeight: 1.4 }}>
        Instale para usar direto da sua gaveta de aplicativos em tela cheia e 100% offline.
      </p>

      <button
        onClick={handleInstallClick}
        className="btn-primary"
        style={{
          width: '100%',
          padding: '10px 14px',
          fontSize: '13px',
          backgroundColor: '#FFFFFF',
          color: '#09090B'
        }}
      >
        <Download size={16} />
        Instalar na Gaveta de Apps
      </button>
    </div>
  );
};
