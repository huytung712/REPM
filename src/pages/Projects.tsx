import React, { useState, useMemo } from 'react';
import { usePortfolio } from '../data/portfolioStore';
import { StellarProject } from '../types';
import { 
  Building, 
  Search, 
  Filter, 
  ExternalLink, 
  Layers, 
  MapPin, 
  CheckCircle2, 
  Maximize2, 
  BarChart3, 
  Grid3X3, 
  Table as TableIcon,
  ChevronRight,
  Sparkles,
  Info,
  X
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Projects() {
  const { projects: stellarProjects } = usePortfolio();
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'matrix'>('cards');
  const [selectedProjectForModal, setSelectedProjectForModal] = useState<StellarProject | null>(null);

  const groups = [
    { id: 'all', label: 'Tất cả dự án', count: stellarProjects.length },
    { id: 'Cao tầng Hà Nội', label: 'Cao tầng Hà Nội', count: stellarProjects.filter(p => p.group === 'Cao tầng Hà Nội').length },
    { id: 'Thấp tầng', label: 'Thấp tầng', count: stellarProjects.filter(p => p.group === 'Thấp tầng').length },
    { id: 'Nhà ở xã hội NOXH', label: 'Nhà ở xã hội NOXH', count: stellarProjects.filter(p => p.group === 'Nhà ở xã hội NOXH').length },
  ];

  const filteredProjects = useMemo(() => {
    return stellarProjects.filter((p) => {
      const matchGroup = selectedGroup === 'all' || p.group === selectedGroup;
      const matchSearch = !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.status.toLowerCase().includes(searchQuery.toLowerCase());
      return matchGroup && matchSearch;
    });
  }, [stellarProjects, selectedGroup, searchQuery]);

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center">
                <Layers size={13} className="mr-1.5" /> Dữ liệu Bảng CHỈ TIÊU & TIẾN ĐỘ
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium">
                {stellarProjects.length} Dự án đã đồng bộ
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Danh mục Dự án & Chỉ tiêu Quy hoạch Kỹ thuật</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Toàn bộ cơ sở dữ liệu quy hoạch, thông số diện tích đất, mật độ, số lượng căn hộ, tầng cao và tiến độ pháp lý từ hệ thống SharePoint Stellar.
            </p>
          </div>

          <div className="flex items-center space-x-2 bg-white/10 p-1.5 rounded-xl border border-white/10">
            <button
              onClick={() => setViewMode('cards')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'cards' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <Grid3X3 size={14} />
              <span>Dạng Thẻ (Cards)</span>
            </button>
            <button
              onClick={() => setViewMode('matrix')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'matrix' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-300 hover:text-white'
              }`}
            >
              <TableIcon size={14} />
              <span>Ma trận Chỉ tiêu (Sheet CHỈ TIÊU)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Control Bar: Filter Tabs & Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Group Filter Buttons */}
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

          {/* Search Field */}
          <div className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm theo tên dự án, mã, vị trí..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* VIEW MODE: CARDS */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Project Header with Badge */}
                <div className="p-5 pb-4 border-b border-slate-100">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {project.code}
                    </span>
                    <span className="text-xs text-slate-500 font-medium px-2 py-0.5 rounded bg-slate-100">
                      {project.group}
                    </span>
                  </div>

                  <Link to={`/projects/${project.id}`}>
                    <h3 className="font-bold text-base text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {project.name}
                    </h3>
                  </Link>

                  <p className="text-xs text-slate-500 flex items-center mt-1">
                    <MapPin size={12} className="mr-1 text-slate-400" />
                    {project.location}
                  </p>
                </div>

                {/* Key Technical Specs Badges */}
                <div className="p-5 space-y-3">
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] block uppercase font-medium">Diện tích đất</span>
                      <span className="font-bold text-slate-800">
                        {project.specs.landArea ? `${project.specs.landArea} m²` : '—'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] block uppercase font-medium">Diện tích XD</span>
                      <span className="font-bold text-slate-800">
                        {project.specs.constructionArea ? `${project.specs.constructionArea} m²` : '—'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] block uppercase font-medium">Mật độ XD</span>
                      <span className="font-bold text-slate-800">
                        {project.specs.density || '—'}
                      </span>
                    </div>
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-slate-400 text-[10px] block uppercase font-medium">Tầng cao / Hầm</span>
                      <span className="font-bold text-slate-800 truncate block">
                        {project.specs.heightFloors || (project.specs.basementFloors ? `${project.specs.basementFloors} hầm` : '—')}
                      </span>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="flex items-center justify-between text-xs py-1 px-1 border-t border-slate-100 text-slate-600">
                    <span>Tổng số căn hộ / Lô:</span>
                    <span className="font-bold text-indigo-700">
                      {project.specs.totalUnits || project.specs.villasCount || 'Đang cập nhật'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs py-1 px-1 border-t border-slate-100 text-slate-600">
                    <span>Hệ số SDĐ (HSSDD):</span>
                    <span className="font-bold text-slate-800">
                      {project.specs.far || '—'}
                    </span>
                  </div>

                  {/* Blocks / Sub-towers tag if any */}
                  {project.specs.blocks && project.specs.blocks.length > 0 && (
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold mb-1">Khối tháp chi tiết</span>
                      <div className="flex flex-wrap gap-1">
                        {project.specs.blocks.map((b, i) => (
                          <span key={i} className="text-[10px] font-medium bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-md border border-indigo-100">
                            {b.name}: {b.constructionArea || b.density}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-slate-500 font-medium">Tiến độ pháp lý:</span>
                      <span className="font-bold text-slate-800">{project.progress}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full" 
                        style={{ width: `${project.progress}%` }} 
                      />
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                      <span className="truncate">{project.status}</span>
                      <span className="text-slate-400">15 mốc tổng thể</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer Actions */}
              <div className="bg-slate-50 px-5 py-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setSelectedProjectForModal(project)}
                  className="text-xs text-slate-600 hover:text-indigo-600 font-semibold flex items-center transition-colors"
                >
                  <Info size={13} className="mr-1" />
                  <span>Xem chỉ tiêu</span>
                </button>

                <Link
                  to={`/projects/${project.id}`}
                  className="text-xs text-white bg-indigo-600 hover:bg-indigo-700 px-3.5 py-1.5 rounded-lg font-semibold flex items-center space-x-1 shadow-sm transition-colors"
                >
                  <span>Hồ sơ chi tiết</span>
                  <ChevronRight size={13} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* VIEW MODE: MATRIX (Full Data Table matching sheet CHỈ TIÊU) */}
      {viewMode === 'matrix' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Bảng Tổng hợp Chỉ tiêu Quy hoạch & Kỹ thuật chi tiết</h3>
              <p className="text-xs text-slate-500">Đầy đủ 18 chỉ tiêu kỹ thuật chính từ Sheet CHỈ TIÊU của file Excel SharePoint</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 sticky left-0 bg-slate-100 z-10 min-w-[180px]">Dự án</th>
                  <th className="py-3 px-3">Mã DA</th>
                  <th className="py-3 px-3">Phân nhóm</th>
                  <th className="py-3 px-3 text-right">DT Khu đất (m²)</th>
                  <th className="py-3 px-3 text-right">DT Xây dựng (m²)</th>
                  <th className="py-3 px-3 text-center">Mật độ XD</th>
                  <th className="py-3 px-4">Tầng cao / Hầm</th>
                  <th className="py-3 px-3 text-right">Tổng số Căn</th>
                  <th className="py-3 px-3 text-right">Dân số (người)</th>
                  <th className="py-3 px-3 text-center">Hệ số SDĐ</th>
                  <th className="py-3 px-3 text-right">Tổng sàn nổi (m²)</th>
                  <th className="py-3 px-3 text-right">Tổng DT hầm (m²)</th>
                  <th className="py-3 px-3 text-right">Tổng DT sàn (m²)</th>
                  <th className="py-3 px-3 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 sticky left-0 bg-white hover:bg-slate-50 z-10 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                      <Link to={`/projects/${p.id}`} className="hover:text-indigo-600 transition-colors">
                        {p.name}
                      </Link>
                    </td>
                    <td className="py-3 px-3 font-mono font-medium text-indigo-700">{p.code}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {p.group}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-slate-800">{p.specs.landArea || '—'}</td>
                    <td className="py-3 px-3 text-right font-medium text-slate-800">{p.specs.constructionArea || '—'}</td>
                    <td className="py-3 px-3 text-center font-bold text-slate-700">{p.specs.density || '—'}</td>
                    <td className="py-3 px-4 font-medium text-slate-700 max-w-xs truncate">{p.specs.heightFloors || '—'}</td>
                    <td className="py-3 px-3 text-right font-bold text-indigo-700">{p.specs.totalUnits || p.specs.villasCount || '—'}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{p.specs.totalPopulation || '—'}</td>
                    <td className="py-3 px-3 text-center font-mono font-bold text-slate-700">{p.specs.far || '—'}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{p.specs.gfaAboveGround || '—'}</td>
                    <td className="py-3 px-3 text-right text-slate-700">{p.specs.basementArea || '—'}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{p.specs.totalGfa || '—'}</td>
                    <td className="py-3 px-3 text-center">
                      <Link
                        to={`/projects/${p.id}`}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold px-2 py-1 bg-indigo-50 rounded text-xs"
                      >
                        Chi tiết
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SPECIFICATIONS INSPECTION MODAL */}
      {selectedProjectForModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{selectedProjectForModal.code}</span>
                <h2 className="text-xl font-bold text-slate-900">{selectedProjectForModal.name}</h2>
                <p className="text-xs text-slate-500">{selectedProjectForModal.location} • {selectedProjectForModal.group}</p>
              </div>
              <button 
                onClick={() => setSelectedProjectForModal(null)}
                className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Core Indicators Grid */}
              <div>
                <h4 className="font-bold text-sm text-slate-900 mb-3 flex items-center">
                  <Layers size={15} className="mr-1.5 text-indigo-600" />
                  Bảng Chỉ tiêu Kỹ thuật & Quy hoạch (Sheet CHỈ TIÊU)
                </h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">1. Diện tích khu đất</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedProjectForModal.specs.landArea ? `${selectedProjectForModal.specs.landArea} m²` : 'Chưa có số liệu'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">2. Diện tích xây dựng</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedProjectForModal.specs.constructionArea ? `${selectedProjectForModal.specs.constructionArea} m²` : 'Chưa có số liệu'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">3. Mật độ xây dựng (%)</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedProjectForModal.specs.density || 'Chưa có số liệu'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">4. Tầng cao công trình</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedProjectForModal.specs.heightFloors || 'Chưa có số liệu'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">5. Tổng số căn hộ / Lô đất</span>
                    <span className="font-bold text-indigo-700 text-sm">{selectedProjectForModal.specs.totalUnits || selectedProjectForModal.specs.villasCount || 'Chưa có số liệu'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">6. Tổng quy mô dân số</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedProjectForModal.specs.totalPopulation ? `${selectedProjectForModal.specs.totalPopulation} người` : 'Chưa có số liệu'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">7. Hệ số sử dụng đất (HSSDD)</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedProjectForModal.specs.far || 'Chưa có số liệu'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">8. Tổng DT sàn XD nổi</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedProjectForModal.specs.gfaAboveGround ? `${selectedProjectForModal.specs.gfaAboveGround} m²` : 'Chưa có số liệu'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">9. Tổng diện tích hầm</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedProjectForModal.specs.basementArea ? `${selectedProjectForModal.specs.basementArea} m²` : 'Chưa có số liệu'}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                    <span className="text-slate-400 block text-[11px]">10. Tổng DT sàn (nổi + ngầm)</span>
                    <span className="font-bold text-slate-900 text-sm">{selectedProjectForModal.specs.totalGfa ? `${selectedProjectForModal.specs.totalGfa} m²` : 'Chưa có số liệu'}</span>
                  </div>
                </div>
              </div>

              {/* Sub-blocks breakdown */}
              {selectedProjectForModal.specs.blocks && selectedProjectForModal.specs.blocks.length > 0 && (
                <div>
                  <h4 className="font-bold text-sm text-slate-900 mb-2">Chi tiết cơ cấu các khối công trình:</h4>
                  <div className="space-y-2">
                    {selectedProjectForModal.specs.blocks.map((b, idx) => (
                      <div key={idx} className="bg-indigo-50/60 border border-indigo-100 p-3 rounded-xl text-xs flex items-center justify-between">
                        <span className="font-bold text-indigo-900">{b.name}</span>
                        <div className="space-x-3 text-slate-700">
                          {b.constructionArea && <span>DTXD: <b>{b.constructionArea}</b></span>}
                          {b.density && <span>Mật độ: <b>{b.density}</b></span>}
                          {b.units && <span>Số căn: <b>{b.units}</b></span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center justify-end space-x-3">
              <button
                onClick={() => setSelectedProjectForModal(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Đóng
              </button>
              <Link
                to={`/projects/${selectedProjectForModal.id}`}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
              >
                Mở toàn bộ hồ sơ dự án →
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
