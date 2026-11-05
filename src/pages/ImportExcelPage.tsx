/**
 * Nhập dữ liệu từ file Excel tiến độ (tải về từ SharePoint) — chỉ Quản trị viên.
 * Quy trình: chọn file → chọn sheet tiến độ → xem trước & so sánh thay đổi → ghi vào Firestore.
 */
import React, { useMemo, useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle2, Database } from 'lucide-react';
import { parseWorkbook, listMilestoneSheets, suggestLatestMilestoneSheets, ParseResult } from '../lib/excelParser';
import { usePortfolio, writePortfolio } from '../data/portfolioStore';
import { useStore, isAdmin } from '../store';
import { StellarProject } from '../types';

interface Diff {
  project: StellarProject;
  changes: string[];
}

function diffProjects(oldList: StellarProject[], newList: StellarProject[]): Diff[] {
  const out: Diff[] = [];
  for (const np of newList) {
    const op = oldList.find((p) => p.id === np.id);
    const changes: string[] = [];
    if (!op) {
      out.push({ project: np, changes: ['Dự án mới'] });
      continue;
    }
    for (const k of ['landArea', 'totalUnits', 'totalPopulation', 'density', 'heightFloors', 'totalGfa'] as const) {
      if ((op.specs?.[k] || '') !== (np.specs?.[k] || '')) changes.push(`${k}: "${op.specs?.[k] || ''}" → "${np.specs?.[k] || ''}"`);
    }
    for (const nm of np.milestones) {
      const om = op.milestones?.find((m) => m.index === nm.index);
      if (!om) continue;
      const parts: string[] = [];
      if (om.plannedDate !== nm.plannedDate) parts.push(`phê duyệt ${om.plannedDate || '—'} → ${nm.plannedDate || '—'}`);
      if (om.adjustedDate !== nm.adjustedDate) parts.push(`hiện tại ${om.adjustedDate || '—'} → ${nm.adjustedDate || '—'}`);
      if (om.status !== nm.status) parts.push(`trạng thái "${om.status}" → "${nm.status}"`);
      if (parts.length) changes.push(`Mốc ${nm.index}: ${parts.join(', ')}${om.updatedBy ? ` (đã được ${om.updatedBy} sửa tay — giữ nguyên nếu chọn ô bên dưới)` : ''}`);
    }
    if (changes.length) out.push({ project: np, changes });
  }
  return out;
}

export default function ImportExcelPage() {
  const user = useStore((s) => s.user);
  const { projects: current, source } = usePortfolio();
  const [wb, setWb] = useState<XLSX.WorkBook | null>(null);
  const [fileName, setFileName] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [sheets, setSheets] = useState<string[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [keepManual, setKeepManual] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState('');

  const { result, parseError } = useMemo((): { result: ParseResult | null; parseError: string } => {
    if (!wb) return { result: null, parseError: '' };
    try {
      return { result: parseWorkbook(wb, { milestoneSheets: selected, sourceFile: fileName, sourceUrl }), parseError: '' };
    } catch (e: any) {
      return { result: null, parseError: 'Không đọc được file: ' + (e?.message || e) };
    }
  }, [wb, selected, fileName, sourceUrl]);

  const diffs = useMemo(() => (result ? diffProjects(current, result.projects) : []), [result, current]);

  if (!isAdmin(user)) {
    return <p className="p-8 text-sm text-slate-500">Chỉ Quản trị viên được nhập dữ liệu Excel.</p>;
  }

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    setError('');
    setDone('');
    try {
      const book = XLSX.read(await f.arrayBuffer(), { type: 'array' });
      const ms = listMilestoneSheets(book);
      setWb(book);
      setFileName(f.name);
      setSheets(ms);
      setSelected(suggestLatestMilestoneSheets(book));
    } catch (err: any) {
      setError('Không đọc được file Excel: ' + (err?.message || err));
    }
  };

  const apply = async () => {
    if (!result) return;
    if (!confirm(`Ghi dữ liệu của ${result.projects.length} dự án vào hệ thống?`)) return;
    setBusy(true);
    setError('');
    try {
      await writePortfolio(
        { projects: result.projects, engineeringWorkstreams: result.engineeringWorkstreams, metadata: result.metadata },
        { mode: 'import', keepManualEdits: keepManual },
      );
      setDone(`Đã nhập ${result.projects.length} dự án và ${result.engineeringWorkstreams.length} hạng mục thiết kế.`);
      setWb(null);
    } catch (e: any) {
      setError('Lỗi khi ghi Firestore: ' + (e?.code || e?.message));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Nhập dữ liệu Excel</h1>
        <p className="text-sm text-slate-500 mt-1">
          Tải file Excel tiến độ mới nhất từ SharePoint (File → Tải xuống bản sao) rồi chọn ở đây. Hệ thống đọc sheet <b>CHỈ TIÊU</b>, các sheet
          tiến độ 15 mốc và sheet <b>TỔNG HỢP TIẾN ĐỘ</b>, cho xem trước thay đổi rồi mới ghi.
        </p>
      </div>

      {done && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 flex items-center gap-2">
          <CheckCircle2 size={16} /> {done}
        </div>
      )}
      {(error || parseError) && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error || parseError}</div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
        <label className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-xl py-8 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/40 text-sm text-slate-600">
          <Upload size={18} />
          {fileName ? <span>Đã chọn: <b>{fileName}</b> — chọn file khác</span> : <span>Chọn file .xlsx</span>}
          <input type="file" accept=".xlsx,.xls" className="hidden" onChange={onFile} />
        </label>
        <label className="block text-xs text-slate-600 space-y-1">
          <span>Liên kết file gốc trên SharePoint (không bắt buộc, để lưu vào metadata)</span>
          <input
            className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            placeholder="https://...sharepoint.com/..."
          />
        </label>
      </div>

      {wb && result && (
        <>
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileSpreadsheet size={16} /> Sheet tiến độ 15 mốc
            </h2>
            {sheets.length === 0 ? (
              <p className="text-xs text-amber-700">Không tìm thấy sheet có cấu trúc "TT | Công việc | Dự án...".</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {sheets.map((s) => (
                  <label key={s} className={`px-3 py-1.5 rounded-lg border text-xs cursor-pointer ${selected.includes(s) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white border-slate-300 text-slate-700'}`}>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={selected.includes(s)}
                      onChange={(e) => setSelected(e.target.checked ? [...selected, s] : selected.filter((x) => x !== s))}
                    />
                    {s}
                  </label>
                ))}
              </div>
            )}
            <p className="text-[11px] text-slate-500">
              Mặc định chọn các sheet mới nhất. Nếu một dự án có ở nhiều sheet được chọn, sheet chọn sau ghi đè sheet chọn trước.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              ['Dự án', result.projects.length],
              ['Dự án có dữ liệu tiến độ', result.projects.filter((p) => p.milestones.some((m) => m.status !== 'Chưa có dữ liệu')).length],
              ['Hạng mục thiết kế', result.engineeringWorkstreams.length],
              ['Ngày cập nhật trong file', result.metadata.lastSyncDate || '—'],
            ].map(([k, v]) => (
              <div key={k as string} className="bg-white border border-slate-200 rounded-xl p-4">
                <p className="text-[11px] text-slate-500">{k}</p>
                <p className="text-xl font-bold text-slate-900">{v}</p>
              </div>
            ))}
          </div>

          {result.warnings.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <AlertTriangle size={14} /> Cảnh báo khi đọc file ({result.warnings.length})
              </p>
              <ul className="list-disc pl-5 space-y-0.5">
                {result.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h2 className="font-bold text-sm text-slate-900">
              Thay đổi so với dữ liệu hiện tại {source === 'seed' ? '(dữ liệu khởi tạo)' : ''}: {diffs.length} dự án
            </h2>
            {diffs.length === 0 ? (
              <p className="text-xs text-slate-500">Không có thay đổi.</p>
            ) : (
              <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100">
                {diffs.map((d) => (
                  <details key={d.project.id} className="py-2">
                    <summary className="text-xs font-semibold text-slate-800 cursor-pointer">
                      {d.project.name} — {d.changes.length} thay đổi
                    </summary>
                    <ul className="mt-1 pl-5 list-disc text-[11px] text-slate-600 space-y-0.5">
                      {d.changes.map((c, i) => (
                        <li key={i}>{c}</li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <label className="flex items-start gap-2 text-xs text-slate-700">
              <input type="checkbox" className="mt-0.5" checked={keepManual} onChange={(e) => setKeepManual(e.target.checked)} />
              <span>
                <b>Giữ nguyên các mốc đã sửa tay trên hệ thống</b> (đánh dấu "đã được … sửa tay" trong danh sách thay đổi). Bỏ chọn để ghi đè
                toàn bộ theo Excel; ngày hoàn thành thực tế nhập tay vẫn được giữ.
              </span>
            </label>
            <button
              onClick={apply}
              disabled={busy}
              className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 disabled:opacity-60"
            >
              <Database size={15} /> {busy ? 'Đang ghi...' : 'Ghi vào hệ thống'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
