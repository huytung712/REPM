import { create } from 'zustand';
import { auth, db } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { User } from './types';

export const ADMIN_USER: User = {
  uid: 'admin_huytung712',
  email: 'huytung712@gmail.com',
  displayName: 'Huy Tùng',
  role: 'admin',
  createdAt: 1788586993176
};

interface AppState {
  isAiChatOpen: boolean;
  toggleAiChat: () => void;
  user: User | null;
  setUser: (user: User | null) => void;
  loginAsAdmin: () => Promise<void>;
  logout: () => Promise<void>;
}

const getInitialUser = (): User | null => {
  try {
    const saved = localStorage.getItem('stellar_pm_user');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error(e);
  }
  // Default to Admin user as requested: "tạo tài khoản anh là admin và truy cập vào app"
  try {
    localStorage.setItem('stellar_pm_user', JSON.stringify(ADMIN_USER));
  } catch (e) {}
  return ADMIN_USER;
};

export const useStore = create<AppState>((set) => ({
  isAiChatOpen: false,
  toggleAiChat: () => set((state) => ({ isAiChatOpen: !state.isAiChatOpen })),
  user: getInitialUser(),
  setUser: (user) => {
    if (user) {
      localStorage.setItem('stellar_pm_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('stellar_pm_user');
    }
    set({ user });
  },
  loginAsAdmin: async () => {
    localStorage.setItem('stellar_pm_user', JSON.stringify(ADMIN_USER));
    set({ user: ADMIN_USER });
    try {
      await setDoc(doc(db, 'users', ADMIN_USER.uid), ADMIN_USER, { merge: true });
    } catch (err) {
      console.warn('Firestore user sync:', err);
    }
  },
  logout: async () => {
    try {
      await signOut(auth);
    } catch {}
    localStorage.removeItem('stellar_pm_user');
    set({ user: null });
  }
}));

