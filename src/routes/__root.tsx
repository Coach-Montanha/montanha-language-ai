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
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
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
              router.invalidate();
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
        content:
          "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover",
      },
      { title: "Smart Language - Tutor de Línguas com IA" },
      {
        name: "description",
        content:
          "Aprenda a falar, ouvir e ler idiomas com tutor com IA, missões reais e treino de 5 minutos.",
      },
      { name: "theme-color", content: "#2563eb" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "Smart Language" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "application-name", content: "Smart Language" },
      { property: "og:title", content: "Smart Language - Tutor de Línguas com IA" },
      {
        property: "og:description",
        content:
          "Tutor nativo com personalidade, missões de sobrevivência e pronúncia fonética.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [
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
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                z-index: 999999;
                background-color: #09090b;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                transition: opacity 0.35s ease, visibility 0.35s ease;
              }
              #smart-app-splash.splash-dismissed {
                opacity: 0;
                visibility: hidden;
                pointer-events: none;
              }
              .splash-box {
                width: 76px;
                height: 76px;
                border-radius: 22px;
                background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #090d16 100%);
                border: 1.5px solid rgba(59, 130, 246, 0.4);
                box-shadow: 0 12px 30px -4px rgba(0, 0, 0, 0.7), 0 0 25px rgba(37, 99, 235, 0.35);
                display: flex;
                align-items: center;
                justify-content: center;
                animation: splashPulse 2s ease-in-out infinite;
              }
              .splash-title {
                margin-top: 18px;
                font-size: 19px;
                font-weight: 800;
                letter-spacing: -0.02em;
                color: #f8fafc;
                text-align: center;
              }
              .splash-subtitle {
                margin-top: 4px;
                font-size: 12px;
                color: #94a3b8;
                text-align: center;
              }
              .splash-spinner {
                margin-top: 24px;
                width: 22px;
                height: 22px;
                border: 2.5px solid rgba(255, 255, 255, 0.1);
                border-top-color: #3b82f6;
                border-radius: 50%;
                animation: splashSpin 0.75s linear infinite;
              }
              @keyframes splashPulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.04); }
              }
              @keyframes splashSpin {
                to { transform: rotate(360deg); }
              }
            `,
          }}
        />
      </head>
      <body>
        {/* Tela Inicial de Carregamento Instantânea com o Símbolo Oficial do Smart Language */}
        <div id="smart-app-splash" aria-label="Carregando Smart Language...">
          <div className="splash-box">
            <svg
              width="44"
              height="44"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" fill="#fef08a" fillOpacity="0.25" />
              <path d="M5 3v4" />
              <path d="M7 5H3" />
              <path d="M19 17v4" />
              <path d="M21 19h-4" />
            </svg>
          </div>
          <div className="splash-title">Smart Language</div>
          <div className="splash-subtitle">Tutor de línguas com IA</div>
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
                  if (el && !el.classList.contains('splash-dismissed')) {
                    el.classList.add('splash-dismissed');
                    setTimeout(function() {
                      if (el && el.parentNode) {
                        el.parentNode.removeChild(el);
                      }
                    }, 400);
                  }
                }
                if (document.readyState === 'complete') {
                  setTimeout(dismiss, 120);
                } else {
                  window.addEventListener('load', function() {
                    setTimeout(dismiss, 120);
                  });
                }
                setTimeout(dismiss, 1800);
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
      {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
      <Outlet />
    </QueryClientProvider>
  );
}
