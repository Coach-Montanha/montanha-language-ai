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
  const subType = config?.subType || "adventurer";
  const primaryColor = config?.primaryColor || "#3b82f6";
  const secondaryColor = config?.secondaryColor || "#f59e0b";
  const equipped = config?.equipped || {};

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

  // Classes de animação baseadas no estado
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
      title={`Avatar: ${archetype} (${state})`}
    >
      <svg
        viewBox="0 0 200 200"
        width={pixelSize}
        height={pixelSize}
        className={`w-full h-full overflow-visible ${getStateAnimationClass()}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Gradientes e Filtros Dinamicamente Isolados */}
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
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* ============================================================ */}
        {/* 1. CAMADA DE AURA / BACKGROUND */}
        {/* ============================================================ */}
        {renderAuraLayer(equipped.aura, primaryColor, state, ctx)}

        {/* ============================================================ */}
        {/* 2. CAMADA DE CORPO BASE / ARQUÉTIPO (Humano, Animal, Monstro) */}
        {/* ============================================================ */}
        {renderBaseArchetype(archetype, subType, primaryColor, secondaryColor, state, ctx)}

        {/* ============================================================ */}
        {/* 3. CAMADA DE ROUPA / ARMADURA (BODY) */}
        {/* ============================================================ */}
        {renderBodyApparel(equipped.body, primaryColor, secondaryColor, ctx)}

        {/* ============================================================ */}
        {/* 4. CAMADA DE ROSTO / OLHOS / MÁSCARA (EYES) */}
        {/* ============================================================ */}
        {renderEyewear(equipped.eyes, state, ctx)}

        {/* ============================================================ */}
        {/* 5. CAMADA DE CABEÇA / CHAPÉU / ELMO (HEAD) */}
        {/* ============================================================ */}
        {renderHeadwear(equipped.head, primaryColor, secondaryColor, ctx)}

        {/* ============================================================ */}
        {/* 6. CAMADA DE ITEM DE MÃO (HAND) */}
        {/* ============================================================ */}
        {renderHandItem(equipped.hand, state, ctx)}

        {/* ============================================================ */}
        {/* 7. EFEITOS DE ESTADO (Fala, Escuta, Celebração, Pensamento) */}
        {/* ============================================================ */}
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
    case "aura_sakura_petals":
      return (
        <g>
          <circle cx="100" cy="100" r="88" fill="#f43f5e" fillOpacity="0.1" />
          <ellipse cx="40" cy="55" rx="8" ry="4" fill="#fb7185" transform="rotate(35 40 55)" />
          <ellipse cx="160" cy="65" rx="7" ry="4" fill="#fda4af" transform="rotate(-25 160 65)" />
          <ellipse cx="35" cy="130" rx="9" ry="5" fill="#fb7185" transform="rotate(15 35 130)" />
          <ellipse cx="165" cy="140" rx="8" ry="4" fill="#fda4af" transform="rotate(-40 165 140)" />
        </g>
      );
    case "aura_mystic_flame":
      return (
        <g filter={glow}>
          <circle cx="100" cy="100" r="88" fill="#3b82f6" fillOpacity="0.2" />
          <path d="M 30 110 Q 25 80 45 65 Q 40 85 55 95 Z" fill="#60a5fa" />
          <path d="M 170 110 Q 175 80 155 65 Q 160 85 145 95 Z" fill="#60a5fa" />
          <path d="M 100 25 Q 90 10 100 0 Q 110 10 100 25 Z" fill="#93c5fd" />
        </g>
      );
    case "aura_sacred_runes":
      return (
        <g>
          <circle cx="100" cy="100" r="92" stroke="#a855f7" strokeWidth="2" strokeDasharray="6 8" fill="#a855f7" fillOpacity="0.08" className="animate-spin origin-center duration-10000" />
          <text x="35" y="45" fill="#c084fc" fontSize="14" fontWeight="bold">ᚠ</text>
          <text x="155" y="45" fill="#c084fc" fontSize="14" fontWeight="bold">ᚨ</text>
          <text x="25" y="145" fill="#c084fc" fontSize="14" fontWeight="bold">ᚱ</text>
          <text x="165" y="145" fill="#c084fc" fontSize="14" fontWeight="bold">ᛗ</text>
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
// 2. BASE ARCHETYPES (HUMAN, ANIMAL, MONSTER)
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
  const fire = ctx?.fireGrad || "url(#fireGrad)";

  if (archetype === "animal") {
    if (subType === "owl" || subType.includes("owl")) {
      // CORUJA SÁBIA
      return (
        <g id="archetype-owl">
          {/* Corpo da Coruja */}
          <ellipse cx="100" cy="120" rx="55" ry="58" fill="#78350f" />
          <ellipse cx="100" cy="130" rx="38" ry="42" fill="#fef3c7" />
          {/* Asas */}
          <path d="M 45 100 Q 30 135 48 160 Q 60 145 55 110 Z" fill="#92400e" />
          <path d="M 155 100 Q 170 135 152 160 Q 140 145 145 110 Z" fill="#92400e" />
          {/* Penas da Cabeça / Tufo de orelhas */}
          <polygon points="65,65 50,30 85,55" fill="#92400e" />
          <polygon points="135,65 150,30 115,55" fill="#92400e" />
          {/* Cabeça */}
          <circle cx="100" cy="85" r="46" fill="#78350f" />
          <circle cx="100" cy="85" r="42" fill="#b45309" />
          {/* Olhos gigantes de coruja inteligente */}
          <circle cx="80" cy="82" r="16" fill="#fff" />
          <circle cx="120" cy="82" r="16" fill="#fff" />
          <circle cx="80" cy="82" r="9" fill="#1e293b" />
          <circle cx="120" cy="82" r="9" fill="#1e293b" />
          <circle cx="77" cy="79" r="3.5" fill="#fff" />
          <circle cx="117" cy="79" r="3.5" fill="#fff" />
          {/* Bico */}
          <polygon points="95,90 105,90 100,105" fill="#f59e0b" />
          {isSpeaking && <polygon points="96,98 104,98 100,108" fill="#d97706" />}
        </g>
      );
    }

    if (subType === "wolf" || subType.includes("wolf")) {
      // LOBO GUARDIÃO
      return (
        <g id="archetype-wolf">
          {/* Orelhas pontudas */}
          <polygon points="60,65 42,20 85,45" fill="#475569" />
          <polygon points="62,60 52,32 80,48" fill="#f1f5f9" />
          <polygon points="140,65 158,20 115,45" fill="#475569" />
          <polygon points="138,60 148,32 120,48" fill="#f1f5f9" />
          {/* Cabeça e Pelagem */}
          <ellipse cx="100" cy="120" rx="52" ry="55" fill="#334155" />
          <circle cx="100" cy="90" r="45" fill="#475569" />
          {/* Pelagem das bochechas */}
          <polygon points="55,90 35,98 55,108" fill="#64748b" />
          <polygon points="145,90 165,98 145,108" fill="#64748b" />
          {/* Focinho */}
          <ellipse cx="100" cy="102" rx="20" ry="16" fill="#f1f5f9" />
          <polygon points="94,94 106,94 100,102" fill="#0f172a" />
          {/* Olhos ambar vivos */}
          <ellipse cx="78" cy="80" rx="8" ry="6" fill="#f59e0b" transform="rotate(-10 78 80)" />
          <ellipse cx="122" cy="80" rx="8" ry="6" fill="#f59e0b" transform="rotate(10 122 80)" />
          <circle cx="78" cy="80" r="4" fill="#0f172a" />
          <circle cx="122" cy="80" r="4" fill="#0f172a" />
          {/* Boca */}
          <path d={isSpeaking ? "M 93 106 Q 100 116 107 106 Z" : "M 95 106 Q 100 110 105 106"} stroke="#0f172a" strokeWidth="2" fill={isSpeaking ? "#e11d48" : "none"} />
        </g>
      );
    }

    if (subType === "cat" || subType.includes("cat")) {
      // FELINO MÍSTICO
      return (
        <g id="archetype-cat">
          {/* Orelhas de Gato */}
          <polygon points="62,60 48,25 82,45" fill="#3b0764" />
          <polygon points="65,56 56,36 78,48" fill="#f472b6" />
          <polygon points="138,60 152,25 118,45" fill="#3b0764" />
          <polygon points="135,56 144,36 122,48" fill="#f472b6" />
          {/* Corpo e Cabeça */}
          <ellipse cx="100" cy="125" rx="50" ry="52" fill="#581c87" />
          <circle cx="100" cy="92" r="44" fill="#6b21a8" />
          {/* Olhos esmeralda místicos */}
          <ellipse cx="80" cy="85" rx="9" ry="11" fill="#10b981" />
          <ellipse cx="120" cy="85" rx="9" ry="11" fill="#10b981" />
          <ellipse cx="80" cy="85" rx="3" ry="8" fill="#064e3b" />
          <ellipse cx="120" cy="85" rx="3" ry="8" fill="#064e3b" />
          <circle cx="78" cy="82" r="2.5" fill="#fff" />
          <circle cx="118" cy="82" r="2.5" fill="#fff" />
          {/* Focinho e Bigodes */}
          <polygon points="97,97 103,97 100,101" fill="#f472b6" />
          <line x1="60" y1="98" x2="40" y2="94" stroke="#d8b4fe" strokeWidth="1.5" />
          <line x1="60" y1="102" x2="40" y2="105" stroke="#d8b4fe" strokeWidth="1.5" />
          <line x1="140" y1="98" x2="160" y2="94" stroke="#d8b4fe" strokeWidth="1.5" />
          <line x1="140" y1="102" x2="160" y2="105" stroke="#d8b4fe" strokeWidth="1.5" />
          <path d={isSpeaking ? "M 94 104 Q 100 114 106 104 Z" : "M 94 104 Q 100 108 106 104"} stroke="#0f172a" strokeWidth="1.5" fill={isSpeaking ? "#f43f5e" : "none"} />
        </g>
      );
    }

    // DRAGÃO ARCANO
    return (
      <g id="archetype-dragon">
        {/* Asas pequenas de Dragão */}
        <path d="M 45 110 Q 15 95 20 135 Q 35 130 48 140 Z" fill="#991b1b" />
        <path d="M 155 110 Q 185 95 180 135 Q 165 130 152 140 Z" fill="#991b1b" />
        {/* Corpo e Cabeça */}
        <ellipse cx="100" cy="125" rx="52" ry="55" fill="#b91c1c" />
        <ellipse cx="100" cy="135" rx="34" ry="40" fill="#fef08a" />
        <circle cx="100" cy="90" r="44" fill="#dc2626" />
        {/* Chifres */}
        <path d="M 68 55 Q 50 25 35 30 Q 55 45 72 65" fill="#f59e0b" />
        <path d="M 132 55 Q 150 25 165 30 Q 145 45 128 65" fill="#f59e0b" />
        {/* Olhos de Dragão */}
        <ellipse cx="80" cy="84" rx="8" ry="10" fill="#fbbf24" />
        <ellipse cx="120" cy="84" rx="8" ry="10" fill="#fbbf24" />
        <ellipse cx="80" cy="84" rx="2.5" ry="8" fill="#7f1d1d" />
        <ellipse cx="120" cy="84" rx="2.5" ry="8" fill="#7f1d1d" />
        {/* Focinho Dracônico */}
        <ellipse cx="100" cy="102" rx="16" ry="10" fill="#991b1b" />
        <circle cx="94" cy="101" r="2.5" fill="#450a0a" />
        <circle cx="106" cy="101" r="2.5" fill="#450a0a" />
        {isSpeaking && <path d="M 92 108 Q 100 120 108 108 Z" fill="#f97316" />}
      </g>
    );
  }

  if (archetype === "monster") {
    if (subType === "golem" || subType.includes("golem")) {
      // GOLEM DE CRISTAL
      return (
        <g id="archetype-golem">
          {/* Ombros e Corpo de Rocha Cúbica */}
          <rect x="50" y="105" width="100" height="75" rx="16" fill="#334155" />
          <rect x="65" y="120" width="70" height="50" rx="8" fill="#475569" />
          {/* Cabeça de Golem */}
          <rect x="62" y="55" width="76" height="65" rx="14" fill="#475569" stroke="#64748b" strokeWidth="2" />
          {/* Cristal na Testa */}
          <polygon points="100,50 108,62 100,74 92,62" fill="#38bdf8" filter={glow} />
          {/* Olhos de Cristal Luminosos */}
          <rect x="76" y="80" width="14" height="8" rx="2" fill="#00f2fe" filter={glow} />
          <rect x="110" y="80" width="14" height="8" rx="2" fill="#00f2fe" filter={glow} />
          {/* Runa na boca */}
          <line x1="88" y1="104" x2="112" y2="104" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    }

    if (subType === "elemental" || subType.includes("elemental")) {
      // ELEMENTAL SAGRADO / ENERGIA PURA
      return (
        <g id="archetype-elemental">
          {/* Corpo Fluido de Energia */}
          <circle cx="100" cy="120" r="55" fill={fire} filter={glow} opacity="0.9" />
          <circle cx="100" cy="85" r="44" fill="#fb923c" filter={glow} />
          {/* Halo ao redor da cabeça */}
          <circle cx="100" cy="85" r="52" stroke="#fed7aa" strokeWidth="3" strokeDasharray="10 8" fill="none" className="animate-spin origin-[100px_85px]" />
          {/* Olhos Radiantes Brancos */}
          <ellipse cx="82" cy="82" rx="7" ry="10" fill="#fff" filter={glow} />
          <ellipse cx="118" cy="82" rx="7" ry="10" fill="#fff" filter={glow} />
          {/* Sorriso radiante */}
          <path d={isSpeaking ? "M 88 98 Q 100 114 112 98 Z" : "M 90 98 Q 100 105 110 98"} stroke="#fff" strokeWidth="3" fill={isSpeaking ? "#fff" : "none"} strokeLinecap="round" />
        </g>
      );
    }

    // DUENDE INVENTOR / GOBLIN
    return (
      <g id="archetype-goblin">
        {/* Orelhas Longas de Duende */}
        <polygon points="65,80 15,65 62,95" fill="#16a34a" />
        <polygon points="62,82 25,70 60,92" fill="#86efac" />
        <polygon points="135,80 185,65 138,95" fill="#16a34a" />
        <polygon points="138,82 175,70 140,92" fill="#86efac" />
        {/* Corpo e Cabeça Verde */}
        <ellipse cx="100" cy="125" rx="52" ry="55" fill="#15803d" />
        <circle cx="100" cy="90" r="44" fill="#22c55e" />
        {/* Nariz arrebitado */}
        <ellipse cx="100" cy="94" rx="7" ry="5" fill="#16a34a" />
        {/* Olhos espertos */}
        <circle cx="82" cy="82" r="7" fill="#fef08a" />
        <circle cx="118" cy="82" r="7" fill="#fef08a" />
        <circle cx="83" cy="82" r="4" fill="#14532d" />
        <circle cx="117" cy="82" r="4" fill="#14532d" />
        {/* Sorriso travesso */}
        <path d={isSpeaking ? "M 84 104 Q 100 118 116 104 Z" : "M 86 104 Q 100 112 114 104"} stroke="#14532d" strokeWidth="2.5" fill={isSpeaking ? "#f43f5e" : "none"} />
      </g>
    );
  }

  // ==========================================
  // HUMANO (PADRÃO / AVENTUREIRO / ERUDITO)
  // ==========================================
  return (
    <g id="archetype-human">
      {/* Pescoço e Ombros */}
      <rect x="88" y="115" width="24" height="25" fill="#fed7aa" />
      <path d="M 50 140 Q 100 120 150 140 L 160 185 L 40 185 Z" fill={primaryColor} />
      {/* Orelhas */}
      <circle cx="56" cy="92" r="10" fill="#fed7aa" />
      <circle cx="144" cy="92" r="10" fill="#fed7aa" />
      {/* Cabeça / Rosto */}
      <ellipse cx="100" cy="92" rx="44" ry="46" fill="#fcd34d" />
      <ellipse cx="100" cy="94" rx="42" ry="44" fill="#ffedd5" />
      {/* Cabelo moderno estilizado */}
      <path d="M 56 80 Q 60 45 100 45 Q 140 45 144 80 Q 135 60 100 58 Q 65 60 56 80 Z" fill="#78350f" />
      {/* Olhos amigáveis */}
      <circle cx="82" cy="88" r="6" fill="#1e293b" />
      <circle cx="118" cy="88" r="6" fill="#1e293b" />
      <circle cx="80" cy="86" r="2" fill="#fff" />
      <circle cx="116" cy="86" r="2" fill="#fff" />
      {/* Sobrancelhas */}
      <path d="M 74 78 Q 82 75 90 78" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      <path d="M 110 78 Q 118 75 126 78" stroke="#78350f" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      {/* Nariz sutil */}
      <path d="M 98 94 Q 100 98 103 98" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Bochechas coradas */}
      <circle cx="72" cy="98" r="6" fill="#fda4af" opacity="0.5" />
      <circle cx="128" cy="98" r="6" fill="#fda4af" opacity="0.5" />
      {/* Boca com animação de fala */}
      {isSpeaking ? (
        <ellipse cx="100" cy="108" rx="8" ry="6" fill="#e11d48" />
      ) : (
        <path d="M 90 106 Q 100 114 110 106" stroke="#e11d48" strokeWidth="2.5" strokeLinecap="round" fill="none" />
      )}
    </g>
  );
}

function renderBodyApparel(
  bodyId?: string,
  primaryColor: string = "#3b82f6",
  secondaryColor: string = "#f59e0b",
  ctx?: SvgContext
) {
  if (!bodyId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";
  const gold = ctx?.goldGrad || "url(#goldGrad)";

  switch (bodyId) {
    case "starter_adventurer_robe":
      return (
        <g id="apparel-adventurer">
          <path d="M 52 140 Q 100 128 148 140 L 155 185 L 45 185 Z" fill="#2563eb" />
          <path d="M 85 140 L 100 165 L 115 140 Z" fill="#f59e0b" />
          {/* Cinto com fivela */}
          <rect x="60" y="168" width="80" height="8" fill="#78350f" />
          <rect x="94" y="165" width="12" height="14" rx="2" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />
        </g>
      );
    case "body_street_hoodie":
      return (
        <g id="apparel-hoodie">
          <path d="M 48 135 Q 100 125 152 135 L 158 185 L 42 185 Z" fill="#334155" />
          <path d="M 75 135 Q 100 155 125 135" stroke="#f8fafc" strokeWidth="3" fill="none" />
          <line x1="94" y1="145" x2="94" y2="165" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
          <line x1="106" y1="145" x2="106" y2="165" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    case "body_mage_robe":
      return (
        <g id="apparel-mage">
          <path d="M 46 135 Q 100 120 154 135 L 160 185 L 40 185 Z" fill="#6b21a8" />
          <path d="M 90 135 L 100 175 L 110 135 Z" fill="#a855f7" />
          <circle cx="100" cy="142" r="5" fill="#fbbf24" filter={glow} />
          {/* Borda dourada bordada */}
          <path d="M 46 182 L 160 182" stroke="#fbbf24" strokeWidth="3" strokeDasharray="4 2" />
        </g>
      );
    case "body_cyber_jacket":
      return (
        <g id="apparel-cyber">
          <path d="M 48 135 Q 100 122 152 135 L 158 185 L 42 185 Z" fill="#0f172a" />
          {/* Linhas neon ciano */}
          <path d="M 60 140 L 70 185" stroke="#00f2fe" strokeWidth="3" filter={glow} />
          <path d="M 140 140 L 130 185" stroke="#00f2fe" strokeWidth="3" filter={glow} />
          <rect x="92" y="145" width="16" height="40" rx="3" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
        </g>
      );
    case "body_kimono":
      return (
        <g id="apparel-kimono">
          <path d="M 48 135 Q 100 125 152 135 L 158 185 L 42 185 Z" fill="#be123c" />
          <path d="M 75 135 L 125 185" stroke="#ffe4e6" strokeWidth="4" />
          <path d="M 125 135 L 75 185" stroke="#ffe4e6" strokeWidth="4" />
          {/* Obi Faixa Larga */}
          <rect x="58" y="160" width="84" height="16" fill="#1e1b4b" />
          <rect x="88" y="162" width="24" height="12" fill="#fbbf24" />
        </g>
      );
    case "body_space_suit":
      return (
        <g id="apparel-spacesuit">
          <path d="M 48 135 Q 100 125 152 135 L 158 185 L 42 185 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="2" />
          <rect x="75" y="148" width="50" height="28" rx="6" fill="#0284c7" />
          <circle cx="88" cy="162" r="4" fill="#22c55e" />
          <circle cx="100" cy="162" r="4" fill="#eab308" />
          <circle cx="112" cy="162" r="4" fill="#ef4444" />
        </g>
      );
    case "body_golden_armor":
      return (
        <g id="apparel-golden-armor" filter={glow}>
          <path d="M 48 132 Q 100 118 152 132 L 160 185 L 40 185 Z" fill={gold} stroke="#78350f" strokeWidth="1.5" />
          <circle cx="100" cy="155" r="12" fill="#e11d48" stroke="#fbbf24" strokeWidth="2" />
          {/* Ombreiras */}
          <ellipse cx="45" cy="142" rx="14" ry="10" fill="#f59e0b" />
          <ellipse cx="155" cy="142" rx="14" ry="10" fill="#f59e0b" />
        </g>
      );
    default:
      return null;
  }
}

// =========================================================================
// 4. EYEWEAR LAYER (ÓCULOS, MÁSCARAS, VISEIRAS)
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
    case "eyes_intellectual_glasses":
      return (
        <g id="eyewear-intellectual">
          <circle cx="80" cy="88" r="12" fill="none" stroke="#78350f" strokeWidth="3" />
          <circle cx="120" cy="88" r="12" fill="none" stroke="#78350f" strokeWidth="3" />
          <path d="M 92 88 Q 100 84 108 88" stroke="#78350f" strokeWidth="3" fill="none" />
        </g>
      );
    case "eyes_cyber_visor":
      return (
        <g id="eyewear-cyber-visor" filter={glow}>
          <path d="M 64 80 L 136 80 L 130 96 L 70 96 Z" fill="#00f2fe" opacity="0.85" stroke="#38bdf8" strokeWidth="1.5" />
          <line x1="72" y1="88" x2="128" y2="88" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 2" />
        </g>
      );
    case "eyes_ninja_mask":
      return (
        <g id="eyewear-ninja">
          <path d="M 60 96 Q 100 90 140 96 L 142 125 Q 100 135 58 125 Z" fill="#0f172a" />
        </g>
      );
    case "eyes_golden_monocle":
      return (
        <g id="eyewear-monocle">
          <circle cx="118" cy="88" r="13" fill="#fbbf24" fillOpacity="0.2" stroke="#d97706" strokeWidth="2.5" />
          <path d="M 131 88 Q 145 105 140 130" stroke="#d97706" strokeWidth="1.5" fill="none" />
        </g>
      );
    case "eyes_star_shades":
      return (
        <g id="eyewear-star-shades">
          <polygon points="80,76 84,86 94,86 86,92 89,102 80,96 71,102 74,92 66,86 76,86" fill="#18181b" stroke="#fbbf24" strokeWidth="1" />
          <polygon points="120,76 124,86 134,86 126,92 129,102 120,96 111,102 114,92 106,86 116,86" fill="#18181b" stroke="#fbbf24" strokeWidth="1" />
          <line x1="94" y1="86" x2="106" y2="86" stroke="#fbbf24" strokeWidth="2" />
        </g>
      );
    case "eyes_pirate_patch":
      return (
        <g id="eyewear-pirate">
          <ellipse cx="80" cy="88" rx="10" ry="11" fill="#18181b" />
          <line x1="56" y1="76" x2="140" y2="98" stroke="#18181b" strokeWidth="2" />
        </g>
      );
    case "eyes_mystic_blindfold":
      return (
        <g id="eyewear-blindfold">
          <rect x="60" y="80" width="80" height="18" rx="4" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="100" cy="89" r="4" fill="#38bdf8" filter={glow} />
        </g>
      );
    default:
      return null;
  }
}

// =========================================================================
// 5. HEADWEAR LAYER (CHAPÉUS, COROAS, FONES)
// =========================================================================
function renderHeadwear(
  headId?: string,
  primaryColor: string = "#3b82f6",
  secondaryColor: string = "#f59e0b",
  ctx?: SvgContext
) {
  if (!headId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";
  const gold = ctx?.goldGrad || "url(#goldGrad)";

  switch (headId) {
    case "starter_cap":
      return (
        <g id="headwear-starter-cap">
          <path d="M 60 62 Q 100 40 140 62 L 140 68 L 60 68 Z" fill="#ef4444" />
          {/* Aba do boné virada */}
          <path d="M 60 66 Q 40 68 35 74 Q 60 76 80 68 Z" fill="#dc2626" />
          <circle cx="100" cy="48" r="3" fill="#fef08a" />
        </g>
      );
    case "head_wizard_hat":
      return (
        <g id="headwear-wizard">
          <ellipse cx="100" cy="65" rx="55" ry="12" fill="#4c1d95" />
          <path d="M 65 64 Q 100 10 135 15 Q 120 40 135 64 Z" fill="#6d28d9" />
          <rect x="75" y="58" width="50" height="7" fill="#fbbf24" />
          <circle cx="135" cy="15" r="4" fill="#fef08a" filter={glow} />
        </g>
      );
    case "head_gamer_headset":
      return (
        <g id="headwear-headset" filter={glow}>
          {/* Arco dos fones */}
          <path d="M 52 90 Q 50 35 100 35 Q 150 35 148 90" stroke="#0f172a" strokeWidth="6" fill="none" strokeLinecap="round" />
          <path d="M 52 90 Q 50 35 100 35 Q 150 35 148 90" stroke="#00f2fe" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Conchas auriculares com anel RGB */}
          <rect x="42" y="80" width="12" height="24" rx="5" fill="#1e293b" stroke="#f43f5e" strokeWidth="2" />
          <rect x="146" y="80" width="12" height="24" rx="5" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          {/* Haste do Microfone */}
          <path d="M 48 96 Q 50 114 68 114" stroke="#0f172a" strokeWidth="3" fill="none" />
          <circle cx="70" cy="114" r="3.5" fill="#22c55e" />
        </g>
      );
    case "head_knight_helmet":
      return (
        <g id="headwear-knight">
          <path d="M 60 70 Q 100 35 140 70 L 142 85 Q 100 80 58 85 Z" fill="#64748b" stroke="#334155" strokeWidth="2" />
          {/* Penacho vermelho do topo */}
          <path d="M 100 38 Q 90 10 115 14 Q 105 28 100 38" fill="#ef4444" />
          {/* Fenda dos olhos */}
          <rect x="75" y="72" width="50" height="5" rx="2" fill="#0f172a" />
        </g>
      );
    case "head_samurai_bandana":
      return (
        <g id="headwear-samurai">
          <path d="M 56 66 L 144 66 L 142 76 L 58 76 Z" fill="#dc2626" />
          <circle cx="100" cy="71" r="4" fill="#fff" />
          {/* Pontas da bandana esvoaçando */}
          <path d="M 144 71 Q 165 74 175 66 Q 165 80 144 76" fill="#b91c1c" />
        </g>
      );
    case "head_detective_hat":
      return (
        <g id="headwear-detective">
          <ellipse cx="100" cy="62" rx="52" ry="10" fill="#78350f" />
          <path d="M 65 62 Q 100 38 135 62 Z" fill="#92400e" />
          <line x1="68" y1="62" x2="132" y2="62" stroke="#451a03" strokeWidth="2" />
        </g>
      );
    case "head_winter_beanie":
      return (
        <g id="headwear-beanie">
          <path d="M 62 68 Q 100 35 138 68 Z" fill="#0284c7" />
          <rect x="58" y="64" width="84" height="8" rx="3" fill="#bae6fd" />
          <circle cx="100" cy="34" r="7" fill="#f0f9ff" />
        </g>
      );
    case "head_dragon_horns":
      return (
        <g id="headwear-dragon-horns" filter={glow}>
          <path d="M 72 58 Q 50 15 30 25 Q 55 42 78 65" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
          <path d="M 128 58 Q 150 15 170 25 Q 145 42 122 65" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
        </g>
      );
    case "head_golden_crown":
      return (
        <g id="headwear-crown" filter={glow}>
          <polygon points="62,65 60,35 78,50 100,25 122,50 140,35 138,65" fill={gold} stroke="#b45309" strokeWidth="1.5" />
          <circle cx="60" cy="35" r="3" fill="#ef4444" />
          <circle cx="100" cy="25" r="4" fill="#3b82f6" />
          <circle cx="140" cy="35" r="3" fill="#10b981" />
        </g>
      );
    default:
      return null;
  }
}

// =========================================================================
// 6. HAND ITEM LAYER (ITENS DE MÃO)
// =========================================================================
function renderHandItem(handId?: string, state: string = "idle", ctx?: SvgContext) {
  if (!handId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";
  const gold = ctx?.goldGrad || "url(#goldGrad)";

  switch (handId) {
    case "starter_quill":
      return (
        <g id="hand-quill">
          <path d="M 152 145 Q 170 120 178 95 Q 165 110 158 135 L 150 150 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
          <polygon points="150,150 147,156 153,153" fill="#1e293b" />
        </g>
      );
    case "hand_magic_wand":
      return (
        <g id="hand-wand" filter={glow}>
          <line x1="145" y1="155" x2="175" y2="115" stroke="#78350f" strokeWidth="3" strokeLinecap="round" />
          <polygon points="175,115 177,108 184,115 177,117" fill="#fbbf24" />
          <circle cx="176" cy="113" r="4" fill="#38bdf8" />
        </g>
      );
    case "hand_ancient_grimoire":
      return (
        <g id="hand-grimoire">
          <rect x="140" y="125" width="28" height="38" rx="3" fill="#7f1d1d" stroke="#f59e0b" strokeWidth="1.5" transform="rotate(-15 140 125)" />
          <circle cx="152" cy="142" r="5" fill="#f59e0b" />
          <line x1="142" y1="162" x2="162" y2="157" stroke="#fbbf24" strokeWidth="2" />
        </g>
      );
    case "hand_golden_mic":
      return (
        <g id="hand-golden-mic" filter={glow}>
          <rect x="155" y="125" width="10" height="18" rx="5" fill={gold} stroke="#78350f" strokeWidth="1" />
          <line x1="160" y1="143" x2="160" y2="160" stroke="#475569" strokeWidth="3" strokeLinecap="round" />
          {/* Ondas sonoras emitidas */}
          <path d="M 170 128 Q 175 134 170 140" stroke="#f59e0b" strokeWidth="2" fill="none" />
          <path d="M 175 124 Q 183 134 175 144" stroke="#fbbf24" strokeWidth="2" fill="none" />
        </g>
      );
    case "hand_crystal_staff":
      return (
        <g id="hand-staff" filter={glow}>
          <line x1="152" y1="180" x2="168" y2="85" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
          <circle cx="168" cy="80" r="10" fill="#38bdf8" stroke="#0284c7" strokeWidth="2" opacity="0.9" />
          <circle cx="166" cy="78" r="4" fill="#fff" />
        </g>
      );
    case "hand_runic_shield":
      return (
        <g id="hand-shield">
          <path d="M 140 125 L 165 125 Q 165 155 152 165 Q 140 155 140 125 Z" fill="#1e293b" stroke="#38bdf8" strokeWidth="2" />
          <polygon points="152,132 158,144 152,148 146,144" fill="#38bdf8" />
        </g>
      );
    case "hand_beam_sword":
      return (
        <g id="hand-beam-sword" filter={glow}>
          <rect x="146" y="148" width="6" height="16" rx="2" fill="#334155" />
          <line x1="149" y1="148" x2="175" y2="75" stroke="#00f2fe" strokeWidth="5" strokeLinecap="round" />
          <line x1="149" y1="148" x2="175" y2="75" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </g>
      );
    default:
      return null;
  }
}

// =========================================================================
// 7. STATE OVERLAYS (INDICADORES VISUAIS DE FALA, ESCUTA, ETC.)
// =========================================================================
function renderStateOverlays(state: string, ctx?: SvgContext) {
  const glow = ctx?.glowEffect || "url(#glowEffect)";

  switch (state) {
    case "listening":
      return (
        <g id="state-listening" filter={glow}>
          {/* Ondas de escuta atenta ao redor da cabeça */}
          <path d="M 38 78 Q 28 92 38 106" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 30 72 Q 18 92 30 112" stroke="#22c55e" strokeWidth="2" strokeDasharray="3 3" fill="none" strokeLinecap="round" />
          <path d="M 162 78 Q 172 92 162 106" stroke="#22c55e" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 170 72 Q 182 92 170 112" stroke="#22c55e" strokeWidth="2" strokeDasharray="3 3" fill="none" strokeLinecap="round" />
        </g>
      );
    case "thinking":
      return (
        <g id="state-thinking">
          {/* Balão de pensamento */}
          <circle cx="150" cy="50" r="3" fill="#94a3b8" />
          <circle cx="160" cy="40" r="5" fill="#94a3b8" />
          <circle cx="175" cy="28" r="9" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
          <text x="171" y="32" fontSize="11" fontWeight="bold" fill="#3b82f6">?</text>
        </g>
      );
    case "celebrating":
      return (
        <g id="state-celebrating" filter={glow}>
          {/* Faíscas e confetes de vitória */}
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
