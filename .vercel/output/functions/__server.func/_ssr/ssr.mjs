import fs from "node:fs";
import path from "node:path";
//#region node_modules/.nitro/vite/services/ssr/index.js
var lastCapturedError;
var TTL_MS = 5e3;
function record(error) {
	lastCapturedError = {
		error,
		at: Date.now()
	};
}
var CAUSE_DEPTH_LIMIT = 5;
var DESCRIPTION_LENGTH_LIMIT = 8e3;
function describeError(error) {
	const parts = [];
	let current = error;
	for (let depth = 0; depth < CAUSE_DEPTH_LIMIT && current != null; depth++) {
		if (!(current instanceof Error)) {
			parts.push(typeof current === "string" ? current : safeStringify(current));
			break;
		}
		const label = depth === 0 ? "" : "caused by: ";
		const status = describeStatus(current);
		parts.push(`${label}${current.stack ?? `${current.name}: ${current.message}`}${status}`);
		current = current.cause;
	}
	return parts.join("\n").slice(0, DESCRIPTION_LENGTH_LIMIT);
}
function describeStatus(error) {
	const { status, statusCode } = error;
	const value = status ?? statusCode;
	return typeof value === "number" ? ` (status ${value})` : "";
}
function safeStringify(value) {
	try {
		return JSON.stringify(value) ?? String(value);
	} catch {
		return String(value);
	}
}
function isErrorLike(value) {
	return value instanceof Error;
}
var originalConsoleError = console.error.bind(console);
console.error = (...args) => {
	originalConsoleError(...args.map((arg) => {
		if (!isErrorLike(arg)) return arg;
		record(arg);
		return describeError(arg);
	}));
};
if (typeof globalThis.addEventListener === "function") {
	globalThis.addEventListener("error", (event) => record(event.error ?? event));
	globalThis.addEventListener("unhandledrejection", (event) => record(event.reason));
}
function consumeLastCapturedError() {
	if (!lastCapturedError) return void 0;
	if (Date.now() - lastCapturedError.at > TTL_MS) {
		lastCapturedError = void 0;
		return;
	}
	const { error } = lastCapturedError;
	lastCapturedError = void 0;
	return error;
}
function renderErrorPage() {
	return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>This page didn't load</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font: 15px/1.5 system-ui, -apple-system, sans-serif; background: #fafafa; color: #111; display: grid; place-items: center; min-height: 100vh; margin: 0; padding: 1.5rem; }
      .card { max-width: 28rem; width: 100%; text-align: center; padding: 2rem; }
      h1 { font-size: 1.25rem; margin: 0 0 0.5rem; }
      p { color: #4b5563; margin: 0 0 1.5rem; }
      .actions { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; }
      a, button { padding: 0.5rem 1rem; border-radius: 0.375rem; font: inherit; cursor: pointer; text-decoration: none; border: 1px solid transparent; }
      .primary { background: #111; color: #fff; }
      .secondary { background: #fff; color: #111; border-color: #d1d5db; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>This page didn't load</h1>
      <p>Something went wrong on our end. You can try refreshing or head back home.</p>
      <div class="actions">
        <button class="primary" onclick="location.reload()">Try again</button>
        <a class="secondary" href="/">Go home</a>
      </div>
    </div>
  </body>
</html>`;
}
var CLOUD_STORAGE_URL = "https://api.restful-api.dev/objects/ff808181a058d43f01a061b390911c5e";
var DATA_DIR = path.resolve(process.cwd(), "data");
var USERS_FILE_PATH = path.resolve(DATA_DIR, "users.json");
var memoryCache = { users: { aluno: {
	username: "aluno",
	displayName: "Aluno Demonstração",
	pin: "1234",
	createdAt: "2026-09-01T20:00:00.000Z",
	updatedAt: "2026-09-01T20:00:00.000Z",
	progress: {
		streakDays: 1,
		lastActiveDate: "2026-09-01",
		xp: 120,
		cardsMasteredCount: 3,
		phrasesAnalyzedCount: 2,
		messagesSentCount: 5,
		dailySprintDone: false,
		audioSpeed: 1,
		currentWeek: 1,
		completedMissionIds: ["w1-coffee"]
	},
	chatHistory: [],
	customCards: []
} } };
async function syncToCloud(db) {
	try {
		await fetch(CLOUD_STORAGE_URL, {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				name: "smart_language_users_master_db",
				data: db
			})
		});
	} catch (err) {
		console.warn("Aviso: Falha ao sincronizar com nuvem universal:", err);
	}
}
async function fetchFromCloud() {
	try {
		const res = await fetch(CLOUD_STORAGE_URL, { headers: { Accept: "application/json" } });
		if (!res.ok) return null;
		const json = await res.json();
		if (json && json.data && json.data.users) return json.data;
	} catch (err) {
		console.warn("Aviso: Falha ao buscar da nuvem universal:", err);
	}
	return null;
}
function ensureDatabaseFile() {
	try {
		if (typeof fs !== "undefined" && fs.existsSync && fs.readFileSync) {
			if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
			if (fs.existsSync(USERS_FILE_PATH)) {
				const content = fs.readFileSync(USERS_FILE_PATH, "utf-8");
				const parsed = JSON.parse(content);
				if (parsed && parsed.users) memoryCache = parsed;
			} else fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(memoryCache, null, 2), "utf-8");
		}
	} catch (error) {
		console.warn("Aviso: Sistema de arquivos não disponível (ambiente edge/serverless), usando memória/nuvem:", error);
	}
	return memoryCache;
}
function saveDatabaseFile(db) {
	memoryCache = db;
	try {
		if (typeof fs !== "undefined" && fs.existsSync && fs.writeFileSync) {
			if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
			fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
		}
	} catch (error) {
		console.warn("Aviso: Não foi possível gravar em disco no ambiente edge:", error);
	}
	syncToCloud(db);
}
async function registerUser(usernameRaw, pin, displayNameRaw) {
	const username = usernameRaw.trim().toLowerCase();
	const displayName = (displayNameRaw || usernameRaw).trim();
	if (!username) return {
		success: false,
		error: "Nome de usuário é obrigatório."
	};
	if (!/^\d{4}$/.test(pin)) return {
		success: false,
		error: "A senha deve conter exatamente 4 números (ex: 1234)."
	};
	const db = await fetchFromCloud() || ensureDatabaseFile();
	if (db.users[username]) return {
		success: false,
		error: "Este usuário já está cadastrado. Escolha outro ou faça login."
	};
	const now = (/* @__PURE__ */ new Date()).toISOString();
	const newUser = {
		username,
		displayName: displayName || username,
		pin,
		createdAt: now,
		updatedAt: now,
		progress: {
			streakDays: 1,
			lastActiveDate: now.split("T")[0],
			xp: 50,
			cardsMasteredCount: 0,
			phrasesAnalyzedCount: 0,
			messagesSentCount: 0,
			dailySprintDone: false,
			audioSpeed: 1,
			currentWeek: 1,
			completedMissionIds: []
		},
		chatHistory: [],
		customCards: []
	};
	db.users[username] = newUser;
	saveDatabaseFile(db);
	await syncToCloud(db);
	return {
		success: true,
		user: newUser
	};
}
async function loginUser(usernameRaw, pin) {
	const username = usernameRaw.trim().toLowerCase();
	if (!username) return {
		success: false,
		error: "Informe o nome de usuário."
	};
	if (!/^\d{4}$/.test(pin)) return {
		success: false,
		error: "A senha deve conter exatamente 4 números."
	};
	let db = ensureDatabaseFile();
	let user = db.users[username];
	if (!user) {
		const cloudDb = await fetchFromCloud();
		if (cloudDb && cloudDb.users) {
			db.users = {
				...db.users,
				...cloudDb.users
			};
			user = db.users[username];
			saveDatabaseFile(db);
		}
	}
	if (!user) return {
		success: false,
		error: "Usuário não encontrado. Crie uma conta primeiro."
	};
	if (user.pin !== pin) return {
		success: false,
		error: "Senha incorreta. A senha é um PIN de 4 números."
	};
	return {
		success: true,
		user
	};
}
async function resetUserPin(usernameRaw, newPin) {
	const username = usernameRaw.trim().toLowerCase();
	if (!username) return {
		success: false,
		error: "Informe o nome de usuário para redefinir a senha."
	};
	if (!/^\d{4}$/.test(newPin)) return {
		success: false,
		error: "A nova senha deve conter exatamente 4 números (ex: 5678)."
	};
	let db = ensureDatabaseFile();
	let user = db.users[username];
	if (!user) {
		const cloudDb = await fetchFromCloud();
		if (cloudDb && cloudDb.users) {
			db.users = {
				...db.users,
				...cloudDb.users
			};
			user = db.users[username];
		}
	}
	if (!user) return {
		success: false,
		error: "Usuário não encontrado para redefinir."
	};
	user.pin = newPin;
	user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
	saveDatabaseFile(db);
	await syncToCloud(db);
	return { success: true };
}
async function saveUserDataOnServer(usernameRaw, payload) {
	const username = usernameRaw.trim().toLowerCase();
	let db = ensureDatabaseFile();
	let user = db.users[username];
	if (!user) {
		const cloudDb = await fetchFromCloud();
		if (cloudDb && cloudDb.users) {
			db.users = {
				...db.users,
				...cloudDb.users
			};
			user = db.users[username];
		}
	}
	if (!user) return {
		success: false,
		error: "Usuário não encontrado para salvar dados."
	};
	if (payload.progress) user.progress = {
		...user.progress,
		...payload.progress
	};
	if (payload.chatHistory) user.chatHistory = payload.chatHistory;
	if (payload.customCards) user.customCards = payload.customCards;
	user.updatedAt = (/* @__PURE__ */ new Date()).toISOString();
	saveDatabaseFile(db);
	await syncToCloud(db);
	return { success: true };
}
async function getUserDataFromServer(usernameRaw) {
	const username = usernameRaw.trim().toLowerCase();
	let db = ensureDatabaseFile();
	let user = db.users[username];
	if (!user) {
		const cloudDb = await fetchFromCloud();
		if (cloudDb && cloudDb.users) {
			db.users = {
				...db.users,
				...cloudDb.users
			};
			user = db.users[username];
		}
	}
	if (!user) return {
		success: false,
		error: "Usuário não encontrado."
	};
	return {
		success: true,
		user
	};
}
async function handleApiRequest(request) {
	const url = new URL(request.url);
	const path = url.pathname;
	const method = request.method;
	const jsonHeaders = {
		"Content-Type": "application/json",
		"Access-Control-Allow-Origin": "*",
		"Access-Control-Allow-Methods": "GET, POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type"
	};
	if (method === "OPTIONS") return new Response(null, {
		status: 204,
		headers: jsonHeaders
	});
	try {
		if (path === "/api/auth/register" && method === "POST") {
			const { username, pin, displayName } = await request.json().catch(() => ({}));
			const result = await registerUser(username, pin, displayName);
			if (!result.success) return new Response(JSON.stringify({
				success: false,
				error: result.error
			}), {
				status: 400,
				headers: jsonHeaders
			});
			return new Response(JSON.stringify({
				success: true,
				user: result.user
			}), {
				status: 200,
				headers: jsonHeaders
			});
		}
		if (path === "/api/auth/login" && method === "POST") {
			const { username, pin } = await request.json().catch(() => ({}));
			const result = await loginUser(username, pin);
			if (!result.success) return new Response(JSON.stringify({
				success: false,
				error: result.error
			}), {
				status: 401,
				headers: jsonHeaders
			});
			return new Response(JSON.stringify({
				success: true,
				user: result.user
			}), {
				status: 200,
				headers: jsonHeaders
			});
		}
		if (path === "/api/auth/reset-pin" && method === "POST") {
			const { username, newPin } = await request.json().catch(() => ({}));
			const result = await resetUserPin(username, newPin);
			if (!result.success) return new Response(JSON.stringify({
				success: false,
				error: result.error
			}), {
				status: 400,
				headers: jsonHeaders
			});
			return new Response(JSON.stringify({
				success: true,
				message: "Senha redefinida com sucesso! Você já pode entrar com o novo PIN."
			}), {
				status: 200,
				headers: jsonHeaders
			});
		}
		if (path === "/api/user/save" && method === "POST") {
			const { username, progress, chatHistory, customCards } = await request.json().catch(() => ({}));
			const result = await saveUserDataOnServer(username, {
				progress,
				chatHistory,
				customCards
			});
			if (!result.success) return new Response(JSON.stringify({
				success: false,
				error: result.error
			}), {
				status: 400,
				headers: jsonHeaders
			});
			return new Response(JSON.stringify({ success: true }), {
				status: 200,
				headers: jsonHeaders
			});
		}
		if (path === "/api/user/data" && method === "GET") {
			const result = await getUserDataFromServer(url.searchParams.get("username") || "");
			if (!result.success) return new Response(JSON.stringify({
				success: false,
				error: result.error
			}), {
				status: 404,
				headers: jsonHeaders
			});
			return new Response(JSON.stringify({
				success: true,
				user: result.user
			}), {
				status: 200,
				headers: jsonHeaders
			});
		}
		return new Response(JSON.stringify({ error: "Endpoint não encontrado" }), {
			status: 404,
			headers: jsonHeaders
		});
	} catch (error) {
		console.error("Erro na API de autenticação/usuários:", error);
		return new Response(JSON.stringify({
			success: false,
			error: "Erro interno no servidor."
		}), {
			status: 500,
			headers: jsonHeaders
		});
	}
}
var serverEntryPromise;
async function getServerEntry() {
	if (!serverEntryPromise) serverEntryPromise = import("./server-CoqmDOTn.mjs").then((m) => m.default ?? m);
	return serverEntryPromise;
}
async function normalizeCatastrophicSsrResponse(response) {
	if (response.status < 500) return response;
	if (!(response.headers.get("content-type") ?? "").includes("application/json")) return response;
	const body = await response.clone().text();
	if (!isH3SwallowedErrorBody(body)) return response;
	console.error(consumeLastCapturedError() ?? /* @__PURE__ */ new Error(`h3 swallowed SSR error: ${body}`));
	return new Response(renderErrorPage(), {
		status: 500,
		headers: { "content-type": "text/html; charset=utf-8" }
	});
}
function isH3SwallowedErrorBody(body) {
	try {
		const payload = JSON.parse(body);
		return payload.unhandled === true && payload.message === "HTTPError";
	} catch {
		return false;
	}
}
var server_default = { async fetch(request, env, ctx) {
	try {
		if (new URL(request.url).pathname.startsWith("/api/")) return await handleApiRequest(request);
		return await normalizeCatastrophicSsrResponse(await (await getServerEntry()).fetch(request, env, ctx));
	} catch (error) {
		console.error(error);
		return new Response(renderErrorPage(), {
			status: 500,
			headers: { "content-type": "text/html; charset=utf-8" }
		});
	}
} };
//#endregion
export { server_default as default, renderErrorPage as t };
