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

const DATA_DIR = path.resolve(process.cwd(), "data");
const USERS_FILE_PATH = path.resolve(DATA_DIR, "users.json");

// Garante que o diretório e o arquivo do sistema existam
function ensureDatabaseFile(): UsersDatabase {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (!fs.existsSync(USERS_FILE_PATH)) {
      const initialDb: UsersDatabase = {
        users: {
          aluno: {
            username: "aluno",
            displayName: "Aluno Demonstração",
            pin: "1234",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            progress: {
              streakDays: 1,
              lastActiveDate: new Date().toISOString().split("T")[0]!,
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
      fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(initialDb, null, 2), "utf-8");
      return initialDb;
    }

    const content = fs.readFileSync(USERS_FILE_PATH, "utf-8");
    return JSON.parse(content) as UsersDatabase;
  } catch (error) {
    console.error("Erro ao ler arquivo de usuários:", error);
    return { users: {} };
  }
}

export function saveDatabaseFile(db: UsersDatabase): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch (error) {
    console.error("Erro ao salvar arquivo de usuários:", error);
  }
}

// 1. REGISTRO DE NOVO USUÁRIO
export function registerUser(usernameRaw: string, pin: string, displayNameRaw?: string): { success: boolean; error?: string; user?: StoredUserData } {
  const username = usernameRaw.trim().toLowerCase();
  const displayName = (displayNameRaw || usernameRaw).trim();

  if (!username) {
    return { success: false, error: "Nome de usuário é obrigatório." };
  }

  // Validação: Senha deve conter exatamente 4 números
  if (!/^\d{4}$/.test(pin)) {
    return { success: false, error: "A senha deve conter exatamente 4 números (ex: 1234)." };
  }

  const db = ensureDatabaseFile();
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

  return { success: true, user: newUser };
}

// 2. LOGIN DE USUÁRIO
export function loginUser(usernameRaw: string, pin: string): { success: boolean; error?: string; user?: StoredUserData } {
  const username = usernameRaw.trim().toLowerCase();

  if (!username) {
    return { success: false, error: "Informe o nome de usuário." };
  }

  if (!/^\d{4}$/.test(pin)) {
    return { success: false, error: "A senha deve conter exatamente 4 números." };
  }

  const db = ensureDatabaseFile();
  const user = db.users[username];

  if (!user) {
    return { success: false, error: "Usuário não encontrado. Crie uma conta primeiro." };
  }

  if (user.pin !== pin) {
    return { success: false, error: "Senha incorreta. A senha é um PIN de 4 números." };
  }

  return { success: true, user };
}

// 3. RESET DE SENHA (PIN DE 4 NÚMEROS)
export function resetUserPin(usernameRaw: string, newPin: string): { success: boolean; error?: string } {
  const username = usernameRaw.trim().toLowerCase();

  if (!username) {
    return { success: false, error: "Informe o nome de usuário para redefinir a senha." };
  }

  if (!/^\d{4}$/.test(newPin)) {
    return { success: false, error: "A nova senha deve conter exatamente 4 números (ex: 5678)." };
  }

  const db = ensureDatabaseFile();
  const user = db.users[username];

  if (!user) {
    return { success: false, error: "Usuário não encontrado para redefinir." };
  }

  user.pin = newPin;
  user.updatedAt = new Date().toISOString();
  saveDatabaseFile(db);

  return { success: true };
}

// 4. SALVAR DADOS E PROGRESSO DO USUÁRIO NO SERVIDOR
export function saveUserDataOnServer(
  usernameRaw: string,
  payload: {
    progress?: UserProgress;
    chatHistory?: ChatMessage[];
    customCards?: Flashcard[];
  }
): { success: boolean; error?: string } {
  const username = usernameRaw.trim().toLowerCase();
  const db = ensureDatabaseFile();
  const user = db.users[username];

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

  return { success: true };
}

// 5. CARREGAR DADOS DO USUÁRIO DO SERVIDOR
export function getUserDataFromServer(usernameRaw: string): { success: boolean; error?: string; user?: StoredUserData } {
  const username = usernameRaw.trim().toLowerCase();
  const db = ensureDatabaseFile();
  const user = db.users[username];

  if (!user) {
    return { success: false, error: "Usuário não encontrado." };
  }

  return { success: true, user };
}
