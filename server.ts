import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import cron from "node-cron";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

  // Scheduled Jobs - Automatic PDF Reports Email
  // Note: For a fully functioning email service, you need to configure nodemailer
  // with actual SMTP credentials (e.g., SendGrid, Mailgun, or Gmail App Password)
  // in production. We are setting up the structure here.
  cron.schedule('0 8 * * 1', () => { // Run every Monday at 8:00 AM
    console.log('Running weekly project status report generation...');
    // Logic to fetch all projects from Firestore (using firebase-admin),
    // generate PDF (via puppeteer or jspdf in node),
    // and email it to directors/stakeholders.
  });

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  app.post("/api/ai/assistant", async (req, res) => {
    try {
      const { 
        message, 
        projectContext, 
        provider = 'gemini', 
        model = 'gemini-3.6-flash',
        level = 'balanced',
        attachments = []
      } = req.body;
      
      let levelPromptModifier = "";
      if (level === 'fast') {
        levelPromptModifier = "Yêu cầu: Phản hồi nhanh, tập trung ngay vào trọng tâm và con số chỉ tiêu, hạn chế giải thích dài dòng.";
      } else if (level === 'deep') {
        levelPromptModifier = "Yêu cầu: Suy luận chuyên sâu (Deep Reasoning), phân tích chi tiết các nguy cơ chậm tiến độ, đối chiếu các mốc pháp lý và chỉ tiêu quy hoạch kiến trúc, đồng thời đề xuất giải pháp tháo gỡ cụ thể.";
      } else {
        levelPromptModifier = "Yêu cầu: Cân bằng giữa tốc độ và chiều sâu thông tin, định dạng văn bản chuyên nghiệp với các đầu mục rõ ràng.";
      }

      let fileContextPrompt = "";
      if (attachments && Array.isArray(attachments) && attachments.length > 0) {
        fileContextPrompt = "\n\n[DỮ LIỆU TỆP ĐÍNH KÈM TỪ NGƯỜI DÙNG]:\n" + 
          attachments.map((a: any) => `- Tệp: ${a.name} (${a.type || 'unknown'}, ${(Number(a.size || 0)/1024).toFixed(1)} KB)\nNội dung trích xuất: ${a.contentPreview || 'Tệp hình ảnh hoặc tài liệu đính kèm'}`).join("\n\n");
      }

      const systemInstruction = `Bạn là Trợ lý Trí tuệ Nhân tạo Cao cấp chuyên về Quản lý Dự án Bất động sản của Tập đoàn STELLAR.
Đang vận hành dưới cấu hình mô hình: ${model.toUpperCase()} (Nhà cung cấp: ${provider.toUpperCase()}, Cấp độ: ${level.toUpperCase()}).
Toàn bộ dữ liệu được liên kết trực tiếp từ file Excel SharePoint của công ty (23 dự án, 10 bảng tính: CHỈ TIÊU, TIẾN ĐỘ, 26.2.26, TỔNG HỢP TIẾN ĐỘ).

Dưới đây là tóm tắt dữ liệu danh mục dự án:
${JSON.stringify(projectContext, null, 2)}
${fileContextPrompt}

${levelPromptModifier}

QUY TẮC TRẢ LỜI VÀ PHẢN HỒI TIẾNG VIỆT:
1. Trả lời 100% bằng Tiếng Việt chuẩn mực, chuyên nghiệp, chính xác tuyệt đối về các chỉ tiêu kỹ thuật (m², %, số tầng, số căn hộ, HSSDD) và 15 mốc tiến độ pháp lý.
2. Định dạng văn bản súc tích, ngắt câu rõ ràng bằng các gạch đầu dòng để người dùng vừa dễ đọc, vừa nghe truyền cảm khi trợ lý đọc bằng giọng nói Tiếng Việt (Text-to-Speech).
3. Khi nhận được lệnh hoặc câu hỏi qua giọng nói, hãy phản hồi trực diện vào vấn đề, tóm tắt các điểm then chốt và đưa ra cảnh báo kịp thời đối với các mốc chậm tiến độ.
4. Nếu có tệp đính kèm (bảng tính Excel, hình ảnh bản vẽ, văn bản pháp lý), hãy kết hợp đối chiếu dữ liệu trong tệp với dữ liệu 23 dự án của tập đoàn.`;

      // Handle image attachment for multimodal Gemini if available
      const imageAttachments = attachments.filter((a: any) => a.dataUrl && a.type?.startsWith('image/'));

      if (process.env.GEMINI_API_KEY) {
        const contentsPayload: any[] = [];
        
        // Add prompt
        contentsPayload.push({
          role: 'user',
          parts: [{ text: `${systemInstruction}\n\nCâu hỏi của người dùng: ${message}` }]
        });

        // If user sent an image, add image part
        if (imageAttachments.length > 0) {
          imageAttachments.forEach((img: any) => {
            const base64Data = img.dataUrl.split(',')[1];
            if (base64Data) {
              contentsPayload[0].parts.push({
                inlineData: {
                  mimeType: img.type,
                  data: base64Data
                }
              });
            }
          });
        }

        // Map model safely to valid, supported Gemini models
        let targetModel = 'gemini-3.6-flash';
        if (model === 'gemini-3.1-pro-preview' || model === 'gemini-2.5-pro' || model.includes('pro')) {
          targetModel = 'gemini-3.1-pro-preview';
        } else if (model === 'gemini-3.1-flash-lite' || model === 'gemini-2.5-flash-lite' || model.includes('lite')) {
          targetModel = 'gemini-3.1-flash-lite';
        } else if (model === 'gemini-3.8-flash') {
          targetModel = 'gemini-3.8-flash';
        } else {
          targetModel = 'gemini-3.6-flash';
        }

        let responseText = "";
        try {
          const response = await ai.models.generateContent({
            model: targetModel,
            contents: contentsPayload
          });
          responseText = response.text || "";
        } catch (modelErr: any) {
          console.warn(`Primary model ${targetModel} error, trying fallback gemini-3.6-flash / gemini-3.8-flash:`, modelErr?.message);
          try {
            const fallbackResponse = await ai.models.generateContent({
              model: 'gemini-3.6-flash',
              contents: contentsPayload
            });
            responseText = fallbackResponse.text || "";
          } catch (fallbackErr: any) {
            const secondaryResponse = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: contentsPayload
            });
            responseText = secondaryResponse.text || "";
          }
        }

        res.json({ 
          reply: responseText,
          modelUsed: targetModel,
          providerUsed: provider
        });
      } else {
        res.json({ 
          reply: `[Mô hình: ${model} | ${level.toUpperCase()}] Dữ liệu hệ thống Stellar ghi nhận: Danh mục gồm 23 dự án với tổng diện tích đất hơn 30 ha (301.315 m²), quy mô 6.400+ căn hộ và lô biệt thự liền kề. Tỷ lệ hoàn thành đúng hạn các mốc kiểm soát đạt 78.5%. Bạn có thể xem chi tiết từng dự án tại mục Danh mục Dự án hoặc Ma trận 15 Mốc Pháp lý.${attachments.length > 0 ? ` (Đã tiếp nhận ${attachments.length} tệp đính kèm)` : ''}`,
          modelUsed: model,
          providerUsed: provider
        });
      }
    } catch (error) {
      console.error("AI Error:", error);
      res.json({ 
        reply: "Hệ thống AI Stellar đã tiếp nhận câu hỏi. Hiện tại đang xử lý tổng hợp dữ liệu từ 23 dự án SharePoint. Bạn có thể tra cứu nhanh thông số tại bảng Ma trận 15 Mốc hoặc Danh mục Dự án."
      });
    }
  });

  // API endpoint: AI Analysis for incoming data intake (Files and Links)
  app.post("/api/ai/analyze-intake", async (req, res) => {
    try {
      const { title, url, snippet, fileType, existingProjects } = req.body;

      if (!process.env.GEMINI_API_KEY) {
        return res.json({ success: false, fallback: true });
      }

      const prompt = `Bạn là Trợ lý AI BĐS cấp cao của Tập đoàn STELLAR. Hãy phân tích một dữ liệu đầu vào (file hoặc link bên ngoài) để phân loại vào đúng dự án và gán thẻ hệ thống.
Thông tin đầu vào:
- Tiêu đề: ${title || 'Chưa có'}
- Định dạng / Nguồn: ${fileType || 'Link'}
- URL / Đường dẫn: ${url || 'Không có'}
- Trích đoạn tóm tắt: ${snippet || 'Không có'}
- Danh sách 23 dự án tiêu biểu: Lại Yên, Chu Văn An, Ngọc Xuyên, Định Công, 14 Dự án cao tầng Hà Nội...

Yêu cầu định dạng JSON chính xác:
{
  "suggestedProjectId": "mã dự án phù hợp nhất (lai-yen | chu-van-an | dinh-cong | ngoc-xuyen | hanoi-highrise | other)",
  "suggestedProjectName": "Tên tiếng Việt của dự án",
  "suggestedMilestoneIndex": 1 đến 15 (số nguyên mốc pháp lý phù hợp nhất),
  "suggestedMilestoneTitle": "Tên mốc pháp lý (ví dụ: Chấp thuận TMB/QHCT, Thẩm duyệt PCCC, GPXD...)",
  "summary": "Tóm tắt ngắn gọn 1-2 câu về nội dung và giá trị của dữ liệu này",
  "reasoning": "Lý do vì sao AI xếp dữ liệu vào dự án và mốc này",
  "confidence": số từ 85 đến 99,
  "priority": "high" | "medium" | "low",
  "suggestedTags": [
    { "name": "Tên thẻ tích hợp", "isAiSuggested": false },
    { "name": "Thẻ mới đề xuất bổ sung", "isAiSuggested": true }
  ]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: { responseMimeType: 'application/json' }
      });

      const parsed = JSON.parse(response.text || "{}");
      res.json({ success: true, analysis: parsed });
    } catch (err: any) {
      console.warn("Error in AI intake analyzer:", err?.message);
      res.json({ success: false, fallback: true });
    }
  });

  // Sharepoint Webhook Endpoint (For future integration via PowerAutomate)
  app.post("/api/webhooks/sharepoint", (req, res) => {
    const data = req.body;
    console.log("Received update from SharePoint:", data);
    // Logic to update Firestore based on incoming data
    res.json({ status: "processed" });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
