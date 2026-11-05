import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usePortfolio, useDataStore } from '../data/portfolioStore';

const ENTITY_LABEL: Record<string, string> = {
  project: 'Dự án',
  milestone: 'Mốc tiến độ',
  task: 'Công việc',
  document: 'Tài liệu',
  import: 'Nhập dữ liệu',
  user: 'Người dùng',
};

export default function ActivityPage() {
  const activity = useDataStore((s) => s.activity);
  const { projects } = usePortfolio();
  const [project, setProject] = useState('all');
  const list = useMemo(() => activity.filter((a) => project === 'all' || a.projectId === project), [activity, project]);
  const name = (id?: string) => projects.find((p) => p.id === id)?.name;

  return (
    <div className="space-y-4 pb-12 max-w-5xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nhật ký thay đổi</h1>
          <p className="text-sm text-slate-500">200 thay đổi gần nhất: ai sửa gì, lúc nào. Nhật ký chỉ ghi thêm, không sửa/xoá được.</p>
        </div>
        <select value={project} onChange={(e) => setProject(e.target.value)} className="border border-slate-300 rounded-lg px-3 py-2 text-xs">
          <option value="all">Tất cả dự án</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm divide-y divide-slate-100">
        {list.length === 0 && <p className="p-6 text-center text-xs text-slate-500">Chưa có thay đổi nào.</p>}
        {list.map((a) => (
          <div key={a.id} className="px-4 py-3 text-xs flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-4">
            <span className="text-slate-400 font-mono shrink-0 w-36">{new Date(a.at).toLocaleString('vi-VN')}</span>
            <div className="flex-1 min-w-0">
              <p className="text-slate-800">
                <b>{a.actorName}</b> · <span className="text-slate-500">{ENTITY_LABEL[a.entity] || a.entity}</span> · {a.action}
                {a.projectId && (
                  <>
                    {' '}
                    ·{' '}
                    <Link to={`/projects/${a.projectId}`} className="text-indigo-600 hover:underline">
                      {name(a.projectId) || a.projectId}
                    </Link>
                  </>
                )}
              </p>
              {a.detail && <p className="text-slate-500 mt-0.5 break-words">{a.detail}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
