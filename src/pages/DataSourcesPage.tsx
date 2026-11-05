import DemoNotice from '../components/DemoNotice';
import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  Link as LinkIcon, 
  Sparkles, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  FileSpreadsheet, 
  FileText, 
  File, 
  ExternalLink, 
  Edit3, 
  Check, 
  Trash2, 
  Filter, 
  Search, 
  Layers, 
  Tag as TagIcon, 
  ShieldCheck, 
  AlertTriangle,
  FolderKanban,
  RefreshCw,
  Plus,
  X,
  Bot,
  Cloud,
  Users,
  Eye,
  ArrowRight
} from 'lucide-react';
import { initialDataIntakeItems, INTEGRATED_SYSTEM_TAGS } from '../data/dataIntakeData';
import { DataIntakeItem, DataIntakeTag, DataIntakeStatus } from '../types';
import { MILESTONE_DEFINITIONS } from '../data/stellarData';
import { usePortfolio } from '../data/portfolioStore';
import { analyzeIncomingData } from '../utils/aiIntakeAnalyzer';

export default function DataSourcesPage() {
  const { projects: stellarProjects } = usePortfolio();
  const [items, setItems] = useState<DataIntakeItem[]>(() => {
    try {
      const saved = localStorage.getItem('stellar_data_intake_items');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialDataIntakeItems;
  });

  const [statusFilter, setStatusFilter] = useState<'all' | DataIntakeStatus>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [sourceTypeFilter, setSourceTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Drag and Drop state
  const [isDragging, setIsDragging] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);
  const [aiProcessingMessage, setAiProcessingMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Link Dialog Modal State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [linkNotes, setLinkNotes] = useState('');

  // Admin Edit Modal State
  const [editingItem, setEditingItem] = useState<DataIntakeItem | null>(null);
  const [editProjectId, setEditProjectId] = useState('');
  const [editMilestoneIndex, setEditMilestoneIndex] = useState<number>(2);
  const [editTags, setEditTags] = useState<DataIntakeTag[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [editAdminNotes, setEditAdminNotes] = useState('');

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const saveItems = (newItems: DataIntakeItem[]) => {
    setItems(newItems);
    localStorage.setItem('stellar_data_intake_items', JSON.stringify(newItems));
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processDroppedFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setIsAiProcessing(true);
    setAiProcessingMessage(`Trợ lý AI đang đọc ${files.length} tệp tin và đối chiếu cơ sở dữ liệu 23 dự án...`);

    const newIntakeItems: DataIntakeItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileSizeFormatted = `${(file.size / (1024 * 1024)).toFixed(1)} MB`;
      const extension = file.name.split('.').pop() || 'dat';

      setAiProcessingMessage(`AI đang phân tích: ${file.name} (${i + 1}/${files.length})...`);
      
      const analyzed = await analyzeIncomingData({
        title: file.name,
        sourceType: 'file',
        fileName: file.name,
        fileSize: fileSizeFormatted,
        fileExtension: extension,
        contentSnippet: `Tệp tải lên trực tiếp từ máy trạm (${file.type || extension.toUpperCase()}). Kích thước: ${fileSizeFormatted}.`,
        creatorName: 'Huy Tùng (Admin)'
      });

      newIntakeItems.push(analyzed);
    }

    setIsAiProcessing(false);
    setIsDragging(false);
    saveItems([...newIntakeItems, ...items]);
    showToast(`Trợ lý AI đã phân loại thành công ${newIntakeItems.length} dữ liệu mới. Chờ Admin xác nhận!`);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    await processDroppedFiles(e.dataTransfer.files);
  };

  const handleManualFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processDroppedFiles(e.target.files);
    }
  };

  // Attach Link Handler
  const handleAttachLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUrl.trim()) return;

    setIsAiProcessing(true);
    setAiProcessingMessage('Trợ lý AI đang đọc nội dung liên kết và xác định mốc dự án...');

    let detectedSourceType: 'sharepoint' | 'onedrive' | 'link' = 'link';
    if (linkUrl.includes('sharepoint.com')) detectedSourceType = 'sharepoint';
    else if (linkUrl.includes('onedrive') || linkUrl.includes('1drv.ms')) detectedSourceType = 'onedrive';

    const analyzed = await analyzeIncomingData({
      title: linkTitle.trim() || `Liên kết tài liệu: ${new URL(linkUrl).hostname}`,
      sourceType: detectedSourceType,
      sourceUrl: linkUrl.trim(),
      contentSnippet: linkNotes.trim() || `Liên kết ngoài được đính kèm vào hệ thống. Địa chỉ: ${linkUrl.trim()}`,
      creatorName: 'Huy Tùng (Admin)'
    });

    setIsAiProcessing(false);
    setIsLinkModalOpen(false);
    setLinkUrl('');
    setLinkTitle('');
    setLinkNotes('');

    saveItems([analyzed, ...items]);
    showToast('Trợ lý AI đã lập hồ sơ phân loại cho liên kết. Vui lòng kiểm tra và xác nhận!');
  };

  // Admin Approval
  const handleAdminApprove = (id: string) => {
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const updated = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'approved' as DataIntakeStatus,
          reviewedAt: dateStr,
          reviewedBy: 'Admin Huy Tùng',
          adminNotes: item.adminNotes || 'Admin Huy Tùng đã phê duyệt tích hợp vào hệ thống.'
        };
      }
      return item;
    });

    saveItems(updated);
    showToast('Đã phê duyệt và tích hợp chính thức dữ liệu vào hệ thống dự án!');
  };

  // Admin Reject
  const handleAdminReject = (id: string) => {
    const updated = items.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: 'rejected' as DataIntakeStatus,
          reviewedAt: new Date().toLocaleDateString('vi-VN'),
          reviewedBy: 'Admin Huy Tùng'
        };
      }
      return item;
    });
    saveItems(updated);
    showToast('Đã từ chối tiếp nhận dữ liệu này.');
  };

  // Batch Approve All Pending
  const handleBatchApprove = () => {
    const pendingCount = items.filter(i => i.status === 'pending_review').length;
    if (pendingCount === 0) {
      showToast('Không có dữ liệu nào đang chờ duyệt.');
      return;
    }

    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updated = items.map(item => {
      if (item.status === 'pending_review') {
        return {
          ...item,
          status: 'approved' as DataIntakeStatus,
          reviewedAt: dateStr,
          reviewedBy: 'Admin Huy Tùng',
          adminNotes: 'Admin Huy Tùng duyệt hàng loạt (Batch Approve).'
        };
      }
      return item;
    });

    saveItems(updated);
    showToast(`Admin đã phê duyệt toàn bộ ${pendingCount} dữ liệu đang chờ!`);
  };

  // Open Edit Modal
  const handleOpenEditModal = (item: DataIntakeItem) => {
    setEditingItem(item);
    setEditProjectId(item.finalProjectId || item.aiAnalysis.suggestedProjectId);
    setEditMilestoneIndex(item.finalMilestoneIndex || item.aiAnalysis.suggestedMilestoneIndex || 2);
    setEditTags(item.finalTags || item.aiAnalysis.suggestedTags);
    setEditAdminNotes(item.adminNotes || '');
  };

  // Save Edit & Approve
  const handleSaveEdit = (andApprove: boolean = false) => {
    if (!editingItem) return;

    const project = stellarProjects.find(p => p.id === editProjectId);
    const milestone = MILESTONE_DEFINITIONS.find(m => m.index === editMilestoneIndex);
    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    const updated = items.map(item => {
      if (item.id === editingItem.id) {
        return {
          ...item,
          finalProjectId: editProjectId,
          finalProjectName: project?.name || item.aiAnalysis.suggestedProjectName,
          finalMilestoneIndex: editMilestoneIndex,
          finalMilestoneTitle: milestone?.title || item.aiAnalysis.suggestedMilestoneTitle,
          finalTags: editTags,
          adminNotes: editAdminNotes,
          status: andApprove ? ('approved' as DataIntakeStatus) : item.status,
          reviewedAt: andApprove ? dateStr : item.reviewedAt,
          reviewedBy: andApprove ? 'Admin Huy Tùng' : item.reviewedBy
        };
      }
      return item;
    });

    saveItems(updated);
    setEditingItem(null);
    showToast(andApprove ? 'Đã lưu cấu hình và phê duyệt thành công!' : 'Đã cập nhật phân loại dữ liệu.');
  };

  // Add tag in edit modal
  const handleAddTagInEdit = () => {
    if (!newTagInput.trim()) return;
    const newTag: DataIntakeTag = {
      id: `tag-custom-${Date.now()}`,
      name: newTagInput.trim(),
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      isAiSuggested: false
    };
    setEditTags([...editTags, newTag]);
    setNewTagInput('');
  };

  // Remove tag in edit modal
  const handleRemoveTagInEdit = (tagId: string) => {
    setEditTags(editTags.filter(t => t.id !== tagId));
  };

  // Filtered Items
  const filteredItems = items.filter(item => {
    if (statusFilter !== 'all' && item.status !== statusFilter) return false;
    if (projectFilter !== 'all' && item.finalProjectId !== projectFilter && item.aiAnalysis.suggestedProjectId !== projectFilter) return false;
    if (sourceTypeFilter !== 'all' && item.sourceType !== sourceTypeFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = item.title.toLowerCase().includes(q);
      const matchProject = (item.finalProjectName || item.aiAnalysis.suggestedProjectName).toLowerCase().includes(q);
      const matchTags = item.finalTags.some(t => t.name.toLowerCase().includes(q));
      return matchTitle || matchProject || matchTags;
    }
    return true;
  });

  // Counters
  const totalCount = items.length;
  const pendingCount = items.filter(i => i.status === 'pending_review').length;
  const approvedCount = items.filter(i => i.status === 'approved').length;
  const aiSuggestedTagsCount = items.reduce((acc, curr) => {
    return acc + (curr.finalTags?.filter(t => t.isAiSuggested)?.length || 0);
  }, 0);

  const getSourceIcon = (type: string, ext?: string) => {
    if (type === 'sharepoint') return <Layers size={18} className="text-teal-600" />;
    if (type === 'onedrive') return <Cloud size={18} className="text-blue-600" />;
    if (type === 'link') return <ExternalLink size={18} className="text-indigo-600" />;
    if (ext === 'xlsx' || ext === 'xls') return <FileSpreadsheet size={18} className="text-emerald-600" />;
    if (ext === 'pdf') return <FileText size={18} className="text-rose-600" />;
    return <File size={18} className="text-slate-600" />;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <DemoNotice>
        <b>Bản thử nghiệm.</b> Dữ liệu tiếp nhận trên trang này chỉ lưu trong trình duyệt của bạn (localStorage), chưa đồng bộ cho người
        khác và chưa cập nhật vào dự án. Phân loại AI cần GEMINI_API_KEY trên server. Để cập nhật số liệu chính thức, dùng mục
        <b> Nhập dữ liệu Excel</b>.
      </DemoNotice>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-xl flex items-center space-x-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span className="text-xs font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Admin Role Verification Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl border border-indigo-900/50 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center space-x-1.5">
                <Layers size={13} className="text-indigo-400" />
                <span>Nguồn Dữ Liệu Đầu Vào (Data Intake Hub)</span>
              </span>
              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center space-x-1">
                <ShieldCheck size={13} className="text-emerald-400" />
                <span>Quyền Quản Trị Viên (Admin: Anh Huy Tùng)</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Cổng Tổng Hợp & Phân Loại Dữ Liệu Tự Động
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Dữ liệu đầu vào từ bên ngoài (tệp kéo/thả, liên kết SharePoint, OneDrive, website) được Trợ lý AI đọc, phân tích, đối chiếu logic với 23 dự án và đề xuất thẻ tích hợp. <strong className="text-white font-bold">Admin Huy Tùng giữ quyền xác nhận cuối cùng</strong> trước khi dữ liệu chính thức nạp vào hệ thống.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-2xl text-xs font-bold flex items-center space-x-2 border border-slate-700 transition-colors shadow-sm"
            >
              <LinkIcon size={15} className="text-indigo-400" />
              <span>Đính kèm Link</span>
            </button>
            <button
              onClick={handleBatchApprove}
              disabled={pendingCount === 0}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold flex items-center space-x-2 transition-all shadow-md shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle2 size={15} className="text-emerald-300" />
              <span>Admin Duyệt Hàng Loạt ({pendingCount})</span>
            </button>
          </div>
        </div>

        {/* Stats Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-800/60 rounded-2xl p-3.5 border border-slate-700/60">
            <div className="text-[11px] font-semibold text-slate-400">Tổng dữ liệu nạp</div>
            <div className="text-2xl font-black text-white mt-1">{totalCount}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Files & Liên kết</div>
          </div>
          <div className="bg-amber-500/10 rounded-2xl p-3.5 border border-amber-500/30">
            <div className="text-[11px] font-semibold text-amber-400 flex items-center space-x-1">
              <Clock size={12} />
              <span>Chờ Admin duyệt</span>
            </div>
            <div className="text-2xl font-black text-amber-300 mt-1">{pendingCount}</div>
            <div className="text-[10px] text-amber-300/80 mt-0.5">Cần phê duyệt cuối</div>
          </div>
          <div className="bg-emerald-500/10 rounded-2xl p-3.5 border border-emerald-500/30">
            <div className="text-[11px] font-semibold text-emerald-400 flex items-center space-x-1">
              <CheckCircle2 size={12} />
              <span>Đã tích hợp hệ thống</span>
            </div>
            <div className="text-2xl font-black text-emerald-300 mt-1">{approvedCount}</div>
            <div className="text-[10px] text-emerald-300/80 mt-0.5">Đã vào hồ sơ 23 dự án</div>
          </div>
          <div className="bg-purple-500/10 rounded-2xl p-3.5 border border-purple-500/30">
            <div className="text-[11px] font-semibold text-purple-300 flex items-center space-x-1">
              <Sparkles size={12} />
              <span>Thẻ AI đề xuất mới</span>
            </div>
            <div className="text-2xl font-black text-purple-300 mt-1">{aiSuggestedTagsCount}</div>
            <div className="text-[10px] text-purple-300/80 mt-0.5">Tự động gợi ý bổ sung</div>
          </div>
        </div>
      </div>

      {/* Drag & Drop Intake Zone */}
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-3xl border-2 border-dashed transition-all p-6 sm:p-8 text-center ${
          isDragging 
            ? 'border-indigo-500 bg-indigo-500/10 ring-4 ring-indigo-500/20 scale-[1.005]' 
            : 'border-slate-300 hover:border-indigo-400 bg-white shadow-xs'
        }`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleManualFileSelect} 
          multiple 
          className="hidden" 
          accept=".xlsx,.xls,.pdf,.dwg,.dxf,.doc,.docx,.zip,.png,.jpg"
        />

        <div className="flex flex-col items-center justify-center space-y-3 max-w-xl mx-auto">
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-transform ${
            isDragging ? 'bg-indigo-600 text-white scale-110' : 'bg-indigo-50 text-indigo-600'
          }`}>
            <UploadCloud size={32} className={isDragging ? 'animate-bounce' : ''} />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900">
              Kéo & Thả tệp tin dữ liệu đầu vào vào đây
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hỗ trợ tệp bảng tính <strong>Excel (.xlsx, .xls)</strong>, hồ sơ <strong>PDF</strong>, bản vẽ <strong>CAD (.dwg, .dxf)</strong>, văn bản Word hoặc file nén ZIP.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors"
            >
              <UploadCloud size={14} />
              <span>Chọn tệp tin từ máy tính</span>
            </button>
            <span className="text-xs text-slate-400 font-medium">hoặc</span>
            <button
              onClick={() => setIsLinkModalOpen(true)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors border border-slate-200"
            >
              <LinkIcon size={14} className="text-indigo-600" />
              <span>Đính kèm link SharePoint / OneDrive qua hộp thoại</span>
            </button>
          </div>

          {/* AI Helper Banner */}
          <div className="flex items-center space-x-2 text-[11px] text-indigo-700 bg-indigo-50/70 border border-indigo-100 px-3 py-1.5 rounded-full mt-2">
            <Sparkles size={13} className="text-indigo-600 shrink-0" />
            <span>Trợ lý AI sẽ tự động đọc, trích lược và gán vào đúng 1 trong 23 dự án & 15 mốc pháp lý.</span>
          </div>
        </div>

        {/* AI Scanning Active Overlay */}
        {isAiProcessing && (
          <div className="absolute inset-0 bg-white/95 rounded-3xl backdrop-blur-xs flex flex-col items-center justify-center z-20 space-y-3 p-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center animate-pulse shadow-lg shadow-indigo-600/30">
              <Bot size={28} className="animate-spin" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Trí tuệ nhân tạo đang phân tích dữ liệu</h4>
              <p className="text-xs text-indigo-600 font-medium">{aiProcessingMessage}</p>
            </div>
            <div className="w-48 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="w-full h-full bg-indigo-600 animate-[indeterminate_1.5s_infinite_linear]"></div>
            </div>
          </div>
        )}
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-bold">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap ${
              statusFilter === 'all' 
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs' 
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tất cả ({items.length})
          </button>
          <button
            onClick={() => setStatusFilter('pending_review')}
            className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap flex items-center space-x-1 ${
              statusFilter === 'pending_review' 
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs' 
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100'
            }`}
          >
            <Clock size={12} />
            <span>Chờ Admin duyệt ({pendingCount})</span>
          </button>
          <button
            onClick={() => setStatusFilter('approved')}
            className={`px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap flex items-center space-x-1 ${
              statusFilter === 'approved' 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                : 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 size={12} />
            <span>Đã tích hợp ({approvedCount})</span>
          </button>
        </div>

        {/* Project & Search Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Selector */}
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả 23 Dự án</option>
            {stellarProjects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>

          {/* Source Type Selector */}
          <select
            value={sourceTypeFilter}
            onChange={(e) => setSourceTypeFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 font-medium text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả nguồn</option>
            <option value="file">Tệp tin kéo/thả</option>
            <option value="sharepoint">SharePoint Online</option>
            <option value="onedrive">Microsoft OneDrive</option>
            <option value="link">Liên kết Web/Cổng dịch vụ</option>
          </select>

          {/* Search Input */}
          <div className="relative min-w-[200px]">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên file, thẻ, dự án..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Data Intake Items Feed */}
      <div className="space-y-4">
        {filteredItems.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <InboxIconPlaceholder />
            </div>
            <h4 className="text-sm font-bold text-slate-800">Không tìm thấy dữ liệu nào phù hợp</h4>
            <p className="text-xs text-slate-500">
              Hãy kéo thả file mới hoặc sử dụng nút "Đính kèm Link" để nạp dữ liệu vào hệ thống.
            </p>
          </div>
        ) : (
          filteredItems.map(item => {
            const isPending = item.status === 'pending_review';
            const isApproved = item.status === 'approved';
            const isRejected = item.status === 'rejected';

            return (
              <div 
                key={item.id}
                className={`bg-white rounded-3xl border transition-all p-5 shadow-xs space-y-4 ${
                  isPending 
                    ? 'border-amber-200 bg-amber-50/10' 
                    : isApproved 
                      ? 'border-slate-200 hover:border-indigo-200' 
                      : 'border-slate-200 opacity-60'
                }`}
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                      {getSourceIcon(item.sourceType, item.fileExtension)}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-black text-sm text-slate-900 tracking-tight">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-slate-100 text-slate-600 border border-slate-200">
                          {item.sourceType}
                        </span>
                        {item.fileSize && (
                          <span className="text-[10px] text-slate-500 font-medium">
                            • {item.fileSize}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {item.rawContentSnippet}
                      </p>
                      {item.sourceUrl && (
                        <a 
                          href={item.sourceUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="text-[11px] text-indigo-600 hover:underline flex items-center space-x-1 mt-1 font-medium"
                        >
                          <span className="truncate max-w-md">{item.sourceUrl}</span>
                          <ExternalLink size={10} className="shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="shrink-0">
                    {isPending && (
                      <span className="px-3 py-1 bg-amber-500/15 text-amber-800 border border-amber-300 rounded-full text-xs font-bold flex items-center space-x-1.5">
                        <Clock size={13} className="text-amber-600 animate-pulse" />
                        <span>Chờ Admin Xác Nhận</span>
                      </span>
                    )}
                    {isApproved && (
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center space-x-1.5">
                        <CheckCircle2 size={13} className="text-emerald-600" />
                        <span>Đã Tích Hợp Hệ Thống</span>
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-3 py-1 bg-rose-50 text-rose-700 border border-rose-200 rounded-full text-xs font-bold flex items-center space-x-1.5">
                        <XCircle size={13} className="text-rose-600" />
                        <span>Admin Đã Từ Chối</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* AI Classification & Analysis Box */}
                <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center space-x-1.5 text-indigo-700 font-bold">
                      <Sparkles size={14} className="text-indigo-600" />
                      <span>Trí tuệ nhân tạo AI phân tích & đề xuất phân loại:</span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500 bg-white px-2 py-0.5 rounded-full border border-slate-200">
                      Độ tin cậy: <strong className="text-indigo-600 font-bold">{item.aiAnalysis.confidence}%</strong>
                    </span>
                  </div>

                  {/* Project & Milestone Match */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Thuộc Nhóm Dự Án (23 Dự Án Stellar)
                      </div>
                      <div className="text-sm font-black text-slate-900 mt-1 flex items-center space-x-1.5">
                        <FolderKanban size={15} className="text-indigo-600" />
                        <span>{item.finalProjectName || item.aiAnalysis.suggestedProjectName}</span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                        Khớp Mốc Tiến Độ (15 Mốc Pháp Lý)
                      </div>
                      <div className="text-sm font-black text-slate-900 mt-1 flex items-center space-x-1.5">
                        <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-black flex items-center justify-center">
                          {item.finalMilestoneIndex || item.aiAnalysis.suggestedMilestoneIndex}
                        </span>
                        <span>{item.finalMilestoneTitle || item.aiAnalysis.suggestedMilestoneTitle}</span>
                      </div>
                    </div>
                  </div>

                  {/* Summary & Reasoning */}
                  <div className="text-xs text-slate-600 space-y-1 bg-white p-3 rounded-xl border border-slate-200">
                    <div>
                      <strong className="text-slate-800">Tóm tắt nội dung:</strong> {item.aiAnalysis.summary}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      <strong className="text-slate-700">Logic nhận diện:</strong> {item.aiAnalysis.reasoning}
                    </div>
                  </div>

                  {/* Tags Listing: Integrated Tags + Proposed AI Tags */}
                  <div className="space-y-1.5">
                    <div className="text-[11px] font-bold text-slate-700 flex items-center space-x-1">
                      <TagIcon size={12} className="text-slate-500" />
                      <span>Thẻ gắn kết hệ thống & Thẻ AI tự động đề xuất bổ sung:</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {(item.finalTags || item.aiAnalysis.suggestedTags).map((tag, idx) => (
                        <span
                          key={tag.id || idx}
                          className={`text-xs px-2.5 py-1 rounded-xl border font-bold flex items-center space-x-1 ${
                            tag.isAiSuggested
                              ? 'bg-purple-50 text-purple-800 border-purple-300 ring-1 ring-purple-200'
                              : tag.color || 'bg-slate-100 text-slate-800 border-slate-200'
                          }`}
                        >
                          {tag.isAiSuggested && <Sparkles size={11} className="text-purple-600 animate-pulse" />}
                          <span>{tag.name}</span>
                          {tag.isAiSuggested && (
                            <span className="text-[9px] bg-purple-200/70 text-purple-900 px-1 rounded-sm uppercase tracking-tighter ml-1">
                              Đề xuất mới
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Admin Audit & Action Footer */}
                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500 flex items-center space-x-2">
                    <span>Nạp lúc: {item.createdAt} bởi <strong>{item.createdBy}</strong></span>
                    {item.reviewedAt && (
                      <>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold flex items-center space-x-1">
                          <ShieldCheck size={12} />
                          <span>Duyệt bởi {item.reviewedBy} ({item.reviewedAt})</span>
                        </span>
                      </>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center space-x-1 transition-colors border border-slate-200"
                        >
                          <Edit3 size={13} />
                          <span>Chỉnh sửa đề xuất</span>
                        </button>
                        <button
                          onClick={() => handleAdminReject(item.id)}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors border border-rose-200"
                        >
                          Từ chối
                        </button>
                        <button
                          onClick={() => handleAdminApprove(item.id)}
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md shadow-emerald-600/20 transition-all"
                        >
                          <Check size={14} />
                          <span>Admin Xác Nhận & Tích Hợp</span>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl text-xs font-medium transition-colors border border-slate-200"
                        >
                          Xem chi tiết / Sửa
                        </button>
                        {isApproved && (
                          <span className="text-xs text-emerald-600 font-bold flex items-center space-x-1 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
                            <CheckCircle2 size={13} />
                            <span>Đã tích hợp vào Dự án</span>
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Attach Link Dialog */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <LinkIcon size={16} />
                </div>
                <h3 className="text-base font-black text-slate-900">
                  Đính Kèm Liên Kết Ngoài (SharePoint, OneDrive, Web)
                </h3>
              </div>
              <button 
                onClick={() => setIsLinkModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAttachLink} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Địa chỉ liên kết URL <span className="text-rose-500">*</span>
                </label>
                <input
                  type="url"
                  required
                  placeholder="https://stellarvn-my.sharepoint.com/... hoặc link Google Drive, văn bản..."
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex items-center space-x-2 pt-1 text-[10px] text-slate-400">
                  <span>Gợi ý nhanh:</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setLinkUrl('https://stellarvn-my.sharepoint.com/:x:/g/personal/mystellar_stellar_com_vn/LaiYen_TienDo_2026.xlsx');
                      setLinkTitle('SharePoint Excel: Báo cáo Tiến độ Tuần 23 Dự Án');
                    }}
                    className="text-indigo-600 hover:underline font-semibold"
                  >
                    SharePoint Excel
                  </button>
                  <span>•</span>
                  <button 
                    type="button" 
                    onClick={() => {
                      setLinkUrl('https://stellarvn-my.sharepoint.com/:f:/r/personal/mystellar/OneDrive/BVTC_LaiYen_2026');
                      setLinkTitle('OneDrive Cloud: Thư mục Bản vẽ BVTC Lại Yên');
                    }}
                    className="text-blue-600 hover:underline font-semibold"
                  >
                    OneDrive Folder
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Tiêu đề hồ sơ (Tùy chọn - AI có thể tự đặt)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Tờ trình phê duyệt điều chỉnh quy hoạch 1/500 Lại Yên"
                  value={linkTitle}
                  onChange={(e) => setLinkTitle(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Ghi chú trích dẫn nội dung (Tùy chọn)
                </label>
                <textarea
                  rows={2}
                  placeholder="Nội dung chính của liên kết, cơ quan ban hành, số hiệu văn bản..."
                  value={linkNotes}
                  onChange={(e) => setLinkNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="bg-indigo-50 p-3 rounded-xl border border-indigo-100 flex items-start space-x-2 text-[11px] text-indigo-900">
                <Sparkles size={14} className="text-indigo-600 shrink-0 mt-0.5" />
                <span>
                  Ngay sau khi bấm xác nhận, Trợ lý AI sẽ đọc liên kết, tự động đối chiếu mã 23 dự án, gắn mốc tiến độ và đề xuất các thẻ phân loại để Admin phê duyệt.
                </span>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center space-x-1.5"
                >
                  <Bot size={14} />
                  <span>Trợ Lý AI Phân Tích & Nạp Dữ Liệu</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Admin Edit Classification Dialog */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <Edit3 size={16} />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Phê Duyệt & Hiệu Chỉnh Phân Loại (Admin Huy Tùng)
                  </h3>
                  <p className="text-[11px] text-slate-500">Tùy chỉnh nhóm dự án, mốc pháp lý và bộ thẻ tích hợp</p>
                </div>
              </div>
              <button 
                onClick={() => setEditingItem(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Project Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Dự án trực thuộc (Trong 23 dự án Stellar)
                </label>
                <select
                  value={editProjectId}
                  onChange={(e) => setEditProjectId(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
                >
                  {stellarProjects.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.code}) - {p.location}
                    </option>
                  ))}
                </select>
              </div>

              {/* Milestone Selection */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Mốc tiến độ liên kết (15 Mốc Pháp lý & Kỹ thuật)
                </label>
                <select
                  value={editMilestoneIndex}
                  onChange={(e) => setEditMilestoneIndex(Number(e.target.value))}
                  className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-800"
                >
                  {MILESTONE_DEFINITIONS.map(m => (
                    <option key={m.index} value={m.index}>
                      Mốc {m.index}: {m.title} ({m.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Management */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">
                  Bộ thẻ gán (Thẻ tích hợp hệ thống + Thẻ đề xuất mới)
                </label>
                
                <div className="flex flex-wrap items-center gap-1.5 p-3 bg-slate-50 rounded-2xl border border-slate-200 min-h-[50px]">
                  {editTags.map(t => (
                    <span 
                      key={t.id}
                      className={`text-xs px-2.5 py-1 rounded-xl border font-bold flex items-center space-x-1.5 ${
                        t.isAiSuggested 
                          ? 'bg-purple-100 text-purple-800 border-purple-300' 
                          : t.color || 'bg-slate-200 text-slate-800 border-slate-300'
                      }`}
                    >
                      {t.isAiSuggested && <Sparkles size={11} className="text-purple-600" />}
                      <span>{t.name}</span>
                      <button 
                        type="button" 
                        onClick={() => handleRemoveTagInEdit(t.id)}
                        className="hover:text-rose-600 ml-1"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new tag / quick suggestions */}
                <div className="flex items-center space-x-2 pt-1">
                  <input
                    type="text"
                    placeholder="Nhập tên thẻ mới cần bổ sung..."
                    value={newTagInput}
                    onChange={(e) => setNewTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTagInEdit();
                      }
                    }}
                    className="flex-1 text-xs px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white"
                  />
                  <button
                    type="button"
                    onClick={handleAddTagInEdit}
                    className="px-3 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
                  >
                    <Plus size={13} />
                    <span>Thêm thẻ</span>
                  </button>
                </div>

                {/* Quick Add from integrated list */}
                <div className="pt-1">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">
                    Gợi ý nhanh từ danh mục thẻ có sẵn:
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-24 overflow-y-auto">
                    {INTEGRATED_SYSTEM_TAGS.slice(0, 8).map(tag => {
                      const alreadyAdded = editTags.some(t => t.name === tag.name);
                      if (alreadyAdded) return null;
                      return (
                        <button
                          key={tag.id}
                          type="button"
                          onClick={() => setEditTags([...editTags, { ...tag, isAiSuggested: false }])}
                          className="text-[10px] px-2 py-0.5 bg-white hover:bg-indigo-50 text-slate-700 hover:text-indigo-700 border border-slate-200 rounded-lg transition-colors"
                        >
                          + {tag.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Admin Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  Ý kiến chỉ đạo / Ghi chú của Admin Huy Tùng
                </label>
                <textarea
                  rows={2}
                  placeholder="Ghi chú phân công, yêu cầu rà soát hoặc căn cứ pháp lý phê duyệt..."
                  value={editAdminNotes}
                  onChange={(e) => setEditAdminNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Đóng
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => handleSaveEdit(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
                >
                  Lưu cấu hình
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveEdit(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors shadow-md shadow-emerald-600/20 flex items-center space-x-1.5"
                >
                  <Check size={14} />
                  <span>Lưu & Phê Duyệt Tích Hợp (Admin)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InboxIconPlaceholder() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}
