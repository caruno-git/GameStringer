'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useTranslation } from '@/lib/i18n';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Cpu,
  Zap,
  Settings2,
  BookOpen,
  Users,
  Database,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  TrendingUp,
  HardDrive,
  Gauge,
  Layers,
  Hash,
  Type,
  Target,
} from 'lucide-react';

// Advanced Ollama Service imports
import {
  detectGPU,
  recommendModels,
  analyzeTextComplexity,
  selectOptimalModel,
  DEFAULT_ADVANCED_PARAMS,
  PARAMETER_PRESETS,
  GAME_GENRE_TEMPLATES,
  TranslationCache,
  translateWithEnsemble,
  checkModelUpdates,
  type GPUInfo,
  type AdvancedParameters,
  type EnsembleConfig,
} from '@/lib/ai/ollama-advanced-service';
import {
  useStreamingTranslation,
} from '@/lib/ai/use-streaming-translation';

import {
  isOllamaRunning,
  listInstalledModels,
  type OllamaModel,
} from '@/lib/ollama-manager';

export default function OllamaAdvancedPage() {
  const { t } = useTranslation();
  const [ollamaOnline, setOllamaOnline] = useState(false);
  const [installedModels, setInstalledModels] = useState<OllamaModel[]>([]);
  const [activeTab, setActiveTab] = useState('gpu');

  // GPU Advisor State
  const [gpuInfo, setGpuInfo] = useState<GPUInfo | null>(null);
  const [gpuLoading, setGpuLoading] = useState(false);

  // Advanced Parameters State
  const [advancedParams, setAdvancedParams] = useState<AdvancedParameters>(DEFAULT_ADVANCED_PARAMS);
  const [selectedPreset, setSelectedPreset] = useState('balanced');

  // Prompt Template State
  const [selectedGenre, setSelectedGenre] = useState('rpg');
  const [previewPrompt, setPreviewPrompt] = useState('');

  // Ensemble State
  const [ensembleModels, setEnsembleModels] = useState<string[]>([]);
  const [votingStrategy, setVotingStrategy] = useState<EnsembleConfig['votingStrategy']>('best_quality');

  // Cache State
  const [cacheStats, setCacheStats] = useState({
    totalEntries: 0,
    totalSizeKB: 0,
    hitRate: 0,
  });

  // Streaming Demo State
  const streamingHook = useStreamingTranslation();
  const [demoText, setDemoText] = useState("Hello, how are you today?");
  const [demoSource, setDemoSource] = useState('en');
  const [demoTarget, setDemoTarget] = useState('it');
  const [demoModel, setDemoModel] = useState('qwen2.5:14b');

  // Load initial data
  useEffect(() => {
    const init = async () => {
      const running = await isOllamaRunning();
      setOllamaOnline(running);
      
      if (running) {
        const models = await listInstalledModels();
        setInstalledModels(models);
        
        // Load cache stats
        const cache = TranslationCache.getInstance();
        const stats = await cache.getStats();
        setCacheStats(stats);
      }
    };
    init();
  }, []);

  // GPU Detection
  const handleDetectGPU = async () => {
    setGpuLoading(true);
    try {
      const info = await detectGPU();
      setGpuInfo(info);
      toast.success(t('ollama.gpuDetected'), { description: `${info.name} - ${(info.vram_total_mb / 1024).toFixed(1)}GB VRAM` });
    } catch (error) {
      toast.error(t('ollama.gpuDetectionFailed'));
    } finally {
      setGpuLoading(false);
    }
  };

  // Parameter presets
  const applyPreset = (preset: string) => {
    setSelectedPreset(preset);
    setAdvancedParams(PARAMETER_PRESETS[preset] || DEFAULT_ADVANCED_PARAMS);
  };

  // Update preview prompt when genre changes
  useEffect(() => {
    const template = GAME_GENRE_TEMPLATES.find(t => t.id === selectedGenre);
    if (template) {
      setPreviewPrompt(template.systemPrompt);
    }
  }, [selectedGenre]);

  // Run streaming demo
  const runStreamingDemo = async () => {
    await streamingHook.startStreaming(demoText, demoSource, demoTarget, {
      model: demoModel,
      temperature: advancedParams.temperature,
      topP: advancedParams.topP,
      topK: advancedParams.topK,
    });
  };

  if (!ollamaOnline) {
    return (
      <div className="container mx-auto p-6">
        <Alert className="border-amber-500/30 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-400" />
          <AlertTitle>{t('ollama.notRunning')}</AlertTitle>
          <AlertDescription>
            {t('ollama.startToUseAdvanced')}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            {t('ollama.advancedFeatures')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('ollama.advancedDescription')}
          </p>
        </div>
        <Badge variant="outline" className="gap-1">
          <Zap className="h-3 w-3" />
          {t('ollama.poweredByOllama')}
        </Badge>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid grid-cols-5 lg:grid-cols-6">
          <TabsTrigger value="gpu" className="gap-2">
            <Cpu className="h-4 w-4" />
            <span className="hidden sm:inline">{t('ollama.gpuAdvisor')}</span>
          </TabsTrigger>
          <TabsTrigger value="params" className="gap-2">
            <Settings2 className="h-4 w-4" />
            <span className="hidden sm:inline">{t('ollama.parameters')}</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-2">
            <BookOpen className="h-4 w-4" />
            <span className="hidden sm:inline">{t('ollama.templates')}</span>
          </TabsTrigger>
          <TabsTrigger value="ensemble" className="gap-2">
            <Users className="h-4 w-4" />
            <span className="hidden sm:inline">{t('ollama.ensemble')}</span>
          </TabsTrigger>
          <TabsTrigger value="streaming" className="gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">{t('ollama.streaming')}</span>
          </TabsTrigger>
          <TabsTrigger value="cache" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">{t('ollama.cache')}</span>
          </TabsTrigger>
        </TabsList>

        {/* GPU ADVISOR TAB */}
        <TabsContent value="gpu" className="space-y-6">
          <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Cpu className="h-5 w-5 text-violet-400" />
                {t('ollama.gpuAdvisorTitle')}
              </CardTitle>
              <CardDescription>{t('ollama.gpuAdvisorDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Button onClick={handleDetectGPU} disabled={gpuLoading} className="gap-2">
                {gpuLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Cpu className="h-4 w-4" />}
                {gpuLoading ? t('common.detecting') : t('ollama.detectGPU')}
              </Button>

              {gpuInfo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="grid gap-4"
                >
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="bg-slate-800/50">
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">{t('ollama.gpuName')}</div>
                        <div className="font-semibold truncate">{gpuInfo.name}</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50">
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">{t('ollama.totalVRAM')}</div>
                        <div className="font-semibold">{(gpuInfo.vram_total_mb / 1024).toFixed(1)} GB</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50">
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">{t('ollama.availableVRAM')}</div>
                        <div className="font-semibold text-emerald-400">{(gpuInfo.vram_available_mb / 1024).toFixed(1)} GB</div>
                      </CardContent>
                    </Card>
                    <Card className="bg-slate-800/50">
                      <CardContent className="p-4">
                        <div className="text-sm text-muted-foreground">{t('ollama.cudaSupport')}</div>
                        <Badge variant={gpuInfo.cuda_support ? "default" : "secondary"} className={gpuInfo.cuda_support ? "bg-emerald-500/20 text-emerald-400" : ""}>
                          {gpuInfo.cuda_support ? t('common.yes') : t('common.no')}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>

                  {/* VRAM Usage Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{t('ollama.vramUsage')}</span>
                      <span>{(100 - (gpuInfo.vram_available_mb / gpuInfo.vram_total_mb * 100)).toFixed(1)}%</span>
                    </div>
                    <Progress 
                      value={100 - (gpuInfo.vram_available_mb / gpuInfo.vram_total_mb * 100)} 
                      className="h-2"
                    />
                  </div>

                  {/* Recommended Models */}
                  {(() => {
                    const recs = recommendModels(gpuInfo);
                    return (
                      <div className="space-y-4">
                        <h4 className="font-semibold flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                          {t('ollama.recommendedModels')}
                        </h4>
                        <div className="grid gap-2">
                          {recs.recommended.slice(0, 3).map((model) => (
                            <div key={model.model} className="flex items-center justify-between p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
                              <div>
                                <div className="font-medium">{model.model}</div>
                                <div className="text-xs text-muted-foreground">
                                  {t('ollama.quality')}: {model.quality}/5 • {t('ollama.speed')}: {model.speed}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{model.recommendedVramGB}GB</Badge>
                                {installedModels.some(m => m.name.includes(model.model)) && (
                                  <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* PARAMETERS TAB */}
        <TabsContent value="params" className="space-y-6">
          <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings2 className="h-5 w-5 text-cyan-400" />
                {t('ollama.advancedParameters')}
              </CardTitle>
              <CardDescription>{t('ollama.parametersDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Presets */}
              <div className="flex flex-wrap gap-2">
                {Object.keys(PARAMETER_PRESETS).map((preset) => (
                  <Button
                    key={preset}
                    variant={selectedPreset === preset ? "default" : "outline"}
                    size="sm"
                    onClick={() => applyPreset(preset)}
                  >
                    {t(`ollama.preset.${preset}`)}
                  </Button>
                ))}
              </div>

              <Separator />

              {/* Temperature */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Gauge className="h-4 w-4" />
                    {t('ollama.temperature')}
                  </label>
                  <span className="text-sm text-muted-foreground">{advancedParams.temperature.toFixed(1)}</span>
                </div>
                <Slider
                  value={[advancedParams.temperature]}
                  onValueChange={([v]) => setAdvancedParams(p => ({ ...p, temperature: v }))}
                  min={0}
                  max={2}
                  step={0.1}
                />
                <p className="text-xs text-muted-foreground">
                  {t('ollama.temperatureDesc')}
                </p>
              </div>

              {/* Top P */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">{t('ollama.topP')}</label>
                  <span className="text-sm text-muted-foreground">{advancedParams.topP.toFixed(2)}</span>
                </div>
                <Slider
                  value={[advancedParams.topP]}
                  onValueChange={([v]) => setAdvancedParams(p => ({ ...p, topP: v }))}
                  min={0}
                  max={1}
                  step={0.05}
                />
              </div>

              {/* Top K */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">{t('ollama.topK')}</label>
                  <span className="text-sm text-muted-foreground">{advancedParams.topK}</span>
                </div>
                <Slider
                  value={[advancedParams.topK]}
                  onValueChange={([v]) => setAdvancedParams(p => ({ ...p, topK: v }))}
                  min={0}
                  max={100}
                  step={1}
                />
              </div>

              {/* Repeat Penalty */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">{t('ollama.repeatPenalty')}</label>
                  <span className="text-sm text-muted-foreground">{advancedParams.repeatPenalty.toFixed(2)}</span>
                </div>
                <Slider
                  value={[advancedParams.repeatPenalty]}
                  onValueChange={([v]) => setAdvancedParams(p => ({ ...p, repeatPenalty: v }))}
                  min={1}
                  max={2}
                  step={0.05}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TEMPLATES TAB */}
        <TabsContent value="templates" className="space-y-6">
          <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-amber-400" />
                {t('ollama.promptTemplates')}
              </CardTitle>
              <CardDescription>{t('ollama.templatesDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                <SelectTrigger className="w-[300px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {GAME_GENRE_TEMPLATES.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {(() => {
                const template = GAME_GENRE_TEMPLATES.find(t => t.id === selectedGenre);
                if (!template) return null;
                
                return (
                  <div className="space-y-4">
                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700/50">
                      <h4 className="font-semibold mb-2">{template.name}</h4>
                      <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                      
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-muted-foreground">{t('ollama.systemPrompt')}</div>
                        <pre className="p-3 rounded bg-slate-950 text-xs text-slate-300 whitespace-pre-wrap">
                          {template.systemPrompt}
                        </pre>
                      </div>
                    </div>

                    {template.examples && (
                      <div className="space-y-2">
                        <div className="text-sm font-medium">{t('ollama.examples')}</div>
                        {template.examples.map((ex, i) => (
                          <div key={i} className="grid grid-cols-2 gap-2 p-3 rounded bg-slate-800/30 text-sm">
                            <div className="text-slate-400">{ex.source}</div>
                            <div className="text-emerald-400">→ {ex.target}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ENSEMBLE TAB */}
        <TabsContent value="ensemble" className="space-y-6">
          <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-rose-400" />
                {t('ollama.ensembleTitle')}
              </CardTitle>
              <CardDescription>{t('ollama.ensembleDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert className="border-indigo-500/30 bg-indigo-500/10">
                <Layers className="h-4 w-4 text-indigo-400" />
                <AlertTitle>{t('ollama.howEnsembleWorks')}</AlertTitle>
                <AlertDescription>{t('ollama.ensembleExplanation')}</AlertDescription>
              </Alert>

              {/* Model Selection */}
              <div className="space-y-4">
                <label className="text-sm font-medium">{t('ollama.selectModels')}</label>
                <div className="grid gap-2">
                  {installedModels.slice(0, 5).map((model) => (
                    <div key={model.name} className="flex items-center gap-2">
                      <Switch
                        checked={ensembleModels.includes(model.name)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            if (ensembleModels.length < 3) {
                              setEnsembleModels([...ensembleModels, model.name]);
                            } else {
                              toast.error(t('ollama.max3Models'));
                            }
                          } else {
                            setEnsembleModels(ensembleModels.filter(m => m !== model.name));
                          }
                        }}
                      />
                      <span className="text-sm">{model.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {(model.size / 1e9).toFixed(1)}GB
                      </Badge>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('ollama.selectedCount', { count: ensembleModels.length, max: 3 })}
                </p>
              </div>

              {/* Voting Strategy */}
              <div className="space-y-3">
                <label className="text-sm font-medium">{t('ollama.votingStrategy')}</label>
                <Select value={votingStrategy} onValueChange={(v) => setVotingStrategy(v as EnsembleConfig['votingStrategy'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="best_quality">{t('ollama.bestQuality')}</SelectItem>
                    <SelectItem value="majority_vote">{t('ollama.majorityVote')}</SelectItem>
                    <SelectItem value="speed_priority">{t('ollama.speedPriority')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* STREAMING TAB */}
        <TabsContent value="streaming" className="space-y-6">
          <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-400" />
                {t('ollama.streamingTitle')}
              </CardTitle>
              <CardDescription>{t('ollama.streamingDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Demo Controls */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Select value={demoSource} onValueChange={setDemoSource}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.from')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="ja">日本語</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={demoTarget} onValueChange={setDemoTarget}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('common.to')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="it">Italiano</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={demoModel} onValueChange={setDemoModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {installedModels.map((m) => (
                      <SelectItem key={m.name} value={m.name}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button onClick={runStreamingDemo} disabled={streamingHook.streamState.isStreaming}>
                  {streamingHook.streamState.isStreaming ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4" />
                  )}
                  {t('common.demo')}
                </Button>
              </div>

              {/* Input */}
              <textarea
                value={demoText}
                onChange={(e) => setDemoText(e.target.value)}
                className="w-full h-20 p-3 rounded-md bg-slate-800 border border-slate-700 text-sm"
                placeholder={t('ollama.enterTextToTranslate')}
              />

              {/* Output */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>{t('ollama.translation')}</span>
                  {streamingHook.streamState.tokensPerSecond && (
                    <span className="text-emerald-400">
                      {streamingHook.streamState.tokensPerSecond.toFixed(1)} tok/s
                    </span>
                  )}
                </div>
                <div className="min-h-[100px] p-4 rounded-lg bg-slate-950 border border-slate-800">
                  {streamingHook.streamState.text ? (
                    <motion.p 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-slate-200"
                    >
                      {streamingHook.streamState.text}
                      {streamingHook.streamState.isStreaming && (
                        <span className="inline-block w-2 h-4 ml-1 bg-emerald-400 animate-pulse" />
                      )}
                    </motion.p>
                  ) : (
                    <span className="text-slate-600 italic">{t('ollama.translationWillAppear')}</span>
                  )}
                </div>
              </div>

              {streamingHook.streamState.isComplete && (
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{t('ollama.totalTokens')}: {streamingHook.streamState.totalTokens}</span>
                  {streamingHook.streamState.totalDurationMs && (
                    <span>{t('ollama.duration')}: {(streamingHook.streamState.totalDurationMs / 1000).toFixed(2)}s</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CACHE TAB */}
        <TabsContent value="cache" className="space-y-6">
          <Card className="border-slate-800/50 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-emerald-400" />
                {t('ollama.translationCache')}
              </CardTitle>
              <CardDescription>{t('ollama.cacheDesc')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                <Card className="bg-slate-800/50">
                  <CardContent className="p-4 text-center">
                    <Hash className="h-5 w-5 mx-auto mb-2 text-indigo-400" />
                    <div className="text-2xl font-bold">{cacheStats.totalEntries}</div>
                    <div className="text-xs text-muted-foreground">{t('ollama.cachedTranslations')}</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50">
                  <CardContent className="p-4 text-center">
                    <HardDrive className="h-5 w-5 mx-auto mb-2 text-cyan-400" />
                    <div className="text-2xl font-bold">{cacheStats.totalSizeKB.toFixed(1)}</div>
                    <div className="text-xs text-muted-foreground">{t('ollama.cacheSizeKB')}</div>
                  </CardContent>
                </Card>
                <Card className="bg-slate-800/50">
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-5 w-5 mx-auto mb-2 text-emerald-400" />
                    <div className="text-2xl font-bold">{(cacheStats.hitRate * 100).toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">{t('ollama.cacheHitRate')}</div>
                  </CardContent>
                </Card>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={async () => {
                    const cache = TranslationCache.getInstance();
                    await cache.clear();
                    setCacheStats({ totalEntries: 0, totalSizeKB: 0, hitRate: 0 });
                    toast.success(t('ollama.cacheCleared'));
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('ollama.clearCache')}
                </Button>
                <Button 
                  variant="outline"
                  onClick={async () => {
                    const cache = TranslationCache.getInstance();
                    const stats = await cache.getStats();
                    setCacheStats(stats);
                  }}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('common.refresh')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
