'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Download, Trash2, Database, Cpu, CheckCircle, XCircle, Clock, Loader2, BarChart3, FileJson } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  generateDatasetFromCorrections,
  getDatasets,
  getDatasetExamples,
  deleteDataset,
  getModels,
  deleteModel,
  checkOllamaAvailability,
  downloadDataset,
  type FineTuningDataset,
  type FineTuningModel,
  type FineTuningConfig,
  DEFAULT_CONFIG,
} from '@/lib/fine-tuning';

export function FineTuningManager({ gameId }: { gameId?: string }) {
  const [datasets, setDatasets] = useState<FineTuningDataset[]>([]);
  const [models, setModels] = useState<FineTuningModel[]>([]);
  const [ollamaStatus, setOllamaStatus] = useState<{ available: boolean; models: string[] }>({ available: false, models: [] });
  const [isGenerating, setIsGenerating] = useState(false);
  const [sourceLang, setSourceLang] = useState('en');
  const [targetLang, setTargetLang] = useState('it');
  const [approvedOnly, setApprovedOnly] = useState(true);
  const [exportFormat, setExportFormat] = useState<'openai' | 'ollama' | 'alpaca' | 'chatml'>('openai');

  const reload = useCallback(() => {
    setDatasets(getDatasets(gameId));
    setModels(getModels(gameId));
  }, [gameId]);

  useEffect(() => {
    reload();
    checkOllamaAvailability().then(setOllamaStatus);
  }, [reload]);

  const handleGenerate = async () => {
    if (!gameId) return;
    setIsGenerating(true);
    try {
      generateDatasetFromCorrections(gameId, sourceLang, targetLang, { approvedOnly });
      reload();
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (dataset: FineTuningDataset) => {
    const examples = getDatasetExamples(dataset.id);
    if (examples.length === 0) return;
    downloadDataset(examples, dataset.name, exportFormat);
  };

  const handleDelete = (datasetId: string) => {
    deleteDataset(datasetId);
    reload();
  };

  const handleDeleteModel = (modelId: string) => {
    deleteModel(modelId);
    reload();
  };

  const totalExamples = datasets.reduce((sum, d) => sum + d.exampleCount, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="flex items-center gap-2 text-base">
          <Brain className="h-5 w-5" />
          Fine-Tuning Infrastructure
        </CardTitle>
        <CardDescription>
          Genera dataset di training dalle tue correzioni umane e gestisci modelli per-game personalizzati.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Ollama Status */}
        <div className="flex items-center gap-3 p-3 rounded-lg border">
          <Cpu className="h-5 w-5" />
          <div className="flex-1">
            <div className="text-sm font-medium">Ollama</div>
            <div className="text-xs text-muted-foreground">
              {ollamaStatus.available 
                ? `${ollamaStatus.models.length} modelli disponibili`
                : 'Non disponibile — avvia Ollama per il fine-tuning locale'
              }
            </div>
          </div>
          <Badge variant={ollamaStatus.available ? 'default' : 'destructive'} className="text-xs">
            {ollamaStatus.available ? 'Online' : 'Offline'}
          </Badge>
        </div>

        <Separator />

        {/* Generate Dataset */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Database className="h-4 w-4" />
            Genera Dataset
          </h3>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs">Da lingua</Label>
              <Input value={sourceLang} onChange={(e) => setSourceLang(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">A lingua</Label>
              <Input value={targetLang} onChange={(e) => setTargetLang(e.target.value)} className="h-8 text-sm" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Formato Export</Label>
              <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as typeof exportFormat)}>
                <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="openai">OpenAI JSONL</SelectItem>
                  <SelectItem value="ollama">Ollama JSONL</SelectItem>
                  <SelectItem value="alpaca">Alpaca JSON</SelectItem>
                  <SelectItem value="chatml">ChatML TXT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch checked={approvedOnly} onCheckedChange={setApprovedOnly} />
              <Label className="text-xs">Solo correzioni approvate</Label>
            </div>
            <Button size="sm" onClick={handleGenerate} disabled={!gameId || isGenerating}>
              {isGenerating ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <Database className="h-3.5 w-3.5 mr-1.5" />}
              Genera
            </Button>
          </div>
        </div>

        <Separator />

        {/* Datasets List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <FileJson className="h-4 w-4" />
            Dataset ({datasets.length}) — {totalExamples} esempi totali
          </h3>

          {datasets.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              <Database className="h-6 w-6 mx-auto mb-1 opacity-30" />
              Nessun dataset. Correggi alcune traduzioni e genera il tuo primo dataset.
            </div>
          )}

          {datasets.map(ds => (
            <div key={ds.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <div className="text-sm font-medium">{ds.name}</div>
                <div className="text-xs text-muted-foreground">
                  {ds.exampleCount} esempi • {ds.sourceLanguage}→{ds.targetLanguage}
                  {ds.approvedOnly && ' • Solo approvati'}
                </div>
                <div className="text-[10px] text-muted-foreground mt-0.5">
                  {new Date(ds.createdAt).toLocaleString('it', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              <div className="flex gap-1.5">
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => handleDownload(ds)}>
                  <Download className="h-3 w-3 mr-1" />
                  Export
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleDelete(ds.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Separator />

        {/* Models List */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold flex items-center gap-1.5">
            <Cpu className="h-4 w-4" />
            Modelli Fine-Tuned ({models.length})
          </h3>

          {models.length === 0 && (
            <div className="text-center py-4 text-sm text-muted-foreground">
              <Brain className="h-6 w-6 mx-auto mb-1 opacity-30" />
              Nessun modello fine-tuned. Genera un dataset e avvia il training.
            </div>
          )}

          {models.map(model => (
            <div key={model.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-2">
                {model.status === 'completed' && <CheckCircle className="h-4 w-4 text-emerald-400" />}
                {model.status === 'training' && <Loader2 className="h-4 w-4 animate-spin text-blue-400" />}
                {model.status === 'pending' && <Clock className="h-4 w-4 text-amber-400" />}
                {model.status === 'failed' && <XCircle className="h-4 w-4 text-destructive" />}
                <div>
                  <div className="text-sm font-medium">{model.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Base: {model.baseModel} • v{model.version}
                    {model.metrics.loss && ` • Loss: ${model.metrics.loss.toFixed(4)}`}
                  </div>
                </div>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={() => handleDeleteModel(model.id)}>
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
