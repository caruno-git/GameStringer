'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  analyzeContent, 
  analyzeBatch, 
  suggestTranslationSettings,
  autoAdaptSettings,
  type ContentAnalysis,
  type ContentType,
} from '@/lib/ai/adaptive-translation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  Brain,
  Zap,
  MessageSquare,
  BookOpen,
  Settings,
  Smile,
  Heart,
  Box,
  GraduationCap,
  Monitor,
  Activity,
  Sparkles,
  Check,
  RefreshCw,
} from 'lucide-react';

interface AdaptiveTranslationPanelProps {
  texts: string[];
  currentChain?: string;
  currentPersona?: string;
  currentTone?: string;
  onChainChange?: (chain: string) => void;
  onPersonaChange?: (persona: string) => void;
  onToneChange?: (tone: string) => void;
  onAutoAdapt?: (analysis: ContentAnalysis) => void;
}

const CONTENT_TYPE_ICONS: Record<ContentType, React.ReactNode> = {
  ui: <Monitor className="h-4 w-4" />,
  dialogue: <MessageSquare className="h-4 w-4" />,
  narrative: <BookOpen className="h-4 w-4" />,
  technical: <Settings className="h-4 w-4" />,
  humor: <Smile className="h-4 w-4" />,
  poetry: <Sparkles className="h-4 w-4" />,
  system: <Activity className="h-4 w-4" />,
  item: <Box className="h-4 w-4" />,
  tutorial: <GraduationCap className="h-4 w-4" />,
  emotion: <Heart className="h-4 w-4" />,
};

const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  ui: 'UI / Interface',
  dialogue: 'Dialogue',
  narrative: 'Narrative',
  technical: 'Technical',
  humor: 'Humor / Comedy',
  poetry: 'Poetry / Arts',
  system: 'System',
  item: 'Items / Stats',
  tutorial: 'Tutorial',
  emotion: 'Emotional',
};

const CHAIN_LABELS: Record<string, string> = {
  free: '🆓 Gratis',
  privacy: '🔒 Privacy',
  economy: '💰 Economica',
  balanced: '⚖️ Bilanciata',
  quality: '✨ Qualità',
  max_quality: '👑 Massima Qualità',
  creative: '🎭 Creative',
  long_context: '📚 Long Context',
  voice: '🎤 Voice',
  auto: '🧠 Auto-Select',
};

export function AdaptiveTranslationPanel({
  texts,
  currentChain = 'balanced',
  currentPersona = '',
  currentTone = '',
  onChainChange,
  onPersonaChange,
  onToneChange,
  onAutoAdapt,
}: AdaptiveTranslationPanelProps) {
  const [analysis, setAnalysis] = useState<ContentAnalysis | null>(null);
  const [distribution, setDistribution] = useState<Record<ContentType, number> | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [autoAdapt, setAutoAdapt] = useState(false);
  const [adapted, setAdapted] = useState(false);

  const performAnalysis = useCallback(() => {
    if (!texts || texts.length === 0) return;
    
    setIsAnalyzing(true);
    
    try {
      if (texts.length === 1) {
        const result = analyzeContent(texts[0]);
        setAnalysis(result);
        setDistribution(null);
      } else {
        const batchResult = analyzeBatch(texts);
        setAnalysis(batchResult);
        setDistribution(batchResult.distribution);
      }
    } catch (err) {
      console.error('Analysis error:', err);
    } finally {
      setIsAnalyzing(false);
    }
  }, [texts]);

  useEffect(() => {
    performAnalysis();
  }, [performAnalysis]);

  const handleAutoAdapt = () => {
    if (!analysis) return;

    if (onChainChange && analysis.recommendedChain !== currentChain) {
      onChainChange(analysis.recommendedChain);
    }

    if (onPersonaChange && analysis.recommendedPersona && analysis.recommendedPersona !== currentPersona) {
      onPersonaChange(analysis.recommendedPersona);
    }

    if (onToneChange && analysis.recommendedTone && analysis.recommendedTone !== currentTone) {
      onToneChange(analysis.recommendedTone);
    }

    setAdapted(true);
    onAutoAdapt?.(analysis);
    
    toast.success(`Adattato per: ${CONTENT_TYPE_LABELS[analysis.type]}`, {
      description: `Chain: ${CHAIN_LABELS[analysis.recommendedChain] || analysis.recommendedChain}`,
    });

    setTimeout(() => setAdapted(false), 2000);
  };

  const handleToggleAutoAdapt = (checked: boolean) => {
    setAutoAdapt(checked);
    if (checked && analysis) {
      handleAutoAdapt();
    }
  };

  if (!analysis) {
    return (
      <Card className="p-4">
        <div className="flex items-center justify-center py-8 text-slate-500">
          <RefreshCw className="h-5 w-5 animate-spin mr-2" />
          Analisi contenuto...
        </div>
      </Card>
    );
  }

  const totalTexts = texts.length;
  const suggestions = suggestTranslationSettings(
    texts[0] || '',
    currentChain,
    currentPersona,
    currentTone
  );

  return (
    <Card className="p-4 border-purple-500/20">
      <CardHeader className="p-0 pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Brain className="h-4 w-4 text-purple-400" />
          Adaptive Translation
          <Badge variant="outline" className="text-xs">AI</Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {/* Main Detection */}
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
          <div className={`p-2 rounded-lg ${
            analysis.confidence > 0.7 ? 'bg-emerald-500/20 text-emerald-400' :
            analysis.confidence > 0.4 ? 'bg-amber-500/20 text-amber-400' :
            'bg-slate-500/20 text-slate-400'
          }`}>
            {CONTENT_TYPE_ICONS[analysis.type]}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-slate-200">
                {CONTENT_TYPE_LABELS[analysis.type]}
              </span>
              <Badge variant="outline" className="text-xs">
                {(analysis.confidence * 100).toFixed(0)}%
              </Badge>
            </div>
            <p className="text-xs text-slate-400">{analysis.explanation}</p>
          </div>
        </div>

        {/* Distribution (for batch) */}
        {distribution && (
          <div className="space-y-2">
            <p className="text-xs text-slate-400">Distribuzione contenuto:</p>
            <div className="flex flex-wrap gap-1">
              {Object.entries(distribution)
                .filter(([, count]) => count > 0)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([type, count]) => (
                  <Badge
                    key={type}
                    variant="outline"
                    className="text-xs bg-slate-800/50"
                  >
                    {CONTENT_TYPE_ICONS[type as ContentType]}
                    <span className="ml-1">{Math.round((count / totalTexts) * 100)}%</span>
                  </Badge>
                ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {suggestions.shouldAdapt && (
          <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 space-y-2">
            <p className="text-xs font-medium text-purple-300 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Suggerimenti AI
            </p>
            
            {suggestions.suggestions.chain && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Chain:</span>
                <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                  {CHAIN_LABELS[suggestions.suggestions.chain] || suggestions.suggestions.chain}
                </Badge>
              </div>
            )}
            
            {suggestions.suggestions.persona && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Persona:</span>
                <span className="text-slate-300 italic">{suggestions.suggestions.persona}</span>
              </div>
            )}
            
            {suggestions.suggestions.tone && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Tono:</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {suggestions.suggestions.tone}
                </Badge>
              </div>
            )}
          </div>
        )}

        {/* Metadata */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-slate-800/30">
            <span className="text-slate-500">Complessità:</span>
            <span className="ml-2 capitalize text-slate-300">{analysis.complexity}</span>
          </div>
          <div className="p-2 rounded bg-slate-800/30">
            <span className="text-slate-500">Urgenza:</span>
            <span className="ml-2 capitalize text-slate-300">{analysis.urgency}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-2">
          <Button
            size="sm"
            onClick={handleAutoAdapt}
            disabled={adapted || !suggestions.shouldAdapt}
            className={`flex-1 gap-1.5 ${
              adapted 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-purple-500/20 text-purple-300 border-purple-500/30 hover:bg-purple-500/30'
            }`}
            variant="outline"
          >
            {adapted ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Adattato
              </>
            ) : (
              <>
                <Sparkles className="h-3.5 w-3.5" />
                Adatta Ora
              </>
            )}
          </Button>
          
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/50">
            <Switch
              checked={autoAdapt}
              onCheckedChange={handleToggleAutoAdapt}
            />
            <span className="text-xs text-slate-400">Auto</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

