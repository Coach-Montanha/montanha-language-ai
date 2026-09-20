import React, { useState } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import {
  Sparkles,
  BookOpen,
  MessageSquare,
  Globe,
  Plus,
  ArrowLeft,
  ArrowRight,
  Headphones,
  CheckCircle2,
  Copy,
  Layers,
  Flame
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export const Route = createFileRoute('/create')({
  component: CreateStudioPage,
});

const SITUATIONAL_PRESETS = [
  {
    topic: 'Na Academia (At the Gym)',
    language: 'Inglês',
    level: 'Intermediário',
    dialogue: 'A: Could you spot me on this bench press set?\nB: Sure, how many reps are you going for?\nA: Aiming for eight. If I struggle on the last one, just give a light assist.\nB: Got it. Ready when you are!',
    vocab: ['Bench press', 'Spot me', 'Reps (repetitions)', 'Assist']
  },
  {
    topic: 'Reunião de Negócios (Business Meeting)',
    language: 'Inglês',
    level: 'Avançado',
    dialogue: 'A: Let’s pivot to our Q3 financial deliverables.\nB: Our customer acquisition cost dropped by 18% after implementing the new onboarding flow.\nA: That’s a compelling metric. Let’s scale the rollout next week.',
    vocab: ['Pivot', 'Deliverables', 'Customer acquisition cost', 'Compelling metric']
  },
  {
    topic: 'Café em Paris (Au Café)',
    language: 'Francês',
    level: 'Básico',
    dialogue: 'A: Bonjour ! Je voudrais un café au lait et un croissant s’il vous plaît.\nB: Très bien monsieur. Sur place ou à emporter ?\nA: Sur place, merci !',
    vocab: ['Café au lait', 'S’il vous plaît', 'Sur place', 'À emporter']
  },
  {
    topic: 'Aeroporto e Check-in (At the Airport)',
    language: 'Espanhol',
    level: 'Básico / Intermediário',
    dialogue: 'A: Buenas tardes, aquí está mi pasaporte para el vuelo a Madrid.\nB: Gracias. ¿Lleva equipaje de mano o va a facturar maletas?\nA: Solo esta maleta de mano. ¿A qué puerta debo dirigirme?\nB: Puerta B14. ¡Buen viaje!',
    vocab: ['Pasaporte', 'Vuelo', 'Equipaje de mano', 'Facturar maletas', 'Puerta de embarque']
  }
];

function CreateStudioPage() {
  const [customTopic, setCustomTopic] = useState('');
  const [customLanguage, setCustomLanguage] = useState('Inglês');
  const [customLevel, setCustomLevel] = useState('Intermediário');

  const copyText = (txt: string) => {
    navigator.clipboard.writeText(txt);
    toast.success('Conteúdo copiado para a área de transferência!');
  };

  const handleGenerateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTopic) {
      toast.error('Informe um tema ou situação.');
      return;
    }
    toast.success(`Lição sobre "${customTopic}" em ${customLanguage} pronta!`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/40 p-6 md:p-10 shadow-2xl backdrop-blur-xl">
        <div className="relative z-10 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="border-indigo-500/50 bg-indigo-500/10 text-indigo-300 text-xs font-bold uppercase tracking-wider px-3 py-1">
              <Sparkles className="w-3.5 h-3.5 mr-1.5 text-indigo-400" />
              Estúdio de Criação com IA
            </Badge>
            <Badge variant="outline" className="border-purple-500/50 bg-purple-500/10 text-purple-300 text-xs font-bold uppercase tracking-wider px-3 py-1">
              <BookOpen className="w-3.5 h-3.5 mr-1.5 text-purple-400" />
              Diálogos, Flashcards &amp; Microtreinos
            </Badge>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tight text-white">
                Criação de <span className="text-indigo-400">Lições &amp; Diálogos</span>
              </h1>
              <p className="text-sm md:text-base text-muted-foreground max-w-2xl leading-relaxed mt-1">
                Gere diálogos situacionais hiper-realistas, listas de vocabulário ativo e flashcards
                com pronúncia para imersão fluida.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline" className="border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/10 text-xs font-bold">
                <Link to="/eco">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  Hub Ecossistema
                </Link>
              </Button>
              <Button asChild variant="outline" className="border-indigo-500/40 hover:bg-indigo-500/10 text-indigo-300 text-xs font-bold">
                <Link to="/boost">Acelerador</Link>
              </Button>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold">
                <Link to="/">
                  Abrir Tutor IA <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Creation Form */}
      <Card className="p-6 border-slate-800 bg-card/70 backdrop-blur-md space-y-4">
        <div className="border-b border-slate-800 pb-3">
          <h3 className="font-extrabold text-base text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Gerador Sob Medida de Diálogos Situacionais
          </h3>
          <p className="text-xs text-muted-foreground">Escolha o tema, idioma e nível para criar uma lição contextual instantânea</p>
        </div>

        <form onSubmit={handleGenerateCustom} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="space-y-1.5">
            <Label htmlFor="topic" className="text-xs font-bold">Tema / Cenário</Label>
            <Input
              id="topic"
              placeholder="Ex: Entrevista de Emprego Tech"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              className="bg-slate-900 border-slate-800"
              required
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="lang" className="text-xs font-bold">Idioma Alvo</Label>
            <select
              id="lang"
              value={customLanguage}
              onChange={(e) => setCustomLanguage(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-bold"
            >
              <option value="Inglês">🇺🇸 Inglês</option>
              <option value="Espanhol">🇪🇸 Espanhol</option>
              <option value="Francês">🇫🇷 Francês</option>
              <option value="Italiano">🇮🇹 Italiano</option>
              <option value="Alemão">🇩🇪 Alemão</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="level" className="text-xs font-bold">Nível de Dificuldade</Label>
            <select
              id="level"
              value={customLevel}
              onChange={(e) => setCustomLevel(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-white outline-none focus:border-indigo-500 font-bold"
            >
              <option value="Iniciante">Iniciante (A1-A2)</option>
              <option value="Intermediário">Intermediário (B1-B2)</option>
              <option value="Avançado">Avançado / Fluente (C1-C2)</option>
            </select>
          </div>

          <div className="sm:col-span-3 flex justify-end">
            <Button type="submit" className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 text-white font-bold">
              <Sparkles className="w-4 h-4 mr-1.5" /> Criar Lição com IA
            </Button>
          </div>
        </form>
      </Card>

      {/* Situational Presets Grid */}
      <div className="space-y-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <Layers className="w-6 h-6 text-indigo-400" />
            Modelos de Situações Reais Pré-Configurados
          </h2>
          <p className="text-xs text-muted-foreground">
            Copie ou pratique diálogos com o tutor inteligente do Montanha Language AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {SITUATIONAL_PRESETS.map((item, idx) => (
            <Card key={idx} className="p-6 border-slate-800 bg-card/70 backdrop-blur-md space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/30 px-2.5 py-0.5 rounded-full">
                    {item.language} • {item.level}
                  </span>
                  <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">
                    Situacional
                  </Badge>
                </div>

                <h3 className="font-extrabold text-base text-white">{item.topic}</h3>

                <pre className="text-xs text-slate-200 bg-slate-950/80 p-3 rounded-xl border border-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                  {item.dialogue}
                </pre>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.vocab.map((v, vIdx) => (
                    <span key={vIdx} className="text-[10px] font-mono bg-slate-900 border border-slate-800 text-purple-300 px-2 py-0.5 rounded">
                      {v}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={() => copyText(`${item.topic}\n\n${item.dialogue}\n\nVocabulário:\n- ${item.vocab.join('\n- ')}`)}
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold border-slate-700 hover:border-indigo-500/50 hover:bg-indigo-500/10"
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" /> Copiar Diálogo &amp; Vocabulário
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CreateStudioPage;
