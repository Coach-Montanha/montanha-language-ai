import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { ImpersonationBanner } from "@/components/ImpersonationBanner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  let router: ReturnType<typeof useRouter> | null = null;
  try {
    router = useRouter();
  } catch {
    // router pode não estar disponível em erros críticos
  }

  useEffect(() => {
    try {
      reportLovableError(error, { boundary: "tanstack_root_error_component" });
    } catch {
      // ignora
    }
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              try {
                router?.invalidate();
              } catch {
                // ignora
              }
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1, viewport-fit=cover",
      },
      { title: "Montanha Language AI — Tutor de Idiomas com IA, Treinos Diários de 5 Minutos & Imersão Fluida" },
      {
        name: "description",
        content:
          "Tutor de Idiomas com IA, Treinos Diários de 5 Minutos & Imersão Fluida.",
      },
      { name: "theme-color", content: "#2563eb" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Montanha Language AI" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "application-name", content: "Montanha Language AI" },
      { property: "og:title", content: "Montanha Language AI — Tutor de Idiomas com IA, Treinos Diários de 5 Minutos & Imersão Fluida" },
      {
        property: "og:description",
        content:
          "Tutor de Idiomas com IA, Treinos Diários de 5 Minutos & Imersão Fluida.",
      },
      { property: "og:url", content: "https://montanha-language-ai.vercel.app/" },
      { property: "og:site_name", content: "Montanha Language AI" },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://montanha-language-ai.vercel.app/icons/icon-512.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Montanha Language AI — Tutor de Idiomas com IA, Treinos Diários de 5 Minutos & Imersão Fluida" },
      { name: "twitter:description", content: "Tutor de Idiomas com IA, Treinos Diários de 5 Minutos & Imersão Fluida." },
      { name: "twitter:image", content: "https://montanha-language-ai.vercel.app/icons/icon-512.png" },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "google-site-verification", content: "GSC_VERIFICATION_PLACEHOLDER" },
    ],
    links: [
      { rel: "canonical", href: "https://montanha-language-ai.vercel.app/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..800&display=swap",
      },
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "icon", type: "image/svg+xml", href: "/icons/icon.svg" },
      { rel: "icon", type: "image/png", sizes: "192x192", href: "/icons/icon-192.png" },
      { rel: "icon", type: "image/png", sizes: "512x512", href: "/icons/icon-512.png" },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "shortcut icon", href: "/favicon.ico" },
      { rel: "manifest", href: "/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
      { rel: "apple-touch-icon", sizes: "192x192", href: "/icons/icon-192.png" },
      { rel: "apple-touch-icon", sizes: "512x512", href: "/icons/icon-512.png" },
      { rel: "mask-icon", href: "/icons/icon.svg", color: "#09090b" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          name: "Montanha Language AI",
          headline: "Tutor de Idiomas com IA, Treinos Diários de 5 Minutos & Imersão Fluida",
          operatingSystem: "Web, iOS, Android",
          applicationCategory: "EducationalApplication",
          description: "Tutor de Idiomas com IA, Treinos Diários de 5 Minutos & Imersão Fluida.",
          url: "https://montanha-language-ai.vercel.app/",
          offers: {
            "@type": "Offer",
            price: "0",
            priceCurrency: "BRL",
          },
          author: {
            "@type": "Organization",
            name: "Ecossistema Montanha",
            url: "https://montanha-language-ai.vercel.app/",
          },
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var size = localStorage.getItem('smart_language_fontsize') || 'md';
                  document.documentElement.setAttribute('data-font-size', size);
                  var design = localStorage.getItem('smart_language_design') || 'classic';
                  document.documentElement.setAttribute('data-design', design);
                  if (design === 'midnight') {
                    document.documentElement.classList.add('dark');
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
        {/* Estilos inline da tela inicial de carregamento com o símbolo oficial do app */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              #smart-app-splash {
                position: fixed;
                top: 0; left: 0; right: 0; bottom: 0;
                z-index: 999999;
                background-color: #09090b;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                transition: opacity 0.4s ease, visibility 0.4s ease;
              }
              #smart-app-splash.splash-dismissed {
                opacity: 0 !important;
                visibility: hidden !important;
                pointer-events: none !important;
                display: none !important;
              }
              .splash-box {
                width: 96px;
                height: 96px;
                border-radius: 28px;
                background: linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%);
                border: 2px solid rgba(99, 102, 241, 0.4);
                box-shadow: 0 0 35px rgba(99, 102, 241, 0.3), inset 0 0 15px rgba(99, 102, 241, 0.15);
                display: flex;
                align-items: center;
                justify-content: center;
                animation: splashPulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
              }
              .splash-title {
                margin-top: 22px;
                font-size: 22px;
                font-weight: 900;
                letter-spacing: -0.02em;
                color: #f8fafc;
                text-align: center;
              }
              .splash-title span {
                color: #6366f1;
              }
              .splash-subtitle {
                margin-top: 6px;
                font-size: 13px;
                font-weight: 500;
                color: #94a3b8;
                text-align: center;
                max-width: 360px;
                padding: 0 16px;
              }
              .splash-spinner {
                margin-top: 24px;
                width: 26px;
                height: 26px;
                border: 3px solid rgba(99, 102, 241, 0.15);
                border-top-color: #6366f1;
                border-radius: 50%;
                animation: splashSpin 0.75s linear infinite;
              }
              @keyframes splashPulse {
                0%, 100% { transform: scale(1); box-shadow: 0 0 35px rgba(99, 102, 241, 0.3); }
                50% { transform: scale(1.05); box-shadow: 0 0 50px rgba(99, 102, 241, 0.5); }
              }
              @keyframes splashSpin {
                to { transform: rotate(360deg); }
              }
            `,
          }}
        />
      </head>
      <body>
        {/* Tela Inicial de Carregamento Instantânea com o Símbolo Oficial do Montanha Language AI */}
        <div id="smart-app-splash" aria-label="Carregando Montanha Language AI...">
          <div className="splash-box">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" fill="#6366f1" fillOpacity="0.25" />
            </svg>
          </div>
          <div className="splash-title">Montanha <span>Language AI</span></div>
          <div className="splash-subtitle">Tutor de Idiomas com IA, Treinos Diários de 5 Minutos &amp; Imersão Fluida</div>
          <div className="splash-spinner"></div>
        </div>

        {children}

        {/* Script para suavizar e fechar a splash assim que o app estiver pronto */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function dismiss() {
                  var el = document.getElementById('smart-app-splash');
                  if (el) {
                    el.classList.add('splash-dismissed');
                    el.style.display = 'none';
                    if (el.parentNode) {
                      try { el.parentNode.removeChild(el); } catch(e){}
                    }
                  }
                }
                if (document.readyState === 'complete') {
                  setTimeout(dismiss, 50);
                } else {
                  window.addEventListener('load', function() {
                    setTimeout(dismiss, 50);
                  });
                }
                setTimeout(dismiss, 500);
              })();
            `,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW register failed:', err);
                  });
                });
              }
            `,
          }}
        />
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ImpersonationBanner />
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
