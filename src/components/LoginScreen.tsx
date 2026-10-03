import React, { useState } from "react";
import { UserSession, loginWithPin, registerWithPin, resetPin } from "@/services/auth";
import { validateEmailMx, checkProjectAccess } from "@/services/ecosystem-auth-service";
import {
  User,
  KeyRound,
  Sparkles,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Mail,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

type Mode = "login" | "register" | "reset";

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [view, setView] = useState<"signin" | "signup">("signin");
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Brand Accent Color: #06b6d4 (Cyber Cyan)

  const handlePinChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 12);
    setPin(clean);
    setErrorMsg("");
  };

  const handleConfirmPinChange = (val: string) => {
    const clean = val.replace(/\D/g, "").slice(0, 12);
    setConfirmPin(clean);
    setErrorMsg("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const cleanUser = username.trim().toLowerCase();
    const cleanPin = pin.trim();

    if (!cleanUser) {
      setErrorMsg("Por favor, digite seu usuário ou e-mail.");
      return;
    }

    if (!/^\d{6,}$/.test(cleanPin) && !/^MTN-[A-Z0-9]{4,8}$/i.test(cleanPin)) {
      setErrorMsg("O PIN deve conter no mínimo 6 dígitos numéricos.");
      return;
    }

    setIsLoading(true);

    try {
      if (cleanUser.includes("@")) {
        const mx = await validateEmailMx(cleanUser);
        if (!mx.valid) {
          setErrorMsg(mx.reason || "E-mail inválido.");
          setIsLoading(false);
          return;
        }

        const access = await checkProjectAccess(null, "smart-language", cleanUser);
        if (!access.hasAccess) {
          setErrorMsg(access.message || "Acesso negado para este projeto.");
          setIsLoading(false);
          return;
        }
      }

      if (view === "signin" && mode !== "reset") {
        const res = await loginWithPin(cleanUser, cleanPin);
        if (res.success && res.user) {
          toast.success(`Bem-vindo de volta, ${res.user.displayName}!`);
          onLoginSuccess(res.user);
        } else {
          setErrorMsg(res.error || "Usuário ou PIN incorretos.");
        }
      } else if (view === "signup") {
        const res = await registerWithPin(cleanUser, cleanPin, displayName || cleanUser);
        if (res.success && res.user) {
          toast.success(`Conta criada com sucesso! Olá, ${res.user.displayName}!`);
          onLoginSuccess(res.user);
        } else {
          setErrorMsg(res.error || "Não foi possível criar a conta.");
        }
      } else if (mode === "reset") {
        if (cleanPin !== confirmPin) {
          setErrorMsg("Os dois PINs digitados não coincidem.");
          setIsLoading(false);
          return;
        }

        const res = await resetPin(cleanUser, cleanPin);
        if (res.success) {
          toast.success(res.message || "Senha redefinida com sucesso!");
          setView("signin");
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
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Mesh Glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#06b6d4]/20 blur-[160px]" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-cyan-600/15 blur-[160px]" />
      </div>

      {/* Stage Card Container */}
      <div className="w-full max-w-[920px] bg-slate-900/90 border border-[#06b6d4]/30 rounded-3xl shadow-[0_0_60px_rgba(6,182,212,0.2)] backdrop-blur-2xl overflow-hidden flex flex-col md:flex-row min-h-[580px] my-auto">
        
        {/* A) NAV RAIL */}
        <nav className="w-full md:w-24 bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-800/80 p-4 flex md:flex-col items-center justify-between z-20 flex-shrink-0">
          <div className="flex flex-col items-center gap-2">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#06b6d4] to-cyan-600 p-0.5 shadow-lg shadow-[#06b6d4]/30 flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-[#06b6d4]" />
              </div>
            </div>
            <span className="text-[10px] font-black tracking-widest text-[#06b6d4] uppercase">AI Tutor</span>
          </div>

          <div className="flex md:flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => { setView("signin"); setMode("login"); setErrorMsg(""); }}
              aria-label="Entrar na conta"
              className={`min-h-[44px] min-w-[44px] px-4 py-2 md:py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-xs font-bold ${
                view === "signin"
                  ? "bg-[#06b6d4] text-slate-950 shadow-lg shadow-[#06b6d4]/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <User className="h-5 w-5" />
              <span>Entrar</span>
            </button>

            <button
              type="button"
              onClick={() => { setView("signup"); setMode("register"); setErrorMsg(""); }}
              aria-label="Criar nova conta"
              className={`min-h-[44px] min-w-[44px] px-4 py-2 md:py-3 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-xs font-bold ${
                view === "signup"
                  ? "bg-[#06b6d4] text-slate-950 shadow-lg shadow-[#06b6d4]/40"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/50"
              }`}
            >
              <Sparkles className="h-5 w-5" />
              <span>Cadastrar</span>
            </button>
          </div>

          <div className="hidden md:flex flex-col items-center text-[10px] text-slate-400">
            <ShieldCheck className="h-4 w-4 text-[#06b6d4] mb-1" />
            <span>SSL 256</span>
          </div>
        </nav>

        {/* B) FLOATING HERO CARD */}
        <div className="w-full md:w-80 relative overflow-hidden bg-slate-950/90 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800">
          <div aria-hidden className="absolute -top-24 -left-24 w-64 h-64 bg-[#06b6d4]/20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-4">
            {view === "signin" ? (
              <div className="space-y-3 animate-in fade-in">
                <h2 className="text-2xl md:text-3xl font-extrabold !text-white text-white tracking-tight leading-tight" style={{ color: "#ffffff" }}>
                  Montanha Language AI
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Tutor Inteligente de Idiomas com Prática de Fala, Microtreinos de 5 Minutos &amp; Imersão IA.
                </p>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in">
                <h2 className="text-2xl md:text-3xl font-extrabold !text-white text-white tracking-tight leading-tight" style={{ color: "#ffffff" }}>
                  Conquiste a Fluência Diária
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Aprenda com conversação em tempo real, correção fonética e missões interativas.
                </p>
              </div>
            )}
          </div>

          <div className="relative z-10 pt-6 border-t border-slate-800/80 space-y-3">
            <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
              <CheckCircle2 className="h-4 w-4 text-[#06b6d4] flex-shrink-0" />
              <span>Autenticação rápida e segura por PIN</span>
            </div>
            <div className="flex items-center gap-2.5 text-xs text-slate-300 font-medium">
              <CheckCircle2 className="h-4 w-4 text-[#06b6d4] flex-shrink-0" />
              <span>Inteligência Fonética em Tempo Real</span>
            </div>
          </div>
        </div>

        {/* C) FORM PANEL */}
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-between bg-slate-950/60">
          <div className="space-y-6 my-auto">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold !text-white text-white" style={{ color: "#ffffff" }}>
                  {view === "signin" ? (mode === "reset" ? "Redefinir PIN" : "Acessar Plataforma") : "Criar sua Conta"}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  {view === "signin"
                    ? "Informe suas credenciais ou PIN de 10 dígitos."
                    : "Preencha seus dados para cadastro no tutor."}
                </p>
              </div>
              <span className="text-[11px] font-bold text-[#06b6d4] bg-[#06b6d4]/15 px-2.5 py-1 rounded-lg border border-[#06b6d4]/30">
                PIN 10 Dígitos
              </span>
            </div>

            {errorMsg && (
              <div data-testid="auth-error-msg" className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {view === "signup" && (
                <div className="space-y-1.5">
                  <label htmlFor="su-displayname" className="text-xs font-bold text-slate-300 uppercase tracking-wider">Seu Nome</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      id="su-displayname"
                      type="text"
                      required
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ex: Lucas Silva"
                      style={{ fontSize: "16px" }}
                      className="w-full h-11 pl-10 pr-4 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] text-base md:text-sm"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label htmlFor="user-input-lang" className="text-xs font-bold text-slate-300 uppercase tracking-wider">Usuário ou E-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    id="user-input-lang"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                    placeholder="Ex: lucas ou seu.email@exemplo.com"
                    style={{ fontSize: "16px" }}
                    className="w-full h-11 pl-10 pr-4 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] text-base md:text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="pin-input-lang" className="text-xs font-bold text-slate-300 uppercase tracking-wider">PIN de Acesso</label>
                  {view === "signin" && mode !== "reset" && (
                    <button
                      type="button"
                      onClick={() => { setMode("reset"); setErrorMsg(""); }}
                      className="text-xs font-bold text-[#06b6d4] hover:underline"
                    >
                      Esqueci
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    id="pin-input-lang"
                    type="password"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={12}
                    required
                    value={pin}
                    onChange={(e) => handlePinChange(e.target.value)}
                    placeholder="••••••••"
                    style={{ fontSize: "16px" }}
                    className="w-full h-11 pl-10 pr-12 bg-slate-900 border border-slate-800 rounded-xl text-white tracking-widest font-mono placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] text-base md:text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    aria-label="Alternar visibilidade do PIN"
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {mode === "reset" && (
                <div className="space-y-1.5">
                  <label htmlFor="confirm-pin-lang" className="text-xs font-bold text-slate-300 uppercase tracking-wider">Confirmar Novo PIN</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      id="confirm-pin-lang"
                      type="password"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      required
                      value={confirmPin}
                      onChange={(e) => handleConfirmPinChange(e.target.value)}
                      placeholder="•••••••••• (10 dígitos)"
                      style={{ fontSize: "16px" }}
                      className="w-full h-11 pl-10 pr-4 bg-slate-900 border border-slate-800 rounded-xl text-white tracking-widest font-mono placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] text-base md:text-sm"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                aria-label={view === "signin" ? "Entrar no Language AI" : "Criar conta de usuário"}
                className="w-full h-11 rounded-xl bg-gradient-to-r from-[#06b6d4] to-cyan-600 text-slate-950 font-black text-xs uppercase tracking-wider shadow-lg shadow-[#06b6d4]/30 hover:opacity-95 transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                <span>
                  {mode === "reset"
                    ? "Salvar Novo PIN"
                    : view === "signin"
                    ? "Entrar no Language AI"
                    : "Criar Conta de Aluno"}
                </span>
              </button>
            </form>

            <div className="text-center text-xs text-slate-400 pt-2 border-t border-slate-800/60">
              {view === "signin" ? (
                <span>
                  Ainda não tem conta?{" "}
                  <button
                    type="button"
                    onClick={() => { setView("signup"); setMode("register"); setErrorMsg(""); }}
                    className="font-bold text-[#06b6d4] hover:underline ml-1"
                  >
                    Cadastre-se aqui
                  </button>
                </span>
              ) : (
                <span>
                  Já é cadastrado?{" "}
                  <button
                    type="button"
                    onClick={() => { setView("signin"); setMode("login"); setErrorMsg(""); }}
                    className="font-bold text-[#06b6d4] hover:underline ml-1"
                  >
                    Fazer login
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
