import { useState, useEffect, useRef } from 'react';
import { 
  UserAccount, 
  UserStatistics, 
  SRSItem, 
  UserAnswerRecord, 
  UserBookmark 
} from '../types/question';
import { LocalStorageManager } from '../lib/storage';
import { 
  auth, 
  onAuthStateChanged, 
  syncUserDataToFirestore 
} from '../lib/firebase';

interface SyncDataPayload {
  stats: UserStatistics;
  srsItems: Record<number, SRSItem>;
  answers: Record<number, UserAnswerRecord[]>;
  bookmarks: Record<number, UserBookmark>;
}

export function useUserAccount(syncData?: SyncDataPayload) {
  const [userAccount, setUserAccount] = useState<UserAccount>(() => {
    return LocalStorageManager.getUserAccount();
  });

  // Firebase Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUserAccount((prev) => {
          if (prev.provider !== 'google' || prev.id !== firebaseUser.uid || prev.email !== firebaseUser.email) {
            const updated: UserAccount = {
              ...prev,
              id: firebaseUser.uid,
              name: prev.name || firebaseUser.displayName || 'Estudante',
              email: firebaseUser.email || prev.email || '',
              avatar: prev.avatar || firebaseUser.photoURL || '🎯',
              provider: 'google',
              isCloudSyncEnabled: true,
              lastLoginAt: new Date().toISOString(),
            };
            LocalStorageManager.saveUserAccount(updated);
            return updated;
          }
          return prev;
        });
      }
    });
    return () => unsubscribe();
  }, []);

  // Background debounce sync to Firestore when user is authenticated with Google
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!syncData) return;
    const { stats, srsItems, answers, bookmarks } = syncData;

    if (auth.currentUser && userAccount.provider === 'google' && userAccount.isCloudSyncEnabled) {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
      syncTimeoutRef.current = setTimeout(() => {
        if (auth.currentUser) {
          syncUserDataToFirestore(auth.currentUser, userAccount, {
            stats,
            srsItems,
            answers,
            bookmarks,
          }).catch((err) => {
            console.warn('Background Firestore sync error:', err);
          });
        }
      }, 3000);
    }
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, [
    userAccount, 
    syncData?.stats, 
    syncData?.srsItems, 
    syncData?.answers, 
    syncData?.bookmarks
  ]);

  return {
    userAccount,
    setUserAccount,
  };
}
