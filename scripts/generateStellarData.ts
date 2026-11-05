/**
 * Tạo dữ liệu khởi tạo src/data/stellarPortfolio.json từ file Excel SharePoint.
 *   npm run data:generate                     # dùng sharepoint_download.xlsx
 *   npm run data:generate -- path/to/file.xlsx
 * Dùng chung bộ đọc với trang "Nhập dữ liệu Excel" (src/lib/excelParser.ts).
 */
import fs from 'fs';
import path from 'path';
import * as XLSX from 'xlsx';
import { parseWorkbook } from '../src/lib/excelParser';

const input = process.argv[2] || path.join(process.cwd(), 'sharepoint_download.xlsx');
const wb = XLSX.read(fs.readFileSync(input), { type: 'buffer' });
const { projects, engineeringWorkstreams, metadata, warnings, milestoneSheetsUsed } = parseWorkbook(wb, {
  sourceFile: path.basename(input),
  sourceUrl:
    'https://stellarvn-my.sharepoint.com/:x:/g/personal/mystellar_stellar_com_vn/IQA4GaKibvU-TrLPXR2svPGHAd-LobqrbWKx_e-_aUULN08',
});

const out = path.join(process.cwd(), 'src/data/stellarPortfolio.json');
fs.writeFileSync(out, JSON.stringify({ metadata, projects, engineeringWorkstreams }, null, 2), 'utf-8');

console.log(`Sheet tiến độ: ${milestoneSheetsUsed.join(', ')}`);
console.log(`Dự án: ${projects.length} | Hạng mục thiết kế: ${engineeringWorkstreams.length}`);
console.log('KPI:', JSON.stringify(metadata.kpi));
if (warnings.length) console.log('Cảnh báo:\n - ' + warnings.join('\n - '));
