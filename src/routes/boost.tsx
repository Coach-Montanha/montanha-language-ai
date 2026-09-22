import React, { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Zap,
  Flame,
  Volume2,
  Mic,
  Activity,
  Headphones,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Target,
  BrainCircuit
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export const Route = createFileRoute('/boost')({
  component: BoostPage,
});

const SPRINT_CHALLENGES = [
  {
    title: 'Sprint 180s — Shadowing Fluency',
    time: '3 min',
    target: 'Fluência Oral',
    description: 'Repita imediatamente após o áudio em velocidade nativa sem pausar para desenvolver automatismo neural.',
    level: 'Todos os Níveis'
  },
  {
    title: 'Sprint 120s — Quick Vocabulary Recall',
    time: '2 min',
    target: 'Vocabulário Ativo',
    description: 'Responda com o sinônimo ou tradução em menos de 3 segundos por palavra antes do tempo expirar.',
    level: 'Intermediário'
  },
  {
    title: 'Sprint 300s — AI Situational Roleplay',
    time: '5 min',
    target: 'Imersão Conversacional',
    description: 'Resolva um problema simulado com a IA (ex: voo cancelado ou devolução em loja) em tempo real.',
    level: 'Avançado'
  }
];

function BoostPage() {
  const [activeSprint, setActiveSprint] = useState<number | null>(null);

  const startSprint = (index: number) => {
    const item = SPRINT_CHALLENGES[index];
    if (item) {
      setActiveSprint(index);
      toast.success(`Iniciando ${item.title}! Prepare o microfone e foco total.`);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-6 md:p-10 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-indigo-500/50 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider px-3 py-1">
              <Zap className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Acelerador de Fluência
            </Badge>
            <Badge variant="outline" className="border-purple-500/50 bg-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-wider px-3 py-1">
              <BrainCircuit className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
              Treinos de Alta Densidade Neural
            </Badge>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                Fluency <span className="text-indigo-400">Booster</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed mt-1">
                Acelere sua fala e compreensão auditiva com micro-sprints cronometrados de 3 a 5 minutos,
                correção fonética em tempo real e imersão ativa.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-xs font-bold">
                <Link to="/eco">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Hub Ecossistema
                </Link>
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">
                <Link to="/create">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                  Criar Lições Personalizadas
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Sprints Section */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-indigo-400" />
            Micro-Sprints Diários de 3 a 5 Minutos
          </h2>
          <p className="text-xs text-muted-foreground">
            Desafios intensos para desbloquear a fala rápida sem tradução mental.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {SPRINT_CHALLENGES.map((challenge, idx) => (
            <Card key={idx} className="p-6 border-slate-800 bg-card/70 backdrop-blur-md space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Badge variant="outline" className="border-indigo-500/40 text-indigo-300 text-[10px]">
                    <Clock className="w-3 h-3 mr-1" /> {challenge.time}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground font-semibold">{challenge.level}</span>
                </div>

                <h3 className="font-extrabold text-base text-white">{challenge.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {challenge.description}
                </p>

                <div className="pt-1">
                  <span className="text-[10px] font-bold text-purple-300 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
                    Foco: {challenge.target}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => startSprint(idx)}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white text-xs font-bold"
                >
                  <Zap className="w-3.5 h-3.5 mr-1.5" /> Começar Sprint
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Neural AI Modules Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6 border-slate-800 bg-card/70 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Volume2 className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="font-extrabold text-base text-white">Ruflo Accent &amp; Phonetics AI</h3>
              <p className="text-xs text-muted-foreground">Análise de ritmo, prosódia e sotaque</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200">1. Redução de 'Uhhs' e Hesitação</span>
              <p className="text-muted-foreground">O tutor mede suas pausas e propõe conectivos naturais (well, actually, you see).</p>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
              <span className="font-bold text-slate-200">2. Conexões de Sons (Connected Speech)</span>
              <p className="text-muted-foreground">Aprenda a falar "what are you doing" como "whatcha doin" com naturalidade nativa.</p>
            </div>
          </div>

          <Button asChild className="w-full bg-slate-900 border border-indigo-500/40 hover:bg-indigo-500/10 text-indigo-300 font-bold text-xs">
            <Link to="/">
              <Mic className="w-3.5 h-3.5 mr-1.5" /> Praticar no Tutor Conversacional
            </Link>
          </Button>
        </Card>

        <Card className="p-6 border-slate-800 bg-card/70 backdrop-blur-md space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Target className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="font-extrabold text-base text-white">Métricas de Vocabulário Ativo vs Passivo</h3>
              <p className="text-xs text-muted-foreground">Transforme palavras que você só reconhece em palavras que você fala</p>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="font-bold text-slate-300">Vocabulário Passivo (Leitura / Compreensão)</span>
              <span className="font-mono font-bold text-indigo-400 text-sm">~ 3.200 palavras</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-900/80 border border-slate-800">
              <span className="font-bold text-slate-300">Vocabulário Ativo (Fala Espontânea)</span>
              <span className="font-mono font-bold text-emerald-400 text-sm">~ 1.150 palavras</span>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
              <span className="font-bold text-emerald-300 block mb-1">Meta do Mês:</span>
              <p className="text-slate-300 text-[11px]">Ativar 150 novos termos técnicos e expressões idiomáticas na conversação oral.</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

export default BoostPage;
