import React, { useState, useMemo } from 'react';
import { stellarProjects, portfolioMetadata } from '../data/stellarData';
import { 
  Building2, 
  Layers, 
  MapPin, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  ExternalLink, 
  ArrowUpRight, 
  TrendingUp, 
  FileSpreadsheet,
  ChevronRight,
  Sparkles,
  Search
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { Link } from 'react-router-dom';

const GROUP_COLORS: Record<string, string> = {
  'Cao tầng Hà Nội': '#4f46e5', // indigo-600
  'Thấp tầng': '#059669',     // emerald-600
  'Nhà ở xã hội NOXH': '#d97706', // amber-600
  'Dự án khác': '#64748b'     // slate-500
};

export default function Dashboard() {
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    return stellarProjects.filter((p) => {
      const matchGroup = selectedGroup === 'all' || p.group === selectedGroup;
      const matchSearch = !searchQuery || 
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGroup && matchSearch;
    });
  }, [selectedGroup, searchQuery]);

  // Chart data: Top projects by Land Area
  const landAreaChartData = useMemo(() => {
    return stellarProjects
      .map(p => {
        const raw = p.specs.landArea;
        const num = raw ? parseFloat(String(raw).replace(/,/g, '.').replace(/[^\d.-]/g, '')) : 0;
        return {
          name: p.code,
          fullName: p.name,
          landArea: isNaN(num) ? 0 : Math.round(num),
          group: p.group
        };
      })
      .filter(d => d.landArea > 0)
      .sort((a, b) => b.landArea - a.landArea)
      .slice(0, 10);
  }, []);

  // Chart data: Group distribution
  const groupPieData = useMemo(() => {
    return [
      { name: 'Cao tầng Hà Nội', value: 14, color: '#4f46e5' },
      { name: 'Thấp tầng & Nghỉ dưỡng', value: 4, color: '#059669' },
      { name: 'Nhà ở xã hội (NOXH)', value: 5, color: '#d97706' },
    ];
  }, []);

  // High priority milestones in 2026-2027
  const upcomingMilestones = useMemo(() => {
    const list: { projectName: string; projectId: string; title: string; date: string; status: string; variance?: number | null }[] = [];
    stellarProjects.forEach(p => {
      p.milestones.forEach(m => {
        // Focus on key milestones like khởi công (12), BCNCKT (6), PCCC (7), mở bán (14)
        if ([6, 7, 12, 14].includes(m.index) && m.adjustedDate && m.adjustedDate.includes('/2026')) {
          list.push({
            projectName: p.name,
            projectId: p.id,
            title: m.title,
            date: m.adjustedDate,
            status: m.status,
            variance: m.evaluationMonths
          });
        }
      });
    });
    return list.slice(0, 6);
  }, []);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with SharePoint Link & Metadata */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Building2 size={200} />
        </div>

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center">
                <FileSpreadsheet size={13} className="mr-1.5" /> Dữ liệu trực tiếp từ SharePoint Excel
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium">
                Cập nhật ngày 26/02/2026
              </span>
            </div>

            <a 
              href="https://stellarvn-my.sharepoint.com/:x:/g/personal/mystellar_stellar_com_vn/IQA4GaKibvU-TrLPXR2svPGHAd-LobqrbWKx_e-_aUULN08" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-indigo-300 hover:text-white flex items-center space-x-1.5 bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10 transition-colors"
            >
              <span>Mở File SharePoint gốc</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Bảng Điều Khiển Quản Lý Danh Mục Dự Án STELLAR
          </h1>
          <p className="text-sm text-slate-300 mt-1 max-w-3xl">
            Tích hợp toàn diện cơ sở dữ liệu 10 bảng tính: CHỈ TIÊU quy hoạch kiến trúc, TIẾN ĐỘ pháp lý 15 mốc và TỔNG HỢP TIẾN ĐỘ thiết kế kỹ thuật hàng tuần.
          </p>

          {/* Master KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 mt-6">
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Tổng số Dự án</span>
                <Building2 size={16} className="text-indigo-400" />
              </div>
              <p className="text-2xl font-bold text-white mt-1.5">{portfolioMetadata.totalProjects}</p>
              <span className="text-[11px] text-indigo-300">14 Cao tầng • 4 Thấp tầng • 5 NOXH</span>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Quỹ đất Quy hoạch</span>
                <Layers size={16} className="text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-400 mt-1.5">
                {portfolioMetadata.kpi.totalLandAreaHa} <span className="text-xs font-normal text-slate-400">ha</span>
              </p>
              <span className="text-[11px] text-slate-400">{portfolioMetadata.kpi.totalLandAreaM2.toLocaleString('vi-VN')} m² đất</span>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Tổng Căn hộ & Lô đất</span>
                <TrendingUp size={16} className="text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-blue-400 mt-1.5">
                {portfolioMetadata.kpi.totalUnits.toLocaleString('vi-VN')}
              </p>
              <span className="text-[11px] text-slate-400">Thương mại & Liền kề biệt thự</span>
            </div>

            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Tiến độ Đúng hạn</span>
                <CheckCircle2 size={16} className="text-emerald-400" />
              </div>
              <p className="text-2xl font-bold text-emerald-400 mt-1.5">
                {portfolioMetadata.kpi.onTrackMilestonesPercent}%
              </p>
              <span className="text-[11px] text-emerald-300">Kiểm soát theo đợt duyệt Lần 1</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link 
          to="/projects"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Sheet CHỈ TIÊU</span>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
              Chỉ tiêu Quy hoạch & Thiết kế
            </h3>
            <p className="text-xs text-slate-500">18 chỉ tiêu kỹ thuật chi tiết của từng khối tháp</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Layers size={20} />
          </div>
        </Link>

        <Link 
          to="/master-schedule"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Sheet 26.2.26 & TIẾN ĐỘ</span>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-emerald-600 transition-colors">
              Ma trận 15 Mốc Pháp lý
            </h3>
            <p className="text-xs text-slate-500">So sánh ngày duyệt, ngày điều chỉnh và độ lệch tháng</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Calendar size={20} />
          </div>
        </Link>

        <Link 
          to="/design-progress"
          className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all flex items-center justify-between group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">Sheet TỔNG HỢP TIẾN ĐỘ</span>
            <h3 className="font-bold text-slate-900 text-base group-hover:text-amber-600 transition-colors">
              Nhật ký Kỹ thuật & Thiết kế
            </h3>
            <p className="text-xs text-slate-500">71 đầu việc khảo sát, concept, PCCC, BVTC móng hầm</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-colors">
            <FileSpreadsheet size={20} />
          </div>
        </Link>
      </div>

      {/* Analytics Visualizers: Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Land Area Comparison Bar Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Quy mô Diện tích Khu đất (Top 10 Dự án Lớn nhất)</h3>
                <p className="text-xs text-slate-500">Đơn vị tính: Mét vuông (m²) theo quy hoạch được duyệt</p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                Sheet CHỈ TIÊU
              </span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={landAreaChartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `${Math.round(val / 1000)}k`} />
                  <RechartsTooltip 
                    formatter={(value: any) => [`${Number(value).toLocaleString('vi-VN')} m²`, 'Diện tích đất']}
                    labelFormatter={(label: any) => {
                      const item = landAreaChartData.find(d => d.name === label);
                      return item ? `${item.fullName} (${label})` : label;
                    }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="landArea" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-500">
            <span>Dự án quỹ đất lớn nhất: <b>Lại Yên ({stellarProjects.find(p => p.id === 'lai-yen')?.specs.landArea} m²)</b></span>
            <Link to="/projects" className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center">
              Xem toàn bộ chỉ tiêu →
            </Link>
          </div>
        </div>

        {/* Portfolio Distribution Pie Chart */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Cơ cấu Danh mục Đầu tư</h3>
                <p className="text-xs text-slate-500">Phân bố 23 dự án theo phân khúc</p>
              </div>
            </div>

            <div className="h-52 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={groupPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {groupPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value: any) => [`${value} Dự án`, 'Số lượng']}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-2 text-xs">
              {groupPieData.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-medium">{item.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{item.value} DA</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-center">
            <span className="text-xs text-slate-500">Tập trung trọng điểm tại Hà Nội & các tỉnh vệ tinh</span>
          </div>
        </div>
      </div>

      {/* Upcoming Key Milestones in 2026 */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
              <Clock size={16} />
            </span>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Các Mốc Pháp lý & Xây dựng Trọng điểm trong Năm 2026</h3>
              <p className="text-xs text-slate-500">Kế hoạch phê duyệt điều chỉnh Lần 1 theo Sheet 26.2.26</p>
            </div>
          </div>

          <Link to="/master-schedule" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center">
            Xem toàn bộ 15 mốc →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {upcomingMilestones.map((item, idx) => (
            <div key={idx} className="bg-slate-50/80 border border-slate-200/80 rounded-xl p-3.5 flex flex-col justify-between hover:border-indigo-300 transition-colors">
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-indigo-700">{item.projectName}</span>
                  <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200">
                    {item.date}
                  </span>
                </div>
                <p className="text-xs text-slate-800 font-semibold">{item.title}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                <span className={`px-2 py-0.5 rounded-full font-bold ${
                  item.variance && item.variance < 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {item.variance ? `${item.variance} tháng` : 'Đúng tiến độ'}
                </span>
                <Link to={`/projects/${item.projectId}`} className="text-indigo-600 hover:underline font-medium">
                  Chi tiết DA →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Grid Section with Filter Tabs */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Danh Mục Tất Cả 23 Dự Án</h2>
            <p className="text-xs text-slate-500">Xem nhanh chỉ tiêu kỹ thuật chính và trạng thái</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setSelectedGroup('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedGroup === 'all' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Tất cả (23)
            </button>
            <button
              onClick={() => setSelectedGroup('Cao tầng Hà Nội')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedGroup === 'Cao tầng Hà Nội' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Cao tầng Hà Nội (14)
            </button>
            <button
              onClick={() => setSelectedGroup('Thấp tầng')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedGroup === 'Thấp tầng' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              Thấp tầng (4)
            </button>
            <button
              onClick={() => setSelectedGroup('Nhà ở xã hội NOXH')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                selectedGroup === 'Nhà ở xã hội NOXH' ? 'bg-indigo-600 text-white shadow-xs' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              NOXH (5)
            </button>
          </div>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProjects.map((project) => (
            <div 
              key={project.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-xs font-bold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                    {project.code}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    {project.group}
                  </span>
                </div>

                <Link to={`/projects/${project.id}`}>
                  <h3 className="font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                    {project.name}
                  </h3>
                </Link>

                <p className="text-xs text-slate-500 flex items-center mt-1">
                  <MapPin size={12} className="mr-1 text-slate-400" />
                  {project.location}
                </p>

                {/* Technical Indicators summary */}
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase">Diện tích đất</span>
                    <span className="font-bold text-slate-800">{project.specs.landArea ? `${project.specs.landArea} m²` : '—'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase">Mật độ XD</span>
                    <span className="font-bold text-slate-800">{project.specs.density || '—'}</span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase">Tầng cao / Hầm</span>
                    <span className="font-bold text-slate-800 truncate block">
                      {project.specs.heightFloors || (project.specs.basementFloors ? `${project.specs.basementFloors} hầm` : '—')}
                    </span>
                  </div>
                  <div className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="text-[10px] text-slate-400 block uppercase">Quy mô Căn</span>
                    <span className="font-bold text-indigo-700 block">
                      {project.specs.totalUnits || project.specs.villasCount || '—'}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-500 font-medium">Tiến độ pháp lý:</span>
                    <span className="font-bold text-slate-900">{project.progress}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full" 
                      style={{ width: `${project.progress}%` }} 
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium truncate max-w-[170px]">
                  {project.status}
                </span>
                <Link
                  to={`/projects/${project.id}`}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center space-x-1"
                >
                  <span>Xem hồ sơ</span>
                  <ChevronRight size={14} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
