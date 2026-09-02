import React, { useState } from "react";
import { UserSession, loginWithPin, registerWithPin, resetPin } from "@/services/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Lock,
  User,
  KeyRound,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from "lucide-react";
import { toast } from "sonner";

interface LoginScreenProps {
  onLoginSuccess: (session: UserSession) => void;
}

type Mode = "login" | "register" | "reset";

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<Mode>("login");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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

  const handleQuickDemo = async () => {
    setUsername("aluno");
    setPin("1234");
    setIsLoading(true);
    const res = await loginWithPin("aluno", "1234");
    setIsLoading(false);
    if (res.success && res.user) {
      toast.success("Logado como Aluno de Demonstração!");
      onLoginSuccess(res.user);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm space-y-5">
        {/* Logotipo e Cabeçalho */}
        <div className="text-center space-y-1.5">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md mb-1">
            <Sparkles className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-black tracking-tight text-foreground">
            Smart Language
          </h1>
          <p className="text-xs text-muted-foreground">
            Tutor de inglês com IA &bull; Separado por usuário
          </p>
        </div>

        {/* Card Principal de Autenticação */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-lg space-y-4">
          {/* Seletor de Modo: Entrar / Criar Conta / Reset */}
          <div className="grid grid-cols-3 gap-1 p-1 bg-muted rounded-xl text-center text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg("");
              }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === "login"
                  ? "bg-background text-primary shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMsg("");
              }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === "register"
                  ? "bg-background text-primary shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Criar Conta
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("reset");
                setErrorMsg("");
              }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === "reset"
                  ? "bg-background text-primary shadow-xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Resetar
            </button>
          </div>

          {/* Mensagem de Erro se houver */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs animate-in fade-in">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Nome de Exibição (apenas no Cadastro) */}
            {mode === "register" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Seu Nome
                </label>
                <Input
                  type="text"
                  placeholder="Ex: Lucas Silva"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-10 text-xs rounded-xl"
                />
              </div>
            )}

            {/* Nome de Usuário / Login */}
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground flex items-center justify-between">
                <span>Usuário</span>
                <span className="text-[10px] text-muted-foreground">Sem espaços</span>
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Ex: lucas"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/\s+/g, ""))}
                  className="pl-9 h-10 text-xs rounded-xl"
                  required
                />
              </div>
            </div>

            {/* Senha (PIN de exatamente 4 números) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-foreground flex items-center gap-1">
                  <KeyRound className="h-3.5 w-3.5 text-primary" />
                  <span>{mode === "reset" ? "Novo PIN (4 números)" : "Senha PIN"}</span>
                </label>
                <Badge
                  variant="outline"
                  className="text-[9px] bg-primary/5 text-primary border-primary/20 font-bold"
                >
                  4 números apenas
                </Badge>
              </div>

              {/* Campo numérico com indicador visual de 4 dígitos */}
              <div className="relative">
                <Input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="••••"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  className="h-11 text-center font-mono text-lg tracking-[0.6em] rounded-xl border-primary/30 focus-visible:ring-primary"
                  required
                />
              </div>

              <div className="flex justify-center gap-2 pt-1">
                {[0, 1, 2, 3].map((idx) => (
                  <span
                    key={idx}
                    className={`h-2 w-2 rounded-full transition-all ${
                      pin.length > idx ? "bg-primary scale-110" : "bg-muted-foreground/30"
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Confirmação do novo PIN no Reset */}
            {mode === "reset" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">
                  Confirmar Novo PIN (4 números)
                </label>
                <Input
                  type="password"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={4}
                  placeholder="••••"
                  value={confirmPin}
                  onChange={(e) => handleConfirmPinChange(e.target.value)}
                  className="h-11 text-center font-mono text-lg tracking-[0.6em] rounded-xl"
                  required
                />
              </div>
            )}

            {/* Botão de Envio */}
            <Button
              type="submit"
              disabled={isLoading || pin.length !== 4 || !username.trim()}
              className="w-full h-10 rounded-xl font-bold text-xs gap-2 shadow-sm"
            >
              {isLoading ? (
                <span>Processando...</span>
              ) : mode === "login" ? (
                <>
                  <span>Entrar no Smart Language</span>
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

          {/* Atalho Demo */}
          {mode === "login" && (
            <div className="pt-1 text-center">
              <button
                type="button"
                onClick={handleQuickDemo}
                className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium underline"
              >
                ⚡ Entrar rápido como Aluno Demo (PIN: 1234)
              </button>
            </div>
          )}
        </div>

        {/* Card de Transparência de Dados do Servidor */}
        <div className="rounded-xl bg-card/60 border border-border/80 p-3 text-[11px] text-muted-foreground space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-emerald-500" />
            <span>Armazenamento no Servidor</span>
          </div>
          <p className="leading-relaxed">
            Seus dados, histórico com o Leo, XP e senhas de 4 dígitos são guardados no servidor em{" "}
            <code className="bg-muted px-1 py-0.5 rounded text-[10px] text-foreground font-mono">
              data/users.json
            </code>
            , garantindo isolamento total entre cada aluno.
          </p>
        </div>
      </div>
    </div>
  );
};
