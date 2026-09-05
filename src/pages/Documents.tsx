import React, { useState, useMemo } from 'react';
import { stellarProjects } from '../data/stellarData';
import { 
  FileText, 
  Upload, 
  FileSpreadsheet, 
  Image as ImageIcon, 
  File, 
  Download, 
  Search, 
  Filter, 
  ExternalLink,
  FolderKanban,
  CheckCircle2,
  Share2,
  Printer,
  FileDown
} from 'lucide-react';

interface ProjectDoc {
  id: string;
  projectId: string;
  projectName: string;
  name: string;
  category: string;
  size: string;
  type: 'pdf' | 'excel' | 'image' | 'cad';
  uploadedAt: string;
  uploadedBy: string;
}

export default function Documents() {
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  // Initial rich document repository linked to real projects
  const [documents, setDocuments] = useState<ProjectDoc[]>([
    {
      id: 'doc-1',
      projectId: 'lai-yen',
      projectName: 'Dự án Lại Yên',
      name: 'Quy_hoach_Tong_mat_bang_1-500_LaiYen_V3.pdf',
      category: 'Quy hoạch & Thiết kế',
      size: '14.2 MB',
      type: 'pdf',
      uploadedAt: '24/02/2026',
      uploadedBy: 'KTS. Trưởng nhóm TK'
    },
    {
      id: 'doc-2',
      projectId: 'lai-yen',
      projectName: 'Dự án Lại Yên',
      name: 'Ho_so_Bao_cao_NCKT_Tham_dinh_So_XD.pdf',
      category: 'Pháp lý & BCNCKT',
      size: '28.6 MB',
      type: 'pdf',
      uploadedAt: '20/02/2026',
      uploadedBy: 'Ban QLDA'
    },
    {
      id: 'doc-3',
      projectId: 'chu-van-an',
      projectName: 'Dự án Chu Văn An',
      name: 'Ban_ve_BVTC_Phan_Ngam_Mong_Ham_CVA.dwg',
      category: 'Bản vẽ BVTC & Kết cấu',
      size: '42.1 MB',
      type: 'cad',
      uploadedAt: '18/02/2026',
      uploadedBy: 'KS. Kết cấu'
    },
    {
      id: 'doc-4',
      projectId: 'chu-van-an',
      projectName: 'Dự án Chu Văn An',
      name: 'Bang_tien_do_tong_the_dieu_chinh_Lan_1.xlsx',
      category: 'Tiến độ & BOQ',
      size: '3.8 MB',
      type: 'excel',
      uploadedAt: '26/02/2026',
      uploadedBy: 'Điều phối Stellar'
    },
    {
      id: 'doc-5',
      projectId: 'ngoc-xuyen',
      projectName: 'Dự án Ngọc Xuyên',
      name: 'Giay_phep_tham_duyet_PCCC_Bo_Cong_An.pdf',
      category: 'Pháp lý & PCCC',
      size: '8.4 MB',
      type: 'pdf',
      uploadedAt: '12/02/2026',
      uploadedBy: 'Ban Pháp chế'
    },
    {
      id: 'doc-6',
      projectId: 'dinh-cong',
      projectName: 'Dự án Định Công',
      name: 'Khao_sat_dia_chat_va_dau_noi_HTKT.pdf',
      category: 'Khảo sát & HTKT',
      size: '19.5 MB',
      type: 'pdf',
      uploadedAt: '15/02/2026',
      uploadedBy: 'Đoàn khảo sát'
    },
    {
      id: 'doc-7',
      projectId: 'duc-giang',
      projectName: 'Dự án Đức Giang',
      name: 'Bao_cao_tong_hop_tien_do_hang_tuan_BGD.pdf',
      category: 'Báo cáo Định kỳ BGD',
      size: '5.2 MB',
      type: 'pdf',
      uploadedAt: '26/02/2026',
      uploadedBy: 'Huy Tùng (Admin)'
    }
  ]);

  const categories = [
    'Tất cả loại hồ sơ',
    'Quy hoạch & Thiết kế',
    'Pháp lý & BCNCKT',
    'Bản vẽ BVTC & Kết cấu',
    'Pháp lý & PCCC',
    'Tiến độ & BOQ',
    'Khảo sát & HTKT',
    'Báo cáo Định kỳ BGD'
  ];

  const filteredDocs = useMemo(() => {
    return documents.filter((doc) => {
      const matchProject = selectedProject === 'all' || doc.projectId === selectedProject;
      const matchCategory = selectedCategory === 'all' || selectedCategory === 'Tất cả loại hồ sơ' || doc.category === selectedCategory;
      const matchSearch = !searchQuery ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchProject && matchCategory && matchSearch;
    });
  }, [documents, selectedProject, selectedCategory, searchQuery]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    
    const targetProject = selectedProject === 'all' ? stellarProjects[0] : (stellarProjects.find(p => p.id === selectedProject) || stellarProjects[0]);

    const newDoc: ProjectDoc = {
      id: 'doc-' + Date.now(),
      projectId: targetProject.id,
      projectName: targetProject.name,
      name: file.name,
      category: selectedCategory === 'all' || selectedCategory === 'Tất cả loại hồ sơ' ? 'Hồ sơ Tải lên' : selectedCategory,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.name.endsWith('.xlsx') || file.name.endsWith('.xls') ? 'excel' : (file.name.endsWith('.png') || file.name.endsWith('.jpg') ? 'image' : 'pdf'),
      uploadedAt: new Date().toLocaleDateString('vi-VN'),
      uploadedBy: 'Huy Tùng (Admin)'
    };

    setDocuments(prev => [newDoc, ...prev]);
    setIsUploading(false);
  };

  const exportBGDReportPDF = () => {
    window.print();
  };

  const getDocIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileText className="text-red-500" size={20} />;
      case 'excel': return <FileSpreadsheet className="text-emerald-600" size={20} />;
      case 'image': return <ImageIcon className="text-blue-500" size={20} />;
      default: return <File className="text-indigo-500" size={20} />;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-xl text-white relative overflow-hidden">
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-semibold uppercase tracking-wider">
                Kho Lưu Trữ Đám Mây & Hồ Sơ Dự Án
              </span>
              <span className="px-2.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-medium">
                Bảo mật Đa tầng
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Hồ Sơ Bản Vẽ & Báo Cáo Định Kỳ Ban Giám Đốc</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Quản lý tập trung hồ sơ quy hoạch, thẩm định PCCC, bản vẽ thi công BVTC và xuất báo cáo tiến độ định kỳ cho 23 dự án.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={exportBGDReportPDF}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold border border-white/10 shadow-sm transition-all"
            >
              <Printer size={15} />
              <span>In / Xuất Báo Cáo PDF</span>
            </button>

            <label className="flex items-center space-x-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold cursor-pointer shadow-md transition-all">
              <Upload size={15} />
              <span>Tải Lên Hồ Sơ Mới</span>
              <input type="file" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Project Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Lọc theo dự án:</label>
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả 23 dự án Stellar</option>
              {stellarProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.code})
                </option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Hạng mục hồ sơ:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {categories.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Search Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tìm kiếm tên tài liệu:</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Nhập tên văn bản, bản vẽ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Danh sách Hồ sơ & Bản vẽ ({filteredDocs.length} tài liệu)
          </span>
          <span className="text-xs text-slate-400">
            Lưu trữ mã hóa đám mây
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100/70 text-slate-600 font-semibold uppercase tracking-wider text-[10px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 min-w-[240px]">Tên Tài Liệu & Hồ Sơ</th>
                <th className="py-3 px-3 min-w-[150px]">Dự Án Áp Dụng</th>
                <th className="py-3 px-3 min-w-[130px]">Phân Loại</th>
                <th className="py-3 px-3 text-center">Dung Lượng</th>
                <th className="py-3 px-3">Người Cập Nhật</th>
                <th className="py-3 px-3 text-center">Ngày Tải Lên</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    <div className="flex items-center space-x-3">
                      {getDocIcon(doc.type)}
                      <span className="truncate max-w-sm">{doc.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 font-medium text-indigo-700">
                    {doc.projectName}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-medium">
                      {doc.category}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-center font-mono text-slate-500">{doc.size}</td>
                  <td className="py-3 px-3 text-slate-700 font-medium">{doc.uploadedBy}</td>
                  <td className="py-3 px-3 text-center text-slate-500 font-mono">{doc.uploadedAt}</td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => alert(`Tải xuống tệp: ${doc.name}`)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors"
                        title="Tải về"
                      >
                        <Download size={15} />
                      </button>
                      <button
                        onClick={() => alert(`Sao chép liên kết chia sẻ cho tệp: ${doc.name}`)}
                        className="p-1.5 hover:bg-slate-100 text-slate-600 hover:text-indigo-600 rounded-lg transition-colors"
                        title="Chia sẻ"
                      >
                        <Share2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
