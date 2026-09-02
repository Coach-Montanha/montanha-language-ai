import { UserProgress, ChatMessage, Flashcard } from "@/types/language";

export interface UserSession {
  username: string;
  displayName: string;
  pin: string;
  createdAt: string;
  progress: UserProgress;
  chatHistory?: ChatMessage[];
  customCards?: Flashcard[];
}

const SESSION_KEY = "smart_language_current_session";
const LOCAL_USERS_BACKUP_KEY = "smart_language_local_users_backup";

// Auxiliar para ler cache local de usuários caso a API esteja temporariamente indisponível
function getLocalUsersBackup(): Record<string, UserSession> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(LOCAL_USERS_BACKUP_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalUsersBackup(users: Record<string, UserSession>): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(LOCAL_USERS_BACKUP_KEY, JSON.stringify(users));
  } catch (e) {
    console.warn("Falha ao salvar backup local de usuários:", e);
  }
}

export function getCurrentSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as UserSession) : null;
  } catch {
    return null;
  }
}

export function setCurrentSession(session: UserSession | null): void {
  if (typeof window === "undefined") return;
  if (!session) {
    localStorage.removeItem(SESSION_KEY);
  } else {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }
}

// 1. LOGIN COM PIN DE 4 NÚMEROS
export async function loginWithPin(
  usernameRaw: string,
  pin: string
): Promise<{ success: boolean; error?: string; user?: UserSession }> {
  const username = usernameRaw.trim().toLowerCase();

  if (!username) {
    return { success: false, error: "Informe o seu usuário." };
  }

  if (!/^\d{4}$/.test(pin)) {
    return { success: false, error: "A senha deve conter exatamente 4 números." };
  }

  // Tenta autenticar diretamente no servidor
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, pin }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      const session: UserSession = {
        username: data.user.username,
        displayName: data.user.displayName,
        pin: data.user.pin,
        createdAt: data.user.createdAt,
        progress: data.user.progress,
        chatHistory: data.user.chatHistory || [],
        customCards: data.user.customCards || [],
      };
      setCurrentSession(session);

      // Atualiza backup local
      const backup = getLocalUsersBackup();
      backup[username] = session;
      saveLocalUsersBackup(backup);

      return { success: true, user: session };
    }

    if (data.error) {
      return { success: false, error: data.error };
    }
  } catch (err) {
    console.warn("Servidor inacessível, tentando backup local de autenticação:", err);
  }

  // Fallback para backup local
  const backup = getLocalUsersBackup();
  const localUser = backup[username];
  if (localUser) {
    if (localUser.pin === pin) {
      setCurrentSession(localUser);
      return { success: true, user: localUser };
    }
    return { success: false, error: "Senha incorreta. A senha tem 4 números." };
  }

  // Usuário padrão de demonstração se for primeira vez
  if (username === "aluno" && pin === "1234") {
    const defaultSession: UserSession = {
      username: "aluno",
      displayName: "Aluno Demonstração",
      pin: "1234",
      createdAt: new Date().toISOString(),
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
    };
    setCurrentSession(defaultSession);
    return { success: true, user: defaultSession };
  }

  return { success: false, error: "Usuário não encontrado. Crie uma conta primeiro." };
}

// 2. CADASTRO DE NOVO USUÁRIO COM PIN DE 4 NÚMEROS
export async function registerWithPin(
  usernameRaw: string,
  pin: string,
  displayNameRaw?: string
): Promise<{ success: boolean; error?: string; user?: UserSession }> {
  const username = usernameRaw.trim().toLowerCase();
  const displayName = (displayNameRaw || usernameRaw).trim();

  if (!username) {
    return { success: false, error: "Digite um nome de usuário." };
  }

  if (!/^\d{4}$/.test(pin)) {
    return { success: false, error: "A senha deve conter exatamente 4 números (ex: 1234)." };
  }

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, pin, displayName }),
    });

    const data = await res.json();
    if (res.ok && data.success && data.user) {
      const session: UserSession = {
        username: data.user.username,
        displayName: data.user.displayName,
        pin: data.user.pin,
        createdAt: data.user.createdAt,
        progress: data.user.progress,
        chatHistory: data.user.chatHistory || [],
        customCards: data.user.customCards || [],
      };
      setCurrentSession(session);

      const backup = getLocalUsersBackup();
      backup[username] = session;
      saveLocalUsersBackup(backup);

      return { success: true, user: session };
    }

    if (data.error) {
      return { success: false, error: data.error };
    }
  } catch (err) {
    console.warn("Servidor offline, registrando no backup local:", err);
  }

  // Registro local
  const backup = getLocalUsersBackup();
  if (backup[username]) {
    return { success: false, error: "Nome de usuário já em uso." };
  }

  const now = new Date().toISOString();
  const newSession: UserSession = {
    username,
    displayName: displayName || username,
    pin,
    createdAt: now,
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

  backup[username] = newSession;
  saveLocalUsersBackup(backup);
  setCurrentSession(newSession);

  return { success: true, user: newSession };
}

// 3. RESETAR SENHA (NOVO PIN DE 4 NÚMEROS)
export async function resetPin(
  usernameRaw: string,
  newPin: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  const username = usernameRaw.trim().toLowerCase();

  if (!username) {
    return { success: false, error: "Informe o usuário para redefinir a senha." };
  }

  if (!/^\d{4}$/.test(newPin)) {
    return { success: false, error: "O novo PIN deve conter exatamente 4 números." };
  }

  try {
    const res = await fetch("/api/auth/reset-pin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, newPin }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      // Atualiza também backup local
      const backup = getLocalUsersBackup();
      if (backup[username]) {
        backup[username].pin = newPin;
        saveLocalUsersBackup(backup);
      }
      return {
        success: true,
        message: data.message || "Senha redefinida com sucesso no servidor!",
      };
    }

    if (data.error) {
      return { success: false, error: data.error };
    }
  } catch (err) {
    console.warn("Servidor offline, redefinindo localmente:", err);
  }

  // Reset local
  const backup = getLocalUsersBackup();
  if (backup[username]) {
    backup[username].pin = newPin;
    saveLocalUsersBackup(backup);
    return { success: true, message: "Senha redefinida com sucesso!" };
  }

  if (username === "aluno") {
    return { success: true, message: "Senha do usuário aluno redefinida com sucesso!" };
  }

  return { success: false, error: "Usuário não encontrado para redefinir." };
}

// 4. SALVAR PROGRESSO E DADOS NO SERVIDOR PARA O USUÁRIO ATUAL
export async function syncUserDataWithServer(
  username: string,
  progress: UserProgress,
  chatHistory?: ChatMessage[],
  customCards?: Flashcard[]
): Promise<void> {
  if (!username) return;

  // Atualiza sessão em memória
  const current = getCurrentSession();
  if (current && current.username === username) {
    current.progress = progress;
    if (chatHistory) current.chatHistory = chatHistory;
    if (customCards) current.customCards = customCards;
    setCurrentSession(current);
  }

  // Salva no backup local
  const backup = getLocalUsersBackup();
  if (backup[username]) {
    backup[username].progress = progress;
    if (chatHistory) backup[username].chatHistory = chatHistory;
    if (customCards) backup[username].customCards = customCards;
    saveLocalUsersBackup(backup);
  }

  // Dispara envio para a API do servidor (armazenamento em data/users.json)
  try {
    await fetch("/api/user/save", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        progress,
        chatHistory,
        customCards,
      }),
    });
  } catch (err) {
    console.warn("Não foi possível sincronizar com o servidor no momento:", err);
  }
}
