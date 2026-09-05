import React, { useState, useEffect } from 'react';
import { 
  Share2, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  ExternalLink, 
  Settings, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  Sliders, 
  Send, 
  Check, 
  Copy, 
  Layers, 
  Radio, 
  QrCode, 
  Key, 
  HelpCircle,
  Bell,
  Sparkles,
  Cloud,
  Users
} from 'lucide-react';
import { initialServiceConnections } from '../data/connectionsData';
import { ServiceConnection, ServiceConnectionId } from '../types';

export default function ConnectionsPage() {
  const [connections, setConnections] = useState<ServiceConnection[]>(() => {
    try {
      const saved = localStorage.getItem('stellar_service_connections');
      if (saved) {
        const parsed: ServiceConnection[] = JSON.parse(saved);
        // Ensure new services (onedrive, teams) are automatically merged if missing
        const existingIds = new Set(parsed.map(c => c.id));
        const missing = initialServiceConnections.filter(c => !existingIds.has(c.id));
        if (missing.length > 0) {
          return [...parsed, ...missing];
        }
        return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return initialServiceConnections;
  });

  const [activeModalConnection, setActiveModalConnection] = useState<ServiceConnection | null>(null);
  const [modalTab, setModalTab] = useState<'quick' | 'qr' | 'token'>('quick');
  const [accountInput, setAccountInput] = useState('');
  const [tokenInput, setTokenInput] = useState('');
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string>('all');

  useEffect(() => {
    try {
      localStorage.setItem('stellar_service_connections', JSON.stringify(connections));
    } catch (e) {
      console.error(e);
    }
  }, [connections]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleConnect = (id: ServiceConnectionId) => {
    setConnections(prev => prev.map(c => {
      if (c.id === id) {
        const newStatus = c.status === 'connected' ? 'disconnected' : 'connected';
        return {
          ...c,
          status: newStatus,
          lastSync: newStatus === 'connected' ? 'Vừa kết nối thành công' : 'Đã ngắt kết nối'
        };
      }
      return c;
    }));
    showToast(`Đã cập nhật trạng thái kết nối.`);
  };

  const handleSyncNow = (id: string, name: string) => {
    setSyncingId(id);
    setTimeout(() => {
      setSyncingId(null);
      setConnections(prev => prev.map(c => {
        if (c.id === id) {
          return { ...c, lastSync: 'Đã đồng bộ trực tiếp (Live)' };
        }
        return c;
      }));
      showToast(`Đã đồng bộ dữ liệu thành công với ${name}`);
    }, 1200);
  };

  const handleSyncAll = () => {
    setSyncingId('all');
    setTimeout(() => {
      setSyncingId(null);
      setConnections(prev => prev.map(c => ({
        ...c,
        lastSync: 'Vừa đồng bộ toàn bộ (Live)'
      })));
      showToast(`Đã đồng bộ thành công toàn bộ ${connections.length} dịch vụ hệ thống!`);
    }, 1600);
  };

  const openLoginModal = (conn: ServiceConnection) => {
    setActiveModalConnection(conn);
    setAccountInput(conn.accountEmail || conn.accountName || '');
    setTokenInput(conn.config?.botToken || conn.config?.sharepointUrl || conn.config?.folderPath || '');
    setModalTab('quick');
  };

  const handleSaveConnection = () => {
    if (!activeModalConnection) return;

    setConnections(prev => prev.map(c => {
      if (c.id === activeModalConnection.id) {
        return {
          ...c,
          status: 'connected',
          accountName: accountInput || c.accountName || 'Tài khoản Quản trị PM',
          accountEmail: accountInput.includes('@') ? accountInput : c.accountEmail,
          lastSync: 'Vừa xác thực đăng nhập'
        };
      }
      return c;
    }));

    showToast(`Đã đăng nhập và kết nối thành công dịch vụ ${activeModalConnection.name}`);
    setActiveModalConnection(null);
  };

  const filteredConnections = connections.filter(c => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'messaging') {
      return c.id === 'zalo' || c.id === 'telegram';
    }
    if (filterCategory === 'cloud') {
      return c.id === 'microsoft' || c.id === 'onedrive' || c.id === 'google';
    }
    if (filterCategory === 'teams') {
      return c.id === 'teams';
    }
    if (filterCategory === 'workspace') {
      return c.id === 'gmail' || c.id === 'notebooklm';
    }
    return c.category.toLowerCase().includes(filterCategory.toLowerCase());
  });

  const connectedCount = connections.filter(c => c.status === 'connected').length;

  const renderServiceIcon = (id: ServiceConnectionId) => {
    switch (id) {
      case 'zalo':
        return (
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black text-sm tracking-wider shadow-md shadow-blue-500/20">
            Zalo
          </div>
        );
      case 'telegram':
        return (
          <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white flex items-center justify-center shadow-md shadow-sky-500/20">
            <Send size={24} className="-ml-0.5 mt-0.5" />
          </div>
        );
      case 'microsoft':
        return (
          <div className="w-12 h-12 rounded-2xl bg-slate-900 p-2.5 flex items-center justify-center shadow-md shadow-slate-900/20">
            <div className="grid grid-cols-2 gap-1 w-full h-full">
              <div className="bg-amber-500 rounded-sm"></div>
              <div className="bg-blue-500 rounded-sm"></div>
              <div className="bg-emerald-500 rounded-sm"></div>
              <div className="bg-red-500 rounded-sm"></div>
            </div>
          </div>
        );
      case 'onedrive':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-400 via-blue-500 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/25">
            <Cloud size={24} className="fill-white/20 text-white" />
          </div>
        );
      case 'teams':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#5b63d3] via-[#505AC9] to-[#464EB8] text-white flex items-center justify-center shadow-md shadow-indigo-600/25 relative">
            <Users size={22} className="text-white" />
            <span className="absolute -bottom-1 -right-1 bg-white text-[#464EB8] text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs border border-[#464EB8]/30">
              T
            </span>
          </div>
        );
      case 'google':
        return (
          <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-900 flex items-center justify-center shadow-md shadow-slate-200/50 font-bold text-lg">
            <span className="text-blue-600">G</span>
            <span className="text-red-500">o</span>
            <span className="text-amber-500">o</span>
            <span className="text-blue-600">g</span>
            <span className="text-emerald-600">l</span>
            <span className="text-red-500">e</span>
          </div>
        );
      case 'gmail':
        return (
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-md shadow-red-600/20 font-black text-sm">
            M
          </div>
        );
      case 'notebooklm':
        return (
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 to-purple-700 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
            <Sparkles size={24} />
          </div>
        );
      default:
        return (
          <div className="w-12 h-12 rounded-2xl bg-slate-800 text-white flex items-center justify-center">
            <Share2 size={24} />
          </div>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-700 text-xs font-medium flex items-center space-x-2 animate-in fade-in slide-in-from-top duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200/80">
              Tiện ích & Hệ thống
            </span>
            <span className="flex items-center space-x-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{connectedCount}/{connections.length} Dịch vụ Hoạt động</span>
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Trung Tâm Kết Nối Dịch Vụ
          </h1>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Đăng nhập và liên kết các kênh thông báo, đồng bộ tự động 23 dự án với Zalo, Telegram, Microsoft 365 SharePoint, Microsoft OneDrive, Microsoft Teams, Google Workspace, Gmail và NotebookLM.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleSyncAll}
            disabled={syncingId === 'all'}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold flex items-center space-x-2 shadow-md shadow-indigo-600/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={14} className={syncingId === 'all' ? 'animate-spin' : ''} />
            <span>Đồng bộ Tất cả ({connections.length}) Dịch vụ</span>
          </button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-medium">
        <button
          onClick={() => setFilterCategory('all')}
          className={`px-4 py-2 rounded-xl border transition-all whitespace-nowrap ${
            filterCategory === 'all'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tất cả Dịch vụ ({connections.length})
        </button>
        <button
          onClick={() => setFilterCategory('messaging')}
          className={`px-4 py-2 rounded-xl border transition-all whitespace-nowrap ${
            filterCategory === 'messaging'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Tin nhắn & Cảnh báo (Zalo, Telegram)
        </button>
        <button
          onClick={() => setFilterCategory('cloud')}
          className={`px-4 py-2 rounded-xl border transition-all whitespace-nowrap ${
            filterCategory === 'cloud'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Đám mây & Bản vẽ (SharePoint, OneDrive, Google)
        </button>
        <button
          onClick={() => setFilterCategory('teams')}
          className={`px-4 py-2 rounded-xl border transition-all whitespace-nowrap ${
            filterCategory === 'teams'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Họp & Nhóm PMO (Microsoft Teams)
        </button>
        <button
          onClick={() => setFilterCategory('workspace')}
          className={`px-4 py-2 rounded-xl border transition-all whitespace-nowrap ${
            filterCategory === 'workspace'
              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
          }`}
        >
          Văn thư & Tri thức (Gmail, NotebookLM)
        </button>
      </div>

      {/* Grid of Connection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredConnections.map((conn) => {
          const isConnected = conn.status === 'connected';
          const isCurrentSyncing = syncingId === conn.id;

          return (
            <div 
              key={conn.id}
              className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    {renderServiceIcon(conn.id)}
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{conn.name}</h3>
                      <span className="text-[11px] text-slate-400 font-medium">{conn.category}</span>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border flex items-center space-x-1 ${
                    isConnected 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-slate-100 text-slate-500 border-slate-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    <span>{isConnected ? 'Đã kết nối' : 'Chưa kết nối'}</span>
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-3.5 leading-relaxed">
                  {conn.description}
                </p>

                {/* Account Linked Info */}
                <div className="mt-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1 text-xs">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Tài khoản liên kết:</span>
                    <span className="font-semibold text-slate-800 truncate max-w-[170px]">
                      {conn.accountName || 'Chưa đăng nhập'}
                    </span>
                  </div>
                  {conn.accountEmail && (
                    <div className="flex items-center justify-between text-slate-500 text-[11px]">
                      <span>Định danh / Email:</span>
                      <span className="font-medium text-slate-700 truncate max-w-[170px]">
                        {conn.accountEmail}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-slate-400 text-[10px] pt-1 border-t border-slate-200/60">
                    <span>Đồng bộ gần nhất:</span>
                    <span className="text-slate-600 font-medium">{conn.lastSync || 'Chưa có'}</span>
                  </div>
                </div>

                {/* Features Pill List */}
                <div className="mt-4 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Tính năng tự động hóa:
                  </span>
                  {conn.features.map((f, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-[11px] text-slate-600">
                      <CheckCircle2 size={13} className="text-indigo-600 shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => openLoginModal(conn)}
                  className="flex-1 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
                >
                  <LogIn size={13} />
                  <span>{isConnected ? 'Quản lý / Đổi TK' : 'Đăng nhập kết nối'}</span>
                </button>

                {isConnected && (
                  <button
                    onClick={() => handleSyncNow(conn.id, conn.name)}
                    disabled={isCurrentSyncing}
                    title="Đồng bộ ngay"
                    className="p-2 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 rounded-xl transition-colors disabled:opacity-50"
                  >
                    <RefreshCw size={14} className={isCurrentSyncing ? 'animate-spin text-indigo-600' : ''} />
                  </button>
                )}

                <button
                  onClick={() => handleToggleConnect(conn.id)}
                  title={isConnected ? 'Ngắt kết nối' : 'Kích hoạt kết nối'}
                  className={`p-2 border rounded-xl transition-colors text-xs font-semibold ${
                    isConnected
                      ? 'border-red-200 text-red-600 hover:bg-red-50'
                      : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  <LogOut size={14} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Login / Configure Service */}
      {activeModalConnection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                {renderServiceIcon(activeModalConnection.id)}
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Đăng nhập & Kết nối {activeModalConnection.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Hệ thống quản trị danh mục 23 dự án BĐS Stellar
                  </p>
                </div>
              </div>
              <button
                onClick={() => setActiveModalConnection(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex items-center space-x-2 mt-4 bg-slate-100 p-1 rounded-2xl text-xs font-semibold">
              <button
                onClick={() => setModalTab('quick')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  modalTab === 'quick' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Đăng nhập nhanh (SSO)
              </button>
              <button
                onClick={() => setModalTab('qr')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  modalTab === 'qr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Quét mã QR Code
              </button>
              <button
                onClick={() => setModalTab('token')}
                className={`flex-1 py-2 rounded-xl transition-all ${
                  modalTab === 'token' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Cấu hình Token / Webhook
              </button>
            </div>

            {/* Modal Content based on Tab */}
            <div className="mt-5 space-y-4">
              {modalTab === 'quick' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Tài khoản liên kết / Email doanh nghiệp:
                    </label>
                    <input
                      type="text"
                      value={accountInput}
                      onChange={(e) => setAccountInput(e.target.value)}
                      placeholder="Ví dụ: huytung712@stellar.vn hoặc 0988***712"
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-900 font-medium"
                    />
                  </div>

                  <div className="p-3.5 bg-indigo-50/70 border border-indigo-100 rounded-2xl flex items-start space-x-3 text-xs text-indigo-900">
                    <ShieldCheck size={18} className="text-indigo-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold">Xác thực an toàn đa tầng (Enterprise SSO)</p>
                      <p className="text-[11px] text-indigo-700 mt-0.5">
                        Tài khoản được kết nối có quyền gửi cảnh báo tiến độ và đồng bộ dữ liệu bảo mật trực tiếp theo chính sách phân quyền của Quản trị viên Huy Tùng.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {modalTab === 'qr' && (
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200 text-center space-y-3">
                  <div className="w-36 h-36 bg-white p-2.5 rounded-2xl border border-slate-300 shadow-sm flex items-center justify-center">
                    <div className="grid grid-cols-4 gap-1.5 w-full h-full p-1 bg-slate-900 rounded-lg">
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-slate-900 rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-slate-900 rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-slate-900 rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-slate-900 rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                      <div className="bg-slate-900 rounded-xs"></div>
                      <div className="bg-white rounded-xs"></div>
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">
                      Mở ứng dụng {activeModalConnection.name} trên điện thoại
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Dùng tính năng quét mã QR để cấp quyền truy cập tức thì cho Stellar PM.
                    </p>
                  </div>
                </div>
              )}

              {modalTab === 'token' && (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1">
                      Token / API Key / Webhook URL:
                    </label>
                    <input
                      type="text"
                      value={tokenInput}
                      onChange={(e) => setTokenInput(e.target.value)}
                      placeholder="Dán mã Bot Token, App Secret hoặc đường link Webhook..."
                      className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-900 font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Phù hợp cho việc cấu hình Bot Telegram chuyên biệt hoặc Webhook tiếp nhận dữ liệu tự động từ SharePoint.
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                onClick={() => setActiveModalConnection(null)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold transition-colors"
              >
                Hủy bỏ
              </button>
              <button
                onClick={handleSaveConnection}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-indigo-600/20 transition-colors"
              >
                <Check size={14} />
                <span>Lưu & Hoàn tất Đăng nhập</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
