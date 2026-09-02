import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { TabType, UserProgress, WeeklyMission } from "@/types/language";
import { loadUserProgress, saveUserProgress, addXP } from "@/services/storage";
import { Header } from "@/components/Header";
import { BottomNav } from "@/components/BottomNav";
import { DailyMissionBanner } from "@/components/DailyMissionBanner";
import { ConversationTab } from "@/components/tabs/ConversationTab";
import { ScenarioTab } from "@/components/tabs/ScenarioTab";
import { AlphabetTab } from "@/components/tabs/AlphabetTab";
import { FlashcardsTab } from "@/components/tabs/FlashcardsTab";
import { BreakdownTab } from "@/components/tabs/BreakdownTab";
import { DailySprintModal } from "@/components/DailySprintModal";
import { SettingsModal } from "@/components/SettingsModal";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/")({
  component: SmartLanguageApp,
});

function SmartLanguageApp() {
  const [activeTab, setActiveTab] = useState<TabType>("conversa");
  const [progress, setProgress] = useState<UserProgress>(loadUserProgress());
  const [selectedMission, setSelectedMission] = useState<WeeklyMission | null>(null);
  const [isDailySprintOpen, setIsDailySprintOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showSessionStarter, setShowSessionStarter] = useState(true);

  useEffect(() => {
    // Carrega progresso persistido ao inicializar
    const current = loadUserProgress();
    setProgress(current);
  }, []);

  const handleUpdateProgress = (updated: UserProgress) => {
    setProgress(updated);
    saveUserProgress(updated);
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
    setShowSessionStarter(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans select-none antialiased">
      {/* Barra de Notificações Toast */}
      <Toaster position="top-center" richColors />

      {/* Cabeçalho com Streak, XP e Desafio 5 min */}
      <Header
        progress={progress}
        onOpenDailySprint={() => setIsDailySprintOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* BANNER DA SESSÃO INICIAL: SITUAÇÃO REAL DO DIA (3 SEMANAS PROGRESSIVAS) */}
      {showSessionStarter && activeTab === "conversa" && (
        <div className="relative">
          <DailyMissionBanner
            progress={progress}
            onStartMission={handleStartMission}
            onUpdateProgress={handleUpdateProgress}
          />
          <div className="text-center pb-1">
            <button
              onClick={() => setShowSessionStarter(false)}
              className="text-[10px] text-muted-foreground hover:underline font-medium"
            >
              Ocultar situação inicial e ir direto para o chat livre &darr;
            </button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal com as 5 Abas */}
      <main className="flex-1 pb-16 overflow-hidden flex flex-col">
        {activeTab === "conversa" && (
          <ConversationTab
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
          />
        )}
        {activeTab === "cenario" && (
          <ScenarioTab
            progress={progress}
            onUpdateProgress={handleUpdateProgress}
            selectedMission={selectedMission}
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

      {/* Navegação Inferior de 5 Abas (feita para celular) */}
      <BottomNav activeTab={activeTab} onChangeTab={setActiveTab} />

      {/* Modal: Treino Diário de 5 Minutos (Leitura, Audição e Fala) */}
      <DailySprintModal
        open={isDailySprintOpen}
        onOpenChange={setIsDailySprintOpen}
        audioSpeed={progress.audioSpeed}
        onSprintComplete={handleDailySprintComplete}
      />

      {/* Modal: Configurações (Voz, Velocidade, IA e Chave API) */}
      <SettingsModal
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        progress={progress}
        onUpdateProgress={handleUpdateProgress}
      />
    </div>
  );
}
