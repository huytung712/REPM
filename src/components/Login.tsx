import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { auth, googleProvider, isUsingEmulators } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  sendPasswordResetEmail,
} from 'firebase/auth';
import { Building2, ArrowRight } from 'lucide-react';
import { useStore } from '@/store';

const AUTH_ERRORS: Record<string, string> = {
  'auth/invalid-credential': 'Email hoặc mật khẩu không đúng.',
  'auth/wrong-password': 'Email hoặc mật khẩu không đúng.',
  'auth/user-not-found': 'Email chưa được đăng ký.',
  'auth/email-already-in-use': 'Email đã được đăng ký. Hãy đăng nhập.',
  'auth/weak-password': 'Mật khẩu cần tối thiểu 6 ký tự.',
  'auth/invalid-email': 'Email không hợp lệ.',
  'auth/popup-closed-by-user': 'Cửa sổ đăng nhập Google đã bị đóng.',
  'auth/operation-not-allowed':
    'Phương thức đăng nhập này chưa được bật trong Firebase Console (Authentication → Sign-in method).',
  'auth/unauthorized-domain':
    'Tên miền hiện tại chưa được thêm vào Firebase Console (Authentication → Settings → Authorized domains).',
  'auth/network-request-failed': 'Không kết nối được tới Firebase. Kiểm tra mạng.',
};

function authMessage(err: any) {
  return AUTH_ERRORS[err?.code] || err?.message || 'Đã có lỗi xảy ra.';
}

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const navigate = useNavigate();
  const { user, authError } = useStore();

  if (user) return <Navigate to="/" replace />;

  const run = async (fn: () => Promise<void>) => {
    setError('');
    setInfo('');
    setLoading(true);
    try {
      await fn();
      navigate('/');
    } catch (err: any) {
      setError(authMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () =>
    run(async () => {
      await signInWithPopup(auth, googleProvider);
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    run(async () => {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email.trim(), password);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() });
      }
    });
  };

  const handleReset = async () => {
    setError('');
    setInfo('');
    if (!email.trim()) {
      setError('Nhập email trước khi yêu cầu đặt lại mật khẩu.');
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setInfo('Đã gửi email đặt lại mật khẩu.');
    } catch (err) {
      setError(authMessage(err));
    }
  };

  const inputCls =
    'w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/15 blur-[120px] pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 text-white shadow-xl shadow-indigo-500/25 mb-4">
          <Building2 size={32} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">Stellar Real Estate PM</h2>
        <p className="mt-2 text-sm text-slate-400">Hệ thống Quản lý Danh mục Dự án Bất động sản</p>
        {isUsingEmulators && (
          <p className="mt-2 text-xs text-amber-400">Đang chạy với Firebase Emulator (môi trường thử nghiệm)</p>
        )}
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-5">
          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 font-semibold text-sm rounded-xl py-2.5 hover:bg-slate-100 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
              <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
              <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.5 39.6 16.2 44 24 44z" />
              <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
            </svg>
            Đăng nhập bằng Google
          </button>

          <div className="flex items-center gap-3 text-[11px] text-slate-500 uppercase tracking-wider">
            <div className="flex-1 h-px bg-slate-800" />
            hoặc email
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            {!isLogin && (
              <input className={inputCls} placeholder="Họ và tên" value={name} onChange={(e) => setName(e.target.value)} />
            )}
            <input
              className={inputCls}
              type="email"
              required
              autoComplete="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className={inputCls}
              type="password"
              required
              minLength={6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {(error || authError) && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/30 rounded-lg px-3 py-2">
                {error || authError}
              </p>
            )}
            {info && (
              <p className="text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 rounded-lg px-3 py-2">
                {info}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl py-2.5 disabled:opacity-60"
            >
              {loading ? 'Đang xử lý...' : isLogin ? 'Đăng nhập' : 'Tạo tài khoản'}
              <ArrowRight size={16} />
            </button>
          </form>

          <div className="flex justify-between text-xs text-slate-400">
            <button type="button" className="hover:text-white" onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Chưa có tài khoản? Đăng ký' : 'Đã có tài khoản? Đăng nhập'}
            </button>
            {isLogin && (
              <button type="button" className="hover:text-white" onClick={handleReset}>
                Quên mật khẩu
              </button>
            )}
          </div>

          <p className="text-[11px] text-slate-500 leading-relaxed">
            Tài khoản mới mặc định có quyền <b>Xem</b>. Quản trị viên cấp quyền <b>Quản lý</b> hoặc <b>Quản trị</b> tại
            mục Cài đặt &amp; Phân quyền.
          </p>
        </div>
      </div>
    </div>
  );
}
