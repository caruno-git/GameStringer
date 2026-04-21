'use client';

import { useTranslation } from '@/lib/i18n';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface LanguageSelectorProps {
  showFlag?: boolean;
  showNativeName?: boolean;
  className?: string;
}

// Mappa lingue con bandiere e nomi nativi
const LANGUAGE_INFO: Record<string, { name: string; nativeName: string; flag: string }> = {
  en: { name: 'English', nativeName: 'English', flag: '🇬🇧' },
  it: { name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  es: { name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  de: { name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  fr: { name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  ja: { name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  zh: { name: 'Chinese', nativeName: '中文', flag: '🇨🇳' },
  ko: { name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  pt: { name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷' },
  ru: { name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  pl: { name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
};

export function LanguageSelector({
  showFlag = true,
  showNativeName = true,
  className,
}: LanguageSelectorProps) {
  const { language, setLanguage } = useTranslation();

  const handleChange = (value: string) => {
    setLanguage(value as any);
  };

  const currentInfo = LANGUAGE_INFO[language];

  return (
    <Select value={language} onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue>
          {currentInfo && (
            <span className="flex items-center gap-2">
              {showFlag && <span>{currentInfo.flag}</span>}
              <span>{showNativeName ? currentInfo.nativeName : currentInfo.name}</span>
            </span>
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(LANGUAGE_INFO).map(([code, info]) => (
          <SelectItem key={code} value={code}>
            <span className="flex items-center gap-2">
              {showFlag && <span>{info.flag}</span>}
              <span>{showNativeName ? info.nativeName : info.name}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function LanguageSelectorCompact({ className }: { className?: string }) {
  const { language, setLanguage } = useTranslation();

  const handleChange = (value: string) => {
    setLanguage(value as any);
  };

  const currentInfo = LANGUAGE_INFO[language];

  return (
    <Select value={language} onValueChange={handleChange}>
      <SelectTrigger className={`w-16 ${className}`}>
        <SelectValue>
          {currentInfo?.flag}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(LANGUAGE_INFO).map(([code, info]) => (
          <SelectItem key={code} value={code}>
            <span className="flex items-center gap-2">
              <span>{info.flag}</span>
              <span className="text-sm">{code.toUpperCase()}</span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
