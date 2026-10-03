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

// 1. Read and save active session
export function getCurrentSession(): UserSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw) as UserSession;

    // Check for trial activation in URL
    const params = new URLSearchParams(window.location.search);
    const isTrial = params.get("trial") === "1";
    const email = params.get("email") || params.get("impersonate");
    const name = params.get("name") || email?.split("@")[0] || "Aluno";
    const pass = params.get("pass") || "1234567890";

    if ((isTrial || params.has("impersonate")) && email) {
      const cleanEmail = email.trim().toLowerCase();
      const trialSession: UserSession = {
        username: cleanEmail,
        displayName: decodeURIComponent(name),
        pin: pass,
        createdAt: new Date().toISOString(),
        progress: {
          streakDays: 1,
          lastActiveDate: new Date().toISOString().split("T")[0]!,
          xp: 100,
          cardsMasteredCount: 0,
          phrasesAnalyzedCount: 0,
          messagesSentCount: 0,
          dailySprintDone: false,
          audioSpeed: 1,
          currentWeek: 1,
          completedMissionIds: []
        }
      };
      setCurrentSession(trialSession);
      return trialSession;
    }

    return null;
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

// 2. Local users cache
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
    console.warn("Aviso ao salvar backup local de usuários:", e);
  }
}

// =========================================================================
// 1. LOGIN WITH 10-DIGIT PIN OR MTN CODE
// =========================================================================
export async function loginWithPin(
  usernameRaw: string,
  pin: string
): Promise<{ success: boolean; error?: string; user?: UserSession }> {
  const username = usernameRaw.trim().toLowerCase();
  const cleanPin = pin.trim();

  if (!username) {
    return { success: false, error: "Informe o seu usuário ou e-mail." };
  }

  const isTenDigitPin = /^\d{10}$/.test(cleanPin);
  const isMtnCode = /^MTN-[A-Z0-9]{4,8}$/i.test(cleanPin);

  if (!isTenDigitPin && !isMtnCode) {
    return { success: false, error: "Digite seu PIN de 10 dígitos numéricos ou o código de convite MTN-XXXX." };
  }

  // A. Local API or Server Session
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, pin: cleanPin }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.user) {
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
    } else if (res.status === 401) {
      const errData = await res.json().catch(() => ({}));
      if (errData.error && errData.error.includes("Senha incorreta")) {
        return { success: false, error: errData.error };
      }
    }
  } catch {
    // Local static mode
  }

  // B. Fallback to Local Backup Storage
  const backup = getLocalUsersBackup();
  const localUser = backup[username];
  if (localUser) {
    if (localUser.pin === cleanPin || (isMtnCode && localUser.pin.toUpperCase() === cleanPin.toUpperCase())) {
      setCurrentSession(localUser);
      return { success: true, user: localUser };
    }
    return { success: false, error: "Senha ou PIN incorreto." };
  }

  // C. Legacy / Invite MTN Code Support
  if (isMtnCode) {
    const displayName = username.split("@")[0] || "Aluno Montanha";

    const ecosystemSession: UserSession = {
      username: username.trim(),
      displayName,
      pin: cleanPin.toUpperCase(),
      createdAt: new Date().toISOString(),
      progress: {
        streakDays: 1,
        lastActiveDate: new Date().toISOString().split("T")[0]!,
        xp: 150,
        cardsMasteredCount: 1,
        phrasesAnalyzedCount: 1,
        messagesSentCount: 1,
        dailySprintDone: false,
        audioSpeed: 0.85,
        currentWeek: 1,
        completedMissionIds: [],
      },
      chatHistory: [],
      customCards: [],
    };

    setCurrentSession(ecosystemSession);
    backup[username] = ecosystemSession;
    saveLocalUsersBackup(backup);

    return { success: true, user: ecosystemSession };
  }

  // D. Demo user fallback
  if (username === "aluno" && isTenDigitPin) {
    const defaultSession: UserSession = {
      username: "aluno",
      displayName: "Aluno Demonstração",
      pin: cleanPin,
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

  // E. Auto-register 10-digit PIN user
  if (isTenDigitPin && (username.includes("@") || username.length >= 3)) {
    const regResult = await registerWithPin(username, cleanPin, username.split("@")[0]);
    if (regResult.success && regResult.user) {
      return { success: true, user: regResult.user };
    }
  }

  return { success: false, error: "Usuário não encontrado. Crie uma conta ou verifique o PIN." };
}

// =========================================================================
// 2. USER REGISTRATION
// =========================================================================
export async function registerWithPin(
  usernameRaw: string,
  pin: string,
  displayNameRaw?: string
): Promise<{ success: boolean; error?: string; user?: UserSession }> {
  const username = usernameRaw.trim().toLowerCase();
  const displayName = (displayNameRaw || usernameRaw).trim();

  if (!username) {
    return { success: false, error: "Digite um nome de usuário ou e-mail." };
  }

  if (!/^\d{10}$/.test(pin)) {
    return { success: false, error: "A senha deve conter exatamente 10 dígitos numéricos (0 a 9)." };
  }

  const backup = getLocalUsersBackup();
  if (backup[username]) {
    return { success: false, error: "Este usuário já está cadastrado. Escolha outro ou faça login." };
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

// =========================================================================
// 3. RESET PIN
// =========================================================================
export async function resetPin(
  usernameRaw: string,
  newPin: string
): Promise<{ success: boolean; error?: string; message?: string }> {
  const username = usernameRaw.trim().toLowerCase();

  if (!username) {
    return { success: false, error: "Informe o usuário para redefinir a senha." };
  }

  if (!/^\d{10}$/.test(newPin)) {
    return { success: false, error: "O novo PIN deve conter exatamente 10 dígitos numéricos." };
  }

  const backup = getLocalUsersBackup();
  if (backup[username]) {
    backup[username]!.pin = newPin;
    saveLocalUsersBackup(backup);
    return { success: true, message: "PIN redefinido com sucesso! Você já pode entrar." };
  }

  return { success: false, error: "Usuário não encontrado para redefinir o PIN." };
}

// =========================================================================
// 4. SYNC USER PROGRESS
// =========================================================================
export async function syncUserDataWithServer(
  username: string,
  progress: UserProgress,
  chatHistory?: ChatMessage[],
  customCards?: Flashcard[]
): Promise<void> {
  if (!username) return;

  const current = getCurrentSession();
  if (current && current.username === username) {
    current.progress = progress;
    if (chatHistory) current.chatHistory = chatHistory;
    if (customCards) current.customCards = customCards;
    setCurrentSession(current);
  }

  const backup = getLocalUsersBackup();
  if (backup[username]) {
    backup[username]!.progress = progress;
    if (chatHistory) backup[username]!.chatHistory = chatHistory;
    if (customCards) backup[username]!.customCards = customCards;
    saveLocalUsersBackup(backup);
  }
}
