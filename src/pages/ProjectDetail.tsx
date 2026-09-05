import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProjectById, stellarProjects, engineeringWorkstreams } from '../data/stellarData';
import { StellarProject, Task } from '../types';
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
  const project = getProjectById(id || '') || stellarProjects[0];
  const [activeTab, setActiveTab] = useState<'specs' | 'milestones' | 'design' | 'tasks'>('specs');

  // Interactive local task state for Kanban
  const [tasks, setTasks] = useState<Task[]>([
    { id: 't1', projectId: project.id, title: 'Rà soát hồ sơ quy hoạch TMB và khớp nối HTKT', status: 'done', dueDate: Date.now(), assigneeId: 'KTS. Lê Nam', createdAt: Date.now(), updatedAt: Date.now() },
    { id: 't2', projectId: project.id, title: 'Hoàn thiện hồ sơ báo cáo NCKT và bản vẽ PCCC', status: 'in-progress', dueDate: Date.now() + 86400000 * 5, assigneeId: 'KS. Hoàng Vũ', createdAt: Date.now(), updatedAt: Date.now() },
    { id: 't3', projectId: project.id, title: 'Thẩm định hồ sơ thiết kế cơ sở và chỉ giới đường đỏ', status: 'todo', dueDate: Date.now() + 86400000 * 14, assigneeId: 'QLTK. Trần Hưng', createdAt: Date.now(), updatedAt: Date.now() },
  ]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask: Task = {
      id: 'task_' + Date.now(),
      projectId: project.id,
      title: newTaskTitle.trim(),
      status: 'todo',
      dueDate: Date.now() + 86400000 * 7,
      assigneeId: 'Team Thiết kế',
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
  };

  const handleStatusChange = (taskId: string, newStatus: Task['status']) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
  };

  // Find engineering workstreams for this project
  const projectDesignNotes = useMemo(() => {
    const list: { taskName: string; taskCode: string; notes: string }[] = [];
    engineeringWorkstreams.forEach(ws => {
      const note = ws.projectNotes.find(n => n.projectId === project.id);
      if (note) {
        list.push({
          taskName: ws.name,
          taskCode: ws.code,
          notes: note.notes
        });
      }
    });
    return list;
  }, [project.id]);

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
                {project.location} • Cột số {project.col} trong Sheet CHỈ TIÊU & TIẾN ĐỘ
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
                <span>{completedMilestones}/15 mốc xong</span>
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
                <p className="text-xs text-slate-500">Trích xuất trực tiếp từ Sheet CHỈ TIÊU (cột {project.col})</p>
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

      {/* TAB 2: MILESTONES (15 Mốc Tiến độ) */}
      {activeTab === 'milestones' && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Lộ trình 15 Mốc Pháp lý & Xây dựng</h3>
              <p className="text-xs text-slate-500">So sánh ngày phê duyệt với ngày điều chỉnh Lần 1 (Sheet 26.2.26)</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
                {completedMilestones}/15 Mốc hoàn thành
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/60 text-slate-600 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 w-12 text-center">TT</th>
                  <th className="py-3 px-4 min-w-[200px]">Công việc / Mốc Pháp lý</th>
                  <th className="py-3 px-3 min-w-[120px]">Phê duyệt</th>
                  <th className="py-3 px-3 min-w-[140px]">Hiện tại (Lần 1)</th>
                  <th className="py-3 px-3 min-w-[120px]">Đánh giá (tháng)</th>
                  <th className="py-3 px-3 min-w-[110px]">Trạng thái</th>
                  <th className="py-3 px-4 min-w-[260px]">Ghi chú thực địa / Nguyên nhân</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {project.milestones.map((m) => {
                  const isDelayed = m.status === 'Chậm tiến độ' || (m.evaluationMonths !== null && m.evaluationMonths < 0);
                  const isDone = m.status === 'Đã hoàn thành';

                  return (
                    <tr 
                      key={m.index} 
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isDelayed ? 'bg-amber-50/20' : (isDone ? 'bg-emerald-50/10' : '')
                      }`}
                    >
                      <td className="py-3 px-4 text-center font-bold text-slate-400">
                        {m.index}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div>{m.title}</div>
                        <span className="text-[10px] text-slate-400 font-normal">{m.category}</span>
                      </td>
                      <td className="py-3 px-3 text-slate-600 font-medium font-mono">
                        {m.plannedDate || '—'}
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-900 font-mono">
                        {m.adjustedDate || '—'}
                      </td>
                      <td className="py-3 px-3">
                        {m.evaluationMonths !== null ? (
                          <span className={`inline-flex items-center font-bold font-mono px-2 py-0.5 rounded-full text-[11px] ${
                            m.evaluationMonths < 0
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}>
                            {m.evaluationMonths < 0 ? (
                              <TrendingDown size={11} className="mr-1 text-red-600" />
                            ) : null}
                            {m.evaluationMonths > 0 ? `+${m.evaluationMonths}` : m.evaluationMonths} tháng
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          isDone
                            ? 'bg-emerald-100 text-emerald-800'
                            : isDelayed
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-xs italic">
                        {m.notes || <span className="text-slate-300 not-italic">Đang triển khai đúng kế hoạch</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

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

      {/* TAB 4: TASKS KANBAN */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="font-bold text-slate-900 text-base">Quản lý Công việc & Phối hợp Triển khai</h3>
                <p className="text-xs text-slate-500">Phân công nhiệm vụ theo các mốc tiến độ của dự án</p>
              </div>

              {/* Add Task Form */}
              <form onSubmit={handleAddTask} className="flex items-center space-x-2 w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Thêm nhiệm vụ mới..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 min-w-[240px]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 shadow-sm transition-colors"
                >
                  <Plus size={14} />
                  <span>Thêm</span>
                </button>
              </form>
            </div>

            {/* Kanban Columns */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Todo Column */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between font-bold text-xs text-slate-700 mb-3">
                  <span>CẦN LÀM (TODO)</span>
                  <span className="w-5 h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px]">
                    {tasks.filter(t => t.status === 'todo').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {tasks.filter(t => t.status === 'todo').map((task) => (
                    <div key={task.id} className="bg-white p-3 rounded-lg border border-slate-200 text-xs shadow-xs space-y-2">
                      <p className="font-medium text-slate-800">{task.title}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{task.assigneeId}</span>
                        <button
                          onClick={() => handleStatusChange(task.id!, 'in-progress')}
                          className="text-indigo-600 hover:underline font-medium"
                        >
                          Bắt đầu →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4">
                <div className="flex items-center justify-between font-bold text-xs text-blue-900 mb-3">
                  <span>ĐANG THỰC HIỆN</span>
                  <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-800 flex items-center justify-center text-[10px]">
                    {tasks.filter(t => t.status === 'in-progress').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {tasks.filter(t => t.status === 'in-progress').map((task) => (
                    <div key={task.id} className="bg-white p-3 rounded-lg border border-blue-200 text-xs shadow-xs space-y-2">
                      <p className="font-medium text-slate-800">{task.title}</p>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>{task.assigneeId}</span>
                        <button
                          onClick={() => handleStatusChange(task.id!, 'done')}
                          className="text-emerald-600 hover:underline font-medium"
                        >
                          Hoàn thành ✓
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Done Column */}
              <div className="bg-emerald-50/50 border border-emerald-100 rounded-xl p-4">
                <div className="flex items-center justify-between font-bold text-xs text-emerald-900 mb-3">
                  <span>HOÀN THÀNH</span>
                  <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-[10px]">
                    {tasks.filter(t => t.status === 'done').length}
                  </span>
                </div>
                <div className="space-y-2">
                  {tasks.filter(t => t.status === 'done').map((task) => (
                    <div key={task.id} className="bg-white p-3 rounded-lg border border-emerald-200 text-xs shadow-xs space-y-2">
                      <p className="font-medium text-slate-800 line-through text-slate-500">{task.title}</p>
                      <div className="flex items-center justify-between text-[11px] text-emerald-600 font-semibold">
                        <span>✓ Đã xong</span>
                        <span className="text-slate-400 font-normal">{task.assigneeId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
