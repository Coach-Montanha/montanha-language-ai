import React, { useState, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Users,
  Key,
  Calendar,
  Search,
  Filter,
  RefreshCw,
  Plus,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  Building2,
  Lock,
  Unlock,
  Check,
  X,
  ShieldAlert
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import {
  validateEmailMx,
  checkAndLockGuestDemo,
  verifyOtpToken,
  sendOtpToken,
  checkProjectAccess,
  EcosystemSubscription
} from '../services/ecosystem-auth-service';

export interface EcosystemApp {
  id: string;
  name: string;
  badge: string;
  color: string;
}

export const ECOSYSTEM_APPS: EcosystemApp[] = [
  { id: 'smart-language', name: 'Smart Language', badge: 'Idiomas IA', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' },
  { id: 'eduflow-finance', name: 'EduFlow Finance', badge: 'Finanças Studio', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { id: 'construtor-pdf', name: 'Construtor de PDFs do Montanha', badge: 'PDF & Editorial', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'sistema-hibrido', name: 'Sistema Híbrido de Treinamento', badge: 'Treinamento', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { id: 'whatsapp-lovable', name: 'Montanha WhatsApp Automation', badge: 'SaaS WhatsApp', color: 'bg-purple-500/20 text-purple-300 border-purple-500/40' }
];

export const MasterAdminDashboard: React.FC = () => {
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [subscriptions, setSubscriptions] = useState<EcosystemSubscription[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // New Client Subscription Form State
  const [newEmail, setNewEmail] = useState<string>('');
  const [newProjectId, setNewProjectId] = useState<string>('smart-language');
  const [newPaymentStatus, setNewPaymentStatus] = useState<'PAGO' | 'PENDENTE' | 'INADIMPLENTE' | 'CANCELADO'>('PAGO');
  const [newExpiresAt, setNewExpiresAt] = useState<string>('');

  const MOCK_SUBSCRIPTIONS: EcosystemSubscription[] = [
    {
      id: 'sub_1',
      email: 'cliente.pro@montanha.app',
      project_id: 'smart-language',
      payment_status: 'PAGO',
      access_expires_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString(),
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'sub_2',
      email: 'studio.fit@eduflow.com',
      project_id: 'eduflow-finance',
      payment_status: 'PAGO',
      access_expires_at: new Date(Date.now() + 90 * 24 * 3600 * 1000).toISOString(),
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'sub_3',
      email: 'editor.pdf@montanha.com',
      project_id: 'construtor-pdf',
      payment_status: 'PENDENTE',
      access_expires_at: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
      is_active: true,
      created_at: new Date().toISOString()
    },
    {
      id: 'sub_4',
      email: 'coach.treino@hibrido.com',
      project_id: 'sistema-hibrido',
      payment_status: 'INADIMPLENTE',
      access_expires_at: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
      is_active: false,
      created_at: new Date().toISOString()
    },
    {
      id: 'sub_5',
      email: 'marketing.wa@lovable.app',
      project_id: 'whatsapp-lovable',
      payment_status: 'PAGO',
      access_expires_at: new Date(Date.now() + 180 * 24 * 3600 * 1000).toISOString(),
      is_active: true,
      created_at: new Date().toISOString()
    }
  ];

  const fetchSubscriptions = async () => {
    setLoading(true);
    let loaded: EcosystemSubscription[] = [];

    try {
      const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
      const procEnv = (typeof process !== 'undefined' && process.env) ? process.env : {};

      const url = env['VITE_SUPABASE_URL'] || procEnv['SUPABASE_URL'];
      const key = env['VITE_SUPABASE_ANON_KEY'] || env['VITE_SUPABASE_PUBLISHABLE_KEY'] || procEnv['SUPABASE_ANON_KEY'] || procEnv['SUPABASE_PUBLISHABLE_KEY'];

      if (url && key) {
        const supabase = createClient(url, key);
        const { data, error } = await supabase.from('ecosystem_subscriptions').select('*').order('created_at', { ascending: false });
        if (!error && data && data.length > 0) {
          loaded = data as EcosystemSubscription[];
        }
      }
    } catch (err) {
      console.warn('[MasterAdmin] Could not fetch from Supabase:', err);
    }

    if (loaded.length === 0) {
      const saved = localStorage.getItem('master_admin_subscriptions');
      if (saved) {
        try {
          loaded = JSON.parse(saved);
        } catch (e) {}
      } else {
        loaded = MOCK_SUBSCRIPTIONS;
        localStorage.setItem('master_admin_subscriptions', JSON.stringify(MOCK_SUBSCRIPTIONS));
      }
    }

    setSubscriptions(loaded);
    setLoading(false);
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const saveSubscriptions = async (updated: EcosystemSubscription[]) => {
    setSubscriptions(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('master_admin_subscriptions', JSON.stringify(updated));
    }

    try {
      const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
      const procEnv = (typeof process !== 'undefined' && process.env) ? process.env : {};

      const url = env['VITE_SUPABASE_URL'] || procEnv['SUPABASE_URL'];
      const key = env['VITE_SUPABASE_ANON_KEY'] || env['VITE_SUPABASE_PUBLISHABLE_KEY'] || procEnv['SUPABASE_ANON_KEY'] || procEnv['SUPABASE_PUBLISHABLE_KEY'];

      if (url && key) {
        const supabase = createClient(url, key);
        await supabase.from('ecosystem_subscriptions').upsert(updated);
      }
    } catch (err) {
      console.warn('[MasterAdmin] Supabase sync failed:', err);
    }
  };

  const handleStatusChange = (id: string, newStatus: 'PAGO' | 'PENDENTE' | 'INADIMPLENTE' | 'CANCELADO') => {
    const updated = subscriptions.map((sub) => (sub.id === id ? { ...sub, payment_status: newStatus } : sub));
    saveSubscriptions(updated);
    notify('success', `Status de pagamento alterado para ${newStatus}`);
  };

  const handleExpirationChange = (id: string, newDateStr: string) => {
    const expiresAt = newDateStr ? new Date(newDateStr).toISOString() : null;
    const updated = subscriptions.map((sub) => (sub.id === id ? { ...sub, access_expires_at: expiresAt } : sub));
    saveSubscriptions(updated);
    notify('success', 'Validade de acesso atualizada!');
  };

  const handleAddDays = (id: string, days: number) => {
    const target = subscriptions.find((s) => s.id === id);
    const currentBase = target?.access_expires_at ? new Date(target.access_expires_at).getTime() : Date.now();
    const newExpiresAt = new Date(Math.max(currentBase, Date.now()) + days * 24 * 3600 * 1000).toISOString();
    const updated = subscriptions.map((sub) => (sub.id === id ? { ...sub, access_expires_at: newExpiresAt } : sub));
    saveSubscriptions(updated);
    notify('success', `Adicionados +${days} dias de acesso ao cliente.`);
  };

  const handleToggleActive = (id: string) => {
    const updated = subscriptions.map((sub) => {
      if (sub.id === id) {
        const newActive = !sub.is_active;
        notify('success', newActive ? 'Chave de acesso ATIVADA para o app!' : 'Chave de acesso REVOGADA!');
        return { ...sub, is_active: newActive };
      }
      return sub;
    });
    saveSubscriptions(updated);
  };

  const handleDeleteSub = (id: string) => {
    if (confirm('Tem certeza que deseja remover esta assinatura do painel master?')) {
      const updated = subscriptions.filter((s) => s.id !== id);
      saveSubscriptions(updated);
      notify('success', 'Assinatura removida do painel master.');
    }
  };

  const handleCreateSubscription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail) {
      notify('error', 'Por favor, informe o e-mail do cliente.');
      return;
    }

    const mxValidation = await validateEmailMx(newEmail);
    if (!mxValidation.valid) {
      notify('error', mxValidation.reason || 'Domínio ou e-mail inválido.');
      return;
    }

    const newSub: EcosystemSubscription = {
      id: `sub_${Date.now()}`,
      email: newEmail.trim().toLowerCase(),
      project_id: newProjectId,
      payment_status: newPaymentStatus,
      access_expires_at: newExpiresAt ? new Date(newExpiresAt).toISOString() : new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString(),
      is_active: true,
      created_at: new Date().toISOString()
    };

    const updated = [newSub, ...subscriptions];
    await saveSubscriptions(updated);
    setShowAddModal(false);
    setNewEmail('');
    notify('success', `Assinatura criada com sucesso para ${newSub.email}!`);
  };

  const notify = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesProject = selectedProjectId === 'all' || sub.project_id === selectedProjectId;
    const matchesSearch =
      !searchTerm ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.project_id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProject && matchesSearch;
  });

  const totalClients = new Set(subscriptions.map((s) => s.email)).size;
  const activeSubs = subscriptions.filter((s) => s.payment_status === 'PAGO' && s.is_active).length;
  const pendingSubs = subscriptions.filter((s) => s.payment_status === 'PENDENTE').length;
  const defaultedSubs = subscriptions.filter((s) => s.payment_status === 'INADIMPLENTE' || !s.is_active).length;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 text-slate-100 font-sans">
      {notification && (
        <div
          className={`fixed top-6 right-6 z-50 p-4 rounded-xl shadow-2xl border flex items-center gap-3 backdrop-blur-xl transition-all ${
            notification.type === 'success'
              ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200'
              : 'bg-red-950/90 border-red-500/50 text-red-200'
          }`}
        >
          {notification.type === 'success' ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-red-400" />}
          <span className="text-xs font-bold">{notification.message}</span>
        </div>
      )}

      {/* Header Banner - Dark Glassmorphism */}
      <div className="bg-slate-950/80 border border-purple-500/30 rounded-2xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.15)] backdrop-blur-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-purple-400" /> Painel Master SuperAdmin
            </span>
            <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full">
              Ecossistema Montanha (5 Apps)
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Gestão Centralizada de Acessos &amp; Licenças
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl">
            Controle unificado de expiração de acessos, status financeiro (PAGO, PENDENTE, INADIMPLENTE), chave de ativação por aplicativo e trava anti-abuso.
          </p>
        </div>

        <div className="flex items-center gap-3 z-10">
          <button
            onClick={fetchSubscriptions}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-purple-500/50 text-slate-300 hover:text-white transition cursor-pointer"
            title="Atualizar Dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-purple-400' : ''}`} />
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-lg transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Nova Assinatura
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Clientes Únicos</span>
            <Users className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-3xl font-black text-white">{totalClients}</div>
          <span className="text-[10px] text-purple-300 font-medium">Cadastrados no Ecossistema</span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Acessos Ativos &amp; Pagos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{activeSubs}</div>
          <span className="text-[10px] text-emerald-300 font-medium">Liberados nos 5 Aplicativos</span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Pendentes de Pagamento</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-400">{pendingSubs}</div>
          <span className="text-[10px] text-amber-300 font-medium">Aguardando Confirmação</span>
        </div>

        <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-5 shadow-lg backdrop-blur-md space-y-2">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[11px] font-extrabold uppercase tracking-wider">Inadimplentes / Revogados</span>
            <XCircle className="w-4 h-4 text-red-400" />
          </div>
          <div className="text-3xl font-black text-red-400">{defaultedSubs}</div>
          <span className="text-[10px] text-red-300 font-medium">Trava Anti-Abuso Ativa</span>
        </div>
      </div>

      {/* Main Workspace Table & Filters */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-xl space-y-4">
        {/* Filter Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-4">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setSelectedProjectId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                selectedProjectId === 'all'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              🌐 Todos os Apps ({subscriptions.length})
            </button>
            {ECOSYSTEM_APPS.map((app) => {
              const count = subscriptions.filter((s) => s.project_id === app.id).length;
              return (
                <button
                  key={app.id}
                  onClick={() => setSelectedProjectId(app.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    selectedProjectId === app.id
                      ? 'bg-purple-600 text-white shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <span>{app.name}</span>
                  <span className="text-[10px] opacity-75">({count})</span>
                </button>
              );
            })}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white outline-none focus:border-purple-500 font-medium"
            />
          </div>
        </div>

        {/* Global Clients Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
          <table className="w-full text-left text-xs text-slate-200">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-extrabold text-[10px] tracking-wider border-b border-slate-800">
              <tr>
                <th className="p-3.5">Cliente (E-mail)</th>
                <th className="p-3.5">Aplicativo</th>
                <th className="p-3.5">Status de Pagamento</th>
                <th className="p-3.5">Validade do Acesso</th>
                <th className="p-3.5 text-center">Ativação / Revogação</th>
                <th className="p-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-medium">
              {filteredSubscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-400">
                    Nenhuma assinatura encontrada para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredSubscriptions.map((sub) => {
                  const appMeta = ECOSYSTEM_APPS.find((a) => a.id === sub.project_id) || {
                    name: sub.project_id,
                    badge: 'App',
                    color: 'bg-slate-800 text-slate-300'
                  };
                  const expiresDateFormatted = sub.access_expires_at
                    ? new Date(sub.access_expires_at).toISOString().split('T')[0]
                    : '';
                  const isExpired = sub.access_expires_at ? new Date(sub.access_expires_at) <= new Date() : false;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-900/40 transition">
                      <td className="p-3.5">
                        <div className="font-bold text-white text-xs">{sub.email}</div>
                        <div className="text-[10px] text-slate-400">ID: {sub.id}</div>
                      </td>

                      <td className="p-3.5">
                        <span className={`inline-block px-2.5 py-1 rounded-lg border text-[10px] font-bold ${appMeta.color}`}>
                          {appMeta.name}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <select
                          value={sub.payment_status}
                          onChange={(e) =>
                            handleStatusChange(sub.id, e.target.value as 'PAGO' | 'PENDENTE' | 'INADIMPLENTE' | 'CANCELADO')
                          }
                          className={`bg-slate-900 border rounded-xl px-2.5 py-1.5 text-xs font-bold outline-none cursor-pointer ${
                            sub.payment_status === 'PAGO'
                              ? 'border-emerald-500/50 text-emerald-400'
                              : sub.payment_status === 'PENDENTE'
                              ? 'border-amber-500/50 text-amber-400'
                              : 'border-red-500/50 text-red-400'
                          }`}
                        >
                          <option value="PAGO" className="bg-slate-900 text-emerald-400 font-bold">
                            🟢 PAGO
                          </option>
                          <option value="PENDENTE" className="bg-slate-900 text-amber-400 font-bold">
                            🟡 PENDENTE
                          </option>
                          <option value="INADIMPLENTE" className="bg-slate-900 text-red-400 font-bold">
                            🔴 INADIMPLENTE
                          </option>
                          <option value="CANCELADO" className="bg-slate-900 text-slate-400 font-bold">
                            ⚪ CANCELADO
                          </option>
                        </select>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <input
                            type="date"
                            value={expiresDateFormatted}
                            onChange={(e) => handleExpirationChange(sub.id, e.target.value)}
                            className={`bg-slate-900 border rounded-xl p-1.5 text-xs outline-none font-mono ${
                              isExpired ? 'border-red-500 text-red-400 font-bold' : 'border-slate-800 text-slate-200'
                            }`}
                          />
                          <button
                            onClick={() => handleAddDays(sub.id, 30)}
                            className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] px-2 py-1 rounded-lg font-bold transition cursor-pointer"
                            title="Adicionar +30 dias de acesso"
                          >
                            +30d
                          </button>
                          <button
                            onClick={() => handleAddDays(sub.id, 365)}
                            className="bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] px-2 py-1 rounded-lg font-bold transition cursor-pointer"
                            title="Adicionar +1 Ano de acesso"
                          >
                            +1 ano
                          </button>
                        </div>
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          onClick={() => handleToggleActive(sub.id)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold inline-flex items-center gap-1.5 transition cursor-pointer ${
                            sub.is_active
                              ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/25'
                              : 'bg-red-500/15 border-red-500/40 text-red-300 hover:bg-red-500/25'
                          }`}
                        >
                          {sub.is_active ? (
                            <>
                              <Lock className="w-3.5 h-3.5 text-emerald-400" /> ATIVO
                            </>
                          ) : (
                            <>
                              <Unlock className="w-3.5 h-3.5 text-red-400" /> REVOGADO
                            </>
                          )}
                        </button>
                      </td>

                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => handleDeleteSub(sub.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition cursor-pointer"
                          title="Remover Registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-purple-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-400" /> Nova Assinatura do Ecossistema
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white font-bold">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubscription} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">E-mail Comercial do Cliente</label>
                <input
                  type="email"
                  required
                  placeholder="cliente@exemplo.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Aplicativo do Ecossistema</label>
                <select
                  value={newProjectId}
                  onChange={(e) => setNewProjectId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 font-bold"
                >
                  {ECOSYSTEM_APPS.map((app) => (
                    <option key={app.id} value={app.id}>
                      {app.name} ({app.badge})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Status de Pagamento</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) =>
                    setNewPaymentStatus(e.target.value as 'PAGO' | 'PENDENTE' | 'INADIMPLENTE' | 'CANCELADO')
                  }
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 font-bold"
                >
                  <option value="PAGO">🟢 PAGO</option>
                  <option value="PENDENTE">🟡 PENDENTE</option>
                  <option value="INADIMPLENTE">🔴 INADIMPLENTE</option>
                  <option value="CANCELADO">⚪ CANCELADO</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Validade do Acesso (Expiração)</label>
                <input
                  type="date"
                  value={newExpiresAt}
                  onChange={(e) => setNewExpiresAt(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-white outline-none focus:border-purple-500 font-mono"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold py-3 rounded-xl transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-purple-600 to-cyan-500 hover:opacity-90 text-white font-bold py-3 rounded-xl shadow-lg transition cursor-pointer"
                >
                  Salvar Assinatura
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterAdminDashboard;
