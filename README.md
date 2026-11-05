# Stellar Real Estate PM — Quản lý tiến độ dự án BĐS

Ứng dụng web theo dõi danh mục dự án, 15 mốc pháp lý/xây dựng, công việc và tài liệu.
React 19 + Vite + Tailwind, dữ liệu trên Firebase (Auth + Firestore), server Express cho trợ lý AI (Gemini).

## Tính năng đang hoạt động

| Tính năng | Lưu ở đâu | Ghi chú |
|---|---|---|
| Đăng nhập Google / email, phân quyền 3 vai trò | Firebase Auth + `users` | Người dùng mới = Chỉ xem; Quản trị viên đổi vai trò ở **Cài đặt** |
| Danh mục dự án, chỉ tiêu quy hoạch | `projects` | Đọc từ sheet CHỈ TIÊU |
| 15 mốc tiến độ: sửa ngày, ngày thực tế, trạng thái, ghi chú | `projects.milestones` | Ghi người sửa và thời điểm sửa; cảnh báo mốc đã qua ngày mà chưa hoàn thành |
| Kanban công việc theo dự án (kéo thả) | `tasks` | Người phụ trách, hạn, ưu tiên, gắn mốc |
| Danh mục tài liệu (liên kết SharePoint/OneDrive/Drive) | `documents` | Tệp gốc vẫn ở kho của công ty |
| Nhập Excel từ SharePoint: xem trước thay đổi rồi ghi | `projects`, `workstreams`, `meta` | Chỉ Quản trị viên |
| Nhật ký thay đổi (chỉ ghi thêm) | `activity` | |
| Bảng điều khiển KPI | tính từ dữ liệu | Ghi rõ số dự án có số liệu |
| Trợ lý AI | server `/api/ai/assistant` | Cần `GEMINI_API_KEY` |

**Chưa triển khai (đang gắn nhãn "bản demo" trên giao diện):** trang Kết nối (Zalo, Telegram, M365, Google…), cổng Data Intake (chỉ lưu trong trình duyệt), đăng nhập OpenAI/Claude trên trang Trợ lý AI, email báo cáo định kỳ, đồng bộ SharePoint tự động.

## Vai trò

| Vai trò | Xem | Sửa mốc / công việc / tài liệu | Nhập Excel, phân quyền |
|---|---|---|---|
| Chỉ xem (`viewer`) | ✔ | | |
| Quản lý (`manager`) | ✔ | ✔ | |
| Quản trị (`admin`) | ✔ | ✔ | ✔ |

Tài khoản quản trị khởi tạo: email khai báo trong `firestore.rules` (`isBootstrapAdmin`) và `src/store.ts` (`BOOTSTRAP_ADMIN_EMAIL`).

## Triển khai lần đầu (checklist)

1. **Firebase Console → Authentication → Sign-in method**: bật *Google* và *Email/Password*.
2. **Authentication → Settings → Authorized domains**: thêm tên miền đang chạy ứng dụng.
3. **Firestore → Rules**: dán nội dung `firestore.rules` rồi *Publish*, hoặc chạy:
   ```bash
   npx firebase deploy --only firestore:rules --project <project-id>
   ```
   Lưu ý: ứng dụng dùng database có tên (`firestoreDatabaseId` trong `firebase-applet-config.json`). Phải áp rules cho **đúng database đó**.
4. Đăng nhập bằng email quản trị → bấm **Khởi tạo dữ liệu lên Firestore** trên banner vàng.
5. Mời người dùng đăng nhập, sau đó vào **Cài đặt & phân quyền** để cấp vai trò *Quản lý*.

## Cập nhật dữ liệu từ Excel (SOP hằng tuần)

1. Mở file Excel trên SharePoint → *File → Tải xuống bản sao*.
2. Vào **Nhập dữ liệu Excel** → chọn file.
3. Kiểm tra: các sheet tiến độ được chọn (mặc định là bộ sheet mới nhất), mục cảnh báo, danh sách thay đổi.
4. Chọn có giữ các mốc đã sửa tay trên hệ thống hay không → **Ghi vào hệ thống**.

Bộ đọc (`src/lib/excelParser.ts`) nhận diện cột theo **tên dự án ở dòng tiêu đề**, không theo vị trí cột cố định. Mỗi sheet tiến độ cần có dạng
`TT | Công việc | <Dự án>` và 4 cột cho mỗi dự án (Phê duyệt | Hiện tại | Đánh giá | Ghi chú). Dự án mới phải được thêm vào
`PROJECT_CONFIG` trong file đó.

### Quy tắc tính

- **Trạng thái mốc** (khi nhập Excel): ghi chú bắt đầu bằng "Hoàn thành / Đã có / Đã được phê duyệt…" → *Đã hoàn thành*; không có ngày → *Chưa có dữ liệu*; cột Đánh giá < 0 → *Chậm tiến độ*; còn lại → *Đúng tiến độ*.
- **Đánh giá (tháng)** = (ngày phê duyệt − ngày hiện tại) / 30 ngày; giá trị âm nghĩa là chậm.
- **Tiến độ dự án (%)** = số mốc *Đã hoàn thành* / 15.
- **Quá hạn – cần cập nhật**: ngày hiện tại (hoặc ngày phê duyệt) đã qua mà mốc chưa được đánh dấu hoàn thành.

## Phát triển

```bash
npm install
npm run dev                 # http://localhost:3000 (cần GEMINI_API_KEY cho AI)
npm run lint                # kiểm tra kiểu TypeScript
npm test                    # kiểm thử bộ đọc Excel
npm run test:rules          # kiểm thử firestore.rules trên Firebase Emulator (cần Java)
npm run data:generate       # tạo lại src/data/stellarPortfolio.json từ sharepoint_download.xlsx
```

Chạy hoàn toàn cục bộ bằng emulator (không đụng dữ liệu thật):

```bash
npx firebase emulators:start --only firestore,auth --project <project-id>
```

```bash
VITE_USE_FIREBASE_EMULATORS=true npm run dev
```

## Mã nguồn mở tham khảo

- Kéo thả Kanban: [@hello-pangea/dnd](https://github.com/hello-pangea/dnd) (bản kế tục react-beautiful-dnd), theo mẫu chuẩn `DragDropContext / Droppable / Draggable`.
- Đọc Excel: [SheetJS](https://github.com/SheetJS/sheetjs).
- Phân quyền theo vai trò trên Firestore: mẫu [Role-based access](https://firebase.google.com/docs/firestore/solutions/role-based-access) của Firebase; kiểm thử bằng [@firebase/rules-unit-testing](https://github.com/firebase/firebase-js-sdk/tree/main/packages/rules-unit-testing).
- Mô hình công việc (trạng thái, ưu tiên, người phụ trách, hạn) theo cách tổ chức work item của các công cụ quản lý dự án mã nguồn mở như Plane và OpenProject.
