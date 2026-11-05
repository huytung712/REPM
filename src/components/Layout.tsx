import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  FolderKanban, 
  FileText, 
  Settings, 
  LogOut, 
  Bot, 
  Menu, 
  X, 
  ShieldCheck, 
  Calendar, 
  Compass, 
  ExternalLink,
  Layers,
  Share2,
  ArrowRight,
  Upload,
  History,
  Database
} from 'lucide-react';
import { useStore, isAdmin } from '@/store';
import { usePortfolio, seedFromBundledData } from '@/data/portfolioStore';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Quản trị viên',
  manager: 'Quản lý (được sửa)',
  viewer: 'Chỉ xem',
};

function DataSourceBanner() {
  const { source, error, metadata } = usePortfolio();
  const user = useStore((s) => s.user);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  if (error) {
    return (
      <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">
        {error}. Kiểm tra quyền truy cập Firestore (firestore.rules) và vai trò tài khoản.
      </div>
    );
  }
  if (source !== 'seed') return null;
  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 flex flex-col sm:flex-row sm:items-center gap-2 justify-between">
      <span>
        <b>Firestore chưa có dữ liệu.</b> Đang hiển thị dữ liệu khởi tạo (chỉ đọc) trích từ Excel ngày{' '}
        {metadata.lastSyncDate || '—'}. Mọi chỉnh sửa cần khởi tạo dữ liệu trước.
        {msg && <span className="block mt-1 text-rose-700">{msg}</span>}
      </span>
      {isAdmin(user) && (
        <button
          disabled={busy}
          onClick={async () => {
            setBusy(true);
            setMsg('');
            try {
              await seedFromBundledData();
            } catch (e: any) {
              setMsg('Lỗi: ' + (e?.code || e?.message));
            } finally {
              setBusy(false);
            }
          }}
          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 text-white font-semibold hover:bg-amber-700 disabled:opacity-60"
        >
          <Database size={13} /> {busy ? 'Đang ghi...' : 'Khởi tạo dữ liệu lên Firestore'}
        </button>
      )}
    </div>
  );
}

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { user, logout } = useStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navSections = [
    {
      title: 'Quản trị Danh mục',
      items: [
        { name: 'Bảng điều khiển KPI', path: '/', icon: Home },
        { name: 'Danh mục Dự án & Chỉ tiêu', path: '/projects', icon: FolderKanban },
      ]
    },
    {
      title: 'Theo dõi Tiến độ SharePoint',
      items: [
        { name: 'Ma trận 15 Mốc Pháp lý', path: '/master-schedule', icon: Calendar },
        { name: 'Tiến độ Thiết kế & Kỹ thuật', path: '/design-progress', icon: Compass },
        { name: 'Nhập dữ liệu Excel', path: '/import', icon: Upload },
        { name: 'Nguồn Dữ Liệu (Data Intake)', path: '/data-sources', icon: Layers },
      ]
    },
    {
      title: 'Tiện ích & Hệ thống',
      items: [
        { name: 'Tài liệu & Hồ sơ', path: '/documents', icon: FileText },
        { name: 'Nhật ký thay đổi', path: '/activity', icon: History },
        { name: 'Kết nối (bản demo)', path: '/connections', icon: Share2 },
        { name: 'Trợ lý AI BĐS Stellar', path: '/ai-assistant', icon: Bot },
        { name: 'Cài đặt & Phân quyền', path: '/settings', icon: Settings },
      ]
    }
  ];

  const { metadata } = usePortfolio();
  const displayName = user?.displayName || user?.email || '';
  const email = user?.email || '';
  const roleLabel = ROLE_LABELS[user?.role || ''] || 'Chưa phân quyền';

  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 font-sans select-none overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-20 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 flex flex-col text-white transform transition-transform duration-300 lg:static lg:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/20 font-black text-white">
              S
            </div>
            <div>
              <span className="text-white font-bold text-base tracking-tight block">STELLAR PM</span>
              <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block">Real Estate ERP</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <nav className="flex flex-col flex-1 px-3 py-3 space-y-4 overflow-y-auto">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                {section.title}
              </div>
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={() => setIsSidebarOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-sm'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon size={16} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}

          {/* SharePoint Data Source indicator card */}
          <div className="p-3 bg-slate-800/60 border border-slate-800 rounded-xl space-y-1.5 text-xs text-slate-400">
            <div className="flex items-center justify-between text-[11px] text-indigo-400 font-bold">
              <span className="flex items-center"><Layers size={12} className="mr-1" /> Nguồn dữ liệu</span>
            </div>
            <p className="text-[11px] text-slate-300">
              Excel cập nhật {metadata.lastSyncDate || '—'} · {metadata.totalProjects} dự án
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
              <NavLink
                to="/import"
                className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold flex items-center"
              >
                <span>Nhập Excel mới</span>
                <ArrowRight size={10} className="ml-1" />
              </NavLink>
              <a 
                href="https://stellarvn-my.sharepoint.com/:x:/g/personal/mystellar_stellar_com_vn/IQA4GaKibvU-TrLPXR2svPGHAd-LobqrbWKx_e-_aUULN08"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-slate-400 hover:text-white flex items-center"
                title="Mở tệp Excel gốc"
              >
                <span>SharePoint</span>
                <ExternalLink size={9} className="ml-1" />
              </a>
            </div>
          </div>
        </nav>

        <div className="p-3 mt-auto border-t border-slate-800">
          <div className="bg-slate-800/80 rounded-xl p-2.5 mb-2.5 flex items-center space-x-2.5 border border-slate-700/50">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-xs font-bold uppercase text-white shadow-xs">
              {displayName.split(' ').map(n => n[0]).slice(0, 2).join('') || 'HT'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{displayName}</p>
              <div className="flex items-center space-x-1">
                <ShieldCheck size={11} className="text-emerald-400 shrink-0" />
                <p className="text-[10px] text-emerald-400 font-semibold truncate">{roleLabel}</p>
              </div>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center w-full bg-slate-800 hover:bg-red-500/10 hover:text-red-400 text-slate-300 text-xs py-1.5 rounded-lg font-medium transition-colors border border-slate-700/60"
          >
            <LogOut size={13} className="mr-1.5" />
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="lg:hidden p-2 rounded-md text-slate-500 hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>
          
          <div className="flex-1">
            <p className="text-xs text-slate-600 hidden sm:block">
              Xin chào <span className="font-bold text-slate-900">{displayName}</span> ({email})
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <a
              href="https://stellarvn-my.sharepoint.com/:x:/g/personal/mystellar_stellar_com_vn/IQA4GaKibvU-TrLPXR2svPGHAd-LobqrbWKx_e-_aUULN08"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg font-semibold flex items-center space-x-1 transition-colors border border-indigo-200"
            >
              <span>SharePoint BĐS Stellar</span>
              <ExternalLink size={12} />
            </a>

            <div className="flex items-center space-x-1.5 text-xs">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                <ShieldCheck size={13} className="mr-1 text-indigo-600" />
                {roleLabel}
              </span>
            </div>
          </div>
        </header>
        
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col min-h-0 bg-slate-50">
          <DataSourceBanner />
          <Outlet />
        </main>
        
        <footer className="h-8 bg-white border-t border-slate-200 px-6 flex items-center justify-between text-[10px] text-slate-400 shrink-0">
          <div className="flex space-x-4">
            <span>Dữ liệu: Excel {metadata.lastSyncDate || '—'}</span>
            <span className="text-indigo-600 font-semibold">Tài khoản: {email}</span>
          </div>
          <div className="flex items-center space-x-1">
            <ShieldCheck size={11} className="text-emerald-500" />
            <span className="text-slate-600 font-medium">{roleLabel}</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
