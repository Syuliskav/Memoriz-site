import React, { useState, useEffect } from 'react';
import { 
  User, 
  X, 
  ShieldCheck, 
  Check, 
  Download, 
  Upload, 
  Target, 
  HardDrive, 
  Award, 
  Flame, 
  Plus, 
  RefreshCw, 
  Trash2,
  Lock,
  Sparkles,
  Info,
  AlertCircle,
  Cloud,
  Loader2
} from 'lucide-react';
import { UserAccount, UserStatistics, SRSItem, UserBookmark } from '../types/question';
import { LocalStorageManager } from '../lib/storage';
import { checkStorageMetrics, requestPersistentStorage, StorageMetricsInfo } from '../lib/storageMetrics';
import { ConfirmModal } from './ConfirmModal';
import { 
  auth,
  signInWithGoogleReal,
  signOutReal,
  syncUserDataToFirestore,
  loadUserDataFromFirestore,
  getFriendlyAuthErrorMessage
} from '../lib/firebase';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  account: UserAccount;
  onUpdateAccount: (updated: UserAccount) => void;
  stats: UserStatistics;
  onNavigateToMetrics?: () => void;
}

const AVATAR_OPTIONS = ['🎯', '⚖️', '👮', '💼', '🩺', '📚', '🚀', '🦁', '🦉', '⚡'];

export const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  account,
  onUpdateAccount,
  stats,
  onNavigateToMetrics,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'storage' | 'profiles'>('profile');
  const [name, setName] = useState(account.name);
  const [email, setEmail] = useState(account.email || '');
  const [avatar, setAvatar] = useState(account.avatar);
  const [targetExam, setTargetExam] = useState(account.targetExam);
  const [targetRole, setTargetRole] = useState(account.targetRole || '');
  const [dailyGoalQuestions, setDailyGoalQuestions] = useState(account.dailyGoalQuestions);
  const [experienceLevel, setExperienceLevel] = useState(account.experienceLevel);
  const [isSavedNotice, setIsSavedNotice] = useState(false);
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string }>({});
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSyncingCloud, setIsSyncingCloud] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [syncSuccessNotice, setSyncSuccessNotice] = useState<string | null>(null);

  // Storage telemetry
  const [storageInfo, setStorageInfo] = useState<StorageMetricsInfo | null>(null);
  const [isPersisting, setIsPersisting] = useState(false);
  const [persistSuccessMsg, setPersistSuccessMsg] = useState<string | null>(null);

  // Multi-profile state
  const [profiles, setProfiles] = useState<UserAccount[]>([]);
  const [newProfileName, setNewProfileName] = useState('');
  const [isCreatingProfile, setIsCreatingProfile] = useState(false);
  const [profileToDelete, setProfileToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setName(account.name);
      setEmail(account.email || '');
      setAvatar(account.avatar);
      setTargetExam(account.targetExam);
      setTargetRole(account.targetRole || '');
      setDailyGoalQuestions(account.dailyGoalQuestions);
      setExperienceLevel(account.experienceLevel);
      setProfiles(LocalStorageManager.getUserProfiles());
      setFormErrors({});
      setAuthError(null);
      setSyncSuccessNotice(null);

      checkStorageMetrics().then((info) => {
        setStorageInfo(info);
      });
    }
  }, [isOpen, account]);

  if (!isOpen) return null;

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const newErrors: { name?: string; email?: string } = {};
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      newErrors.name = 'Por favor, informe seu nome ou identificação.';
    }

    if (trimmedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      newErrors.email = 'Por favor, insira um endereço de e-mail válido (ex: seu.email@exemplo.com).';
    }

    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    setFormErrors({});

    const updated: UserAccount = {
      ...account,
      name: trimmedName || 'Estudante',
      email: trimmedEmail,
      avatar,
      targetExam: targetExam.trim() || 'Objetivo de Estudo',
      targetRole: targetRole.trim(),
      dailyGoalQuestions,
      experienceLevel,
    };
    const saved = LocalStorageManager.saveUserAccount(updated);
    onUpdateAccount(saved);
    setProfiles(LocalStorageManager.getUserProfiles());
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);

    // If cloud sync is active, update Firestore
    if (saved.provider === 'google' && auth.currentUser) {
      syncUserDataToFirestore(auth.currentUser, saved, {
        stats: LocalStorageManager.getStatistics(),
        srsItems: LocalStorageManager.getSRSItems(),
        answers: LocalStorageManager.getAnswers(),
        bookmarks: LocalStorageManager.getBookmarks(),
      }).catch((err) => {
        console.warn('Silent Firestore sync error on save profile:', err);
      });
    }
  };

  const handleGoogleConnect = async () => {
    setIsGoogleLoading(true);
    setAuthError(null);
    setSyncSuccessNotice(null);

    try {
      const user = await signInWithGoogleReal();

      // Real identity returned by Google Authentication
      const googleName = user.displayName || account.name || 'Estudante';
      const googleEmail = user.email || '';
      const googleAvatar = user.photoURL || account.avatar || '🎯';

      // Verify if existing cloud data is stored in Firestore for this user
      let cloudData = null;
      try {
        cloudData = await loadUserDataFromFirestore(user.uid);
      } catch (loadErr) {
        console.warn('Could not read existing cloud data from Firestore:', loadErr);
      }

      // Merge and prepare real user account
      const updated: UserAccount = {
        ...account,
        id: user.uid,
        name: cloudData?.account?.name || googleName,
        email: googleEmail,
        avatar: cloudData?.account?.avatar || googleAvatar,
        targetExam: cloudData?.account?.targetExam || account.targetExam,
        targetRole: cloudData?.account?.targetRole || account.targetRole,
        dailyGoalQuestions: cloudData?.account?.dailyGoalQuestions || account.dailyGoalQuestions,
        experienceLevel: (cloudData?.account?.experienceLevel as any) || account.experienceLevel,
        provider: 'google',
        isCloudSyncEnabled: true,
        lastLoginAt: new Date().toISOString(),
      };

      // If cloud progress exists (e.g. from previous device), restore stats & study progress
      if (cloudData) {
        if (cloudData.stats) {
          LocalStorageManager.saveStatistics(cloudData.stats as UserStatistics);
        }
        if (cloudData.srsItems) {
          for (const item of Object.values(cloudData.srsItems)) {
            if (item && typeof item === 'object') {
              LocalStorageManager.saveSRSItem(item as SRSItem);
            }
          }
        }
        if (cloudData.bookmarks) {
          for (const bm of Object.values(cloudData.bookmarks)) {
            if (bm && typeof bm === 'object' && 'question_id' in bm) {
              const bookmark = bm as UserBookmark;
              LocalStorageManager.updateBookmarkNote(bookmark.question_id, bookmark.note || '');
            }
          }
        }
      }

      // Save locally
      const saved = LocalStorageManager.saveUserAccount(updated);
      onUpdateAccount(saved);
      setName(saved.name);
      setEmail(saved.email || '');
      setAvatar(saved.avatar);
      setProfiles(LocalStorageManager.getUserProfiles());

      // Perform immediate real synchronization to Firestore
      const syncResult = await syncUserDataToFirestore(user, saved, {
        stats: LocalStorageManager.getStatistics(),
        srsItems: LocalStorageManager.getSRSItems(),
        answers: LocalStorageManager.getAnswers(),
        bookmarks: LocalStorageManager.getBookmarks(),
      });

      const syncTime = new Date(syncResult.lastSyncedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setSyncSuccessNotice(`Conta Google conectada com sucesso! Dados sincronizados no Firestore às ${syncTime}.`);
      setTimeout(() => setSyncSuccessNotice(null), 4000);
    } catch (err: unknown) {
      console.error('Google Sign-In Error:', err);
      const friendlyMsg = getFriendlyAuthErrorMessage(err);
      setAuthError(friendlyMsg);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleDisconnect = async () => {
    setIsGoogleLoading(true);
    setAuthError(null);
    setSyncSuccessNotice(null);

    try {
      // Real signOut from Firebase Auth
      await signOutReal();

      const updated: UserAccount = {
        ...account,
        provider: 'local',
        isCloudSyncEnabled: false,
      };
      const saved = LocalStorageManager.saveUserAccount(updated);
      onUpdateAccount(saved);
      setProfiles(LocalStorageManager.getUserProfiles());
      setSyncSuccessNotice('Sessão do Google encerrada com sucesso. Seus dados continuam salvos localmente neste dispositivo.');
      setTimeout(() => setSyncSuccessNotice(null), 4000);
    } catch (err: unknown) {
      console.error('Sign-Out Error:', err);
      setAuthError('Falha ao desconectar da Conta Google. Tente novamente.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleManualSync = async () => {
    if (!auth.currentUser || account.provider !== 'google') return;
    setIsSyncingCloud(true);
    setAuthError(null);

    try {
      const syncResult = await syncUserDataToFirestore(auth.currentUser, account, {
        stats: LocalStorageManager.getStatistics(),
        srsItems: LocalStorageManager.getSRSItems(),
        answers: LocalStorageManager.getAnswers(),
        bookmarks: LocalStorageManager.getBookmarks(),
      });
      const syncTime = new Date(syncResult.lastSyncedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      setSyncSuccessNotice(`Sincronização em nuvem concluída com sucesso às ${syncTime}!`);
      setTimeout(() => setSyncSuccessNotice(null), 4000);
    } catch (err: unknown) {
      console.error('Manual Firestore Sync Error:', err);
      setAuthError('Falha na sincronização com o Firestore. Verifique sua conexão com a internet.');
    } finally {
      setIsSyncingCloud(false);
    }
  };

  const handleRequestPersistence = async () => {
    setIsPersisting(true);
    const granted = await requestPersistentStorage();
    setIsPersisting(false);
    if (granted) {
      setPersistSuccessMsg('Armazenamento blindado com sucesso! Seus dados não serão removidos pelo navegador.');
      const info = await checkStorageMetrics();
      setStorageInfo(info);
    } else {
      setPersistSuccessMsg('O navegador manteve o modo padrão de armazenamento sob demanda.');
    }
    setTimeout(() => setPersistSuccessMsg(null), 4000);
  };

  const handleCreateNewProfile = () => {
    if (!newProfileName.trim()) return;
    const newAccount: UserAccount = {
      id: `profile_${Date.now()}`,
      name: newProfileName.trim(),
      email: '',
      avatar: '🎯',
      targetExam: 'Novo Tema / Matéria',
      targetRole: '',
      dailyGoalQuestions: 30,
      experienceLevel: 'intermediario',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      isCloudSyncEnabled: false,
      provider: 'local',
    };
    LocalStorageManager.saveUserAccount(newAccount);
    onUpdateAccount(newAccount);
    setProfiles(LocalStorageManager.getUserProfiles());
    setNewProfileName('');
    setIsCreatingProfile(false);
  };

  const handleSwitchProfile = (profileId: string) => {
    const switched = LocalStorageManager.switchUserProfile(profileId);
    onUpdateAccount(switched);
    setName(switched.name);
    setEmail(switched.email || '');
    setAvatar(switched.avatar);
    setTargetExam(switched.targetExam);
    setTargetRole(switched.targetRole || '');
    setDailyGoalQuestions(switched.dailyGoalQuestions);
    setExperienceLevel(switched.experienceLevel);
  };

  const handleDeleteProfile = (profileId: string) => {
    if (profiles.length <= 1) return;
    setProfileToDelete(profileId);
  };

  const confirmDeleteProfile = () => {
    if (!profileToDelete) return;
    const remaining = LocalStorageManager.deleteUserProfile(profileToDelete);
    setProfiles(remaining);
    const current = LocalStorageManager.getUserAccount();
    onUpdateAccount(current);
    setProfileToDelete(null);
  };

  const handleExportAccountData = () => {
    const backupObj = {
      version: '2.0',
      account,
      statistics: stats,
      exportedAt: new Date().toISOString(),
      platform: 'Memoriz',
    };
    const blob = new Blob([JSON.stringify(backupObj, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `perfil_estudo_${account.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-canvas/80 backdrop-blur-xs">
      <div 
        className="w-full max-w-2xl max-h-[90vh] max-h-[90dvh] flex flex-col rounded-2xl border border-border shadow-2xl overflow-hidden bg-surface theme-surface"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl bg-accent-subtle border border-accent/30 shrink-0 overflow-hidden">
              {avatar?.startsWith('http') ? (
                <img 
                  src={avatar} 
                  alt={name} 
                  className="w-full h-full object-cover rounded-xl avatar-icon" 
                  referrerPolicy="no-referrer"
                />
              ) : (
                <span className="avatar-icon emoji-filter" data-emoji="true">{avatar}</span>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-primary theme-text-primary">
                  {name}
                </h2>
                {account.provider === 'google' ? (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success-bg text-success border border-success-border flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Conta Google</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-surface-subtle text-muted border border-border">
                    Perfil Local
                  </span>
                )}
              </div>
              <p className="text-xs text-muted theme-text-muted">
                {account.targetExam} • Meta: {account.dailyGoalQuestions}q/dia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-primary transition-colors cursor-pointer"
            title="Fechar (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-border px-5 text-xs font-semibold shrink-0 gap-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-primary'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Perfil & Metas</span>
          </button>
          <button
            onClick={() => setActiveTab('storage')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'storage'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-primary'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            <span>Armazenamento & Limites</span>
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`py-3 border-b-2 transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'profiles'
                ? 'border-accent text-accent'
                : 'border-transparent text-muted hover:text-primary'
            }`}
          >
            <Target className="w-3.5 h-3.5" />
            <span>Multi-Perfis ({profiles.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} noValidate className="space-y-4">
              {/* Account Quick Stats Bar (Clickable navigation to Metrics) */}
              <button
                type="button"
                id="btn-account-stats-to-metrics"
                onClick={() => {
                  if (onNavigateToMetrics) {
                    onClose();
                    onNavigateToMetrics();
                  }
                }}
                className="w-full grid grid-cols-4 gap-2 p-3 rounded-xl border border-border theme-card-subtle text-center hover:border-accent transition-all cursor-pointer group"
                title="Clique para abrir o painel de Métricas e Estatísticas"
              >
                <div>
                  <div className="text-[10px] text-muted uppercase font-semibold group-hover:text-primary transition-colors">Resolvidas</div>
                  <div className="text-base font-bold text-primary theme-text-primary">
                    {stats.total_answered}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted uppercase font-semibold group-hover:text-success transition-colors">Acertos</div>
                  <div className="text-base font-bold text-success">
                    {stats.total_correct}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted uppercase font-semibold group-hover:text-amber transition-colors">Ofensiva</div>
                  <div className="text-base font-bold text-amber flex items-center justify-center gap-0.5">
                    <Flame className="w-3.5 h-3.5 fill-amber text-amber" />
                    <span>{stats.streak_days}d</span>
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-muted uppercase font-semibold group-hover:text-accent transition-colors">XP Total</div>
                  <div className="text-base font-bold text-accent">
                    {stats.xp_points}
                  </div>
                </div>
              </button>

              {/* Google Account Connection Banner */}
              <div className="p-4 rounded-xl border border-border theme-card space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-lg bg-surface-subtle border border-border flex items-center justify-center text-sm font-bold text-secondary shrink-0">
                      {isGoogleLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin text-accent" />
                      ) : (
                        <span>G</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold text-primary theme-text-primary">
                          {account.provider === 'google' ? 'Conta Google Conectada' : 'Login com Conta Google'}
                        </span>
                        {account.provider === 'google' ? (
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-success-bg text-success border border-success-border flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Firestore Ativo</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-surface-subtle text-muted border border-border">
                            Nuvem Firebase
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-muted theme-text-muted truncate">
                        {account.provider === 'google' 
                          ? `${account.email || 'Autenticado'} • Sincronização em nuvem ativa` 
                          : 'Sincronize seu progresso, simulados e estatísticas de forma segura no Firestore'}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {account.provider === 'google' ? (
                      <>
                        <button
                          type="button"
                          onClick={handleManualSync}
                          disabled={isSyncingCloud || isGoogleLoading}
                          className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border bg-surface-subtle hover:bg-surface-hover text-secondary transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                          title="Sincronizar progresso com a nuvem agora"
                        >
                          <RefreshCw className={`w-3 h-3 ${isSyncingCloud ? 'animate-spin text-accent' : ''}`} />
                          <span>{isSyncingCloud ? 'Sincronizando...' : 'Sincronizar'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleGoogleDisconnect}
                          disabled={isGoogleLoading}
                          className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-border text-secondary hover:bg-surface-hover transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isGoogleLoading ? 'Aguarde...' : 'Desconectar'}
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        onClick={handleGoogleConnect}
                        disabled={isGoogleLoading}
                        className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-border bg-surface-subtle hover:bg-surface-hover text-secondary transition-colors flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
                      >
                        {isGoogleLoading ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                            <span>Conectando...</span>
                          </>
                        ) : (
                          <>
                            <span className="font-bold text-accent">G</span>
                            <span>Entrar com Google</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                {/* Error Banner */}
                {authError && (
                  <div className="p-3 rounded-lg border border-danger/40 bg-danger/10 text-xs text-danger flex items-start gap-2 animate-in fade-in">
                    <AlertCircle className="w-4 h-4 shrink-0 text-danger mt-0.5" />
                    <div className="space-y-0.5">
                      <span className="font-semibold block">Falha na Autenticação</span>
                      <span>{authError}</span>
                    </div>
                  </div>
                )}

                {/* Success Banner */}
                {syncSuccessNotice && (
                  <div className="p-3 rounded-lg border border-accent/40 bg-accent-subtle text-xs text-accent flex items-start gap-2 animate-in fade-in">
                    <Check className="w-4 h-4 shrink-0 text-accent mt-0.5" />
                    <span>{syncSuccessNotice}</span>
                  </div>
                )}
              </div>

              {/* Avatar Selector */}
              <div>
                <label className="block text-xs font-semibold text-secondary theme-text-secondary mb-1.5">
                  Avatar do Perfil
                </label>
                <div className="flex flex-wrap gap-2">
                  {AVATAR_OPTIONS.map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setAvatar(icon)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border transition-all cursor-pointer ${
                        avatar === icon
                          ? 'border-accent bg-accent-subtle scale-110 shadow-xs'
                          : 'border-border hover:border-accent theme-card'
                      }`}
                    >
                      <span className="avatar-icon emoji-filter" data-emoji="true">{icon}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Profile Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary theme-text-secondary mb-1">
                    Nome / Apelido *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (formErrors.name) {
                        setFormErrors(prev => ({ ...prev, name: undefined }));
                      }
                    }}
                    placeholder="Seu nome ou identificação"
                    className={`w-full px-3 py-2 text-sm rounded-lg theme-input focus:outline-hidden ${
                      formErrors.name ? 'border-danger focus:border-danger' : 'focus:border-accent'
                    }`}
                  />
                  {formErrors.name && (
                    <div className="mt-1.5 text-xs text-danger flex items-center gap-1.5" role="alert">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-danger" />
                      <span>{formErrors.name}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary theme-text-secondary mb-1">
                    E-mail
                  </label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (formErrors.email) {
                        setFormErrors(prev => ({ ...prev, email: undefined }));
                      }
                    }}
                    placeholder="seu.email@exemplo.com"
                    className={`w-full px-3 py-2 text-sm rounded-lg theme-input focus:outline-hidden ${
                      formErrors.email ? 'border-danger focus:border-danger' : 'focus:border-accent'
                    }`}
                  />
                  {formErrors.email && (
                    <div className="mt-1.5 text-xs text-danger flex items-center gap-1.5" role="alert">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0 text-danger" />
                      <span>{formErrors.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Target Exam & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary theme-text-secondary mb-1">
                    Área / Foco de Estudo
                  </label>
                  <input
                    type="text"
                    value={targetExam}
                    onChange={(e) => setTargetExam(e.target.value)}
                    placeholder="Ex: Escrituras Sagradas, Doutrina & Convênios, História, etc."
                    className="w-full px-3 py-2 text-sm rounded-lg theme-input focus:outline-hidden focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary theme-text-secondary mb-1">
                    Meta de Conhecimento / Módulo
                  </label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    placeholder="Ex: Memorização Integral, Instrutor, Estudo Pessoal"
                    className="w-full px-3 py-2 text-sm rounded-lg theme-input focus:outline-hidden focus:border-accent"
                  />
                </div>
              </div>

              {/* Daily Goal & Level */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary theme-text-secondary mb-1">
                    Meta Diária de Questões
                  </label>
                  <select
                    value={dailyGoalQuestions}
                    onChange={(e) => setDailyGoalQuestions(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-primary focus:outline-hidden focus:border-accent cursor-pointer"
                  >
                    <option value={15}>15 questões / dia (Ritmo Leve)</option>
                    <option value={30}>30 questões / dia (Ritmo Constante)</option>
                    <option value={50}>50 questões / dia (Foco Intenso)</option>
                    <option value={80}>80 questões / dia (Aprofundamento)</option>
                    <option value={100}>100+ questões / dia (Modo Imersivo)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary theme-text-secondary mb-1">
                    Nível de Experiência
                  </label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value as any)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-border bg-surface text-primary focus:outline-hidden focus:border-accent cursor-pointer"
                  >
                    <option value="iniciante">Iniciante (Primeiros passos)</option>
                    <option value="intermediario">Intermediário (Base consolidada)</option>
                    <option value="avancado">Avançado (Alto índice de acertos)</option>
                    <option value="faixa_preta">Domínio Pleno / Especialista</option>
                  </select>
                </div>
              </div>

              {/* Actions Row */}
              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={handleExportAccountData}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-border theme-card hover:bg-surface-hover transition-colors flex items-center gap-1.5 cursor-pointer text-primary theme-text-primary"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Baixar Backup do Perfil</span>
                </button>
                <div className="flex items-center gap-2">
                  {isSavedNotice && (
                    <span className="text-xs font-semibold text-success flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Salvo com sucesso!</span>
                    </span>
                  )}
                  <button
                    type="submit"
                    className="px-4 py-2 text-xs font-semibold rounded-lg theme-btn-accent transition-colors cursor-pointer shadow-xs"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </form>
          )}

          {activeTab === 'storage' && (
            <div className="space-y-4">
              {/* Storage Telemetry Meter */}
              <div className="p-4 rounded-xl border border-border theme-card space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4 text-accent" />
                    <span className="text-xs font-bold text-primary theme-text-primary">
                      Uso de Armazenamento do Navegador
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold text-secondary theme-text-secondary">
                    {storageInfo ? `${storageInfo.usageFormatted} / ${storageInfo.quotaFormatted}` : 'Calculando...'}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 rounded-full bg-surface-subtle border border-border overflow-hidden">
                  <div 
                    className="h-full bg-accent rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(1, storageInfo?.percentUsed || 0)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[11px] text-muted theme-text-muted">
                  <span>Banco de questões + Histórico + SRS</span>
                  <span>{storageInfo?.percentUsed}% da cota utilizada</span>
                </div>
              </div>

              {/* Persistence Lock Status */}
              <div className="p-4 rounded-xl border border-border theme-card space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-primary theme-text-primary">
                      <Lock className="w-3.5 h-3.5 text-amber" />
                      <span>Blindagem Contra Expurgamento (Persistência)</span>
                    </div>
                    <p className="text-xs text-muted theme-text-muted mt-0.5 leading-relaxed">
                      {storageInfo?.isPersisted 
                        ? 'O navegador garantiu modo persistente. Seus bancos de questões e respostas NUNCA serão apagados automaticamente para liberar espaço em disco.'
                        : 'Por padrão, navegadores podem limpar o cache de sites se o disco estiver cheio. Ative a persistência para blindar seus dados permanentemente.'}
                    </p>
                  </div>
                  {!storageInfo?.isPersisted && (
                    <button
                      type="button"
                      onClick={handleRequestPersistence}
                      disabled={isPersisting}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber hover:opacity-90 text-warning-contrast shrink-0 transition-colors cursor-pointer shadow-xs"
                    >
                      {isPersisting ? 'Solicitando...' : 'Blindar Dados'}
                    </button>
                  )}
                </div>
                {persistSuccessMsg && (
                  <div className="text-xs font-semibold text-success flex items-center gap-1 pt-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{persistSuccessMsg}</span>
                  </div>
                )}
              </div>

              {/* Browser Quotas Guide (Answers user's question directly in the UI as well) */}
              <div className="p-4 rounded-xl border border-border theme-card-subtle space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary theme-text-primary">
                  <Info className="w-3.5 h-3.5 text-accent" />
                  <span>Limites Reais de Armazenamento por Navegador:</span>
                </div>
                <ul className="text-xs space-y-1.5 text-secondary theme-text-secondary leading-relaxed list-disc pl-4">
                  <li>
                    <strong className="text-primary theme-text-primary">Chrome / Edge / Chromium:</strong> Até <strong>60% do espaço livre em disco</strong>. Em computadores modernos, costuma ultrapassar <strong>20 GB a 100 GB+</strong> sem custo ou limite rígido.
                  </li>
                  <li>
                    <strong className="text-primary theme-text-primary">Firefox:</strong> Até <strong>50% do disco livre</strong> (com cota padrão de até 2 GB por domínio, expansível automaticamente).
                  </li>
                  <li>
                    <strong className="text-primary theme-text-primary">Safari / WebKit:</strong> Cota de <strong>1 GB</strong> antes de exigir confirmação do usuário. Em abas comuns sem PWA instalada, dados podem sofrer limpeza após 7 dias de inatividade.
                  </li>
                  <li>
                    <strong className="text-primary theme-text-primary">LocalStorage Puro:</strong> Limitado a <strong>5 MB a 10 MB</strong> por domínio.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === 'profiles' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-primary theme-text-primary">
                    Gerenciar Perfis de Estudo
                  </h3>
                  <p className="text-xs text-muted theme-text-muted">
                    Crie múltiplos perfis para organizar seus estudos por temas, escrituras, módulos ou metas.
                  </p>
                </div>
                {!isCreatingProfile && (
                  <button
                    type="button"
                    onClick={() => setIsCreatingProfile(true)}
                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg theme-btn-accent transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Novo Perfil</span>
                  </button>
                )}
              </div>

              {isCreatingProfile && (
                <div className="p-3 rounded-xl border border-accent/30 bg-accent-subtle space-y-2">
                  <label className="block text-xs font-semibold text-accent">
                    Nome do Novo Perfil
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={newProfileName}
                      onChange={(e) => setNewProfileName(e.target.value)}
                      placeholder="Ex: Foco D&C, Memorização, Conhecimentos Gerais"
                      className="flex-1 px-3 py-1.5 text-xs rounded-lg theme-input focus:outline-hidden focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={handleCreateNewProfile}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg theme-btn-accent transition-colors cursor-pointer"
                    >
                      Criar
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCreatingProfile(false)}
                      className="px-2.5 py-1.5 text-xs rounded-lg border border-border bg-surface hover:bg-surface-hover text-secondary transition-colors cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}

              {/* Profiles List */}
              <div className="space-y-2">
                {profiles.map((prof) => {
                  const isActive = prof.id === account.id;
                  return (
                    <div
                      key={prof.id}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                        isActive
                          ? 'border-accent bg-accent-subtle shadow-xs'
                          : 'theme-card hover:border-accent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg bg-surface-subtle border border-border shrink-0 overflow-hidden">
                          {prof.avatar?.startsWith('http') ? (
                            <img 
                              src={prof.avatar} 
                              alt={prof.name} 
                              className="w-full h-full object-cover rounded-lg avatar-icon" 
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <span className="avatar-icon emoji-filter" data-emoji="true">{prof.avatar}</span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-primary theme-text-primary">
                              {prof.name}
                            </span>
                            {isActive && (
                              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-accent text-accent-contrast">
                                Ativo
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-muted theme-text-muted">
                            {prof.targetExam} • Meta: {prof.dailyGoalQuestions}q/dia
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {!isActive && (
                          <button
                            type="button"
                            onClick={() => handleSwitchProfile(prof.id)}
                            className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-border theme-card hover:bg-surface-hover transition-colors cursor-pointer text-primary theme-text-primary"
                          >
                            Alternar
                          </button>
                        )}
                        {profiles.length > 1 && !isActive && (
                          <button
                            type="button"
                            onClick={() => handleDeleteProfile(prof.id)}
                            className="p-1 text-danger hover:bg-danger-bg rounded transition-colors cursor-pointer"
                            title="Excluir perfil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={!!profileToDelete}
        title="Excluir Perfil de Estudos"
        message="Tem certeza que deseja excluir este perfil de estudos? Os dados locais deste perfil serão removidos permanentemente."
        confirmLabel="Excluir Perfil"
        cancelLabel="Cancelar"
        variant="danger"
        onConfirm={confirmDeleteProfile}
        onCancel={() => setProfileToDelete(null)}
      />
    </div>
  );
};
