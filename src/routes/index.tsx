import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { TabType, UserProgress, WeeklyMission } from "@/types/language";
import { loadUserProgress, saveUserProgress, addXP } from "@/services/storage";
import {
  UserSession,
  getCurrentSession,
  setCurrentSession,
  syncUserDataWithServer,
} from "@/services/auth";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { LoginScreen } from "@/components/LoginScreen";
import { ActivityTimelineModal } from "@/components/ActivityTimelineModal";
import { PwaInstallPrompt } from "@/components/PwaInstallPrompt";
import { ConversationTab } from "@/components/tabs/ConversationTab";
import { ScenarioTab } from "@/components/tabs/ScenarioTab";
import { AlphabetTab } from "@/components/tabs/AlphabetTab";
import { FlashcardsTab } from "@/components/tabs/FlashcardsTab";
import { BreakdownTab } from "@/components/tabs/BreakdownTab";
import { DailySprintModal } from "@/components/DailySprintModal";
import { SettingsModal } from "@/components/SettingsModal";
import { LanguageSelectorModal } from "@/components/LanguageSelectorModal";
import { VoiceCallModal } from "@/components/VoiceCallModal";
import { TravelPackModal } from "@/components/TravelPackModal";
import { StreetTalkModal } from "@/components/StreetTalkModal";
import { PlacementTestModal } from "@/components/PlacementTestModal";
import { SmartScratchpadModal } from "@/components/SmartScratchpadModal";
import { getDefaultTutorForLanguage } from "@/data/tutors";
import { LanguageDefinition } from "@/types/language";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  ssr: false,
  component: SmartLanguageApp,
});

function SmartLanguageApp() {
  const [session, setSession] = useState<UserSession | null>(() => getCurrentSession());
  const [activeTab, setActiveTab] = useState<TabType>("conversa");
  const [progress, setProgress] = useState<UserProgress>(() => {
    const s = getCurrentSession();
    if (s && s.progress) return s.progress;
    return loadUserProgress();
  });
  const [selectedMission, setSelectedMission] = useState<WeeklyMission | null>(null);
  const [isDailySprintOpen, setIsDailySprintOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isTimelineOpen, setIsTimelineOpen] = useState(false);
  const [isVoiceCallOpen, setIsVoiceCallOpen] = useState(false);
  const [isTravelPackOpen, setIsTravelPackOpen] = useState(false);
  const [isStreetTalkOpen, setIsStreetTalkOpen] = useState(false);
  const [isPlacementTestOpen, setIsPlacementTestOpen] = useState(false);
  const [isScratchpadOpen, setIsScratchpadOpen] = useState(false);

  const handleSelectLanguage = (lang: LanguageDefinition) => {
    const defaultTutor = getDefaultTutorForLanguage(lang.id);
    const updated: UserProgress = {
      ...progress,
      selectedLanguage: lang.id,
      selectedTutorId: defaultTutor.id,
    };
    handleUpdateProgress(updated);
    toast.success(`Idioma alterado para ${lang.name} (${lang.flag}) com ${defaultTutor.name}!`);
  };

  useEffect(() => {
    const s = getCurrentSession();
    if (s) {
      setSession(s);
      if (s.progress) setProgress(s.progress);
    }

    // Fecha a tela inicial de carregamento nativa com transição suave
    const splash = document.getElementById("smart-app-splash");
    if (splash) {
      splash.classList.add("splash-dismissed");
      setTimeout(() => {
        if (splash.parentNode) {
          splash.parentNode.removeChild(splash);
        }
      }, 350);
    }
  }, []);

  // Aplica o tamanho global da fonte no elemento <html> para todo o projeto
  useEffect(() => {
    const size =
      progress.fontSize ||
      (typeof window !== "undefined" ? localStorage.getItem("smart_language_fontsize") : null) ||
      "md";
    document.documentElement.setAttribute("data-font-size", size);
    if (typeof window !== "undefined") {
      localStorage.setItem("smart_language_fontsize", size);
    }
  }, [progress.fontSize]);

  // Aplica o tema de design no elemento <html> para todo o app
  useEffect(() => {
    const design =
      progress.design ||
      (typeof window !== "undefined"
        ? (localStorage.getItem("smart_language_design") as "classic" | "midnight" | "focus")
        : null) ||
      "classic";
    document.documentElement.setAttribute("data-design", design);
    if (design === "midnight") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("smart_language_design", design);
    }
  }, [progress.design]);

  const handleLoginSuccess = (newSession: UserSession) => {
    setSession(newSession);
    setProgress(newSession.progress);
    saveUserProgress(newSession.progress);
  };

  const handleLogout = () => {
    if (confirm("Deseja sair da conta e trocar de usuário?")) {
      setCurrentSession(null);
      setSession(null);
      toast.info("Você saiu da conta.");
    }
  };

  const handleUpdateProgress = (updated: UserProgress) => {
    setProgress(updated);
    saveUserProgress(updated);
    if (session) {
      syncUserDataWithServer(session.username, updated);
    }
  };

  const handleDailySprintComplete = () => {
    const updated = addXP(50);
    const completedState: UserProgress = {
      ...updated,
      dailySprintDone: true,
    };
    handleUpdateProgress(completedState);
  };

  const handleStartMission = (mission: WeeklyMission) => {
    setSelectedMission(mission);
    setActiveTab("cenario");
  };

  // Se não estiver logado, exibe a tela de login e cadastro com senha de 4 números
  if (!session) {
    return (
      <div className="min-h-screen bg-background text-foreground font-sans">
        <Toaster position="top-center" richColors />
        <LoginScreen onLoginSuccess={handleLoginSuccess} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans select-none antialiased">
      {/* Barra de Notificações Toast */}
      <Toaster position="top-center" richColors />

      {/* Cabeçalho limpo com Nome do Usuário, Streak, XP, Configurações e Logout */}
      <Header
        progress={progress}
        userName={session.displayName}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onLogout={handleLogout}
        onOpenLanguageSelector={() => setIsLanguageModalOpen(true)}
        onOpenTimeline={() => setIsTimelineOpen(true)}
      />

      {/* Conteúdo Principal com as 5 Abas */}
      <main className="flex-1 pb-16 overflow-hidden flex flex-col">
        {activeTab === "conversa" && (
          <ConversationTab
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            onOpenVoiceCall={() => setIsVoiceCallOpen(true)}
            onOpenStreetTalk={() => setIsStreetTalkOpen(true)}
          />
        )}
        {activeTab === "cenario" && (
          <ScenarioTab
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            selectedMission={selectedMission}
            onOpenTravelPack={() => setIsTravelPackOpen(true)}
            onOpenPlacementTest={() => setIsPlacementTestOpen(true)}
          />
        )}
        {activeTab === "alfabeto" && (
          <AlphabetTab
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
          />
        )}
        {activeTab === "cartoes" && (
          <FlashcardsTab
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
          />
        )}
        {activeTab === "destrinchar" && (
          <BreakdownTab
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
          />
        )}
      </main>

      {/* Navegação Inferior de Abas + Treino 5 min (feita para celular) */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenDailySprint={() => setIsDailySprintOpen(true)}
        dailySprintDone={progress.dailySprintDone}
      />

      {/* Modal: Treino Diário de 5 Minutos (Leitura, Audição e Fala) */}
      <DailySprintModal
        open={isDailySprintOpen}
        onOpenChange={setIsDailySprintOpen}
        audioSpeed={progress.audioSpeed}
        onSprintComplete={handleDailySprintComplete}
        language={progress.selectedLanguage || "en"}
      />

      {/* Modal: Configurações (Voz, Velocidade, IA e Chave API) */}
      <SettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        progress={progress}
        onUpdateProgress={handleUpdateProgress}
      />

      {/* Modal: Escolha do Idioma de Estudo */}
      <LanguageSelectorModal
        open={isLanguageModalOpen}
        onOpenChange={setIsLanguageModalOpen}
        selectedLanguageId={progress.selectedLanguage || "en"}
        onSelectLanguage={handleSelectLanguage}
      />

      {/* Modal: Linha do Tempo de Aprendizado (ReUI Timeline) */}
      <ActivityTimelineModal
        open={isTimelineOpen}
        onOpenChange={setIsTimelineOpen}
        progress={progress}
      />

      {/* Modal: Chamada de Voz com Tutor (Hands-free AI Call) */}
      <VoiceCallModal
        open={isVoiceCallOpen}
        onOpenChange={setIsVoiceCallOpen}
        progress={progress}
        onUpdateProgress={handleUpdateProgress}
      />

      {/* Modal: Pacote de Sobrevivência para Viagem Offline */}
      <TravelPackModal
        open={isTravelPackOpen}
        onOpenChange={setIsTravelPackOpen}
        language={progress.selectedLanguage || "en"}
      />

      {/* Modal: Street Talk & Gírias do Cotidiano */}
      <StreetTalkModal
        open={isStreetTalkOpen}
        onOpenChange={setIsStreetTalkOpen}
        language={progress.selectedLanguage || "en"}
        onRewardXp={(amount: number) => {
          const updated = addXP(amount);
          handleUpdateProgress(updated);
        }}
      />

      {/* Modal: Simulado Relâmpago de Nivelamento CEFR */}
      <PlacementTestModal
        open={isPlacementTestOpen}
        onOpenChange={setIsPlacementTestOpen}
        language={progress.selectedLanguage || "en"}
        currentCefrLevel={progress.cefrLevel}
        onCompletePlacement={(level: string, earnedXp: number) => {
          const updated = addXP(earnedXp);
          const withCefr: UserProgress = {
            ...updated,
            cefrLevel: level,
          };
          handleUpdateProgress(withCefr);
        }}
      />

      {/* Modal: Prancheta Inteligente — Análise Livre Local-First */}
      <SmartScratchpadModal
        open={isScratchpadOpen}
        onOpenChange={setIsScratchpadOpen}
        progress={progress}
        onUpdateProgress={handleUpdateProgress}
        onOpenBreakdown={(text) => {
          setIsScratchpadOpen(false);
          setActiveTab("destrinchar");
          // The BreakdownTab will pick up the text via its own input on next render
          // We just navigate to the tab; user can paste/use the text there
          setTimeout(() => {
            const evt = new CustomEvent("smart-language-breakdown", { detail: { text } });
            window.dispatchEvent(evt);
          }, 150);
        }}
      />

      {/* Banner / Prompt de Instalação PWA para Celular */}
      <PwaInstallPrompt />
    </div>
  );
}
