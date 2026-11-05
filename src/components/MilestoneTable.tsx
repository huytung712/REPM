import React, { useState } from 'react';
import { Pencil, TrendingDown, X, AlertTriangle, Save } from 'lucide-react';
import { StellarProject, ProjectMilestone, MILESTONE_STATUSES, MilestoneStatus } from '../types';
import { updateMilestone, isMilestoneOverdue, useDataStore } from '../data/portfolioStore';
import { useStore, canEdit } from '../store';
import { deriveMilestoneStatus, parseVnDate } from '../lib/excelParser';

/** "dd/mm/yyyy" <-> "yyyy-mm-dd" cho ô <input type="date"> */
const toInput = (s?: string) => {
  const d = parseVnDate(s);
  if (!d) return '';
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const fromInput = (s: string) => {
  if (!s) return '';
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
};
/** Độ lệch (tháng, 30 ngày/tháng) = phê duyệt − hiện tại; âm = chậm */
const diffMonths = (planned: string, adjusted: string): number | null => {
  const a = parseVnDate(planned);
  const b = parseVnDate(adjusted);
  if (!a || !b) return null;
  return Math.round(((a.getTime() - b.getTime()) / (30 * 86400000)) * 10) / 10;
};

function statusClass(m: ProjectMilestone, overdue: boolean) {
  if (m.status === 'Đã hoàn thành') return 'bg-emerald-100 text-emerald-800';
  if (overdue) return 'bg-rose-100 text-rose-800';
  if (m.status === 'Chậm tiến độ') return 'bg-amber-100 text-amber-800';
  if (m.status === 'Chưa có dữ liệu') return 'bg-slate-100 text-slate-500';
  return 'bg-blue-50 text-blue-700';
}

export default function MilestoneTable({ project }: { project: StellarProject }) {
  const user = useStore((s) => s.user);
  const source = useDataStore((s) => s.source);
  const editable = canEdit(user) && source === 'firestore';
  const [editing, setEditing] = useState<ProjectMilestone | null>(null);
  const completed = project.milestones.filter((m) => m.status === 'Đã hoàn thành').length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Lộ trình 15 mốc pháp lý &amp; xây dựng</h3>
          <p className="text-xs text-slate-500">
            Ngày phê duyệt so với ngày hiện tại (điều chỉnh). Đánh giá âm = chậm so với phê duyệt.
            {editable ? ' Bấm biểu tượng bút để cập nhật.' : canEdit(user) ? '' : ' Bạn đang ở quyền Chỉ xem.'}
          </p>
        </div>
        <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold">
          {completed}/{project.milestones.length} mốc hoàn thành
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-100/60 text-slate-600 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
            <tr>
              <th className="py-3 px-4 w-12 text-center">TT</th>
              <th className="py-3 px-4 min-w-[200px]">Mốc</th>
              <th className="py-3 px-3 min-w-[100px]">Phê duyệt</th>
              <th className="py-3 px-3 min-w-[100px]">Hiện tại</th>
              <th className="py-3 px-3 min-w-[100px]">Thực tế</th>
              <th className="py-3 px-3 min-w-[100px]">Đánh giá</th>
              <th className="py-3 px-3 min-w-[130px]">Trạng thái</th>
              <th className="py-3 px-4 min-w-[240px]">Ghi chú</th>
              {editable && <th className="py-3 px-3 w-10" />}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {project.milestones.map((m) => {
              const overdue = isMilestoneOverdue(m);
              return (
                <tr key={m.index} className={`hover:bg-slate-50/80 ${overdue ? 'bg-rose-50/30' : ''}`}>
                  <td className="py-3 px-4 text-center font-bold text-slate-400">{m.index}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div>{m.title}</div>
                    <span className="text-[10px] text-slate-400 font-normal">{m.category}</span>
                    {m.subItems && m.subItems.length > 0 && (
                      <ul className="mt-1 space-y-0.5 text-[10px] font-normal text-slate-500">
                        {m.subItems.map((s, i) => (
                          <li key={i}>
                            – {s.title}: {s.plannedDate || '—'} → {s.adjustedDate || '—'}
                          </li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="py-3 px-3 text-slate-600 font-mono">{m.plannedDate || '—'}</td>
                  <td className="py-3 px-3 font-semibold text-slate-900 font-mono">{m.adjustedDate || '—'}</td>
                  <td className="py-3 px-3 font-mono text-emerald-700">{m.actualDate || '—'}</td>
                  <td className="py-3 px-3">
                    {m.evaluationMonths !== null && m.evaluationMonths !== undefined ? (
                      <span
                        className={`inline-flex items-center font-bold font-mono px-2 py-0.5 rounded-full text-[11px] ${
                          m.evaluationMonths < 0
                            ? 'bg-red-50 text-red-700 border border-red-200'
                            : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        }`}
                      >
                        {m.evaluationMonths < 0 && <TrendingDown size={11} className="mr-1" />}
                        {m.evaluationMonths > 0 ? `+${m.evaluationMonths}` : m.evaluationMonths} th
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${statusClass(m, overdue)}`}>
                      {m.status}
                    </span>
                    {overdue && (
                      <span className="mt-1 flex items-center text-[10px] text-rose-700 font-semibold">
                        <AlertTriangle size={10} className="mr-1" /> Quá ngày, chưa ghi nhận hoàn thành
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {m.notes || <span className="text-slate-300">—</span>}
                    {m.updatedBy && (
                      <div className="text-[10px] text-slate-400 mt-1">
                        Sửa bởi {m.updatedBy}
                        {m.updatedAt ? ` · ${new Date(m.updatedAt).toLocaleString('vi-VN')}` : ''}
                      </div>
                    )}
                  </td>
                  {editable && (
                    <td className="py-3 px-3">
                      <button
                        onClick={() => setEditing(m)}
                        className="p-1.5 rounded-lg text-slate-500 hover:bg-indigo-50 hover:text-indigo-700"
                        title="Cập nhật mốc"
                      >
                        <Pencil size={14} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && <MilestoneEditor project={project} milestone={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function MilestoneEditor({
  project,
  milestone,
  onClose,
}: {
  project: StellarProject;
  milestone: ProjectMilestone;
  onClose: () => void;
}) {
  const [planned, setPlanned] = useState(toInput(milestone.plannedDate));
  const [adjusted, setAdjusted] = useState(toInput(milestone.adjustedDate));
  const [actual, setActual] = useState(toInput(milestone.actualDate));
  const [notes, setNotes] = useState(milestone.notes || '');
  const [autoStatus, setAutoStatus] = useState(false);
  const [status, setStatus] = useState<MilestoneStatus>(milestone.status);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const plannedStr = fromInput(planned);
  const adjustedStr = fromInput(adjusted);
  const ev = diffMonths(plannedStr, adjustedStr);
  const effectiveStatus: MilestoneStatus = actual
    ? 'Đã hoàn thành'
    : autoStatus
    ? deriveMilestoneStatus({ plannedDate: plannedStr, adjustedDate: adjustedStr, evaluationMonths: ev, notes })
    : status;

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      await updateMilestone(project.id, milestone.index, {
        plannedDate: plannedStr,
        adjustedDate: adjustedStr,
        actualDate: fromInput(actual),
        evaluationMonths: ev,
        notes,
        status: effectiveStatus,
      });
      onClose();
    } catch (e: any) {
      setError(e?.code === 'permission-denied' ? 'Bạn không có quyền sửa dữ liệu này.' : e?.message || 'Lỗi khi lưu.');
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500';
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 space-y-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] text-slate-500">{project.name}</p>
            <h3 className="font-bold text-slate-900">
              Mốc {milestone.index}. {milestone.title}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <label className="text-xs text-slate-600 space-y-1">
            <span>Ngày phê duyệt</span>
            <input type="date" className={input} value={planned} onChange={(e) => setPlanned(e.target.value)} />
          </label>
          <label className="text-xs text-slate-600 space-y-1">
            <span>Ngày hiện tại (điều chỉnh)</span>
            <input type="date" className={input} value={adjusted} onChange={(e) => setAdjusted(e.target.value)} />
          </label>
          <label className="text-xs text-slate-600 space-y-1">
            <span>Ngày hoàn thành thực tế</span>
            <input type="date" className={input} value={actual} onChange={(e) => setActual(e.target.value)} />
          </label>
        </div>

        <p className="text-xs text-slate-500">
          Đánh giá (tự tính): <b className={ev !== null && ev < 0 ? 'text-red-600' : 'text-slate-800'}>{ev ?? '—'} tháng</b>
        </p>

        <div className="space-y-2">
          <label className="text-xs text-slate-600 block">Trạng thái</label>
          <div className="flex items-center gap-3">
            <select
              className={input}
              value={effectiveStatus}
              disabled={!!actual || autoStatus}
              onChange={(e) => setStatus(e.target.value as MilestoneStatus)}
            >
              {MILESTONE_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-1.5 text-xs text-slate-600 whitespace-nowrap">
              <input type="checkbox" checked={autoStatus} onChange={(e) => setAutoStatus(e.target.checked)} />
              Tự xác định
            </label>
          </div>
          {actual && <p className="text-[11px] text-emerald-700">Có ngày thực tế → trạng thái "Đã hoàn thành".</p>}
        </div>

        <label className="text-xs text-slate-600 space-y-1 block">
          <span>Ghi chú / nguyên nhân</span>
          <textarea rows={3} className={input} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </label>

        {error && <p className="text-xs text-rose-600">{error}</p>}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">
            Huỷ
          </button>
          <button
            onClick={save}
            disabled={saving}
            className="px-4 py-2 text-sm rounded-lg bg-indigo-600 text-white font-semibold hover:bg-indigo-700 disabled:opacity-60 inline-flex items-center gap-1.5"
          >
            <Save size={14} /> {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
    </div>
  );
}
