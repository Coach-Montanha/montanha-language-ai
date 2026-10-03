import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import {
  Globe,
  Sparkles,
  ShieldCheck,
  KeyRound,
  Mail,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Bot,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { loginWithPin, registerWithPin, resetPin } from "@/services/auth";

export const Route = createFileRoute("/auth")({
  component: AuthPage,
});

const ECOSYSTEM_APPS = [
  {
    id: "language",
    name: "Montanha Language AI",
    tag: "Idiomas & IA",
    slogan: "Tutor de Idiomas com IA & Treinos Diários",
    accent: "#06b6d4",
    badgeBg: "bg-cyan-500/20 text-cyan-300 border-cyan-500/40",
    isCurrent: true,
  },
  {
    id: "pdf",
    name: "Montanha PDF Studio",
    tag: "Diagramação & IA",
    slogan: "Diagramação Editorial & Publicações com IA",
    accent: "#eab308",
    badgeBg: "bg-amber-500/20 text-amber-300 border-amber-500/40",
    isCurrent: false,
  },
  {
    id: "personal",
    name: "Montanha Personal Studio",
    tag: "Finanças & Operação",
    slogan: "Gestão Financeira & Inteligência para Studios",
    accent: "#6958e2",
    badgeBg: "bg-purple-500/20 text-purple-300 border-purple-500/40",
    isCurrent: false,
  },
  {
    id: "hybrid",
    name: "Montanha Hybrid Training",
    tag: "Performance & Treino",
    slogan: "Alta Performance & Periodização de Treino",
    accent: "#dc2626",
    badgeBg: "bg-red-500/20 text-red-300 border-red-500/40",
    isCurrent: false,
  },
  {
    id: "whatsapp",
    name: "Montanha WhatsApp Automation",
    tag: "Automação & CRM",
    slogan: "CRM & Disparos Inteligentes via WhatsApp",
    accent: "#10b981",
    badgeBg: "bg-emerald-500/20 text-emerald-300 border-emerald-500/40",
    isCurrent: false,
  },
];

function AuthPage() {
  const navigate = useNavigate();
  const [view, setView] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [showEcosystem, setShowEcosystem] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginWithPin(email, pin);
      if (res.success && res.session) {
        toast.success("Acesso realizado com sucesso!");
        navigate({ to: "/" });
      } else {
        toast.error(res.error || "Credenciais inválidas.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Falha na autenticação.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error("Informe seu nome completo.");
    setLoading(true);
    try {
      const res = await registerWithPin(name, email, pin);
      if (res.success && res.session) {
        toast.success("Conta criada com sucesso!");
        navigate({ to: "/" });
      } else {
        toast.error(res.error || "Erro ao cadastrar.");
      }
    } catch (err: any) {
      toast.error(err?.message || "Erro no cadastro.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return setResetError("Informe seu e-mail.");
    setLoading(true);
    setResetError(null);
    try {
      const res = await resetPin(email);
      if (res.success) {
        setResetSent(true);
      } else {
        setResetError(res.error || "Falha ao enviar e-mail.");
      }
    } catch (err: any) {
      setResetError(err?.message || "Erro ao enviar solicitação.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Background Mesh Glow */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-[#06b6d4]/20 blur-[160px]" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-cyan-600/15 blur-[160px]" />
      </div>

      {/* Stage Card */}
      <div className="w-full max-w-[900px] bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[560px] my-auto">
        
        {/* A) NAV RAIL */}
        <nav className="w-full md:w-24 bg-slate-950 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex md:flex-col items-center justify-between z-20 flex-shrink-0">
          <div className="flex flex-col items-center gap-1.5">
            <Link to="/" className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#06b6d4] to-cyan-600 p-0.5 shadow-md flex items-center justify-center">
              <div className="h-full w-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Bot className="h-5 w-5 text-[#06b6d4]" />
              </div>
            </Link>
            <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">AI Tutor</span>
          </div>

          <div className="flex md:flex-col items-center gap-3">
            <button
              type="button"
              onClick={() => setView("signin")}
              aria-label="Entrar na conta"
              className={`min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-xs font-bold ${
                view === "signin"
                  ? "bg-[#06b6d4] text-slate-950 shadow-md shadow-[#06b6d4]/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <User className="h-5 w-5" />
              <span>Entrar</span>
            </button>

            <button
              type="button"
              onClick={() => setView("signup")}
              aria-label="Criar nova conta"
              className={`min-h-[44px] min-w-[44px] px-4 py-2.5 rounded-xl flex flex-col items-center justify-center gap-1 transition-all text-xs font-bold ${
                view === "signup"
                  ? "bg-[#06b6d4] text-slate-950 shadow-md shadow-[#06b6d4]/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              <Sparkles className="h-5 w-5" />
              <span>Cadastrar</span>
            </button>
          </div>

          <div className="hidden md:flex flex-col items-center text-[10px] text-slate-500">
            <ShieldCheck className="h-4 w-4 text-[#06b6d4] mb-0.5" />
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
        <div className="flex-1 p-6 md:p-10 flex flex-col justify-between bg-slate-900">
          {showReset ? (
            <div className="space-y-6 my-auto">
              <div>
                <h3 className="text-2xl font-bold !text-white text-white tracking-tight" style={{ color: "#ffffff" }}>Recuperar Senha</h3>
                <p className="text-sm text-slate-400 mt-1">Informe seu e-mail cadastrado para receber o link de redefinição.</p>
              </div>

              {resetSent ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    <span>E-mail de recuperação enviado!</span>
                  </div>
                  <p className="text-xs text-slate-300">Confira sua caixa de entrada e a pasta de spam do e-mail informado.</p>
                  <button
                    type="button"
                    onClick={() => { setShowReset(false); setResetSent(false); }}
                    className="text-xs font-bold text-[#06b6d4] hover:underline block pt-2"
                  >
                    ← Voltar para o login
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReset} className="space-y-4">
                  <div className="space-y-1.5">
                    <label htmlFor="reset-email-input" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        id="reset-email-input"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu.email@exemplo.com"
                        style={{ fontSize: "16px", color: "#ffffff" }}
                        className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] text-base md:text-sm"
                      />
                    </div>
                    {resetError && <p className="text-xs text-red-400 font-semibold">{resetError}</p>}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-12 rounded-xl bg-[#06b6d4] hover:bg-cyan-600 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    <span>Enviar Link de Recuperação</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowReset(false)}
                    className="w-full text-center text-xs text-slate-400 hover:text-white pt-2"
                  >
                    ← Voltar para o login
                  </button>
                </form>
              )}
            </div>
          ) : (
            <div className="space-y-6 my-auto">
              <div>
                <h3 className="text-2xl font-bold !text-white text-white tracking-tight" style={{ color: "#ffffff" }}>
                  {view === "signin" ? "Acessar Plataforma" : "Criar sua Conta"}
                </h3>
                <p className="text-sm text-slate-400 mt-1">
                  {view === "signin"
                    ? "Informe suas credenciais ou PIN para acessar."
                    : "Preencha os dados abaixo para cadastrar seu novo acesso."}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={view === "signin" ? handleSignIn : handleSignUp} className="space-y-4">
                {view === "signup" && (
                  <div className="space-y-1.5">
                    <label htmlFor="su-name-input" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Nome Completo</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <input
                        id="su-name-input"
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Aluno Rafael"
                        style={{ fontSize: "16px", color: "#ffffff" }}
                        className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] text-base md:text-sm"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-1.5">
                  <label htmlFor="si-email-input" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">E-mail de Acesso</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      id="si-email-input"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      style={{ fontSize: "16px", color: "#ffffff" }}
                      className="w-full h-11 pl-10 pr-4 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] text-base md:text-sm"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="pin-input" className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      {view === "signup" ? "PIN ou Senha (no mínimo 6 dígitos)" : "PIN ou Senha de Acesso"}
                    </label>
                  </div>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      id="pin-input"
                      type={showPass ? "text" : "password"}
                      required
                      value={pin}
                      onChange={(e) => setPin(e.target.value)}
                      placeholder="••••••••"
                      style={{ fontSize: "16px", color: "#ffffff" }}
                      className="w-full h-11 pl-10 pr-12 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-[#06b6d4] text-base md:text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      aria-label="Alternar visibilidade da senha"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-white"
                    >
                      {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {view === "signin" && (
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-400 hover:text-slate-200">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="rounded border-slate-800 bg-slate-950 text-[#06b6d4] focus:ring-[#06b6d4]"
                      />
                      <span>Lembrar neste dispositivo</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowReset(true)}
                      className="text-xs font-bold text-[#06b6d4] hover:underline"
                    >
                      Esqueci a senha
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  aria-label={view === "signin" ? "Entrar no Language AI" : "Cadastrar conta"}
                  className="w-full h-12 rounded-xl bg-[#06b6d4] hover:bg-cyan-600 text-slate-950 font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[44px]"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  <span>{view === "signin" ? "Entrar no Language AI" : "Criar Conta de Acesso"}</span>
                </button>
              </form>

              {/* Footer Switcher */}
              <div className="text-center text-xs text-slate-400 pt-3 border-t border-slate-800/80">
                {view === "signin" ? (
                  <span>
                    Ainda não possui uma conta?{" "}
                    <button
                      type="button"
                      onClick={() => setView("signup")}
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
                      onClick={() => setView("signin")}
                      className="font-bold text-[#06b6d4] hover:underline ml-1"
                    >
                      Fazer login
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ecosystem Drawer Toggle */}
      <div className="mt-4 text-center">
        <button
          type="button"
          onClick={() => setShowEcosystem(!showEcosystem)}
          className="text-xs text-[#06b6d4] hover:text-cyan-400 font-bold inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#06b6d4]/10 border border-[#06b6d4]/30 transition-all cursor-pointer shadow-md min-h-[44px]"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>🌐 Ecossistema Montanha (5 Apps Integrados)</span>
          {showEcosystem ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {showEcosystem && (
        <div className="mt-3 w-full max-w-[920px] p-4 rounded-2xl bg-slate-900/95 border border-[#06b6d4]/40 shadow-2xl space-y-2 animate-in fade-in">
          <div className="text-[11px] font-bold text-cyan-300 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#06b6d4]" />
            <span>Plataformas do Ecossistema Montanha</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {ECOSYSTEM_APPS.map((app) => (
              <div
                key={app.id}
                className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-all ${
                  app.isCurrent
                    ? "bg-[#06b6d4]/15 border-[#06b6d4]/50 text-white"
                    : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:border-slate-700"
                }`}
              >
                <div className="flex flex-col">
                  <span className="font-bold flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: app.accent }} />
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
  );
}
