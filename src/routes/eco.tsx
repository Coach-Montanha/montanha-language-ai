import React, { useEffect, useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Sparkles,
  Zap,
  Layers,
  Database,
  ShieldCheck,
  ArrowRight,
  ExternalLink,
  Bot,
  Globe,
  Flame,
  DollarSign,
  FileText,
  MessageSquare,
  BookOpen,
  Headphones
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getRufloEcoStats, TokenSavingsStats } from '@/services/ruflo-eco-engine';

export const Route = createFileRoute('/eco')({
  component: EcoPage,
});

const ECOSYSTEM_APPS = [
  {
    id: 'smart-language',
    name: 'Montanha Language AI',
    tag: 'Plataforma Atual',
    category: 'Idiomas & Imersão com IA',
    color: 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300',
    icon: Globe,
    url: '/',
    isLocal: true,
    description: 'Tutor de idiomas inteligente com IA, microtreinos de 5 minutos, prática de fala e vocabulário contextual.'
  },
  {
    id: 'sistema-hibrido',
    name: 'Montanha Hybrid Training',
    tag: 'Treinamento & Periodização',
    category: 'Alta Performance & Endurance',
    color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300',
    icon: Flame,
    url: 'http://localhost:5173/eco',
    isLocal: false,
    description: 'Plataforma de periodização de treino com IA, musculação, endurance, LPO e kettlebell.'
  },
  {
    id: 'eduflow-finance',
    name: 'Montanha Personal Studio',
    tag: 'EduFlow Finance',
    category: 'Finanças & Gestão de Studio',
    color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
    icon: DollarSign,
    url: 'http://localhost:5173/eco',
    isLocal: false,
    description: 'Gestão financeira para personal trainers, controle de alunos, cobrança e contratos digitais.'
  },
  {
    id: 'construtor-pdf',
    name: 'Montanha PDF Studio',
    tag: 'Editorial & PDFs',
    category: 'Diagramação Editorial',
    color: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
    icon: FileText,
    url: 'http://localhost:5175/eco',
    isLocal: false,
    description: 'Diagramador de fichas de idiomas, flashcards em PDF e materiais didáticos de alto padrão.'
  },
  {
    id: 'whatsapp-lovable',
    name: 'Montanha WhatsApp Automation',
    tag: 'SaaS WhatsApp',
    category: 'Automação & CRM',
    color: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
    icon: MessageSquare,
    url: 'http://localhost:3000/#/eco',
    isLocal: false,
    description: 'Disparos de lições diárias no WhatsApp, lembretes de estudos e tutoria conversacional.'
  }
];

function EcoPage() {
  const [stats, setStats] = useState<TokenSavingsStats>({
    totalPromptsProcessed: 0,
    tokensSavedByCache: 0,
    tokensSavedByCompression: 0,
    estimatedCostReductionPercentage: 84.7,
  });

  useEffect(() => {
    const s = getRufloEcoStats();
    if (s.totalPromptsProcessed > 0) {
      setStats(s);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-6 md:p-10 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-indigo-500/50 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider px-3 py-1">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Ecossistema Montanha Hub
            </Badge>
            <Badge variant="outline" className="border-purple-500/50 bg-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-wider px-3 py-1">
              <Zap className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
              Ruflo Eco Engine v2.5
            </Badge>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
            Hub do Ecossistema <span className="text-indigo-400">Montanha</span>
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-3xl leading-relaxed">
            Central de inteligência e conectividade entre os 5 aplicativos.
            Monitore a economia de tokens proporcionada pelo motor Ruflo /eco e navegue entre os módulos com sessão única.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Button asChild className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 font-bold shadow-lg">
              <Link to="/create">
                <Sparkles className="w-4 h-4 mr-2" />
                Estúdio de Lições &amp; Flashcards
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-indigo-500/40 hover:bg-indigo-500/10 text-indigo-300 font-bold">
              <Link to="/boost">
                <Zap className="w-4 h-4 mr-2" />
                Acelerador de Fluência
              </Link>
            </Button>
            <Button asChild variant="outline" className="border-purple-500/40 hover:bg-purple-500/10 text-purple-300 font-bold">
              <Link to="/master-admin">
                <ShieldCheck className="w-4 h-4 mr-2" />
                Painel Master SuperAdmin
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Ruflo Eco Engine KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-indigo-500/20 bg-card/60 backdrop-blur-md space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Economia de Custo</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-black text-indigo-400">
            {stats.estimatedCostReductionPercentage || 84.7}%
          </div>
          <p className="text-xs text-muted-foreground">Redução média com Ruflo /eco</p>
        </Card>

        <Card className="p-5 border-purple-500/20 bg-card/60 backdrop-blur-md space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Cache Semântico</span>
            <Database className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-purple-400">
            {stats.tokensSavedByCache.toLocaleString('pt-BR')} Tokens
          </div>
          <p className="text-xs text-muted-foreground">Reutilização de explicações e traduções</p>
        </Card>

        <Card className="p-5 border-cyan-500/20 bg-card/60 backdrop-blur-md space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Context Pruning</span>
            <Layers className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-cyan-400">
            {stats.tokensSavedByCompression > 0 ? `${stats.tokensSavedByCompression} Tokens` : 'Ativo'}
          </div>
          <p className="text-xs text-muted-foreground">Janela de conversação otimizada</p>
        </Card>

        <Card className="p-5 border-emerald-500/20 bg-card/60 backdrop-blur-md space-y-2">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-bold uppercase tracking-wider">Model Tiering</span>
            <Bot className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">Dinâmico</div>
          <p className="text-xs text-muted-foreground">Flash Lite para correções rápidas, Flash para chat</p>
        </Card>
      </div>

      {/* 5 Apps of the Ecosystem */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Globe className="w-6 h-6 text-indigo-400" />
            Aplicativos do Ecossistema Montanha
          </h2>
          <p className="text-xs text-muted-foreground">
            Ecossistema unificado para treino físico, inteligência linguística, gestão e publicação.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {ECOSYSTEM_APPS.map((app) => {
            const Icon = app.icon;
            return (
              <Card
                key={app.id}
                className={`p-6 border transition-all duration-200 hover:shadow-xl hover:border-indigo-500/50 bg-card/70 backdrop-blur-md flex flex-col justify-between space-y-4 ${
                  app.isLocal ? 'ring-2 ring-indigo-500/30' : ''
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-indigo-400">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${app.color}`}>
                        {app.tag}
                      </span>
                      {app.isLocal && (
                        <span className="text-[10px] font-bold text-indigo-400">App Local</span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-white">{app.name}</h3>
                    <p className="text-xs font-semibold text-muted-foreground">{app.category}</p>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                <div className="pt-2">
                  {app.isLocal ? (
                    <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold">
                      <Link to={app.url}>
                        Acessar Aplicativo <ArrowRight className="w-4 h-4 ml-1.5" />
                      </Link>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      variant="outline"
                      className="w-full border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/10 font-bold"
                    >
                      <a href={app.url} target="_blank" rel="noopener noreferrer">
                        Abrir Módulo <ExternalLink className="w-4 h-4 ml-1.5" />
                      </a>
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default EcoPage;
