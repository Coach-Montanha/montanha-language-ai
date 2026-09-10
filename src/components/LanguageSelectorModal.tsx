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
import { IconTile } from "@/components/ui/icon-tile";

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

        <div className="space-y-2 py-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = lang.id === selectedLanguageId;
            const tutors = getTutorsByLanguage(lang.id);

            return (
              <IconTile
                key={lang.id}
                icon={<span className="text-2xl p-1.5">{lang.flag}</span>}
                title={lang.name}
                subtitle={`${lang.nativeName} • ${tutors.length} ${tutors.length === 1 ? "tutor" : "tutores"}`}
                selected={isSelected}
                onClick={() => {
                  onSelectLanguage(lang);
                  onOpenChange(false);
                }}
                actionSlot={
                  !isSelected && (
                    <span className="text-[11px] text-muted-foreground font-medium pr-1">
                      Selecionar &rarr;
                    </span>
                  )
                }
              />
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
