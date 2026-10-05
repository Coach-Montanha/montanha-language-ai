import React from "react";
import { AvatarConfig, AvatarAnimationState } from "@/types/avatar";
import { DEFAULT_AVATAR_CONFIG } from "@/data/avatar-items";

interface ModularAvatarProps {
  config?: AvatarConfig | undefined;
  state?: AvatarAnimationState | undefined;
  size?: ("xs" | "sm" | "md" | "lg" | "xl") | undefined;
  className?: string | undefined;
  onClick?: (() => void) | undefined;
  showBadge?: boolean | undefined;
  level?: number | undefined;
}

const SIZE_MAP = {
  xs: 32,
  sm: 44,
  md: 80,
  lg: 160,
  xl: 260,
};

interface SvgContext {
  goldGrad: string;
  cyberGrad: string;
  purpleGrad: string;
  fireGrad: string;
  auraGlow: string;
  glowEffect: string;
}

export const ModularAvatar: React.FC<ModularAvatarProps> = ({
  config = DEFAULT_AVATAR_CONFIG,
  state = "idle",
  size = "md",
  className = "",
  onClick,
  showBadge = false,
  level = 1,
}) => {
  const pixelSize = SIZE_MAP[size] || 80;
  const archetype = config?.archetype || "human";
  const subType = config?.subType || "valerius_scribe";
  const primaryColor = config?.primaryColor || "#3b82f6";
  const secondaryColor = config?.secondaryColor || "#f59e0b";
  const eq = (config?.equipped || {}) as Record<string, string | null | undefined>;

  // Slot Resolution: se a chave maiúscula estiver explicitamente definida (mesmo que null para unequipped),
  // respeitamos seu valor. Apenas se undefined consultamos os fallbacks em minúsculo.
  const resolveSlot = (primaryKey: string, ...fallbackKeys: string[]): string | null => {
    if (eq[primaryKey] !== undefined) return eq[primaryKey];
    for (const key of fallbackKeys) {
      if (eq[key] !== undefined) return eq[key];
    }
    return null;
  };

  const backId = resolveSlot("BACK", "back");
  const legsId = resolveSlot("LEGS", "legs");
  const chestId = resolveSlot("CHEST", "chest", "body");
  const headId = resolveSlot("HEAD", "head");
  const mainHandId = resolveSlot("MAIN_HAND", "hand");
  const offHandId = resolveSlot("OFF_HAND", "off_hand", "offHand");
  const accessoryId = resolveSlot("ACCESSORY", "accessory");
  const eyesId = eq["eyes"] || undefined;
  const auraId = eq["aura"] || undefined;

  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const goldGradId = `goldGrad_${uid}`;
  const cyberGradId = `cyberGrad_${uid}`;
  const purpleGradId = `purpleGrad_${uid}`;
  const fireGradId = `fireGrad_${uid}`;
  const auraGlowId = `auraGlow_${uid}`;
  const glowEffectId = `glowEffect_${uid}`;

  const ctx: SvgContext = {
    goldGrad: `url(#${goldGradId})`,
    cyberGrad: `url(#${cyberGradId})`,
    purpleGrad: `url(#${purpleGradId})`,
    fireGrad: `url(#${fireGradId})`,
    auraGlow: `url(#${auraGlowId})`,
    glowEffect: `url(#${glowEffectId})`,
  };

  const getStateAnimationClass = () => {
    switch (state) {
      case "speaking":
        return "animate-pulse scale-[1.02]";
      case "listening":
        return "transition-transform duration-300 scale-105 rotate-1";
      case "celebrating":
        return "animate-bounce";
      case "thinking":
        return "transition-transform duration-500 -rotate-2";
      case "idle":
      default:
        return "transition-all duration-300 hover:scale-105";
    }
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex items-center justify-center select-none ${
        onClick ? "cursor-pointer active:scale-95 transition-transform" : ""
      } ${className}`}
      style={{ width: pixelSize, height: pixelSize }}
      title={`Avatar: ${subType || archetype} (${state})`}
    >
      <svg
        viewBox="0 0 200 200"
        width={pixelSize}
        height={pixelSize}
        className={`w-full h-full overflow-visible ${getStateAnimationClass()}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={goldGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id={cyberGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
          <linearGradient id={purpleGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id={fireGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <radialGradient id={auraGlowId} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </radialGradient>
          <filter id={glowEffectId} x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. CAMADA DE AURA / BACKGROUND */}
        {renderAuraLayer(auraId, primaryColor, state, ctx)}

        {/* 2. CAMADA DE COSTAS (BACK) - Renderiza atrás do corpo */}
        {renderBackItem(backId, primaryColor, secondaryColor, ctx)}

        {/* 3. CAMADA DE CORPO BASE / ARQUÉTIPO RPG */}
        {renderBaseArchetype(archetype, subType, primaryColor, secondaryColor, state, ctx)}

        {/* 4. CAMADA DE PERNAS (LEGS) */}
        {renderLegsApparel(legsId, primaryColor, secondaryColor, ctx)}

        {/* 5. CAMADA DE PEITORAL / TRAJE (CHEST) */}
        {renderBodyApparel(chestId, primaryColor, secondaryColor, ctx)}

        {/* 6. CAMADA DE ROSTO / OLHOS (EYES) */}
        {renderEyewear(eyesId, state, ctx)}

        {/* 7. CAMADA DE ACESSÓRIO (ACCESSORY) */}
        {renderAccessoryItem(accessoryId, primaryColor, secondaryColor, ctx)}

        {/* 8. CAMADA DE CABEÇA / CHAPÉU / ELMO (HEAD) */}
        {renderHeadwear(headId, primaryColor, secondaryColor, ctx)}

        {/* 9. CAMADA DE MÃO PRINCIPAL (MAIN_HAND) */}
        {renderHandItem(mainHandId, state, ctx)}

        {/* 10. CAMADA DE MÃO SECUNDÁRIA (OFF_HAND) */}
        {renderOffHandItem(offHandId, state, ctx)}

        {/* 11. EFEITOS DE ESTADO (Fala, Escuta, Celebração, Pensamento) */}
        {renderStateOverlays(state, ctx)}
      </svg>

      {/* Mini badge de nível no canto */}
      {showBadge && (
        <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 font-black text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full border-2 border-background shadow-md">
          {level}
        </span>
      )}
    </div>
  );
};

// =========================================================================
// 1. AURA LAYER
// =========================================================================
function renderAuraLayer(
  auraId?: string,
  primaryColor: string = "#3b82f6",
  state: string = "idle",
  ctx?: SvgContext
) {
  const glow = ctx?.glowEffect || "url(#glowEffect)";
  const aura = ctx?.auraGlow || "url(#auraGlow)";
  const purple = ctx?.purpleGrad || "url(#purpleGrad)";
  const cyber = ctx?.cyberGrad || "url(#cyberGrad)";

  if (!auraId) {
    return <circle cx="100" cy="100" r="85" fill={aura} />;
  }

  switch (auraId) {
    case "aura_golden_stars":
      return (
        <g>
          <circle cx="100" cy="100" r="88" fill="#fbbf24" fillOpacity="0.12" />
          <path d="M 40 45 L 43 53 L 51 56 L 43 59 L 40 67 L 37 59 L 29 56 L 37 53 Z" fill="#fbbf24" className="animate-spin origin-[40px_56px]" />
          <path d="M 160 50 L 162 56 L 168 58 L 162 60 L 160 66 L 158 60 L 152 58 L 158 56 Z" fill="#f59e0b" className="animate-spin origin-[160px_58px]" />
          <path d="M 30 140 L 32 145 L 37 147 L 32 149 L 30 154 L 28 149 L 23 147 L 28 145 Z" fill="#fbbf24" />
          <path d="M 170 135 L 172 140 L 177 142 L 172 144 L 170 149 L 168 144 L 163 142 L 168 140 Z" fill="#f59e0b" />
        </g>
      );
    case "aura_thunder_storm":
      return (
        <g filter={glow}>
          <circle cx="100" cy="100" r="90" fill="#38bdf8" fillOpacity="0.15" />
          <path d="M 35 70 L 48 95 L 40 100 L 52 130" stroke="#38bdf8" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M 165 65 L 152 90 L 160 95 L 148 125" stroke="#0ea5e9" strokeWidth="3" fill="none" strokeLinecap="round" />
        </g>
      );
    case "aura_cosmic_portal":
      return (
        <g filter={glow}>
          <circle cx="100" cy="100" r="95" stroke={purple} strokeWidth="4" strokeDasharray="14 10" fill={purple} fillOpacity="0.15" />
          <circle cx="100" cy="100" r="85" stroke={cyber} strokeWidth="2" strokeDasharray="8 6" fill="none" />
        </g>
      );
    default:
      return <circle cx="100" cy="100" r="85" fill={aura} />;
  }
}

// =========================================================================
// 2. BACK ITEM LAYER (SLOT BACK: ASAS, MOCHILAS, CAPAS)
// =========================================================================
function renderBackItem(
  backId?: string | null,
  primaryColor: string = "#3b82f6",
  secondaryColor: string = "#f59e0b",
  ctx?: SvgContext
) {
  if (!backId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";
  const purple = ctx?.purpleGrad || "url(#purpleGrad)";
  const cyber = ctx?.cyberGrad || "url(#cyberGrad)";

  switch (backId) {
    case "back_capa_viajante":
      return (
        <g id="back-capa-viajante">
          {/* Capa esvoaçante atrás dos ombros */}
          <path d="M 46 128 Q 15 155 25 185 L 175 185 Q 185 155 154 128 Q 100 138 46 128 Z" fill="#1e3a8a" opacity="0.9" />
          <path d="M 35 150 Q 100 170 165 150" stroke="#3b82f6" strokeWidth="2" fill="none" opacity="0.6" />
        </g>
      );
    case "back_mochila_escriba":
      return (
        <g id="back-mochila-escriba">
          {/* Mochila e rolo de pergaminho visíveis atrás dos ombros */}
          <rect x="36" y="105" width="22" height="42" rx="4" fill="#78350f" stroke="#451a03" strokeWidth="2" />
          <rect x="142" y="105" width="22" height="42" rx="4" fill="#78350f" stroke="#451a03" strokeWidth="2" />
          {/* Rolo de mapa na parte superior */}
          <rect x="30" y="98" width="140" height="12" rx="6" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
          <line x1="60" y1="98" x2="60" y2="110" stroke="#78350f" strokeWidth="2" />
          <line x1="140" y1="98" x2="140" y2="110" stroke="#78350f" strokeWidth="2" />
        </g>
      );
    case "back_asas_eter_noturno":
      return (
        <g id="back-asas-eter" filter={glow}>
          {/* Asa Esquerda Cósmica */}
          <path
            d="M 50 120 C 15 95 5 45 40 25 C 20 60 50 85 62 105 Z"
            fill={cyber}
            opacity="0.85"
          />
          <path
            d="M 45 130 C 5 110 -5 70 25 50 C 15 80 40 105 55 120 Z"
            fill={purple}
            opacity="0.75"
          />
          {/* Asa Direita Cósmica */}
          <path
            d="M 150 120 C 185 95 195 45 160 25 C 180 60 150 85 138 105 Z"
            fill={cyber}
            opacity="0.85"
          />
          <path
            d="M 155 130 C 195 110 205 70 175 50 C 185 80 160 105 145 120 Z"
            fill={purple}
            opacity="0.75"
          />
          {/* Poeira estelar nas asas */}
          <circle cx="35" cy="35" r="2.5" fill="#fff" />
          <circle cx="165" cy="35" r="2.5" fill="#fff" />
          <circle cx="20" cy="65" r="2" fill="#fff" />
          <circle cx="180" cy="65" r="2" fill="#fff" />
        </g>
      );
    default:
      return null;
  }
}

// =========================================================================
// 3. BASE ARCHETYPES (OS 6 PERSONAGENS RPG + LEGADO)
// =========================================================================
function renderBaseArchetype(
  archetype: string,
  subType: string,
  primaryColor: string,
  secondaryColor: string,
  state: string,
  ctx?: SvgContext
) {
  const isSpeaking = state === "speaking";
  const glow = ctx?.glowEffect || "url(#glowEffect)";

  // 1. VALERIUS, O ESCRIBA ERRANTE (HUMAN_MALE)
  if (subType === "valerius_scribe" || subType === "valerius") {
    return (
      <g id="archetype-valerius">
        {/* Pescoço e Base de Ombros */}
        <rect x="88" y="115" width="24" height="25" fill="#fed7aa" />
        <path d="M 50 140 Q 100 120 150 140 L 160 185 L 40 185 Z" fill="#1e3a8a" />
        {/* Orelhas com pena de escriba na orelha direita */}
        <circle cx="56" cy="92" r="10" fill="#fed7aa" />
        <circle cx="144" cy="92" r="10" fill="#fed7aa" />
        <path d="M 148 90 Q 165 72 172 55 Q 162 70 150 82 Z" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
        {/* Rosto Sábio e Expressão Focada */}
        <ellipse cx="100" cy="94" rx="42" ry="44" fill="#ffedd5" />
        {/* Cabelo Penteado Erudito */}
        <path d="M 56 80 Q 60 42 100 42 Q 140 42 144 80 Q 130 55 100 52 Q 68 55 56 80 Z" fill="#451a03" />
        <path d="M 58 75 Q 75 58 92 65 Q 70 70 58 75 Z" fill="#78350f" />
        {/* Olhos Castanhos Expressivos */}
        <circle cx="82" cy="88" r="6" fill="#292524" />
        <circle cx="118" cy="88" r="6" fill="#292524" />
        <circle cx="80" cy="86" r="2" fill="#fff" />
        <circle cx="116" cy="86" r="2" fill="#fff" />
        {/* Sobrancelhas Sérias de Estudioso */}
        <path d="M 74 78 Q 82 74 90 77" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 110 77 Q 118 74 126 78" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 98 94 Q 100 98 103 98" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" fill="none" />
        {/* Boca */}
        {isSpeaking ? (
          <ellipse cx="100" cy="108" rx="8" ry="6" fill="#e11d48" />
        ) : (
          <path d="M 92 106 Q 100 112 108 106" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}
      </g>
    );
  }

  // 2. KAZAN, A LÂMINA RÚNICA (HUMAN_MALE)
  if (subType === "kazan_runic_blade" || subType === "kazan") {
    return (
      <g id="archetype-kazan">
        <rect x="86" y="115" width="28" height="25" fill="#fde68a" />
        <path d="M 45 138 Q 100 115 155 138 L 165 185 L 35 185 Z" fill="#1c1917" />
        <circle cx="54" cy="92" r="10" fill="#fde68a" />
        <circle cx="146" cy="92" r="10" fill="#fde68a" />
        <ellipse cx="100" cy="94" rx="44" ry="45" fill="#fef08a" />
        {/* Cabelo Espetado de Guerreiro com Trança Lateral */}
        <path d="M 52 75 L 42 45 L 68 52 L 78 30 L 98 48 L 115 28 L 126 50 L 148 38 L 145 78 Z" fill="#18181b" />
        <path d="M 144 80 Q 155 105 148 130" stroke="#78350f" strokeWidth="3.5" fill="none" strokeLinecap="round" />
        {/* Tatuagem Rúnica Ciano no Rosto */}
        <path d="M 68 85 L 75 92 L 68 102" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" fill="none" filter={glow} />
        {/* Olhos Determinados de Aço */}
        <circle cx="82" cy="88" r="6" fill="#0f172a" />
        <circle cx="118" cy="88" r="6" fill="#0f172a" />
        <circle cx="80" cy="86" r="2" fill="#38bdf8" />
        <circle cx="116" cy="86" r="2" fill="#38bdf8" />
        {/* Cicatriz na Sobrancelha Esquerda */}
        <path d="M 72 76 L 90 77" stroke="#18181b" strokeWidth="3" strokeLinecap="round" fill="none" />
        <path d="M 110 77 L 128 76" stroke="#18181b" strokeWidth="3" strokeLinecap="round" fill="none" />
        <line x1="84" y1="73" x2="84" y2="81" stroke="#fef08a" strokeWidth="2" />
        {/* Boca Firme */}
        {isSpeaking ? (
          <ellipse cx="100" cy="108" rx="8" ry="6" fill="#991b1b" />
        ) : (
          <path d="M 90 107 L 110 107" stroke="#450a0a" strokeWidth="2.5" strokeLinecap="round" />
        )}
      </g>
    );
  }

  // 3. LYRA, TECELÃ DE ECOS (HUMAN_FEMALE)
  if (subType === "lyra_echo_weaver" || subType === "lyra") {
    return (
      <g id="archetype-lyra">
        <rect x="89" y="115" width="22" height="25" fill="#ffe4e6" />
        <path d="M 52 140 Q 100 125 148 140 L 158 185 L 42 185 Z" fill="#831843" />
        <circle cx="58" cy="92" r="9" fill="#ffe4e6" />
        <circle cx="142" cy="92" r="9" fill="#ffe4e6" />
        <ellipse cx="100" cy="94" rx="40" ry="42" fill="#fff1f2" />
        {/* Cabelo Escuro com Coques Duplos e Fita Celestial */}
        <circle cx="58" cy="55" r="16" fill="#18181b" />
        <circle cx="142" cy="55" r="16" fill="#18181b" />
        {/* Grampos Dourados (Kanzashi) */}
        <line x1="45" y1="45" x2="70" y2="65" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        <circle cx="70" cy="65" r="3" fill="#f43f5e" />
        <line x1="155" y1="45" x2="130" y2="65" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        <circle cx="130" cy="65" r="3" fill="#f43f5e" />
        {/* Franja Delicada e Fita Carmesim */}
        <path d="M 60 75 Q 100 50 140 75 Q 120 62 100 62 Q 80 62 60 75 Z" fill="#18181b" />
        {/* Olhos Suaves com Maquiagem Oriental */}
        <ellipse cx="82" cy="88" rx="6" ry="5" fill="#4c0519" />
        <ellipse cx="118" cy="88" rx="6" ry="5" fill="#4c0519" />
        <circle cx="80" cy="86" r="2" fill="#fff" />
        <circle cx="116" cy="86" r="2" fill="#fff" />
        <path d="M 88 87 Q 92 86 94 88" stroke="#e11d48" strokeWidth="1.5" fill="none" />
        <path d="M 112 87 Q 108 86 106 88" stroke="#e11d48" strokeWidth="1.5" fill="none" />
        {/* Bochechas Rosadas */}
        <circle cx="74" cy="98" r="6" fill="#fda4af" opacity="0.6" />
        <circle cx="126" cy="98" r="6" fill="#fda4af" opacity="0.6" />
        {/* Boca Serena */}
        {isSpeaking ? (
          <ellipse cx="100" cy="107" rx="7" ry="5" fill="#be123c" />
        ) : (
          <path d="M 94 106 Q 100 110 106 106" stroke="#be123c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}
      </g>
    );
  }

  // 4. VALKÍRIA ASTRID (HUMAN_FEMALE)
  if (subType === "astrid_valkyrie" || subType === "astrid") {
    return (
      <g id="archetype-astrid">
        <rect x="88" y="115" width="24" height="25" fill="#fed7aa" />
        <path d="M 48 138 Q 100 120 152 138 L 160 185 L 40 185 Z" fill="#1e3a8a" />
        <circle cx="56" cy="92" r="10" fill="#fed7aa" />
        <circle cx="144" cy="92" r="10" fill="#fed7aa" />
        <ellipse cx="100" cy="94" rx="42" ry="44" fill="#ffedd5" />
        {/* Asas de Prata nas Orelhas de Valkíria */}
        <path d="M 48 85 L 30 70 L 46 75 L 32 60 L 52 70 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
        <path d="M 152 85 L 170 70 L 154 75 L 168 60 L 148 70 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
        {/* Cabelo Dourado Nórdico com Tranças Frontais */}
        <path d="M 54 78 Q 60 40 100 40 Q 140 40 146 78 Q 120 54 100 54 Q 80 54 54 78 Z" fill="#fbbf24" />
        <path d="M 54 82 Q 45 110 50 145" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M 146 82 Q 155 110 150 145" stroke="#f59e0b" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* Olhos Azuis Celestiais Heroicos */}
        <circle cx="82" cy="88" r="6" fill="#0284c7" />
        <circle cx="118" cy="88" r="6" fill="#0284c7" />
        <circle cx="80" cy="86" r="2" fill="#fff" />
        <circle cx="116" cy="86" r="2" fill="#fff" />
        <path d="M 74 77 Q 82 73 90 76" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 110 76 Q 118 73 126 77" stroke="#b45309" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {/* Boca Determinada */}
        {isSpeaking ? (
          <ellipse cx="100" cy="108" rx="8" ry="6" fill="#e11d48" />
        ) : (
          <path d="M 92 106 Q 100 111 108 106" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}
      </g>
    );
  }

  // 5. SOMBRA DE ANÚBIS (MYTHIC_BEAST)
  if (subType === "anubis_shadow_beast" || subType === "anubis_shadow") {
    return (
      <g id="archetype-anubis">
        <rect x="88" y="115" width="24" height="25" fill="#0f172a" />
        <path d="M 45 138 Q 100 120 155 138 L 165 185 L 35 185 Z" fill="#020617" />
        {/* Orelhas Altas e Pontiagudas de Chacal de Anúbis */}
        <polygon points="56,70 30,10 75,45" fill="#0f172a" stroke="#d97706" strokeWidth="2" />
        <polygon points="58,62 42,25 70,48" fill="#d97706" />
        <polygon points="144,70 170,10 125,45" fill="#0f172a" stroke="#d97706" strokeWidth="2" />
        <polygon points="142,62 158,25 130,48" fill="#d97706" />
        {/* Cabeça Negra de Chacal Ancestral */}
        <ellipse cx="100" cy="95" rx="44" ry="46" fill="#0f172a" />
        {/* Faixa Dourada / Nemes Egípcio */}
        <rect x="62" y="60" width="76" height="8" rx="3" fill="#fbbf24" stroke="#b45309" strokeWidth="1" />
        {/* Focinho Elegante de Chacal */}
        <polygon points="90,88 110,88 100,108" fill="#1e293b" />
        <polygon points="95,102 105,102 100,108" fill="#020617" />
        {/* Olhos Dourados Hipnóticos de Anúbis com Delineado Kohl */}
        <ellipse cx="78" cy="84" rx="9" ry="6" fill="#fbbf24" stroke="#000" strokeWidth="2" filter={glow} />
        <ellipse cx="122" cy="84" rx="9" ry="6" fill="#fbbf24" stroke="#000" strokeWidth="2" filter={glow} />
        <circle cx="78" cy="84" r="3.5" fill="#000" />
        <circle cx="122" cy="84" r="3.5" fill="#000" />
        <path d="M 68 84 L 62 88" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        <path d="M 132 84 L 138 88" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
        {/* Boca Mística */}
        {isSpeaking ? (
          <ellipse cx="100" cy="112" rx="7" ry="5" fill="#b45309" />
        ) : (
          <path d="M 94 110 Q 100 114 106 110" stroke="#fbbf24" strokeWidth="2" fill="none" />
        )}
      </g>
    );
  }

  // 6. TENGU KURAMA (MYTHIC_BEAST)
  if (subType === "tengu_kurama_beast" || subType === "tengu_kurama") {
    return (
      <g id="archetype-tengu">
        <rect x="88" y="115" width="24" height="25" fill="#991b1b" />
        <path d="M 45 138 Q 100 120 155 138 L 165 185 L 35 185 Z" fill="#18181b" />
        {/* Plumas Negras de Corvo ao redor do rosto */}
        <polygon points="45,65 25,85 52,90" fill="#09090b" />
        <polygon points="155,65 175,85 148,90" fill="#09090b" />
        <polygon points="40,95 20,115 50,115" fill="#09090b" />
        <polygon points="160,95 180,115 150,115" fill="#09090b" />
        {/* Rosto Vermelho Máscara de Tengu */}
        <ellipse cx="100" cy="94" rx="42" ry="44" fill="#dc2626" stroke="#991b1b" strokeWidth="2" />
        {/* Nariz Proeminente Cônico Tradicional de Tengu */}
        <polygon points="95,85 105,85 100,112" fill="#b91c1c" stroke="#7f1d1d" strokeWidth="1.5" />
        {/* Sobrancelhas Brancas Farpadas de Espírito da Montanha */}
        <polygon points="68,75 88,68 85,78" fill="#f8fafc" />
        <polygon points="132,75 112,68 115,78" fill="#f8fafc" />
        {/* Olhos Dourados Ferozes */}
        <circle cx="80" cy="84" r="7" fill="#fef08a" stroke="#7f1d1d" strokeWidth="1.5" filter={glow} />
        <circle cx="120" cy="84" r="7" fill="#fef08a" stroke="#7f1d1d" strokeWidth="1.5" filter={glow} />
        <circle cx="80" cy="84" r="3" fill="#000" />
        <circle cx="120" cy="84" r="3" fill="#000" />
        {/* Boca Máscara de Tengu */}
        {isSpeaking ? (
          <ellipse cx="100" cy="116" rx="8" ry="6" fill="#000" />
        ) : (
          <path d="M 90 115 Q 100 118 110 115" stroke="#450a0a" strokeWidth="3" fill="none" />
        )}
      </g>
    );
  }

  // FALLBACK HUMANO PADRÃO
  return (
    <g id="archetype-human-default">
      <rect x="88" y="115" width="24" height="25" fill="#fed7aa" />
      <path d="M 50 140 Q 100 120 150 140 L 160 185 L 40 185 Z" fill={primaryColor} />
      <circle cx="56" cy="92" r="10" fill="#fed7aa" />
      <circle cx="144" cy="92" r="10" fill="#fed7aa" />
      <ellipse cx="100" cy="94" rx="42" ry="44" fill="#ffedd5" />
      <path d="M 56 80 Q 60 45 100 45 Q 140 45 144 80 Q 135 60 100 58 Q 65 60 56 80 Z" fill="#78350f" />
      <circle cx="82" cy="88" r="6" fill="#1e293b" />
      <circle cx="118" cy="88" r="6" fill="#1e293b" />
      <circle cx="80" cy="86" r="2" fill="#fff" />
      <circle cx="116" cy="86" r="2" fill="#fff" />
      <path d="M 74 78 Q 82 75 90 78" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M 110 78 Q 118 75 126 78" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M 98 94 Q 100 98 103 98" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" fill="none" />
      {isSpeaking ? (
        <ellipse cx="100" cy="108" rx="8" ry="6" fill="#e11d48" />
      ) : (
        <path d="M 90 106 Q 100 114 110 106" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}
    </g>
  );
}

// =========================================================================
// 4. LEGS APPAREL LAYER (SLOT LEGS: GREVAS, BOTAS, CALÇAS)
// =========================================================================
function renderLegsApparel(
  legsId?: string | null,
  primaryColor: string = "#3b82f6",
  secondaryColor: string = "#f59e0b",
  ctx?: SvgContext
) {
  if (!legsId) return null;

  switch (legsId) {
    case "legs_botas_rusticas":
      return (
        <g id="legs-botas-rusticas">
          {/* Botas de couro dobradas na barra inferior */}
          <rect x="68" y="172" width="26" height="24" rx="4" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
          <rect x="106" y="172" width="26" height="24" rx="4" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
          <line x1="68" y1="178" x2="94" y2="178" stroke="#b45309" strokeWidth="2" />
          <line x1="106" y1="178" x2="132" y2="178" stroke="#b45309" strokeWidth="2" />
        </g>
      );
    case "legs_calcas_reforcadas":
      return (
        <g id="legs-calcas-reforcadas">
          <rect x="66" y="168" width="28" height="28" rx="3" fill="#334155" />
          <rect x="106" y="168" width="28" height="28" rx="3" fill="#334155" />
          {/* Joelheiras de reforço com costura cruzada */}
          <rect x="70" y="172" width="20" height="14" rx="2" fill="#475569" stroke="#64748b" strokeWidth="1" />
          <rect x="110" y="172" width="20" height="14" rx="2" fill="#475569" stroke="#64748b" strokeWidth="1" />
        </g>
      );
    case "legs_grevas_hyrule":
      return (
        <g id="legs-grevas-hyrule">
          {/* Botas de Andarilho de Hyrule com grevas e placas douradas */}
          <rect x="65" y="170" width="28" height="26" rx="4" fill="#92400e" stroke="#78350f" strokeWidth="1.5" />
          <rect x="107" y="170" width="28" height="26" rx="4" fill="#92400e" stroke="#78350f" strokeWidth="1.5" />
          {/* Placas de joelho douradas com símbolo de triforce sutil */}
          <polygon points="79,166 70,178 88,178" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <polygon points="121,166 112,178 130,178" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          {/* Fitas cruzadas */}
          <line x1="68" y1="182" x2="90" y2="190" stroke="#047857" strokeWidth="1.5" />
          <line x1="110" y1="182" x2="132" y2="190" stroke="#047857" strokeWidth="1.5" />
        </g>
      );
    default:
      return null;
  }
}

// =========================================================================
// 5. CHEST APPAREL LAYER (SLOT CHEST: ARMADURAS, MANTO, TÚNICA)
// =========================================================================
function renderBodyApparel(
  bodyId?: string | null,
  primaryColor: string = "#3b82f6",
  secondaryColor: string = "#f59e0b",
  ctx?: SvgContext
) {
  if (!bodyId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";
  const gold = ctx?.goldGrad || "url(#goldGrad)";

  switch (bodyId) {
    case "chest_tunica_novico":
      return (
        <g id="chest-tunica-novico">
          <path d="M 50 138 Q 100 126 150 138 L 158 185 L 42 185 Z" fill="#fef3c7" stroke="#e2e8f0" strokeWidth="1" />
          <path d="M 85 138 L 100 168 L 115 138 Z" fill="#b45309" />
          <rect x="58" y="166" width="84" height="8" fill="#78350f" />
          <rect x="94" y="163" width="12" height="14" rx="2" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />
        </g>
      );
    case "chest_gibao_couro":
      return (
        <g id="chest-gibao-couro">
          <path d="M 48 135 Q 100 122 152 135 L 160 185 L 40 185 Z" fill="#78350f" />
          <line x1="100" y1="135" x2="100" y2="185" stroke="#451a03" strokeWidth="2.5" />
          <line x1="85" y1="148" x2="115" y2="148" stroke="#d97706" strokeWidth="2" />
          <line x1="85" y1="160" x2="115" y2="160" stroke="#d97706" strokeWidth="2" />
        </g>
      );
    case "chest_manto_dalaran":
      return (
        <g id="chest-manto-dalaran">
          {/* Manto púrpura e dourado do Kirin Tor */}
          <path d="M 46 132 Q 100 118 154 132 L 162 185 L 38 185 Z" fill="#581c87" />
          <path d="M 82 132 L 100 178 L 118 132 Z" fill="#7e22ce" stroke="#fbbf24" strokeWidth="1.5" />
          {/* Olho místico de Dalaran central */}
          <circle cx="100" cy="150" r="7" fill="#fbbf24" filter={glow} />
          <circle cx="100" cy="150" r="3.5" fill="#3b82f6" />
          <line x1="44" y1="182" x2="164" y2="182" stroke="#fbbf24" strokeWidth="3" strokeDasharray="5 3" />
        </g>
      );
    case "chest_armadura_lobo_branco":
      return (
        <g id="chest-armadura-lobo">
          {/* Armadura de Geralt de Rívia / Escola do Lobo */}
          <path d="M 46 132 Q 100 118 154 132 L 162 185 L 38 185 Z" fill="#18181b" />
          {/* Cota de malha de aço nos ombros */}
          <path d="M 46 132 L 72 155 L 42 165 Z" fill="#52525b" />
          <path d="M 154 132 L 128 155 L 158 165 Z" fill="#52525b" />
          {/* Correia de couro diagonal para espada */}
          <line x1="55" y1="135" x2="145" y2="185" stroke="#78350f" strokeWidth="5" />
          <line x1="55" y1="135" x2="145" y2="185" stroke="#d97706" strokeWidth="1.5" />
          {/* Medalhão do Lobo Branco no peito */}
          <polygon points="100,140 92,150 100,158 108,150" fill="#e2e8f0" stroke="#000" strokeWidth="1" filter={glow} />
          <circle cx="96" cy="148" r="1" fill="#ef4444" />
          <circle cx="104" cy="148" r="1" fill="#ef4444" />
        </g>
      );
    case "starter_adventurer_robe":
      return (
        <g id="apparel-adventurer">
          <path d="M 52 140 Q 100 128 148 140 L 155 185 L 45 185 Z" fill="#2563eb" />
          <path d="M 85 140 L 100 165 L 115 140 Z" fill="#f59e0b" />
          <rect x="60" y="168" width="80" height="8" fill="#78350f" />
          <rect x="94" y="165" width="12" height="14" rx="2" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />
        </g>
      );
    default:
      return null;
  }
}

// =========================================================================
// 6. EYEWEAR LAYER (ÓCULOS / MÁSCARAS)
// =========================================================================
function renderEyewear(eyesId?: string, state: string = "idle", ctx?: SvgContext) {
  if (!eyesId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";

  switch (eyesId) {
    case "starter_glasses":
      return (
        <g id="eyewear-starter">
          <rect x="70" y="80" width="24" height="18" rx="5" fill="none" stroke="#0284c7" strokeWidth="2" />
          <rect x="106" y="80" width="24" height="18" rx="5" fill="none" stroke="#0284c7" strokeWidth="2" />
          <line x1="94" y1="88" x2="106" y2="88" stroke="#0284c7" strokeWidth="2" />
        </g>
      );
    case "eyes_cyber_visor":
      return (
        <g id="eyewear-cyber-visor" filter={glow}>
          <path d="M 64 80 L 136 80 L 130 96 L 70 96 Z" fill="#00f2fe" opacity="0.85" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="72" y1="88" x2="128" y2="88" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 2" />
        </g>
      );
    default:
      return null;
  }
}

// =========================================================================
// 7. ACCESSORY LAYER (SLOT ACCESSORY: PEDRA DE ROSETA, AMULETOS, ANEL)
// =========================================================================
function renderAccessoryItem(
  accessoryId?: string | null,
  primaryColor: string = "#3b82f6",
  secondaryColor: string = "#f59e0b",
  ctx?: SvgContext
) {
  if (!accessoryId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";
  const cyber = ctx?.cyberGrad || "url(#cyberGrad)";

  switch (accessoryId) {
    case "accessory_amuleto_concentracao":
      return (
        <g id="accessory-amuleto">
          <line x1="88" y1="125" x2="100" y2="140" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="112" y1="125" x2="100" y2="140" stroke="#cbd5e1" strokeWidth="1.5" />
          <circle cx="100" cy="142" r="7" fill="#10b981" stroke="#047857" strokeWidth="1.5" filter={glow} />
          <circle cx="100" cy="142" r="3" fill="#6ee7b7" />
        </g>
      );
    case "accessory_anel_eloquente":
      return (
        <g id="accessory-anel" filter={glow}>
          {/* Anel de ouro lapidado com rubi flutuante perto do peito/ombro */}
          <circle cx="132" cy="138" r="9" fill="none" stroke="#fbbf24" strokeWidth="3" />
          <polygon points="132,126 127,133 137,133" fill="#ef4444" stroke="#b91c1c" strokeWidth="1" />
        </g>
      );
    case "accessory_ampulheta_disciplina":
      return (
        <g id="accessory-ampulheta" filter={glow}>
          <rect x="62" y="132" width="14" height="2" fill="#d97706" />
          <polygon points="63,134 75,134 69,141" fill="#fef08a" stroke="#d97706" strokeWidth="0.8" />
          <polygon points="69,141 63,148 75,148" fill="#fef08a" stroke="#d97706" strokeWidth="0.8" />
          <rect x="62" y="148" width="14" height="2" fill="#d97706" />
        </g>
      );
    case "accessory_pedra_roseta":
      return (
        <g id="accessory-pedra-roseta" filter={glow}>
          {/* Fragmento da Histórica Pedra de Roseta - Relíquia Mítica Flutuante */}
          <path
            d="M 148 118 L 168 115 L 174 150 L 144 148 Z"
            fill="#1e293b"
            stroke="#fbbf24"
            strokeWidth="1.5"
          />
          {/* Linhas gravadas em grego, demótico e hieróglifos que brilham */}
          <line x1="150" y1="124" x2="166" y2="122" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="2 1" />
          <line x1="149" y1="130" x2="168" y2="128" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 1" />
          <line x1="148" y1="136" x2="170" y2="134" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="2 1" />
          <line x1="147" y1="142" x2="171" y2="140" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="4 2" />
        </g>
      );
    default:
      return null;
  }
}

// =========================================================================
// 8. HEADWEAR LAYER (SLOT HEAD: ELMOS, CHAPÉUS, COROAS)
// =========================================================================
function renderHeadwear(
  headId?: string | null,
  primaryColor: string = "#3b82f6",
  secondaryColor: string = "#f59e0b",
  ctx?: SvgContext
) {
  if (!headId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";
  const gold = ctx?.goldGrad || "url(#goldGrad)";
  const fire = ctx?.fireGrad || "url(#fireGrad)";

  switch (headId) {
    case "head_tiara_aprendiz":
      return (
        <g id="head-tiara-aprendiz">
          <path d="M 64 68 Q 100 52 136 68" stroke="#cbd5e1" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="100" cy="58" r="4.5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1" filter={glow} />
        </g>
      );
    case "head_bandana_caminhante":
      return (
        <g id="head-bandana-caminhante">
          <path d="M 56 68 L 144 68 L 142 77 L 58 77 Z" fill="#dc2626" />
          {/* Pontas esvoaçantes */}
          <path d="M 144 72 Q 165 74 176 66 Q 165 82 144 76" fill="#b91c1c" />
        </g>
      );
    case "head_elmo_astora":
      return (
        <g id="head-elmo-astora">
          {/* Elmo de Ferro de Astora (Solaire de Astora - Dark Souls) */}
          <path
            d="M 58 72 Q 60 28 100 28 Q 140 28 142 72 L 144 95 Q 100 90 56 95 Z"
            fill="#64748b"
            stroke="#334155"
            strokeWidth="2.5"
          />
          {/* Fenda em Cruz Solar de Astora */}
          <rect x="75" y="72" width="50" height="5" rx="1.5" fill="#0f172a" />
          <rect x="97" y="58" width="6" height="32" rx="1.5" fill="#0f172a" />
          {/* Emblema do Sol de Astora gravado no topo */}
          <circle cx="100" cy="46" r="8" fill="#fbbf24" stroke="#d97706" strokeWidth="1.5" filter={glow} />
          {/* Penacho verde/vermelho de cavaleiro */}
          <path d="M 100 28 Q 85 8 110 5 Q 105 18 100 28 Z" fill="#ef4444" />
        </g>
      );
    case "head_chapeu_vivi":
      return (
        <g id="head-chapeu-vivi">
          {/* Chapéu de Mago Negro de Vivi (Final Fantasy IX) */}
          <ellipse cx="100" cy="65" rx="58" ry="14" fill="#1e3a8a" stroke="#172554" strokeWidth="2" />
          <path d="M 62 65 Q 95 5 138 12 Q 115 42 138 65 Z" fill="#1d4ed8" />
          {/* Fita marrom com fivela dourada */}
          <path d="M 68 62 Q 100 58 132 62 L 132 68 Q 100 64 68 68 Z" fill="#78350f" />
          <rect x="94" y="60" width="12" height="9" rx="1" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
          {/* Sombra mágica cobrindo o rosto com olhos amarelos reluzentes de Vivi */}
          <ellipse cx="100" cy="85" rx="35" ry="16" fill="#0f172a" opacity="0.95" />
          <ellipse cx="85" cy="85" rx="5" ry="7" fill="#facc15" filter={glow} />
          <ellipse cx="115" cy="85" rx="5" ry="7" fill="#facc15" filter={glow} />
        </g>
      );
    case "head_coroa_louros_sangue":
      return (
        <g id="head-coroa-hades" filter={glow}>
          {/* Coroa de Louros de Sangue (Zagreus - Hades) com chamas do submundo */}
          <path d="M 60 70 Q 75 52 100 52 Q 125 52 140 70" stroke="#b91c1c" strokeWidth="4" fill="none" />
          {/* Folhas de Louro em Chamas */}
          <path d="M 68 64 Q 60 48 72 52 Q 74 60 68 64 Z" fill={fire} />
          <path d="M 82 56 Q 80 40 90 46 Q 90 54 82 56 Z" fill={fire} />
          <path d="M 100 52 Q 100 32 106 42 Q 104 50 100 52 Z" fill={fire} />
          <path d="M 118 56 Q 120 40 110 46 Q 110 54 118 56 Z" fill={fire} />
          <path d="M 132 64 Q 140 48 128 52 Q 126 60 132 64 Z" fill={fire} />
          {/* Partículas de brasa subindo */}
          <circle cx="76" cy="38" r="2" fill="#fbbf24" />
          <circle cx="124" cy="35" r="2.5" fill="#f97316" />
          <circle cx="102" cy="24" r="2" fill="#ef4444" />
        </g>
      );
    case "starter_cap":
      return (
        <g id="headwear-starter-cap">
          <path d="M 60 62 Q 100 40 140 62 L 140 68 L 60 68 Z" fill="#ef4444" />
          <path d="M 60 66 Q 40 68 35 74 Q 60 76 80 68 Z" fill="#dc2626" />
          <circle cx="100" cy="48" r="3" fill="#fef08a" />
        </g>
      );
    default:
      return null;
  }
}

// =========================================================================
// 9. MAIN HAND ITEM LAYER (SLOT MAIN_HAND: ESPADAS, CAJADOS, PENA)
// =========================================================================
function renderHandItem(handId?: string | null, state: string = "idle", ctx?: SvgContext) {
  if (!handId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";
  const cyber = ctx?.cyberGrad || "url(#cyberGrad)";

  switch (handId) {
    case "main_hand_pena_prata":
      return (
        <g id="main-hand-pena" filter={glow}>
          {/* Pena de Prata do Escriba */}
          <path d="M 152 145 Q 170 115 178 88 Q 164 105 158 132 L 150 150 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
          <polygon points="150,150 146,156 153,153" fill="#38bdf8" />
          <circle cx="146" cy="158" r="2" fill="#0284c7" />
        </g>
      );
    case "main_hand_cajado_carvalho":
      return (
        <g id="main-hand-cajado" filter={glow}>
          {/* Cajado de Carvalho dos Bosques coroado por esmeralda */}
          <line x1="152" y1="185" x2="168" y2="75" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="168" cy="70" r="10" fill="#10b981" stroke="#047857" strokeWidth="2" opacity="0.95" />
          <circle cx="166" cy="67" r="3.5" fill="#fff" />
        </g>
      );
    case "main_hand_espada_selo_arcano":
      return (
        <g id="main-hand-espada-arcana" filter={glow}>
          {/* Espada do Selo Arcano com runas azuis */}
          <rect x="146" y="148" width="6" height="16" rx="2" fill="#78350f" />
          <line x1="140" y1="148" x2="158" y2="148" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
          {/* Lâmina com runa gravada */}
          <path d="M 147 148 L 175 62 L 178 64 L 151 148 Z" fill="#f8fafc" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="150" y1="142" x2="172" y2="75" stroke="#00f2fe" strokeWidth="2.5" strokeDasharray="4 2" />
        </g>
      );
    case "main_hand_lamina_colossal_aco":
      return (
        <g id="main-hand-lamina-colossal">
          {/* Dragon Slayer de Berserk - Bloco massivo de ferro cru */}
          <rect x="145" y="142" width="7" height="22" rx="2" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
          <rect x="138" y="140" width="22" height="5" rx="1.5" fill="#1e293b" />
          {/* Lâmina gigante de ferro escuro */}
          <polygon
            points="144,140 182,30 194,35 158,140"
            fill="#334155"
            stroke="#0f172a"
            strokeWidth="2.5"
          />
          <line x1="151" y1="140" x2="188" y2="33" stroke="#64748b" strokeWidth="2" />
        </g>
      );
    case "starter_quill":
      return (
        <g id="hand-quill">
          <path d="M 152 145 Q 170 120 178 95 Q 165 110 158 135 L 150 150 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <polygon points="150,150 147,156 153,153" fill="#1e293b" />
        </g>
      );
    default:
      return null;
  }
}

// =========================================================================
// 10. OFF HAND ITEM LAYER (SLOT OFF_HAND: ESCUDOS, GRIMÓRIOS, LANTERNAS)
// =========================================================================
function renderOffHandItem(offHandId?: string | null, state: string = "idle", ctx?: SvgContext) {
  if (!offHandId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";

  switch (offHandId) {
    case "off_hand_adaga_precisao":
      return (
        <g id="offhand-adaga">
          <rect x="48" y="148" width="5" height="14" rx="2" fill="#78350f" />
          <line x1="42" y1="148" x2="58" y2="148" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
          <polygon points="48,148 28,110 52,148" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
        </g>
      );
    case "off_hand_lanterna_ecos":
      return (
        <g id="offhand-lanterna" filter={glow}>
          {/* Lanterna de latão com raios dourados de luz */}
          <line x1="45" y1="130" x2="45" y2="142" stroke="#78350f" strokeWidth="2" />
          <rect x="36" y="142" width="18" height="24" rx="3" fill="#fbbf24" stroke="#b45309" strokeWidth="2" />
          <rect x="39" y="145" width="12" height="18" fill="#fef08a" />
          {/* Raios sutis saindo */}
          <line x1="30" y1="154" x2="22" y2="154" stroke="#fbbf24" strokeWidth="2" />
          <line x1="32" y1="146" x2="24" y2="140" stroke="#fbbf24" strokeWidth="2" />
          <line x1="32" y1="162" x2="24" y2="168" stroke="#fbbf24" strokeWidth="2" />
        </g>
      );
    case "off_hand_escudo_perseveranca":
      return (
        <g id="offhand-escudo">
          {/* Escudo Rúnico de Cruzada / Perseverança */}
          <path d="M 28 126 L 58 126 Q 58 160 43 172 Q 28 160 28 126 Z" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="2" />
          {/* Cruz / Runa central */}
          <line x1="43" y1="132" x2="43" y2="162" stroke="#fbbf24" strokeWidth="3" />
          <line x1="32" y1="142" x2="54" y2="142" stroke="#fbbf24" strokeWidth="3" />
        </g>
      );
    case "off_hand_grimorio_idiomas":
      return (
        <g id="offhand-grimorio" filter={glow}>
          {/* Grimório dos Idiomas Perdidos Flutuante */}
          <rect x="22" y="130" width="30" height="40" rx="3" fill="#4c1d95" stroke="#fbbf24" strokeWidth="1.5" transform="rotate(15 22 130)" />
          {/* Páginas e runas flutuantes */}
          <rect x="25" y="133" width="24" height="34" rx="2" fill="#fef3c7" transform="rotate(15 22 130)" />
          <text x="32" y="152" fill="#7e22ce" fontSize="9" fontWeight="bold" transform="rotate(15 22 130)">ᚱΩ</text>
        </g>
      );
    default:
      return null;
  }
}

// =========================================================================
// 11. STATE OVERLAYS (FALA, ESCUTA, PENSAMENTO, CELEBRAÇÃO)
// =========================================================================
function renderStateOverlays(state: string, ctx?: SvgContext) {
  const glow = ctx?.glowEffect || "url(#glowEffect)";

  switch (state) {
    case "listening":
      return (
        <g id="state-listening" filter={glow}>
          <path d="M 38 78 Q 28 92 38 106" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 30 72 Q 18 92 30 112" stroke="#22c55e" strokeWidth="2" strokeDasharray="3 3" fill="none" strokeLinecap="round" />
          <path d="M 162 78 Q 172 92 162 106" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 170 72 Q 182 92 170 112" stroke="#22c55e" strokeWidth="2" strokeDasharray="3 3" fill="none" strokeLinecap="round" />
        </g>
      );
    case "thinking":
      return (
        <g id="state-thinking">
          <circle cx="150" cy="50" r="3" fill="#94a3b8" />
          <circle cx="160" cy="40" r="5" fill="#94a3b8" />
          <circle cx="175" cy="28" r="9" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          <text x="171" y="32" fontSize="11" fontWeight="bold" fill="#3b82f6">?</text>
        </g>
      );
    case "celebrating":
      return (
        <g id="state-celebrating" filter={glow}>
          <circle cx="35" cy="40" r="4" fill="#fbbf24" />
          <circle cx="165" cy="40" r="4" fill="#f43f5e" />
          <circle cx="25" cy="110" r="3" fill="#22c55e" />
          <circle cx="175" cy="110" r="3" fill="#38bdf8" />
          <path d="M 100 15 L 102 22 L 109 24 L 102 26 L 100 33 L 98 26 L 91 24 L 98 22 Z" fill="#fbbf24" />
        </g>
      );
    default:
      return null;
  }
}
