import portfolioRawData from './stellarPortfolio.json';
import { StellarPortfolioData, StellarProject, EngineeringWorkstream, PortfolioMetadata } from '../types';

export const portfolioData: StellarPortfolioData = portfolioRawData as unknown as StellarPortfolioData;

export const portfolioMetadata: PortfolioMetadata = portfolioData.metadata;
export const stellarProjects: StellarProject[] = portfolioData.projects;
export const engineeringWorkstreams: EngineeringWorkstream[] = portfolioData.engineeringWorkstreams;

export function getProjectById(id: string): StellarProject | undefined {
  return stellarProjects.find(p => p.id === id);
}

export function getProjectsByGroup(group: string): StellarProject[] {
  if (group === 'all' || !group) return stellarProjects;
  return stellarProjects.filter(p => p.group === group);
}

export function searchProjects(query: string, group?: string): StellarProject[] {
  let list = stellarProjects;
  if (group && group !== 'all') {
    list = list.filter(p => p.group === group);
  }
  if (!query) return list;
  const q = query.toLowerCase().trim();
  return list.filter(p => 
    p.name.toLowerCase().includes(q) ||
    p.code.toLowerCase().includes(q) ||
    p.location.toLowerCase().includes(q) ||
    p.status.toLowerCase().includes(q)
  );
}

export const MILESTONE_DEFINITIONS = [
  { index: 1, title: 'Chủ trương đầu tư', category: 'Pháp lý' },
  { index: 2, title: 'Chấp thuận TMB/QHCT', category: 'Quy hoạch' },
  { index: 3, title: 'Cấp GPMT/ĐTM', category: 'Môi trường' },
  { index: 4, title: 'Hoàn thành concept', category: 'Thiết kế' },
  { index: 5, title: 'Hoàn thành hồ sơ BCNCKT', category: 'Kỹ thuật' },
  { index: 6, title: 'Thẩm định hồ sơ BCNCKT', category: 'Thẩm định' },
  { index: 7, title: 'Thẩm định thiết kế PCCC', category: 'PCCC' },
  { index: 8, title: 'Lập TK BVTC, thẩm tra, BOQ', category: 'Thiết kế' },
  { index: 9, title: 'Giao đất, bàn giao thực địa', category: 'Đất đai' },
  { index: 10, title: 'Xác định giá đất, nộp TSDĐ', category: 'Tài chính' },
  { index: 11, title: 'Cấp GCN QSDĐ', category: 'Pháp lý' },
  { index: 12, title: 'Cấp phép XD / Thông báo khởi công', category: 'Khởi công' },
  { index: 13, title: 'Hoàn thành thi công hầm móng', category: 'Xây dựng' },
  { index: 14, title: 'Đủ điều kiện kinh doanh (mở bán)', category: 'Kinh doanh' },
  { index: 15, title: 'Bàn giao khách hàng & vận hành', category: 'Bàn giao' },
];
