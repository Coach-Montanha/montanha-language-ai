import { r as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { E as Sparkles, L as RefreshCw, P as Search, St as CircleX, X as Lock, Z as LockOpen, f as TriangleAlert, m as Trash2, o as Users, wt as CircleCheck, z as Plus } from "../_libs/lucide-react.mjs";
import { t as createClient } from "../_libs/supabase__supabase-js.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/master-admin-C_EBPcMv.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var DISPOSABLE_EMAIL_DOMAINS = /* @__PURE__ */ new Set([
	"mailinator.com",
	"tempmail.com",
	"10minutemail.com",
	"guerrillamail.com",
	"throwawaymail.com",
	"yopmail.com",
	"trashmail.com",
	"sharklasers.com",
	"getairmail.com",
	"dispostable.com",
	"disposable.com",
	"temp-mail.org",
	"fakeinbox.com",
	"maildrop.cc",
	"nada.ltd",
	"crazymailing.com",
	"tmail.ws",
	"boun.cr",
	"disposablemail.com",
	"mailcatch.com",
	"inboxalias.com"
]);
function getSupabaseClient() {
	try {
		const env = typeof import.meta !== "undefined" && {
			"BASE_URL": "/",
			"DEV": false,
			"MODE": "production",
			"PROD": true,
			"SSR": true,
			"TSS_DEV_SERVER": "false",
			"TSS_DEV_SSR_STYLES_BASEPATH": "/",
			"TSS_DEV_SSR_STYLES_ENABLED": "true",
			"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
			"TSS_INLINE_CSS_ENABLED": "false",
			"TSS_ROUTER_BASEPATH": "",
			"TSS_SERVER_FN_BASE": "/_serverFn/"
		} ? {
			"BASE_URL": "/",
			"DEV": false,
			"MODE": "production",
			"PROD": true,
			"SSR": true,
			"TSS_DEV_SERVER": "false",
			"TSS_DEV_SSR_STYLES_BASEPATH": "/",
			"TSS_DEV_SSR_STYLES_ENABLED": "true",
			"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
			"TSS_INLINE_CSS_ENABLED": "false",
			"TSS_ROUTER_BASEPATH": "",
			"TSS_SERVER_FN_BASE": "/_serverFn/"
		} : {};
		const procEnv = typeof process !== "undefined" && process.env ? process.env : {};
		const url = env["VITE_SUPABASE_URL"] || procEnv["SUPABASE_URL"] || "";
		const key = env["VITE_SUPABASE_ANON_KEY"] || env["VITE_SUPABASE_PUBLISHABLE_KEY"] || procEnv["SUPABASE_ANON_KEY"] || procEnv["SUPABASE_PUBLISHABLE_KEY"] || "";
		if (url && key) return createClient(url, key);
	} catch (err) {
		console.warn("[EcosystemAuth] Error initializing Supabase client:", err);
	}
	return null;
}
/**
* 1. validateEmailMx(email: string)
* Validação de sintaxe e servidores MX (rejeitando domínios de e-mails descartáveis).
*/
async function validateEmailMx(email) {
	if (!email || typeof email !== "string") return {
		valid: false,
		reason: "E-mail não fornecido."
	};
	const cleanEmail = email.trim().toLowerCase();
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return {
		valid: false,
		reason: "Formato de e-mail inválido."
	};
	const parts = cleanEmail.split("@");
	if (parts.length !== 2) return {
		valid: false,
		reason: "Formato de e-mail inválido."
	};
	const domain = parts[1];
	if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) return {
		valid: false,
		reason: `O domínio "${domain}" é um serviço de e-mail descartável não permitido.`
	};
	try {
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 3e3);
		const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`, {
			headers: { Accept: "application/dns-json" },
			signal: controller.signal
		});
		clearTimeout(timeoutId);
		if (response.ok) {
			const data = await response.json();
			if (data.Status === 3) return {
				valid: false,
				reason: `O domínio "${domain}" não existe (servidor de e-mail não encontrado).`
			};
			if (data.Status === 0 && (!data.Answer || data.Answer.length === 0)) return {
				valid: false,
				reason: `O domínio "${domain}" não possui registros MX válidos para receber e-mails.`
			};
		}
	} catch (err) {
		console.warn("[EcosystemAuth] DNS MX lookup bypassed:", err);
	}
	return { valid: true };
}
var APP_NAMES_MAP = {
	"smart-language": {
		name: "Montanha Language AI",
		url: "http://localhost:5173"
	},
	"eduflow-finance": {
		name: "Montanha Personal Studio",
		url: "http://localhost:5174"
	},
	"construtor-pdf": {
		name: "Montanha PDF Studio",
		url: "http://localhost:5175"
	},
	"sistema-hibrido": {
		name: "Montanha Hybrid Training",
		url: "http://localhost:5176"
	},
	"whatsapp-lovable": {
		name: "Montanha WhatsApp Automation",
		url: "http://localhost:5177"
	},
	"all": {
		name: "Ecossistema Montanha (5 Apps)",
		url: "http://localhost:5173"
	}
};
function generateTempPassword() {
	const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
	let code = "";
	for (let i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * 32));
	return `MTN-${code}`;
}
async function generateTempAccessInvite(clientName, email, phone, projectId, durationDays) {
	const tempPassword = generateTempPassword();
	const cleanEmail = email.trim().toLowerCase();
	const cleanPhone = phone.replace(/\D/g, "");
	let expiresAt = null;
	let validityLabel = "";
	if (durationDays === "vitalicio") {
		const d = /* @__PURE__ */ new Date();
		d.setFullYear(d.getFullYear() + 10);
		expiresAt = d.toISOString();
		validityLabel = "Vitalício (Sem Expiração)";
	} else {
		const days = Number(durationDays) || 30;
		expiresAt = new Date(Date.now() + days * 24 * 3600 * 1e3).toISOString();
		validityLabel = `${days} dias`;
	}
	const appInfo = APP_NAMES_MAP[projectId] || {
		name: projectId,
		url: typeof window !== "undefined" ? window.location.origin : ""
	};
	const expiresFormatted = expiresAt ? expiresAt.split("T")[0] : "Indefinido";
	const inviteText = `Olá, ${clientName}! 🎟️\n\nSeu acesso ao *${appInfo.name}* (Ecossistema Montanha) foi gerado com sucesso!\n\n🔑 *Login:* ${cleanEmail}\n🔒 *Senha Temporária:* ${tempPassword}\n⏳ *Validade:* ${validityLabel} (Até ${expiresFormatted})\n🌐 *Link de Acesso:* ${appInfo.url}\n\nBons treinos e excelentes resultados! 🚀`;
	const whatsappUrl = `https://wa.me/${cleanPhone.startsWith("55") ? cleanPhone : "55" + cleanPhone}?text=${encodeURIComponent(inviteText)}`;
	const projectsToGrant = projectId === "all" ? [
		"smart-language",
		"eduflow-finance",
		"construtor-pdf",
		"sistema-hibrido",
		"whatsapp-lovable"
	] : [projectId];
	const supabase = getSupabaseClient();
	const updatedSubs = [];
	for (const pid of projectsToGrant) {
		const sub = {
			id: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
			email: cleanEmail,
			project_id: pid,
			payment_status: "PAGO",
			access_expires_at: expiresAt,
			is_active: true,
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		};
		updatedSubs.push(sub);
		if (typeof window !== "undefined") localStorage.setItem(`ecosystem_sub_${pid}_${cleanEmail}`, JSON.stringify(sub));
	}
	if (typeof window !== "undefined") {
		const existingRaw = localStorage.getItem("master_admin_subscriptions");
		let existing = [];
		if (existingRaw) try {
			existing = JSON.parse(existingRaw);
		} catch (e) {}
		const combined = [...updatedSubs, ...existing];
		localStorage.setItem("master_admin_subscriptions", JSON.stringify(combined));
	}
	if (supabase) try {
		await supabase.from("ecosystem_subscriptions").upsert(updatedSubs);
	} catch (err) {
		console.warn("[EcosystemAuth] Supabase sync for invite failed:", err);
	}
	return {
		success: true,
		tempPassword,
		expiresAt,
		validityLabel,
		whatsappUrl,
		inviteText,
		message: "Convite e senha temporária gerados com sucesso!"
	};
}
var ECOSYSTEM_APPS = [
	{
		id: "smart-language",
		name: "Smart Language",
		badge: "Idiomas IA",
		color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
	},
	{
		id: "eduflow-finance",
		name: "EduFlow Finance",
		badge: "Finanças Studio",
		color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
	},
	{
		id: "construtor-pdf",
		name: "Construtor de PDFs do Montanha",
		badge: "PDF & Editorial",
		color: "bg-amber-500/20 text-amber-300 border-amber-500/40"
	},
	{
		id: "sistema-hibrido",
		name: "Sistema Híbrido de Treinamento",
		badge: "Treinamento",
		color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
	},
	{
		id: "whatsapp-lovable",
		name: "Montanha WhatsApp Automation",
		badge: "SaaS WhatsApp",
		color: "bg-purple-500/20 text-purple-300 border-purple-500/40"
	}
];
var MasterAdminDashboard = () => {
	const [selectedProjectId, setSelectedProjectId] = (0, import_react.useState)("all");
	const [searchTerm, setSearchTerm] = (0, import_react.useState)("");
	const [subscriptions, setSubscriptions] = (0, import_react.useState)([]);
	const [loading, setLoading] = (0, import_react.useState)(true);
	const [showAddModal, setShowAddModal] = (0, import_react.useState)(false);
	const [notification, setNotification] = (0, import_react.useState)(null);
	const [newEmail, setNewEmail] = (0, import_react.useState)("");
	const [newProjectId, setNewProjectId] = (0, import_react.useState)("smart-language");
	const [newPaymentStatus, setNewPaymentStatus] = (0, import_react.useState)("PAGO");
	const [newExpiresAt, setNewExpiresAt] = (0, import_react.useState)("");
	const [inviteClientName, setInviteClientName] = (0, import_react.useState)("");
	const [inviteEmail, setInviteEmail] = (0, import_react.useState)("");
	const [invitePhone, setInvitePhone] = (0, import_react.useState)("");
	const [inviteProjectId, setInviteProjectId] = (0, import_react.useState)("all");
	const [inviteDuration, setInviteDuration] = (0, import_react.useState)("30");
	const [generatedInvite, setGeneratedInvite] = (0, import_react.useState)(null);
	const handleGenerateInvite = async (e) => {
		e.preventDefault();
		if (!inviteClientName || !inviteEmail || !invitePhone) {
			notify("error", "Preencha todos os campos do convite.");
			return;
		}
		const duration = inviteDuration === "vitalicio" ? "vitalicio" : Number(inviteDuration);
		const res = await generateTempAccessInvite(inviteClientName, inviteEmail, invitePhone, inviteProjectId, duration);
		if (res.success) {
			setGeneratedInvite(res);
			notify("success", `Senha temporária ${res.tempPassword} gerada com sucesso!`);
			fetchSubscriptions();
		}
	};
	const MOCK_SUBSCRIPTIONS = [
		{
			id: "sub_1",
			email: "cliente.pro@montanha.app",
			project_id: "smart-language",
			payment_status: "PAGO",
			access_expires_at: new Date(Date.now() + 31536e6).toISOString(),
			is_active: true,
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		},
		{
			id: "sub_2",
			email: "studio.fit@eduflow.com",
			project_id: "eduflow-finance",
			payment_status: "PAGO",
			access_expires_at: new Date(Date.now() + 7776e6).toISOString(),
			is_active: true,
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		},
		{
			id: "sub_3",
			email: "editor.pdf@montanha.com",
			project_id: "construtor-pdf",
			payment_status: "PENDENTE",
			access_expires_at: new Date(Date.now() + 6048e5).toISOString(),
			is_active: true,
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		},
		{
			id: "sub_4",
			email: "coach.treino@hibrido.com",
			project_id: "sistema-hibrido",
			payment_status: "INADIMPLENTE",
			access_expires_at: (/* @__PURE__ */ new Date(Date.now() - 432e6)).toISOString(),
			is_active: false,
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		},
		{
			id: "sub_5",
			email: "marketing.wa@lovable.app",
			project_id: "whatsapp-lovable",
			payment_status: "PAGO",
			access_expires_at: new Date(Date.now() + 15552e6).toISOString(),
			is_active: true,
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		}
	];
	const fetchSubscriptions = async () => {
		setLoading(true);
		let loaded = [];
		try {
			const env = typeof import.meta !== "undefined" && {
				"BASE_URL": "/",
				"DEV": false,
				"MODE": "production",
				"PROD": true,
				"SSR": true,
				"TSS_DEV_SERVER": "false",
				"TSS_DEV_SSR_STYLES_BASEPATH": "/",
				"TSS_DEV_SSR_STYLES_ENABLED": "true",
				"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
				"TSS_INLINE_CSS_ENABLED": "false",
				"TSS_ROUTER_BASEPATH": "",
				"TSS_SERVER_FN_BASE": "/_serverFn/"
			} ? {
				"BASE_URL": "/",
				"DEV": false,
				"MODE": "production",
				"PROD": true,
				"SSR": true,
				"TSS_DEV_SERVER": "false",
				"TSS_DEV_SSR_STYLES_BASEPATH": "/",
				"TSS_DEV_SSR_STYLES_ENABLED": "true",
				"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
				"TSS_INLINE_CSS_ENABLED": "false",
				"TSS_ROUTER_BASEPATH": "",
				"TSS_SERVER_FN_BASE": "/_serverFn/"
			} : {};
			const procEnv = typeof process !== "undefined" && process.env ? process.env : {};
			const url = env["VITE_SUPABASE_URL"] || procEnv["SUPABASE_URL"];
			const key = env["VITE_SUPABASE_ANON_KEY"] || env["VITE_SUPABASE_PUBLISHABLE_KEY"] || procEnv["SUPABASE_ANON_KEY"] || procEnv["SUPABASE_PUBLISHABLE_KEY"];
			if (url && key) {
				const { data, error } = await createClient(url, key).from("ecosystem_subscriptions").select("*").order("created_at", { ascending: false });
				if (!error && data && data.length > 0) loaded = data;
			}
		} catch (err) {
			console.warn("[MasterAdmin] Could not fetch from Supabase:", err);
		}
		if (loaded.length === 0) {
			const saved = localStorage.getItem("master_admin_subscriptions");
			if (saved) try {
				loaded = JSON.parse(saved);
			} catch (e) {}
			else {
				loaded = MOCK_SUBSCRIPTIONS;
				localStorage.setItem("master_admin_subscriptions", JSON.stringify(MOCK_SUBSCRIPTIONS));
			}
		}
		setSubscriptions(loaded);
		setLoading(false);
	};
	(0, import_react.useEffect)(() => {
		fetchSubscriptions();
	}, []);
	const saveSubscriptions = async (updated) => {
		setSubscriptions(updated);
		if (typeof window !== "undefined") localStorage.setItem("master_admin_subscriptions", JSON.stringify(updated));
		try {
			const env = typeof import.meta !== "undefined" && {
				"BASE_URL": "/",
				"DEV": false,
				"MODE": "production",
				"PROD": true,
				"SSR": true,
				"TSS_DEV_SERVER": "false",
				"TSS_DEV_SSR_STYLES_BASEPATH": "/",
				"TSS_DEV_SSR_STYLES_ENABLED": "true",
				"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
				"TSS_INLINE_CSS_ENABLED": "false",
				"TSS_ROUTER_BASEPATH": "",
				"TSS_SERVER_FN_BASE": "/_serverFn/"
			} ? {
				"BASE_URL": "/",
				"DEV": false,
				"MODE": "production",
				"PROD": true,
				"SSR": true,
				"TSS_DEV_SERVER": "false",
				"TSS_DEV_SSR_STYLES_BASEPATH": "/",
				"TSS_DEV_SSR_STYLES_ENABLED": "true",
				"TSS_DISABLE_CSRF_MIDDLEWARE_WARNING": "false",
				"TSS_INLINE_CSS_ENABLED": "false",
				"TSS_ROUTER_BASEPATH": "",
				"TSS_SERVER_FN_BASE": "/_serverFn/"
			} : {};
			const procEnv = typeof process !== "undefined" && process.env ? process.env : {};
			const url = env["VITE_SUPABASE_URL"] || procEnv["SUPABASE_URL"];
			const key = env["VITE_SUPABASE_ANON_KEY"] || env["VITE_SUPABASE_PUBLISHABLE_KEY"] || procEnv["SUPABASE_ANON_KEY"] || procEnv["SUPABASE_PUBLISHABLE_KEY"];
			if (url && key) await createClient(url, key).from("ecosystem_subscriptions").upsert(updated);
		} catch (err) {
			console.warn("[MasterAdmin] Supabase sync failed:", err);
		}
	};
	const handleStatusChange = (id, newStatus) => {
		const updated = subscriptions.map((sub) => sub.id === id ? {
			...sub,
			payment_status: newStatus
		} : sub);
		saveSubscriptions(updated);
		notify("success", `Status de pagamento alterado para ${newStatus}`);
	};
	const handleExpirationChange = (id, newDateStr) => {
		const expiresAt = newDateStr ? new Date(newDateStr).toISOString() : null;
		const updated = subscriptions.map((sub) => sub.id === id ? {
			...sub,
			access_expires_at: expiresAt
		} : sub);
		saveSubscriptions(updated);
		notify("success", "Validade de acesso atualizada!");
	};
	const handleAddDays = (id, days) => {
		const target = subscriptions.find((s) => s.id === id);
		const currentBase = target?.access_expires_at ? new Date(target.access_expires_at).getTime() : Date.now();
		const newExpiresAt = new Date(Math.max(currentBase, Date.now()) + days * 24 * 3600 * 1e3).toISOString();
		const updated = subscriptions.map((sub) => sub.id === id ? {
			...sub,
			access_expires_at: newExpiresAt
		} : sub);
		saveSubscriptions(updated);
		notify("success", `Adicionados +${days} dias de acesso ao cliente.`);
	};
	const handleToggleActive = (id) => {
		const updated = subscriptions.map((sub) => {
			if (sub.id === id) {
				const newActive = !sub.is_active;
				notify("success", newActive ? "Chave de acesso ATIVADA para o app!" : "Chave de acesso REVOGADA!");
				return {
					...sub,
					is_active: newActive
				};
			}
			return sub;
		});
		saveSubscriptions(updated);
	};
	const handleDeleteSub = (id) => {
		if (confirm("Tem certeza que deseja remover esta assinatura do painel master?")) {
			const updated = subscriptions.filter((s) => s.id !== id);
			saveSubscriptions(updated);
			notify("success", "Assinatura removida do painel master.");
		}
	};
	const handleCreateSubscription = async (e) => {
		e.preventDefault();
		if (!newEmail) {
			notify("error", "Por favor, informe o e-mail do cliente.");
			return;
		}
		const mxValidation = await validateEmailMx(newEmail);
		if (!mxValidation.valid) {
			notify("error", mxValidation.reason || "Domínio ou e-mail inválido.");
			return;
		}
		const newSub = {
			id: `sub_${Date.now()}`,
			email: newEmail.trim().toLowerCase(),
			project_id: newProjectId,
			payment_status: newPaymentStatus,
			access_expires_at: newExpiresAt ? new Date(newExpiresAt).toISOString() : new Date(Date.now() + 2592e6).toISOString(),
			is_active: true,
			created_at: (/* @__PURE__ */ new Date()).toISOString()
		};
		const updated = [newSub, ...subscriptions];
		await saveSubscriptions(updated);
		setShowAddModal(false);
		setNewEmail("");
		notify("success", `Assinatura criada com sucesso para ${newSub.email}!`);
	};
	const notify = (type, message) => {
		setNotification({
			type,
			message
		});
		setTimeout(() => setNotification(null), 4e3);
	};
	const filteredSubscriptions = subscriptions.filter((sub) => {
		const matchesProject = selectedProjectId === "all" || sub.project_id === selectedProjectId;
		const matchesSearch = !searchTerm || sub.email.toLowerCase().includes(searchTerm.toLowerCase()) || sub.project_id.toLowerCase().includes(searchTerm.toLowerCase());
		return matchesProject && matchesSearch;
	});
	const totalClients = new Set(subscriptions.map((s) => s.email)).size;
	const activeSubs = subscriptions.filter((s) => s.payment_status === "PAGO" && s.is_active).length;
	const pendingSubs = subscriptions.filter((s) => s.payment_status === "PENDENTE").length;
	const defaultedSubs = subscriptions.filter((s) => s.payment_status === "INADIMPLENTE" || !s.is_active).length;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans",
		children: [
			notification && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl transition-all ${notification.type === "success" ? "bg-emerald-950/90 border-emerald-500/50 text-emerald-200" : "bg-red-950/90 border-red-500/50 text-red-200"}`,
				children: [notification.type === "success" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "w-5 h-5 text-emerald-400" }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "w-5 h-5 text-red-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-xs font-bold",
					children: notification.message
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-slate-950/80 border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.15)] backdrop-blur-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-1.5 z-10",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Sparkles, { className: "w-3 h-3 text-purple-400" }), " Painel Master SuperAdmin"]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full",
								children: "Ecossistema Montanha (5 Apps)"
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2",
							children: "Gestão Centralizada de Acessos & Licenças"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-slate-400 max-w-2xl",
							children: "Controle unificado de expiração de acessos, status financeiro (PAGO, PENDENTE, INADIMPLENTE), chave de ativação por aplicativo e trava anti-abuso."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-center gap-3 z-10",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						onClick: fetchSubscriptions,
						className: "p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-white transition cursor-pointer",
						title: "Atualizar Dados",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RefreshCw, { className: `w-4 h-4 ${loading ? "animate-spin text-purple-400" : ""}` })
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						onClick: () => setShowAddModal(true),
						className: "bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-4 h-4" }), " Nova Assinatura"]
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-slate-950/70 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center text-slate-400",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-extrabold uppercase tracking-wider",
									children: "Clientes Únicos"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "w-4 h-4 text-purple-400" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-3xl font-black text-white",
								children: totalClients
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-purple-300 font-medium",
								children: "Cadastrados no Ecossistema"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-slate-950/70 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center text-slate-400",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-extrabold uppercase tracking-wider",
									children: "Acessos Ativos & Pagos"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleCheck, { className: "w-4 h-4 text-emerald-400" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-3xl font-black text-emerald-400",
								children: activeSubs
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-emerald-300 font-medium",
								children: "Liberados nos 5 Aplicativos"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-slate-950/70 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center text-slate-400",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-extrabold uppercase tracking-wider",
									children: "Pendentes de Pagamento"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, { className: "w-4 h-4 text-amber-400" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-3xl font-black text-amber-400",
								children: pendingSubs
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-amber-300 font-medium",
								children: "Aguardando Confirmação"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "bg-slate-950/70 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md space-y-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex justify-between items-center text-slate-400",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-[11px] font-extrabold uppercase tracking-wider",
									children: "Inadimplentes / Revogados"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CircleX, { className: "w-4 h-4 text-red-400" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-3xl font-black text-red-400",
								children: defaultedSubs
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-red-300 font-medium",
								children: "Trava Anti-Abuso Ativa"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-slate-950/80 border border-purple-500/30 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex items-center justify-between border-b border-slate-800 pb-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] font-black uppercase tracking-wider bg-purple-500/20 text-purple-300 border border-purple-500/40 px-2.5 py-0.5 rounded-full",
								children: "🎟️ GERADOR DE CONVITES WHATSAPP"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "text-lg font-black text-white mt-1",
								children: "Gerador de Convites & Acesso Temporário"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-slate-400",
								children: "Gere senhas temporárias no formato MTN-XXXX e envie convites diretos via WhatsApp."
							})
						] })
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleGenerateInvite,
						className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block font-bold text-slate-300 mb-1 uppercase tracking-wider text-[10px]",
								children: "Nome do Cliente"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								required: true,
								placeholder: "Ex: João Silva",
								value: inviteClientName,
								onChange: (e) => setInviteClientName(e.target.value),
								className: "w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-purple-500"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block font-bold text-slate-300 mb-1 uppercase tracking-wider text-[10px]",
								children: "E-mail"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "email",
								required: true,
								placeholder: "cliente@exemplo.com",
								value: inviteEmail,
								onChange: (e) => setInviteEmail(e.target.value),
								className: "w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-purple-500"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block font-bold text-slate-300 mb-1 uppercase tracking-wider text-[10px]",
								children: "Telefone WhatsApp"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "text",
								required: true,
								placeholder: "Ex: 5511999999999",
								value: invitePhone,
								onChange: (e) => setInvitePhone(e.target.value),
								className: "w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-purple-500 font-mono"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block font-bold text-slate-300 mb-1 uppercase tracking-wider text-[10px]",
								children: "Aplicativo Liberado"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: inviteProjectId,
								onChange: (e) => setInviteProjectId(e.target.value),
								className: "w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-purple-500 font-bold",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: "all",
									children: "🌐 Todos os 5 Apps do Ecossistema"
								}), ECOSYSTEM_APPS.map((app) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
									value: app.id,
									children: app.name
								}, app.id))]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "sm:col-span-2 lg:col-span-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									className: "block font-bold text-slate-300 mb-1 uppercase tracking-wider text-[10px]",
									children: "Validade do Acesso"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
									value: inviteDuration,
									onChange: (e) => setInviteDuration(e.target.value),
									className: "w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-white outline-none focus:border-purple-500 font-bold",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "7",
											children: "7 dias (Trial / Degustação)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "30",
											children: "30 dias (Mensal)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "365",
											children: "365 dias (Anual)"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
											value: "vitalicio",
											children: "Vitalício (Sem limite)"
										})
									]
								})]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "sm:col-span-2 lg:col-span-2 flex items-end",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "w-full bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 text-white font-bold h-10 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer",
									children: "🎟️ Gerar Convite & Senha Temporária"
								})
							})
						]
					}),
					generatedInvite && /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-4 p-4 rounded-xl bg-purple-500/10 border border-purple-500/30 space-y-3 text-xs",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-purple-500/20 pb-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-[10px] text-purple-300 font-bold uppercase tracking-wider",
								children: "Senha Temporária Gerada:"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
								className: "text-2xl font-black font-mono text-cyan-300 tracking-widest",
								children: generatedInvite.tempPassword
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => window.open(generatedInvite.whatsappUrl, "_blank"),
								className: "bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-4 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer",
								children: "📱 Enviar Convite pelo WhatsApp"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1",
							children: "Prévia da Mensagem Formatada:"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
							className: "bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-200 text-xs whitespace-pre-wrap font-sans leading-relaxed",
							children: generatedInvite.inviteText
						})] })]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-1.5",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
							onClick: () => setSelectedProjectId("all"),
							className: `px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${selectedProjectId === "all" ? "bg-purple-600 text-white shadow-md" : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"}`,
							children: [
								"🌐 Todos os Apps (",
								subscriptions.length,
								")"
							]
						}), ECOSYSTEM_APPS.map((app) => {
							const count = subscriptions.filter((s) => s.project_id === app.id).length;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
								onClick: () => setSelectedProjectId(app.id),
								className: `px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${selectedProjectId === app.id ? "bg-purple-600 text-white shadow-md" : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"}`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: app.name }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "text-[10px] opacity-75",
									children: [
										"(",
										count,
										")"
									]
								})]
							}, app.id);
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative w-full md:w-64",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Search, { className: "w-4 h-4 absolute left-3 top-2.5 text-slate-400" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "text",
							placeholder: "Buscar por e-mail...",
							value: searchTerm,
							onChange: (e) => setSearchTerm(e.target.value),
							className: "w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-purple-500 font-medium"
						})]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
						className: "w-full text-left text-xs text-slate-200",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
							className: "bg-slate-900/90 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-800",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3.5",
									children: "Cliente (E-mail)"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3.5",
									children: "Aplicativo"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3.5",
									children: "Status de Pagamento"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3.5",
									children: "Validade do Acesso"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3.5 text-center",
									children: "Ativação / Revogação"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
									className: "p-3.5 text-right",
									children: "Ações"
								})
							] })
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", {
							className: "divide-y divide-slate-800/60 font-medium",
							children: filteredSubscriptions.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tr", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
								colSpan: 6,
								className: "p-6 text-center text-slate-400",
								children: "Nenhuma assinatura encontrada para os filtros selecionados."
							}) }) : filteredSubscriptions.map((sub) => {
								const appMeta = ECOSYSTEM_APPS.find((a) => a.id === sub.project_id) || {
									name: sub.project_id,
									badge: "App",
									color: "bg-slate-800 text-slate-300"
								};
								const expiresDateFormatted = sub.access_expires_at ? new Date(sub.access_expires_at).toISOString().split("T")[0] : "";
								const isExpired = sub.access_expires_at ? new Date(sub.access_expires_at) <= /* @__PURE__ */ new Date() : false;
								return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "hover:bg-slate-900/40 transition",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("td", {
											className: "p-3.5",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
												className: "font-bold text-white text-xs",
												children: sub.email
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "text-[10px] text-slate-400",
												children: ["ID: ", sub.id]
											})]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: `inline-block px-2.5 py-1 rounded-lg border text-[10px] font-bold ${appMeta.color}`,
												children: appMeta.name
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
												value: sub.payment_status,
												onChange: (e) => handleStatusChange(sub.id, e.target.value),
												className: `bg-slate-900 border rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer ${sub.payment_status === "PAGO" ? "border-emerald-500/50 text-emerald-400" : sub.payment_status === "PENDENTE" ? "border-amber-500/50 text-amber-400" : "border-red-500/50 text-red-400"}`,
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "PAGO",
														className: "bg-slate-900 text-emerald-400 font-bold",
														children: "🟢 PAGO"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "PENDENTE",
														className: "bg-slate-900 text-amber-400 font-bold",
														children: "🟡 PENDENTE"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "INADIMPLENTE",
														className: "bg-slate-900 text-red-400 font-bold",
														children: "🔴 INADIMPLENTE"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
														value: "CANCELADO",
														className: "bg-slate-900 text-slate-400 font-bold",
														children: "⚪ CANCELADO"
													})
												]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3.5",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "flex items-center gap-2",
												children: [
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
														type: "date",
														value: expiresDateFormatted,
														onChange: (e) => handleExpirationChange(sub.id, e.target.value),
														className: `bg-slate-900 border rounded-xl p-1.5 text-xs outline-none font-mono ${isExpired ? "border-red-500 text-red-400 font-bold" : "border-slate-800 text-slate-200"}`
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														onClick: () => handleAddDays(sub.id, 30),
														className: "bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] px-2 py-1 rounded-lg font-bold transition cursor-pointer",
														title: "Adicionar +30 dias de acesso",
														children: "+30d"
													}),
													/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
														onClick: () => handleAddDays(sub.id, 365),
														className: "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] px-2 py-1 rounded-lg font-bold transition cursor-pointer",
														title: "Adicionar +1 Ano de acesso",
														children: "+1 ano"
													})
												]
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3.5 text-center",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => handleToggleActive(sub.id),
												className: `px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${sub.is_active ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25" : "bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/25"}`,
												children: sub.is_active ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Lock, { className: "w-3.5 h-3.5 text-emerald-400" }), " ATIVO"] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LockOpen, { className: "w-3.5 h-3.5 text-red-400" }), " REVOGADO"] })
											})
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "p-3.5 text-right",
											children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												onClick: () => handleDeleteSub(sub.id),
												className: "p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer",
												title: "Remover Registro",
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "w-4 h-4" })
											})
										})
									]
								}, sub.id);
							})
						})]
					})
				})]
			}),
			showAddModal && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "bg-slate-950 border border-purple-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex justify-between items-center border-b border-slate-800 pb-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
							className: "font-extrabold text-base text-white flex items-center gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, { className: "w-5 h-5 text-purple-400" }), " Nova Assinatura do Ecossistema"]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							onClick: () => setShowAddModal(false),
							className: "text-slate-400 hover:text-white font-bold",
							children: "✕"
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						onSubmit: handleCreateSubscription,
						className: "space-y-4 text-xs",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block font-bold text-slate-300 mb-1",
								children: "E-mail Comercial do Cliente"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "email",
								required: true,
								placeholder: "cliente@exemplo.com",
								value: newEmail,
								onChange: (e) => setNewEmail(e.target.value),
								className: "w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 font-medium"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block font-bold text-slate-300 mb-1",
								children: "Aplicativo do Ecossistema"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
								value: newProjectId,
								onChange: (e) => setNewProjectId(e.target.value),
								className: "w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 font-bold",
								children: ECOSYSTEM_APPS.map((app) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
									value: app.id,
									children: [
										app.name,
										" (",
										app.badge,
										")"
									]
								}, app.id))
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block font-bold text-slate-300 mb-1",
								children: "Status de Pagamento"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("select", {
								value: newPaymentStatus,
								onChange: (e) => setNewPaymentStatus(e.target.value),
								className: "w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 font-bold",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "PAGO",
										children: "🟢 PAGO"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "PENDENTE",
										children: "🟡 PENDENTE"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "INADIMPLENTE",
										children: "🔴 INADIMPLENTE"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
										value: "CANCELADO",
										children: "⚪ CANCELADO"
									})
								]
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
								className: "block font-bold text-slate-300 mb-1",
								children: "Validade do Acesso (Expiração)"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								type: "date",
								value: newExpiresAt,
								onChange: (e) => setNewExpiresAt(e.target.value),
								className: "w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 font-mono"
							})] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "pt-2 flex gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setShowAddModal(false),
									className: "flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-xl transition cursor-pointer",
									children: "Cancelar"
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "submit",
									className: "flex-1 bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 text-white font-bold py-3 rounded-xl shadow-lg transition cursor-pointer",
									children: "Salvar Assinatura"
								})]
							})
						]
					})]
				})
			})
		]
	});
};
var SplitComponent = MasterAdminDashboard;
//#endregion
export { SplitComponent as component };
