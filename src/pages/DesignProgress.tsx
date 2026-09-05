import React, { useState, useMemo } from 'react';
import { engineeringWorkstreams, stellarProjects } from '../data/stellarData';
import { 
  Compass, 
  Search, 
  Filter, 
  ExternalLink, 
  Building2, 
  FileText, 
  Layers, 
  Flame, 
  HardHat, 
  Palette,
  CheckCircle2,
  CalendarDays
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function DesignProgress() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Categorize workstreams based on task name and code
  const categorizedWorkstreams = useMemo(() => {
    return engineeringWorkstreams.map((item) => {
      let category = 'Kỹ thuật chung';
      const name = item.name.toLowerCase();
      if (name.includes('concept') || name.includes('tmb') || name.includes('cảnh quan') || name.includes('facade')) {
        category = 'Concept Kiến trúc & Cảnh quan';
      } else if (name.includes('nội thất') || name.includes('nhà mẫu') || name.includes('vpbh')) {
        category = 'Nội thất & Không gian Mở bán';
      } else if (name.includes('khảo sát') || name.includes('địa chất') || name.includes('địa hình') || name.includes('đấu nối')) {
        category = 'Khảo sát & Đấu nối HTKT';
      } else if (name.includes('bcnckt') || name.includes('tkcs') || name.includes('thẩm tra')) {
        category = 'Hồ sơ BCNCKT & TKCS';
      } else if (name.includes('pccc') || name.includes('cpxd') || name.includes('khởi công') || name.includes('pháp lý')) {
        category = 'Pháp lý, PCCC & Cấp phép XD';
      } else if (name.includes('bvtc') || name.includes('ngầm') || name.includes('thân') || name.includes('boq')) {
        category = 'Bản vẽ BVTC & Dự toán BOQ';
      } else if (name.includes('thầu') || name.includes('tạm ứng') || name.includes('bàn giao')) {
        category = 'Đấu thầu & Quản lý Dự án';
      }
      return { ...item, category };
    });
  }, []);

  const categories = [
    { id: 'all', label: 'Tất cả hạng mục', count: categorizedWorkstreams.length },
    { id: 'Concept Kiến trúc & Cảnh quan', label: 'Concept Kiến trúc & Cảnh quan', count: categorizedWorkstreams.filter(w => w.category === 'Concept Kiến trúc & Cảnh quan').length },
    { id: 'Hồ sơ BCNCKT & TKCS', label: 'Hồ sơ BCNCKT & TKCS', count: categorizedWorkstreams.filter(w => w.category === 'Hồ sơ BCNCKT & TKCS').length },
    { id: 'Pháp lý, PCCC & Cấp phép XD', label: 'PCCC & Cấp phép XD', count: categorizedWorkstreams.filter(w => w.category === 'Pháp lý, PCCC & Cấp phép XD').length },
    { id: 'Bản vẽ BVTC & Dự toán BOQ', label: 'Bản vẽ BVTC & BOQ', count: categorizedWorkstreams.filter(w => w.category === 'Bản vẽ BVTC & Dự toán BOQ').length },
    { id: 'Nội thất & Không gian Mở bán', label: 'Nội thất & Nhà mẫu', count: categorizedWorkstreams.filter(w => w.category === 'Nội thất & Không gian Mở bán').length },
    { id: 'Khảo sát & Đấu nối HTKT', label: 'Khảo sát & HTKT', count: categorizedWorkstreams.filter(w => w.category === 'Khảo sát & Đấu nối HTKT').length },
    { id: 'Đấu thầu & Quản lý Dự án', label: 'Đấu thầu & QLDA', count: categorizedWorkstreams.filter(w => w.category === 'Đấu thầu & Quản lý Dự án').length },
  ];

  const filteredWorkstreams = useMemo(() => {
    return categorizedWorkstreams.filter((item) => {
      const matchCategory = selectedCategory === 'all' || item.category === selectedCategory;
      const matchSearch = !searchQuery || 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.projectNotes.some(n => 
          n.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          n.notes.toLowerCase().includes(searchQuery.toLowerCase())
        );
      const matchProject = selectedProject === 'all' || 
        item.projectNotes.some(n => n.projectId === selectedProject);

      return matchCategory && matchSearch && matchProject;
    });
  }, [categorizedWorkstreams, selectedCategory, searchQuery, selectedProject]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Compass size={180} />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center">
                <Layers size={13} className="mr-1.5" /> Dữ liệu Bảng: TỔNG HỢP TIẾN ĐỘ (Chi tiết hàng tuần)
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium">
                71 Đầu việc Kỹ thuật
              </span>
            </div>
            <a 
              href="https://stellarvn-my.sharepoint.com/:x:/g/personal/mystellar_stellar_com_vn/IQA4GaKibvU-TrLPXR2svPGHAd-LobqrbWKx_e-_aUULN08"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-300 hover:text-white flex items-center space-x-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
            >
              <span>Xem Bảng tổng hợp gốc</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">Theo dõi Tiến độ Thiết kế, Kỹ thuật & Hồ sơ Chi tiết</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Chi tiết nhiệm vụ kỹ thuật của từng bộ môn (Kiến trúc Concept, Cảnh quan, Nội thất, Khảo sát, Đấu nối HTKT, Thẩm định PCCC, BVTC móng hầm, BOQ, Mời thầu) qua các tuần triển khai.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Workstream Categories */}
          <div className="flex flex-wrap items-center gap-1.5">
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedCategory === c.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.label} ({c.count})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm đầu việc, ghi chú..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Project Selector Filter */}
        <div className="flex items-center space-x-3 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium flex items-center">
            <Filter size={13} className="mr-1" /> Lọc theo dự án áp dụng:
          </span>
          <select
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả các dự án ({stellarProjects.length} dự án)</option>
            {stellarProjects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.group})
              </option>
            ))}
          </select>
          <span className="text-slate-400 ml-auto">
            Hiển thị {filteredWorkstreams.length} đầu việc phù hợp
          </span>
        </div>
      </div>

      {/* Workstreams List */}
      <div className="space-y-4">
        {filteredWorkstreams.map((ws) => {
          // Filter notes if a project is selected
          const activeNotes = selectedProject === 'all' 
            ? ws.projectNotes 
            : ws.projectNotes.filter(n => n.projectId === selectedProject);

          if (activeNotes.length === 0) return null;

          return (
            <div key={ws.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Task Header */}
              <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-xs font-mono font-bold">
                    {ws.code || 'NV'}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{ws.name}</h3>
                    <span className="text-xs text-indigo-600 font-medium">{ws.category}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-200/70 text-slate-700 font-medium">
                    {activeNotes.length} Dự án có cập nhật
                  </span>
                </div>
              </div>

              {/* Project Notes Grid */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {activeNotes.map((note, idx) => (
                  <div 
                    key={idx} 
                    className="bg-slate-50/70 border border-slate-200/80 rounded-xl p-4 flex flex-col justify-between hover:border-indigo-300 transition-colors"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Link 
                          to={`/projects/${note.projectId}`}
                          className="font-bold text-xs text-indigo-700 hover:text-indigo-900 hover:underline flex items-center"
                        >
                          <Building2 size={13} className="mr-1 text-slate-400" />
                          {note.projectName}
                        </Link>
                      </div>

                      <div className="text-xs text-slate-700 whitespace-pre-line leading-relaxed bg-white border border-slate-100 p-2.5 rounded-lg">
                        {note.notes}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                      <span className="flex items-center">
                        <CalendarDays size={12} className="mr-1 text-slate-400" />
                        Ghi nhận tiến độ tuần
                      </span>
                      <Link 
                        to={`/projects/${note.projectId}`}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold"
                      >
                        Hồ sơ DA →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
