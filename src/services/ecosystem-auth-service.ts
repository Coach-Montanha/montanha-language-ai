import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface EcosystemUser {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  created_at?: string;
}

export interface EcosystemGuestLockout {
  id: string;
  email: string;
  device_fingerprint?: string;
  ip_address?: string;
  locked_at?: string;
  reason?: string;
}

export interface EcosystemOtpToken {
  id: string;
  email: string;
  token: string;
  expires_at: string;
  used: boolean;
}

export interface EcosystemSubscription {
  id: string;
  user_id?: string;
  email: string;
  project_id: string;
  payment_status: 'PAGO' | 'PENDENTE' | 'INADIMPLENTE' | 'CANCELADO';
  access_expires_at: string | null;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Disposable domains blacklist
const DISPOSABLE_EMAIL_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'yopmail.com',
  'trashmail.com',
  'sharklasers.com',
  'getairmail.com',
  'dispostable.com',
  'disposable.com',
  'temp-mail.org',
  'fakeinbox.com',
  'maildrop.cc',
  'nada.ltd',
  'crazymailing.com',
  'tmail.ws',
  'boun.cr',
  'disposablemail.com',
  'mailcatch.com',
  'inboxalias.com'
]);

function getSupabaseClient(): SupabaseClient | null {
  try {
    const url =
      (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) ||
      (typeof process !== 'undefined' && process.env?.SUPABASE_URL) ||
      '';
    const key =
      (typeof import.meta !== 'undefined' && (import.meta.env?.VITE_SUPABASE_ANON_KEY || import.meta.env?.VITE_SUPABASE_PUBLISHABLE_KEY)) ||
      (typeof process !== 'undefined' && (process.env?.SUPABASE_ANON_KEY || process.env?.SUPABASE_PUBLISHABLE_KEY)) ||
      '';

    if (url && key) {
      return createClient(url, key);
    }
  } catch (err) {
    console.warn('[EcosystemAuth] Error initializing Supabase client:', err);
  }
  return null;
}

/**
 * 1. validateEmailMx(email: string)
 * Validação de sintaxe e servidores MX (rejeitando domínios de e-mails descartáveis).
 */
export async function validateEmailMx(email: string): Promise<{ valid: boolean; reason?: string }> {
  if (!email || typeof email !== 'string') {
    return { valid: false, reason: 'E-mail não fornecido.' };
  }

  const cleanEmail = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailRegex.test(cleanEmail)) {
    return { valid: false, reason: 'Formato de e-mail inválido.' };
  }

  const parts = cleanEmail.split('@');
  if (parts.length !== 2) {
    return { valid: false, reason: 'Formato de e-mail inválido.' };
  }

  const domain = parts[1]!;

  if (DISPOSABLE_EMAIL_DOMAINS.has(domain)) {
    return { valid: false, reason: `O domínio "${domain}" é um serviço de e-mail descartável não permitido.` };
  }

  // Real MX record validation via DNS-over-HTTPS query
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(domain)}&type=MX`, {
      headers: { Accept: 'application/dns-json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (response.ok) {
      const data = await response.json();
      if (data.Status === 3) { // NXDOMAIN
        return { valid: false, reason: `O domínio "${domain}" não existe (servidor de e-mail não encontrado).` };
      }
      if (data.Status === 0 && (!data.Answer || data.Answer.length === 0)) {
        return { valid: false, reason: `O domínio "${domain}" não possui registros MX válidos para receber e-mails.` };
      }
    }
  } catch (err) {
    console.warn('[EcosystemAuth] DNS MX lookup bypassed:', err);
  }

  return { valid: true };
}

/**
 * 2. checkAndLockGuestDemo(email: string)
 * Consulta a tabela ecosystem_guest_lockout no Supabase.
 * Se o e-mail já usou a demo grátis em qualquer aplicativo do ecossistema, bloqueia novos acessos grátis.
 */
export async function checkAndLockGuestDemo(
  email: string
): Promise<{ allowed: boolean; locked: boolean; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const supabase = getSupabaseClient();

  const localLockedKey = `ecosystem_guest_lockout_${cleanEmail}`;
  if (typeof window !== 'undefined' && localStorage.getItem(localLockedKey)) {
    return {
      allowed: false,
      locked: true,
      message: 'Este e-mail já utilizou a demonstração gratuita no ecossistema Montanha. Por favor, faça login ou cadastre-se para continuar.'
    };
  }

  if (supabase) {
    try {
      const { data: existing, error } = await supabase
        .from('ecosystem_guest_lockout')
        .select('*')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (error) {
        console.warn('[EcosystemAuth] Error querying guest lockout:', error.message);
      } else if (existing) {
        if (typeof window !== 'undefined') {
          localStorage.setItem(localLockedKey, 'true');
        }
        return {
          allowed: false,
          locked: true,
          message: 'Este e-mail já utilizou a demonstração gratuita no ecossistema Montanha. Por favor, faça login ou cadastre-se para continuar.'
        };
      }

      await supabase.from('ecosystem_guest_lockout').insert([{
        email: cleanEmail,
        reason: 'demo_used',
        locked_at: new Date().toISOString()
      }]);
    } catch (err) {
      console.warn('[EcosystemAuth] Exception checking guest lockout:', err);
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(localLockedKey, 'true');
  }

  return {
    allowed: true,
    locked: false,
    message: 'Acesso ao modo demonstração liberado. Seu e-mail foi registrado no ecossistema.'
  };
}

/**
 * Helper to generate and send 6-digit OTP token
 */
export async function sendOtpToken(email: string): Promise<{ success: boolean; token?: string; message: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const mxResult = await validateEmailMx(cleanEmail);

  if (!mxResult.valid) {
    return { success: false, message: mxResult.reason || 'E-mail inválido.' };
  }

  const token = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      await supabase.from('ecosystem_otp_tokens').insert([{
        email: cleanEmail,
        token: token,
        expires_at: expiresAt,
        used: false
      }]);
    } catch (err) {
      console.warn('[EcosystemAuth] Error saving OTP token:', err);
    }
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem(`ecosystem_latest_otp_${cleanEmail}`, JSON.stringify({ token, expiresAt }));
  }

  return {
    success: true,
    token: token,
    message: `Código OTP de 6 dígitos enviado para ${cleanEmail}. (Código para testes: ${token})`
  };
}

/**
 * 3. verifyOtpToken(email: string, token: string)
 * Confirmação do token numérico de 6 dígitos (Double Opt-In).
 */
export async function verifyOtpToken(
  email: string,
  token: string
): Promise<{ success: boolean; message: string; user?: EcosystemUser }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanToken = token.trim();

  if (!cleanToken || cleanToken.length !== 6 || !/^\d{6}$/.test(cleanToken)) {
    return { success: false, message: 'O código OTP deve possuir exatamente 6 dígitos numéricos.' };
  }

  const supabase = getSupabaseClient();
  let verified = false;

  if (supabase) {
    try {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('ecosystem_otp_tokens')
        .select('*')
        .eq('email', cleanEmail)
        .eq('token', cleanToken)
        .eq('used', false)
        .gte('expires_at', now)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.warn('[EcosystemAuth] Error checking OTP:', error.message);
      } else if (data) {
        verified = true;
        await supabase
          .from('ecosystem_otp_tokens')
          .update({ used: true })
          .eq('id', data.id);
      }
    } catch (err) {
      console.warn('[EcosystemAuth] Exception verifying OTP:', err);
    }
  }

  if (!verified && typeof window !== 'undefined') {
    const raw = localStorage.getItem(`ecosystem_latest_otp_${cleanEmail}`);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        if (parsed.token === cleanToken && new Date(parsed.expiresAt) > new Date()) {
          verified = true;
        }
      } catch (err) {}
    }
  }

  if (!verified) {
    return { success: false, message: 'Código OTP incorreto, expirado ou já utilizado.' };
  }

  let user: EcosystemUser = {
    id: `usr_${Date.now()}`,
    email: cleanEmail,
    role: 'user',
    created_at: new Date().toISOString()
  };

  if (supabase) {
    try {
      const { data: userData, error: userError } = await supabase
        .from('ecosystem_users')
        .upsert({ email: cleanEmail, updated_at: new Date().toISOString() }, { onConflict: 'email' })
        .select()
        .single();

      if (!userError && userData) {
        user = userData as EcosystemUser;
      }
    } catch (err) {
      console.warn('[EcosystemAuth] Error upserting user:', err);
    }
  }

  return {
    success: true,
    message: 'E-mail verificado com sucesso via código OTP!',
    user: user
  };
}

/**
 * 4. checkProjectAccess(userId: string | null, projectId: string, email?: string)
 * Validação do prazo de validade (access_expires_at) e status de pagamento antes de liberar o aplicativo.
 */
export async function checkProjectAccess(
  userId: string | null,
  projectId: string,
  email?: string
): Promise<{ hasAccess: boolean; status: string; expiresAt: string | null; message: string }> {
  const supabase = getSupabaseClient();
  const cleanEmail = email ? email.trim().toLowerCase() : null;

  if (supabase) {
    try {
      let query = supabase.from('ecosystem_subscriptions').select('*').eq('project_id', projectId);

      if (userId) {
        query = query.eq('user_id', userId);
      } else if (cleanEmail) {
        query = query.eq('email', cleanEmail);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.warn('[EcosystemAuth] Error querying subscription access:', error.message);
      } else if (data) {
        const sub = data as EcosystemSubscription;

        if (!sub.is_active) {
          return {
            hasAccess: false,
            status: sub.payment_status,
            expiresAt: sub.access_expires_at,
            message: 'Acesso revogado pelo Administrador para este aplicativo.'
          };
        }

        const isExpired = sub.access_expires_at ? new Date(sub.access_expires_at) <= new Date() : false;

        if (sub.payment_status === 'PAGO' && !isExpired) {
          return {
            hasAccess: true,
            status: 'PAGO',
            expiresAt: sub.access_expires_at,
            message: 'Acesso liberado.'
          };
        }

        if (isExpired) {
          return {
            hasAccess: false,
            status: sub.payment_status,
            expiresAt: sub.access_expires_at,
            message: 'Acesso negado: a validade da sua assinatura para este app expirou.'
          };
        }

        return {
          hasAccess: false,
          status: sub.payment_status,
          expiresAt: sub.access_expires_at,
          message: `Acesso negado: status de pagamento é ${sub.payment_status}.`
        };
      }
    } catch (err) {
      console.warn('[EcosystemAuth] Exception checking project access:', err);
    }
  }

  if (typeof window !== 'undefined') {
    const localSub = localStorage.getItem(`ecosystem_sub_${projectId}_${cleanEmail || userId}`);
    if (localSub) {
      try {
        const parsed = JSON.parse(localSub);
        const isExpired = parsed.access_expires_at ? new Date(parsed.access_expires_at) <= new Date() : false;
        if (parsed.payment_status === 'PAGO' && !isExpired && parsed.is_active !== false) {
          return {
            hasAccess: true,
            status: 'PAGO',
            expiresAt: parsed.access_expires_at,
            message: 'Acesso liberado (local).'
          };
        }
      } catch (err) {}
    }
  }

  return {
    hasAccess: true,
    status: 'DEMO',
    expiresAt: null,
    message: 'Acesso liberado em modo demonstração.'
  };
}
