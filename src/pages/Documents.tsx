/**
 * Sổ đăng ký tài liệu dự án.
 * Tệp gốc nằm ở kho của công ty (SharePoint / OneDrive / Google Drive); ứng dụng lưu metadata + liên kết
 * vào Firestore (collection "documents") để tra cứu theo dự án, hạng mục và mốc tiến độ.
 */
import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, FileSpreadsheet, Image as ImageIcon, File, Search, ExternalLink, Plus, Pencil, Trash2, X, Save, Copy } from 'lucide-react';
import { usePortfolio, useDataStore, createDocument, updateDocument, deleteDocument } from '../data/portfolioStore';
import { useStore, canEdit } from '../store';
import { Document as ProjectDoc } from '../types';

export const DOC_CATEGORIES = [
  'Quy hoạch & Thiết kế',
  'Pháp lý & BCNCKT',
  'Pháp lý & PCCC',
  'Bản vẽ BVTC & Kết cấu',
  'Tiến độ & BOQ',
  'Khảo sát & HTKT',
  'Môi trường (ĐTM/GPMT)',
  'Đất đai & Tài chính',
  'Báo cáo định kỳ',
  'Khác',
];

function detectType(nameOrUrl: string): string {
  const s = nameOrUrl.toLowerCase();
  if (/\.(xlsx?|csv)\b|:x:/.test(s)) return 'excel';
  if (/\.(png|jpe?g|webp|gif)\b/.test(s)) return 'image';
  if (/\.(dwg|dxf|rvt|ifc)\b/.test(s)) return 'cad';
  if (/\.(docx?)\b|:w:/.test(s)) return 'word';
  if (/\.pdf\b|:b:/.test(s)) return 'pdf';
  return 'link';
}

function DocIcon({ type }: { type: string }) {
  if (type === 'pdf') return <FileText className="text-red-500" size={18} />;
  if (type === 'excel') return <FileSpreadsheet className="text-emerald-600" size={18} />;
  if (type === 'image') return <ImageIcon className="text-blue-500" size={18} />;
  return <File className="text-indigo-500" size={18} />;
}

export default function Documents() {
  const { projects } = usePortfolio();
  const documents = useDataStore((s) => s.documents);
  const user = useStore((s) => s.user);
  const editable = canEdit(user);
  const [params, setParams] = useSearchParams();
  const selectedProject = params.get('project') || 'all';
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [editing, setEditing] = useState<ProjectDoc | 'new' | null>(null);
  const [copied, setCopied] = useState('');

  const projectName = (id: string) => projects.find((p) => p.id === id)?.name || id;

  const filteredDocs = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return documents.filter((d) => {
      if (selectedProject !== 'all' && d.projectId !== selectedProject) return false;
      if (selectedCategory !== 'all' && d.category !== selectedCategory) return false;
      if (!q) return true;
      return [d.name, d.category, d.notes, d.version, projectName(d.projectId)].some((x) => (x || '').toLowerCase().includes(q));
    });
  }, [documents, selectedProject, selectedCategory, searchQuery, projects]);

  const copyLink = async (d: ProjectDoc) => {
    try {
      await navigator.clipboard.writeText(d.url);
      setCopied(d.id!);
      setTimeout(() => setCopied(''), 1500);
    } catch {
      prompt('Sao chép liên kết:', d.url);
    }
  };

  const remove = async (d: ProjectDoc) => {
    if (!confirm(`Xoá "${d.name}" khỏi danh mục? (Tệp gốc trên SharePoint/OneDrive không bị xoá)`)) return;
    try {
      await deleteDocument(d.id!);
    } catch (e: any) {
      alert(e?.message || 'Không xoá được.');
    }
  };

  const selectCls = 'w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500';

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-xl text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tài liệu &amp; hồ sơ dự án</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Danh mục tài liệu theo dự án. Tệp gốc lưu trên SharePoint / OneDrive / Google Drive của công ty, hệ thống lưu liên kết và
              thông tin phân loại.
            </p>
          </div>
          {editable && (
            <button
              onClick={() => setEditing('new')}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md"
            >
              <Plus size={15} /> Thêm tài liệu
            </button>
          )}
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm grid grid-cols-1 sm:grid-cols-3 gap-3">
        <label className="text-xs font-bold text-slate-700 space-y-1">
          <span>Dự án</span>
          <select
            value={selectedProject}
            onChange={(e) => setParams(e.target.value === 'all' ? {} : { project: e.target.value })}
            className={selectCls}
          >
            <option value="all">Tất cả dự án ({projects.length})</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.code})
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold text-slate-700 space-y-1">
          <span>Hạng mục</span>
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={selectCls}>
            <option value="all">Tất cả hạng mục</option>
            {DOC_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>
        <label className="text-xs font-bold text-slate-700 space-y-1">
          <span>Tìm kiếm</span>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Tên tài liệu, ghi chú, phiên bản..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </label>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-700">
          {filteredDocs.length} tài liệu
        </div>
        {filteredDocs.length === 0 ? (
          <p className="p-8 text-center text-xs text-slate-500">
            Chưa có tài liệu nào{editable ? '. Bấm "Thêm tài liệu" và dán liên kết SharePoint/OneDrive.' : '.'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4 min-w-[240px]">Tài liệu</th>
                  <th className="py-3 px-3 min-w-[150px]">Dự án</th>
                  <th className="py-3 px-3 min-w-[130px]">Hạng mục</th>
                  <th className="py-3 px-3">Mốc</th>
                  <th className="py-3 px-3">Người thêm</th>
                  <th className="py-3 px-3">Ngày</th>
                  <th className="py-3 px-4 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDocs.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/80">
                    <td className="py-3 px-4">
                      <div className="flex items-start gap-3">
                        <DocIcon type={d.type} />
                        <div className="min-w-0">
                          <a href={d.url} target="_blank" rel="noreferrer" className="font-semibold text-slate-900 hover:text-indigo-700 break-words">
                            {d.name}
                          </a>
                          {(d.version || d.notes) && (
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {d.version && <span className="font-mono mr-2">{d.version}</span>}
                              {d.notes}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 font-medium text-indigo-700">{projectName(d.projectId)}</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium">{d.category}</span>
                    </td>
                    <td className="py-3 px-3 text-slate-600">{d.milestoneIndex || '—'}</td>
                    <td className="py-3 px-3 text-slate-700">{d.uploadedBy}</td>
                    <td className="py-3 px-3 text-slate-500 font-mono">{new Date(d.uploadedAt).toLocaleDateString('vi-VN')}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center justify-center gap-1">
                        <a href={d.url} target="_blank" rel="noreferrer" className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-lg" title="Mở">
                          <ExternalLink size={15} />
                        </a>
                        <button onClick={() => copyLink(d)} className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-lg" title="Sao chép liên kết">
                          {copied === d.id ? <span className="text-[10px] text-emerald-600 font-bold">Đã chép</span> : <Copy size={15} />}
                        </button>
                        {editable && (
                          <>
                            <button onClick={() => setEditing(d)} className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-lg" title="Sửa">
                              <Pencil size={15} />
                            </button>
                            <button onClick={() => remove(d)} className="p-1.5 hover:bg-rose-50 text-slate-600 hover:text-rose-600 rounded-lg" title="Xoá khỏi danh mục">
                              <Trash2 size={15} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editing && (
        <DocEditor
          doc={editing === 'new' ? null : editing}
          defaultProject={selectedProject !== 'all' ? selectedProject : projects[0]?.id || ''}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function DocEditor({ doc, defaultProject, onClose }: { doc: ProjectDoc | null; defaultProject: string; onClose: () => void }) {
  const { projects } = usePortfolio();
  const [name, setName] = useState(doc?.name || '');
  const [url, setUrl] = useState(doc?.url || '');
  const [projectId, setProjectId] = useState(doc?.projectId || defaultProject);
  const [category, setCategory] = useState(doc?.category || DOC_CATEGORIES[0]);
  const [milestoneIndex, setMilestoneIndex] = useState<number | ''>(doc?.milestoneIndex || '');
  const [version, setVersion] = useState(doc?.version || '');
  const [notes, setNotes] = useState(doc?.notes || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const project = projects.find((p) => p.id === projectId);

  const save = async () => {
    if (!name.trim() || !url.trim()) return setError('Nhập tên tài liệu và liên kết.');
    if (!/^https?:\/\//i.test(url.trim())) return setError('Liên kết phải bắt đầu bằng http:// hoặc https://');
    setSaving(true);
    setError('');
    const data = {
      name: name.trim(),
      url: url.trim(),
      projectId,
      category,
      milestoneIndex: milestoneIndex === '' ? null : Number(milestoneIndex),
      version: version.trim(),
      notes: notes.trim(),
      type: detectType(name + ' ' + url),
    };
    try {
      if (doc?.id) await updateDocument(doc.id, data);
      else await createDocument(data);
      onClose();
    } catch (e: any) {
      setError(e?.code === 'permission-denied' ? 'Bạn không có quyền thêm/sửa tài liệu.' : e?.message || 'Lỗi khi lưu.');
    } finally {
      setSaving(false);
    }
  };

  const input = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500';
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">{doc ? 'Sửa tài liệu' : 'Thêm tài liệu'}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        <input className={input} placeholder="Tên tài liệu (ví dụ: QH TMB 1/500 Lại Yên - V3.pdf)" value={name} onChange={(e) => setName(e.target.value)} />
        <input className={input} placeholder="Liên kết SharePoint / OneDrive / Google Drive" value={url} onChange={(e) => setUrl(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-slate-600 space-y-1 col-span-2">
            <span>Dự án</span>
            <select className={input} value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-600 space-y-1">
            <span>Hạng mục</span>
            <select className={input} value={category} onChange={(e) => setCategory(e.target.value)}>
              {DOC_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-600 space-y-1">
            <span>Mốc tiến độ</span>
            <select className={input} value={milestoneIndex} onChange={(e) => setMilestoneIndex(e.target.value ? Number(e.target.value) : '')}>
              <option value="">— Không —</option>
              {project?.milestones.map((m) => (
                <option key={m.index} value={m.index}>
                  {m.index}. {m.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-600 space-y-1">
            <span>Phiên bản</span>
            <input className={input} placeholder="V1, Rev.2..." value={version} onChange={(e) => setVersion(e.target.value)} />
          </label>
          <label className="text-xs text-slate-600 space-y-1">
            <span>Ghi chú</span>
            <input className={input} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </label>
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <div className="flex justify-end gap-2 pt-1">
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
