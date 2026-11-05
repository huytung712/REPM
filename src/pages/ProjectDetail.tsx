import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePortfolio, useDataStore } from '../data/portfolioStore';
import MilestoneTable from '../components/MilestoneTable';
import TaskBoard from '../components/TaskBoard';
import { 
  Building2, 
  Calendar, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Layers, 
  FileText, 
  Compass, 
  ArrowLeft,
  ChevronRight,
  TrendingDown,
  Info,
  Plus,
  ExternalLink,
  Kanban
} from 'lucide-react';

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { projects, workstreams: engineeringWorkstreams, loading, metadata } = usePortfolio();
  const metadataDate = metadata.lastSyncDate || '—';
  const project = projects.find((p) => p.id === id);
  const allTasks = useDataStore((s) => s.tasks);
  const [activeTab, setActiveTab] = useState<'specs' | 'milestones' | 'design' | 'tasks'>('specs');

  // Find engineering workstreams for this project
  const projectDesignNotes = useMemo(() => {
    const list: { taskName: string; taskCode: string; notes: string }[] = [];
    engineeringWorkstreams.forEach(ws => {
      const note = ws.projectNotes.find(n => n.projectId === id);
      if (note) {
        list.push({
          taskName: ws.name,
          taskCode: ws.code,
          notes: note.notes
        });
      }
    });
    return list;
  }, [project?.id, engineeringWorkstreams]);

  if (!project) {
    return (
      <div className="p-8 text-center text-sm text-slate-500">
        {loading ? 'Đang tải dữ liệu...' : (
          <>Không tìm thấy dự án "{id}". <Link to="/projects" className="text-indigo-600 font-semibold">Quay lại danh mục</Link></>
        )}
      </div>
    );
  }

  const completedMilestones = project.milestones.filter(m => m.status === 'Đã hoàn thành').length;
  const delayedMilestones = project.milestones.filter(m => m.status === 'Chậm tiến độ').length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between text-xs text-slate-500">
        <Link to="/projects" className="inline-flex items-center space-x-1 text-indigo-600 hover:text-indigo-800 font-semibold transition-colors">
          <ArrowLeft size={14} />
          <span>Quay lại Danh mục Dự án</span>
        </Link>
        <div className="flex items-center space-x-2">
          <span>Hồ sơ SharePoint:</span>
          <span className="font-mono bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-bold">{project.code}</span>
        </div>
      </div>

      {/* Hero Project Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold uppercase tracking-wider">
                {project.group}
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium">
                {project.status}
              </span>
            </div>

            <a 
              href="https://stellarvn-my.sharepoint.com/:x:/g/personal/mystellar_stellar_com_vn/IQA4GaKibvU-TrLPXR2svPGHAd-LobqrbWKx_e-_aUULN08"
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-300 hover:text-white flex items-center space-x-1 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
            >
              <span>Xem trên Excel SharePoint</span>
              <ExternalLink size={12} />
            </a>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center">
                <Building2 size={28} className="mr-3 text-indigo-400" />
                {project.name}
              </h1>
              <p className="text-sm text-slate-300 flex items-center mt-2">
                <MapPin size={14} className="mr-1.5 text-slate-400" />
                {project.location}{project.ownerName ? ` • Phụ trách: ${project.ownerName}` : ''}
              </p>
            </div>

            {/* Quick Completion Stats */}
            <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-4 min-w-[240px]">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-slate-400">Tiến độ 15 mốc:</span>
                <span className="font-bold text-emerald-400">{project.progress}%</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-indigo-500 to-emerald-500 rounded-full" style={{ width: `${project.progress}%` }} />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                <span>{completedMilestones}/{project.milestones.length} mốc xong</span>
                {delayedMilestones > 0 ? (
                  <span className="text-amber-400 font-semibold">{delayedMilestones} mốc chậm</span>
                ) : (
                  <span className="text-emerald-400 font-semibold">Đúng tiến độ</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex flex-wrap gap-1">
        <button
          onClick={() => setActiveTab('specs')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'specs'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers size={15} />
          <span>1. Chỉ tiêu Quy hoạch & Thiết kế</span>
        </button>

        <button
          onClick={() => setActiveTab('milestones')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'milestones'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar size={15} />
          <span>2. Lộ trình 15 Mốc Tiến độ</span>
          {delayedMilestones > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
              {delayedMilestones}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('design')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'design'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Compass size={15} />
          <span>3. Nhiệm vụ Thiết kế & Ghi chú Tuần</span>
          <span className="px-1.5 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px]">
            {projectDesignNotes.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('tasks')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
            activeTab === 'tasks'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Kanban size={15} />
          <span>4. Bảng Công việc (Kanban)</span>
        </button>
      </div>

      {/* TAB 1: SPECS (Chỉ tiêu Quy hoạch) */}
      {activeTab === 'specs' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Thông số Chỉ tiêu Kiến trúc & Quy hoạch Chi tiết</h3>
                <p className="text-xs text-slate-500">Trích từ sheet CHỈ TIÊU (Excel cập nhật {metadataDate})</p>
              </div>
              <span className="px-3 py-1 bg-slate-100 rounded-lg font-mono text-xs font-bold text-slate-700">
                MÃ DA: {project.code}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium uppercase">1. Diện tích khu đất</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">
                  {project.specs.landArea ? `${project.specs.landArea} m²` : '—'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium uppercase">2. Diện tích xây dựng</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">
                  {project.specs.constructionArea ? `${project.specs.constructionArea} m²` : '—'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium uppercase">3. Mật độ xây dựng (%)</span>
                <span className="text-lg font-bold text-slate-900 mt-1 block">
                  {project.specs.density || '—'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium uppercase">4. Tầng cao tòa TM</span>
                <span className="text-sm font-bold text-slate-900 mt-1 block truncate">
                  {project.specs.heightFloors || (project.specs.basementFloors ? `${project.specs.basementFloors} hầm` : '—')}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium uppercase">5. DT tháp TM/sàn</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {project.specs.towerAreaPerFloor ? `${project.specs.towerAreaPerFloor} m²` : '—'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium uppercase">6. DT đế TM/sàn</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {project.specs.podiumAreaPerFloor ? `${project.specs.podiumAreaPerFloor} m²` : '—'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium uppercase">7. Tổng số căn hộ</span>
                <span className="text-lg font-bold text-indigo-700 mt-1 block">
                  {project.specs.totalUnits || project.specs.villasCount || '—'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium uppercase">8. Tổng dân số</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {project.specs.totalPopulation ? `${project.specs.totalPopulation} người` : '—'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium uppercase">9. Hệ số SDĐ (HSSDD)</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {project.specs.far || '—'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium uppercase">10. Tổng DT sàn nổi</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {project.specs.gfaAboveGround ? `${project.specs.gfaAboveGround} m²` : '—'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium uppercase">11. Tổng DT sàn tính HSSDD</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {project.specs.gfaFARCalculated ? `${project.specs.gfaFARCalculated} m²` : '—'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium uppercase">12. Tổng diện tích hầm</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {project.specs.basementArea ? `${project.specs.basementArea} m²` : '—'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium uppercase">13. Tổng DT sàn (nổi + ngầm)</span>
                <span className="text-base font-bold text-indigo-900 mt-1 block">
                  {project.specs.totalGfa ? `${project.specs.totalGfa} m²` : '—'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium uppercase">14. DT sàn hữu dụng (căn hộ)</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {project.specs.usableArea ? `${project.specs.usableArea} m²` : '—'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium uppercase">15. Số tầng hầm</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {project.specs.basementFloors || '—'}
                </span>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                <span className="text-xs text-slate-400 block font-medium uppercase">16. Số căn liền kề / biệt thự</span>
                <span className="text-base font-bold text-slate-900 mt-1 block">
                  {project.specs.villasCount || '—'}
                </span>
              </div>
            </div>

            {/* Sub-blocks if any */}
            {project.specs.blocks && project.specs.blocks.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <h4 className="font-bold text-sm text-slate-900 mb-3">Cơ cấu phân chia theo từng khối công trình:</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {project.specs.blocks.map((block, idx) => (
                    <div key={idx} className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4 space-y-1.5 text-xs">
                      <div className="font-bold text-indigo-950 text-sm">{block.name}</div>
                      {block.constructionArea && <div className="text-slate-700">DT Xây dựng: <b>{block.constructionArea}</b></div>}
                      {block.density && <div className="text-slate-700">Mật độ XD: <b>{block.density}</b></div>}
                      {block.floors && <div className="text-slate-700">Tầng cao: <b>{block.floors}</b></div>}
                      {block.units && <div className="text-slate-700">Số căn hộ: <b>{block.units} căn</b></div>}
                      {block.population && <div className="text-slate-700">Dân số: <b>{block.population} người</b></div>}
                      {block.towerGfa && <div className="text-slate-700">DT Sàn tháp: <b>{block.towerGfa}</b></div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: MILESTONES (15 mốc tiến độ, sửa được) */}
      {activeTab === 'milestones' && <MilestoneTable project={project} />}

      {/* TAB 3: DESIGN NOTES (Ghi chú Thiết kế & Các tuần) */}
      {activeTab === 'design' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Nhật ký & Nhiệm vụ Thiết kế Hàng tuần</h3>
              <p className="text-xs text-slate-500">Dữ liệu chi tiết từ Sheet TỔNG HỢP TIẾN ĐỘ áp dụng cho dự án này</p>
            </div>
            <span className="text-xs text-indigo-700 font-semibold bg-indigo-50 px-3 py-1 rounded-lg">
              {projectDesignNotes.length} Hạng mục ghi nhận
            </span>
          </div>

          {projectDesignNotes.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              Dự án đang trong giai đoạn tiền khả thi hoặc chưa có phát sinh ghi chú điều phối tuần gần nhất.
            </div>
          ) : (
            <div className="space-y-3">
              {projectDesignNotes.map((item, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200/80 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded font-mono text-xs font-bold">
                      {item.taskCode || 'NV'}
                    </span>
                    <h4 className="font-bold text-sm text-slate-900">{item.taskName}</h4>
                  </div>
                  <div className="bg-white border border-slate-100 rounded-lg p-3 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                    {item.notes}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: TASKS KANBAN (lưu Firestore) */}
      {activeTab === 'tasks' && <TaskBoard project={project} />}
    </div>
  );
}
