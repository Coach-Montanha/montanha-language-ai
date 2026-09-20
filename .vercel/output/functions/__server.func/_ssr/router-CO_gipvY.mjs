import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { E as Sparkles, Ht as ArrowRight, It as BrainCircuit, K as MessageSquare, Lt as Bot, O as Shield, Ut as ArrowLeft, W as Mic, Y as LogOut, _ as Target, _t as Copy, a as Volume2, bt as Clock, c as UserCheck, et as Layers, ft as ExternalLink, gt as Database, ht as DollarSign, k as ShieldCheck, lt as Flame, st as Globe, t as Zap, ut as FileText, zt as BookOpen } from "../_libs/lucide-react.mjs";
import { a as cn, i as Label, n as Button, r as Input, t as Badge } from "./label-bUWeFWdB.mjs";
import { _ as useRouter, c as HeadContent, d as createRouter, f as Outlet, g as Link, h as createRootRouteWithContext, l as useRouterState, m as createFileRoute, p as lazyRouteComponent, s as Scripts } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as QueryClient } from "../_libs/tanstack__query-core.mjs";
import { t as QueryClientProvider } from "../_libs/tanstack__react-query.mjs";
import { n as toast } from "../_libs/sonner.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-CO_gipvY.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var styles_default = "/assets/styles--frh13mI.css";
function reportLovableError(error, context = {}) {
	if (typeof window === "undefined") return;
	window.__lovableEvents?.captureException?.(error, {
		source: "react_error_boundary",
		route: window.location.pathname,
		...context
	}, {
		mechanism: "react_error_boundary",
		handled: false,
		severity: "error"
	});
	const message = error instanceof Response ? `Response ${error.status}${error.url ? ` at ${error.url}` : ""}` : error instanceof Error ? error.message : String(error);
	const stack = error instanceof Error ? error.stack : void 0;
	window.__lovableReportRuntimeError?.({
		message,
		...stack !== void 0 && { stack },
		filename: window.location.pathname
	});
}
var IMPERSONATE_STORAGE_KEY = "montanha_impersonate";
function getImpersonatedEmail() {
	if (typeof window === "undefined") return null;
	try {
		const fromUrl = new URLSearchParams(window.location.search).get("impersonate");
		if (fromUrl && fromUrl.trim()) {
			const clean = fromUrl.trim().toLowerCase();
			localStorage.setItem(IMPERSONATE_STORAGE_KEY, clean);
			return clean;
		}
		return localStorage.getItem(IMPERSONATE_STORAGE_KEY);
	} catch {
		return null;
	}
}
function clearImpersonation() {
	if (typeof window === "undefined") return;
	try {
		localStorage.removeItem(IMPERSONATE_STORAGE_KEY);
		const url = new URL(window.location.href);
		url.searchParams.delete("impersonate");
		window.location.href = url.pathname + (url.search ? url.search : "") + url.hash;
	} catch {
		localStorage.removeItem(IMPERSONATE_STORAGE_KEY);
		window.location.reload();
	}
}
var ImpersonationBanner = () => {
	const [email, setEmail] = (0, import_react.useState)(null);
	const currentSearch = useRouterState({ select: (s) => s.location.search });
	(0, import_react.useEffect)(() => {
		setEmail(getImpersonatedEmail());
		const handleStorage = (e) => {
			if (e.key === "montanha_impersonate") setEmail(e.newValue);
		};
		window.addEventListener("storage", handleStorage);
		return () => window.removeEventListener("storage", handleStorage);
	}, [currentSearch]);
	if (!email) return null;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("aside", {
		"aria-label": "Aviso de Modo Suporte Técnico",
		className: "sticky top-0 z-[9999] w-full bg-gradient-to-r from-amber-500/20 via-indigo-500/20 to-purple-500/20 border-b border-amber-500/40 backdrop-blur-xl px-4 py-2 text-xs text-amber-200 shadow-lg",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "p-1 rounded-lg bg-amber-500/30 text-amber-300",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, { className: "w-4 h-4" })
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-wrap items-center gap-1.5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-extrabold uppercase tracking-wider text-[11px] text-amber-300",
							children: "Modo Suporte Técnico:"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Você está operando como" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono font-bold text-white bg-slate-900/80 px-2 py-0.5 rounded border border-amber-500/30",
							children: email
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-slate-400 hidden sm:inline",
							children: "(Privilégios de SuperAdmin ativos)"
						})
					]
				})]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex items-center gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
					className: "inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 rounded-full",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserCheck, { className: "w-3 h-3" }), " Sessão Ativa"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: clearImpersonation,
					className: "inline-flex items-center gap-1 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border border-amber-500/50 font-bold transition text-xs cursor-pointer",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LogOut, { className: "w-3 h-3" }), " Sair do modo suporte"]
				})]
			})]
		})
	});
};
function NotFoundComponent() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-7xl font-bold text-foreground",
					children: "404"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "mt-4 text-xl font-semibold text-foreground",
					children: "Page not found"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "The page you're looking for doesn't exist or has been moved."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-6",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Go home"
					})
				})
			]
		})
	});
}
function ErrorComponent({ error, reset }) {
	console.error(error);
	let router = null;
	try {
		router = useRouter();
	} catch {}
	(0, import_react.useEffect)(() => {
		try {
			reportLovableError(error, { boundary: "tanstack_root_error_component" });
		} catch {}
	}, [error]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex min-h-screen items-center justify-center bg-background px-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "max-w-md text-center",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "text-xl font-semibold tracking-tight text-foreground",
					children: "This page didn't load"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-sm text-muted-foreground",
					children: "Something went wrong on our end. You can try refreshing or head back home."
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-6 flex flex-wrap justify-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: () => {
							try {
								router?.invalidate();
							} catch {}
							reset();
						},
						className: "inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
						children: "Try again"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/",
						className: "inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent",
						children: "Go home"
					})]
				})
			]
		})
	});
}
var Route$5 = createRootRouteWithContext()({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"
			},
			{ title: "Montanha Language AI — Tutor de Idiomas com IA, Treinos Diários de 5 Minutos & Imersão Fluida" },
			{
				name: "description",
				content: "Tutor de Idiomas com IA, Treinos Diários de 5 Minutos & Imersão Fluida."
			},
			{
				name: "theme-color",
				content: "#2563eb"
			},
			{
				name: "apple-mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "apple-mobile-web-app-status-bar-style",
				content: "black-translucent"
			},
			{
				name: "apple-mobile-web-app-title",
				content: "Montanha Language AI"
			},
			{
				name: "mobile-web-app-capable",
				content: "yes"
			},
			{
				name: "application-name",
				content: "Montanha Language AI"
			},
			{
				property: "og:title",
				content: "Montanha Language AI — Tutor de Idiomas com IA, Treinos Diários de 5 Minutos & Imersão Fluida"
			},
			{
				property: "og:description",
				content: "Tutor de Idiomas com IA, Treinos Diários de 5 Minutos & Imersão Fluida."
			},
			{
				property: "og:type",
				content: "website"
			}
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..800&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/icons/icon.svg"
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "192x192",
				href: "/icons/icon-192.png"
			},
			{
				rel: "icon",
				type: "image/png",
				sizes: "512x512",
				href: "/icons/icon-512.png"
			},
			{
				rel: "icon",
				href: "/favicon.ico",
				type: "image/x-icon"
			},
			{
				rel: "shortcut icon",
				href: "/favicon.ico"
			},
			{
				rel: "manifest",
				href: "/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/apple-touch-icon.png"
			},
			{
				rel: "apple-touch-icon",
				sizes: "180x180",
				href: "/apple-touch-icon.png"
			},
			{
				rel: "apple-touch-icon",
				sizes: "192x192",
				href: "/icons/icon-192.png"
			},
			{
				rel: "apple-touch-icon",
				sizes: "512x512",
				href: "/icons/icon-512.png"
			},
			{
				rel: "mask-icon",
				href: "/icons/icon.svg",
				color: "#09090b"
			}
		]
	}),
	shellComponent: RootShell,
	component: RootComponent,
	notFoundComponent: NotFoundComponent,
	errorComponent: ErrorComponent
});
function RootShell({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "pt-BR",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("head", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: `
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
            ` } }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("style", { dangerouslySetInnerHTML: { __html: `
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
            ` } })
		] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				id: "smart-app-splash",
				"aria-label": "Carregando Montanha Language AI...",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "splash-box",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
							width: "48",
							height: "48",
							viewBox: "0 0 24 24",
							fill: "none",
							stroke: "#6366f1",
							strokeWidth: "2.2",
							strokeLinecap: "round",
							strokeLinejoin: "round",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
								d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z",
								fill: "#6366f1",
								fillOpacity: "0.25"
							})
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "splash-title",
						children: ["Montanha ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Language AI" })]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "splash-subtitle",
						children: "Tutor de Idiomas com IA, Treinos Diários de 5 Minutos & Imersão Fluida"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "splash-spinner" })
				]
			}),
			children,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: `
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
            ` } }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("script", { dangerouslySetInnerHTML: { __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function(err) {
                    console.log('SW register failed:', err);
                  });
                });
              }
            ` } }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
		] })]
	});
}
function RootComponent() {
	const { queryClient } = Route$5.useRouteContext();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(QueryClientProvider, {
		client: queryClient,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ImpersonationBanner, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {})]
	});
}
var $$splitComponentImporter$1 = () => import("./routes-OrNWHrst.mjs");
var Route$4 = createFileRoute("/")({
	ssr: false,
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
var Card = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("rounded-xl border bg-card text-card-foreground shadow", className),
	...props
}));
Card.displayName = "Card";
var CardHeader = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex flex-col space-y-1.5 p-6", className),
	...props
}));
CardHeader.displayName = "CardHeader";
var CardTitle = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("font-semibold leading-none tracking-tight", className),
	...props
}));
CardTitle.displayName = "CardTitle";
var CardDescription = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("text-sm text-muted-foreground", className),
	...props
}));
CardDescription.displayName = "CardDescription";
var CardContent = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("p-6 pt-0", className),
	...props
}));
CardContent.displayName = "CardContent";
var CardFooter = import_react.forwardRef(({ className, ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
	ref,
	className: cn("flex items-center p-6 pt-0", className),
	...props
}));
CardFooter.displayName = "CardFooter";
var Route$3 = createFileRoute("/boost")({ component: BoostPage });
var SPRINT_CHALLENGES = [
	{
		title: "Sprint 180s — Shadowing Fluency",
		time: "3 min",
		target: "Fluência Oral",
		description: "Repita imediatamente após o áudio em velocidade nativa sem pausar para desenvolver automatismo neural.",
		level: "Todos os Níveis"
	},
	{
		title: "Sprint 120s — Quick Vocabulary Recall",
		time: "2 min",
		target: "Vocabulário Ativo",
		description: "Responda com o sinônimo ou tradução em menos de 3 segundos por palavra antes do tempo expirar.",
		level: "Intermediário"
	},
	{
		title: "Sprint 300s — AI Situational Roleplay",
		time: "5 min",
		target: "Imersão Conversacional",
		description: "Resolva um problema simulado com a IA (ex: voo cancelado ou devolução em loja) em tempo real.",
		level: "Avançado"
	}
];
function BoostPage() {
	const [activeSprint, setActiveSprint] = (0, import_react.useState)(null);
	const startSprint = (index) => {
		setActiveSprint(index);
		toast.success(`Iniciando ${SPRINT_CHALLENGES[index].title}! Prepare o microfone e foco total.`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground p-4 md:p-8 space-y-8 max-w-7xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-6 md:p-10 shadow-2xl backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative z-10 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "border-indigo-500/50 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider px-3 py-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "w-3.5 h-3.5 mr-1.5 text-indigo-400" }), "Acelerador de Fluência"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "border-purple-500/50 bg-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-wider px-3 py-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BrainCircuit, { className: "w-3.5 h-3.5 mr-1.5 text-purple-400" }), "Treinos de Alta Densidade Neural"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-3xl md:text-5xl font-black tracking-tight text-white",
							children: ["Fluency ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-indigo-400",
								children: "Booster"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed mt-1",
							children: "Acelere sua fala e compreensão auditiva com micro-sprints cronometrados de 3 a 5 minutos, correção fonética em tempo real e imersão ativa."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								variant: "outline",
								className: "border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-xs font-bold",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/eco",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-3.5 h-3.5 mr-1.5" }), "Hub Ecossistema"]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								asChild: true,
								className: "bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
									to: "/create",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-3.5 h-3.5 mr-1.5" }), "Criar Lições Personalizadas"]
								})
							})]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-2xl font-black tracking-tight text-white flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flame, { className: "w-6 h-6 text-indigo-400" }), "Micro-Sprints Diários de 3 a 5 Minutos"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Desafios intensos para desbloquear a fala rápida sem tradução mental."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 md:grid-cols-3 gap-5",
					children: SPRINT_CHALLENGES.map((challenge, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-6 border-slate-800 bg-card/70 backdrop-blur-md space-y-4 flex flex-col justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										variant: "outline",
										className: "border-indigo-500/40 text-indigo-300 text-[10px]",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Clock, { className: "w-3 h-3 mr-1" }),
											" ",
											challenge.time
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] text-muted-foreground font-semibold",
										children: challenge.level
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-extrabold text-base text-white",
									children: challenge.title
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs text-slate-300 leading-relaxed",
									children: challenge.description
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "pt-1",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20",
										children: ["Foco: ", challenge.target]
									})
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => startSprint(idx),
								className: "w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white text-xs font-bold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "w-3.5 h-3.5 mr-1.5" }), " Começar Sprint"]
							})
						})]
					}, idx))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 md:grid-cols-2 gap-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-6 border-slate-800 bg-card/70 backdrop-blur-md space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2 border-b border-slate-800 pb-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Volume2, { className: "w-5 h-5 text-indigo-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
								className: "font-extrabold text-base text-white",
								children: "Ruflo Accent & Phonetics AI"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Análise de ritmo, prosódia e sotaque"
							})] })]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3 text-xs",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-slate-200",
									children: "1. Redução de 'Uhhs' e Hesitação"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground",
									children: "O tutor mede suas pausas e propõe conectivos naturais (well, actually, you see)."
								})]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-slate-200",
									children: "2. Conexões de Sons (Connected Speech)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-muted-foreground",
									children: "Aprenda a falar \"what are you doing\" como \"whatcha doin\" com naturalidade nativa."
								})]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							asChild: true,
							className: "w-full bg-slate-900 border border-indigo-500/40 hover:bg-indigo-500/10 text-indigo-300 font-bold text-xs",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
								to: "/",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mic, { className: "w-3.5 h-3.5 mr-1.5" }), " Praticar no Tutor Conversacional"]
							})
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
					className: "p-6 border-slate-800 bg-card/70 backdrop-blur-md space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-center gap-2 border-b border-slate-800 pb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Target, { className: "w-5 h-5 text-emerald-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-extrabold text-base text-white",
							children: "Métricas de Vocabulário Ativo vs Passivo"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: "Transforme palavras que você só reconhece em palavras que você fala"
						})] })]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "space-y-3 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center p-3 rounded-xl bg-slate-900/80 border border-slate-800",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-slate-300",
									children: "Vocabulário Passivo (Leitura / Compreensão)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono font-bold text-indigo-400 text-sm",
									children: "~ 3.200 palavras"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center p-3 rounded-xl bg-slate-900/80 border border-slate-800",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-slate-300",
									children: "Vocabulário Ativo (Fala Espontânea)"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-mono font-bold text-emerald-400 text-sm",
									children: "~ 1.150 palavras"
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "font-bold text-emerald-300 block mb-1",
									children: "Meta do Mês:"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-slate-300 text-[11px]",
									children: "Ativar 150 novos termos técnicos e expressões idiomáticas na conversação oral."
								})]
							})
						]
					})]
				})]
			})
		]
	});
}
var Route$2 = createFileRoute("/create")({ component: CreateStudioPage });
var SITUATIONAL_PRESETS = [
	{
		topic: "Na Academia (At the Gym)",
		language: "Inglês",
		level: "Intermediário",
		dialogue: "A: Could you spot me on this bench press set?\nB: Sure, how many reps are you going for?\nA: Aiming for eight. If I struggle on the last one, just give a light assist.\nB: Got it. Ready when you are!",
		vocab: [
			"Bench press",
			"Spot me",
			"Reps (repetitions)",
			"Assist"
		]
	},
	{
		topic: "Reunião de Negócios (Business Meeting)",
		language: "Inglês",
		level: "Avançado",
		dialogue: "A: Let’s pivot to our Q3 financial deliverables.\nB: Our customer acquisition cost dropped by 18% after implementing the new onboarding flow.\nA: That’s a compelling metric. Let’s scale the rollout next week.",
		vocab: [
			"Pivot",
			"Deliverables",
			"Customer acquisition cost",
			"Compelling metric"
		]
	},
	{
		topic: "Café em Paris (Au Café)",
		language: "Francês",
		level: "Básico",
		dialogue: "A: Bonjour ! Je voudrais un café au lait et un croissant s’il vous plaît.\nB: Très bien monsieur. Sur place ou à emporter ?\nA: Sur place, merci !",
		vocab: [
			"Café au lait",
			"S’il vous plaît",
			"Sur place",
			"À emporter"
		]
	},
	{
		topic: "Aeroporto e Check-in (At the Airport)",
		language: "Espanhol",
		level: "Básico / Intermediário",
		dialogue: "A: Buenas tardes, aquí está mi pasaporte para el vuelo a Madrid.\nB: Gracias. ¿Lleva equipaje de mano o va a facturar maletas?\nA: Solo esta maleta de mano. ¿A qué puerta debo dirigirme?\nB: Puerta B14. ¡Buen viaje!",
		vocab: [
			"Pasaporte",
			"Vuelo",
			"Equipaje de mano",
			"Facturar maletas",
			"Puerta de embarque"
		]
	}
];
function CreateStudioPage() {
	const [customTopic, setCustomTopic] = (0, import_react.useState)("");
	const [customLanguage, setCustomLanguage] = (0, import_react.useState)("Inglês");
	const [customLevel, setCustomLevel] = (0, import_react.useState)("Intermediário");
	const copyText = (txt) => {
		navigator.clipboard.writeText(txt);
		toast.success("Conteúdo copiado para a área de transferência!");
	};
	const handleGenerateCustom = (e) => {
		e.preventDefault();
		if (!customTopic) {
			toast.error("Informe um tema ou situação.");
			return;
		}
		toast.success(`Lição sobre "${customTopic}" em ${customLanguage} pronta!`);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground p-4 md:p-8 space-y-8 max-w-7xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-6 md:p-10 shadow-2xl backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative z-10 space-y-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "border-indigo-500/50 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider px-3 py-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-3.5 h-3.5 mr-1.5 text-indigo-400" }), "Estúdio de Criação com IA"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
							variant: "outline",
							className: "border-purple-500/50 bg-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-wider px-3 py-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, { className: "w-3.5 h-3.5 mr-1.5 text-purple-400" }), "Diálogos, Flashcards & Microtreinos"]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-col md:flex-row md:items-center justify-between gap-4",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-3xl md:text-5xl font-black tracking-tight text-white",
							children: ["Criação de ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-indigo-400",
								children: "Lições & Diálogos"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed mt-1",
							children: "Gere diálogos situacionais hiper-realistas, listas de vocabulário ativo e flashcards com pronúncia para imersão fluida."
						})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "outline",
									className: "border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-xs font-bold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/eco",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "w-3.5 h-3.5 mr-1.5" }), "Hub Ecossistema"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "outline",
									className: "border-indigo-500/40 hover:bg-indigo-500/10 text-indigo-300 text-xs font-bold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
										to: "/boost",
										children: "Acelerador"
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									className: "bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/",
										children: ["Abrir Tutor IA ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-3.5 h-3.5 ml-1.5" })]
									})
								})
							]
						})]
					})]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
				className: "p-6 border-slate-800 bg-card/70 backdrop-blur-md space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "border-b border-slate-800 pb-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
						className: "font-extrabold text-base text-white flex items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-5 h-5 text-indigo-400" }), "Gerador Sob Medida de Diálogos Situacionais"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: "Escolha o tema, idioma e nível para criar uma lição contextual instantânea"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: handleGenerateCustom,
					className: "grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "topic",
								className: "text-xs font-bold",
								children: "Tema / Cenário"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
								id: "topic",
								placeholder: "Ex: Entrevista de Emprego Tech",
								value: customTopic,
								onChange: (e) => setCustomTopic(e.target.value),
								className: "bg-slate-900 border-slate-800",
								required: true
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "lang",
								className: "text-xs font-bold",
								children: "Idioma Alvo"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								id: "lang",
								value: customLanguage,
								onChange: (e) => setCustomLanguage(e.target.value),
								className: "w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-bold",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Inglês",
										children: "🇺🇸 Inglês"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Espanhol",
										children: "🇪🇸 Espanhol"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Francês",
										children: "🇫🇷 Francês"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Italiano",
										children: "🇮🇹 Italiano"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Alemão",
										children: "🇩🇪 Alemão"
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-1.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, {
								htmlFor: "level",
								className: "text-xs font-bold",
								children: "Nível de Dificuldade"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								id: "level",
								value: customLevel,
								onChange: (e) => setCustomLevel(e.target.value),
								className: "w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-bold",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Iniciante",
										children: "Iniciante (A1-A2)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Intermediário",
										children: "Intermediário (B1-B2)"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "Avançado",
										children: "Avançado / Fluente (C1-C2)"
									})
								]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "sm:col-span-3 flex justify-end",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								type: "submit",
								className: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-4 h-4 mr-1.5" }), " Criar Lição com IA"]
							})
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-2xl font-black tracking-tight text-white flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "w-6 h-6 text-indigo-400" }), "Modelos de Situações Reais Pré-Configurados"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Copie ou pratique diálogos com o tutor inteligente do Montanha Language AI."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 md:grid-cols-2 gap-5",
					children: SITUATIONAL_PRESETS.map((item, idx) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-6 border-slate-800 bg-card/70 backdrop-blur-md space-y-4 flex flex-col justify-between",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "space-y-3",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex justify-between items-center",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-full",
										children: [
											item.language,
											" • ",
											item.level
										]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
										variant: "outline",
										className: "border-slate-700 text-slate-400 text-[10px]",
										children: "Situacional"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
									className: "font-extrabold text-base text-white",
									children: item.topic
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
									className: "text-xs text-slate-200 bg-slate-950/80 p-3 rounded-xl border border-slate-800 whitespace-pre-wrap font-sans leading-relaxed",
									children: item.dialogue
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "flex flex-wrap gap-1.5 pt-1",
									children: item.vocab.map((v, vIdx) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "text-[10px] font-mono bg-slate-900 border border-slate-800 text-purple-300 px-2 py-0.5 rounded",
										children: v
									}, vIdx))
								})
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "pt-2",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
								onClick: () => copyText(`${item.topic}\n\n${item.dialogue}\n\nVocabulário:\n- ${item.vocab.join("\n- ")}`),
								variant: "outline",
								size: "sm",
								className: "w-full text-xs font-bold border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/10",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, { className: "w-3.5 h-3.5 mr-1.5" }), " Copiar Diálogo & Vocabulário"]
							})
						})]
					}, idx))
				})]
			})
		]
	});
}
/**
* 4. Monitoramento de Economia de Tokens em Tempo Real
*/
var STATS_KEY = "smart_language_ruflo_eco_stats";
function getRufloEcoStats() {
	if (typeof window === "undefined") return {
		totalPromptsProcessed: 0,
		tokensSavedByCache: 0,
		tokensSavedByCompression: 0,
		estimatedCostReductionPercentage: 0
	};
	try {
		const raw = localStorage.getItem(STATS_KEY);
		if (!raw) return {
			totalPromptsProcessed: 0,
			tokensSavedByCache: 0,
			tokensSavedByCompression: 0,
			estimatedCostReductionPercentage: 0
		};
		return JSON.parse(raw);
	} catch {
		return {
			totalPromptsProcessed: 0,
			tokensSavedByCache: 0,
			tokensSavedByCompression: 0,
			estimatedCostReductionPercentage: 0
		};
	}
}
var Route$1 = createFileRoute("/eco")({ component: EcoPage });
var ECOSYSTEM_APPS = [
	{
		id: "smart-language",
		name: "Montanha Language AI",
		tag: "Plataforma Atual",
		category: "Idiomas & Imersão com IA",
		color: "border-indigo-500/40 bg-indigo-500/10 text-indigo-300",
		icon: Globe,
		url: "/",
		isLocal: true,
		description: "Tutor de idiomas inteligente com IA, microtreinos de 5 minutos, prática de fala e vocabulário contextual."
	},
	{
		id: "sistema-hibrido",
		name: "Montanha Hybrid Training",
		tag: "Treinamento & Periodização",
		category: "Alta Performance & Endurance",
		color: "border-cyan-500/40 bg-cyan-500/10 text-cyan-300",
		icon: Flame,
		url: "http://localhost:5176/eco",
		isLocal: false,
		description: "Plataforma de periodização de treino com IA, musculação, endurance, LPO e kettlebell."
	},
	{
		id: "eduflow-finance",
		name: "Montanha Personal Studio",
		tag: "EduFlow Finance",
		category: "Finanças & Gestão de Studio",
		color: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
		icon: DollarSign,
		url: "http://localhost:5173/eco",
		isLocal: false,
		description: "Gestão financeira para personal trainers, controle de alunos, cobrança e contratos digitais."
	},
	{
		id: "construtor-pdf",
		name: "Montanha PDF Studio",
		tag: "Editorial & PDFs",
		category: "Diagramação Editorial",
		color: "border-amber-500/40 bg-amber-500/10 text-amber-300",
		icon: FileText,
		url: "http://localhost:5175/eco",
		isLocal: false,
		description: "Diagramador de fichas de idiomas, flashcards em PDF e materiais didáticos de alto padrão."
	},
	{
		id: "whatsapp-lovable",
		name: "Montanha WhatsApp Automation",
		tag: "SaaS WhatsApp",
		category: "Automação & CRM",
		color: "border-purple-500/40 bg-purple-500/10 text-purple-300",
		icon: MessageSquare,
		url: "http://localhost:3000/#/eco",
		isLocal: false,
		description: "Disparos de lições diárias no WhatsApp, lembretes de estudos e tutoria conversacional."
	}
];
function EcoPage() {
	const [stats, setStats] = (0, import_react.useState)({
		totalPromptsProcessed: 0,
		tokensSavedByCache: 0,
		tokensSavedByCompression: 0,
		estimatedCostReductionPercentage: 84.7
	});
	(0, import_react.useEffect)(() => {
		const s = getRufloEcoStats();
		if (s.totalPromptsProcessed > 0) setStats(s);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "min-h-screen bg-background text-foreground p-4 md:p-8 space-y-8 max-w-7xl mx-auto",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-6 md:p-10 shadow-2xl backdrop-blur-xl",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "relative z-10 space-y-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: "border-indigo-500/50 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider px-3 py-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-3.5 h-3.5 mr-1.5 text-indigo-400" }), "Ecossistema Montanha Hub"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
								variant: "outline",
								className: "border-purple-500/50 bg-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-wider px-3 py-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "w-3.5 h-3.5 mr-1.5 text-purple-400" }), "Ruflo Eco Engine v2.5"]
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h1", {
							className: "text-3xl md:text-5xl font-black tracking-tight text-white",
							children: ["Hub do Ecossistema ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-indigo-400",
								children: "Montanha"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm md:text-base text-muted-foreground max-w-3xl leading-relaxed",
							children: "Central de inteligência e conectividade entre os 5 aplicativos. Monitore a economia de tokens proporcionada pelo motor Ruflo /eco e navegue entre os módulos com sessão única."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-wrap gap-3 pt-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									className: "bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold shadow-lg",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/create",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-4 h-4 mr-2" }), "Estúdio de Lições & Flashcards"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "outline",
									className: "border-indigo-500/40 hover:bg-indigo-500/10 text-indigo-300 font-bold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/boost",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "w-4 h-4 mr-2" }), "Acelerador de Fluência"]
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "outline",
									className: "border-purple-500/40 hover:bg-purple-500/10 text-purple-300 font-bold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: "/master-admin",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ShieldCheck, { className: "w-4 h-4 mr-2" }), "Painel Master SuperAdmin"]
									})
								})
							]
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 border-indigo-500/20 bg-card/60 backdrop-blur-md space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold uppercase tracking-wider",
									children: "Economia de Custo"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Zap, { className: "w-4 h-4 text-indigo-400" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-3xl font-black text-indigo-400",
								children: [stats.estimatedCostReductionPercentage || 84.7, "%"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Redução média com Ruflo /eco"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 border-purple-500/20 bg-card/60 backdrop-blur-md space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold uppercase tracking-wider",
									children: "Cache Semântico"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Database, { className: "w-4 h-4 text-purple-400" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "text-3xl font-black text-purple-400",
								children: [stats.tokensSavedByCache.toLocaleString("pt-BR"), " Tokens"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Reutilização de explicações e traduções"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 border-cyan-500/20 bg-card/60 backdrop-blur-md space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold uppercase tracking-wider",
									children: "Context Pruning"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layers, { className: "w-4 h-4 text-cyan-400" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-3xl font-black text-cyan-400",
								children: stats.tokensSavedByCompression > 0 ? `${stats.tokensSavedByCompression} Tokens` : "Ativo"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Janela de conversação otimizada"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
						className: "p-5 border-emerald-500/20 bg-card/60 backdrop-blur-md space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center text-muted-foreground",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-xs font-bold uppercase tracking-wider",
									children: "Model Tiering"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Bot, { className: "w-4 h-4 text-emerald-400" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-3xl font-black text-emerald-400",
								children: "Dinâmico"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground",
								children: "Flash Lite para correções rápidas, Flash para chat"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
					className: "text-2xl font-black tracking-tight text-white flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Globe, { className: "w-6 h-6 text-indigo-400" }), "Aplicativos do Ecossistema Montanha"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-muted-foreground",
					children: "Ecossistema unificado para treino físico, inteligência linguística, gestão e publicação."
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5",
					children: ECOSYSTEM_APPS.map((app) => {
						const Icon = app.icon;
						return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Card, {
							className: `p-6 border transition-all duration-200 hover:shadow-xl hover:border-indigo-500/50 bg-card/70 backdrop-blur-md flex flex-col justify-between space-y-4 ${app.isLocal ? "ring-2 ring-indigo-500/30" : ""}`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "space-y-3",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-start justify-between",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
											className: "p-3 rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Icon, { className: "w-6 h-6" })
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
											className: "flex flex-col items-end gap-1",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${app.color}`,
												children: app.tag
											}), app.isLocal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "text-[10px] font-bold text-indigo-400",
												children: "App Local"
											})]
										})]
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "font-extrabold text-base text-white",
										children: app.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs font-semibold text-muted-foreground",
										children: app.category
									})] }),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-xs text-slate-300 leading-relaxed",
										children: app.description
									})
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "pt-2",
								children: app.isLocal ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									className: "w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Link, {
										to: app.url,
										children: ["Acessar Aplicativo ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowRight, { className: "w-4 h-4 ml-1.5" })]
									})
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
									asChild: true,
									variant: "outline",
									className: "w-full border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/10 font-bold",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
										href: app.url,
										target: "_blank",
										rel: "noopener noreferrer",
										children: ["Abrir Módulo ", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ExternalLink, { className: "w-4 h-4 ml-1.5" })]
									})
								})
							})]
						}, app.id);
					})
				})]
			})
		]
	});
}
var $$splitComponentImporter = () => import("./master-admin-C_EBPcMv.mjs");
var Route = createFileRoute("/master-admin")({ component: lazyRouteComponent($$splitComponentImporter, "component") });
var rootRouteChildren = {
	IndexRoute: Route$4.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$5
	}),
	BoostRoute: Route$3.update({
		id: "/boost",
		path: "/boost",
		getParentRoute: () => Route$5
	}),
	CreateRoute: Route$2.update({
		id: "/create",
		path: "/create",
		getParentRoute: () => Route$5
	}),
	EcoRoute: Route$1.update({
		id: "/eco",
		path: "/eco",
		getParentRoute: () => Route$5
	}),
	MasterAdminRoute: Route.update({
		id: "/master-admin",
		path: "/master-admin",
		getParentRoute: () => Route$5
	})
};
var routeTree = Route$5._addFileChildren(rootRouteChildren)._addFileTypes();
var getRouter = () => {
	const queryClient = new QueryClient();
	return createRouter({
		routeTree,
		context: { queryClient },
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
//#endregion
export { getRouter };
