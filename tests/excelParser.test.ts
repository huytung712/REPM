import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { parseWorkbook, parseVnNumber, formatExcelDate, matchProject, computePortfolioKpi } from '../src/lib/excelParser';

const file = path.join(__dirname, '..', 'sharepoint_download.xlsx');
const hasFile = fs.existsSync(file);

describe('tiện ích', () => {
  it('đọc số kiểu Việt Nam', () => {
    expect(parseVnNumber('15119,23')).toBeCloseTo(15119.23);
    expect(parseVnNumber('1.234,5')).toBeCloseTo(1234.5);
    expect(parseVnNumber(3628)).toBe(3628);
    expect(parseVnNumber('4NO: 1014 người')).toBeNull();
    expect(parseVnNumber('268 lô')).toBeNull();
  });
  it('đổi ngày Excel', () => {
    expect(formatExcelDate(46051)).toBe('29/01/2026');
    expect(formatExcelDate('22/05/26')).toBe('22/05/2026');
    expect(formatExcelDate('Không điều chỉnh TMB')).toBe('Không điều chỉnh TMB');
  });
  it('khớp tên dự án trong tiêu đề cột', () => {
    expect(matchProject('Minh Khai (4 hầm)')?.id).toBe('minh-khai');
    expect(matchProject('605 Minh Khai\r\n(P)')?.id).toBe('605-minh-khai');
    expect(matchProject('Lạc Trung')?.id).toBe('79-lac-trung');
    expect(matchProject('Vân hội ( ParkView )')?.id).toBe('parkview-van-hoi');
    expect(matchProject('MINH TÂN', 'Nhà ở xã hội NOXH')?.id).toBe('minh-tan-noxh');
    expect(matchProject('MINH TÂN', 'Thấp tầng')?.id).toBe('minh-tan-thap-tang');
  });
});

describe.skipIf(!hasFile)('đọc file Excel SharePoint', () => {
  const wb = XLSX.read(fs.readFileSync(file), { type: 'buffer' });
  const r = parseWorkbook(wb);
  const p = (id: string) => r.projects.find((x) => x.id === id)!;

  it('đọc 23 dự án và sheet tiến độ mới nhất', () => {
    expect(r.projects).toHaveLength(23);
    expect(r.milestoneSheetsUsed).toEqual(['26.2.26', '26.2.26 DA mới']);
    expect(r.metadata.lastSyncDate).toBe('26/02/2026');
  });

  it('mốc tiến độ Minh Khai khớp ô Excel (sheet 26.2.26, dòng 5–22)', () => {
    const ms = p('minh-khai').milestones;
    expect(ms[0]).toMatchObject({ plannedDate: '29/01/2026', adjustedDate: '17/04/2026', evaluationMonths: -2.6, status: 'Chậm tiến độ' });
    expect(ms[1].status).toBe('Đã hoàn thành'); // ghi chú "Hoàn thành"
  });

  it('không gán nhầm mốc 5/7/13 sang dòng của mốc 4/6 (lỗi của bộ đọc cũ)', () => {
    const ms = p('minh-khai').milestones;
    expect(ms[3].plannedDate).not.toBe(ms[4].plannedDate);
    expect(ms[5].plannedDate).not.toBe(ms[6].plannedDate);
    expect(ms[12].plannedDate).not.toBe(ms[3].plannedDate);
  });

  it('mốc có hạng mục con (8, 12) lấy từ các dòng "-"', () => {
    const m8 = p('minh-khai').milestones[7];
    expect(m8.subItems?.length).toBe(3);
    expect(m8.plannedDate).toBeTruthy();
  });

  it('không tự sinh trạng thái cho dự án không có sheet tiến độ', () => {
    for (const id of ['ia25-astor', 'bau-va', 'ngoc-hoi', 'sam-son']) {
      expect(p(id).milestones.every((m) => m.status === 'Chưa có dữ liệu')).toBe(true);
      expect(p(id).progress).toBe(0);
    }
  });

  it('chỉ tiêu theo khối được đọc từ bảng, không gán cứng', () => {
    expect(p('lai-yen').specs.totalUnits).toBe('1505');
    expect(p('lai-yen').specs.blocks.map((b) => b.name)).toEqual(['CT1', 'CT2', 'CT3']);
    expect(p('dinh-cong').specs.totalPopulation).toBe('1504'); // 1014 + 490
  });

  it('KPI không còn lỗi cộng dồn chữ số (410 triệu dân)', () => {
    const kpi = computePortfolioKpi(r.projects);
    expect(kpi.totalPopulation).toBeLessThan(100000);
    expect(kpi.totalLandAreaM2).toBe(301315);
    expect(kpi.onTrackMilestonesPercent).toBeGreaterThan(0);
    expect(kpi.onTrackMilestonesPercent).toBeLessThanOrEqual(100);
  });
});
