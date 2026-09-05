import { ServiceConnection, AiModelOption, AiProviderAuth } from '../types';

export const initialServiceConnections: ServiceConnection[] = [
  {
    id: 'zalo',
    name: 'Zalo OA & Nhóm Dự án',
    category: 'Tin nhắn & Cảnh báo tức thì',
    description: 'Kết nối Zalo ZNS và nhóm chat dự án để tự động gửi thông báo biến động tiến độ, nhắc hẹn thẩm duyệt hồ sơ pháp lý.',
    iconType: 'zalo',
    status: 'connected',
    accountName: 'Huy Tùng - Zalo Stellar PM',
    accountEmail: '0988***712',
    lastSync: 'Vừa xong (Live Webhook)',
    syncFrequency: 'realtime',
    features: [
      'Gửi cảnh báo mốc hạn 15 ngày vào nhóm Zalo dự án',
      'Gửi tóm tắt báo cáo nhanh kèm link xem trên app',
      'Đồng bộ tin nhắn chỉ đạo từ Ban Giám đốc'
    ],
    config: {
      oaId: '382910482910',
      connectedGroups: ['Nhóm DA Lại Yên - BQL', 'Nhóm DA Chu Văn An - Pháp lý', 'Ban Điều hành Stellar PM'],
      autoAlertEnabled: true
    }
  },
  {
    id: 'telegram',
    name: 'Telegram Bot & Kênh Báo cáo',
    category: 'Kênh thông báo & Bot tự động',
    description: 'Kết nối Telegram Bot @StellarRealEstate_Bot và kênh #stellar-pm-alerts để nhận radar cảnh báo chậm tiến độ 24/7.',
    iconType: 'telegram',
    status: 'connected',
    accountName: '@StellarPM_AlertBot',
    accountEmail: 'chat_id: -100293849102',
    lastSync: 'Cách đây 5 phút',
    syncFrequency: 'realtime',
    features: [
      'Radar cảnh báo tự động khi mốc pháp lý bị chậm tiến độ',
      'Tra cứu nhanh thông số dự án bằng lệnh /duan <tên_dự_án>',
      'Xuất bản tin vắn dự án định kỳ 08:00 mỗi sáng'
    ],
    config: {
      botToken: 'bot749281048:AAH***StellarSecure',
      chatId: '-100293849102',
      alertOnDelay: true
    }
  },
  {
    id: 'microsoft',
    name: 'Microsoft 365 & SharePoint',
    category: 'Dữ liệu đám mây doanh nghiệp',
    description: 'Đồng bộ hai chiều với file Excel SharePoint chính thức (10 bảng tính: CHỈ TIÊU, TIẾN ĐỘ, 26.2.26, TỔNG HỢP TIẾN ĐỘ).',
    iconType: 'microsoft',
    status: 'connected',
    accountName: 'Huy Tùng (Ban QLDA Stellar)',
    accountEmail: 'huytung712@stellar.vn',
    lastSync: 'Đã đồng bộ trực tiếp (Live Sync)',
    syncFrequency: '15m',
    features: [
      'Đồng bộ trực tiếp 23 dự án và 71 đầu việc kỹ thuật',
      'Lưu trữ hồ sơ dự án trên Microsoft OneDrive / SharePoint Team Site',
      'Lên lịch cuộc họp rà soát tiến độ qua Microsoft Teams'
    ],
    config: {
      tenantId: 'stellar-corp-tenant-01',
      sharepointUrl: 'https://stellarcorp.sharepoint.com/:x:/s/PMO/23_Projects_Master_2026.xlsx',
      autoSyncInterval: 15
    }
  },
  {
    id: 'google',
    name: 'Google Workspace & Drive',
    category: 'Hạ tầng văn phòng đám mây',
    description: 'Kết nối Google Workspace và Google Drive để lưu trữ, chia sẻ hồ sơ quy hoạch, bản vẽ CAD/PDF số hóa của 23 dự án.',
    iconType: 'google',
    status: 'connected',
    accountName: 'Huy Tùng',
    accountEmail: 'huytung712@gmail.com',
    lastSync: 'Hôm nay lúc 07:30',
    syncFrequency: 'hourly',
    features: [
      'Lưu trữ tự động hồ sơ pháp lý vào Google Drive theo từng thư mục dự án',
      'Đồng bộ mốc phê duyệt quy hoạch vào Google Calendar của Ban Quản lý',
      'Xuất bảng thống kê trực tiếp sang Google Sheets'
    ],
    config: {
      driveFolderId: '10A9fKz8L29mXkStellarDMS',
      calendarSync: true
    }
  },
  {
    id: 'gmail',
    name: 'Gmail Doanh nghiệp & Công văn',
    category: 'Thư tín & Văn thư điện tử',
    description: 'Gửi nhận thư điện tử tự động thông báo mốc thẩm duyệt PCCC, GPXD, báo cáo tuần cho Ban Giám đốc và các nhà thầu.',
    iconType: 'gmail',
    status: 'connected',
    accountName: 'Huy Tùng (PM Lead)',
    accountEmail: 'huytung712@gmail.com',
    lastSync: 'Sẵn sàng gửi/nhận',
    syncFrequency: 'realtime',
    features: [
      'Tự động gửi email báo cáo tiến độ định kỳ sáng thứ Hai',
      'Cảnh báo công văn đến hạn phản hồi của cơ quan Nhà nước',
      'Mẫu email gửi Đơn vị tư vấn thiết kế và Nhà thầu chuẩn hóa'
    ],
    config: {
      senderEmail: 'huytung712@gmail.com',
      autoWeeklyReport: true,
      executiveCc: ['bld@stellar.vn', 'pmo@stellar.vn']
    }
  },
  {
    id: 'notebooklm',
    name: 'Google NotebookLM',
    category: 'Kho Tri thức & RAG Đa nguồn',
    description: 'Kết nối sổ tay trí tuệ nhân tạo NotebookLM với toàn bộ kho tài liệu, báo cáo NCKT và 15 mốc pháp lý của 23 dự án BĐS.',
    iconType: 'notebooklm',
    status: 'connected',
    accountName: 'Stellar Real Estate Knowledge Base',
    accountEmail: 'notebooklm-source-23-projects',
    lastSync: 'Đã lập chỉ mục 23 dự án',
    syncFrequency: 'daily',
    features: [
      'Truy vấn RAG văn bản pháp lý, quy chuẩn xây dựng QCVN',
      'Tóm tắt các biên bản họp giao ban công trường đa nguồn',
      'Trích dẫn chính xác số công văn và điều khoản phê duyệt'
    ],
    config: {
      notebookId: 'nb-stellar-pmo-2026',
      indexedSourcesCount: 23,
      ragConfidence: '99.4%'
    }
  },
  {
    id: 'onedrive',
    name: 'Microsoft OneDrive',
    category: 'Lưu trữ đám mây & Bản vẽ hồ sơ',
    description: 'Đồng bộ và lưu trữ thư mục tài liệu dự án, hồ sơ pháp lý, bản vẽ CAD/PDF, file tổng hợp tiến độ Excel dung lượng lớn.',
    iconType: 'onedrive',
    status: 'connected',
    accountName: 'Huy Tùng - OneDrive For Business',
    accountEmail: 'huytung712@stellar.vn',
    lastSync: 'Vừa đồng bộ (Cloud Sync)',
    syncFrequency: 'realtime',
    features: [
      'Tự động đồng bộ bản vẽ quy hoạch 1/500 và hồ sơ thiết kế cơ sở 23 dự án',
      'Tạo liên kết chia sẻ nội bộ có phân quyền và bảo mật thời hạn',
      'Đồng bộ 2 chiều thư mục máy tính qua OneDrive Desktop Client'
    ],
    config: {
      folderPath: 'OneDrive - Stellar Corp/DMS_DuAn_2026',
      storageQuota: '1 TB Doanh nghiệp',
      autoBackupDrawings: true
    }
  },
  {
    id: 'teams',
    name: 'Microsoft Teams',
    category: 'Họp trực tuyến & Kênh điều hành PMO',
    description: 'Kết nối các nhóm làm việc của Ban QLDA, tự động phát thông báo họp giao ban tuần, rà soát tiến độ và điều hành dự án.',
    iconType: 'teams',
    status: 'connected',
    accountName: 'Stellar Project Management Office (PMO)',
    accountEmail: 'teams-pmo@stellar.vn',
    lastSync: 'Kênh trực tuyến hoạt động',
    syncFrequency: 'realtime',
    features: [
      'Tự động tạo lịch họp rà soát tiến độ tuần qua Microsoft Teams Meeting',
      'Phát thẻ cảnh báo mốc hạn thẩm duyệt hồ sơ trực tiếp vào kênh dự án',
      'Tích hợp bảng điều khiển Stellar PM vào tab kênh làm việc của từng dự án'
    ],
    config: {
      teamName: 'Ban QLDA Stellar Real Estate',
      defaultChannel: 'Tiến độ & Pháp lý 23 Dự Án',
      meetingScheduler: true
    }
  }
];

export const availableAiModels: AiModelOption[] = [
  // Google Gemini Models
  {
    id: 'gemini-3.6-flash',
    name: 'Gemini 3.6 Flash',
    provider: 'gemini',
    description: 'Mô hình đa phương thức thế hệ mới nhất, tối ưu cho việc theo dõi 15 mốc tiến độ và tra cứu 18 chỉ tiêu quy hoạch.',
    level: 'fast',
    levelLabel: 'Phản hồi siêu nhanh (Tối ưu tiến độ)',
    contextWindow: '1M tokens',
    badge: 'Khuyên dùng'
  },
  {
    id: 'gemini-3.1-pro-preview',
    name: 'Gemini 3.1 Pro',
    provider: 'gemini',
    description: 'Mô hình tư duy chuyên sâu, phân tích xung đột pháp lý, kiểm tra độ lệch ngày duyệt và soạn thảo báo cáo cao cấp.',
    level: 'deep',
    levelLabel: 'Suy luận chuyên sâu (Phân tích pháp lý)',
    contextWindow: '2M tokens',
    badge: 'Pro Reasoning'
  },
  {
    id: 'gemini-3.1-flash-lite',
    name: 'Gemini 3.1 Flash-Lite',
    provider: 'gemini',
    description: 'Phiên bản gọn nhẹ, phản hồi tức thì với độ trễ cực thấp cho các câu hỏi tra cứu thông số đơn lẻ.',
    level: 'fast',
    levelLabel: 'Tức thì (Tiết kiệm)',
    contextWindow: '500K tokens'
  },

  // OpenAI / ChatGPT Models
  {
    id: 'gpt-4o',
    name: 'ChatGPT GPT-4o',
    provider: 'openai',
    description: 'Mô hình hàng đầu của OpenAI, hỗ trợ phân tích bản vẽ, đọc dữ liệu file đính kèm và phản hồi sắc sảo.',
    level: 'balanced',
    levelLabel: 'Cân bằng & Đa năng (Omni)',
    contextWindow: '128K tokens',
    badge: 'OpenAI Flagship'
  },
  {
    id: 'gpt-4o-mini',
    name: 'ChatGPT GPT-4o mini',
    provider: 'openai',
    description: 'Phiên bản tinh gọn, xử lý nhanh các tác vụ tra cứu, phân loại nhiệm vụ thiết kế tuần.',
    level: 'fast',
    levelLabel: 'Nhanh & Tối ưu chi phí',
    contextWindow: '128K tokens'
  },
  {
    id: 'o3-mini',
    name: 'OpenAI o3-mini (Reasoning)',
    provider: 'openai',
    description: 'Mô hình suy luận toán học và logic chuyên sâu, thẩm tra công thức diện tích sàn HSSDD, BOQ và mật độ.',
    level: 'deep',
    levelLabel: 'Suy luận logic toán học & BOQ',
    contextWindow: '200K tokens',
    badge: 'Reasoning'
  },

  // Anthropic Claude Models
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'claude',
    description: 'Mô hình thế hệ mới nhất với năng lực tư duy hybrid, văn phong hành chính chỉn chu cho báo cáo Ban Giám đốc.',
    level: 'deep',
    levelLabel: 'Tư duy hybrid & Báo cáo chuyên nghiệp',
    contextWindow: '200K tokens',
    badge: 'Mới nhất'
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'claude',
    description: 'Chuyên gia rà soát kỹ thuật, cấu trúc các mốc thiết kế kiến trúc, kết cấu và hồ sơ cơ điện MEP.',
    level: 'balanced',
    levelLabel: 'Chuyên gia Kỹ thuật & Thiết kế',
    contextWindow: '200K tokens'
  },
  {
    id: 'claude-3-5-haiku',
    name: 'Claude 3.5 Haiku',
    provider: 'claude',
    description: 'Phản hồi chớp nhoáng, tối ưu cho tra cứu nhanh trạng thái 71 đầu việc kỹ thuật.',
    level: 'fast',
    levelLabel: 'Siêu tốc độ',
    contextWindow: '200K tokens'
  }
];

export const initialAiProviderAuths: Record<string, AiProviderAuth> = {
  gemini: {
    providerId: 'gemini',
    name: 'Google Gemini AI',
    isLoggedIn: true,
    accountEmail: 'huytung712@gmail.com (Stellar Enterprise License)',
    connectedAt: '2026-09-01T08:00:00Z',
    tokenBalance: 'Không giới hạn (Enterprise)'
  },
  openai: {
    providerId: 'openai',
    name: 'ChatGPT / OpenAI',
    isLoggedIn: true,
    accountEmail: 'huytung712@stellar.vn (ChatGPT Team / Plus)',
    connectedAt: '2026-09-02T10:30:00Z',
    tokenBalance: '$120.00 Credits'
  },
  claude: {
    providerId: 'claude',
    name: 'Claude AI (Anthropic)',
    isLoggedIn: true,
    accountEmail: 'huytung712@gmail.com (Claude Pro / API Tier 4)',
    connectedAt: '2026-09-03T14:15:00Z',
    tokenBalance: '$95.50 Credits'
  }
};
