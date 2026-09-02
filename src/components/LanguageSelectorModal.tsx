import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SUPPORTED_LANGUAGES, getLanguageById } from "@/data/languages";
import { getTutorsByLanguage } from "@/data/tutors";
import { LanguageDefinition, SupportedLanguage } from "@/types/language";
import { Globe, Check, Sparkles, Users } from "lucide-react";

interface LanguageSelectorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedLanguageId?: SupportedLanguage;
  onSelectLanguage: (lang: LanguageDefinition) => void;
}

export const LanguageSelectorModal: React.FC<LanguageSelectorModalProps> = ({
  open,
  onOpenChange,
  selectedLanguageId = "en",
  onSelectLanguage,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[94vw] rounded-2xl p-5 sm:p-6 max-h-[88vh] overflow-y-auto">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Globe className="h-5 w-5 text-primary" />
            Escolha o Idioma de Estudo
          </DialogTitle>
          <DialogDescription className="text-xs">
            Selecione qual idioma você deseja praticar hoje. Cada língua possui tutores homens e mulheres dedicados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-2.5 py-3">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.id === selectedLanguageId;
            const tutors = getTutorsByLanguage(lang.id);

            return (
              <button
                key={lang.id}
                type="button"
                onClick={() => {
                  onSelectLanguage(lang);
                  onOpenChange(false);
                }}
                className={`w-full rounded-2xl border p-3.5 text-left transition-all cursor-pointer flex items-start gap-3.5 group relative ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-sm ring-2 ring-primary/25"
                    : "border-border bg-card/60 hover:bg-muted/40 hover:border-border/80"
                }`}
              >
                {/* Bandeira & Ícone */}
                <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-3xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  {lang.flag}
                </div>

                {/* Detalhes do Idioma */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-bold text-foreground flex items-center gap-1">
                        {lang.name}
                      </h3>
                      <span className="text-[10px] text-muted-foreground font-medium">
                        ({lang.nativeName})
                      </span>
                    </div>

                    {isSelected ? (
                      <Badge className="h-5 px-2 text-[10px] bg-primary text-primary-foreground font-bold flex items-center gap-1">
                        <Check className="h-2.5 w-2.5" /> Ativo
                      </Badge>
                    ) : (
                      <span className="text-[10px] text-muted-foreground group-hover:text-primary font-medium">
                        Selecionar &rarr;
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground mt-1 leading-snug">
                    {lang.description}
                  </p>

                  {/* Tutores disponíveis para este idioma */}
                  <div className="flex items-center gap-2 mt-2 pt-2 border-t border-border/40">
                    <span className="text-[10px] font-semibold text-primary/80 flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {tutors.length} {tutors.length === 1 ? "tutor" : "tutores"}:
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {tutors.map((t) => (
                        <span
                          key={t.id}
                          className="text-[10px] bg-card border border-border/70 text-foreground px-1.5 py-0.5 rounded-md flex items-center gap-1 font-medium"
                        >
                          <span>{t.avatar}</span>
                          <span>{t.name}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
