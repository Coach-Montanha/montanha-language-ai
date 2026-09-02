import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Download,
  Share2,
  PlusSquare,
  X,
  Smartphone,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Verificar se já está rodando como PWA standalone
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    setIsStandalone(isStandaloneMode);

    // Verificar se é dispositivo iOS (iPhone / iPad / iPod)
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIos(isIosDevice);

    // Capturar evento de instalação no Android/Chromium
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Se não foi descartado nesta sessão, sugerir o banner
      if (!sessionStorage.getItem("pwa_dismissed")) {
        setIsOpen(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Se estiver no iOS e ainda não estiver em standalone e não descartado
    if (isIosDevice && !isStandaloneMode && !sessionStorage.getItem("pwa_dismissed")) {
      // Pequeno delay para não sobrecarregar na entrada imediata
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 2500);
      return () => clearTimeout(timer);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setIsOpen(false);
      setIsStandalone(true);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setIsOpen(false);
    setIsDismissed(true);
    sessionStorage.setItem("pwa_dismissed", "true");
  };

  if (isStandalone || isDismissed || !isOpen) {
    return null;
  }

  return (
    <div className="fixed bottom-16 left-0 right-0 z-40 px-3 py-2 animate-in slide-in-from-bottom duration-300">
      <div className="mx-auto max-w-md rounded-2xl border-2 border-primary/40 bg-card/95 backdrop-blur-md p-3.5 shadow-2xl space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground flex items-center gap-1">
                Instalar no Celular (App PWA) <Sparkles className="h-3 w-3 text-amber-500" />
              </h4>
              <p className="text-[11px] text-muted-foreground leading-tight">
                Use em tela cheia, com voz nativa e sem barras do navegador.
              </p>
            </div>
          </div>
          <button
            onClick={handleDismiss}
            className="h-6 w-6 rounded-md hover:bg-muted text-muted-foreground flex items-center justify-center"
            title="Fechar aviso"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Caso Android / Chrome / Edge */}
        {deferredPrompt && (
          <div className="flex items-center gap-2 pt-1">
            <Button
              onClick={handleInstallClick}
              size="sm"
              className="w-full text-xs font-bold h-8 gap-1.5 bg-primary text-primary-foreground shadow-xs"
            >
              <Download className="h-3.5 w-3.5" />
              Instalar Aplicativo Agora
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="text-xs h-8 px-3"
            >
              Depois
            </Button>
          </div>
        )}

        {/* Caso iOS / iPhone (Safari) */}
        {isIos && !deferredPrompt && (
          <div className="rounded-xl bg-muted/60 p-2.5 space-y-1.5 text-[11px] border border-border/50 text-foreground">
            <p className="font-semibold text-primary flex items-center gap-1">
              Como adicionar no iPhone:
            </p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                1
              </span>
              <span>
                Toque no botão <strong>Compartilhar</strong> <Share2 className="inline h-3 w-3 text-primary mx-0.5" /> na barra do Safari.
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-[10px]">
                2
              </span>
              <span>
                Role para baixo e selecione <strong>&ldquo;Adicionar à Tela de Início&rdquo;</strong> <PlusSquare className="inline h-3 w-3 text-primary mx-0.5" />.
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDismiss}
              className="w-full text-[11px] font-semibold h-7 mt-1"
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-500" /> Entendido!
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
