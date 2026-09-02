import fs from "node:fs";
import path from "node:path";
import { UserProgress, ChatMessage, Flashcard } from "../types/language";

export interface StoredUserData {
  username: string;
  displayName: string;
  pin: string; // Senha com 4 dígitos numéricos (ex: "1234")
  createdAt: string;
  updatedAt: string;
  progress: UserProgress;
  chatHistory: ChatMessage[];
  customCards: Flashcard[];
}

export interface UsersDatabase {
  users: Record<string, StoredUserData>;
}

export const CLOUD_STORAGE_URL =
  "https://api.restful-api.dev/objects/ff808181a058d43f01a061b390911c5e";

const DATA_DIR = path.resolve(process.cwd(), "data");
const USERS_FILE_PATH = path.resolve(DATA_DIR, "users.json");

// Cache em memória para acesso ultrarrápido
let memoryCache: UsersDatabase = {
  users: {
    aluno: {
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
        audioSpeed: 1.0,
        currentWeek: 1,
        completedMissionIds: ["w1-coffee"],
      },
      chatHistory: [],
      customCards: [],
    },
  },
};

// Sincroniza o banco de dados com a nuvem universal
async function syncToCloud(db: UsersDatabase): Promise<void> {
  try {
    await fetch(CLOUD_STORAGE_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "smart_language_users_master_db",
        data: db,
      }),
    });
  } catch (err) {
    console.warn("Aviso: Falha ao sincronizar com nuvem universal:", err);
  }
}

// Carrega os dados da nuvem universal caso estejam mais recentes
async function fetchFromCloud(): Promise<UsersDatabase | null> {
  try {
    const res = await fetch(CLOUD_STORAGE_URL, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = (await res.json()) as { data?: { users?: Record<string, StoredUserData> } };
    if (json && json.data && json.data.users) {
      return json.data as UsersDatabase;
    }
  } catch (err) {
    console.warn("Aviso: Falha ao buscar da nuvem universal:", err);
  }
  return null;
}

// Garante que o arquivo físico e a memória estejam sincronizados
export function ensureDatabaseFile(): UsersDatabase {
  try {
    if (typeof fs !== "undefined" && fs.existsSync && fs.readFileSync) {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }

      if (fs.existsSync(USERS_FILE_PATH)) {
        const content = fs.readFileSync(USERS_FILE_PATH, "utf-8");
        const parsed = JSON.parse(content) as UsersDatabase;
        if (parsed && parsed.users) {
          memoryCache = parsed;
        }
      } else {
        fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(memoryCache, null, 2), "utf-8");
      }
    }
  } catch (error) {
    console.warn("Aviso: Sistema de arquivos não disponível (ambiente edge/serverless), usando memória/nuvem:", error);
  }

  return memoryCache;
}

export function saveDatabaseFile(db: UsersDatabase): void {
  memoryCache = db;

  // 1. Salva no arquivo físico do sistema se suportado
  try {
    if (typeof fs !== "undefined" && fs.existsSync && fs.writeFileSync) {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
    }
  } catch (error) {
    console.warn("Aviso: Não foi possível gravar em disco no ambiente edge:", error);
  }

  // 2. Sincroniza em segundo plano com a nuvem universal
  void syncToCloud(db);
}

// 1. REGISTRO DE NOVO USUÁRIO
export async function registerUser(
  usernameRaw: string,
  pin: string,
  displayNameRaw?: string
): Promise<{ success: boolean; error?: string; user?: StoredUserData }> {
  const username = usernameRaw.trim().toLowerCase();
  const displayName = (displayNameRaw || usernameRaw).trim();

  if (!username) {
    return { success: false, error: "Nome de usuário é obrigatório." };
  }

  if (!/^\d{4}$/.test(pin)) {
    return { success: false, error: "A senha deve conter exatamente 4 números (ex: 1234)." };
  }

  // Tenta sincronizar da nuvem antes para garantir que não haja duplicidade
  const cloudDb = await fetchFromCloud();
  const db = cloudDb || ensureDatabaseFile();

  if (db.users[username]) {
    return { success: false, error: "Este usuário já está cadastrado. Escolha outro ou faça login." };
  }

  const now = new Date().toISOString();
  const newUser: StoredUserData = {
    username,
    displayName: displayName || username,
    pin,
    createdAt: now,
    updatedAt: now,
    progress: {
      streakDays: 1,
      lastActiveDate: now.split("T")[0]!,
      xp: 50,
      cardsMasteredCount: 0,
      phrasesAnalyzedCount: 0,
      messagesSentCount: 0,
      dailySprintDone: false,
      audioSpeed: 1.0,
      currentWeek: 1,
      completedMissionIds: [],
    },
    chatHistory: [],
    customCards: [],
  };

  db.users[username] = newUser;
  saveDatabaseFile(db);
  await syncToCloud(db);

  return { success: true, user: newUser };
}

// 2. LOGIN DE USUÁRIO
export async function loginUser(
  usernameRaw: string,
  pin: string
): Promise<{ success: boolean; error?: string; user?: StoredUserData }> {
  const username = usernameRaw.trim().toLowerCase();

  if (!username) {
    return { success: false, error: "Informe o nome de usuário." };
  }

  if (!/^\d{4}$/.test(pin)) {
    return { success: false, error: "A senha deve conter exatamente 4 números." };
  }

  let db = ensureDatabaseFile();
  let user = db.users[username];

  // Se o usuário não foi achado localmente, sincroniza da nuvem universal
  if (!user) {
    const cloudDb = await fetchFromCloud();
    if (cloudDb && cloudDb.users) {
      db.users = { ...db.users, ...cloudDb.users };
      user = db.users[username];
      saveDatabaseFile(db);
    }
  }

  if (!user) {
    return { success: false, error: "Usuário não encontrado. Crie uma conta primeiro." };
  }

  if (user.pin !== pin) {
    return { success: false, error: "Senha incorreta. A senha é um PIN de 4 números." };
  }

  return { success: true, user };
}

// 3. RESET DE SENHA (PIN DE 4 NÚMEROS)
export async function resetUserPin(
  usernameRaw: string,
  newPin: string
): Promise<{ success: boolean; error?: string }> {
  const username = usernameRaw.trim().toLowerCase();

  if (!username) {
    return { success: false, error: "Informe o nome de usuário para redefinir a senha." };
  }

  if (!/^\d{4}$/.test(newPin)) {
    return { success: false, error: "A nova senha deve conter exatamente 4 números (ex: 5678)." };
  }

  let db = ensureDatabaseFile();
  let user = db.users[username];

  if (!user) {
    const cloudDb = await fetchFromCloud();
    if (cloudDb && cloudDb.users) {
      db.users = { ...db.users, ...cloudDb.users };
      user = db.users[username];
    }
  }

  if (!user) {
    return { success: false, error: "Usuário não encontrado para redefinir." };
  }

  user.pin = newPin;
  user.updatedAt = new Date().toISOString();
  saveDatabaseFile(db);
  await syncToCloud(db);

  return { success: true };
}

// 4. SALVAR DADOS E PROGRESSO DO USUÁRIO NO SERVIDOR
export async function saveUserDataOnServer(
  usernameRaw: string,
  payload: {
    progress?: UserProgress;
    chatHistory?: ChatMessage[];
    customCards?: Flashcard[];
  }
): Promise<{ success: boolean; error?: string }> {
  const username = usernameRaw.trim().toLowerCase();
  let db = ensureDatabaseFile();
  let user = db.users[username];

  if (!user) {
    const cloudDb = await fetchFromCloud();
    if (cloudDb && cloudDb.users) {
      db.users = { ...db.users, ...cloudDb.users };
      user = db.users[username];
    }
  }

  if (!user) {
    return { success: false, error: "Usuário não encontrado para salvar dados." };
  }

  if (payload.progress) {
    user.progress = { ...user.progress, ...payload.progress };
  }
  if (payload.chatHistory) {
    user.chatHistory = payload.chatHistory;
  }
  if (payload.customCards) {
    user.customCards = payload.customCards;
  }

  user.updatedAt = new Date().toISOString();
  saveDatabaseFile(db);
  await syncToCloud(db);

  return { success: true };
}

// 5. CARREGAR DADOS DO USUÁRIO DO SERVIDOR
export async function getUserDataFromServer(
  usernameRaw: string
): Promise<{ success: boolean; error?: string; user?: StoredUserData }> {
  const username = usernameRaw.trim().toLowerCase();
  let db = ensureDatabaseFile();
  let user = db.users[username];

  if (!user) {
    const cloudDb = await fetchFromCloud();
    if (cloudDb && cloudDb.users) {
      db.users = { ...db.users, ...cloudDb.users };
      user = db.users[username];
    }
  }

  if (!user) {
    return { success: false, error: "Usuário não encontrado." };
  }

  return { success: true, user };
}
