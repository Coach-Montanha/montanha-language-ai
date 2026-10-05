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
  angelingJelly: string;
  angelingWing: string;
  angelingHalo: string;
  kaelenHair: string;
  kaelenHairSheen: string;
  kaelenArmor: string;
  goldTrim: string;
  silverBlade: string;
  lyannaHair: string;
  lyannaRobe: string;
  ignisaurFire: string;
  ignisaurHorn: string;
  baphometHorn: string;
  baphometEye: string;
  skinShade: string;
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
  const subType = config?.subType || "char_tactician_m";
  const primaryColor = config?.primaryColor || "#38bdf8";
  const secondaryColor = config?.secondaryColor || "#fbbf24";
  const eq = (config?.equipped || {}) as Record<string, string | null | undefined>;

  // Apenas mascotes redondas/esféricas (como Angeling ou Slime) requerem adaptação de itens sobre o corpo
  const isBlobMascot =
    subType === "ro_chibi_angeling_base" ||
    subType === "char_angeling" ||
    subType === "starter_monster_elemental";

  // Slot Resolution: se a chave maiúscula estiver explicitamente definida (mesmo que null para unequipped),
  // respeitamos seu valor. Apenas se undefined consultamos os fallbacks em minúsculo.
  const resolveSlot = (primaryKey: string, ...fallbackKeys: string[]): string | null => {
    if (eq[primaryKey] !== undefined) return eq[primaryKey];
    for (const key of fallbackKeys) {
      if (eq[key] !== undefined) return eq[key];
    }
    return null;
  };

  const backId = resolveSlot("BACKPACK_CAPE", "GARMENT", "BACK", "back");
  const backpackId = resolveSlot("BACKPACK", "backpack");
  const legsId = resolveSlot("FOOTGEAR", "LEGS", "legs");
  const chestId = resolveSlot("OUTFIT", "ARMOR", "CHEST", "chest", "body");
  const headId = resolveSlot("HEADWEAR", "HEAD_UPPER", "HEAD", "head");
  const eyesId = resolveSlot("HEAD_MIDDLE", "eyes");
  const headLowerId = resolveSlot("HEAD_LOWER", "head_lower");
  const mainHandId = resolveSlot("MAIN_TOOL", "RIGHT_HAND", "MAIN_HAND", "hand");
  const offHandId = resolveSlot("OFF_TOOL", "LEFT_HAND", "OFF_HAND", "off_hand", "offHand");
  const petId = resolveSlot("FAMILIAR", "PET_FAMILIAR", "pet", "pet_familiar");
  const accessoryId = resolveSlot("ACCESSORY", "accessory");
  const auraId = eq["aura"] || undefined;

  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const goldGradId = `goldGrad_${uid}`;
  const cyberGradId = `cyberGrad_${uid}`;
  const purpleGradId = `purpleGrad_${uid}`;
  const fireGradId = `fireGrad_${uid}`;
  const auraGlowId = `auraGlow_${uid}`;
  const glowEffectId = `glowEffect_${uid}`;
  const angelingJellyId = `angelingJelly_${uid}`;
  const angelingWingId = `angelingWing_${uid}`;
  const angelingHaloId = `angelingHalo_${uid}`;
  const kaelenHairId = `kaelenHair_${uid}`;
  const kaelenSheenId = `kaelenSheen_${uid}`;
  const kaelenArmorId = `kaelenArmor_${uid}`;
  const goldTrimId = `goldTrim_${uid}`;
  const silverBladeId = `silverBlade_${uid}`;
  const lyannaHairId = `lyannaHair_${uid}`;
  const lyannaRobeId = `lyannaRobe_${uid}`;
  const ignisaurFireId = `ignisaurFire_${uid}`;
  const ignisaurHornId = `ignisaurHorn_${uid}`;
  const baphometHornId = `baphometHorn_${uid}`;
  const baphometEyeId = `baphometEye_${uid}`;
  const skinShadeId = `skinShade_${uid}`;

  const ctx: SvgContext = {
    goldGrad: `url(#${goldGradId})`,
    cyberGrad: `url(#${cyberGradId})`,
    purpleGrad: `url(#${purpleGradId})`,
    fireGrad: `url(#${fireGradId})`,
    auraGlow: `url(#${auraGlowId})`,
    glowEffect: `url(#${glowEffectId})`,
    angelingJelly: `url(#${angelingJellyId})`,
    angelingWing: `url(#${angelingWingId})`,
    angelingHalo: `url(#${angelingHaloId})`,
    kaelenHair: `url(#${kaelenHairId})`,
    kaelenHairSheen: `url(#${kaelenSheenId})`,
    kaelenArmor: `url(#${kaelenArmorId})`,
    goldTrim: `url(#${goldTrimId})`,
    silverBlade: `url(#${silverBladeId})`,
    lyannaHair: `url(#${lyannaHairId})`,
    lyannaRobe: `url(#${lyannaRobeId})`,
    ignisaurFire: `url(#${ignisaurFireId})`,
    ignisaurHorn: `url(#${ignisaurHornId})`,
    baphometHorn: `url(#${baphometHornId})`,
    baphometEye: `url(#${baphometEyeId})`,
    skinShade: `url(#${skinShadeId})`,
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
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="40%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#b45309" />
          </linearGradient>
          <linearGradient id={goldTrimId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#fbbf24" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id={silverBladeId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#94a3b8" />
          </linearGradient>
          <linearGradient id={cyberGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#2563eb" />
          </linearGradient>
          <linearGradient id={purpleGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c084fc" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>
          <linearGradient id={fireGradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>
          <radialGradient id={angelingJellyId} cx="38%" cy="32%" r="65%">
            <stop offset="0%" stopColor="#ffe4e6" />
            <stop offset="25%" stopColor="#f472b6" />
            <stop offset="70%" stopColor="#e11d48" />
            <stop offset="100%" stopColor="#881337" />
          </radialGradient>
          <linearGradient id={angelingWingId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#f1f5f9" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>
          <linearGradient id={angelingHaloId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="30%" stopColor="#fbbf24" />
            <stop offset="70%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>
          <linearGradient id={kaelenHairId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id={kaelenSheenId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
            <stop offset="50%" stopColor="#7dd3fc" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.2" />
          </linearGradient>
          <linearGradient id={kaelenArmorId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="50%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <linearGradient id={lyannaHairId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f5d0fe" />
            <stop offset="45%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#7e22ce" />
          </linearGradient>
          <linearGradient id={lyannaRobeId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#581c87" />
            <stop offset="60%" stopColor="#3b0764" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id={ignisaurFireId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="35%" stopColor="#f97316" />
            <stop offset="75%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </linearGradient>
          <linearGradient id={ignisaurHornId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#78350f" />
            <stop offset="50%" stopColor="#451a03" />
            <stop offset="100%" stopColor="#1c1917" />
          </linearGradient>
          <linearGradient id={baphometHornId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          <radialGradient id={baphometEyeId} cx="40%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#fca5a5" />
            <stop offset="40%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#7f1d1d" />
          </radialGradient>
          <linearGradient id={skinShadeId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#e5b89c" />
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

        {/* 0. CAMADA DE SOMBRA NO CHÃO (SHADOW LAYER = 0) */}
        <ellipse cx="100" cy="188" rx="46" ry="6" fill="#0f172a" opacity="0.22" />

        {/* 1. CAMADA DE AURA / BACKGROUND */}
        {renderAuraLayer(auraId, primaryColor, state, ctx)}

        {/* 2. LAYER_BACK (GARMENT / ASAS / CAPAS) */}
        {renderBackItem(backId, primaryColor, secondaryColor, ctx)}

        {/* 3. LAYER_BACKPACK (MOCHILAS / ALFORGE) */}
        {renderBackpackItem(backpackId, ctx)}

        {/* 4. LAYER_BODY_BASE (CORPO BASE CHIBI & ARQUÉTIPOS) */}
        {renderBaseArchetype(archetype, subType, primaryColor, secondaryColor, state, ctx)}

        {/* 5. LAYER_FOOTGEAR (PERNAS / BOTAS / GREVAS) */}
        {renderLegsApparel(legsId, primaryColor, secondaryColor, ctx, isBlobMascot)}

        {/* 6. LAYER_ARMOR (PEITORAL / TÚNICAS / ARMADURAS) */}
        {renderBodyApparel(chestId, primaryColor, secondaryColor, ctx, isBlobMascot)}

        {/* 7. LAYER_HEAD_LOWER (ROSTO INFERIOR / FOLHA NA BOCA) */}
        {renderHeadLowerItem(headLowerId, state, ctx)}

        {/* 8. LAYER_HEAD_MIDDLE (ROSTO / OLHOS / VISEIRA) */}
        {renderEyewear(eyesId, state, ctx, isBlobMascot)}

        {/* 9. CAMADA DE ACESSÓRIO (ACCESSORY) */}
        {renderAccessoryItem(accessoryId, primaryColor, secondaryColor, ctx)}

        {/* 10. LAYER_HEAD_UPPER (CHAPÉU / ORELHAS DE COELHO / MAÇÃ) */}
        {renderHeadwear(headId, primaryColor, secondaryColor, ctx, isBlobMascot)}

        {/* 11. LAYER_HAND_L (MÃO SECUNDÁRIA / ESCUDOS / GRIMÓRIOS) */}
        {renderOffHandItem(offHandId, state, ctx, isBlobMascot)}

        {/* 12. LAYER_HAND_R (MÃO PRINCIPAL / MARTELO / CAJADO) */}
        {renderHandItem(mainHandId, state, ctx, isBlobMascot)}

        {/* 13. LAYER_PET_GROUND (MASCOTE NO CHÃO / PORING / SPORE) */}
        {renderPetGroundItem(petId, state, ctx)}

        {/* 14. EFEITOS DE ESTADO (Fala, Escuta, Celebração, Pensamento) */}
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
    case "back_field_lexicon_pack":
      return (
        <g id="back-field-lexicon-pack" filter={glow}>
          {/* Alforge de Campo com Pergaminhos (Studio Fantasy) */}
          <rect x="32" y="98" width="24" height="48" rx="5" fill="#78350f" stroke="#451a03" strokeWidth="2" />
          <rect x="144" y="98" width="24" height="48" rx="5" fill="#78350f" stroke="#451a03" strokeWidth="2" />
          <rect x="38" y="112" width="12" height="6" rx="1.5" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
          <rect x="150" y="112" width="12" height="6" rx="1.5" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
          <rect x="24" y="90" width="152" height="13" rx="6.5" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
          <line x1="52" y1="90" x2="52" y2="103" stroke="#dc2626" strokeWidth="3" />
          <line x1="148" y1="90" x2="148" y2="103" stroke="#dc2626" strokeWidth="3" />
          <circle cx="168" cy="138" r="6" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />
          <circle cx="168" cy="138" r="3" fill="#38bdf8" />
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
    case "garment_angel_wings":
      return (
        <g id="back-angel-wings" filter={glow}>
          {/* Asas de Anjo Celestiais (Ragnarok Online) */}
          {/* Asa Esquerda */}
          <path
            d="M 55 125 C 15 105 -5 65 18 35 C 28 65 42 85 62 105 Z"
            fill="#f8fafc"
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />
          <path
            d="M 48 135 C 10 120 -8 85 10 55 C 22 80 40 105 56 122 Z"
            fill="#f1f5f9"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <path
            d="M 42 142 C 15 135 5 110 18 85 C 26 102 38 118 50 132 Z"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="1"
          />
          {/* Asa Direita */}
          <path
            d="M 145 125 C 185 105 205 65 182 35 C 172 65 158 85 138 105 Z"
            fill="#f8fafc"
            stroke="#e2e8f0"
            strokeWidth="1.5"
          />
          <path
            d="M 152 135 C 190 120 208 85 190 55 C 178 80 160 105 144 122 Z"
            fill="#f1f5f9"
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <path
            d="M 158 142 C 185 135 195 110 182 85 C 174 102 162 118 150 132 Z"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="1"
          />
          {/* Brilho e auréola de penas divinas */}
          <circle cx="28" cy="45" r="3" fill="#fef08a" />
          <circle cx="172" cy="45" r="3" fill="#fef08a" />
          <circle cx="14" cy="72" r="2" fill="#fff" />
          <circle cx="186" cy="72" r="2" fill="#fff" />
        </g>
      );
    default:
      return null;
  }
}

// =========================================================================
// 2b. BACKPACK LAYER (SLOT BACKPACK: MOCHILAS DE CARGA RO & ESCRIBA)
// =========================================================================
function renderBackpackItem(backpackId?: string | null, ctx?: SvgContext) {
  if (!backpackId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";

  switch (backpackId) {
    case "pack_merchant_wooden":
      return (
        <g id="pack-merchant-wooden" filter={glow}>
          {/* Crate de madeira do Mercador de RO */}
          <rect x="30" y="90" width="30" height="55" rx="4" fill="#854d0e" stroke="#451a03" strokeWidth="2" />
          <rect x="140" y="90" width="30" height="55" rx="4" fill="#854d0e" stroke="#451a03" strokeWidth="2" />
          {/* Rolo de esteira / cobertor no topo */}
          <rect x="25" y="80" width="150" height="15" rx="7.5" fill="#fef08a" stroke="#ca8a04" strokeWidth="2" />
          <line x1="55" y1="80" x2="55" y2="95" stroke="#78350f" strokeWidth="2.5" />
          <line x1="145" y1="80" x2="145" y2="95" stroke="#78350f" strokeWidth="2.5" />
          {/* Cordas de amarração cruzadas */}
          <line x1="30" y1="115" x2="60" y2="115" stroke="#fef08a" strokeWidth="2" strokeDasharray="3 2" />
          <line x1="140" y1="115" x2="170" y2="115" stroke="#fef08a" strokeWidth="2" strokeDasharray="3 2" />
          {/* Cantoneiras de ferro reforçado */}
          <rect x="29" y="140" width="10" height="6" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
          <rect x="161" y="140" width="10" height="6" fill="#e2e8f0" stroke="#475569" strokeWidth="1" />
        </g>
      );
    case "back_field_lexicon_pack":
      return (
        <g id="backpack-field-lexicon-pack" filter={glow}>
          <rect x="32" y="98" width="24" height="48" rx="5" fill="#78350f" stroke="#451a03" strokeWidth="2" />
          <rect x="144" y="98" width="24" height="48" rx="5" fill="#78350f" stroke="#451a03" strokeWidth="2" />
          <rect x="38" y="112" width="12" height="6" rx="1.5" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
          <rect x="150" y="112" width="12" height="6" rx="1.5" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
          <rect x="24" y="90" width="152" height="13" rx="6.5" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
          <line x1="52" y1="90" x2="52" y2="103" stroke="#dc2626" strokeWidth="3" />
          <line x1="148" y1="90" x2="148" y2="103" stroke="#dc2626" strokeWidth="3" />
          <circle cx="168" cy="138" r="6" fill="#fbbf24" stroke="#b45309" strokeWidth="1.2" />
          <circle cx="168" cy="138" r="3" fill="#38bdf8" />
        </g>
      );
    case "back_mochila_escriba":
      return (
        <g id="back-mochila-escriba">
          <rect x="36" y="105" width="22" height="42" rx="4" fill="#78350f" stroke="#451a03" strokeWidth="2" />
          <rect x="142" y="105" width="22" height="42" rx="4" fill="#78350f" stroke="#451a03" strokeWidth="2" />
          <rect x="30" y="98" width="140" height="12" rx="6" fill="#fef3c7" stroke="#b45309" strokeWidth="1.5" />
          <line x1="60" y1="98" x2="60" y2="110" stroke="#78350f" strokeWidth="2" />
          <line x1="140" y1="98" x2="140" y2="110" stroke="#78350f" strokeWidth="2" />
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

  // -------------------------------------------------------------
  // RAGNAROK ONLINE (RO) CHIBI LINE-UP (8 PERSONAGENS)
  // -------------------------------------------------------------

  // RO 1: ESPADACHIM PRONTERIANO (MALE, SWORDSMAN)
  if (subType === "ro_chibi_swordsman_male_base" || subType === "char_swordsman_m") {
    return (
      <g id="ro-swordsman">
        <rect x="88" y="115" width="24" height="25" fill="#fed7aa" />
        <path d="M 48 138 Q 100 122 152 138 L 160 185 L 40 185 Z" fill="#2563eb" />
        <rect x="58" y="166" width="84" height="8" fill="#78350f" />
        <rect x="94" y="163" width="12" height="14" rx="2" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
        <circle cx="56" cy="92" r="10" fill="#fed7aa" />
        <circle cx="144" cy="92" r="10" fill="#fed7aa" />
        <ellipse cx="100" cy="94" rx="43" ry="45" fill="#ffedd5" />
        <path d="M 52 78 L 42 50 L 62 55 L 75 32 L 95 48 L 115 28 L 128 50 L 148 40 L 146 78 Z" fill="#78350f" />
        <path d="M 54 75 Q 100 50 146 75 Q 120 62 100 62 Q 80 62 54 75 Z" fill="#92400e" />
        <path d="M 56 68 Q 100 56 144 68 L 142 75 Q 100 63 58 75 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx="100" cy="69" r="3.5" fill="#0284c7" />
        <circle cx="80" cy="88" r="7" fill="#1c1917" />
        <circle cx="120" cy="88" r="7" fill="#1c1917" />
        <circle cx="78" cy="85" r="2.5" fill="#fff" />
        <circle cx="118" cy="85" r="2.5" fill="#fff" />
        <circle cx="82" cy="91" r="1" fill="#fff" />
        <circle cx="122" cy="91" r="1" fill="#fff" />
        <path d="M 72 77 Q 80 73 88 76" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 112 76 Q 120 73 128 77" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <ellipse cx="72" cy="98" rx="6" ry="3.5" fill="#fda4af" opacity="0.6" />
        <ellipse cx="128" cy="98" rx="6" ry="3.5" fill="#fda4af" opacity="0.6" />
        <circle cx="100" cy="96" r="1.5" fill="#fca5a5" />
        {isSpeaking ? (
          <ellipse cx="100" cy="107" rx="8" ry="6" fill="#e11d48" />
        ) : (
          <path d="M 92 105 Q 100 112 108 105" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}
      </g>
    );
  }

  // RO 2: MAGO DE GEFFEN (MALE, MAGICIAN)
  if (subType === "ro_chibi_wizard_male_base" || subType === "char_wizard_m") {
    return (
      <g id="ro-wizard">
        <rect x="88" y="115" width="24" height="25" fill="#fed7aa" />
        <path d="M 48 138 Q 100 120 152 138 L 160 185 L 40 185 Z" fill="#312e81" />
        <path d="M 78 136 L 100 162 L 122 136 Z" fill="#4338ca" stroke="#fbbf24" strokeWidth="1" />
        <circle cx="56" cy="92" r="10" fill="#fed7aa" />
        <circle cx="144" cy="92" r="10" fill="#fed7aa" />
        <ellipse cx="100" cy="94" rx="42" ry="44" fill="#ffedd5" />
        <path d="M 54 80 Q 56 42 100 42 Q 144 42 146 80 Q 135 55 100 52 Q 65 55 54 80 Z" fill="#1e1b4b" />
        <path d="M 52 75 L 68 85 L 64 68 Z" fill="#1e1b4b" />
        <path d="M 148 75 L 132 85 L 136 68 Z" fill="#1e1b4b" />
        <ellipse cx="100" cy="62" rx="4" ry="6" fill="#06b6d4" stroke="#fbbf24" strokeWidth="1" filter={glow} />
        <circle cx="80" cy="88" r="6.5" fill="#4338ca" />
        <circle cx="120" cy="88" r="6.5" fill="#4338ca" />
        <circle cx="78" cy="86" r="2.5" fill="#fff" />
        <circle cx="118" cy="86" r="2.5" fill="#fff" />
        <path d="M 74 77 Q 82 74 90 77" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        <path d="M 110 77 Q 118 74 126 77" stroke="#1e1b4b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {isSpeaking ? (
          <ellipse cx="100" cy="107" rx="7" ry="5" fill="#be123c" />
        ) : (
          <path d="M 94 106 Q 100 110 106 106" stroke="#991b1b" strokeWidth="2" strokeLinecap="round" fill="none" />
        )}
      </g>
    );
  }

  // RO 3: FERREIRO DE ALBERTA (MALE, BLACKSMITH)
  if (subType === "ro_chibi_blacksmith_male_base" || subType === "char_blacksmith_m") {
    return (
      <g id="ro-blacksmith">
        <rect x="86" y="115" width="28" height="25" fill="#fde68a" />
        <path d="M 46 138 Q 100 120 154 138 L 162 185 L 38 185 Z" fill="#78350f" />
        <path d="M 75 138 Q 100 158 125 138 L 100 168 Z" fill="#dc2626" />
        <circle cx="54" cy="92" r="10" fill="#fde68a" />
        <circle cx="146" cy="92" r="10" fill="#fde68a" />
        <ellipse cx="100" cy="94" rx="44" ry="46" fill="#fef08a" />
        <path d="M 50 78 L 40 48 L 65 52 L 78 30 L 98 48 L 118 28 L 132 50 L 150 42 L 148 78 Z" fill="#b45309" />
        <rect x="68" y="48" width="26" height="14" rx="4" fill="#78350f" stroke="#fbbf24" strokeWidth="1.5" />
        <rect x="106" y="48" width="26" height="14" rx="4" fill="#78350f" stroke="#fbbf24" strokeWidth="1.5" />
        <rect x="72" y="51" width="18" height="8" rx="2" fill="#06b6d4" opacity="0.85" />
        <rect x="110" y="51" width="18" height="8" rx="2" fill="#06b6d4" opacity="0.85" />
        <line x1="94" y1="55" x2="106" y2="55" stroke="#fbbf24" strokeWidth="2" />
        <ellipse cx="126" cy="96" rx="5" ry="4" fill="#292524" opacity="0.4" />
        <circle cx="80" cy="88" r="6.5" fill="#292524" />
        <circle cx="120" cy="88" r="6.5" fill="#292524" />
        <circle cx="78" cy="86" r="2" fill="#fff" />
        <circle cx="118" cy="86" r="2" fill="#fff" />
        <path d="M 70 76 L 90 77" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M 110 77 L 130 76" stroke="#78350f" strokeWidth="3.5" strokeLinecap="round" />
        {isSpeaking ? (
          <ellipse cx="100" cy="108" rx="9" ry="7" fill="#b91c1c" />
        ) : (
          <path d="M 90 106 Q 100 116 110 106" stroke="#991b1b" strokeWidth="3" strokeLinecap="round" fill="none" />
        )}
      </g>
    );
  }

  // RO 4: MAGA ARCANA DE ALBERTA (FEMALE, MAGICIAN)
  if (subType === "ro_chibi_magician_female_base" || subType === "char_magician_f") {
    return (
      <g id="ro-magician-f">
        <rect x="89" y="115" width="22" height="25" fill="#ffe4e6" />
        <path d="M 50 140 Q 100 124 150 140 L 158 185 L 42 185 Z" fill="#0d9488" />
        <path d="M 85 140 L 100 165 L 115 140 Z" fill="#fef08a" />
        <circle cx="100" cy="150" r="3.5" fill="#9333ea" />
        <circle cx="58" cy="92" r="9" fill="#ffe4e6" />
        <circle cx="142" cy="92" r="9" fill="#ffe4e6" />
        <ellipse cx="100" cy="94" rx="41" ry="43" fill="#fff1f2" />
        <path d="M 54 80 Q 58 40 100 40 Q 142 40 146 80 Q 125 58 100 58 Q 75 58 54 80 Z" fill="#14b8a6" />
        <path d="M 52 75 Q 35 110 40 155 Q 48 115 58 85 Z" fill="#0d9488" />
        <path d="M 148 75 Q 165 110 160 155 Q 152 115 142 85 Z" fill="#0d9488" />
        <circle cx="48" cy="80" r="5" fill="#9333ea" />
        <circle cx="152" cy="80" r="5" fill="#9333ea" />
        <ellipse cx="80" cy="88" rx="6.5" ry="6" fill="#7c3aed" />
        <ellipse cx="120" cy="88" rx="6.5" ry="6" fill="#7c3aed" />
        <circle cx="78" cy="86" r="2.5" fill="#fff" />
        <circle cx="118" cy="86" r="2.5" fill="#fff" />
        <circle cx="82" cy="90" r="1" fill="#fff" />
        <circle cx="122" cy="90" r="1" fill="#fff" />
        <path d="M 73 83 L 70 80" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 127 83 L 130 80" stroke="#1e1b4b" strokeWidth="1.5" strokeLinecap="round" />
        <ellipse cx="72" cy="98" rx="6" ry="3.5" fill="#f43f5e" opacity="0.65" />
        <ellipse cx="128" cy="98" rx="6" ry="3.5" fill="#f43f5e" opacity="0.65" />
        {isSpeaking ? (
          <ellipse cx="100" cy="107" rx="7" ry="5" fill="#be123c" />
        ) : (
          <path d="M 94 106 Q 100 110 106 106" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" fill="none" />
        )}
      </g>
    );
  }

  // RO 5: NOVIÇA DE PRONTERA (FEMALE, PRIEST)
  if (subType === "ro_chibi_acolyte_female_base" || subType === "char_acolyte_f") {
    return (
      <g id="ro-acolyte">
        <rect x="89" y="115" width="22" height="25" fill="#ffedd5" />
        <path d="M 50 140 Q 100 124 150 140 L 158 185 L 42 185 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        <path d="M 80 138 L 100 168 L 120 138 Z" fill="#fef08a" stroke="#eab308" strokeWidth="1" />
        <rect x="98" y="152" width="4" height="12" fill="#eab308" filter={glow} />
        <rect x="94" y="155" width="12" height="4" fill="#eab308" filter={glow} />
        <circle cx="58" cy="92" r="9" fill="#ffedd5" />
        <circle cx="142" cy="92" r="9" fill="#ffedd5" />
        <ellipse cx="100" cy="94" rx="41" ry="43" fill="#fff7ed" />
        <path d="M 54 80 Q 58 40 100 40 Q 142 40 146 80 Q 125 56 100 56 Q 75 56 54 80 Z" fill="#f59e0b" />
        <ellipse cx="46" cy="85" rx="8" ry="12" fill="#d97706" />
        <ellipse cx="154" cy="85" rx="8" ry="12" fill="#d97706" />
        <circle cx="48" cy="78" r="4" fill="#fff" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx="152" cy="78" r="4" fill="#fff" stroke="#cbd5e1" strokeWidth="1" />
        <circle cx="80" cy="88" r="6.5" fill="#78350f" />
        <circle cx="120" cy="88" r="6.5" fill="#78350f" />
        <circle cx="78" cy="86" r="2.5" fill="#fff" />
        <circle cx="118" cy="86" r="2.5" fill="#fff" />
        <ellipse cx="72" cy="98" rx="6" ry="3.5" fill="#fda4af" opacity="0.65" />
        <ellipse cx="128" cy="98" rx="6" ry="3.5" fill="#fda4af" opacity="0.65" />
        {isSpeaking ? (
          <ellipse cx="100" cy="107" rx="7" ry="5.5" fill="#e11d48" />
        ) : (
          <path d="M 94 106 Q 100 111 106 106" stroke="#b91c1c" strokeWidth="2" strokeLinecap="round" fill="none" />
        )}
      </g>
    );
  }

  // RO 6: CAÇADORA COM LOBO (FEMALE, HUNTER)
  if (subType === "ro_chibi_hunter_female_base" || subType === "char_hunter_f") {
    return (
      <g id="ro-hunter">
        <rect x="89" y="115" width="22" height="25" fill="#fed7aa" />
        <path d="M 50 140 Q 100 124 150 140 L 158 185 L 42 185 Z" fill="#15803d" />
        <path d="M 82 138 L 100 166 L 118 138 Z" fill="#78350f" />
        <circle cx="58" cy="92" r="9" fill="#fed7aa" />
        <circle cx="142" cy="92" r="9" fill="#fed7aa" />
        <ellipse cx="100" cy="94" rx="41" ry="43" fill="#ffedd5" />
        <path d="M 54 80 Q 58 40 100 40 Q 142 40 146 80 Q 125 58 100 58 Q 75 58 54 80 Z" fill="#292524" />
        <path d="M 100 40 Q 130 18 155 35 Q 135 48 115 45 Z" fill="#1c1917" />
        <path d="M 125 40 Q 145 25 152 10 Q 138 25 125 35 Z" fill="#22c55e" stroke="#15803d" strokeWidth="1" filter={glow} />
        <circle cx="80" cy="88" r="6.5" fill="#047857" />
        <circle cx="120" cy="88" r="6.5" fill="#047857" />
        <circle cx="78" cy="86" r="2.5" fill="#fff" />
        <circle cx="118" cy="86" r="2.5" fill="#fff" />
        <circle cx="82" cy="90" r="1" fill="#a7f3d0" />
        <circle cx="122" cy="90" r="1" fill="#a7f3d0" />
        <circle cx="74" cy="96" r="1" fill="#b45309" />
        <circle cx="77" cy="98" r="1" fill="#b45309" />
        <circle cx="126" cy="96" r="1" fill="#b45309" />
        <circle cx="123" cy="98" r="1" fill="#b45309" />
        {isSpeaking ? (
          <ellipse cx="100" cy="107" rx="7.5" ry="5.5" fill="#e11d48" />
        ) : (
          <path d="M 94 106 Q 102 110 108 104" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}
      </g>
    );
  }

  // RO 7: BAPHOMET JR. MITOLÓGICO (NEUTRAL_CREATURE, MYTHIC_BEAST - REIMAGINED STUDIO FANTASY)
  if (subType === "ro_chibi_baphomet_jr_base" || subType === "char_baphomet_jr") {
    return (
      <g id="ro-baphomet-jr" className="transition-all duration-300">
        {/* Sombra de chão */}
        <ellipse cx="100" cy="182" rx="44" ry="7" fill="#0f172a" opacity="0.35" />

        {/* 1. Asinhas de Demônio Chibi Articuladas (Traseiras) */}
        <g id="baphomet-wings">
          {/* Asa Esquerda */}
          <path
            d="M 52 128 C 16 102 8 62 38 48 C 28 80 44 110 56 124 Z"
            fill="#312e81"
            stroke="#1e1b4b"
            strokeWidth="1.5"
          />
          <path d="M 38 48 C 30 75 42 100 52 118" stroke="#6366f1" strokeWidth="1.2" fill="none" opacity="0.7" />
          <polygon points="36,46 42,48 38,54" fill="#fbbf24" />

          {/* Asa Direita */}
          <path
            d="M 148 128 C 184 102 192 62 162 48 C 172 80 156 110 144 124 Z"
            fill="#312e81"
            stroke="#1e1b4b"
            strokeWidth="1.5"
          />
          <path d="M 162 48 C 170 75 158 100 148 118" stroke="#6366f1" strokeWidth="1.2" fill="none" opacity="0.7" />
          <polygon points="164,46 158,48 162,54" fill="#fbbf24" />
        </g>

        {/* 2. Chifres Espirais de Carneiro com Sulcos e Anéis Rúnicos */}
        {/* Chifre Esquerdo */}
        <path
          d="M 68 72 C 34 38 20 8 48 4 C 74 1 76 42 68 72 Z"
          fill={ctx?.baphometHorn || "#27272a"}
          stroke="#09090b"
          strokeWidth="2"
        />
        <line x1="38" y1="20" x2="56" y2="28" stroke="#fbbf24" strokeWidth="2.5" />
        <line x1="32" y1="36" x2="52" y2="44" stroke="#fbbf24" strokeWidth="2" />
        <circle cx="48" cy="6" r="4.5" fill="#fbbf24" filter={glow} />

        {/* Chifre Direito */}
        <path
          d="M 132 72 C 166 38 180 8 152 4 C 126 1 124 42 132 72 Z"
          fill={ctx?.baphometHorn || "#27272a"}
          stroke="#09090b"
          strokeWidth="2"
        />
        <line x1="162" y1="20" x2="144" y2="28" stroke="#fbbf24" strokeWidth="2.5" />
        <line x1="168" y1="36" x2="148" y2="44" stroke="#fbbf24" strokeWidth="2" />
        <circle cx="152" cy="6" r="4.5" fill="#fbbf24" filter={glow} />

        {/* 3. Túnica de Bruxo Chibi com Cinto de Caveira */}
        <path d="M 48 138 Q 100 122 152 138 L 160 186 L 40 186 Z" fill="#18181b" stroke="#09090b" strokeWidth="2" />
        <path d="M 76 136 L 100 168 L 124 136 Z" fill="#312e81" stroke="#fbbf24" strokeWidth="1.2" />
        <rect x="52" y="165" width="96" height="8" fill="#09090b" />
        <circle cx="100" cy="169" r="6" fill="#e2e8f0" stroke="#475569" strokeWidth="1.2" filter={glow} />
        <circle cx="98" cy="168" r="1" fill="#09090b" />
        <circle cx="102" cy="168" r="1" fill="#09090b" />

        {/* 4. Orelhas de Bode Macias com Brincos Dourados */}
        <ellipse cx="50" cy="94" rx="14" ry="8" fill="#3f3f46" stroke="#18181b" strokeWidth="1.2" transform="rotate(-15 50 94)" />
        <ellipse cx="50" cy="94" rx="8" ry="4" fill="#71717a" transform="rotate(-15 50 94)" />
        <circle cx="38" cy="98" r="3.5" fill="none" stroke="#fbbf24" strokeWidth="1.8" />

        <ellipse cx="150" cy="94" rx="14" ry="8" fill="#3f3f46" stroke="#18181b" strokeWidth="1.2" transform="rotate(15 150 94)" />
        <ellipse cx="150" cy="94" rx="8" ry="4" fill="#71717a" transform="rotate(15 150 94)" />
        <circle cx="162" cy="98" r="3.5" fill="none" stroke="#fbbf24" strokeWidth="1.8" />

        {/* 5. Cabeça Aveludada Escura */}
        <ellipse cx="100" cy="96" rx="44" ry="45" fill="#27272a" stroke="#09090b" strokeWidth="2" />
        <polygon points="92,54 100,42 108,54" fill="#3f3f46" />

        {/* Focinho de Bode Fofo */}
        <polygon points="90,88 110,88 100,106" fill="#18181b" />
        <polygon points="95,100 105,100 100,105" fill="#09090b" />

        {/* 6. Olhos Vermelho-Rubi Luminous Anime */}
        <g id="baphomet-eyes">
          <ellipse cx="78" cy="87" rx="8.5" ry="9.5" fill={ctx?.baphometEye || "#ef4444"} stroke="#450a0a" strokeWidth="1.5" filter={glow} />
          <ellipse cx="78" cy="87" rx="2.8" ry="6" fill="#450a0a" />
          <circle cx="75" cy="83" r="3" fill="#ffffff" />
          <circle cx="81" cy="91" r="1.5" fill="#ffffff" />

          <ellipse cx="122" cy="87" rx="8.5" ry="9.5" fill={ctx?.baphometEye || "#ef4444"} stroke="#450a0a" strokeWidth="1.5" filter={glow} />
          <ellipse cx="122" cy="87" rx="2.8" ry="6" fill="#450a0a" />
          <circle cx="119" cy="83" r="3" fill="#ffffff" />
          <circle cx="125" cy="91" r="1.5" fill="#ffffff" />
        </g>

        {/* Boquinha com Presas Travessas */}
        {isSpeaking ? (
          <ellipse cx="100" cy="112" rx="7" ry="6" fill="#7f1d1d">
            <polygon points="96,108 98,113 100,108" fill="#ffffff" />
            <polygon points="100,108 102,113 104,108" fill="#ffffff" />
          </ellipse>
        ) : state === "celebrating" ? (
          <g>
            <path d="M 91 108 Q 100 118 109 108" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <polygon points="98,108 100,113 102,108" fill="#ffffff" />
          </g>
        ) : (
          <g>
            <path d="M 92 108 Q 96 112 100 109 Q 104 112 108 108" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" fill="none" />
            <polygon points="98,108 100,112 102,108" fill="#ffffff" />
          </g>
        )}
      </g>
    );
  }

  // RO 8: ANGELING ALADO (NEUTRAL_CREATURE, MYTHIC_BEAST - REIMAGINED STUDIO FANTASY 3D JELLY)
  if (subType === "ro_chibi_angeling_base" || subType === "char_angeling") {
    return (
      <g id="ro-angeling" className="transition-all duration-300">
        {/* Sombra difusa de chão */}
        <ellipse cx="100" cy="180" rx="46" ry="7" fill="#0f172a" opacity="0.32" />

        {/* 1. Asas Angelicais Celestiais com Múltiplas Camadas de Penas & Profundidade */}
        {/* Asa Esquerda Traseira */}
        <g id="angeling-wing-left" className="transition-transform duration-500">
          <path
            d="M 64 110 C 25 90 2 52 24 24 C 36 50 52 74 72 95 Z"
            fill={ctx?.angelingWing || "#f8fafc"}
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <path
            d="M 58 118 C 18 106 2 76 22 52 C 34 74 50 96 66 112 Z"
            fill="#f1f5f9"
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <path
            d="M 54 126 C 24 120 12 100 28 80 C 38 98 50 114 62 122 Z"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="0.8"
          />
          <path d="M 32 38 Q 44 65 62 92" stroke="#fef08a" strokeWidth="1.5" fill="none" opacity="0.8" />
          <circle cx="24" cy="26" r="2.5" fill="#fef08a" filter={glow} />
          <circle cx="16" cy="60" r="1.5" fill="#fff" />
        </g>

        {/* Asa Direita Traseira */}
        <g id="angeling-wing-right" className="transition-transform duration-500">
          <path
            d="M 136 110 C 175 90 198 52 176 24 C 164 50 148 74 128 95 Z"
            fill={ctx?.angelingWing || "#f8fafc"}
            stroke="#cbd5e1"
            strokeWidth="1.2"
          />
          <path
            d="M 142 118 C 182 106 198 76 178 52 C 166 74 150 96 134 112 Z"
            fill="#f1f5f9"
            stroke="#94a3b8"
            strokeWidth="1"
          />
          <path
            d="M 146 126 C 176 120 188 100 172 80 C 162 98 150 114 138 122 Z"
            fill="#e2e8f0"
            stroke="#94a3b8"
            strokeWidth="0.8"
          />
          <path d="M 168 38 Q 156 65 138 92" stroke="#fef08a" strokeWidth="1.5" fill="none" opacity="0.8" />
          <circle cx="176" cy="26" r="2.5" fill="#fef08a" filter={glow} />
          <circle cx="184" cy="60" r="1.5" fill="#fff" />
        </g>

        {/* 2. Auréola Celestial 3D Flutuante com Raios & Estrelas */}
        <g id="angeling-halo">
          <ellipse cx="100" cy="46" rx="34" ry="11" fill="none" stroke="#fef08a" strokeWidth="6" opacity="0.35" filter={glow} />
          <ellipse cx="100" cy="46" rx="32" ry="10" fill="none" stroke={ctx?.angelingHalo || "#f59e0b"} strokeWidth="4.5" />
          <ellipse cx="100" cy="45" rx="30" ry="8.5" fill="none" stroke="#fef9c3" strokeWidth="1.5" opacity="0.9" />
          <path d="M 70 46 L 73 40 L 76 46 L 73 52 Z" fill="#fff" filter={glow} />
          <path d="M 130 46 L 133 40 L 136 46 L 133 52 Z" fill="#fff" filter={glow} />
          <circle cx="100" cy="36" r="2.5" fill="#fef08a" filter={glow} />
        </g>

        {/* 3. Corpo Gelatinoso 3D com Volume Esférico & Reflexos Caustics */}
        <path
          d="M 52 124 C 48 88 72 74 100 74 C 128 74 152 88 148 124 C 145 156 126 166 100 166 C 74 166 55 156 52 124 Z"
          fill={ctx?.angelingJelly || "#f472b6"}
          stroke="#be185d"
          strokeWidth="2.5"
        />

        {/* Caustic Interno na Base (Translucidez da Geleia) */}
        <path
          d="M 64 142 C 75 158 125 158 136 142 C 124 152 76 152 64 142 Z"
          fill="#fda4af"
          opacity="0.65"
          filter={glow}
        />

        {/* Brilho Glossy / Especular Curvo Superior Esquerdo */}
        <ellipse cx="78" cy="94" rx="14" ry="7" fill="#ffffff" opacity="0.8" transform="rotate(-32 78 94)" />
        <circle cx="70" cy="106" r="3" fill="#ffffff" opacity="0.9" />
        <ellipse cx="118" cy="86" rx="8" ry="3" fill="#ffffff" opacity="0.45" transform="rotate(-15 118 86)" />

        {/* 4. Manto e Túnica de Mago Shaded em Camadas (Estilo Studio Fantasy) */}
        <g id="angeling-wizard-robe">
          {/* Sombra de profundidade sob o manto na base da geleia */}
          <path
            d="M 52 142 C 60 168 140 168 148 142 C 144 170 125 178 100 178 C 75 178 56 170 52 142 Z"
            fill="#1e1b4b"
            opacity="0.45"
          />
          {/* Corpo principal do Manto de Mago em Veludo Índigo Shaded */}
          <path
            d="M 54 138 C 50 148 54 162 68 168 C 84 174 116 174 132 168 C 146 162 150 148 146 138 C 136 150 120 156 100 156 C 80 156 64 150 54 138 Z"
            fill={ctx?.lyannaRobe || "url(#purpleGrad)"}
            stroke="#1e1b4b"
            strokeWidth="1.8"
          />
          {/* Bainha Inferior com Pregas Bordadas em Ouro Rúnico */}
          <path
            d="M 64 166 Q 100 178 136 166"
            stroke={ctx?.goldTrim || "#fbbf24"}
            strokeWidth="2.5"
            fill="none"
            filter={glow}
          />
          {/* Pregas Verticais de Tecido Dinâmico Shaded */}
          <path d="M 80 150 Q 82 166 78 170" stroke="#1e1b4b" strokeWidth="1.8" fill="none" opacity="0.65" />
          <path d="M 100 156 L 100 174" stroke="#1e1b4b" strokeWidth="1.8" fill="none" opacity="0.65" />
          <path d="M 120 150 Q 118 166 122 170" stroke="#1e1b4b" strokeWidth="1.8" fill="none" opacity="0.65" />
          {/* Colarinho em Seda Carmesim / Éter com Broche Astral */}
          <path
            d="M 68 140 Q 100 152 132 140 Q 120 148 100 150 Q 80 148 68 140 Z"
            fill="#831843"
            stroke="#fbbf24"
            strokeWidth="1.2"
          />
          {/* Broche Rúnico de Ouro com Gema Elemental Ciano Central */}
          <circle cx="100" cy="148" r="5.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" filter={glow} />
          <circle cx="100" cy="148" r="3" fill="#38bdf8" />
          <circle cx="98.5" cy="146.5" r="1" fill="#ffffff" />
        </g>

        {/* 5. Olhos de Anime Expressivos & Brilhantes */}
        <g id="angeling-eyes">
          <ellipse cx="82" cy="116" rx="8" ry="10" fill="#3b0764" />
          <ellipse cx="82" cy="118" rx="6.5" ry="7.5" fill="#be185d" />
          <circle cx="79" cy="112" r="3.5" fill="#ffffff" />
          <circle cx="85" cy="121" r="1.8" fill="#ffffff" />
          <circle cx="81" cy="123" r="1" fill="#fda4af" />

          <ellipse cx="118" cy="116" rx="8" ry="10" fill="#3b0764" />
          <ellipse cx="118" cy="118" rx="6.5" ry="7.5" fill="#be185d" />
          <circle cx="115" cy="112" r="3.5" fill="#ffffff" />
          <circle cx="121" cy="121" r="1.8" fill="#ffffff" />
          <circle cx="117" cy="123" r="1" fill="#fda4af" />
        </g>

        {/* Bochechas Rosadas e Fofas */}
        <ellipse cx="70" cy="128" rx="7" ry="4" fill="#f43f5e" opacity="0.75" />
        <line x1="66" y1="126" x2="68" y2="130" stroke="#be123c" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="71" y1="126" x2="73" y2="130" stroke="#be123c" strokeWidth="1.2" strokeLinecap="round" />
        <ellipse cx="130" cy="128" rx="7" ry="4" fill="#f43f5e" opacity="0.75" />
        <line x1="127" y1="126" x2="129" y2="130" stroke="#be123c" strokeWidth="1.2" strokeLinecap="round" />
        <line x1="132" y1="126" x2="134" y2="130" stroke="#be123c" strokeWidth="1.2" strokeLinecap="round" />

        {/* Boquinha Adorável */}
        {isSpeaking ? (
          <ellipse cx="100" cy="132" rx="7" ry="6" fill="#be123c" stroke="#881337" strokeWidth="1">
            <path d="M 96 134 Q 100 137 104 134" fill="#fda4af" />
          </ellipse>
        ) : state === "celebrating" ? (
          <path d="M 93 128 Q 100 138 107 128" stroke="#881337" strokeWidth="2.8" strokeLinecap="round" fill="#be123c" />
        ) : (
          <path d="M 94 129 Q 97 133 100 130 Q 103 133 106 129" stroke="#9f1239" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        )}
      </g>
    );
  }

  // 1. VALERIUS, O ESCRIBA ERRANTE (HUMAN_MALE - STUDIO FANTASY SCHOLAR)
  if (subType === "valerius_scribe" || subType === "valerius") {
    return (
      <g id="archetype-valerius" className="transition-all duration-300">
        {/* Base Corporal: Pescoço Shaded e Ombros com Túnica de Seda Erudita */}
        <path d="M 88 116 L 88 134 Q 100 138 112 134 L 112 116 Z" fill={ctx?.skinShade || "#fed7aa"} />
        <path d="M 46 138 Q 100 120 154 138 L 162 186 L 38 186 Z" fill="#1e3a8a" stroke="#172554" strokeWidth="1.5" />
        
        {/* Camisete do Escriba com Detalhe Dourado */}
        <path d="M 84 134 L 100 166 L 116 134 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="100" y1="136" x2="100" y2="162" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" />
        <circle cx="100" cy="148" r="3.5" fill="#fbbf24" filter={glow} />

        {/* Orelhas com Contorno Shaded */}
        <circle cx="54" cy="94" r="10" fill="#fce7d6" />
        <circle cx="54" cy="94" r="6" fill="#fed7aa" />
        <circle cx="146" cy="94" r="10" fill="#fce7d6" />
        <circle cx="146" cy="94" r="6" fill="#fed7aa" />

        {/* Pena Dourada do Escriba atrás da orelha direita com brilho */}
        <path d="M 148 90 Q 170 70 176 48 Q 164 68 150 82 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1.2" filter={glow} />
        <path d="M 152 82 Q 166 64 172 52" stroke="#ffffff" strokeWidth="1" fill="none" opacity="0.8" />

        {/* Rosto Sábio e Expressão Focada de Estudioso */}
        <ellipse cx="100" cy="95" rx="43" ry="46" fill="#fff7ed" />

        {/* Olhos Castanho-Âmbar de Anime com Brilho Intelectual */}
        {state === "celebrating" ? (
          <g>
            <path d="M 72 92 Q 80 84 88 92" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 112 92 Q 120 84 128 92" stroke="#451a03" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          <g id="valerius-eyes">
            <ellipse cx="80" cy="90" rx="8" ry="9.5" fill="#1c1917" />
            <ellipse cx="80" cy="91" rx="6.5" ry="8" fill="#78350f" />
            <ellipse cx="80" cy="93" rx="5" ry="5" fill="#b45309" />
            <circle cx="77" cy="87" r="3" fill="#ffffff" />
            <circle cx="83" cy="93" r="1.3" fill="#ffffff" />
            <path d="M 70 87 Q 80 82 90 86" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            <ellipse cx="120" cy="90" rx="8" ry="9.5" fill="#1c1917" />
            <ellipse cx="120" cy="91" rx="6.5" ry="8" fill="#78350f" />
            <ellipse cx="120" cy="93" rx="5" ry="5" fill="#b45309" />
            <circle cx="117" cy="87" r="3" fill="#ffffff" />
            <circle cx="123" cy="93" r="1.3" fill="#ffffff" />
            <path d="M 110 86 Q 120 82 130 87" stroke="#451a03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* Sobrancelhas Sérias de Acadêmico */}
        <path d="M 71 78 Q 80 74 89 77" stroke="#451a03" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <path d="M 111 77 Q 120 74 129 78" stroke="#451a03" strokeWidth="2.8" strokeLinecap="round" fill="none" />
        <path d="M 98 94 Q 100 98 103 98" stroke="#fca5a5" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Boca Focada */}
        {isSpeaking ? (
          <ellipse cx="100" cy="110" rx="8" ry="6" fill="#be123c">
            <path d="M 95 111 Q 100 114 105 111" fill="#fda4af" />
          </ellipse>
        ) : (
          <path d="M 92 108 Q 100 113 108 108" stroke="#991b1b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}

        {/* Cabelo Penteado Erudito em Camadas com Brilho Studio */}
        <g id="valerius-hair">
          <path
            d="M 52 82 C 48 44 68 32 100 32 C 132 32 152 44 148 82 C 136 60 120 54 100 54 C 80 54 64 60 52 82 Z"
            fill="#451a03"
            stroke="#291205"
            strokeWidth="1.5"
          />
          <path d="M 54 78 Q 72 58 92 66 Q 70 72 56 80 Z" fill="#78350f" />
          <path d="M 146 78 Q 128 58 108 66 Q 130 72 144 80 Z" fill="#78350f" />
          <path d="M 68 44 Q 100 36 132 44" stroke="#d97706" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6" />
        </g>
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

  // STUDIO FANTASY 1: KAELEN, O ESPADACHIM LINGUISTA (MALE, TACTICIAN)
  if (
    subType === "char_tactician_m" ||
    subType === "tactician_swordsman" ||
    subType === "kaelen" ||
    subType === "kaelen_base" ||
    subType.includes("kaelen")
  ) {
    return (
      <g id="studio-kaelen" className="transition-all duration-300">
        {/* 1. Base Corporal: Pescoço Contornado & Ombros de Guerreiro */}
        <path d="M 88 116 L 88 134 Q 100 138 112 134 L 112 116 Z" fill={ctx?.skinShade || "#e5b89c"} />
        <path d="M 92 120 Q 100 128 108 120" stroke="#d97706" strokeWidth="1" fill="none" opacity="0.4" />

        {/* Gambeson e Túnica Base em Carvão e Azul Meia-Noite */}
        <path d="M 44 138 Q 100 120 156 138 L 164 186 L 36 186 Z" fill={ctx?.kaelenArmor || "#1e293b"} />
        
        {/* Camisete e Cravat de Escriba Nobre */}
        <path d="M 86 132 L 100 162 L 114 132 Z" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1" />
        <line x1="100" y1="134" x2="100" y2="160" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="3 2" />

        {/* Peitoral de Aço Escovado com Runas de Sintaxe Gravadas */}
        <path d="M 70 136 L 100 174 L 130 136 Q 100 126 70 136 Z" fill="#334155" stroke="#475569" strokeWidth="1.5" />
        <path d="M 76 138 L 100 170 L 124 138" stroke="#38bdf8" strokeWidth="1.8" fill="none" filter={glow} />
        {/* Runas de Sintaxe Gravadas (λ, Ω, ∑) */}
        <text x="96" y="152" fill="#7dd3fc" fontSize="9" fontWeight="bold" filter={glow} textAnchor="middle">λ</text>
        <text x="88" y="145" fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle">Ω</text>
        <text x="112" y="145" fill="#38bdf8" fontSize="7" fontWeight="bold" textAnchor="middle">∑</text>

        {/* Ombreiras de Aço e Couro (Pauldrons) */}
        <rect x="36" y="136" width="26" height="16" rx="5" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="39" y1="144" x2="59" y2="144" stroke="#fbbf24" strokeWidth="1.5" />
        <circle cx="49" cy="144" r="2.5" fill="#fbbf24" />
        <rect x="138" y="136" width="26" height="16" rx="5" fill="#475569" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1="141" y1="144" x2="161" y2="144" stroke="#fbbf24" strokeWidth="1.5" />
        <circle cx="151" cy="144" r="2.5" fill="#fbbf24" />

        {/* Correia de Couro Transversal (Baldric) com Fivela Dourada */}
        <line x1="46" y1="138" x2="154" y2="186" stroke="#78350f" strokeWidth="7" />
        <line x1="46" y1="138" x2="154" y2="186" stroke="#b45309" strokeWidth="1.5" />
        <rect x="94" y="156" width="12" height="12" rx="2" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />

        {/* Manto de Aventureiro Azul Cerúleo no Ombro Esquerdo */}
        <path d="M 38 140 Q 22 165 30 186 L 50 186 Q 44 165 48 140 Z" fill="#1d4ed8" stroke="#1e40af" strokeWidth="1.2" />

        {/* 2. Cabelo Traseiro para Silhueta Dinâmica */}
        <path
          d="M 50 82 C 34 65 32 40 48 28 C 44 50 56 68 64 80 Z"
          fill={ctx?.kaelenHair || "#1e293b"}
        />
        <path
          d="M 150 82 C 166 65 168 40 152 28 C 156 50 144 68 136 80 Z"
          fill={ctx?.kaelenHair || "#1e293b"}
        />

        {/* 3. Cabeça & Orelhas Esculpidas de Anime */}
        <circle cx="54" cy="94" r="10" fill="#fce7d6" />
        <circle cx="54" cy="94" r="6" fill="#fbcfe8" opacity="0.4" />
        <circle cx="146" cy="94" r="10" fill="#fce7d6" />
        <circle cx="146" cy="94" r="6" fill="#fbcfe8" opacity="0.4" />
        {/* Rosto com Contorno Suave */}
        <ellipse cx="100" cy="96" rx="43" ry="46" fill="#fdf2e9" />
        <path d="M 80 130 Q 100 142 120 130" stroke="#fbcfe8" strokeWidth="1.5" fill="none" opacity="0.5" />

        {/* 4. Olhos de Herói de Anime com Profundidade Safira */}
        {state === "celebrating" ? (
          <g>
            <path d="M 72 92 Q 80 84 88 92" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 112 92 Q 120 84 128 92" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <ellipse cx="72" cy="98" rx="6" ry="3" fill="#f43f5e" opacity="0.4" />
            <ellipse cx="128" cy="98" rx="6" ry="3" fill="#f43f5e" opacity="0.4" />
          </g>
        ) : (
          <g id="kaelen-eyes">
            {/* Olho Esquerdo */}
            <ellipse cx="78" cy="90" rx="9" ry="10" fill="#0f172a" />
            <ellipse cx="78" cy="91" rx="7.5" ry="8.5" fill="#0284c7" />
            <ellipse cx="78" cy="93" rx="6" ry="5.5" fill="#38bdf8" />
            <ellipse cx="78" cy="90" rx="3.5" ry="4.5" fill="#0c4a6e" />
            <circle cx="75" cy="86" r="3.2" fill="#ffffff" />
            <circle cx="82" cy="94" r="1.5" fill="#ffffff" />
            <path d="M 68 87 Q 78 81 88 86" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Olho Direito */}
            <ellipse cx="122" cy="90" rx="9" ry="10" fill="#0f172a" />
            <ellipse cx="122" cy="91" rx="7.5" ry="8.5" fill="#0284c7" />
            <ellipse cx="122" cy="93" rx="6" ry="5.5" fill="#38bdf8" />
            <ellipse cx="122" cy="90" rx="3.5" ry="4.5" fill="#0c4a6e" />
            <circle cx="119" cy="86" r="3.2" fill="#ffffff" />
            <circle cx="126" cy="94" r="1.5" fill="#ffffff" />
            <path d="M 112 86 Q 122 81 132 87" stroke="#0f172a" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* Sobrancelhas Heroicas com Cicatriz Estilizada na Esquerda */}
        <path d="M 69 77 Q 79 73 89 77" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />
        <line x1="81" y1="74" x2="81" y2="81" stroke="#fdf2e9" strokeWidth="1.8" />
        <path d="M 111 77 Q 121 73 131 77" stroke="#0f172a" strokeWidth="3" strokeLinecap="round" fill="none" />

        {/* Nariz Discreto de Anime */}
        <path d="M 98 94 Q 100 98 103 98" stroke="#e5b89c" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Boca Confiante / Sorriso / Fala */}
        {isSpeaking ? (
          <ellipse cx="100" cy="110" rx="8" ry="6.5" fill="#be123c">
            <path d="M 95 112 Q 100 115 105 112" fill="#fda4af" />
          </ellipse>
        ) : state === "celebrating" ? (
          <path d="M 91 107 Q 100 117 109 107" stroke="#881337" strokeWidth="3" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M 93 108 Q 100 114 107 108" stroke="#881337" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        )}

        {/* 5. Cabelo Volumoso em Camadas Estilo Studio Fantasy */}
        <g id="kaelen-hair-front">
          <path
            d="M 50 78 L 40 44 L 64 50 L 76 22 L 98 44 L 118 20 L 134 44 L 160 36 L 150 78 Q 130 52 100 52 Q 70 52 50 78 Z"
            fill={ctx?.kaelenHair || "#1e293b"}
          />
          <path d="M 48 76 Q 44 98 52 110 Q 56 94 56 78 Z" fill="#0f172a" />
          <path d="M 152 76 Q 156 98 148 110 Q 144 94 144 78 Z" fill="#0f172a" />
          <polygon points="68,64 80,78 84,62" fill="#1e293b" />
          <polygon points="82,62 96,82 102,62" fill="#0f172a" />
          <polygon points="100,62 114,80 118,62" fill="#1e293b" />
          <polygon points="116,62 128,76 134,64" fill="#0f172a" />
          <path
            d="M 56 46 Q 100 28 144 46"
            stroke={ctx?.kaelenHairSheen || "#38bdf8"}
            strokeWidth="3.5"
            strokeLinecap="round"
            fill="none"
            filter={glow}
          />
          <path d="M 72 38 Q 100 24 128 38" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.8" />
        </g>
      </g>
    );
  }

  // STUDIO FANTASY 2: LYANNA, A MAGA DE VÉU (FEMALE, ARCHIVIST)
  if (
    subType === "char_archivist_f" ||
    subType === "hooded_archivist" ||
    subType === "lyanna" ||
    subType === "lyanna_base" ||
    subType.includes("lyanna")
  ) {
    return (
      <g id="studio-lyanna" className="transition-all duration-300">
        {/* 1. Base: Pescoço Gracioso & Túnica de Seda da Arquivista */}
        <path d="M 90 116 L 90 134 Q 100 138 110 134 L 110 116 Z" fill="#f1c2a2" />
        <path d="M 46 138 Q 100 120 154 138 L 162 186 L 38 186 Z" fill={ctx?.lyannaRobe || "#312e81"} />
        
        {/* Mantilho Bordado com Brocados de Ouro */}
        <path d="M 74 136 L 100 166 L 126 136" stroke="#fbbf24" strokeWidth="2.5" fill="none" filter={glow} />
        <circle cx="100" cy="148" r="5" fill="#a855f7" stroke="#fbbf24" strokeWidth="1.5" filter={glow} />
        <circle cx="100" cy="148" r="2.5" fill="#fdf4ff" />

        {/* 2. Cabelo Longo Fluido Lilás/Ametista Caindo em Ondas */}
        <path
          d="M 48 76 C 28 105 24 150 40 178 C 48 140 56 105 58 78 Z"
          fill={ctx?.lyannaHair || "#c084fc"}
        />
        <path
          d="M 152 76 C 172 105 176 150 160 178 C 152 140 144 105 142 78 Z"
          fill={ctx?.lyannaHair || "#c084fc"}
        />

        {/* 3. Cabeça & Rosto de Feiticeira Nobre */}
        <circle cx="56" cy="94" r="9" fill="#f1c2a2" />
        <circle cx="144" cy="94" r="9" fill="#f1c2a2" />
        <ellipse cx="100" cy="96" rx="42" ry="45" fill="#fef2f2" />

        {/* 4. Olhos Místicos Estelares */}
        {state === "celebrating" ? (
          <g>
            <path d="M 72 92 Q 80 84 88 92" stroke="#581c87" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 112 92 Q 120 84 128 92" stroke="#581c87" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          <g id="lyanna-eyes">
            {/* Olho Esquerdo */}
            <ellipse cx="78" cy="90" rx="8.5" ry="9.5" fill="#581c87" />
            <ellipse cx="78" cy="91" rx="7" ry="8" fill="#9333ea" />
            <ellipse cx="78" cy="93" rx="5.5" ry="5.5" fill="#c084fc" />
            <circle cx="75" cy="87" r="3" fill="#ffffff" />
            <path d="M 81 92 L 83 89 L 85 92 L 83 95 Z" fill="#ffffff" />
            <path d="M 68 87 Q 78 82 88 86" stroke="#4c1d95" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Olho Direito */}
            <ellipse cx="122" cy="90" rx="8.5" ry="9.5" fill="#581c87" />
            <ellipse cx="122" cy="91" rx="7" ry="8" fill="#9333ea" />
            <ellipse cx="122" cy="93" rx="5.5" ry="5.5" fill="#c084fc" />
            <circle cx="119" cy="87" r="3" fill="#ffffff" />
            <path d="M 125 92 L 127 89 L 129 92 L 127 95 Z" fill="#ffffff" />
            <path d="M 112 86 Q 122 82 132 87" stroke="#4c1d95" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* Sobrancelhas Delicadas & Maquiagem Suave */}
        <path d="M 70 78 Q 80 74 90 78" stroke="#6b21a8" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <path d="M 110 78 Q 120 74 130 78" stroke="#6b21a8" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        <ellipse cx="72" cy="98" rx="6" ry="3" fill="#f472b6" opacity="0.6" />
        <ellipse cx="128" cy="98" rx="6" ry="3" fill="#f472b6" opacity="0.6" />

        {/* Boca Graciosa */}
        {isSpeaking ? (
          <ellipse cx="100" cy="110" rx="7" ry="5.5" fill="#be123c">
            <path d="M 96 111 Q 100 114 104 111" fill="#fda4af" />
          </ellipse>
        ) : state === "celebrating" ? (
          <path d="M 93 107 Q 100 115 107 107" stroke="#db2777" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        ) : (
          <path d="M 94 108 Q 100 112 106 108" stroke="#db2777" strokeWidth="2.2" strokeLinecap="round" fill="none" />
        )}

        {/* 5. Capuz de Seda & Véu Translúcido (Studio Fantasy) */}
        <g id="lyanna-hood-and-veil">
          <path
            d="M 50 82 C 46 36 68 20 100 20 C 132 20 154 36 150 82 C 138 68 120 62 100 62 C 80 62 62 68 50 82 Z"
            fill={ctx?.lyannaRobe || "#3b0764"}
            stroke="#1e1b4b"
            strokeWidth="2"
          />
          <path d="M 54 78 Q 100 58 146 78" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeDasharray="6 3" />
          <circle cx="100" cy="24" r="3.5" fill="#fbbf24" filter={glow} />

          <path
            d="M 64 108 Q 100 126 136 108 Q 100 116 64 108 Z"
            fill="#e9d5ff"
            opacity="0.8"
            filter={glow}
          />

          <path d="M 62 70 Q 72 84 76 96 Q 70 82 62 70 Z" fill={ctx?.lyannaHair || "#c084fc"} />
          <path d="M 138 70 Q 128 84 124 96 Q 130 82 138 70 Z" fill={ctx?.lyannaHair || "#c084fc"} />
        </g>
      </g>
    );
  }

  // STUDIO FANTASY 3: IGNISAUR, A CHAMA ANCESTRAL (NEUTRAL_CREATURE, ELEMENTAL_MENTOR)
  if (
    subType === "char_elemental_beast" ||
    subType === "mythic_elemental_mentor" ||
    subType === "ignisaur" ||
    subType === "ignisaur_base" ||
    subType.includes("ignisaur")
  ) {
    return (
      <g id="studio-ignisaur" className="transition-all duration-300">
        {/* Sombra difusa de chão */}
        <ellipse cx="100" cy="184" rx="44" ry="7" fill="#0f172a" opacity="0.3" />

        {/* 1. Labaredas e Juba de Fogo Traseira (Crest) */}
        <g id="ignisaur-fire-back">
          <path
            d="M 50 110 C 25 70 35 30 70 20 C 60 40 75 55 85 45 C 90 20 120 15 115 45 C 125 35 140 40 130 65 C 165 40 175 80 150 110 Z"
            fill={ctx?.ignisaurFire || "url(#fireGrad)"}
            opacity="0.9"
            filter={glow}
          />
          <path
            d="M 65 95 C 45 65 55 40 80 32 C 75 48 88 56 95 48 C 100 30 118 30 112 50 C 120 42 132 46 122 68 C 145 52 155 78 135 95 Z"
            fill="#fef08a"
            opacity="0.75"
          />
        </g>

        {/* 2. Chifres Dracônicos Curvados de Obsidiana e Ouro */}
        {/* Chifre Esquerdo */}
        <g id="ignisaur-horn-left">
          <path
            d="M 64 68 C 40 46 25 15 48 6 C 58 2 64 30 72 62 Z"
            fill={ctx?.ignisaurHorn || "#334155"}
            stroke="#1c1917"
            strokeWidth="1.5"
          />
          <path d="M 44 26 Q 52 24 58 32" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
          <path d="M 38 42 Q 48 40 54 48" stroke="#fbbf24" strokeWidth="2" fill="none" />
          <circle cx="48" cy="6" r="3" fill="#fbbf24" filter={glow} />
        </g>
        {/* Chifre Direito */}
        <g id="ignisaur-horn-right">
          <path
            d="M 136 68 C 160 46 175 15 152 6 C 142 2 136 30 128 62 Z"
            fill={ctx?.ignisaurHorn || "#334155"}
            stroke="#1c1917"
            strokeWidth="1.5"
          />
          <path d="M 156 26 Q 148 24 142 32" stroke="#fbbf24" strokeWidth="2.5" fill="none" />
          <path d="M 162 42 Q 152 40 146 48" stroke="#fbbf24" strokeWidth="2" fill="none" />
          <circle cx="152" cy="6" r="3" fill="#fbbf24" filter={glow} />
        </g>

        {/* 3. Base Corporal & Túnica / Escamas Peitorais */}
        <path d="M 46 136 Q 100 118 154 136 L 164 186 L 36 186 Z" fill="#7c2d12" />
        <path d="M 70 136 L 100 174 L 130 136 Z" fill="#9a3412" stroke="#ea580c" strokeWidth="1.5" />
        {/* Placas de Escamas Peitorais Douradas */}
        <path d="M 85 142 L 100 156 L 115 142" stroke="#fbbf24" strokeWidth="2.2" fill="none" />
        <path d="M 88 154 L 100 166 L 112 154" stroke="#fbbf24" strokeWidth="2" fill="none" />
        {/* Núcleo de Magma Elemental no Peito */}
        <circle cx="100" cy="148" r="4.5" fill="#fef08a" stroke="#ea580c" strokeWidth="1.5" filter={glow} />

        {/* 4. Cabeça Dracônica Esculpida com Textura de Escama */}
        <ellipse cx="100" cy="94" rx="45" ry="46" fill="#c2410c" />
        <ellipse cx="100" cy="94" rx="42" ry="43" fill="#ea580c" />
        {/* Placas Escamosas da Testa */}
        <polygon points="94,54 100,42 106,54" fill="#9a3412" stroke="#7c2d12" strokeWidth="1" />
        <polygon points="82,58 88,48 94,60" fill="#9a3412" stroke="#7c2d12" strokeWidth="1" />
        <polygon points="106,60 112,48 118,58" fill="#9a3412" stroke="#7c2d12" strokeWidth="1" />

        {/* Focinho Dracônico Marcante */}
        <polygon points="88,86 112,86 100,108" fill="#9a3412" stroke="#7c2d12" strokeWidth="1.2" />
        <circle cx="95" cy="100" r="2" fill="#431407" />
        <circle cx="105" cy="100" r="2" fill="#431407" />
        {/* Presas Pequenas Dracônicas */}
        <polygon points="91,107 94,113 97,107" fill="#fff" />
        <polygon points="103,107 106,113 109,107" fill="#fff" />

        {/* 5. Olhos Dracônicos de Fogo Ancestral */}
        {state === "celebrating" ? (
          <g id="ignisaur-celebrating-eyes">
            <path d="M 72 82 Q 80 74 88 82" stroke="#431407" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M 112 82 Q 120 74 128 82" stroke="#431407" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <circle cx="70" cy="88" r="2.5" fill="#f97316" filter={glow} />
            <circle cx="130" cy="88" r="2.5" fill="#f97316" filter={glow} />
          </g>
        ) : (
          <g id="ignisaur-eyes">
            {/* Olho Esquerdo */}
            <ellipse cx="78" cy="82" rx="9" ry="8" fill="#431407" stroke="#7c2d12" strokeWidth="1.5" />
            <ellipse cx="78" cy="82" rx="7.5" ry="6.5" fill="#fef08a" filter={glow} />
            <ellipse cx="78" cy="82" rx="5.5" ry="5" fill="#f97316" />
            {/* Pupila Fendida Dracônica */}
            <ellipse cx={state === "thinking" ? 80 : 78} cy="82" rx="2" ry="6" fill="#1c1917" />
            <circle cx={state === "thinking" ? 77 : 75} cy="79" r="2.2" fill="#ffffff" />
            <circle cx="81" cy="85" r="1.2" fill="#ffffff" />
            <path d="M 68 76 Q 78 70 88 75" stroke="#431407" strokeWidth="2.5" strokeLinecap="round" fill="none" />

            {/* Olho Direito */}
            <ellipse cx="122" cy="82" rx="9" ry="8" fill="#431407" stroke="#7c2d12" strokeWidth="1.5" />
            <ellipse cx="122" cy="82" rx="7.5" ry="6.5" fill="#fef08a" filter={glow} />
            <ellipse cx="122" cy="82" rx="5.5" ry="5" fill="#f97316" />
            {/* Pupila Fendida Dracônica */}
            <ellipse cx={state === "thinking" ? 124 : 122} cy="82" rx="2" ry="6" fill="#1c1917" />
            <circle cx={state === "thinking" ? 121 : 119} cy="79" r="2.2" fill="#ffffff" />
            <circle cx="125" cy="85" r="1.2" fill="#ffffff" />
            <path d="M 112 75 Q 122 70 132 76" stroke="#431407" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </g>
        )}

        {/* 6. Expressão Bucal e Chamas Faladas */}
        {isSpeaking ? (
          <g>
            <ellipse cx="100" cy="113" rx="8" ry="6" fill="#431407" />
            <ellipse cx="100" cy="114" rx="5" ry="3.5" fill="#f97316" filter={glow} />
            <circle cx="100" cy="114" r="2" fill="#fef08a" />
          </g>
        ) : state === "celebrating" ? (
          <path d="M 88 108 Q 100 120 112 108" stroke="#431407" strokeWidth="3" strokeLinecap="round" fill="#9a3412" />
        ) : (
          <path d="M 90 110 Q 100 115 110 110" stroke="#7c2d12" strokeWidth="2.5" strokeLinecap="round" fill="none" />
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

// 4. LEGS APPAREL LAYER (SLOT LEGS: GREVAS, BOTAS, CALÇAS)
// =========================================================================
function renderLegsApparel(
  legsId?: string | null,
  primaryColor: string = "#3b82f6",
  secondaryColor: string = "#f59e0b",
  ctx?: SvgContext,
  isBlobMascot: boolean = false
) {
  if (!legsId || isBlobMascot) return null;

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
  ctx?: SvgContext,
  isBlobMascot: boolean = false
) {
  if (!bodyId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";
  const gold = ctx?.goldGrad || "url(#goldGrad)";

  if (isBlobMascot) {
    // Para mascotes esféricas (Angeling), adapta o traje ao formato globular com curvas elegantes
    switch (bodyId) {
      case "outfit_ceremonial_silks":
        return (
          <g id="mascot-ceremonial-silks" filter={glow}>
            <path
              d="M 54 140 C 60 166 140 166 146 140 C 142 168 124 176 100 176 C 76 176 58 168 54 140 Z"
              fill="#991b1b"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <path d="M 62 166 Q 100 178 138 166" stroke="#ea580c" strokeWidth="2.5" fill="none" />
            <rect x="74" y="150" width="52" height="12" rx="3" fill="#d97706" stroke="#fbbf24" strokeWidth="1.2" />
            <circle cx="100" cy="156" r="4.5" fill="#ef4444" stroke="#fbbf24" strokeWidth="1" filter={glow} />
          </g>
        );
      case "outfit_scout_tunic":
        return (
          <g id="mascot-scout-tunic">
            <path
              d="M 54 140 C 60 166 140 166 146 140 C 142 168 124 176 100 176 C 76 176 58 168 54 140 Z"
              fill="#54301a"
              stroke="#b45309"
              strokeWidth="1.5"
            />
            <line x1="64" y1="140" x2="136" y2="174" stroke="#92400e" strokeWidth="7" />
            <line x1="64" y1="140" x2="136" y2="174" stroke="#fbbf24" strokeWidth="2" strokeDasharray="3 2" filter={glow} />
            <rect x="94" y="152" width="12" height="12" rx="2" fill="#fbbf24" stroke="#78350f" strokeWidth="1.2" />
          </g>
        );
      case "chest_tunica_novico":
      case "armor_apprentice_robe":
        return (
          <g id="mascot-apprentice-robe">
            <path
              d="M 54 140 C 60 166 140 166 146 140 C 142 168 124 176 100 176 C 76 176 58 168 54 140 Z"
              fill="#0284c7"
              stroke="#fbbf24"
              strokeWidth="1.5"
            />
            <path d="M 64 166 Q 100 178 136 166" stroke="#fef08a" strokeWidth="2" fill="none" />
            <circle cx="100" cy="154" r="4.5" fill="#fbbf24" filter={glow} />
            <circle cx="100" cy="154" r="2" fill="#ffffff" />
          </g>
        );
      default:
        return null;
    }
  }

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
    case "armor_apprentice_robe":
      return (
        <g id="armor-apprentice-robe">
          {/* Túnica azul cerúleo com botões de latão (Ragnarok Online) */}
          <path d="M 50 136 Q 100 122 150 136 L 158 185 L 42 185 Z" fill="#0284c7" stroke="#0369a1" strokeWidth="1.5" />
          <path d="M 85 136 L 100 168 L 115 136 Z" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
          <rect x="56" y="165" width="88" height="8" fill="#78350f" />
          <rect x="94" y="162" width="12" height="14" rx="2" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />
          <circle cx="100" cy="144" r="2.5" fill="#fbbf24" />
          <circle cx="100" cy="154" r="2.5" fill="#fbbf24" />
        </g>
      );
    case "outfit_scout_tunic":
      return (
        <g id="outfit-scout-tunic">
          {/* Túnica de Couro com Faixa Runada (Studio Fantasy) */}
          <path d="M 48 136 Q 100 120 152 136 L 160 186 L 40 186 Z" fill="#54301a" stroke="#381e0e" strokeWidth="1.5" />
          <rect x="44" y="136" width="18" height="12" rx="3" fill="#78350f" stroke="#b45309" strokeWidth="1" />
          <rect x="138" y="136" width="18" height="12" rx="3" fill="#78350f" stroke="#b45309" strokeWidth="1" />
          <line x1="52" y1="136" x2="148" y2="186" stroke="#92400e" strokeWidth="9" />
          <line x1="52" y1="136" x2="148" y2="186" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="4 3" filter={glow} />
          <rect x="56" y="166" width="88" height="8" fill="#292524" />
          <rect x="94" y="163" width="12" height="14" rx="2" fill="#fbbf24" stroke="#78350f" strokeWidth="1.5" />
        </g>
      );
    case "outfit_ceremonial_silks":
      return (
        <g id="outfit-ceremonial-silks" filter={glow}>
          {/* Quimono Nobre do Guardião Dracônico (Studio Fantasy) */}
          <path d="M 46 134 Q 100 118 154 134 L 164 186 L 36 186 Z" fill="#991b1b" stroke="#7f1d1d" strokeWidth="2" />
          <path d="M 36 142 L 20 178 L 48 186 Z" fill="#ea580c" />
          <path d="M 164 142 L 180 178 L 152 186 Z" fill="#ea580c" />
          <path d="M 76 134 L 100 172 L 124 134 Z" fill="#fbbf24" stroke="#f97316" strokeWidth="1.5" />
          <rect x="54" y="162" width="92" height="12" fill="#d97706" stroke="#fbbf24" strokeWidth="1.5" />
          <rect x="92" y="159" width="16" height="18" rx="2" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
          <circle cx="100" cy="168" r="3.5" fill="#ef4444" />
        </g>
      );
    case "armor_blacksmith_overalls":
      return (
        <g id="armor-blacksmith-overalls">
          {/* Jardineira do Forjador de Alberta */}
          <path d="M 48 136 Q 100 124 152 136 L 160 185 L 40 185 Z" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
          <rect x="68" y="136" width="10" height="32" fill="#92400e" stroke="#451a03" strokeWidth="1" />
          <rect x="122" y="136" width="10" height="32" fill="#92400e" stroke="#451a03" strokeWidth="1" />
          <rect x="67" y="152" width="12" height="6" rx="1" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
          <rect x="121" y="152" width="12" height="6" rx="1" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
          <rect x="85" y="154" width="30" height="22" rx="3" fill="#451a03" stroke="#b45309" strokeWidth="1.5" />
          <circle cx="92" cy="152" r="3.5" fill="#fbbf24" />
          <line x1="108" y1="147" x2="108" y2="157" stroke="#cbd5e1" strokeWidth="3" strokeLinecap="round" />
        </g>
      );
    default:
      return null;
  }
}

// =========================================================================
// 5b. HEAD_LOWER LAYER (ROSTO INFERIOR: FOLHINHA ROMÂNTICA)
// =========================================================================
function renderHeadLowerItem(headLowerId?: string | null, state: string = "idle", ctx?: SvgContext) {
  if (!headLowerId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";

  switch (headLowerId) {
    case "head_leaf_mouth":
      return (
        <g id="head-leaf-mouth" filter={glow}>
          {/* Caule curvado saindo do canto direito da boca */}
          <path d="M 106 108 Q 120 110 134 102" stroke="#15803d" strokeWidth="2" fill="none" strokeLinecap="round" />
          {/* Folhinha de trevo verde delicada com brilho */}
          <path d="M 134 102 Q 138 92 146 96 Q 148 104 138 106 Q 146 112 142 118 Q 134 114 134 102 Z" fill="#22c55e" stroke="#16a34a" strokeWidth="1" />
          <circle cx="139" cy="100" r="1.5" fill="#86efac" />
        </g>
      );
    default:
      return null;
  }
}

// =========================================================================
// 6. EYEWEAR LAYER (ÓCULOS / MÁSCARAS)
// =========================================================================
function renderEyewear(
  eyesId?: string | null,
  state: string = "idle",
  ctx?: SvgContext,
  isBlobMascot: boolean = false
) {
  if (!eyesId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";

  if (isBlobMascot) {
    switch (eyesId) {
      case "starter_glasses":
        return (
          <g id="eyewear-starter-mascot" filter={glow}>
            <circle cx="82" cy="116" r="9.5" fill="none" stroke="#38bdf8" strokeWidth="2" />
            <circle cx="118" cy="116" r="9.5" fill="none" stroke="#38bdf8" strokeWidth="2" />
            <path d="M 91.5 116 Q 100 113 108.5 116" stroke="#38bdf8" strokeWidth="2" fill="none" />
            <line x1="72.5" y1="116" x2="66" y2="114" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="127.5" y1="116" x2="134" y2="114" stroke="#38bdf8" strokeWidth="1.5" strokeLinecap="round" />
          </g>
        );
      case "eyes_cyber_visor":
        return (
          <g id="eyewear-cyber-visor-mascot" filter={glow}>
            <path d="M 68 110 L 132 110 L 126 122 L 74 122 Z" fill="#00f2fe" opacity="0.85" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="76" y1="116" x2="124" y2="116" stroke="#fff" strokeWidth="1.5" strokeDasharray="4 2" />
          </g>
        );
      default:
        return null;
    }
  }

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
  ctx?: SvgContext,
  isBlobMascot: boolean = false
) {
  if (!headId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";
  const gold = ctx?.goldGrad || "url(#goldGrad)";
  const fire = ctx?.fireGrad || "url(#fireGrad)";

  if (isBlobMascot) {
    switch (headId) {
      case "head_tiara_aprendiz":
        return (
          <g id="head-tiara-mascot" filter={glow}>
            {/* Tiara angelical flutuando suavemente como coroa sobre a auréola */}
            <path d="M 76 30 Q 100 22 124 30" stroke="#fbbf24" strokeWidth="2.5" fill="none" strokeLinecap="round" />
            <circle cx="100" cy="24" r="3.5" fill="#38bdf8" stroke="#fbbf24" strokeWidth="1" />
          </g>
        );
      case "hat_pointed_wanderer":
        return (
          <g id="head-wanderer-mascot" filter={glow}>
            {/* Chapéu cônico inclinado graciosamente sobre a cabeça/auréola da mascote */}
            <ellipse cx="100" cy="36" rx="44" ry="11" fill="#1c1917" stroke="#292524" strokeWidth="1.5" />
            <path d="M 66 36 Q 100 -2 134 36 Z" fill="#292524" stroke="#1c1917" strokeWidth="1.2" />
            <path d="M 72 34 Q 100 27 128 34 L 129 37 Q 100 30 71 37 Z" fill="#b91c1c" />
            <rect x="74" y="40" width="7" height="9" rx="1" fill="#fef08a" stroke="#ca8a04" strokeWidth="0.8" />
          </g>
        );
      default:
        break;
    }
  }

  switch (headId) {
    case "hat_pointed_wanderer":
      return (
        <g id="head-pointed-wanderer" filter={glow}>
          {/* Chapéu Cônico do Peregrino (Studio Fantasy) */}
          <ellipse cx="100" cy="66" rx="64" ry="16" fill="#1c1917" stroke="#292524" strokeWidth="2" />
          <path d="M 52 66 Q 100 14 148 66 Z" fill="#292524" stroke="#1c1917" strokeWidth="1.5" />
          <path d="M 60 62 Q 100 52 140 62 L 142 67 Q 100 57 58 67 Z" fill="#b91c1c" />
          <line x1="72" y1="64" x2="68" y2="88" stroke="#b91c1c" strokeWidth="2.5" strokeLinecap="round" />
          <rect x="63" y="86" width="10" height="15" rx="1" fill="#fef08a" stroke="#ca8a04" strokeWidth="1" />
          <text x="65" y="97" fontSize="8" fontWeight="bold" fill="#78350f">語</text>
          <ellipse cx="100" cy="74" rx="46" ry="8" fill="#0c0a09" opacity="0.35" />
        </g>
      );
    case "hood_silk_archivist":
      return (
        <g id="head-silk-archivist" filter={glow}>
          {/* Capuz Carmesim do Escriba Real (Studio Fantasy) */}
          <path
            d="M 52 78 C 50 32 70 18 100 18 C 130 18 150 32 148 78 C 136 68 118 64 100 64 C 82 64 64 68 52 78 Z"
            fill="#991b1b"
            stroke="#7f1d1d"
            strokeWidth="2"
          />
          <path d="M 62 74 Q 100 60 138 74" stroke="#fbbf24" strokeWidth="3" fill="none" strokeDasharray="5 3" />
          <path d="M 52 78 Q 45 105 52 125 L 62 118 Q 58 100 62 80 Z" fill="#7f1d1d" />
          <path d="M 148 78 Q 155 105 148 125 L 138 118 Q 142 100 138 80 Z" fill="#7f1d1d" />
          <circle cx="100" cy="22" r="3" fill="#fbbf24" />
        </g>
      );
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
    case "head_bunny_ears":
      return (
        <g id="head-bunny-ears" filter={glow}>
          {/* Orelhas de Coelho Brancas (Ragnarok Online) */}
          <ellipse cx="78" cy="38" rx="8" ry="24" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" transform="rotate(-10 78 38)" />
          <ellipse cx="78" cy="38" rx="4" ry="17" fill="#f472b6" opacity="0.6" transform="rotate(-10 78 38)" />
          <ellipse cx="122" cy="38" rx="8" ry="24" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" transform="rotate(10 122 38)" />
          <ellipse cx="122" cy="38" rx="4" ry="17" fill="#f472b6" opacity="0.6" transform="rotate(10 122 38)" />
          <path d="M 68 64 Q 100 48 132 64" stroke="#e2e8f0" strokeWidth="3" fill="none" />
          <circle cx="126" cy="58" r="4" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
        </g>
      );
    case "head_apple_archer":
      return (
        <g id="head-apple-archer" filter={glow}>
          {/* Maçã de Archer (Ragnarok Online) */}
          <circle cx="100" cy="38" r="13" fill="#ef4444" stroke="#991b1b" strokeWidth="1.2" />
          <ellipse cx="96" cy="35" rx="3.5" ry="5.5" fill="#fca5a5" transform="rotate(-20 96 35)" />
          <path d="M 100 26 Q 102 20 106 18" stroke="#78350f" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M 105 20 Q 114 18 116 24 Q 110 26 105 20 Z" fill="#22c55e" stroke="#15803d" strokeWidth="0.8" />
        </g>
      );
    case "head_mage_hat":
      return (
        <g id="head-mage-hat" filter={glow}>
          {/* Chapéu Cônico de Bruxo (Ragnarok Online) */}
          <ellipse cx="100" cy="64" rx="56" ry="13" fill="#1e1b4b" stroke="#312e81" strokeWidth="2" />
          <path d="M 64 64 Q 92 12 136 10 Q 112 40 136 64 Z" fill="#312e81" stroke="#1e1b4b" strokeWidth="1.5" />
          <path d="M 68 61 Q 100 56 132 61 L 132 67 Q 100 62 68 67 Z" fill="#d97706" />
          <rect x="94" y="58" width="12" height="10" rx="1.5" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
          <circle cx="136" cy="11" r="3" fill="#fbbf24" />
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
// 9. MAIN HAND ITEM LAYER (SLOT MAIN_HAND: ESPADAS, CAJADOS, PENA, MARTELO)
// =========================================================================
function renderHandItem(
  handId?: string | null,
  state: string = "idle",
  ctx?: SvgContext,
  isBlobMascot: boolean = false
) {
  if (!handId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";
  const cyber = ctx?.cyberGrad || "url(#cyberGrad)";

  if (isBlobMascot) {
    switch (handId) {
      case "weapon_runic_rapier":
        return (
          <g id="weapon-runic-rapier-mascot" filter={glow}>
            <ellipse cx="164" cy="118" rx="14" ry="4.5" fill="none" stroke="#38bdf8" strokeWidth="1.5" strokeDasharray="4 2" />
            <rect x="162" y="112" width="5" height="15" rx="2" fill="#78350f" />
            <ellipse cx="164" cy="112" rx="8" ry="5" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
            <circle cx="164" cy="112" r="2.5" fill="#0284c7" />
            <line x1="164" y1="108" x2="182" y2="42" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
            <line x1="166" y1="102" x2="180" y2="52" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" />
            <circle cx="182" cy="40" r="2" fill="#38bdf8" />
          </g>
        );
      case "weapon_gnarled_staff":
        return (
          <g id="weapon-gnarled-staff-mascot" filter={glow}>
            <ellipse cx="166" cy="128" rx="12" ry="4" fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 2" />
            <line x1="164" y1="130" x2="174" y2="52" stroke="#78350f" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 172 58 Q 168 40 182 36 Q 190 48 174 54" stroke="#92400e" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <circle cx="178" cy="42" r="8" fill="#10b981" stroke="#059669" strokeWidth="1.5" opacity="0.95" />
            <circle cx="176" cy="40" r="3" fill="#a7f3d0" />
            <circle cx="186" cy="36" r="1.5" fill="#34d399" />
          </g>
        );
      case "wpn_forging_hammer":
        return (
          <g id="wpn-forging-hammer-mascot" filter={glow}>
            <ellipse cx="164" cy="128" rx="13" ry="4" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="3 2" />
            <line x1="162" y1="130" x2="174" y2="58" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
            <rect x="156" y="52" width="38" height="22" rx="3" fill="#334155" stroke="#0f172a" strokeWidth="2" transform="rotate(-15 174 62)" />
            <line x1="164" y1="62" x2="184" y2="62" stroke="#fbbf24" strokeWidth="2" transform="rotate(-15 174 62)" />
          </g>
        );
      case "wpn_wizard_staff":
        return (
          <g id="wpn-wizard-staff-mascot" filter={glow}>
            <ellipse cx="166" cy="128" rx="12" ry="4" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="3 2" />
            <line x1="164" y1="130" x2="174" y2="52" stroke="#b45309" strokeWidth="4" strokeLinecap="round" />
            <circle cx="174" cy="48" r="12" fill="none" stroke="#fbbf24" strokeWidth="2" />
            <circle cx="171" cy="46" r="5" fill="#ef4444" stroke="#f97316" strokeWidth="1" filter={glow} />
            <circle cx="178" cy="50" r="4" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" filter={glow} />
          </g>
        );
      case "main_hand_pena_prata":
        return (
          <g id="main-hand-pena-mascot" filter={glow}>
            <ellipse cx="164" cy="116" rx="12" ry="4" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" />
            <path d="M 160 112 Q 176 86 182 62 Q 170 78 166 102 L 158 116 Z" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.2" />
            <polygon points="158,116 155,121 161,118" fill="#38bdf8" />
            <circle cx="154" cy="123" r="2" fill="#0284c7" />
            <circle cx="170" cy="74" r="1.2" fill="#38bdf8" />
            <circle cx="178" cy="95" r="1" fill="#fef08a" />
          </g>
        );
      case "starter_quill":
        return (
          <g id="hand-quill-mascot" filter={glow}>
            <ellipse cx="164" cy="116" rx="12" ry="4" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="3 2" />
            <path d="M 160 112 Q 176 86 182 62 Q 170 78 166 102 L 158 116 Z" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
            <polygon points="158,116 155,121 161,118" fill="#1e293b" />
            <circle cx="170" cy="74" r="1.2" fill="#fbbf24" />
          </g>
        );
      case "main_hand_cajado_carvalho":
        return (
          <g id="main-hand-cajado-mascot" filter={glow}>
            <ellipse cx="166" cy="128" rx="12" ry="4" fill="none" stroke="#10b981" strokeWidth="1.2" strokeDasharray="3 2" />
            <line x1="164" y1="130" x2="174" y2="60" stroke="#78350f" strokeWidth="4" strokeLinecap="round" />
            <circle cx="174" cy="56" r="9" fill="#10b981" stroke="#047857" strokeWidth="1.8" opacity="0.95" />
            <circle cx="172" cy="54" r="3" fill="#fff" />
          </g>
        );
      case "main_hand_espada_selo_arcano":
        return (
          <g id="main-hand-espada-arcana-mascot" filter={glow}>
            <ellipse cx="164" cy="120" rx="13" ry="4" fill="none" stroke="#00f2fe" strokeWidth="1.5" strokeDasharray="4 2" />
            <rect x="162" y="116" width="5" height="15" rx="1.5" fill="#78350f" />
            <line x1="156" y1="116" x2="172" y2="116" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M 163 116 L 182 48 L 185 50 L 166 116 Z" fill="#f8fafc" stroke="#38bdf8" strokeWidth="1.5" />
            <line x1="165" y1="110" x2="180" y2="58" stroke="#00f2fe" strokeWidth="2" strokeDasharray="4 2" />
          </g>
        );
      case "main_hand_lamina_colossal_aco":
        return (
          <g id="main-hand-lamina-colossal-mascot">
            <ellipse cx="164" cy="124" rx="14" ry="4.5" fill="none" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="4 2" />
            <rect x="162" y="116" width="6" height="18" rx="2" fill="#e2e8f0" stroke="#475569" strokeWidth="1.2" />
            <rect x="156" y="114" width="18" height="4" rx="1" fill="#1e293b" />
            <polygon points="160,114 186,28 194,32 170,114" fill="#334155" stroke="#0f172a" strokeWidth="2" />
          </g>
        );
      default:
        return (
          <g id="mascot-telekinetic-weapon" filter={glow}>
            <ellipse cx="164" cy="118" rx="12" ry="4" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" />
            <circle cx="164" cy="110" r="4" fill="#38bdf8" />
          </g>
        );
    }
  }

  switch (handId) {
    case "weapon_runic_rapier":
      return (
        <g id="weapon-runic-rapier" filter={glow}>
          {/* Florete do Tradutor Ágil (Studio Fantasy) */}
          <rect x="146" y="146" width="5" height="18" rx="2" fill="#78350f" />
          <ellipse cx="148" cy="146" rx="9" ry="6" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
          <circle cx="148" cy="146" r="3" fill="#0284c7" />
          <line x1="148" y1="142" x2="178" y2="48" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="150" y1="135" x2="174" y2="60" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" />
          <path d="M 148 164 Q 155 174 150 182" stroke="#0284c7" strokeWidth="2" fill="none" />
        </g>
      );
    case "weapon_gnarled_staff":
      return (
        <g id="weapon-gnarled-staff" filter={glow}>
          {/* Cajado das Raízes Ancestrais (Studio Fantasy) */}
          <line x1="150" y1="186" x2="168" y2="68" stroke="#78350f" strokeWidth="5" strokeLinecap="round" />
          <path d="M 166 76 Q 160 52 176 48 Q 186 64 168 70" stroke="#92400e" strokeWidth="4" fill="none" strokeLinecap="round" />
          <circle cx="172" cy="56" r="9" fill="#10b981" stroke="#059669" strokeWidth="2" opacity="0.95" />
          <circle cx="170" cy="53" r="3.5" fill="#a7f3d0" />
          <circle cx="182" cy="48" r="1.5" fill="#34d399" />
          <circle cx="162" cy="62" r="1.5" fill="#34d399" />
        </g>
      );
    case "wpn_forging_hammer":
      return (
        <g id="wpn-forging-hammer" filter={glow}>
          {/* Martelo de Batalha do Ferreiro (Ragnarok Online) */}
          <line x1="152" y1="185" x2="170" y2="60" stroke="#78350f" strokeWidth="5.5" strokeLinecap="round" />
          <line x1="152" y1="185" x2="170" y2="60" stroke="#b45309" strokeWidth="2" strokeDasharray="6 4" />
          <rect x="146" y="50" width="46" height="26" rx="3" fill="#334155" stroke="#0f172a" strokeWidth="2" transform="rotate(-15 168 62)" />
          <line x1="156" y1="62" x2="180" y2="62" stroke="#fbbf24" strokeWidth="2.5" transform="rotate(-15 168 62)" />
          <line x1="168" y1="54" x2="168" y2="70" stroke="#fbbf24" strokeWidth="2.5" transform="rotate(-15 168 62)" />
        </g>
      );
    case "wpn_wizard_staff":
      return (
        <g id="wpn-wizard-staff" filter={glow}>
          {/* Cajado do Éter Elemental (Ragnarok Online) */}
          <line x1="152" y1="185" x2="170" y2="60" stroke="#b45309" strokeWidth="4.5" strokeLinecap="round" />
          <circle cx="170" cy="55" r="14" fill="none" stroke="#fbbf24" strokeWidth="2.5" />
          <circle cx="166" cy="53" r="6" fill="#ef4444" stroke="#f97316" strokeWidth="1" filter={glow} />
          <circle cx="175" cy="57" r="5" fill="#38bdf8" stroke="#0284c7" strokeWidth="1" filter={glow} />
          <circle cx="162" cy="44" r="1.5" fill="#fbbf24" />
          <circle cx="178" cy="46" r="1.5" fill="#38bdf8" />
        </g>
      );
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
function renderOffHandItem(
  offHandId?: string | null,
  state: string = "idle",
  ctx?: SvgContext,
  isBlobMascot: boolean = false
) {
  if (!offHandId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";

  if (isBlobMascot) {
    switch (offHandId) {
      case "off_hand_adaga_precisao":
        return (
          <g id="offhand-adaga-mascot" filter={glow}>
            <ellipse cx="36" cy="118" rx="11" ry="3.5" fill="none" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" />
            <rect x="34" y="116" width="4" height="12" rx="1.5" fill="#78350f" />
            <line x1="29" y1="116" x2="43" y2="116" stroke="#fbbf24" strokeWidth="1.8" strokeLinecap="round" />
            <polygon points="34,116 18,84 38,116" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="18" cy="82" r="1.5" fill="#38bdf8" />
          </g>
        );
      case "off_hand_lanterna_ecos":
        return (
          <g id="offhand-lanterna-mascot" filter={glow}>
            <ellipse cx="34" cy="136" rx="12" ry="4" fill="none" stroke="#fbbf24" strokeWidth="1.2" strokeDasharray="3 2" />
            <line x1="34" y1="102" x2="34" y2="114" stroke="#78350f" strokeWidth="1.8" />
            <rect x="26" y="114" width="16" height="20" rx="2.5" fill="#fbbf24" stroke="#b45309" strokeWidth="1.8" />
            <rect x="29" y="117" width="10" height="14" fill="#fef08a" />
            <line x1="21" y1="124" x2="14" y2="124" stroke="#fbbf24" strokeWidth="1.8" />
            <line x1="23" y1="117" x2="16" y2="112" stroke="#fbbf24" strokeWidth="1.8" />
            <line x1="23" y1="131" x2="16" y2="136" stroke="#fbbf24" strokeWidth="1.8" />
          </g>
        );
      case "off_hand_escudo_perseveranca":
        return (
          <g id="offhand-escudo-mascot" filter={glow}>
            <ellipse cx="34" cy="136" rx="14" ry="4.5" fill="none" stroke="#60a5fa" strokeWidth="1.2" strokeDasharray="3 2" />
            <path d="M 20 102 L 48 102 Q 48 132 34 142 Q 20 132 20 102 Z" fill="#1e3a8a" stroke="#fbbf24" strokeWidth="1.8" />
            <line x1="34" y1="107" x2="34" y2="134" stroke="#fbbf24" strokeWidth="2.5" />
            <line x1="24" y1="116" x2="44" y2="116" stroke="#fbbf24" strokeWidth="2.5" />
          </g>
        );
      case "off_hand_grimorio_idiomas":
        return (
          <g id="offhand-grimorio-mascot" filter={glow}>
            <ellipse cx="34" cy="132" rx="14" ry="4.5" fill="none" stroke="#c084fc" strokeWidth="1.2" strokeDasharray="3 2" />
            <rect x="18" y="104" width="28" height="36" rx="3" fill="#4c1d95" stroke="#fbbf24" strokeWidth="1.5" transform="rotate(12 18 104)" />
            <rect x="21" y="107" width="22" height="30" rx="2" fill="#fef3c7" transform="rotate(12 18 104)" />
            <text x="27" y="124" fill="#7e22ce" fontSize="8" fontWeight="bold" transform="rotate(12 18 104)">ᚱΩ</text>
            <circle cx="16" cy="98" r="1.5" fill="#c084fc" />
            <circle cx="42" cy="96" r="1.2" fill="#fef08a" />
          </g>
        );
      default:
        return (
          <g id="mascot-telekinetic-offhand" filter={glow}>
            <ellipse cx="34" cy="120" rx="12" ry="4" fill="none" stroke="#c084fc" strokeWidth="1.2" strokeDasharray="3 2" />
            <circle cx="34" cy="115" r="4" fill="#c084fc" />
          </g>
        );
    }
  }

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
// 12. PET_GROUND LAYER (PETS / MASCOTES NO CHÃO: PORING, SPORE)
// =========================================================================
function renderPetGroundItem(petId?: string | null, state: string = "idle", ctx?: SvgContext) {
  if (!petId) return null;
  const glow = ctx?.glowEffect || "url(#glowEffect)";

  switch (petId) {
    case "familiar_clockwork_golem":
      return (
        <g id="familiar-clockwork-golem" filter={glow} className="transition-transform duration-300">
          {/* Golem Autômato de Bolso (Studio Fantasy) */}
          <ellipse cx="158" cy="184" rx="16" ry="5.5" fill="#000" opacity="0.25" />
          {/* Corpo em cúpula de latão dourado */}
          <path
            d="M 142 176 C 140 156 148 144 158 144 C 168 144 176 156 174 176 Z"
            fill="#d97706"
            stroke="#92400e"
            strokeWidth="1.5"
          />
          {/* Engrenagem giratória no peito */}
          <circle cx="158" cy="166" r="6" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
          <line x1="152" y1="166" x2="164" y2="166" stroke="#78350f" strokeWidth="1.5" />
          <line x1="158" y1="160" x2="158" y2="172" stroke="#78350f" strokeWidth="1.5" />
          {/* Olho ciclope azul ciano brilhante */}
          <circle cx="158" cy="154" r="5" fill="#0f172a" stroke="#fbbf24" strokeWidth="1" />
          <circle cx="158" cy="154" r="3" fill="#06b6d4" />
          <circle cx="157" cy="153" r="1" fill="#fff" />
          {/* Pequena chaminé de cobre soltando vapor de acerto */}
          <rect x="164" y="140" width="3" height="6" fill="#b45309" />
          <circle cx="166" cy="136" r="2" fill="#e2e8f0" opacity="0.7" />
          {/* Mãozinhas de latão batendo palmas */}
          <circle cx="145" cy="168" r="3" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
          <circle cx="171" cy="168" r="3" fill="#fbbf24" stroke="#78350f" strokeWidth="1" />
        </g>
      );
    case "pet_poring_cute":
      return (
        <g id="pet-poring" filter={glow} className="transition-transform duration-300">
          {/* Sombra no chão */}
          <ellipse cx="156" cy="184" rx="18" ry="6" fill="#000" opacity="0.25" />
          {/* Geleia rosada translúcida e fofa do Poring (Ragnarok Online) */}
          <path
            d="M 140 178 C 138 162 144 150 156 150 C 168 150 174 162 172 178 C 172 184 140 184 140 178 Z"
            fill="#f472b6"
            stroke="#db2777"
            strokeWidth="1.5"
          />
          {/* Brilho de gota do Poring */}
          <path
            d="M 146 158 Q 154 153 162 155"
            stroke="#fbcfe8"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Olhinhos pretos brilhantes */}
          <ellipse cx="149" cy="166" rx="2.5" ry="3.5" fill="#18181b" />
          <ellipse cx="163" cy="166" rx="2.5" ry="3.5" fill="#18181b" />
          <circle cx="148" cy="165" r="1" fill="#fff" />
          <circle cx="162" cy="165" r="1" fill="#fff" />
          {/* Bochechas rosadas */}
          <ellipse cx="144" cy="172" rx="2.5" ry="1.5" fill="#f43f5e" opacity="0.6" />
          <ellipse cx="168" cy="172" rx="2.5" ry="1.5" fill="#f43f5e" opacity="0.6" />
          {/* Sorriso do Poring */}
          <path d="M 153 172 Q 156 175 159 172" stroke="#9f1239" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </g>
      );
    case "pet_spore_hat":
      return (
        <g id="pet-spore" filter={glow}>
          {/* Sombra no chão */}
          <ellipse cx="156" cy="184" rx="17" ry="5.5" fill="#000" opacity="0.25" />
          {/* Tronco do cogumelo */}
          <rect x="150" y="168" width="12" height="15" rx="4" fill="#fef3c7" stroke="#d97706" strokeWidth="1" />
          <circle cx="153" cy="174" r="1.5" fill="#451a03" />
          <circle cx="159" cy="174" r="1.5" fill="#451a03" />
          <circle cx="152.5" cy="173.5" r="0.5" fill="#fff" />
          <circle cx="158.5" cy="173.5" r="0.5" fill="#fff" />
          {/* Chapéu do Spore de RO */}
          <path
            d="M 138 168 Q 156 142 174 168 Q 156 172 138 168 Z"
            fill="#6366f1"
            stroke="#4338ca"
            strokeWidth="1.5"
          />
          <circle cx="156" cy="154" r="3.5" fill="#e0e7ff" />
          <circle cx="146" cy="162" r="2.5" fill="#e0e7ff" />
          <circle cx="166" cy="162" r="2.5" fill="#e0e7ff" />
        </g>
      );
    default:
      return null;
  }
}

// =========================================================================
// 13. STATE OVERLAYS (FALA, ESCUTA, PENSAMENTO, CELEBRAÇÃO)
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
