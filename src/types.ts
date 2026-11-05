export type Role = 'admin' | 'manager' | 'viewer';

export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: Role;
  createdAt: number;
  lastLoginAt?: number;
}

export interface ProjectBlock {
  name: string;
  far?: string;
  towerAreaPerFloor?: string;
  podiumAreaPerFloor?: string;
  constructionArea?: string;
  density?: string;
  floors?: string;
  units?: number | string;
  population?: number | string;
  towerGfa?: string;
  gfa?: string;
}

export interface ProjectSpecs {
  landArea: string;
  constructionArea: string;
  density: string;
  heightFloors: string;
  towerAreaPerFloor: string;
  podiumAreaPerFloor: string;
  totalUnits: string;
  totalPopulation: string;
  far: string;
  gfaAboveGround: string;
  gfaFARCalculated: string;
  basementArea: string;
  totalGfa: string;
  usableArea: string;
  basementFloors: string;
  villasCount: string;
  avgLandAreaPerUnit: string;
  avgConstructionAreaPerUnit: string;
  blocks: ProjectBlock[];
}

export type MilestoneStatus =
  | 'Đã hoàn thành'
  | 'Đúng tiến độ'
  | 'Chậm tiến độ'
  | 'Đang thực hiện'
  | 'Sắp tới'
  | 'Chưa có dữ liệu';

export const MILESTONE_STATUSES: MilestoneStatus[] = [
  'Chưa có dữ liệu',
  'Sắp tới',
  'Đang thực hiện',
  'Đúng tiến độ',
  'Chậm tiến độ',
  'Đã hoàn thành',
];

export interface MilestoneSubItem {
  title: string;
  plannedDate: string;
  adjustedDate: string;
  notes: string;
}

export interface ProjectMilestone {
  index: number;
  title: string;
  category: string;
  plannedDate: string;
  adjustedDate: string;
  evaluationMonths: number | null;
  notes: string;
  status: MilestoneStatus;
  /** Hạng mục con (mốc 8: cọc/ngầm/thân; mốc 12: thông báo khởi công từng phần) */
  subItems?: MilestoneSubItem[];
  /** Ngày thực tế hoàn thành (nhập tay) */
  actualDate?: string;
  updatedAt?: number;
  updatedBy?: string;
}

export interface StellarProject {
  id: string;
  name: string;
  code: string;
  group: 'Cao tầng Hà Nội' | 'Thấp tầng' | 'Nhà ở xã hội NOXH' | 'Dự án khác';
  location: string;
  status: string;
  progress: number;
  col?: number;
  specs: ProjectSpecs;
  milestones: ProjectMilestone[];
  description?: string;
  /** Chủ nhiệm / phụ trách dự án */
  ownerName?: string;
  updatedAt?: number;
  updatedBy?: string;
}

export interface EngineeringProjectNote {
  projectId: string;
  projectName: string;
  notes: string;
}

export interface EngineeringWorkstream {
  id: string;
  code: string;
  section?: string;
  name: string;
  projectNotes: EngineeringProjectNote[];
}

export interface PortfolioMetadata {
  sourceUrl: string;
  sourceFile: string;
  lastSyncDate: string;
  extractedAt: string;
  totalSheets: number;
  sheets: string[];
  totalProjects: number;
  groups: { name: string; count: number }[];
  kpi: {
    totalProjects: number;
    totalLandAreaM2: number;
    totalLandAreaHa: number;
    totalUnits: number;
    totalPopulation: number;
    onTrackMilestonesPercent: number;
    /** Số dự án/mốc có dữ liệu được đưa vào phép tính */
    coverage?: {
      landArea: number;
      totalUnits: number;
      totalPopulation: number;
      milestonesWithData: number;
      milestonesTotal: number;
    };
  };
  milestoneSheets?: string[];
  importedBy?: string;
  importedAt?: number;
}

export interface StellarPortfolioData {
  metadata: PortfolioMetadata;
  projects: StellarProject[];
  engineeringWorkstreams: EngineeringWorkstream[];
}

// Legacy / App state interfaces
export interface Project {
  id?: string;
  name: string;
  description: string;
  status: 'planning' | 'active' | 'completed' | 'delayed';
  progress: number;
  startDate: number;
  endDate: number;
  managerId: string;
  kpi_budget: number;
  kpi_spent: number;
  createdAt: number;
  updatedAt: number;
}

export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done';
export type TaskPriority = 'high' | 'medium' | 'low';

export interface Task {
  id?: string;
  projectId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority?: TaskPriority;
  /** Hạn hoàn thành (epoch ms); null nếu chưa đặt */
  dueDate: number | null;
  /** Tên người phụ trách (nhập tự do) */
  assigneeId: string;
  /** Liên kết với mốc tiến độ 1–15 (nếu có) */
  milestoneIndex?: number | null;
  /** Thứ tự trong cột Kanban */
  order?: number;
  createdAt: number;
  createdBy?: string;
  updatedAt: number;
  updatedBy?: string;
}

export interface Document {
  id?: string;
  projectId: string;
  name: string;
  /** Liên kết SharePoint / OneDrive / Google Drive tới tệp gốc */
  url: string;
  category: string;
  milestoneIndex?: number | null;
  version?: string;
  notes?: string;
  uploadedBy: string;
  uploadedAt: number;
  type: string;
}

export interface ActivityLog {
  id?: string;
  at: number;
  actorUid: string;
  actorName: string;
  projectId?: string;
  entity: 'project' | 'milestone' | 'task' | 'document' | 'import' | 'user';
  action: string;
  detail?: string;
}

export type ServiceConnectionId = 'zalo' | 'telegram' | 'microsoft' | 'google' | 'gmail' | 'notebooklm' | 'onedrive' | 'teams';

export interface ServiceConnection {
  id: ServiceConnectionId;
  name: string;
  category: string;
  description: string;
  iconType: string;
  status: 'connected' | 'disconnected' | 'syncing';
  accountName?: string;
  accountEmail?: string;
  lastSync?: string;
  syncFrequency: 'realtime' | '15m' | 'hourly' | 'daily' | 'manual';
  features: string[];
  config: Record<string, any>;
}

export type AiProviderId = 'gemini' | 'openai' | 'claude';

export interface AiModelOption {
  id: string;
  name: string;
  provider: AiProviderId;
  description: string;
  level: 'fast' | 'balanced' | 'deep';
  levelLabel: string;
  contextWindow: string;
  badge?: string;
}

export interface AiProviderAuth {
  providerId: AiProviderId;
  name: string;
  isLoggedIn: boolean;
  accountEmail?: string;
  avatarUrl?: string;
  apiKey?: string;
  connectedAt?: string;
  tokenBalance?: string;
}

export interface ChatAttachment {
  id: string;
  name: string;
  size: number;
  type: string;
  contentPreview?: string;
  dataUrl?: string;
}

export type DataIntakeSourceType = 'file' | 'link' | 'sharepoint' | 'onedrive' | 'email' | 'web';
export type DataIntakeStatus = 'pending_review' | 'approved' | 'rejected';

export interface DataIntakeTag {
  id: string;
  name: string;
  color?: string;
  isAiSuggested?: boolean; // true if auto-proposed by AI
}

export interface DataIntakeItem {
  id: string;
  title: string;
  sourceType: DataIntakeSourceType;
  sourceUrl?: string;
  fileName?: string;
  fileSize?: string;
  fileExtension?: string;
  rawContentSnippet?: string;
  
  // AI Analysis Results
  aiAnalysis: {
    analyzedAt: string;
    confidence: number; // e.g. 96 (%)
    suggestedProjectId: string;
    suggestedProjectName: string;
    suggestedMilestoneIndex?: number;
    suggestedMilestoneTitle?: string;
    summary: string;
    reasoning: string;
    suggestedTags: DataIntakeTag[];
    priority: 'high' | 'medium' | 'low';
  };
  
  // Admin Final Decision & Customization
  finalProjectId?: string;
  finalProjectName?: string;
  finalMilestoneIndex?: number;
  finalMilestoneTitle?: string;
  finalTags: DataIntakeTag[];
  status: DataIntakeStatus;
  adminNotes?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  
  createdAt: string;
  createdBy: string;
}

