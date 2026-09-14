import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';

interface AudioWaveformProps {
  isActive?: boolean;
  barCount?: number;
  color?: 'amber' | 'teal' | 'emerald' | 'indigo' | 'rose';
  className?: string;
  onClick?: () => void;
  label?: string;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive = true,
  barCount = 12,
  color = 'teal',
  className = '',
  onClick,
  label = 'Áudio Bencho Visualizer',
}) => {
  const colorMap = {
    amber: 'bg-amber-400 border-amber-500',
    teal: 'bg-teal-400 border-teal-500',
    emerald: 'bg-emerald-400 border-emerald-500',
    indigo: 'bg-indigo-400 border-indigo-500',
    rose: 'bg-rose-400 border-rose-500',
  };

  const glowMap = {
    amber: 'shadow-amber-500/30',
    teal: 'shadow-teal-500/30',
    emerald: 'shadow-emerald-500/30',
    indigo: 'shadow-indigo-500/30',
    rose: 'shadow-rose-500/30',
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center gap-3 p-2.5 px-4 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-lg backdrop-blur-md select-none transition-all ${
        onClick ? 'cursor-pointer hover:border-slate-500 active:scale-95' : ''
      } ${className}`}
    >
      <div className="flex items-center gap-1.5 text-slate-300">
        {isActive ? (
          <Volume2 className="w-4 h-4 text-teal-400 animate-pulse shrink-0" />
        ) : (
          <VolumeX className="w-4 h-4 text-slate-500 shrink-0" />
        )}
        {label && <span className="text-[11px] font-bold tracking-wide uppercase">{label}</span>}
      </div>

      <div className="flex items-center gap-1 h-6 px-1">
        {Array.from({ length: barCount }).map((_, index) => {
          // Calculate dynamic height multipliers for realistic audio frequency curve
          const baseDelay = (index * 0.15).toFixed(2);
          const barHeightPercentage = isActive
            ? Math.floor(30 + Math.sin(index * 0.8) * 40 + (index % 3) * 15)
            : 20;

          return (
            <div
              key={index}
              className={`w-1 rounded-full transition-all duration-300 ${colorMap[color]} ${
                isActive ? `${glowMap[color]} shadow-xs animate-bounce` : 'opacity-30'
              }`}
              style={{
                height: `${barHeightPercentage}%`,
                animationDelay: `${baseDelay}s`,
                animationDuration: '0.8s',
              }}
            />
          );
        })}
      </div>
    </div>
  );
};
