'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Mic, Plus, Trash2, Star, User, Sparkles, ChevronDown, ChevronUp, Edit3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  VoiceProfile,
  VoiceTone,
  VoiceFormality,
  VoiceAgeGroup,
  loadVoiceProfiles,
  saveVoiceProfiles,
  upsertVoiceProfile,
  deleteVoiceProfile,
  setDefaultVoiceProfile,
  extractVoiceProfilesFromStrings,
} from '@/lib/voice/voice-profiles';

const TONE_OPTIONS: { value: VoiceTone; label: string }[] = [
  { value: 'formal', label: 'Formale' },
  { value: 'casual', label: 'Casuale' },
  { value: 'aggressive', label: 'Aggressivo' },
  { value: 'gentle', label: 'Dolce' },
  { value: 'mysterious', label: 'Misterioso' },
  { value: 'comedic', label: 'Comico' },
  { value: 'dramatic', label: 'Drammatico' },
  { value: 'stoic', label: 'Stoico' },
  { value: 'sarcastic', label: 'Sarcastico' },
  { value: 'wise', label: 'Saggio' },
  { value: 'childish', label: 'Infantile' },
  { value: 'noble', label: 'Nobile' },
  { value: 'pirate', label: 'Pirata' },
  { value: 'military', label: 'Militare' },
  { value: 'academic', label: 'Accademico' },
  { value: 'street', label: 'Stradino' },
];

const FORMALITY_OPTIONS: { value: VoiceFormality; label: string }[] = [
  { value: 'very_formal', label: 'Molto formale' },
  { value: 'formal', label: 'Formale' },
  { value: 'neutral', label: 'Neutro' },
  { value: 'informal', label: 'Informale' },
  { value: 'very_informal', label: 'Molto informale' },
];

const AGE_OPTIONS: { value: VoiceAgeGroup; label: string }[] = [
  { value: 'child', label: 'Bambino' },
  { value: 'teen', label: 'Adolescente' },
  { value: 'young_adult', label: 'Giovane adulto' },
  { value: 'adult', label: 'Adulto' },
  { value: 'elder', label: 'Anziano' },
];

interface VoiceProfileManagerProps {
  gameId?: string;
  gameStrings?: string[];
}

export function VoiceProfileManager({ gameId, gameStrings }: VoiceProfileManagerProps) {
  const [profiles, setProfiles] = useState<VoiceProfile[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [editingProfile, setEditingProfile] = useState<Partial<VoiceProfile> | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);

  const reload = useCallback(() => {
    if (gameId) {
      const collection = loadVoiceProfiles(gameId);
      setProfiles(collection.profiles);
    }
  }, [gameId]);

  useEffect(() => { reload(); }, [reload]);

  const handleAutoExtract = async () => {
    if (!gameId || !gameStrings || gameStrings.length === 0) return;
    setIsExtracting(true);
    try {
      extractVoiceProfilesFromStrings(gameId, gameStrings);
      reload();
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCreateProfile = () => {
    setEditingProfile({
      gameId: gameId || '',
      characterName: '',
      tone: 'casual',
      formality: 'neutral',
      ageGroup: 'adult',
      personality: '',
      speechPatterns: [],
      catchphrases: [],
      avoidPatterns: [],
      sampleDialogues: [],
      autoExtracted: false,
      confidence: 1,
    });
  };

  const handleSaveProfile = () => {
    if (!editingProfile || !editingProfile.characterName || !gameId) return;
    upsertVoiceProfile(gameId, editingProfile as Omit<VoiceProfile, 'id' | 'createdAt' | 'updatedAt'>);
    setEditingProfile(null);
    reload();
  };

  const handleDelete = (profileId: string) => {
    if (!gameId) return;
    deleteVoiceProfile(gameId, profileId);
    reload();
  };

  const handleSetDefault = (profileId: string) => {
    if (!gameId) return;
    setDefaultVoiceProfile(gameId, profileId);
    reload();
  };

  const collection = gameId ? loadVoiceProfiles(gameId) : null;
  const defaultId = collection?.defaultProfileId;

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" className="flex items-center gap-2 text-base">
          <Mic className="h-5 w-5" />
          Profili Voce Personaggi
        </CardTitle>
        <CardDescription>
          Preserva la personalità e lo stile dei personaggi durante la traduzione.
          I profili voce vengono iniettati automaticamente nel prompt di traduzione.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleCreateProfile}>
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Nuovo Profilo
          </Button>
          {gameId && gameStrings && gameStrings.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleAutoExtract} disabled={isExtracting}>
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              {isExtracting ? 'Estrazione...' : 'Estrai Automaticamente'}
            </Button>
          )}
          {profiles.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {profiles.length} profili
            </Badge>
          )}
        </div>

        {/* Profile list */}
        {profiles.length === 0 && !editingProfile && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <Mic className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p>Nessun profilo voce configurato.</p>
            <p className="text-xs mt-1">Crea un profilo manualmente o estrai automaticamente dalle stringhe del gioco.</p>
          </div>
        )}

        {/* Editing form */}
        {editingProfile && (
          <div className="border rounded-lg p-4 space-y-3 bg-muted/30">
            <h4 className="text-sm font-semibold flex items-center gap-1.5">
              <Edit3 className="h-3.5 w-3.5" />
              {editingProfile.characterName ? 'Modifica Profilo' : 'Nuovo Profilo'}
            </h4>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Nome Personaggio</Label>
                <Input
                  value={editingProfile.characterName || ''}
                  onChange={(e) => setEditingProfile({ ...editingProfile, characterName: e.target.value })}
                  placeholder="es. Gandalf"
                  className="h-8 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Tono</Label>
                <Select
                  value={editingProfile.tone || 'casual'}
                  onValueChange={(v) => setEditingProfile({ ...editingProfile, tone: v as VoiceTone })}
                >
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TONE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Formalità</Label>
                <Select
                  value={editingProfile.formality || 'neutral'}
                  onValueChange={(v) => setEditingProfile({ ...editingProfile, formality: v as VoiceFormality })}
                >
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {FORMALITY_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Età</Label>
                <Select
                  value={editingProfile.ageGroup || 'adult'}
                  onValueChange={(v) => setEditingProfile({ ...editingProfile, ageGroup: v as VoiceAgeGroup })}
                >
                  <SelectTrigger className="h-8 text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {AGE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Personalità</Label>
              <Input
                value={editingProfile.personality || ''}
                onChange={(e) => setEditingProfile({ ...editingProfile, personality: e.target.value })}
                placeholder="es. Un saggio mago che parla per enigmi"
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Pattern Vocali (separati da ;)</Label>
              <Input
                value={editingProfile.speechPatterns?.join('; ') || ''}
                onChange={(e) => setEditingProfile({ ...editingProfile, speechPatterns: e.target.value.split(';').map(s => s.trim()).filter(Boolean) })}
                placeholder="es. Usa parole arcaiche; Parola lentamente; Referenze alla natura"
                className="h-8 text-sm"
              />
            </div>

            <div className="space-y-1">
              <Label className="text-xs">Catchphrases (separati da ;)</Label>
              <Input
                value={editingProfile.catchphrases?.join('; ') || ''}
                onChange={(e) => setEditingProfile({ ...editingProfile, catchphrases: e.target.value.split(';').map(s => s.trim()).filter(Boolean) })}
                placeholder="es. Per gli dei!; Hmm, interessante..."
                className="h-8 text-sm"
              />
            </div>

            <div className="flex gap-2 pt-1">
              <Button size="sm" onClick={handleSaveProfile} disabled={!editingProfile.characterName}>
                Salva
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditingProfile(null)}>
                Annulla
              </Button>
            </div>
          </div>
        )}

        {/* Profile cards */}
        {profiles.map((profile) => (
          <div key={profile.id} className="border rounded-lg">
            <div
              className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30"
              onClick={() => setExpandedId(expandedId === profile.id ? null : profile.id)}
            >
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">{profile.characterName}</span>
                {profile.autoExtracted && (
                  <Badge variant="outline" className="text-[10px] px-1 py-0">Auto</Badge>
                )}
                {defaultId === profile.id && (
                  <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
                )}
                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                  {TONE_OPTIONS.find(t => t.value === profile.tone)?.label || profile.tone}
                </Badge>
              </div>
              <div className="flex items-center gap-1">
                {expandedId === profile.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
            
            {expandedId === profile.id && (
              <div className="px-3 pb-3 space-y-2 border-t">
                <div className="pt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <span className="text-muted-foreground">Formalità:</span>{' '}
                    {FORMALITY_OPTIONS.find(f => f.value === profile.formality)?.label}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Età:</span>{' '}
                    {AGE_OPTIONS.find(a => a.value === profile.ageGroup)?.label}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Confidenza:</span>{' '}
                    {Math.round(profile.confidence * 100)}%
                  </div>
                </div>
                
                {profile.personality && (
                  <p className="text-xs text-muted-foreground italic">"{profile.personality}"</p>
                )}
                
                {profile.speechPatterns.length > 0 && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Pattern:</span>{' '}
                    {profile.speechPatterns.join(', ')}
                  </div>
                )}
                
                {profile.catchphrases.length > 0 && (
                  <div className="text-xs">
                    <span className="text-muted-foreground">Catchphrases:</span>{' '}
                    {profile.catchphrases.map(c => `"${c}"`).join(', ')}
                  </div>
                )}

                {profile.sampleDialogues.length > 0 && (
                  <div className="text-xs space-y-0.5">
                    <span className="text-muted-foreground">Dialoghi di esempio:</span>
                    {profile.sampleDialogues.slice(0, 3).map((d, i) => (
                      <div key={i} className="pl-3 text-muted-foreground">• "{d}"</div>
                    ))}
                  </div>
                )}

                <div className="flex gap-1.5 pt-1">
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => handleSetDefault(profile.id)}>
                    <Star className="h-3 w-3 mr-1" />
                    {defaultId === profile.id ? 'Default ✓' : 'Imposta Default'}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => {
                    setEditingProfile({ ...profile });
                  }}>
                    <Edit3 className="h-3 w-3 mr-1" />
                    Modifica
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 text-xs text-destructive" onClick={() => handleDelete(profile.id)}>
                    <Trash2 className="h-3 w-3 mr-1" />
                    Elimina
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
