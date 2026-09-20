import React, { useState } from "react";
import { UserSession, loginWithPin, registerWithPin, resetPin } from "@/services/auth";
import {
  checkAndLockGuestDemo,
  validateEmailMx,
  sendOtpToken,
  verifyOtpToken,
  checkProjectAccess
} from "@/services/ecosystem-auth-service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  User,
  KeyRound,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Zap,
  Globe,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  Mail
} from "lucide-react";
import { toast } from "sonner";

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

type Mode = "login" | "register" | "reset";

const ECOSYSTEM_APPS = [
  {
    id: "language",
    name: "Montanha Language AI",
    tag: "Idiomas & IA",
    slogan: "Tutor de Idiomas com IA & Treinos Diários",
    accent: "#6366f1",
    badgeBg: "bg-indigo-500/20 text-indigo-300 border-indigo-500/40",
    isCurrent: true,
  },
  {
    id: "pdf",
    name: "Montanha PDF Studio",
    tag: "Diagramação & IA",
    slogan: "Diagramação Editorial & Publicações com IA",
    accent: "#f59e0b",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    isCurrent: false,
  },
  {
    id: "personal",
    name: "Montanha Personal Studio",
    tag: "Finanças & Operação",
    slogan: "Gestão Financeira & Inteligência para Studios",
    accent: "#10b981",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    isCurrent: false,
  },
  {
    id: "hybrid",
    name: "Montanha Hybrid Training",
    tag: "Performance & Treino",
    slogan: "Alta Performance & Periodização de Treino",
    accent: "#06b6d4",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    isCurrent: false,
  },
  {
    id: "whatsapp",
    name: "Montanha WhatsApp Automation",
    tag: "SaaS & CRM",
    slogan: "Automação Multi-Tenant & Disparos WhatsApp",
    accent: "#a855f7",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    isCurrent: false,
  },
];

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showEcosystem, setShowEcosystem] = useState(false);

  const handlePinChange = (val: string) => {
    // Permite apenas dígitos e no máximo 4 números
    const clean = val.replace(/\D/g, "").slice(0, 4);
    setPin(clean);
    setErrorMsg("");
  };

  const handleConfirmPinChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 4);
    setConfirmPin(clean);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!username.trim()) {
      setErrorMsg("Por favor, digite seu nome de usuário.");
      return;
    }

    if (pin.length !== 4) {
      setErrorMsg("A senha deve conter exatamente 4 números.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "login") {
        const res = await loginWithPin(username, pin);
        if (res.success && res.user) {
          toast.success(`Bem-vindo de volta, ${res.user.displayName}!`);
          onLoginSuccess(res.user);
        } else {
          setErrorMsg(res.error || "Usuário ou senha incorretos.");
        }
      } else if (mode === "register") {
        const res = await registerWithPin(username, pin, displayName || username);
        if (res.success && res.user) {
          toast.success(`Conta criada com sucesso! Olá, ${res.user.displayName}!`);
          onLoginSuccess(res.user);
        } else {
          setErrorMsg(res.error || "Não foi possível criar a conta.");
        }
      } else if (mode === "reset") {
        if (pin !== confirmPin) {
          setErrorMsg("Os dois PINs digitados não coincidem.");
          setIsLoading(false);
          return;
        }

        const res = await resetPin(username, pin);
        if (res.success) {
          toast.success(res.message || "Senha redefinida com sucesso!");
          setMode("login");
          setConfirmPin("");
        } else {
          setErrorMsg(res.error || "Não foi possível redefinir a senha.");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Ocorreu uma falha na comunicação. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 font-sans relative overflow-hidden">
      {/* Glow ambient background */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-32 -top-32 h-[520px] w-[520px] rounded-full bg-indigo-500/20 blur-[130px]" />
        <div className="absolute -bottom-40 -right-32 h-[560px] w-[560px] rounded-full bg-indigo-600/15 blur-[150px]" />
      </div>

      <div className="w-full max-w-sm space-y-4">
        {/* Logotipo e Cabeçalho */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/40 shadow-lg mb-1">
            <Sparkles className="h-6 w-6 text-indigo-400" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            Montanha Language AI
          </h1>
          <p className="text-xs text-slate-400">
            Tutor de Idiomas com IA, Treinos Diários de 5 Minutos &amp; Imersão Fluida
          </p>
        </div>

        {/* Card Principal de Autenticação em Dark Glassmorphism */}
        <div className="rounded-2xl border border-indigo-500/30 bg-slate-950/90 p-6 shadow-[0_0_50px_rgba(99,102,241,0.15)] backdrop-blur-2xl space-y-4">
          {/* Seletor de Modo: Entrar / Criar Conta / Reset */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-slate-900/80 border border-slate-800 rounded-xl text-center text-xs font-semibold">
            <button
              type="button"
              data-testid="tab-login"
              onClick={() => {
                setMode("login");
                setErrorMsg("");
              }}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "login"
                  ? "bg-indigo-500 text-slate-950 font-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              data-testid="tab-register"
              onClick={() => {
                setMode("register");
                setErrorMsg("");
              }}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "register"
                  ? "bg-indigo-500 text-slate-950 font-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Criar Conta
            </button>
            <button
              type="button"
              data-testid="tab-reset"
              onClick={() => {
                setMode("reset");
                setErrorMsg("");
              }}
              className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                mode === "reset"
                  ? "bg-indigo-500 text-slate-950 font-black shadow-md"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Resetar
            </button>
          </div>

          {/* Mensagem de Erro se houver */}
          {errorMsg && (
            <div data-testid="auth-error-msg" className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs animate-in fade-in font-semibold">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Nome de Exibição (apenas no Cadastro) */}
            {mode === "register" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Seu Nome
                </label>
                <Input
                  type="text"
                  data-testid="input-display-name"
                  placeholder="Ex: Lucas Silva"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-10 bg-slate-900/90 border-slate-800 text-white text-xs rounded-xl focus:border-indigo-500"
                />
              </div>
            )}

            {/* Nome de Usuário / Login */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center justify-between">
                <span>Usuário</span>
                <span className="text-[10px] text-slate-400">Sem espaços</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <Input
                  type="text"
                  data-testid="input-username"
                  placeholder="Ex: lucas"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  className="pl-9 h-10 bg-slate-900/90 border-slate-800 text-white text-xs rounded-xl focus:border-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Senha (PIN de exatamente 4 números) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                  <KeyRound className="h-3.5 w-3.5 text-indigo-400" />
                  <span>{mode === "reset" ? "Novo PIN (4 números)" : "Senha PIN"}</span>
                </label>
                {mode === "login" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("reset");
                      setErrorMsg("");
                    }}
                    className="text-xs text-indigo-400 hover:underline font-medium cursor-pointer"
                  >
                    Esqueci a senha
                  </button>
                )}
                {mode !== "login" && (
                  <Badge
                    variant="outline"
                    className="text-[9px] bg-indigo-500/20 text-indigo-300 border-indigo-500/40 font-bold"
                  >
                    4 números apenas
                  </Badge>
                )}
              </div>

              {/* Campo numérico com indicador visual de 4 dígitos */}
              <div className="relative">
                <Input
                  type="password"
                  data-testid="input-pin"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  className="h-11 text-center font-mono text-lg tracking-[0.6em] bg-slate-900/90 border-indigo-500/40 text-white rounded-xl focus-visible:ring-indigo-500"
                  required
                />
              </div>

              <div className="flex justify-center gap-2 pt-1">
                {[0, 1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    className={`h-2.5 w-2.5 rounded-full transition-all ${
                      pin.length > idx ? "bg-indigo-500 scale-110 shadow-[0_0_8px_rgba(99,102,241,0.8)]" : "bg-slate-800"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Confirmação do novo PIN no Reset */}
            {mode === "reset" && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                  Confirmar Novo PIN (4 números)
                </label>
                <Input
                  type="password"
                  data-testid="input-confirm-pin"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => handleConfirmPinChange(e.target.value)}
                  className="h-11 text-center font-mono text-lg tracking-[0.6em] bg-slate-900/90 border-indigo-500/40 text-white rounded-xl"
                  required
                />
              </div>
            )}

            {/* Botão de Envio */}
            <Button
              type="submit"
              data-testid="btn-submit-auth"
              disabled={isLoading || pin.length !== 4 || !username.trim()}
              className="w-full h-10 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span>Processando...</span>
              ) : mode === "login" ? (
                <>
                  <span>Entrar no Language AI</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              ) : mode === "register" ? (
                <>
                  <span>Criar Meu Perfil</span>
                  <CheckCircle2 className="h-4 w-4" />
                </>
              ) : (
                <>
                  <span>Salvar Novo PIN no Servidor</span>
                  <RotateCcw className="h-4 w-4" />
                </>
              )}
            </Button>
          </form>
        </div>

        {/* Footer Ecosystem Button */}
        <div className="text-center pt-1">
          <button
            type="button"
            onClick={() => setShowEcosystem(!showEcosystem)}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-bold inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/30 transition-all cursor-pointer shadow-md"
          >
            <Globe className="w-3.5 h-3.5" />
            <span>🌐 Ecossistema (5 Apps Integrados)</span>
            {showEcosystem ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Ecosystem Drawer */}
        {showEcosystem && (
          <div className="p-3.5 rounded-2xl bg-slate-900/95 border border-indigo-500/40 shadow-2xl space-y-2 animate-in fade-in">
            <div className="text-[11px] font-bold text-indigo-300 flex items-center gap-1.5 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Plataformas do Ecossistema Montanha</span>
            </div>
            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {ECOSYSTEM_APPS.map((app) => (
                <div
                  key={app.id}
                  className={`p-2 rounded-xl border text-xs flex items-center justify-between transition-all ${
                    app.isCurrent
                      ? "bg-indigo-500/10 border-indigo-500/50 text-white"
                      : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: app.accent }} />
                      {app.name}
                    </span>
                    <span className="text-[10px] text-slate-400">{app.slogan}</span>
                  </div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full border ${app.badgeBg}`}>
                    {app.isCurrent ? "ATUAL" : app.tag}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
