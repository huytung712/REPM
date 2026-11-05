import { create } from 'zustand';
import { auth, db } from './lib/firebase';
import { onAuthStateChanged, signOut, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { User, Role } from './types';

/** Email quản trị khởi tạo — phải trùng với isBootstrapAdmin() trong firestore.rules */
export const BOOTSTRAP_ADMIN_EMAIL = 'huytung712@gmail.com';

interface AppState {
  isAiChatOpen: boolean;
  toggleAiChat: () => void;

  /** Hồ sơ người dùng (users/{uid}) — null khi chưa đăng nhập */
  user: User | null;
  /** true cho tới khi Firebase Auth trả về trạng thái đăng nhập lần đầu */
  authLoading: boolean;
  authError: string | null;
  logout: () => Promise<void>;
}

export const useStore = create<AppState>((set) => ({
  isAiChatOpen: false,
  toggleAiChat: () => set((state) => ({ isAiChatOpen: !state.isAiChatOpen })),
  user: null,
  authLoading: true,
  authError: null,
  logout: async () => {
    await signOut(auth);
    set({ user: null });
  },
}));

/** Đọc hoặc tạo hồ sơ users/{uid}. Người dùng mới mặc định là 'viewer'. */
async function loadOrCreateProfile(fbUser: FirebaseUser): Promise<User> {
  const ref = doc(db, 'users', fbUser.uid);
  const snap = await getDoc(ref);
  const isBootstrap =
    (fbUser.email || '').toLowerCase() === BOOTSTRAP_ADMIN_EMAIL && fbUser.emailVerified;

  if (snap.exists()) {
    const data = snap.data() as User;
    updateDoc(ref, { lastLoginAt: Date.now() }).catch(() => {});
    return { ...data, uid: fbUser.uid };
  }

  const profile: User = {
    uid: fbUser.uid,
    email: fbUser.email || '',
    displayName: fbUser.displayName || fbUser.email || 'Người dùng',
    role: (isBootstrap ? 'admin' : 'viewer') as Role,
    createdAt: Date.now(),
  };
  await setDoc(ref, profile);
  return profile;
}

let started = false;
/** Gọi một lần khi khởi động app */
export function initAuthListener() {
  if (started) return;
  started = true;
  onAuthStateChanged(auth, async (fbUser) => {
    if (!fbUser) {
      useStore.setState({ user: null, authLoading: false });
      return;
    }
    try {
      const profile = await loadOrCreateProfile(fbUser);
      useStore.setState({ user: profile, authLoading: false, authError: null });
    } catch (err: any) {
      console.error('Không tải được hồ sơ người dùng:', err);
      useStore.setState({
        user: null,
        authLoading: false,
        authError: 'Không tải được hồ sơ người dùng từ Firestore: ' + (err?.code || err?.message || 'lỗi không xác định'),
      });
      await signOut(auth).catch(() => {});
    }
  });
}

export function canEdit(user: User | null) {
  return !!user && (user.role === 'admin' || user.role === 'manager');
}
export function isAdmin(user: User | null) {
  return !!user && user.role === 'admin';
}
