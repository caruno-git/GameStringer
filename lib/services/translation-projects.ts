'use client';

import { get, set } from 'idb-keyval';
import { getSupabase, isSupabaseConfigured } from '@/lib/social/community-hub-backend';
import { clientLogger } from '@/lib/client-logger';

export interface TranslationProject {
  id: string;
  gameId: string;
  gameName: string;
  gameImage?: string;
  engine?: string;
  sourceLanguage: string;
  targetLanguage: string;
  status: 'active' | 'paused' | 'completed' | 'abandoned';
  progress: number; // 0-100
  totalStrings: number;
  translatedStrings: number;
  files: ProjectFile[];
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  // Community sync
  isShared: boolean;
  sharedBy?: string; // user id
  sharedByName?: string;
  collaborators?: string[]; // user ids
  supabaseId?: string; // ID in Supabase for sync
}

export interface ProjectFile {
  path: string;
  name: string;
  type: string;
  totalStrings: number;
  translatedStrings: number;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface CommunityProject {
  id: string;
  gameId: string;
  gameName: string;
  gameImage?: string;
  sourceLanguage: string;
  targetLanguage: string;
  progress: number;
  sharedBy: string;
  sharedByName: string;
  sharedByAvatar?: string;
  collaboratorsCount: number;
  updatedAt: string;
}

const PROJECTS_KEY = 'gs_translation_projects';
const ACTIVE_PROJECT_KEY = 'gs_active_project';

class TranslationProjectService {
  private async getSupabaseClient() {
    return await getSupabase();
  }

  /**
   * Crea automaticamente un progetto quando inizia una traduzione
   */
  async createOrGetProject(params: {
    gameId: string;
    gameName: string;
    gameImage?: string;
    engine?: string;
    sourceLanguage: string;
    targetLanguage: string;
    files?: { path: string; name: string; type: string; strings: number }[];
  }): Promise<TranslationProject> {
    // Cerca progetto esistente per questo gioco + lingua
    const existing = await this.findProject(params.gameId, params.targetLanguage);
    
    if (existing) {
      clientLogger.debug(`[Projects] Progetto esistente trovato: ${existing.id}`);
      // Aggiorna lastActivityAt
      existing.lastActivityAt = new Date().toISOString();
      existing.updatedAt = new Date().toISOString();
      if (existing.status === 'paused' || existing.status === 'abandoned') {
        existing.status = 'active';
      }
      await this.saveProject(existing);
      await this.setActiveProject(existing.id);
      return existing;
    }

    // Crea nuovo progetto
    const project: TranslationProject = {
      id: `proj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      gameId: params.gameId,
      gameName: params.gameName,
      gameImage: params.gameImage,
      engine: params.engine,
      sourceLanguage: params.sourceLanguage,
      targetLanguage: params.targetLanguage,
      status: 'active',
      progress: 0,
      totalStrings: params.files?.reduce((sum, f) => sum + f.strings, 0) || 0,
      translatedStrings: 0,
      files: params.files?.map(f => ({
        path: f.path,
        name: f.name,
        type: f.type,
        totalStrings: f.strings,
        translatedStrings: 0,
        status: 'pending' as const
      })) || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      isShared: false
    };

    await this.saveProject(project);
    await this.setActiveProject(project.id);
    
    clientLogger.debug(`[Projects] Nuovo progetto creato: ${project.id} per ${params.gameName}`);
    
    // Notifica UI
    window.dispatchEvent(new CustomEvent('gs-project-created', { detail: project }));
    
    return project;
  }

  /**
   * Trova un progetto esistente
   */
  async findProject(gameId: string, targetLanguage: string): Promise<TranslationProject | null> {
    const projects = await this.getAllProjects();
    return projects.find(p => 
      p.gameId === gameId && 
      p.targetLanguage === targetLanguage &&
      p.status !== 'abandoned'
    ) || null;
  }

  /**
   * Ottieni tutti i progetti
   */
  async getAllProjects(): Promise<TranslationProject[]> {
    try {
      const projects = await get<TranslationProject[]>(PROJECTS_KEY);
      return projects || [];
    } catch {
      return [];
    }
  }

  /**
   * Salva un progetto
   */
  async saveProject(project: TranslationProject): Promise<void> {
    const projects = await this.getAllProjects();
    const index = projects.findIndex(p => p.id === project.id);
    
    if (index >= 0) {
      projects[index] = project;
    } else {
      projects.unshift(project); // Aggiungi in cima
    }
    
    await set(PROJECTS_KEY, projects);
  }

  /**
   * Aggiorna progresso di un progetto
   */
  async updateProgress(projectId: string, translatedStrings: number, fileProgress?: { path: string; translated: number }): Promise<void> {
    const projects = await this.getAllProjects();
    const project = projects.find(p => p.id === projectId);
    
    if (!project) return;

    project.translatedStrings = translatedStrings;
    project.progress = project.totalStrings > 0 
      ? Math.round((translatedStrings / project.totalStrings) * 100) 
      : 0;
    project.updatedAt = new Date().toISOString();
    project.lastActivityAt = new Date().toISOString();

    if (fileProgress) {
      const file = project.files.find(f => f.path === fileProgress.path);
      if (file) {
        file.translatedStrings = fileProgress.translated;
        file.status = file.translatedStrings >= file.totalStrings ? 'completed' : 'in_progress';
      }
    }

    if (project.progress >= 100) {
      project.status = 'completed';
    }

    await this.saveProject(project);
    
    // Notifica UI
    window.dispatchEvent(new CustomEvent('gs-project-updated', { detail: project }));
  }

  /**
   * Imposta progetto attivo
   */
  async setActiveProject(projectId: string): Promise<void> {
    await set(ACTIVE_PROJECT_KEY, projectId);
  }

  /**
   * Ottieni progetto attivo
   */
  async getActiveProject(): Promise<TranslationProject | null> {
    const activeId = await get<string>(ACTIVE_PROJECT_KEY);
    if (!activeId) return null;
    
    const projects = await this.getAllProjects();
    return projects.find(p => p.id === activeId) || null;
  }

  /**
   * Condividi progetto con la community
   */
  async shareProject(projectId: string): Promise<boolean> {
    try {
      const project = (await this.getAllProjects()).find(p => p.id === projectId);
      if (!project) return false;

      const supabase = await this.getSupabaseClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        clientLogger.warn('[Projects] Utente non autenticato, impossibile condividere');
        return false;
      }

      // Inserisci in Supabase
      const { data, error } = await supabase
        .from('translation_projects')
        .upsert({
          game_id: project.gameId,
          game_name: project.gameName,
          game_image: project.gameImage,
          source_language: project.sourceLanguage,
          target_language: project.targetLanguage,
          progress: project.progress,
          total_strings: project.totalStrings,
          translated_strings: project.translatedStrings,
          status: project.status,
          shared_by: user.id,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'game_id,target_language,shared_by'
        })
        .select()
        .single();

      if (error) {
        clientLogger.error('[Projects] Errore condivisione:', error);
        return false;
      }

      // Aggiorna locale
      project.isShared = true;
      project.sharedBy = user.id;
      project.supabaseId = data.id;
      await this.saveProject(project);

      clientLogger.debug(`[Projects] Progetto condiviso: ${project.gameName}`);
      return true;
    } catch (e) {
      clientLogger.error('[Projects] Errore condivisione:', e);
      return false;
    }
  }

  /**
   * Cerca progetti della community per un gioco
   */
  async findCommunityProjects(gameId: string, targetLanguage?: string): Promise<CommunityProject[]> {
    try {
      const supabase = await this.getSupabaseClient();
      let query = supabase
        .from('translation_projects')
        .select(`
          id,
          game_id,
          game_name,
          game_image,
          source_language,
          target_language,
          progress,
          shared_by,
          updated_at,
          profiles!shared_by (
            display_name,
            avatar_url
          )
        `)
        .eq('game_id', gameId)
        .order('progress', { ascending: false });

      if (targetLanguage) {
        query = query.eq('target_language', targetLanguage);
      }

      const { data, error } = await query;

      if (error) {
        clientLogger.error('[Projects] Errore ricerca community:', error);
        return [];
      }

      return (data || []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        gameId: p.game_id as string,
        gameName: p.game_name as string,
        gameImage: p.game_image as string | undefined,
        sourceLanguage: p.source_language as string,
        targetLanguage: p.target_language as string,
        progress: p.progress as number,
        sharedBy: p.shared_by as string,
        sharedByName: (p.profiles as Record<string, unknown>)?.display_name as string || 'Anonimo',
        sharedByAvatar: (p.profiles as Record<string, unknown>)?.avatar_url as string | undefined,
        collaboratorsCount: 0,
        updatedAt: p.updated_at as string
      }));
    } catch (e) {
      clientLogger.error('[Projects] Errore ricerca community:', e);
      return [];
    }
  }

  /**
   * Verifica se qualcuno sta già traducendo questo gioco
   */
  async checkExistingTranslation(gameId: string, targetLanguage: string): Promise<CommunityProject | null> {
    const projects = await this.findCommunityProjects(gameId, targetLanguage);
    // Ritorna il progetto più avanzato
    return projects.length > 0 ? projects[0] : null;
  }

  /**
   * Elimina un progetto
   */
  async deleteProject(projectId: string): Promise<void> {
    const projects = await this.getAllProjects();
    const filtered = projects.filter(p => p.id !== projectId);
    await set(PROJECTS_KEY, filtered);
    
    // Rimuovi da Supabase se condiviso
    const project = projects.find(p => p.id === projectId);
    if (project?.supabaseId) {
      const supabase = await this.getSupabaseClient();
      await supabase
        .from('translation_projects')
        .delete()
        .eq('id', project.supabaseId);
    }
  }

  /**
   * Abbandona un progetto (non lo elimina, lo marca come abbandonato)
   */
  async abandonProject(projectId: string): Promise<void> {
    const projects = await this.getAllProjects();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.status = 'abandoned';
      project.updatedAt = new Date().toISOString();
      await this.saveProject(project);
    }
  }

  /**
   * Metti in pausa un progetto
   */
  async pauseProject(projectId: string): Promise<void> {
    const projects = await this.getAllProjects();
    const project = projects.find(p => p.id === projectId);
    if (project) {
      project.status = 'paused';
      project.updatedAt = new Date().toISOString();
      await this.saveProject(project);
    }
  }
}

export const projectService = new TranslationProjectService();
