/**
 * Bộ đọc file Excel tiến độ (bản xuất từ SharePoint) → dữ liệu danh mục dự án.
 *
 * Dùng chung cho:
 *   - Trình duyệt: trang "Nhập dữ liệu Excel" (admin tải file lên, xem trước, ghi vào Firestore)
 *   - Node: scripts/generateStellarData.ts (tạo src/data/stellarPortfolio.json làm dữ liệu khởi tạo)
 *
 * Thư viện đọc Excel: SheetJS (https://github.com/SheetJS/sheetjs), đã có sẵn trong dự án.
 *
 * Nguyên tắc: chỉ lấy giá trị có trong file. Ô trống → để trống, không tự sinh dữ liệu.
 * Dự án nào không có sheet tiến độ → mốc có trạng thái "Chưa có dữ liệu".
 */
import * as XLSX from 'xlsx';
import type {
  StellarProject,
  ProjectSpecs,
  ProjectBlock,
  ProjectMilestone,
  MilestoneStatus,
  EngineeringWorkstream,
  PortfolioMetadata,
} from '../types';

// ---------------------------------------------------------------------------
// Danh mục dự án chuẩn (id ổn định dùng làm khoá Firestore)
// ---------------------------------------------------------------------------
export interface ProjectConfig {
  id: string;
  name: string;
  code: string;
  group: StellarProject['group'];
  location: string;
  /** Tên khác có thể xuất hiện trong tiêu đề cột Excel */
  aliases?: string[];
}

export const PROJECT_CONFIG: ProjectConfig[] = [
  { id: 'ia25-astor', name: 'IA25 ASTOR 1 (CIPUTRA)', code: 'IA25-CIP', group: 'Cao tầng Hà Nội', location: 'Tây Hồ, Hà Nội', aliases: ['IA25 CIPUTRA'] },
  { id: 'nguyen-hoang', name: 'Nguyễn Hoàng (4 hầm)', code: 'NH-04H', group: 'Cao tầng Hà Nội', location: 'Nam Từ Liêm, Hà Nội' },
  { id: 'minh-khai', name: 'Minh Khai (4 hầm)', code: 'MK-4H', group: 'Cao tầng Hà Nội', location: 'Hai Bà Trưng, Hà Nội' },
  { id: 'lai-yen', name: 'Lại Yên', code: 'LY-01', group: 'Cao tầng Hà Nội', location: 'Hoài Đức, Hà Nội' },
  { id: 'parkview-van-hoi', name: 'Parkview (Văn Hội)', code: 'PV-VH', group: 'Cao tầng Hà Nội', location: 'Bắc Từ Liêm, Hà Nội', aliases: ['Vân hội', 'Văn Hội'] },
  { id: 'dinh-cong', name: 'Định Công', code: 'DC-01', group: 'Cao tầng Hà Nội', location: 'Hoàng Mai, Hà Nội' },
  { id: 'duc-giang', name: 'Đức Giang', code: 'DG-01', group: 'Cao tầng Hà Nội', location: 'Long Biên, Hà Nội' },
  { id: 'co-nhue', name: 'Cổ Nhuế (Nguyễn Đình Tứ)', code: 'CN-NDT', group: 'Cao tầng Hà Nội', location: 'Bắc Từ Liêm, Hà Nội' },
  { id: 'd13', name: 'D13 (4 hầm)', code: 'D13-4H', group: 'Cao tầng Hà Nội', location: 'Bắc Đại Kim, Hà Nội' },
  { id: 'chu-van-an', name: 'Chu Văn An', code: 'CVA-01', group: 'Cao tầng Hà Nội', location: 'Thanh Trì, Hà Nội' },
  { id: '79-lac-trung', name: '79 Lạc Trung', code: 'LT-79', group: 'Cao tầng Hà Nội', location: 'Hai Bà Trưng, Hà Nội', aliases: ['Lạc Trung'] },
  { id: '605-minh-khai', name: '605 Minh Khai', code: 'MK-605', group: 'Cao tầng Hà Nội', location: 'Hai Bà Trưng, Hà Nội' },
  { id: 'ha-dong', name: 'Hà Đông', code: 'HD-01', group: 'Cao tầng Hà Nội', location: 'Hà Đông, Hà Nội' },
  { id: 'phu-gia', name: 'Phú Gia (Hoàng Tăng Bí)', code: 'PG-HTB', group: 'Cao tầng Hà Nội', location: 'Bắc Từ Liêm, Hà Nội' },
  { id: 'minh-tan-thap-tang', name: 'Minh Tân (Thấp tầng)', code: 'MT-TT', group: 'Thấp tầng', location: 'Hải Phòng', aliases: ['Minh Tân'] },
  { id: 'ngoc-xuyen', name: 'Ngọc Xuyên', code: 'NX-DS', group: 'Thấp tầng', location: 'Đồ Sơn, Hải Phòng', aliases: ['Đồ Sơn'] },
  { id: 'sam-son', name: 'Sầm Sơn', code: 'SS-TH', group: 'Thấp tầng', location: 'Sầm Sơn, Thanh Hóa' },
  { id: 'lang-giang', name: 'Lạng Giang', code: 'LG-BG', group: 'Thấp tầng', location: 'Lạng Giang, Bắc Giang' },
  { id: 'bau-va', name: 'Bàu Vá (NOXH)', code: 'BV-HUE', group: 'Nhà ở xã hội NOXH', location: 'Thừa Thiên Huế' },
  { id: 'huong-so', name: 'Hương Sơ (NOXH)', code: 'HS-HUE', group: 'Nhà ở xã hội NOXH', location: 'Thừa Thiên Huế' },
  { id: 'quang-tri', name: 'Quảng Trị (NOXH)', code: 'QT-NOXH', group: 'Nhà ở xã hội NOXH', location: 'Đông Hà, Quảng Trị' },
  { id: 'minh-tan-noxh', name: 'Minh Tân (NOXH)', code: 'MT-NOXH', group: 'Nhà ở xã hội NOXH', location: 'Hải Phòng', aliases: ['Minh Tân'] },
  { id: 'ngoc-hoi', name: 'Ngọc Hồi (NOXH)', code: 'NH-HN', group: 'Nhà ở xã hội NOXH', location: 'Thanh Trì, Hà Nội' },
];

export const STANDARD_MILESTONES = [
  { index: 1, title: 'Chủ trương đầu tư', category: 'Pháp lý chấp thuận' },
  { index: 2, title: 'Chấp thuận TMB/QHCT', category: 'Quy hoạch & Kiến trúc' },
  { index: 3, title: 'Cấp GPMT/ĐTM', category: 'Môi trường' },
  { index: 4, title: 'Hoàn thành concept', category: 'Thiết kế' },
  { index: 5, title: 'Hoàn thành hồ sơ BCNCKT', category: 'Báo cáo NCKT' },
  { index: 6, title: 'Thẩm định hồ sơ BCNCKT', category: 'Báo cáo NCKT' },
  { index: 7, title: 'Thẩm định thiết kế PCCC', category: 'Phòng cháy chữa cháy' },
  { index: 8, title: 'Lập TK BVTC, thẩm tra, BOQ (Cọc/Ngầm/Thân)', category: 'Bản vẽ thi công' },
  { index: 9, title: 'Giao đất, bàn giao đất thực địa', category: 'Đất đai & Pháp lý' },
  { index: 10, title: 'Xác định giá đất, nộp TSDĐ', category: 'Tài chính đất' },
  { index: 11, title: 'Cấp GCN QSDĐ (Sổ đỏ)', category: 'Đất đai & Pháp lý' },
  { index: 12, title: 'Cấp phép XD / Thông báo khởi công', category: 'Cấp phép & Khởi công' },
  { index: 13, title: 'Hoàn thành thi công hầm, móng', category: 'Thi công xây lắp' },
  { index: 14, title: 'Đủ điều kiện kinh doanh (mở bán chính thức)', category: 'Kinh doanh & Bán hàng' },
  { index: 15, title: 'Bàn giao khách hàng, vận hành', category: 'Bàn giao & Vận hành' },
];

// ---------------------------------------------------------------------------
// Tiện ích
// ---------------------------------------------------------------------------
type Row = any[];
type Grid = Row[];

export function normalizeVi(s: unknown): string {
  return String(s ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[\r\n]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Bỏ phần trong ngoặc: "Nguyễn Hoàng (4 hầm)" → "nguyen hoang" */
function stripParens(s: string): string {
  return s.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Số theo định dạng Việt Nam: "15119,23" | "1.234,5" | 3628. Trả null nếu ô chứa chữ. */
export function parseVnNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'number') return Number.isFinite(val) ? val : null;
  let s = String(val).trim().replace(/\s/g, '').replace(/%$/, '');
  if (!/^-?[\d.,]+$/.test(s)) return null;
  if (s.includes('.') && s.includes(',')) {
    s = s.replace(/\./g, '').replace(',', '.');
  } else if (s.includes(',')) {
    s = s.replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(s)) {
    s = s.replace(/\./g, '');
  }
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : null;
}

/** Excel serial / "22/05/26" / "22/05/2026" → "dd/mm/yyyy". Văn bản khác giữ nguyên. */
export function formatExcelDate(val: unknown): string {
  if (val === null || val === undefined || val === '') return '';
  if (typeof val === 'number') {
    if (val > 30000 && val < 80000) {
      // Ngày Excel (hệ 1900): 0 = 30/12/1899
      const d = new Date(Date.UTC(1899, 11, 30) + Math.round(val) * 86400000);
      const dd = String(d.getUTCDate()).padStart(2, '0');
      const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
      return `${dd}/${mm}/${d.getUTCFullYear()}`;
    }
    return String(val);
  }
  const s = String(val).trim();
  const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2}|\d{4})$/);
  if (m) {
    const yyyy = m[3].length === 2 ? '20' + m[3] : m[3];
    return `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${yyyy}`;
  }
  return s;
}

/** "dd/mm/yyyy" → Date (null nếu không phải ngày) */
export function parseVnDate(s: string | undefined | null): Date | null {
  if (!s) return null;
  const m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
  return isNaN(d.getTime()) ? null : d;
}

export function isDateString(s: string | undefined | null) {
  return parseVnDate(s) !== null;
}

function sheetGrid(wb: XLSX.WorkBook, name: string): Grid {
  const ws = wb.Sheets[name];
  if (!ws) return [];
  return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null }) as Grid;
}

function groupFromBanner(text: string): StellarProject['group'] | null {
  const n = normalizeVi(text);
  if (n.includes('cao tang')) return 'Cao tầng Hà Nội';
  if (n.includes('thap tang')) return 'Thấp tầng';
  if (n.includes('noxh') || n.includes('nha o xa hoi')) return 'Nhà ở xã hội NOXH';
  if (n.includes('khac')) return 'Dự án khác';
  return null;
}

/** Xác định nhóm dự án theo cột, dựa vào dòng tiêu đề nhóm ("NHÓM DỰ ÁN THẤP TẦNG"...) */
function groupResolver(bannerRow: Row | undefined) {
  const marks: { col: number; group: StellarProject['group'] }[] = [];
  (bannerRow || []).forEach((cell, col) => {
    const g = cell ? groupFromBanner(String(cell)) : null;
    if (g) marks.push({ col, group: g });
  });
  return (col: number): StellarProject['group'] | null => {
    let found: StellarProject['group'] | null = null;
    for (const m of marks) if (m.col <= col) found = m.group;
    return found;
  };
}

/** Khớp tiêu đề cột Excel với dự án trong danh mục */
export function matchProject(header: unknown, group?: StellarProject['group'] | null): ProjectConfig | null {
  const full = normalizeVi(header);
  if (!full) return null;
  const core = stripParens(full);
  const pool = group ? PROJECT_CONFIG.filter((p) => p.group === group) : PROJECT_CONFIG;

  const names = (p: ProjectConfig) =>
    [p.name, ...(p.aliases || [])].map((n) => stripParens(normalizeVi(n))).filter(Boolean);

  // 1) Trùng khớp tên lõi
  const exact = pool.filter((p) => names(p).some((n) => n === core));
  if (exact.length === 1) return exact[0];
  // 2) Tên/alias nằm trong tiêu đề (kể cả phần trong ngoặc), ưu tiên tên dài nhất
  let best: { p: ProjectConfig; len: number } | null = null;
  for (const p of pool) {
    for (const n of names(p)) {
      if (n.length >= 4 && (full.includes(n) || n.includes(core))) {
        if (!best || n.length > best.len) best = { p, len: n.length };
      }
    }
  }
  return best?.p || (exact[0] ?? null);
}

// ---------------------------------------------------------------------------
// 1. Sheet CHỈ TIÊU → thông số kỹ thuật
// ---------------------------------------------------------------------------
const SPEC_ROWS: { key: keyof Omit<ProjectSpecs, 'blocks'>; label: RegExp; additive?: boolean }[] = [
  { key: 'landArea', label: /^dien tich khu dat/ },
  { key: 'constructionArea', label: /^dien tich xay dung/, additive: true },
  { key: 'density', label: /^mat do/ },
  { key: 'heightFloors', label: /^tang cao/ },
  { key: 'towerAreaPerFloor', label: /^dien tich thap/ },
  { key: 'podiumAreaPerFloor', label: /^dien tich de/ },
  { key: 'totalUnits', label: /^tong so can/, additive: true },
  { key: 'totalPopulation', label: /^tong dan so/, additive: true },
  { key: 'far', label: /^he so sdd/ },
  { key: 'gfaAboveGround', label: /^tong dt san xd noi/, additive: true },
  { key: 'gfaFARCalculated', label: /^tong dt san xd tinh/, additive: true },
  { key: 'basementArea', label: /^tong dien tich ham/ },
  { key: 'totalGfa', label: /^tong dien tich san xd/ },
  { key: 'usableArea', label: /^tong dien tich san huu dung/ },
  { key: 'basementFloors', label: /^so tang ham/ },
  { key: 'villasCount', label: /^so can lien ke/ },
  { key: 'avgLandAreaPerUnit', label: /^dien tich dat trung binh/ },
  { key: 'avgConstructionAreaPerUnit', label: /^dien tich san xay dung tr/ },
];

const BLOCK_LABEL = /^(tong|ct\s*\d+|[0-9]*[a-z]{1,4}\d*)$/i;

function cellText(v: unknown): string {
  if (v === null || v === undefined) return '';
  if (typeof v === 'number') return String(Math.round(v * 100) / 100);
  return String(v).replace(/\r\n/g, '\n').trim();
}

/** "4NO: 1014 người\n5BT: 490 người" → [{label:'4NO', text:'1014 người', num:1014}, ...] */
function splitLabelledLines(text: string) {
  const out: { label: string; text: string; num: number | null }[] = [];
  for (const line of text.split('\n')) {
    const m = line.match(/^\s*([^:]{1,12}):\s*(.+)$/);
    if (!m) return null;
    const numMatch = m[2].match(/-?[\d.,]+/);
    out.push({ label: m[1].trim(), text: m[2].trim(), num: numMatch ? parseVnNumber(numMatch[0]) : null });
  }
  return out.length > 1 ? out : null;
}

export interface SpecParseResult {
  specs: ProjectSpecs;
  warnings: string[];
}

function emptySpecs(): ProjectSpecs {
  return {
    landArea: '', constructionArea: '', density: '', heightFloors: '', towerAreaPerFloor: '',
    podiumAreaPerFloor: '', totalUnits: '', totalPopulation: '', far: '', gfaAboveGround: '',
    gfaFARCalculated: '', basementArea: '', totalGfa: '', usableArea: '', basementFloors: '',
    villasCount: '', avgLandAreaPerUnit: '', avgConstructionAreaPerUnit: '', blocks: [],
  };
}

function parseSpecs(grid: Grid) {
  const warnings: string[] = [];
  const header = grid[1] || [];
  const resolveGroup = groupResolver(grid[0]);
  const result = new Map<string, ProjectSpecs>();
  const projectCols: { cfg: ProjectConfig; col: number; span: number }[] = [];

  // Cột của từng dự án: ô tiêu đề có tên; span = số cột tới tiêu đề kế tiếp (tối đa 2)
  header.forEach((cell, col) => {
    if (col < 2 || !cell) return;
    const cfg = matchProject(cell, resolveGroup(col));
    if (!cfg) {
      warnings.push(`CHỈ TIÊU: không nhận diện được cột "${cellText(cell)}" (cột ${col + 1})`);
      return;
    }
    if (projectCols.some((p) => p.cfg.id === cfg.id)) return;
    const next = header.findIndex((c, i) => i > col && c);
    const span = Math.min(2, (next === -1 ? col + 2 : next) - col);
    projectCols.push({ cfg, col, span });
  });

  // Vị trí các dòng chỉ tiêu (dòng có nhãn ở cột B), kết thúc ở dòng có STT tiếp theo
  const rowStarts: { key: SpecParseKey; start: number; end: number; additive: boolean }[] = [];
  type SpecParseKey = (typeof SPEC_ROWS)[number]['key'];
  const labelled: number[] = [];
  grid.forEach((row, r) => {
    if (r >= 2 && row && row[1]) labelled.push(r);
  });
  for (let i = 0; i < labelled.length; i++) {
    const r = labelled[i];
    const label = normalizeVi(grid[r][1]);
    const def = SPEC_ROWS.find((d) => d.label.test(label));
    if (!def) continue;
    let end = i + 1 < labelled.length ? labelled[i + 1] : r + 1;
    // Không vượt quá khối dữ liệu (dừng ở dòng trống hoàn toàn)
    for (let k = r + 1; k < end; k++) {
      if (!grid[k] || grid[k].every((c) => c === null || c === '')) {
        end = k;
        break;
      }
    }
    rowStarts.push({ key: def.key, start: r, end, additive: !!def.additive });
  }

  for (const { cfg, col, span } of projectCols) {
    const specs = emptySpecs();
    const blocks = new Map<string, ProjectBlock>();
    const blockOf = (name: string) => {
      if (!blocks.has(name)) blocks.set(name, { name });
      return blocks.get(name)!;
    };
    const setBlock = (name: string, key: string, value: string) => {
      const b = blockOf(name) as any;
      const map: Record<string, string> = {
        constructionArea: 'constructionArea', density: 'density', heightFloors: 'floors',
        totalUnits: 'units', totalPopulation: 'population', gfaAboveGround: 'towerGfa', far: 'far',
        towerAreaPerFloor: 'towerAreaPerFloor', podiumAreaPerFloor: 'podiumAreaPerFloor',
      };
      const k = map[key];
      if (k) b[k] = value;
    };

    for (const { key, start, end } of rowStarts) {
      const first = grid[start]?.[col];
      const second = span > 1 ? grid[start]?.[col + 1] : null;
      const firstText = cellText(first);

      // Dạng khối: cột trái là nhãn (Tổng/CT1/4NO), cột phải là giá trị, nhiều dòng
      const isBlockMode = span > 1 && firstText && firstText.split('\n').every((l) => BLOCK_LABEL.test(normalizeVi(l)));
      if (isBlockMode) {
        for (let r = start; r < end; r++) {
          const labelCell = cellText(grid[r]?.[col]);
          const valCell = cellText(grid[r]?.[col + 1]);
          if (!labelCell) continue;
          const labels = labelCell.split('\n');
          const vals = valCell.split('\n');
          labels.forEach((lab, i) => {
            const v = vals[i] ?? '';
            if (!v) return;
            if (normalizeVi(lab) === 'tong') (specs as any)[key] = v;
            else setBlock(lab.trim(), key, v);
          });
        }
        continue;
      }

      let raw = firstText || (span > 1 ? cellText(second) : '');
      if (!raw) continue;

      // Dạng "4NO: 1014 người\n5BT: 490 người" trong một ô
      const lines = splitLabelledLines(raw);
      if (lines) {
        lines.forEach((l) => setBlock(l.label, key, l.text));
        const def = SPEC_ROWS.find((d) => d.key === key);
        if (def?.additive && lines.every((l) => l.num !== null)) {
          const sum = lines.reduce((a, l) => a + (l.num || 0), 0);
          (specs as any)[key] = String(Math.round(sum * 100) / 100);
        } else {
          (specs as any)[key] = raw.replace(/\n/g, '; ');
        }
        continue;
      }

      // Mật độ dạng 0.4893 → 48.93%
      if (key === 'density' && typeof first === 'number' && first < 1) {
        raw = Math.round(first * 10000) / 100 + '%';
      }
      (specs as any)[key] = raw.replace(/\n/g, ' ');
    }

    if (!specs.totalUnits && specs.villasCount) specs.totalUnits = specs.villasCount;
    specs.blocks = Array.from(blocks.values());
    result.set(cfg.id, specs);
  }
  return { result, warnings };
}

// ---------------------------------------------------------------------------
// 2. Sheet tiến độ 15 mốc (ví dụ "26.2.26", "26.2.26 DA mới")
// ---------------------------------------------------------------------------
export interface MilestoneRaw {
  plannedDate: string;
  adjustedDate: string;
  evaluationMonths: number | null;
  notes: string;
  subItems: { title: string; plannedDate: string; adjustedDate: string; notes: string }[];
}

/** Tìm các sheet tiến độ có cấu trúc "TT | Công việc | <Dự án> x4 cột" */
export function listMilestoneSheets(wb: XLSX.WorkBook): string[] {
  return wb.SheetNames.filter((name) => {
    const g = sheetGrid(wb, name);
    return g.some((row, r) => normalizeVi(row?.[1]) === 'cong viec' && normalizeVi(g[r + 1]?.[2]).length > 0);
  });
}

/** Đề xuất sheet mới nhất: sheet cuối cùng có tên dạng ngày, kèm các sheet cùng tiền tố (ví dụ "26.2.26 DA mới") */
export function suggestLatestMilestoneSheets(wb: XLSX.WorkBook): string[] {
  const candidates = listMilestoneSheets(wb);
  const dated = candidates.filter((n) => /^\d{1,2}\.\d{1,2}(\.\d{2,4})?/.test(n));
  if (!dated.length) return [];
  const last = dated[dated.length - 1];
  const prefix = last.split(/[\s_]/)[0];
  return dated.filter((n) => n.split(/[\s_]/)[0] === prefix);
}

function parseMilestoneSheet(grid: Grid, sheetName: string, warnings: string[]) {
  const out = new Map<string, Map<number, MilestoneRaw>>();
  for (let h = 0; h < grid.length; h++) {
    if (normalizeVi(grid[h]?.[1]) !== 'cong viec') continue;
    const header = grid[h];
    const sub = grid[h + 1] || [];
    // Chỉ xử lý định dạng 4 cột/dự án (Phê duyệt | Hiện tại | Đánh giá | Ghi chú)
    if (!normalizeVi(sub[2])) continue;

    const blocks: { cfg: ProjectConfig; col: number }[] = [];
    for (let c = 2; c < header.length; c++) {
      if (!header[c]) continue;
      const cfg = matchProject(header[c], 'Cao tầng Hà Nội') || matchProject(header[c]);
      if (cfg) blocks.push({ cfg, col: c });
      else warnings.push(`${sheetName}: không nhận diện được dự án "${cellText(header[c])}"`);
    }

    let current: { index: number; row: Row } | null = null;
    const rowsByIndex = new Map<number, { row: Row; subs: Row[] }>();
    for (let r = h + 2; r < grid.length; r++) {
      const row = grid[r] || [];
      if (normalizeVi(row[1]) === 'cong viec') break;
      const tt = row[0];
      if (typeof tt === 'number' && tt >= 1 && tt <= 15) {
        current = { index: tt, row };
        rowsByIndex.set(tt, { row, subs: [] });
      } else if (String(tt ?? '').trim() === '-' && current) {
        rowsByIndex.get(current.index)!.subs.push(row);
      } else if (tt === null && row[1] && normalizeVi(row[1]).startsWith('tong thoi gian')) {
        break;
      }
    }

    for (const { cfg, col } of blocks) {
      const map = out.get(cfg.id) || new Map<number, MilestoneRaw>();
      rowsByIndex.forEach(({ row, subs }, index) => {
        const read = (rw: Row) => {
          const plan = formatExcelDate(rw[col]);
          let adj = formatExcelDate(rw[col + 1]);
          let evalRaw = rw[col + 2];
          if (normalizeVi(adj) === 'khong thay doi') {
            adj = plan;
            evalRaw = 0;
          }
          // Cột đánh giá chỉ có ý nghĩa khi có ngày điều chỉnh
          const ev = isDateString(adj) && typeof evalRaw === 'number' ? Math.round(evalRaw * 10) / 10 : null;
          return { plan, adj, ev, note: cellText(rw[col + 3]) };
        };
        const main = read(row);
        const subItems = subs.map((s) => {
          const v = read(s);
          return { title: cellText(s[1]), plannedDate: v.plan, adjustedDate: v.adj, notes: v.note };
        }).filter((s) => s.plannedDate || s.adjustedDate || s.notes);

        let { plan, adj, ev } = main;
        // Mốc có hạng mục con (8, 12): lấy ngày muộn nhất của các hạng mục con
        if (!plan && !adj && subItems.length) {
          const latest = (k: 'plannedDate' | 'adjustedDate') =>
            subItems.map((s) => s[k]).filter(isDateString)
              .sort((a, b) => parseVnDate(a)!.getTime() - parseVnDate(b)!.getTime()).pop() || '';
          plan = latest('plannedDate');
          adj = latest('adjustedDate');
          const evs = subs.map((s) => read(s).ev).filter((x): x is number => x !== null);
          ev = evs.length ? Math.min(...evs) : null;
        }
        if (!plan && !adj && !main.note && !subItems.length) return;
        map.set(index, { plannedDate: plan, adjustedDate: adj, evaluationMonths: ev, notes: main.note, subItems });
      });
      out.set(cfg.id, map);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// 3. Trạng thái & tiến độ (quy tắc minh bạch, có thể kiểm tra lại)
// ---------------------------------------------------------------------------
const DONE_PATTERN = /^(da )?hoan thanh\b|^da co\b|^da duoc (phe duyet|cap|chap thuan)/;

export function deriveMilestoneStatus(m: Pick<ProjectMilestone, 'plannedDate' | 'adjustedDate' | 'evaluationMonths' | 'notes'>): MilestoneStatus {
  const note = normalizeVi(m.notes);
  if (DONE_PATTERN.test(note) || normalizeVi(m.plannedDate) === 'hoan thanh' || normalizeVi(m.adjustedDate) === 'hoan thanh') {
    return 'Đã hoàn thành';
  }
  if (!isDateString(m.plannedDate) && !isDateString(m.adjustedDate)) return 'Chưa có dữ liệu';
  if (m.evaluationMonths !== null && m.evaluationMonths < 0) return 'Chậm tiến độ';
  return 'Đúng tiến độ';
}

/** Tiến độ (%) = số mốc đã hoàn thành / 15 */
export function computeProgress(milestones: ProjectMilestone[]): number {
  if (!milestones.length) return 0;
  const done = milestones.filter((m) => m.status === 'Đã hoàn thành').length;
  return Math.round((done / milestones.length) * 100);
}

export function computeProjectStatus(milestones: ProjectMilestone[]): string {
  const st = (i: number) => milestones.find((m) => m.index === i)?.status;
  if (milestones.every((m) => m.status === 'Chưa có dữ liệu')) return 'Chưa có dữ liệu tiến độ';
  if (st(15) === 'Đã hoàn thành') return 'Đã bàn giao & vận hành';
  if (st(14) === 'Đã hoàn thành') return 'Đủ điều kiện kinh doanh';
  if (st(12) === 'Đã hoàn thành') return 'Đang thi công xây lắp';
  if (st(6) === 'Đã hoàn thành' || st(7) === 'Đã hoàn thành') return 'Thẩm định BCNCKT & PCCC';
  if (st(4) === 'Đã hoàn thành') return 'Thiết kế BVTC & khảo sát';
  if (st(2) === 'Đã hoàn thành') return 'Hoàn thiện concept & ĐTM';
  return 'Chuẩn bị đầu tư';
}

export function buildMilestones(raw?: Map<number, MilestoneRaw>): ProjectMilestone[] {
  return STANDARD_MILESTONES.map((std) => {
    const r = raw?.get(std.index);
    const base = {
      index: std.index,
      title: std.title,
      category: std.category,
      plannedDate: isDateString(r?.plannedDate) ? r!.plannedDate : '',
      adjustedDate: isDateString(r?.adjustedDate) ? r!.adjustedDate : '',
      evaluationMonths: r?.evaluationMonths ?? null,
      notes: [r?.notes, !isDateString(r?.plannedDate) && r?.plannedDate ? `Phê duyệt: ${r.plannedDate}` : '',
        !isDateString(r?.adjustedDate) && r?.adjustedDate && r.adjustedDate !== r.plannedDate ? `Hiện tại: ${r.adjustedDate}` : '']
        .filter(Boolean).join(' · '),
      subItems: r?.subItems || [],
    };
    const status = deriveMilestoneStatus({
      plannedDate: r?.plannedDate || '',
      adjustedDate: r?.adjustedDate || '',
      evaluationMonths: base.evaluationMonths,
      notes: r?.notes || '',
    });
    return { ...base, status };
  });
}

// ---------------------------------------------------------------------------
// 4. Sheet TỔNG HỢP TIẾN ĐỘ → hạng mục thiết kế/kỹ thuật theo tuần
// ---------------------------------------------------------------------------
function parseWorkstreams(grid: Grid, warnings: string[]): EngineeringWorkstream[] {
  const header = grid[1] || [];
  const resolveGroup = groupResolver(grid[0]);
  const spans: { cfg: ProjectConfig; from: number; to: number }[] = [];
  const isWeek = (v: unknown) => /^tuan\b/.test(normalizeVi(v));
  const projectHeaderCols: number[] = [];
  header.forEach((cell, col) => {
    if (col >= 2 && cell && !isWeek(cell)) projectHeaderCols.push(col);
  });
  projectHeaderCols.forEach((col, i) => {
    const cfg = matchProject(header[col], resolveGroup(col));
    const to = (projectHeaderCols[i + 1] ?? header.length) - 1;
    if (cfg) spans.push({ cfg, from: col, to });
    else warnings.push(`TỔNG HỢP TIẾN ĐỘ: không nhận diện được cột "${cellText(header[col])}"`);
  });

  const list: EngineeringWorkstream[] = [];
  let section = '';
  for (let r = 3; r < grid.length; r++) {
    const row = grid[r] || [];
    const name = cellText(row[1]);
    if (!name) continue;
    if (row[0] !== null && row[0] !== undefined && String(row[0]).trim() !== '') {
      section = `${cellText(row[0])}. ${name}`;
    }
    const projectNotes = spans
      .map(({ cfg, from, to }) => {
        const parts: string[] = [];
        for (let c = from; c <= to; c++) {
          const v = cellText(row[c]);
          if (!v || v.length < 2) continue;
          const week = isWeek(header[c]) ? cellText(header[c]) : '';
          parts.push(week ? `[${week}] ${v}` : v);
        }
        return parts.length ? { projectId: cfg.id, projectName: cfg.name, notes: parts.join('\n') } : null;
      })
      .filter((x): x is NonNullable<typeof x> => !!x);
    if (projectNotes.length) {
      list.push({ id: 'ws_' + r, code: cellText(row[0]), section, name, projectNotes });
    }
  }
  return list;
}

// ---------------------------------------------------------------------------
// 5. KPI danh mục — tính từ dữ liệu, không gán cứng
// ---------------------------------------------------------------------------
export function computePortfolioKpi(projects: StellarProject[]) {
  const sum = (key: keyof ProjectSpecs) => {
    let total = 0;
    let counted = 0;
    for (const p of projects) {
      const n = parseVnNumber(p.specs?.[key] as any);
      if (n !== null) {
        total += n;
        counted++;
      }
    }
    return { total, counted };
  };
  const land = sum('landArea');
  const units = sum('totalUnits');
  const pop = sum('totalPopulation');
  const all = projects.flatMap((p) => p.milestones || []);
  const withData = all.filter((m) => m.status !== 'Chưa có dữ liệu');
  const ok = withData.filter((m) => m.status !== 'Chậm tiến độ');
  return {
    totalProjects: projects.length,
    totalLandAreaM2: Math.round(land.total),
    totalLandAreaHa: Math.round((land.total / 10000) * 10) / 10,
    totalUnits: Math.round(units.total),
    totalPopulation: Math.round(pop.total),
    onTrackMilestonesPercent: withData.length ? Math.round((ok.length / withData.length) * 1000) / 10 : 0,
    coverage: {
      landArea: land.counted,
      totalUnits: units.counted,
      totalPopulation: pop.counted,
      milestonesWithData: withData.length,
      milestonesTotal: all.length,
    },
  };
}

// ---------------------------------------------------------------------------
// API chính
// ---------------------------------------------------------------------------
export interface ParseOptions {
  /** Các sheet tiến độ 15 mốc cần đọc. Mặc định: các sheet mới nhất */
  milestoneSheets?: string[];
  sourceFile?: string;
  sourceUrl?: string;
}

export interface ParseResult {
  projects: StellarProject[];
  engineeringWorkstreams: EngineeringWorkstream[];
  metadata: PortfolioMetadata;
  warnings: string[];
  milestoneSheetsUsed: string[];
}

export function parseWorkbook(wb: XLSX.WorkBook, opts: ParseOptions = {}): ParseResult {
  const warnings: string[] = [];

  const specGrid = sheetGrid(wb, 'CHỈ TIÊU');
  if (!specGrid.length) warnings.push('Không tìm thấy sheet "CHỈ TIÊU".');
  const { result: specsById, warnings: w1 } = parseSpecs(specGrid);
  warnings.push(...w1);

  const sheets = opts.milestoneSheets ?? suggestLatestMilestoneSheets(wb);
  const milestonesById = new Map<string, Map<number, MilestoneRaw>>();
  for (const s of sheets) {
    const parsed = parseMilestoneSheet(sheetGrid(wb, s), s, warnings);
    parsed.forEach((m, id) => {
      if (milestonesById.has(id)) warnings.push(`Dự án ${id} xuất hiện ở nhiều sheet tiến độ; dùng dữ liệu sheet "${s}".`);
      milestonesById.set(id, m);
    });
  }

  const projects: StellarProject[] = PROJECT_CONFIG.map((cfg) => {
    const milestones = buildMilestones(milestonesById.get(cfg.id));
    return {
      id: cfg.id,
      name: cfg.name,
      code: cfg.code,
      group: cfg.group,
      location: cfg.location,
      specs: specsById.get(cfg.id) || emptySpecs(),
      milestones,
      status: computeProjectStatus(milestones),
      progress: computeProgress(milestones),
    };
  });

  const wsGrid = sheetGrid(wb, 'TỔNG HỢP TIẾN ĐỘ');
  const engineeringWorkstreams = wsGrid.length ? parseWorkstreams(wsGrid, warnings) : [];

  const titleRow = sheets.length ? sheetGrid(wb, sheets[0]).slice(0, 3).map((r) => cellText(r?.[0])).join(' ') : '';
  const dateMatch = titleRow.match(/(\d{1,2}\/\d{1,2}\/\d{4})/);

  const kpi = computePortfolioKpi(projects);
  const metadata: PortfolioMetadata = {
    sourceUrl: opts.sourceUrl || '',
    sourceFile: opts.sourceFile || '',
    lastSyncDate: dateMatch ? dateMatch[1] : '',
    extractedAt: new Date().toISOString(),
    totalSheets: wb.SheetNames.length,
    sheets: wb.SheetNames,
    totalProjects: projects.length,
    groups: (['Cao tầng Hà Nội', 'Thấp tầng', 'Nhà ở xã hội NOXH'] as const).map((g) => ({
      name: g,
      count: projects.filter((p) => p.group === g).length,
    })),
    kpi,
    milestoneSheets: sheets,
  };

  return { projects, engineeringWorkstreams, metadata, warnings: Array.from(new Set(warnings)), milestoneSheetsUsed: sheets };
}
