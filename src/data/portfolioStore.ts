/**
 * Kho dữ liệu dùng chung (Zustand) đồng bộ thời gian thực với Firestore.
 *
 * Collections:
 *   projects/{id}      — dự án + 15 mốc tiến độ (mảng nhúng)
 *   workstreams/{id}   — hạng mục thiết kế/kỹ thuật theo tuần
 *   tasks/{id}         — công việc Kanban
 *   documents/{id}     — danh mục tài liệu (liên kết)
 *   activity/{id}      — nhật ký thay đổi (chỉ ghi thêm)
 *   meta/portfolio     — thông tin lần nhập Excel gần nhất
 *
 * Khi Firestore chưa có dữ liệu, ứng dụng hiển thị dữ liệu khởi tạo đóng gói sẵn
 * (src/data/stellarPortfolio.json, chỉ đọc) và quản trị viên có thể bấm "Khởi tạo dữ liệu".
 */
import { useMemo } from 'react';
import { create } from 'zustand';
import {
  collection,
  doc,
  onSnapshot,
  writeBatch,
  updateDoc,
  addDoc,
  deleteDoc,
  setDoc,
  query,
  orderBy,
  limit,
  Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useStore } from '../store';
import seed from './stellarPortfolio.json';
import {
  StellarProject,
  EngineeringWorkstream,
  PortfolioMetadata,
  ProjectMilestone,
  Task,
  Document as ProjectDocument,
  ActivityLog,
} from '../types';
import { computePortfolioKpi, computeProgress, computeProjectStatus, deriveMilestoneStatus } from '../lib/excelParser';

type Source = 'loading' | 'firestore' | 'seed';

interface DataState {
  source: Source;
  error: string | null;
  projects: StellarProject[];
  workstreams: EngineeringWorkstream[];
  tasks: Task[];
  documents: ProjectDocument[];
  activity: ActivityLog[];
  meta: PortfolioMetadata | null;
}

const seedData = seed as unknown as {
  metadata: PortfolioMetadata;
  projects: StellarProject[];
  engineeringWorkstreams: EngineeringWorkstream[];
};

export const useDataStore = create<DataState>(() => ({
  source: 'loading',
  error: null,
  projects: [],
  workstreams: [],
  tasks: [],
  documents: [],
  activity: [],
  meta: null,
}));

const sortProjects = (list: StellarProject[]) => {
  const order = new Map(seedData.projects.map((p, i) => [p.id, i]));
  return [...list].sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999) || a.name.localeCompare(b.name));
};

let unsubs: Unsubscribe[] = [];

export function stopDataSync() {
  unsubs.forEach((u) => u());
  unsubs = [];
  useDataStore.setState({ source: 'loading', projects: [], workstreams: [], tasks: [], documents: [], activity: [], meta: null });
}

/** Bắt đầu lắng nghe Firestore (gọi sau khi đăng nhập) */
export function startDataSync() {
  stopDataSync();
  const onError = (what: string) => (err: any) => {
    console.error(`Firestore ${what}:`, err);
    useDataStore.setState({ error: `Không đọc được ${what}: ${err?.code || err?.message}` });
  };

  unsubs.push(
    onSnapshot(
      collection(db, 'projects'),
      (snap) => {
        if (snap.empty) {
          useDataStore.setState({
            source: 'seed',
            projects: seedData.projects,
            workstreams: seedData.engineeringWorkstreams,
            meta: seedData.metadata,
          });
          return;
        }
        const projects = sortProjects(snap.docs.map((d) => ({ ...(d.data() as StellarProject), id: d.id })));
        useDataStore.setState({ source: 'firestore', projects, error: null });
      },
      onError('danh sách dự án'),
    ),
  );
  unsubs.push(
    onSnapshot(
      collection(db, 'workstreams'),
      (snap) => {
        if (snap.empty) return;
        const list = snap.docs
          .map((d) => ({ ...(d.data() as EngineeringWorkstream), id: d.id }))
          .sort((a, b) => Number(a.id.replace(/\D/g, '')) - Number(b.id.replace(/\D/g, '')));
        useDataStore.setState({ workstreams: list });
      },
      onError('hạng mục thiết kế'),
    ),
  );
  unsubs.push(
    onSnapshot(
      collection(db, 'tasks'),
      (snap) => {
        const tasks = snap.docs
          .map((d) => ({ ...(d.data() as Task), id: d.id }))
          .sort((a, b) => (a.order ?? a.createdAt) - (b.order ?? b.createdAt));
        useDataStore.setState({ tasks });
      },
      onError('công việc'),
    ),
  );
  unsubs.push(
    onSnapshot(
      collection(db, 'documents'),
      (snap) => {
        const documents = snap.docs
          .map((d) => ({ ...(d.data() as ProjectDocument), id: d.id }))
          .sort((a, b) => b.uploadedAt - a.uploadedAt);
        useDataStore.setState({ documents });
      },
      onError('tài liệu'),
    ),
  );
  unsubs.push(
    onSnapshot(
      query(collection(db, 'activity'), orderBy('at', 'desc'), limit(200)),
      (snap) => {
        useDataStore.setState({ activity: snap.docs.map((d) => ({ ...(d.data() as ActivityLog), id: d.id })) });
      },
      onError('nhật ký'),
    ),
  );
  unsubs.push(
    onSnapshot(
      doc(db, 'meta', 'portfolio'),
      (snap) => {
        if (snap.exists()) useDataStore.setState({ meta: snap.data() as PortfolioMetadata });
      },
      onError('metadata'),
    ),
  );
}

// ---------------------------------------------------------------------------
// Hooks đọc dữ liệu
// ---------------------------------------------------------------------------
export function usePortfolio() {
  const projects = useDataStore((s) => s.projects);
  const workstreams = useDataStore((s) => s.workstreams);
  const meta = useDataStore((s) => s.meta);
  const source = useDataStore((s) => s.source);
  const error = useDataStore((s) => s.error);

  const metadata = useMemo<PortfolioMetadata>(() => {
    const base = meta || seedData.metadata;
    return {
      ...base,
      totalProjects: projects.length,
      groups: (['Cao tầng Hà Nội', 'Thấp tầng', 'Nhà ở xã hội NOXH'] as const).map((g) => ({
        name: g,
        count: projects.filter((p) => p.group === g).length,
      })),
      kpi: computePortfolioKpi(projects),
    };
  }, [projects, meta]);

  return { projects, workstreams, metadata, source, error, loading: source === 'loading' };
}

export function useProject(id: string | undefined) {
  const projects = useDataStore((s) => s.projects);
  return projects.find((p) => p.id === id);
}

/** Mốc đã qua ngày (điều chỉnh/kế hoạch) nhưng chưa đánh dấu hoàn thành */
export function isMilestoneOverdue(m: ProjectMilestone, today = new Date()): boolean {
  if (m.status === 'Đã hoàn thành' || m.status === 'Chưa có dữ liệu') return false;
  const s = m.adjustedDate || m.plannedDate;
  const mt = s?.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!mt) return false;
  const d = new Date(Number(mt[3]), Number(mt[2]) - 1, Number(mt[1]));
  return d.getTime() < new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
}

// ---------------------------------------------------------------------------
// Ghi dữ liệu
// ---------------------------------------------------------------------------
function actor() {
  const u = useStore.getState().user;
  if (!u) throw new Error('Bạn cần đăng nhập.');
  return u;
}

function assertFirestore() {
  if (useDataStore.getState().source !== 'firestore') {
    throw new Error('Dữ liệu chưa được khởi tạo trên Firestore. Quản trị viên cần bấm "Khởi tạo dữ liệu" trước.');
  }
}

async function logActivity(entry: Omit<ActivityLog, 'id' | 'at' | 'actorUid' | 'actorName'>) {
  const u = actor();
  try {
    await addDoc(collection(db, 'activity'), {
      ...entry,
      at: Date.now(),
      actorUid: u.uid,
      actorName: u.displayName || u.email,
    });
  } catch (e) {
    console.warn('Không ghi được nhật ký:', e);
  }
}

/** Loại bỏ undefined (Firestore không chấp nhận) */
function clean<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

const BATCH_LIMIT = 450;
async function commitInChunks(ops: ((b: ReturnType<typeof writeBatch>) => void)[]) {
  for (let i = 0; i < ops.length; i += BATCH_LIMIT) {
    const batch = writeBatch(db);
    ops.slice(i, i + BATCH_LIMIT).forEach((op) => op(batch));
    await batch.commit();
  }
}

/**
 * Ghi toàn bộ danh mục (khởi tạo hoặc nhập Excel).
 * keepManualEdits = true : mốc đã được sửa tay trên hệ thống (có updatedBy) được giữ nguyên, không bị Excel ghi đè.
 * keepManualEdits = false: toàn bộ mốc lấy theo Excel (ngày thực tế nhập tay vẫn được giữ vì Excel không có cột này).
 */
export async function writePortfolio(
  data: { projects: StellarProject[]; engineeringWorkstreams: EngineeringWorkstream[]; metadata: PortfolioMetadata },
  opts: { mode: 'seed' | 'import'; keepManualEdits?: boolean } = { mode: 'seed' },
) {
  const u = actor();
  const now = Date.now();
  const existing = new Map(useDataStore.getState().source === 'firestore' ? useDataStore.getState().projects.map((p) => [p.id, p]) : []);

  const ops: ((b: ReturnType<typeof writeBatch>) => void)[] = [];
  for (const p of data.projects) {
    const prev = existing.get(p.id);
    let milestones = p.milestones;
    if (prev) {
      milestones = p.milestones.map((m) => {
        const old = prev.milestones?.find((x) => x.index === m.index);
        if (!old) return m;
        if (opts.keepManualEdits && old.updatedBy) return old;
        return old.actualDate ? { ...m, actualDate: old.actualDate, status: 'Đã hoàn thành' as const } : m;
      });
    }
    const merged: StellarProject = {
      ...p,
      ownerName: prev?.ownerName || p.ownerName || '',
      description: prev?.description || p.description || '',
      milestones,
      status: computeProjectStatus(milestones),
      progress: computeProgress(milestones),
      updatedAt: now,
      updatedBy: u.displayName || u.email,
    };
    ops.push((b) => b.set(doc(db, 'projects', p.id), clean(merged)));
  }
  for (const w of data.engineeringWorkstreams) {
    ops.push((b) => b.set(doc(db, 'workstreams', w.id), clean(w)));
  }
  ops.push((b) =>
    b.set(
      doc(db, 'meta', 'portfolio'),
      clean({ ...data.metadata, importedBy: u.displayName || u.email, importedAt: now }),
    ),
  );
  await commitInChunks(ops);
  await logActivity({
    entity: 'import',
    action: opts.mode === 'seed' ? 'Khởi tạo dữ liệu' : 'Nhập dữ liệu Excel',
    detail: `${data.projects.length} dự án, ${data.engineeringWorkstreams.length} hạng mục; nguồn: ${data.metadata.sourceFile || 'dữ liệu đóng gói'}`,
  });
}

export async function seedFromBundledData() {
  await writePortfolio(
    { projects: seedData.projects, engineeringWorkstreams: seedData.engineeringWorkstreams, metadata: seedData.metadata },
    { mode: 'seed' },
  );
}

export async function updateProjectInfo(projectId: string, patch: Partial<Pick<StellarProject, 'name' | 'location' | 'description' | 'ownerName' | 'code'>>) {
  assertFirestore();
  const u = actor();
  await updateDoc(doc(db, 'projects', projectId), clean({ ...patch, updatedAt: Date.now(), updatedBy: u.displayName || u.email }));
  await logActivity({ entity: 'project', projectId, action: 'Cập nhật thông tin dự án', detail: Object.keys(patch).join(', ') });
}

export async function updateMilestone(
  projectId: string,
  index: number,
  patch: Partial<Pick<ProjectMilestone, 'plannedDate' | 'adjustedDate' | 'actualDate' | 'evaluationMonths' | 'notes' | 'status'>>,
  opts: { autoStatus?: boolean } = {},
) {
  assertFirestore();
  const u = actor();
  const project = useDataStore.getState().projects.find((p) => p.id === projectId);
  if (!project) throw new Error('Không tìm thấy dự án.');
  const now = Date.now();
  const milestones = project.milestones.map((m) => {
    if (m.index !== index) return m;
    const next = { ...m, ...patch, updatedAt: now, updatedBy: u.displayName || u.email };
    if (opts.autoStatus) next.status = deriveMilestoneStatus(next);
    return next;
  });
  await updateDoc(
    doc(db, 'projects', projectId),
    clean({
      milestones,
      status: computeProjectStatus(milestones),
      progress: computeProgress(milestones),
      updatedAt: now,
      updatedBy: u.displayName || u.email,
    }),
  );
  const old = project.milestones.find((m) => m.index === index);
  const changes = Object.entries(patch)
    .filter(([k, v]) => (old as any)?.[k] !== v)
    .map(([k, v]) => `${k}: "${(old as any)?.[k] ?? ''}" → "${v ?? ''}"`)
    .join('; ');
  await logActivity({ entity: 'milestone', projectId, action: `Cập nhật mốc ${index}`, detail: changes });
}

// --- Công việc ---
export async function createTask(t: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) {
  const u = actor();
  const now = Date.now();
  const ref = await addDoc(
    collection(db, 'tasks'),
    clean({ ...t, order: t.order ?? now, createdAt: now, updatedAt: now, createdBy: u.displayName || u.email, updatedBy: u.displayName || u.email }),
  );
  await logActivity({ entity: 'task', projectId: t.projectId, action: 'Tạo công việc', detail: t.title });
  return ref.id;
}

export async function updateTask(id: string, patch: Partial<Task>, logText?: string) {
  const u = actor();
  const { id: _omit, ...rest } = patch as any;
  await updateDoc(doc(db, 'tasks', id), clean({ ...rest, updatedAt: Date.now(), updatedBy: u.displayName || u.email }));
  if (logText) {
    const t = useDataStore.getState().tasks.find((x) => x.id === id);
    await logActivity({ entity: 'task', projectId: t?.projectId, action: logText, detail: t?.title });
  }
}

export async function deleteTask(id: string) {
  const t = useDataStore.getState().tasks.find((x) => x.id === id);
  await deleteDoc(doc(db, 'tasks', id));
  await logActivity({ entity: 'task', projectId: t?.projectId, action: 'Xoá công việc', detail: t?.title });
}

// --- Tài liệu ---
export async function createDocument(d: Omit<ProjectDocument, 'id' | 'uploadedAt' | 'uploadedBy'>) {
  const u = actor();
  await addDoc(collection(db, 'documents'), clean({ ...d, uploadedAt: Date.now(), uploadedBy: u.displayName || u.email }));
  await logActivity({ entity: 'document', projectId: d.projectId, action: 'Thêm tài liệu', detail: d.name });
}

export async function updateDocument(id: string, patch: Partial<ProjectDocument>) {
  const { id: _omit, ...rest } = patch as any;
  await updateDoc(doc(db, 'documents', id), clean(rest));
}

export async function deleteDocument(id: string) {
  const d = useDataStore.getState().documents.find((x) => x.id === id);
  await deleteDoc(doc(db, 'documents', id));
  await logActivity({ entity: 'document', projectId: d?.projectId, action: 'Xoá tài liệu', detail: d?.name });
}

// --- Người dùng (admin) ---
export async function setUserRole(uid: string, role: 'admin' | 'manager' | 'viewer', email?: string) {
  await setDoc(doc(db, 'users', uid), { role }, { merge: true });
  await logActivity({ entity: 'user', action: `Đổi vai trò → ${role}`, detail: email || uid });
}
