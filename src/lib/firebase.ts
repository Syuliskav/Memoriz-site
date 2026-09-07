import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  signOut, 
  GoogleAuthProvider,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  getDocFromServer 
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserAccount, UserStatistics, SRSItem, UserAnswerRecord, UserBookmark } from '../types/question';

// 1. Initialize Firebase App and Services
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

/* CRITICAL: The app will break without firebaseConfig.firestoreDatabaseId */
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export { onAuthStateChanged };
export type { FirebaseUser };

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// 2. Validate Connection to Firestore on boot
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or database is provisioning.');
    }
  }
}
testConnection();

// 3. Error Handling adhering to the ABAC / Firestore specification
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// 4. Map Firebase Auth Errors to User-Friendly Portuguese Messages
export function getFriendlyAuthErrorMessage(error: unknown): string {
  if (!error) return 'Erro desconhecido durante a autenticação.';
  
  const errCode = (error as { code?: string })?.code || '';
  const errMsg = error instanceof Error ? error.message : String(error);

  switch (errCode) {
    case 'auth/popup-closed-by-user':
      return 'O login foi cancelado antes de ser concluído. Você pode tentar novamente a qualquer momento.';
    case 'auth/popup-blocked':
      return 'A janela de autenticação foi bloqueada pelo navegador. Permita popups para este site para fazer login com o Google.';
    case 'auth/cancelled-popup-request':
      return 'A solicitação de login anterior foi cancelada.';
    case 'auth/network-request-failed':
      return 'Falha de conexão com a internet. Verifique sua rede e tente novamente.';
    case 'auth/account-exists-with-different-credential':
      return 'Já existe uma conta associada a este e-mail com outro método de login.';
    case 'auth/user-disabled':
      return 'Esta conta de usuário foi desativada pelo administrador.';
    case 'auth/operation-not-allowed':
      return 'O login com Google não está habilitado no projeto de autenticação.';
    case 'auth/unauthorized-domain':
      return 'O domínio atual não está autorizado para autenticação no Firebase. Configure o domínio no Console do Firebase.';
    default:
      if (errMsg.toLowerCase().includes('network') || errMsg.toLowerCase().includes('offline')) {
        return 'Falha de conexão com a internet. Verifique sua rede e tente novamente.';
      }
      return `Falha ao autenticar com o Google (${errCode || errMsg}). Tente novamente.`;
  }
}

// 5. Firebase Auth Helpers
export async function signInWithGoogleReal(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutReal(): Promise<void> {
  await signOut(auth);
}

// 6. Firestore Synchronization Helpers
export interface SyncedCloudData {
  account: Partial<UserAccount>;
  stats?: UserStatistics;
  srsItems?: Record<number, SRSItem>;
  answers?: Record<number, UserAnswerRecord[]>;
  bookmarks?: Record<number, UserBookmark>;
  lastSyncedAt?: string;
}

/**
 * Saves or updates the user profile and study progress in Firestore
 */
export async function syncUserDataToFirestore(
  user: FirebaseUser,
  currentAccount: UserAccount,
  studyData?: {
    stats?: UserStatistics;
    srsItems?: Record<number, SRSItem>;
    answers?: Record<number, UserAnswerRecord[]>;
    bookmarks?: Record<number, UserBookmark>;
  }
): Promise<{ success: boolean; lastSyncedAt: string }> {
  const userId = user.uid;
  const userDocPath = `users/${userId}`;
  const syncDocPath = `users/${userId}/sync/progress`;
  const timestamp = new Date().toISOString();

  // 1. Prepare profile payload conforming strictly to UserProfile schema in blueprint
  const userProfilePayload = {
    userId,
    name: (user.displayName || currentAccount.name || 'Estudante').slice(0, 100),
    email: (user.email || currentAccount.email || '').slice(0, 150),
    avatar: (user.photoURL || currentAccount.avatar || '🎯').slice(0, 500),
    targetExam: (currentAccount.targetExam || 'Objetivo de Estudo').slice(0, 100),
    targetRole: (currentAccount.targetRole || 'Domínio Geral').slice(0, 100),
    dailyGoalQuestions: Math.max(1, Math.min(1000, currentAccount.dailyGoalQuestions || 30)),
    experienceLevel: currentAccount.experienceLevel || 'intermediario',
    isCloudSyncEnabled: true,
    provider: 'google',
    createdAt: currentAccount.createdAt || timestamp,
    updatedAt: timestamp,
  };

  try {
    await setDoc(doc(db, 'users', userId), userProfilePayload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, userDocPath);
  }

  // 2. Save study data progress to subcollection if provided
  if (studyData) {
    const syncPayload = {
      userId,
      stats: studyData.stats || null,
      srsItemsJson: studyData.srsItems ? JSON.stringify(studyData.srsItems) : '{}',
      answersJson: studyData.answers ? JSON.stringify(studyData.answers) : '{}',
      bookmarksJson: studyData.bookmarks ? JSON.stringify(studyData.bookmarks) : '{}',
      lastSyncedAt: timestamp,
    };

    try {
      await setDoc(doc(db, 'users', userId, 'sync', 'progress'), syncPayload, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, syncDocPath);
    }
  }

  return { success: true, lastSyncedAt: timestamp };
}

/**
 * Loads cloud data from Firestore for the given user ID
 */
export async function loadUserDataFromFirestore(userId: string): Promise<SyncedCloudData | null> {
  const userDocPath = `users/${userId}`;
  const syncDocPath = `users/${userId}/sync/progress`;

  let profileData: Partial<UserAccount> | null = null;
  let syncData: any = null;

  try {
    const profileSnap = await getDoc(doc(db, 'users', userId));
    if (profileSnap.exists()) {
      profileData = profileSnap.data() as Partial<UserAccount>;
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, userDocPath);
  }

  try {
    const syncSnap = await getDoc(doc(db, 'users', userId, 'sync', 'progress'));
    if (syncSnap.exists()) {
      syncData = syncSnap.data();
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, syncDocPath);
  }

  if (!profileData && !syncData) {
    return null;
  }

  let srsItems: Record<number, SRSItem> | undefined;
  let answers: Record<number, UserAnswerRecord[]> | undefined;
  let bookmarks: Record<number, UserBookmark> | undefined;

  if (syncData?.srsItemsJson) {
    try {
      srsItems = JSON.parse(syncData.srsItemsJson);
    } catch {
      // ignore
    }
  }
  if (syncData?.answersJson) {
    try {
      answers = JSON.parse(syncData.answersJson);
    } catch {
      // ignore
    }
  }
  if (syncData?.bookmarksJson) {
    try {
      bookmarks = JSON.parse(syncData.bookmarksJson);
    } catch {
      // ignore
    }
  }

  return {
    account: profileData || {},
    stats: syncData?.stats || undefined,
    srsItems,
    answers,
    bookmarks,
    lastSyncedAt: syncData?.lastSyncedAt || profileData?.lastLoginAt,
  };
}
