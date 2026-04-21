'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/i18n';
import {
  ArrowLeft,
  Send,
  Package,
  Gamepad2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getCategories,
  createThread,
  type ForumCategory,
  type ForumThread,
  type PackData,
} from '@/lib/forum';
import { toast } from 'sonner';

// ─── LANGUAGES ───────────────────────────────────────────────────────────────

const LANGUAGES = [
  { code: 'it', name: 'Italiano', flag: '🇮🇹' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'pl', name: 'Polski', flag: '🇵🇱' },
];

// ─── NEW THREAD FORM ─────────────────────────────────────────────────────────

interface NewThreadProps {
  initialCategory?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  onBack?: () => void;
  onSuccess?: (thread: ForumThread) => void;
}

export function NewThread({ initialCategory, userId, userName, userAvatar, onBack, onSuccess }: NewThreadProps) {
  const { t } = useTranslation();
  
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Form state
  const [categorySlug, setCategorySlug] = useState(initialCategory || '');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isTranslationPack, setIsTranslationPack] = useState(initialCategory === 'traduzioni');
  
  // Pack data
  const [gameName, setGameName] = useState('');
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('it');
  const [stringCount, setStringCount] = useState('');
  const [version, setVersion] = useState('1.0');
  const [engine, setEngine] = useState('');
  const [downloadUrl, setDownloadUrl] = useState('');
  
  // ─── LOAD CATEGORIES ───────────────────────────────────────────────────────
  
  useEffect(() => {
    getCategories().then(setCategories);
  }, []);
  
  // Auto-enable pack mode when selecting traduzioni category
  useEffect(() => {
    if (categorySlug === 'traduzioni') {
      setIsTranslationPack(true);
    }
  }, [categorySlug]);
  
  // ─── SUBMIT ────────────────────────────────────────────────────────────────
  
  const handleSubmit = async () => {
    if (!categorySlug) {
      toast.error(t('common.selezionaUnaCategoria'));
      return;
    }
    if (!title.trim()) {
      toast.error(t('common.inserisciUnTitolo'));
      return;
    }
    if (!content.trim()) {
      toast.error(t('common.inserisciUnContenuto'));
      return;
    }
    
    if (isTranslationPack) {
      if (!gameName.trim()) {
        toast.error(t('common.inserisciIlNomeDelGioco'));
        return;
      }
      if (!downloadUrl.trim()) {
        toast.error(t('common.inserisciIlLinkPerIlDownload'));
        return;
      }
    }
    
    setLoading(true);
    try {
      const packData: PackData | undefined = isTranslationPack ? {
        game_name: gameName,
        source_lang: sourceLang,
        target_lang: targetLang,
        string_count: parseInt(stringCount) || 0,
        version,
        engine: engine || undefined,
        download_url: downloadUrl,
      } : undefined;
      
      const thread = await createThread(
        {
          category_slug: categorySlug,
          title,
          content,
          is_translation_pack: isTranslationPack,
          pack_data: packData,
        },
        { id: userId, name: userName, avatar: userAvatar }
      );
      
      if (thread) {
        toast.success(t('common.threadCreatoConSuccesso'));
        onSuccess?.(thread);
      } else {
        toast.error(t('common.erroreNellaCreazioneDelThread'));
      }
    } catch (error) {
      console.error('[NewThread] Error:', error);
      toast.error(t('common.erroreNellaCreazioneDelThread'));
    } finally {
      setLoading(false);
    }
  };
  
  // ─── RENDER ────────────────────────────────────────────────────────────────
  
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
        <h1 className="text-xl font-bold text-white">{t('common.nuovoThread')}</h1>
      </div>
      
      {/* Category */}
      <div className="space-y-2">
        <Label>{t('common.categoria')} *</Label>
        <Select value={categorySlug} onValueChange={setCategorySlug}>
          <SelectTrigger className="bg-slate-800/50 border-slate-700/50">
            <SelectValue placeholder={t('common.selezionaUnaCategoria')} />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat.id} value={cat.slug}>
                <span className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  <span>{cat.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Title */}
      <div className="space-y-2">
        <Label>{t('common.titolo')} *</Label>
        <Input
          placeholder={t('common.unTitoloDescrittivoPerIlTuoThread')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-slate-800/50 border-slate-700/50"
        />
      </div>
      
      {/* Translation Pack Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-amber-500/10 border border-amber-500/30">
        <div className="flex items-center gap-3">
          <Package className="h-5 w-5 text-amber-400" />
          <div>
            <p className="text-sm font-medium text-white">{t('common.questoÈUnPackDiTraduzione')}</p>
            <p className="text-xs text-slate-400">{t('common.attivaPerCondividereUnPackScaricabile')}</p>
          </div>
        </div>
        <Switch
          checked={isTranslationPack}
          onCheckedChange={setIsTranslationPack}
        />
      </div>
      
      {/* Pack Details */}
      {isTranslationPack && (
        <div className="space-y-4 p-4 rounded-lg bg-slate-800/30 border border-slate-700/50">
          <h3 className="text-sm font-semibold text-amber-400 flex items-center gap-2">
            <Gamepad2 className="h-4 w-4" />
            {t('common.dettagliPack')}
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{t('common.nomeGioco')} *</Label>
              <Input
                placeholder="es. The Witcher 3"
                value={gameName}
                onChange={(e) => setGameName(e.target.value)}
                className="bg-slate-900/50 border-slate-600/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Engine</Label>
              <Input
                placeholder="es. Unity, Unreal, RPG Maker"
                value={engine}
                onChange={(e) => setEngine(e.target.value)}
                className="bg-slate-900/50 border-slate-600/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label>{t('common.linguaOriginale')}</Label>
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{t('common.linguaTraduzione')}</Label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger className="bg-slate-900/50 border-slate-600/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGES.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.flag} {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>{t('common.numeroStringhe')}</Label>
              <Input
                type="number"
                placeholder="es. 15000"
                value={stringCount}
                onChange={(e) => setStringCount(e.target.value)}
                className="bg-slate-900/50 border-slate-600/50"
              />
            </div>
            
            <div className="space-y-2">
              <Label>{t('common.versione')}</Label>
              <Input
                placeholder="es. 1.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="bg-slate-900/50 border-slate-600/50"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>{t('common.linkDownload')} *</Label>
            <Input
              placeholder="https://drive.google.com/... o altro link diretto"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              className="bg-slate-900/50 border-slate-600/50"
            />
            <p className="text-xs text-slate-500">
              {t('common.puoiUsareGoogleDriveMegaDropboxOQualsiasiServizioDiHosting')}
            </p>
          </div>
        </div>
      )}
      
      {/* Content */}
      <div className="space-y-2">
        <Label>{t('common.contenuto')} *</Label>
        <Textarea
          placeholder={isTranslationPack 
            ? t('common.descrizionePackPlaceholder')
            : t('common.contenutoThreadPlaceholder')
          }
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="min-h-[200px] bg-slate-800/50 border-slate-700/50"
        />
      </div>
      
      {/* Submit */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
        <p className="text-xs text-slate-500">
          {t('common.campiObbligatori')}
        </p>
        <div className="flex items-center gap-3">
          {onBack && (
            <Button variant="ghost" onClick={onBack}>
              {t('common.annulla')}
            </Button>
          )}
          <Button onClick={handleSubmit} disabled={loading} className="bg-blue-600 hover:bg-blue-500">
            <Send className="h-4 w-4 mr-2" />
            {loading ? t('common.pubblicazione') : t('common.pubblicaThread')}
          </Button>
        </div>
      </div>
    </div>
  );
}
