import { DataIntakeItem, DataIntakeTag } from '../types';

export const INTEGRATED_SYSTEM_TAGS: DataIntakeTag[] = [
  { id: 'tag-1', name: 'Quy hoạch 1/500', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { id: 'tag-2', name: 'Quy hoạch 1/2000', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  { id: 'tag-3', name: 'Thẩm định BCNCKT', color: 'bg-cyan-100 text-cyan-800 border-cyan-200' },
  { id: 'tag-4', name: 'PCCC & Cứu nạn', color: 'bg-rose-100 text-rose-800 border-rose-200' },
  { id: 'tag-5', name: 'Giấy phép xây dựng (GPXD)', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
  { id: 'tag-6', name: 'Bản vẽ BVTC & Kết cấu', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  { id: 'tag-7', name: 'Báo cáo ĐTM Môi trường', color: 'bg-teal-100 text-teal-800 border-teal-200' },
  { id: 'tag-8', name: 'Khảo sát địa chất & Thủy văn', color: 'bg-slate-100 text-slate-800 border-slate-200' },
  { id: 'tag-9', name: 'Hồ sơ GPMB & Thu hồi đất', color: 'bg-orange-100 text-orange-800 border-orange-200' },
  { id: 'tag-10', name: 'Dự toán & BOQ Đấu thầu', color: 'bg-violet-100 text-violet-800 border-violet-200' },
  { id: 'tag-11', name: 'Báo cáo tiến độ tuần PMO', color: 'bg-sky-100 text-sky-800 border-sky-200' },
  { id: 'tag-12', name: 'Pháp lý Quyết định giao đất', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { id: 'tag-13', name: 'Biên bản nghiệm thu công trình', color: 'bg-lime-100 text-lime-800 border-lime-200' },
  { id: 'tag-14', name: 'Tài chính & Tiền sử dụng đất', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' }
];

export const initialDataIntakeItems: DataIntakeItem[] = [
  {
    id: 'intake-1',
    title: 'Bang_Tong_Hop_Tien_Do_Tuan_26_2_LaiYen_SharePoint.xlsx',
    sourceType: 'sharepoint',
    sourceUrl: 'https://stellarvn-my.sharepoint.com/:x:/g/personal/mystellar/LaiYen_TienDo_2602.xlsx',
    fileName: 'Bang_Tong_Hop_Tien_Do_Tuan_26_2_LaiYen_SharePoint.xlsx',
    fileSize: '4.8 MB',
    fileExtension: 'xlsx',
    rawContentSnippet: 'Dữ liệu đồng bộ từ SharePoint: 10 bảng tính cập nhật tiến độ thi công hạ tầng kỹ thuật và giải ngân gói thầu san nền dự án Lại Yên đến ngày 26/02/2026.',
    aiAnalysis: {
      analyzedAt: '05/09/2026 14:15',
      confidence: 98,
      suggestedProjectId: 'lai-yen',
      suggestedProjectName: 'Dự án Lại Yên',
      suggestedMilestoneIndex: 8,
      suggestedMilestoneTitle: 'Lập TK BVTC, thẩm tra, BOQ',
      summary: 'Bảng tổng hợp tiến độ tuần ghi nhận gói hạ tầng Lại Yên đang vượt tiến độ 3 ngày so với kế hoạch ban đầu.',
      reasoning: 'Phát hiện từ khóa "LaiYen", "Lại Yên", cấu trúc bảng tính 10 sheet trùng khớp với SharePoint dự án Lại Yên.',
      priority: 'high',
      suggestedTags: [
        { id: 'tag-11', name: 'Báo cáo tiến độ tuần PMO', isAiSuggested: false },
        { id: 'tag-10', name: 'Dự toán & BOQ Đấu thầu', isAiSuggested: false },
        { id: 'tag-ai-1', name: 'Cập nhật SharePoint 26.2.26', isAiSuggested: true }
      ]
    },
    finalProjectId: 'lai-yen',
    finalProjectName: 'Dự án Lại Yên',
    finalMilestoneIndex: 8,
    finalMilestoneTitle: 'Lập TK BVTC, thẩm tra, BOQ',
    finalTags: [
      { id: 'tag-11', name: 'Báo cáo tiến độ tuần PMO', isAiSuggested: false },
      { id: 'tag-10', name: 'Dự toán & BOQ Đấu thầu', isAiSuggested: false },
      { id: 'tag-ai-1', name: 'Cập nhật SharePoint 26.2.26', isAiSuggested: true }
    ],
    status: 'pending_review',
    createdAt: '05/09/2026 14:15',
    createdBy: 'Hệ thống SharePoint Sync'
  },
  {
    id: 'intake-2',
    title: 'Ho_so_Dieu_chinh_TMB_1-500_ChuVanAn_Dot_3_Trinh_So.pdf',
    sourceType: 'file',
    fileName: 'Ho_so_Dieu_chinh_TMB_1-500_ChuVanAn_Dot_3_Trinh_So.pdf',
    fileSize: '32.4 MB',
    fileExtension: 'pdf',
    rawContentSnippet: 'Tờ trình số 45/TTr-BQLDA gửi Sở Quy hoạch - Kiến trúc Hà Nội về việc điều chỉnh cục bộ tổng mặt bằng 1/500 phần khối đế thương mại dịch vụ dự án Chu Văn An.',
    aiAnalysis: {
      analyzedAt: '05/09/2026 11:30',
      confidence: 96,
      suggestedProjectId: 'chu-van-an',
      suggestedProjectName: 'Dự án Chu Văn An',
      suggestedMilestoneIndex: 2,
      suggestedMilestoneTitle: 'Chấp thuận TMB/QHCT',
      summary: 'Hồ sơ điều chỉnh chỉ tiêu tầng cao khối đế và lối tiếp cận giao thông nội khu dự án Chu Văn An.',
      reasoning: 'Khớp tên dự án Chu Văn An, văn bản trình duyệt Quy hoạch 1/500 thuộc Mốc số 2.',
      priority: 'high',
      suggestedTags: [
        { id: 'tag-1', name: 'Quy hoạch 1/500', isAiSuggested: false },
        { id: 'tag-ai-2', name: 'Điều chỉnh cục bộ khối đế', isAiSuggested: true },
        { id: 'tag-ai-3', name: 'Văn bản Sở QHKT Hà Nội', isAiSuggested: true }
      ]
    },
    finalProjectId: 'chu-van-an',
    finalProjectName: 'Dự án Chu Văn An',
    finalMilestoneIndex: 2,
    finalMilestoneTitle: 'Chấp thuận TMB/QHCT',
    finalTags: [
      { id: 'tag-1', name: 'Quy hoạch 1/500', isAiSuggested: false },
      { id: 'tag-ai-2', name: 'Điều chỉnh cục bộ khối đế', isAiSuggested: true },
      { id: 'tag-ai-3', name: 'Văn bản Sở QHKT Hà Nội', isAiSuggested: true }
    ],
    status: 'pending_review',
    createdAt: '05/09/2026 11:28',
    createdBy: 'Ban Quản lý Thiết kế'
  },
  {
    id: 'intake-3',
    title: 'Liên kết OneDrive: Thư mục Bản vẽ BVTC & Kết cấu phần ngầm Ngọc Xuyên',
    sourceType: 'onedrive',
    sourceUrl: 'https://stellarvn-my.sharepoint.com/:f:/r/personal/mystellar/OneDrive/BVTC_NgocXuyen_2026',
    rawContentSnippet: 'Liên kết OneDrive đồng bộ 14 bản vẽ kết cấu móng băng và hạ tầng ngầm khu biệt thự Ngọc Xuyên.',
    aiAnalysis: {
      analyzedAt: '04/09/2026 16:45',
      confidence: 95,
      suggestedProjectId: 'ngoc-xuyen',
      suggestedProjectName: 'Dự án Ngọc Xuyên',
      suggestedMilestoneIndex: 8,
      suggestedMilestoneTitle: 'Lập TK BVTC, thẩm tra, BOQ',
      summary: 'Thư mục bản vẽ thiết kế bản vẽ thi công phần ngầm đã qua thẩm tra nội bộ của đơn vị tư vấn.',
      reasoning: 'Khớp định danh Ngọc Xuyên, các tệp bản vẽ BVTC hạ ngầm thuộc mốc 8 và mốc 13.',
      priority: 'medium',
      suggestedTags: [
        { id: 'tag-6', name: 'Bản vẽ BVTC & Kết cấu', isAiSuggested: false },
        { id: 'tag-ai-4', name: 'OneDrive Đồng bộ Cloud', isAiSuggested: true }
      ]
    },
    finalProjectId: 'ngoc-xuyen',
    finalProjectName: 'Dự án Ngọc Xuyên',
    finalMilestoneIndex: 8,
    finalMilestoneTitle: 'Lập TK BVTC, thẩm tra, BOQ',
    finalTags: [
      { id: 'tag-6', name: 'Bản vẽ BVTC & Kết cấu', isAiSuggested: false },
      { id: 'tag-ai-4', name: 'OneDrive Đồng bộ Cloud', isAiSuggested: true }
    ],
    status: 'approved',
    adminNotes: 'Admin Huy Tùng đã duyệt và phân bổ vào hồ sơ thiết kế dự án Ngọc Xuyên.',
    reviewedAt: '04/09/2026 17:10',
    reviewedBy: 'Admin Huy Tùng',
    createdAt: '04/09/2026 16:40',
    createdBy: 'Kỹ sư trưởng PMO'
  },
  {
    id: 'intake-4',
    title: 'Văn bản Sở Xây Dựng: Thông báo kết quả thẩm định BCNCKT Dự án Định Công',
    sourceType: 'link',
    sourceUrl: 'https://sxd.hanoi.gov.vn/van-ban/thong-bao-tham-dinh-bcnckt-dinh-cong-2026.pdf',
    rawContentSnippet: 'Thông báo số 182/TB-SXD của Sở Xây dựng Hà Nội về việc chấp thuận kết quả thẩm định hồ sơ Báo cáo nghiên cứu khả thi dự án khu phức hợp Định Công.',
    aiAnalysis: {
      analyzedAt: '03/09/2026 09:20',
      confidence: 97,
      suggestedProjectId: 'dinh-cong',
      suggestedProjectName: 'Dự án Định Công',
      suggestedMilestoneIndex: 6,
      suggestedMilestoneTitle: 'Thẩm định hồ sơ BCNCKT',
      summary: 'Sở Xây dựng đã thông qua hồ sơ BCNCKT dự án Định Công, mở đường cho bước xin Giấy phép xây dựng.',
      reasoning: 'Văn bản chính thức của Sở Xây dựng xác nhận thông qua thẩm định BCNCKT cho Dự án Định Công.',
      priority: 'high',
      suggestedTags: [
        { id: 'tag-3', name: 'Thẩm định BCNCKT', isAiSuggested: false },
        { id: 'tag-ai-5', name: 'Công văn chấp thuận Sở Xây Dựng', isAiSuggested: true },
        { id: 'tag-ai-6', name: 'Mốc pháp lý trọng yếu', isAiSuggested: true }
      ]
    },
    finalProjectId: 'dinh-cong',
    finalProjectName: 'Dự án Định Công',
    finalMilestoneIndex: 6,
    finalMilestoneTitle: 'Thẩm định hồ sơ BCNCKT',
    finalTags: [
      { id: 'tag-3', name: 'Thẩm định BCNCKT', isAiSuggested: false },
      { id: 'tag-ai-5', name: 'Công văn chấp thuận Sở Xây Dựng', isAiSuggested: true },
      { id: 'tag-ai-6', name: 'Mốc pháp lý trọng yếu', isAiSuggested: true }
    ],
    status: 'approved',
    adminNotes: 'Admin Huy Tùng xác nhận chuyển mốc số 6 của Dự án Định Công sang trạng thái Hoàn thành.',
    reviewedAt: '03/09/2026 10:00',
    reviewedBy: 'Admin Huy Tùng',
    createdAt: '03/09/2026 09:15',
    createdBy: 'Ban Pháp chế Đầu tư'
  },
  {
    id: 'intake-5',
    title: 'Bien_Ban_Khao_Sat_Dia_Chat_Cong_Trinh_14_Du_An_Cao_Tang.pdf',
    sourceType: 'file',
    fileName: 'Bien_Ban_Khao_Sat_Dia_Chat_Cong_Trinh_14_Du_An_Cao_Tang.pdf',
    fileSize: '18.9 MB',
    fileExtension: 'pdf',
    rawContentSnippet: 'Số liệu quan trắc mực nước ngầm và kết quả thí nghiệm nén tĩnh cọc khoan nhồi cho cụm các ô đất cao tầng khu vực Tây Hà Nội.',
    aiAnalysis: {
      analyzedAt: '05/09/2026 08:40',
      confidence: 91,
      suggestedProjectId: 'cao-tang-hn',
      suggestedProjectName: '14 Dự án cao tầng Hà Nội',
      suggestedMilestoneIndex: 8,
      suggestedMilestoneTitle: 'Lập TK BVTC, thẩm tra, BOQ',
      summary: 'Báo cáo trắc đạc và địa chất phục vụ hoàn thiện thiết kế móng sâu cho khối tháp cao tầng.',
      reasoning: 'Trùng khớp nhóm 14 dự án cao tầng Hà Nội và bộ tiêu chuẩn thí nghiệm địa chất công trình.',
      priority: 'medium',
      suggestedTags: [
        { id: 'tag-8', name: 'Khảo sát địa chất & Thủy văn', isAiSuggested: false },
        { id: 'tag-ai-7', name: 'Thí nghiệm nén tĩnh cọc', isAiSuggested: true }
      ]
    },
    finalProjectId: 'cao-tang-hn',
    finalProjectName: '14 Dự án cao tầng Hà Nội',
    finalMilestoneIndex: 8,
    finalMilestoneTitle: 'Lập TK BVTC, thẩm tra, BOQ',
    finalTags: [
      { id: 'tag-8', name: 'Khảo sát địa chất & Thủy văn', isAiSuggested: false },
      { id: 'tag-ai-7', name: 'Thí nghiệm nén tĩnh cọc', isAiSuggested: true }
    ],
    status: 'pending_review',
    createdAt: '05/09/2026 08:35',
    createdBy: 'KS. Địa chất Stellar'
  }
];
