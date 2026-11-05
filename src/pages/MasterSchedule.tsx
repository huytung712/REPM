import React, { useState, useMemo } from 'react';
import { MILESTONE_DEFINITIONS } from '../data/stellarData';
import { usePortfolio, isMilestoneOverdue } from '../data/portfolioStore';
import { StellarProject } from '../types';
import { 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Search, 
  Filter, 
  ExternalLink,
  ChevronRight,
  TrendingDown,
  ShieldCheck,
  FileSpreadsheet
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MasterSchedule() {
  const { projects: stellarProjects } = usePortfolio();
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [selectedMilestone, setSelectedMilestone] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter projects
  const filteredProjects = useMemo(() => {
    return stellarProjects.filter((p) => {
      const matchGroup = selectedGroup === 'all' || p.group === selectedGroup;
      const matchSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGroup && matchSearch;
    });
  }, [stellarProjects, selectedGroup, searchQuery]);

  // Calculate statistics across all milestones in view
  const stats = useMemo(() => {
    let completed = 0;
    let onTrack = 0;
    let delayed = 0;
    let upcoming = 0;

    filteredProjects.forEach(p => {
      p.milestones.forEach(m => {
        if (selectedMilestone === 'all' || m.index === selectedMilestone) {
          if (m.status === 'Đã hoàn thành') completed++;
          else if (m.status === 'Chậm tiến độ') delayed++;
          else if (m.status === 'Đúng tiến độ') onTrack++;
          else upcoming++;
        }
      });
    });

    return { completed, onTrack, delayed, upcoming, total: completed + onTrack + delayed + upcoming };
  }, [filteredProjects, selectedMilestone]);

  const groups = [
    { id: 'all', label: 'Tất cả dự án', count: stellarProjects.length },
    { id: 'Cao tầng Hà Nội', label: 'Cao tầng Hà Nội', count: stellarProjects.filter(p => p.group === 'Cao tầng Hà Nội').length },
    { id: 'Thấp tầng', label: 'Thấp tầng', count: stellarProjects.filter(p => p.group === 'Thấp tầng').length },
    { id: 'Nhà ở xã hội NOXH', label: 'Nhà ở xã hội NOXH', count: stellarProjects.filter(p => p.group === 'Nhà ở xã hội NOXH').length },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Calendar size={180} />
        </div>
        
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center">
                <FileSpreadsheet size={13} className="mr-1.5" /> Nguồn: sheet tiến độ 15 mốc trong Excel
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium">
                Cập nhật 26/02/2026
              </span>
            </div>
            <a 
              href="https://stellarvn-my.sharepoint.com/:x:/g/personal/mystellar_stellar_com_vn/IQA4GaKibvU-TrLPXR2svPGHAd-LobqrbWKx_e-_aUULN08"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-300 hover:text-white flex items-center space-x-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
            >
              <span>Mở Excel gốc trên SharePoint</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <h1 className="text-2xl font-bold tracking-tight">Ma trận 15 Mốc Tiến độ Pháp lý & Khởi công Tổng thể</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Theo dõi chi tiết ngày phê duyệt kế hoạch, ngày điều chỉnh thực tế, độ trễ tiến độ (tháng) và các ghi chú nguyên nhân thực địa cho toàn bộ danh mục dự án.
          </p>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Đã Hoàn thành</span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
              <p className="text-xl font-bold text-white mt-1">{stats.completed} <span className="text-xs font-normal text-slate-400">mốc</span></p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Đúng tiến độ</span>
                <Clock size={16} className="text-blue-400" />
              </div>
              <p className="text-xl font-bold text-blue-300 mt-1">{stats.onTrack} <span className="text-xs font-normal text-slate-400">mốc</span></p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Chậm tiến độ / Cần xử lý</span>
                <AlertTriangle size={16} className="text-amber-400" />
              </div>
              <p className="text-xl font-bold text-amber-400 mt-1">{stats.delayed} <span className="text-xs font-normal text-slate-400">mốc</span></p>
            </div>
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Đang chuẩn bị / Sắp tới</span>
                <Calendar size={16} className="text-slate-400" />
              </div>
              <p className="text-xl font-bold text-slate-300 mt-1">{stats.upcoming} <span className="text-xs font-normal text-slate-400">mốc</span></p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Filters & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Group Filter Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => setSelectedGroup(g.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  selectedGroup === g.id
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {g.label} ({g.count})
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên dự án, mã..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Milestone Filter Dropdown */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium flex items-center">
            <Filter size={13} className="mr-1" /> Lọc theo mốc trọng điểm:
          </span>
          <select
            value={selectedMilestone}
            onChange={(e) => setSelectedMilestone(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="all">Tất cả 15 mốc tiến độ</option>
            {MILESTONE_DEFINITIONS.map(m => (
              <option key={m.index} value={m.index}>
                Mốc {m.index}: {m.title} ({m.category})
              </option>
            ))}
          </select>

          {/* Quick status highlight */}
          <div className="flex items-center space-x-2 ml-auto text-[11px]">
            <span className="flex items-center text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 mr-1.5 inline-block" /> Đã hoàn thành
            </span>
            <span className="flex items-center text-blue-700">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mr-1.5 inline-block" /> Đúng tiến độ
            </span>
            <span className="flex items-center text-amber-700">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 mr-1.5 inline-block" /> Chậm trễ / Đánh giá âm
            </span>
            <span className="flex items-center text-slate-500">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 mr-1.5 inline-block" /> Chưa có dữ liệu
            </span>
          </div>
        </div>
      </div>

      {/* Projects Milestones Matrix Accordion / Table */}
      <div className="space-y-4">
        {filteredProjects.map((project) => {
          const displayedMilestones = project.milestones.filter(
            m => selectedMilestone === 'all' || m.index === selectedMilestone
          );

          const delayedCount = project.milestones.filter(m => m.status === 'Chậm tiến độ').length;
          const completedCount = project.milestones.filter(m => m.status === 'Đã hoàn thành').length;

          return (
            <div key={project.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              {/* Project Title Bar */}
              <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                    {project.code.substring(0, 3)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-slate-900 text-sm">{project.name}</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-200 text-slate-700">
                        {project.group}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">{project.location}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {delayedCount > 0 && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      <AlertTriangle size={11} className="mr-1 text-amber-600" />
                      {delayedCount} mốc bị chậm
                    </span>
                  )}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <CheckCircle2 size={11} className="mr-1 text-emerald-600" />
                    {completedCount}/15 hoàn thành
                  </span>
                  <Link
                    to={`/projects/${project.id}`}
                    className="inline-flex items-center text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>Chi tiết DA</span>
                    <ChevronRight size={14} className="ml-0.5" />
                  </Link>
                </div>
              </div>

              {/* Milestones Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/60 text-slate-600 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-4 w-12 text-center">TT</th>
                      <th className="py-2.5 px-4 min-w-[200px]">Tên Công việc / Mốc Pháp lý</th>
                      <th className="py-2.5 px-3 min-w-[110px]">Kế hoạch duyệt</th>
                      <th className="py-2.5 px-3 min-w-[120px]">Hiện tại (Lần 1)</th>
                      <th className="py-2.5 px-3 min-w-[110px]">Đánh giá (tháng)</th>
                      <th className="py-2.5 px-3 min-w-[100px]">Trạng thái</th>
                      <th className="py-2.5 px-4 min-w-[240px]">Ghi chú thực địa / Nguyên nhân</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {displayedMilestones.map((m) => {
                      const isDelayed = m.status === 'Chậm tiến độ' || (m.evaluationMonths !== null && m.evaluationMonths < 0);
                      const isDone = m.status === 'Đã hoàn thành';

                      return (
                        <tr 
                          key={m.index} 
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isDelayed ? 'bg-amber-50/20' : (isDone ? 'bg-emerald-50/10' : '')
                          }`}
                        >
                          <td className="py-2.5 px-4 text-center font-bold text-slate-400">
                            {m.index}
                          </td>
                          <td className="py-2.5 px-4 font-semibold text-slate-800">
                            <div>{m.title}</div>
                            <span className="text-[10px] text-slate-400 font-normal">{m.category}</span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 font-medium font-mono">
                            {m.plannedDate || '—'}
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-900 font-mono">
                            {m.adjustedDate || '—'}
                          </td>
                          <td className="py-2.5 px-3">
                            {m.evaluationMonths !== null ? (
                              <span className={`inline-flex items-center font-bold font-mono px-2 py-0.5 rounded-full text-[11px] ${
                                m.evaluationMonths < 0
                                  ? 'bg-red-50 text-red-700 border border-red-200'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}>
                                {m.evaluationMonths < 0 ? (
                                  <TrendingDown size={11} className="mr-1 text-red-600" />
                                ) : null}
                                {m.evaluationMonths > 0 ? `+${m.evaluationMonths}` : m.evaluationMonths} th
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              isDone
                                ? 'bg-emerald-100 text-emerald-800'
                                : isDelayed
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}>
                              {m.status}
                            </span>
                            {isMilestoneOverdue(m) && (
                              <span className="block mt-1 text-[10px] font-semibold text-rose-700">Quá ngày, chưa ghi nhận hoàn thành</span>
                            )}
                          </td>
                          <td className="py-2.5 px-4 text-slate-600 text-xs italic">
                            {m.notes || <span className="text-slate-300 not-italic">—</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
