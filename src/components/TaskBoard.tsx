/**
 * Bảng Kanban công việc của dự án, lưu Firestore (collection "tasks").
 * Kéo thả theo mẫu chuẩn của @hello-pangea/dnd (fork được duy trì của react-beautiful-dnd):
 * https://github.com/hello-pangea/dnd/blob/main/docs/about/examples.md
 */
import React, { useMemo, useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Plus, Trash2, Calendar, User, Flag, X, Save } from 'lucide-react';
import { Task, TaskStatus, TaskPriority, StellarProject } from '../types';
import { useDataStore, createTask, updateTask, deleteTask } from '../data/portfolioStore';
import { useStore, canEdit } from '../store';

const COLUMNS: { id: TaskStatus; title: string; tone: string }[] = [
  { id: 'todo', title: 'Cần làm', tone: 'border-slate-200' },
  { id: 'in-progress', title: 'Đang làm', tone: 'border-blue-200' },
  { id: 'review', title: 'Chờ duyệt', tone: 'border-amber-200' },
  { id: 'done', title: 'Hoàn thành', tone: 'border-emerald-200' },
];

const PRIORITY: Record<TaskPriority, { label: string; cls: string }> = {
  high: { label: 'Cao', cls: 'bg-rose-50 text-rose-700' },
  medium: { label: 'TB', cls: 'bg-amber-50 text-amber-700' },
  low: { label: 'Thấp', cls: 'bg-slate-100 text-slate-600' },
};

const dateToInput = (ms: number | null | undefined) => {
  if (!ms) return '';
  const d = new Date(ms);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const inputToDate = (s: string) => (s ? new Date(s + 'T00:00:00').getTime() : null);

export default function TaskBoard({ project }: { project: StellarProject }) {
  const user = useStore((s) => s.user);
  const editable = canEdit(user);
  const allTasks = useDataStore((s) => s.tasks);
  const tasks = useMemo(() => allTasks.filter((t) => t.projectId === project.id), [allTasks, project.id]);
  const [editing, setEditing] = useState<Task | 'new' | null>(null);
  const [error, setError] = useState('');

  const byColumn = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status).sort((a, b) => (a.order ?? a.createdAt) - (b.order ?? b.createdAt));

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;
    const destStatus = destination.droppableId as TaskStatus;
    const destList = byColumn(destStatus).filter((t) => t.id !== draggableId);
    const before = destList[destination.index - 1];
    const after = destList[destination.index];
    const o = (t?: Task) => t?.order ?? t?.createdAt ?? 0;
    const order = before && after ? (o(before) + o(after)) / 2 : before ? o(before) + 1000 : after ? o(after) - 1000 : Date.now();
    try {
      const statusChanged = destStatus !== source.droppableId;
      await updateTask(
        draggableId,
        { status: destStatus, order },
        statusChanged ? `Chuyển công việc sang "${COLUMNS.find((c) => c.id === destStatus)?.title}"` : undefined,
      );
    } catch (e: any) {
      setError(e?.message || 'Không cập nhật được công việc.');
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="font-bold text-slate-900 text-sm">Công việc của dự án</h3>
          <p className="text-xs text-slate-500">
            {editable ? 'Kéo thả thẻ để đổi trạng thái. Dữ liệu lưu trên Firestore, đồng bộ cho mọi người.' : 'Bạn đang ở quyền Chỉ xem.'}
          </p>
        </div>
        {editable && (
          <button
            onClick={() => setEditing('new')}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700"
          >
            <Plus size={14} /> Thêm công việc
          </button>
        )}
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLUMNS.map((col) => {
            const list = byColumn(col.id);
            return (
              <Droppable droppableId={col.id} key={col.id} isDropDisabled={!editable}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`rounded-xl border ${col.tone} p-3 min-h-[160px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-indigo-50/60' : 'bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2 text-xs font-bold text-slate-700">
                      <span>{col.title}</span>
                      <span className="px-1.5 rounded bg-white border border-slate-200 text-slate-500">{list.length}</span>
                    </div>
                    <div className="space-y-2">
                      {list.map((t, i) => (
                        <React.Fragment key={t.id}>
                        <Draggable draggableId={t.id!} index={i} isDragDisabled={!editable}>
                          {(p, snap) => (
                            <div
                              ref={p.innerRef}
                              {...p.draggableProps}
                              {...p.dragHandleProps}
                              onClick={() => editable && setEditing(t)}
                              className={`bg-white rounded-lg border border-slate-200 p-3 text-xs space-y-1.5 ${
                                snap.isDragging ? 'shadow-lg ring-2 ring-indigo-300' : 'shadow-xs'
                              } ${editable ? 'cursor-pointer hover:border-indigo-300' : ''}`}
                            >
                              <p className={`font-medium text-slate-800 ${t.status === 'done' ? 'line-through text-slate-500' : ''}`}>
                                {t.title}
                              </p>
                              <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                                {t.priority && (
                                  <span className={`px-1.5 py-0.5 rounded font-semibold ${PRIORITY[t.priority].cls}`}>
                                    <Flag size={9} className="inline mr-0.5" />
                                    {PRIORITY[t.priority].label}
                                  </span>
                                )}
                                {t.assigneeId && (
                                  <span className="inline-flex items-center">
                                    <User size={10} className="mr-0.5" />
                                    {t.assigneeId}
                                  </span>
                                )}
                                {t.dueDate && (
                                  <span
                                    className={`inline-flex items-center ${
                                      t.status !== 'done' && t.dueDate < Date.now() ? 'text-rose-600 font-semibold' : ''
                                    }`}
                                  >
                                    <Calendar size={10} className="mr-0.5" />
                                    {new Date(t.dueDate).toLocaleDateString('vi-VN')}
                                  </span>
                                )}
                                {t.milestoneIndex ? <span>Mốc {t.milestoneIndex}</span> : null}
                              </div>
                            </div>
                          )}
                        </Draggable>
                        </React.Fragment>
                      ))}
                      {provided.placeholder}
                    </div>
                  </div>
                )}
              </Droppable>
            );
          })}
        </div>
      </DragDropContext>

      {editing && (
        <TaskEditor
          project={project}
          task={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function TaskEditor({ project, task, onClose }: { project: StellarProject; task: Task | null; onClose: () => void }) {
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [assignee, setAssignee] = useState(task?.assigneeId || '');
  const [due, setDue] = useState(dateToInput(task?.dueDate));
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium');
  const [status, setStatus] = useState<TaskStatus>(task?.status || 'todo');
  const [milestoneIndex, setMilestoneIndex] = useState<number | ''>(task?.milestoneIndex || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const save = async () => {
    if (!title.trim()) {
      setError('Nhập tên công việc.');
      return;
    }
    setSaving(true);
    setError('');
    const data = {
      projectId: project.id,
      title: title.trim(),
      description: description.trim(),
      assigneeId: assignee.trim(),
      dueDate: inputToDate(due),
      priority,
      status,
      milestoneIndex: milestoneIndex === '' ? null : Number(milestoneIndex),
    };
    try {
      if (task?.id) await updateTask(task.id, data, 'Sửa công việc');
      else await createTask(data);
      onClose();
    } catch (e: any) {
      setError(e?.code === 'permission-denied' ? 'Bạn không có quyền sửa dữ liệu này.' : e?.message || 'Lỗi khi lưu.');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!task?.id || !confirm(`Xoá công việc "${task.title}"?`)) return;
    setSaving(true);
    try {
      await deleteTask(task.id);
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Không xoá được.');
      setSaving(false);
    }
  };

  const input = 'w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-indigo-500';
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-5 space-y-3" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900">{task ? 'Sửa công việc' : 'Thêm công việc'}</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-700">
            <X size={18} />
          </button>
        </div>
        <input className={input} placeholder="Tên công việc" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        <textarea className={input} rows={3} placeholder="Mô tả (không bắt buộc)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-slate-600 space-y-1">
            <span>Người phụ trách</span>
            <input className={input} value={assignee} onChange={(e) => setAssignee(e.target.value)} />
          </label>
          <label className="text-xs text-slate-600 space-y-1">
            <span>Hạn hoàn thành</span>
            <input type="date" className={input} value={due} onChange={(e) => setDue(e.target.value)} />
          </label>
          <label className="text-xs text-slate-600 space-y-1">
            <span>Ưu tiên</span>
            <select className={input} value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)}>
              <option value="high">Cao</option>
              <option value="medium">Trung bình</option>
              <option value="low">Thấp</option>
            </select>
          </label>
          <label className="text-xs text-slate-600 space-y-1">
            <span>Trạng thái</span>
            <select className={input} value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}>
              {COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs text-slate-600 space-y-1 col-span-2">
            <span>Gắn với mốc tiến độ</span>
            <select className={input} value={milestoneIndex} onChange={(e) => setMilestoneIndex(e.target.value ? Number(e.target.value) : '')}>
              <option value="">— Không —</option>
              {project.milestones.map((m) => (
                <option key={m.index} value={m.index}>
                  {m.index}. {m.title}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error && <p className="text-xs text-rose-600">{error}</p>}
        <div className="flex justify-between pt-1">
          {task ? (
            <button onClick={remove} disabled={saving} className="inline-flex items-center gap-1 px-3 py-2 text-sm text-rose-600 hover:bg-rose-50 rounded-lg">
              <Trash2 size={14} /> Xoá
            </button>
          ) : (
            <span />
          )}
          <div className="flex gap-2">
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
    </div>
  );
}
