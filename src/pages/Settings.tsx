import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { ShieldCheck, Users, Save } from 'lucide-react';
import { db } from '../lib/firebase';
import { useStore, isAdmin, BOOTSTRAP_ADMIN_EMAIL } from '../store';
import { setUserRole } from '../data/portfolioStore';
import { User, Role } from '../types';

const ROLES: { id: Role; label: string; desc: string }[] = [
  { id: 'viewer', label: 'Chỉ xem', desc: 'Xem dự án, tiến độ, tài liệu' },
  { id: 'manager', label: 'Quản lý', desc: 'Sửa mốc tiến độ, công việc, tài liệu' },
  { id: 'admin', label: 'Quản trị', desc: 'Toàn quyền, phân quyền, nhập Excel' },
];

export default function Settings() {
  const user = useStore((s) => s.user);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [savedName, setSavedName] = useState('');

  const saveName = async () => {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), { displayName: displayName.trim() });
      useStore.setState({ user: { ...user, displayName: displayName.trim() } });
      setSavedName('Đã lưu.');
    } catch (e: any) {
      setSavedName('Lỗi: ' + (e?.code || e?.message));
    }
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12">
      <h1 className="text-2xl font-bold text-slate-900">Cài đặt &amp; phân quyền</h1>

      <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <h2 className="font-bold text-slate-900 text-sm">Tài khoản của tôi</h2>
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div>
            <p className="text-slate-500">Email</p>
            <p className="font-semibold text-slate-900">{user?.email}</p>
          </div>
          <div>
            <p className="text-slate-500">Vai trò</p>
            <p className="font-semibold text-slate-900">{ROLES.find((r) => r.id === user?.role)?.label}</p>
          </div>
          <label className="space-y-1">
            <span className="text-slate-500">Tên hiển thị</span>
            <div className="flex gap-2">
              <input className="flex-1 border border-slate-300 rounded-lg px-2.5 py-1.5" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
              <button onClick={saveName} className="px-3 rounded-lg bg-slate-900 text-white">
                <Save size={14} />
              </button>
            </div>
            {savedName && <span className="text-[11px] text-slate-500">{savedName}</span>}
          </label>
        </div>
      </section>

      {isAdmin(user) && <UserAdmin />}

      <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2 text-xs text-slate-600">
        <h2 className="font-bold text-slate-900 text-sm">Đồng bộ dữ liệu từ SharePoint</h2>
        <p>
          Hiện tại dữ liệu được cập nhật bằng cách tải file Excel từ SharePoint và nhập ở mục <b>Nhập dữ liệu Excel</b>. Đồng bộ tự động (Microsoft
          Graph / Power Automate) chưa được triển khai vì cần cấu hình tenant Microsoft 365 của công ty.
        </p>
      </section>
    </div>
  );
}

function UserAdmin() {
  const me = useStore((s) => s.user);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState('');

  useEffect(
    () =>
      onSnapshot(
        collection(db, 'users'),
        (snap) => setUsers(snap.docs.map((d) => ({ ...(d.data() as User), uid: d.id })).sort((a, b) => a.email.localeCompare(b.email))),
        (e) => setError('Không đọc được danh sách người dùng: ' + e.code),
      ),
    [],
  );

  const change = async (u: User, role: Role) => {
    if (u.uid === me?.uid && role !== 'admin' && !confirm('Bạn đang tự hạ quyền của chính mình. Tiếp tục?')) return;
    try {
      await setUserRole(u.uid, role, u.email);
    } catch (e: any) {
      setError('Không đổi được vai trò: ' + (e?.code || e?.message));
    }
  };

  return (
    <section className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <Users size={16} className="text-indigo-600" />
        <h2 className="font-bold text-slate-900 text-sm">Người dùng ({users.length})</h2>
      </div>
      <p className="text-xs text-slate-500">
        Người dùng tự đăng ký/đăng nhập sẽ có quyền <b>Chỉ xem</b>. Đổi vai trò tại đây. Tài khoản {BOOTSTRAP_ADMIN_EMAIL} luôn là quản trị
        (khai báo trong firestore.rules).
      </p>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead className="text-left text-[10px] uppercase text-slate-500 border-b border-slate-200">
            <tr>
              <th className="py-2 pr-3">Người dùng</th>
              <th className="py-2 pr-3">Đăng nhập gần nhất</th>
              <th className="py-2">Vai trò</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((u) => (
              <tr key={u.uid}>
                <td className="py-2 pr-3">
                  <p className="font-semibold text-slate-900">{u.displayName}</p>
                  <p className="text-slate-500">{u.email}</p>
                </td>
                <td className="py-2 pr-3 text-slate-500">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('vi-VN') : '—'}</td>
                <td className="py-2">
                  <div className="flex flex-wrap gap-1">
                    {ROLES.map((r) => (
                      <button
                        key={r.id}
                        title={r.desc}
                        onClick={() => u.role !== r.id && change(u, r.id)}
                        className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                          u.role === r.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-400'
                        }`}
                      >
                        {u.role === r.id && <ShieldCheck size={11} className="inline mr-1" />}
                        {r.label}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
