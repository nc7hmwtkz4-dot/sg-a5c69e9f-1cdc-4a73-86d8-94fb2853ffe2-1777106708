import { Globe } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage, Language } from "@/contexts/LanguageContext";

const LANGUAGES = {
  fr: { label: "Français", flag: "🇫🇷" },
  en: { label: "English", flag: "🇬🇧" },
  es: { label: "Español", flag: "🇪🇸" },
};

export function LanguageSelector() {
  const { language, setLanguage } = useLanguage();

  return (
    <Select value={language} onValueChange={(value) => setLanguage(value as Language)}>
      <SelectTrigger className="w-[140px]">
        <Globe className="h-4 w-4 mr-2" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {Object.entries(LANGUAGES).map(([code, { label, flag }]) => (
          <SelectItem key={code} value={code}>
            <span className="flex items-center gap-2">
              <span>{flag}</span>
              <span>{label}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}