import DemoNotice from '../components/DemoNotice';
import React, { useState, useRef, useEffect } from 'react';
import { usePortfolio } from '../data/portfolioStore';
import { availableAiModels, initialAiProviderAuths } from '../data/connectionsData';
import { AiProviderId, AiModelOption, AiProviderAuth, ChatAttachment } from '../types';
import * as XLSX from 'xlsx';
import { 
  Bot, 
  Send, 
  Sparkles, 
  Building2, 
  Calendar, 
  Layers, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Paperclip, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Square, 
  Play, 
  Pause, 
  LogIn, 
  LogOut, 
  Key, 
  ShieldCheck, 
  ChevronDown, 
  Trash2, 
  FileSpreadsheet, 
  FileImage, 
  X, 
  HelpCircle,
  TrendingDown,
  Cpu,
  SlidersHorizontal,
  Check,
  Zap,
  Brain,
  Scale,
  RotateCcw,
  Headphones,
  Radio
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  modelUsed?: string;
  providerUsed?: AiProviderId;
  attachments?: ChatAttachment[];
}

export default function AiAssistantPage() {
  const { projects: stellarProjects, metadata: portfolioMetadata } = usePortfolio();
  // Provider Auth State
  const [providerAuths, setProviderAuths] = useState<Record<string, AiProviderAuth>>(() => {
    try {
      const saved = localStorage.getItem('stellar_ai_auths');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return initialAiProviderAuths;
  });

  // Selected Provider, Model and Level
  const [selectedProvider, setSelectedProvider] = useState<AiProviderId>('gemini');
  const [selectedModelId, setSelectedModelId] = useState<string>('gemini-3.6-flash');
  const [selectedLevel, setSelectedLevel] = useState<'fast' | 'balanced' | 'deep'>('balanced');

  // Chat State
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: `Xin chào Quản trị viên Huy Tùng! Tôi là Trợ lý AI Bất động sản Stellar, được kết nối với cơ sở dữ liệu 23 dự án SharePoint (10 bảng tính quy hoạch & tiến độ).

Bạn có thể:
• Chọn mô hình AI làm việc: ChatGPT / OpenAI, Claude AI hoặc Google Gemini
• Chọn cấp độ tư duy: Phản hồi siêu nhanh (Flash), Cân bằng đa năng (Omni) hoặc Suy luận chuyên sâu (Reasoning)
• Điều khiển bằng giọng nói tiếng Việt và nghe phản hồi bằng âm thanh
• Đính kèm tệp Excel, bản vẽ CAD/ảnh, tài liệu PDF để phân tích trực tiếp`,
      timestamp: '08:00',
      modelUsed: 'gemini-3.6-flash',
      providerUsed: 'gemini'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState<ChatAttachment[]>([]);

  // Voice State (Speech-to-Text & Text-to-Speech)
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isVoicePaused, setIsVoicePaused] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [vietnameseVoices, setVietnameseVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>('');
  const [speakingTextSnippet, setSpeakingTextSnippet] = useState<string>('');
  const [lastSpokenText, setLastSpokenText] = useState<string>('');
  const [voiceSettingsOpen, setVoiceSettingsOpen] = useState(false);

  // Modal Auth State
  const [authModalProvider, setAuthModalProvider] = useState<AiProviderId | null>(null);
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [accountEmailInput, setAccountEmailInput] = useState('');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Save auth to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('stellar_ai_auths', JSON.stringify(providerAuths));
    } catch (e) {
      console.error(e);
    }
  }, [providerAuths]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Detect and load Vietnamese voices dynamically
  useEffect(() => {
    if (!('speechSynthesis' in window)) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      const vi = allVoices.filter(v => 
        v.lang.toLowerCase().includes('vi') || 
        v.name.toLowerCase().includes('vietnam') || 
        v.name.toLowerCase().includes('tiếng việt')
      );
      setVietnameseVoices(vi.length > 0 ? vi : allVoices.slice(0, 10));
      if (vi.length > 0 && !selectedVoiceURI) {
        setSelectedVoiceURI(vi[0].voiceURI);
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [selectedVoiceURI]);

  // Initialize Speech Recognition if supported
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'vi-VN';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(prev => transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  // Voice Toggle (Speech-to-Text)
  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert('Trình duyệt của bạn chưa kích hoạt hỗ trợ nhận diện giọng nói tiếng Việt (Web Speech API). Vui lòng dùng Chrome, Edge hoặc Safari.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error('Speech start error:', err);
      }
    }
  };

  // Text-to-Speech Playback in Vietnamese with natural pronunciation normalization
  const speakText = (text: string, messageId?: string) => {
    if (!('speechSynthesis' in window)) {
      alert('Trình duyệt không hỗ trợ phát giọng nói tổng hợp.');
      return;
    }

    if (isSpeaking && speakingMessageId === messageId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsVoicePaused(false);
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();
    setIsVoicePaused(false);

    // Normalize BĐS terms and symbols for natural, fluent Vietnamese speech
    const cleanText = text
      .replace(/[#*`_~]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/•/g, ', ')
      .replace(/(\d+)\/(\d+)\/(\d{4})/g, 'ngày $1 tháng $2 năm $3')
      .replace(/(\d+)\/(\d+)\/(\d{2})/g, 'ngày $1 tháng $2 năm 20$3')
      .replace(/1\/500/g, 'quy hoạch một phần năm trăm')
      .replace(/1\/2000/g, 'quy hoạch một phần hai nghìn')
      .replace(/m2/gi, 'mét vuông')
      .replace(/m²/g, 'mét vuông')
      .replace(/ha\b/gi, 'héc-ta')
      .replace(/BQL\b/g, 'Ban quản lý')
      .replace(/GPXD\b/g, 'Giấy phép xây dựng')
      .replace(/PCCC\b/g, 'Phòng cháy chữa cháy')
      .replace(/ĐTM\b/g, 'Đánh giá tác động môi trường')
      .replace(/BCNCKT\b/g, 'Báo cáo nghiên cứu khả thi')
      .replace(/HSSDD\b/g, 'Hệ số sử dụng đất')
      .replace(/BĐS\b/g, 'Bất động sản')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = speechRate;

    // Pick selected Vietnamese voice or best match
    const voices = window.speechSynthesis.getVoices();
    let targetVoice = voices.find(v => v.voiceURI === selectedVoiceURI);
    if (!targetVoice) {
      targetVoice = voices.find(v => v.lang.toLowerCase().includes('vi') || v.name.toLowerCase().includes('vietnam') || v.name.toLowerCase().includes('tiếng việt'));
    }
    if (targetVoice) {
      utterance.voice = targetVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsVoicePaused(false);
      if (messageId) setSpeakingMessageId(messageId);
      setSpeakingTextSnippet(cleanText.slice(0, 100) + (cleanText.length > 100 ? '...' : ''));
      setLastSpokenText(cleanText);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsVoicePaused(false);
      setSpeakingMessageId(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsVoicePaused(false);
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const togglePauseResumeSpeaking = () => {
    if (!('speechSynthesis' in window)) return;
    if (isVoicePaused) {
      window.speechSynthesis.resume();
      setIsVoicePaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsVoicePaused(true);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setIsVoicePaused(false);
    setSpeakingMessageId(null);
  };

  const testVietnameseVoice = () => {
    speakText('Xin chào Quản trị viên Huy Tùng! Đây là giọng đọc tiếng Việt của Trợ lý AI Bất động sản Stellar. Tất cả dữ liệu 23 dự án SharePoint đã sẵn sàng phục vụ bạn.');
  };

  // Handle File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newAttachments: ChatAttachment[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `file-${Date.now()}-${i}`;

      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls') || file.name.endsWith('.csv')) {
        // Parse Excel file
        try {
          const buffer = await file.arrayBuffer();
          const workbook = XLSX.read(buffer, { type: 'array' });
          const sheetNames = workbook.SheetNames;
          const firstSheet = workbook.Sheets[sheetNames[0]];
          const jsonPreview = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }).slice(0, 10);
          
          newAttachments.push({
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type || 'application/vnd.ms-excel',
            contentPreview: `File Excel có ${sheetNames.length} sheet: [${sheetNames.join(', ')}]. Dữ liệu mẫu sheet 1: ${JSON.stringify(jsonPreview)}`
          });
        } catch (err) {
          console.error(err);
          newAttachments.push({
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            contentPreview: 'Không thể đọc nội dung bảng tính'
          });
        }
      } else if (file.type.startsWith('image/')) {
        // Read image as base64 dataUrl
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        newAttachments.push({
          id: fileId,
          name: file.name,
          size: file.size,
          type: file.type,
          dataUrl,
          contentPreview: `Tệp ảnh: ${file.name} (${(file.size / 1024).toFixed(1)} KB)`
        });
      } else {
        // Text / PDF / Docx
        try {
          const text = await file.text();
          newAttachments.push({
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type || 'text/plain',
            contentPreview: text.slice(0, 2000)
          });
        } catch (err) {
          newAttachments.push({
            id: fileId,
            name: file.name,
            size: file.size,
            type: file.type || 'application/octet-stream',
            contentPreview: `Tệp tài liệu: ${file.name}`
          });
        }
      }
    }

    setAttachments(prev => [...prev, ...newAttachments]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeAttachment = (id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  };

  // Provider Auth Modal
  const openAuthModal = (provider: AiProviderId) => {
    setAuthModalProvider(provider);
    const existing = providerAuths[provider];
    setAccountEmailInput(existing?.accountEmail || '');
    setApiKeyInput(existing?.apiKey || '');
  };

  const handleSaveAuth = () => {
    if (!authModalProvider) return;

    setProviderAuths(prev => ({
      ...prev,
      [authModalProvider]: {
        providerId: authModalProvider,
        name: authModalProvider === 'openai' ? 'ChatGPT / OpenAI' : (authModalProvider === 'claude' ? 'Claude AI (Anthropic)' : 'Google Gemini AI'),
        isLoggedIn: true,
        accountEmail: accountEmailInput || (authModalProvider === 'openai' ? 'huytung712@stellar.vn (Plus/Team)' : 'huytung712@gmail.com (Enterprise)'),
        apiKey: apiKeyInput || undefined,
        connectedAt: new Date().toISOString(),
        tokenBalance: authModalProvider === 'gemini' ? 'Không giới hạn (Enterprise)' : '$100.00 Credits'
      }
    }));

    setAuthModalProvider(null);
  };

  const handleToggleAuthLogout = (provider: AiProviderId) => {
    setProviderAuths(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        isLoggedIn: !prev[provider]?.isLoggedIn
      }
    }));
  };

  // Filter models for selected provider
  const currentProviderModels = availableAiModels.filter(m => m.provider === selectedProvider);
  const activeModel = availableAiModels.find(m => m.id === selectedModelId) || currentProviderModels[0];

  // Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const queryText = textToSend || input.trim();
    if ((!queryText && attachments.length === 0) || loading) return;

    const currentAttachments = [...attachments];
    const userMessageId = `msg-${Date.now()}`;
    const userMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      content: queryText || (currentAttachments.length > 0 ? `[Đã gửi ${currentAttachments.length} tệp đính kèm để phân tích]` : ''),
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      attachments: currentAttachments
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setAttachments([]);
    setLoading(true);

    try {
      const contextSummary = {
        totalProjects: portfolioMetadata.totalProjects,
        kpi: portfolioMetadata.kpi,
        projects: stellarProjects.map(p => ({
          name: p.name,
          code: p.code,
          group: p.group,
          location: p.location,
          specs: p.specs,
          progress: p.progress,
          delayedMilestones: p.milestones.filter(m => m.status === 'Chậm tiến độ' || (m.evaluationMonths !== null && m.evaluationMonths < 0))
        }))
      };

      const res = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: queryText,
          projectContext: contextSummary,
          provider: selectedProvider,
          model: selectedModelId,
          level: selectedLevel,
          attachments: currentAttachments
        })
      });

      if (!res.ok) throw new Error('Failed response from AI assistant');
      const data = await res.json();

      const assistantMsgId = `assistant-${Date.now()}`;
      const assistantMsg: ChatMessage = {
        id: assistantMsgId,
        role: 'assistant',
        content: data.reply,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed || selectedModelId,
        providerUsed: data.providerUsed || selectedProvider
      };

      setMessages(prev => [...prev, assistantMsg]);

      // Auto speak if enabled
      if (autoSpeak) {
        speakText(data.reply, assistantMsgId);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'assistant',
          content: 'Có lỗi xảy ra khi kết nối tới dịch vụ AI. Đang kích hoạt chế độ phục hồi hệ thống Stellar...',
          timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModelId,
          providerUsed: selectedProvider
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const samplePrompts = [
    'Tổng hợp các dự án có mốc pháp lý bị chậm tiến độ',
    'So sánh chỉ tiêu diện tích và mật độ xây dựng giữa Lại Yên và Chu Văn An',
    'Danh sách 14 dự án cao tầng Hà Nội và số căn hộ',
    'Thẩm định tiến độ mốc PCCC và GPXD năm 2026',
    'Đề xuất báo cáo nhanh gửi Ban Giám Đốc'
  ];

  const getProviderBrand = (id: AiProviderId) => {
    switch (id) {
      case 'gemini':
        return {
          name: 'Google Gemini',
          badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          activeBg: 'bg-indigo-600 text-white',
          icon: <Sparkles size={16} />
        };
      case 'openai':
        return {
          name: 'ChatGPT / OpenAI',
          badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          activeBg: 'bg-emerald-600 text-white',
          icon: <Bot size={16} />
        };
      case 'claude':
        return {
          name: 'Claude AI',
          badgeColor: 'bg-amber-50 text-amber-800 border-amber-200',
          activeBg: 'bg-amber-600 text-white',
          icon: <Brain size={16} />
        };
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6.5rem)] space-y-3 pb-2">
      <DemoNotice>
        Trợ lý trả lời qua <b>Gemini trên server</b> (cần GEMINI_API_KEY). Phần “đăng nhập” OpenAI/Claude trên trang này chỉ là giao diện
        mẫu: mọi câu hỏi hiện đều được xử lý bằng Gemini.
      </DemoNotice>
      {/* 1. TOP AI MODEL & AUTH HUB BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 shadow-xs space-y-3">
        {/* Row 1: 3 Provider Buttons with Login status */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow-sm">
              <Cpu size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-1.5">
                <span>Trợ lý AI BĐS Stellar</span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
                  Multi-Model Engine
                </span>
              </h2>
              <p className="text-[11px] text-slate-500">
                Đồng bộ 23 dự án SharePoint • Điều khiển giọng nói • Hỗ trợ tệp đính kèm
              </p>
            </div>
          </div>

          {/* 3 AI Providers Login & Switcher */}
          <div className="flex items-center space-x-2 overflow-x-auto">
            {(['gemini', 'openai', 'claude'] as AiProviderId[]).map((provId) => {
              const brand = getProviderBrand(provId);
              const auth = providerAuths[provId];
              const isSelected = selectedProvider === provId;
              const isLoggedIn = auth?.isLoggedIn;

              return (
                <div
                  key={provId}
                  className={`flex items-center space-x-1.5 pl-2.5 pr-1.5 py-1.5 rounded-xl border text-xs transition-all ${
                    isSelected 
                      ? 'border-indigo-500 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500/20' 
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedProvider(provId);
                      const firstModel = availableAiModels.find(m => m.provider === provId);
                      if (firstModel) setSelectedModelId(firstModel.id);
                    }}
                    className="flex items-center space-x-1.5 text-left font-bold text-slate-800"
                  >
                    <span className={`w-2 h-2 rounded-full ${isLoggedIn ? 'bg-emerald-500' : 'bg-slate-300'}`}></span>
                    <span>{brand.name}</span>
                  </button>

                  <button
                    onClick={() => openAuthModal(provId)}
                    title={isLoggedIn ? `Đã đăng nhập: ${auth.accountEmail}` : 'Đăng nhập tài khoản'}
                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors flex items-center space-x-1 ${
                      isLoggedIn 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <LogIn size={10} />
                    <span>{isLoggedIn ? 'Đã liên kết' : 'Đăng nhập'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 2: Model Selector + Level Selector + Voice Auto-Speak Toggle */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* Specific Model Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 font-medium shrink-0 flex items-center">
              <SlidersHorizontal size={13} className="mr-1" /> Mô hình:
            </span>
            <select
              value={selectedModelId}
              onChange={(e) => setSelectedModelId(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1 text-xs font-bold text-slate-800 focus:outline-none focus:border-indigo-500"
            >
              {currentProviderModels.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.levelLabel}) {m.badge ? `• [${m.badge}]` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Level / Mức độ làm việc Selector */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1 rounded-xl">
            <span className="text-slate-400 text-[11px] font-medium px-1.5">Mức độ:</span>
            <button
              onClick={() => setSelectedLevel('fast')}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all ${
                selectedLevel === 'fast' 
                  ? 'bg-white text-indigo-700 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Zap size={11} />
              <span>Siêu nhanh</span>
            </button>
            <button
              onClick={() => setSelectedLevel('balanced')}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all ${
                selectedLevel === 'balanced' 
                  ? 'bg-white text-indigo-700 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Scale size={11} />
              <span>Cân bằng</span>
            </button>
            <button
              onClick={() => setSelectedLevel('deep')}
              className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold flex items-center space-x-1 transition-all ${
                selectedLevel === 'deep' 
                  ? 'bg-white text-indigo-700 shadow-2xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Brain size={11} />
              <span>Suy luận sâu</span>
            </button>
          </div>

          {/* Audio Controls & Voice Engine Bar */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setVoiceSettingsOpen(!voiceSettingsOpen)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center space-x-1.5 transition-colors ${
                voiceSettingsOpen 
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-300 ring-1 ring-indigo-300' 
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Headphones size={13} className="text-indigo-600" />
              <span>🇻🇳 Giọng đọc Tiếng Việt</span>
              <ChevronDown size={11} className={`transition-transform duration-150 ${voiceSettingsOpen ? 'rotate-180' : ''}`} />
            </button>

            <button
              onClick={() => setAutoSpeak(!autoSpeak)}
              className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border flex items-center space-x-1.5 transition-colors ${
                autoSpeak 
                  ? 'bg-amber-50 text-amber-800 border-amber-300 ring-1 ring-amber-300' 
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
              title="Tự động đọc câu trả lời bằng giọng Tiếng Việt khi AI trả lời xong"
            >
              {autoSpeak ? <Volume2 size={13} className="text-amber-600 animate-pulse" /> : <VolumeX size={13} />}
              <span>Tự động đọc</span>
            </button>

            {isSpeaking && (
              <button
                onClick={stopSpeaking}
                className="px-2.5 py-1 rounded-xl text-[11px] font-bold bg-red-50 text-red-600 border border-red-200 flex items-center space-x-1 hover:bg-red-100 animate-pulse"
              >
                <Square size={11} fill="currentColor" />
                <span>Dừng đọc</span>
              </button>
            )}
          </div>
        </div>

        {/* Row 3: Expandable Vietnamese Voice Engine Settings Panel */}
        {voiceSettingsOpen && (
          <div className="pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5 text-xs bg-indigo-50/60 p-2.5 rounded-xl border border-indigo-100 animate-in fade-in duration-150">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-700 text-[11px] flex items-center">
                <Radio size={12} className="mr-1 text-indigo-600" /> Chọn Giọng:
              </span>
              <select
                value={selectedVoiceURI}
                onChange={(e) => setSelectedVoiceURI(e.target.value)}
                className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs text-slate-800 font-medium focus:outline-none focus:border-indigo-500 max-w-[220px]"
              >
                {vietnameseVoices.map((v) => (
                  <option key={v.voiceURI} value={v.voiceURI}>
                    {v.name} ({v.lang})
                  </option>
                ))}
                {vietnameseVoices.length === 0 && (
                  <option value="">Giọng đọc chuẩn Tiếng Việt (vi-VN)</option>
                )}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-slate-500 text-[11px] font-medium">Tốc độ:</span>
              {[0.85, 1.0, 1.25].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setSpeechRate(rate)}
                  className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-colors ${
                    speechRate === rate 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-2xs' 
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {rate}x
                </button>
              ))}

              <button
                onClick={testVietnameseVoice}
                className="px-2.5 py-1 bg-white hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold flex items-center space-x-1 shadow-2xs transition-colors"
                title="Phát câu chào thử nghiệm bằng giọng Tiếng Việt"
              >
                <Volume2 size={12} />
                <span>Thử giọng đọc</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 2. CHAT CONVERSATION AREA */}
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs overflow-y-auto space-y-4">
        {messages.map((m) => {
          const isUser = m.role === 'user';
          const isThisSpeaking = isSpeaking && speakingMessageId === m.id;

          return (
            <div
              key={m.id}
              className={`flex items-start space-x-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs shadow-indigo-500/20">
                  <Bot size={17} />
                </div>
              )}

              <div className="flex flex-col space-y-1 max-w-2xl">
                {/* Message Bubble */}
                <div
                  className={`rounded-2xl p-4 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-indigo-600 text-white shadow-xs rounded-tr-xs'
                      : 'bg-slate-50 text-slate-800 border border-slate-200/90 shadow-2xs rounded-tl-xs whitespace-pre-wrap'
                  }`}
                >
                  {m.content}

                  {/* Attached files preview inside message */}
                  {m.attachments && m.attachments.length > 0 && (
                    <div className={`mt-3 pt-2.5 border-t space-y-1.5 ${isUser ? 'border-indigo-500/60' : 'border-slate-200'}`}>
                      <span className={`text-[10px] font-bold uppercase tracking-wider block ${isUser ? 'text-indigo-200' : 'text-slate-400'}`}>
                        Tệp đính kèm ({m.attachments.length}):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {m.attachments.map((att) => (
                          <div
                            key={att.id}
                            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium ${
                              isUser ? 'bg-indigo-700/80 text-white' : 'bg-white border border-slate-200 text-slate-700'
                            }`}
                          >
                            {att.type.includes('excel') || att.name.endsWith('.xlsx') || att.name.endsWith('.csv') ? (
                              <FileSpreadsheet size={13} className="text-emerald-400 shrink-0" />
                            ) : att.type.startsWith('image/') ? (
                              <FileImage size={13} className="text-blue-400 shrink-0" />
                            ) : (
                              <FileText size={13} className="text-amber-400 shrink-0" />
                            )}
                            <span className="truncate max-w-[150px]">{att.name}</span>
                            <span className="text-[10px] opacity-75">({(att.size / 1024).toFixed(1)} KB)</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer of message: Timestamp, Model Used, Audio Speak button */}
                <div className={`flex items-center space-x-2 text-[10px] text-slate-400 px-1 ${isUser ? 'justify-end' : 'justify-start'}`}>
                  <span>{m.timestamp}</span>
                  {m.modelUsed && (
                    <>
                      <span>•</span>
                      <span className="font-semibold text-slate-500 uppercase">{m.modelUsed}</span>
                    </>
                  )}
                  {!isUser && (
                    <button
                      onClick={() => speakText(m.content, m.id)}
                      className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all shadow-2xs ${
                        isThisSpeaking
                          ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300'
                          : 'bg-white text-indigo-700 border-indigo-200 hover:bg-indigo-50 hover:border-indigo-300'
                      }`}
                      title={isThisSpeaking ? 'Dừng đọc câu trả lời này' : 'Nghe đọc câu trả lời bằng giọng Tiếng Việt chuẩn'}
                    >
                      {isThisSpeaking ? (
                        <>
                          <span className="flex items-end space-x-0.5 h-3">
                            <span className="w-0.5 bg-white rounded-full animate-bounce h-2"></span>
                            <span className="w-0.5 bg-white rounded-full animate-bounce h-3 [animation-delay:0.1s]"></span>
                            <span className="w-0.5 bg-white rounded-full animate-bounce h-2 [animation-delay:0.2s]"></span>
                          </span>
                          <span>{isVoicePaused ? 'Tiếp tục đọc' : 'Đang đọc (Dừng)'}</span>
                        </>
                      ) : (
                        <>
                          <Volume2 size={13} className="text-indigo-600" />
                          <span>Đọc Tiếng Việt</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {isUser && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold shrink-0">
                  HT
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
              <Bot size={17} />
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 flex items-center space-x-2.5 text-xs text-slate-600">
              <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span>
                Đang xử lý qua mô hình <strong>{activeModel.name}</strong> ({selectedLevel.toUpperCase()})...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. SUGGESTED PROMPTS */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-0.5 text-xs">
        <span className="text-slate-400 shrink-0 flex items-center font-medium">
          <Sparkles size={13} className="mr-1 text-amber-500" /> Gợi ý:
        </span>
        {samplePrompts.map((p, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(p)}
            className="px-3 py-1 bg-white hover:bg-indigo-50 border border-slate-200 hover:border-indigo-300 rounded-xl text-slate-600 hover:text-indigo-700 whitespace-nowrap transition-colors shadow-2xs"
          >
            {p}
          </button>
        ))}
      </div>

      {/* 4. ATTACHMENT TRAY (If files are staged) */}
      {attachments.length > 0 && (
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-2 flex items-center space-x-2 overflow-x-auto text-xs">
          <span className="text-[11px] font-bold text-slate-500 shrink-0">Đính kèm ({attachments.length}):</span>
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center space-x-1.5 px-2.5 py-1 bg-white border border-slate-300 rounded-lg text-slate-800 text-xs shadow-2xs"
            >
              {att.type.includes('excel') || att.name.endsWith('.xlsx') || att.name.endsWith('.csv') ? (
                <FileSpreadsheet size={13} className="text-emerald-600 shrink-0" />
              ) : att.type.startsWith('image/') ? (
                <FileImage size={13} className="text-blue-600 shrink-0" />
              ) : (
                <FileText size={13} className="text-amber-600 shrink-0" />
              )}
              <span className="font-medium truncate max-w-[140px]">{att.name}</span>
              <button
                onClick={() => removeAttachment(att.id)}
                className="text-slate-400 hover:text-red-500 p-0.5 transition-colors"
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 4.5. DOCKED AUDIO PLAYER BANNER (When Assistant is reading aloud in Vietnamese) */}
      {isSpeaking && (
        <div className="bg-gradient-to-r from-amber-50 via-indigo-50/50 to-amber-50 border border-amber-200/90 rounded-2xl p-3 shadow-xs flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center space-x-3 overflow-hidden">
            {/* Animated Equalizer Sound Bars */}
            <div className="flex items-end space-x-0.5 h-6 shrink-0 px-1.5 bg-amber-500/15 rounded-lg py-1">
              <span className={`w-1 bg-amber-600 rounded-full ${isVoicePaused ? 'h-2' : 'animate-pulse h-3'}`}></span>
              <span className={`w-1 bg-amber-600 rounded-full ${isVoicePaused ? 'h-3' : 'animate-bounce h-5 [animation-delay:0.1s]'}`}></span>
              <span className={`w-1 bg-amber-600 rounded-full ${isVoicePaused ? 'h-2' : 'animate-pulse h-2'}`}></span>
              <span className={`w-1 bg-amber-600 rounded-full ${isVoicePaused ? 'h-4' : 'animate-bounce h-6 [animation-delay:0.2s]'}`}></span>
              <span className={`w-1 bg-amber-600 rounded-full ${isVoicePaused ? 'h-2' : 'animate-pulse h-4'}`}></span>
            </div>

            <div className="overflow-hidden">
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                  🇻🇳 Đang đọc Tiếng Việt
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  Tốc độ {speechRate}x {isVoicePaused ? '• [Đang tạm dừng]' : ''}
                </span>
              </div>
              <p className="text-xs text-slate-800 font-medium truncate mt-0.5">
                {speakingTextSnippet || 'Đang phát âm thanh câu trả lời bằng giọng Tiếng Việt...'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-1.5 shrink-0">
            <button
              onClick={togglePauseResumeSpeaking}
              className="px-2.5 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-colors shadow-2xs text-xs font-bold flex items-center space-x-1"
              title={isVoicePaused ? 'Tiếp tục đọc' : 'Tạm dừng'}
            >
              {isVoicePaused ? <Play size={13} className="text-emerald-600 fill-emerald-600" /> : <Pause size={13} />}
              <span className="text-[11px] hidden sm:inline">{isVoicePaused ? 'Tiếp tục' : 'Tạm dừng'}</span>
            </button>

            {lastSpokenText && (
              <button
                onClick={() => speakText(lastSpokenText, speakingMessageId || undefined)}
                className="p-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl transition-colors shadow-2xs text-xs font-bold"
                title="Đọc lại câu trả lời này"
              >
                <RotateCcw size={13} />
              </button>
            )}

            <button
              onClick={stopSpeaking}
              className="px-2.5 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1 shadow-xs transition-colors"
              title="Dừng phát âm thanh"
            >
              <Square size={11} fill="currentColor" />
              <span className="text-[11px]">Dừng</span>
            </button>
          </div>
        </div>
      )}

      {/* 4.6. VOICE RECOGNITION LIVE BANNER (When user speaks in Vietnamese) */}
      {isListening && (
        <div className="bg-red-50 border border-red-200/90 rounded-2xl p-3 shadow-xs space-y-2 animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              <span className="text-xs font-bold text-red-900 flex items-center">
                <Mic size={14} className="mr-1 text-red-600" />
                Đang lắng nghe giọng nói Tiếng Việt (vi-VN)...
              </span>
            </div>
            <button
              onClick={toggleListening}
              className="text-xs text-red-600 hover:text-red-800 font-bold px-2.5 py-1 bg-white hover:bg-red-100 border border-red-200 rounded-lg transition-colors shadow-2xs"
            >
              Hủy nghe
            </button>
          </div>

          <div className="bg-white border border-red-200 rounded-xl p-2.5 text-xs text-slate-800 min-h-[38px] flex items-center">
            {input ? (
              <span className="font-semibold text-slate-900">{input}</span>
            ) : (
              <span className="text-slate-400 italic">Hãy nói câu hỏi hoặc mệnh lệnh bằng tiếng Việt (ví dụ: "Báo cáo tiến độ dự án Lại Yên")...</span>
            )}
          </div>

          <div className="flex items-center justify-between pt-1 gap-2">
            <div className="flex items-center space-x-1.5 overflow-x-auto text-[11px]">
              <span className="text-slate-500 font-medium shrink-0">Lệnh mẫu nhanh:</span>
              {[
                'Báo cáo tiến độ Lại Yên',
                'Kiểm tra các mốc chậm tiến độ',
                'Chỉ tiêu Chu Văn An',
                '14 dự án cao tầng Hà Nội'
              ].map((cmd, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInput(cmd);
                    handleSendMessage(cmd);
                  }}
                  className="px-2 py-0.5 bg-white hover:bg-red-100 text-red-800 border border-red-200 rounded-lg whitespace-nowrap transition-colors"
                >
                  "{cmd}"
                </button>
              ))}
            </div>

            {input.trim() && (
              <button
                onClick={() => {
                  toggleListening();
                  handleSendMessage();
                }}
                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shrink-0 transition-colors shadow-2xs flex items-center space-x-1"
              >
                <span>Gửi lệnh ngay</span>
                <Send size={11} />
              </button>
            )}
          </div>
        </div>
      )}

      {/* 5. INPUT BOX + VOICE CONTROL + ATTACHMENT BUTTON */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 shadow-sm flex items-center space-x-2">
        {/* Attachment Button */}
        <input
          type="file"
          ref={fileInputRef}
          multiple
          onChange={handleFileUpload}
          className="hidden"
          accept=".xlsx,.xls,.csv,.pdf,.docx,.doc,.txt,.json,image/*"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          title="Đính kèm tệp (Excel, PDF, Word, Ảnh...)"
          className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors shrink-0"
        >
          <Paperclip size={18} />
        </button>

        {/* Voice Input Button */}
        <button
          onClick={toggleListening}
          title={isListening ? 'Đang lắng nghe... Nhấn để dừng' : 'Điều khiển bằng giọng nói tiếng Việt'}
          className={`p-2 rounded-xl transition-all shrink-0 ${
            isListening 
              ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30 ring-2 ring-red-300' 
              : 'text-slate-500 hover:text-indigo-600 hover:bg-indigo-50'
          }`}
        >
          {isListening ? <MicOff size={18} /> : <Mic size={18} />}
        </button>

        {/* Text Input */}
        <input
          type="text"
          placeholder={
            isListening 
              ? 'Đang nghe giọng nói của bạn... Hãy nói câu hỏi hoặc mệnh lệnh.' 
              : `Hỏi về 23 dự án, chỉ tiêu quy hoạch, 15 mốc tiến độ hoặc tệp đính kèm (${activeModel.name})...`
          }
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
          className="flex-1 px-3 py-2 text-xs bg-transparent border-none focus:outline-none text-slate-900"
        />

        {/* Send Button */}
        <button
          onClick={() => handleSendMessage()}
          disabled={loading || (!input.trim() && attachments.length === 0)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm transition-colors shrink-0"
        >
          <span>Gửi</span>
          <Send size={13} />
        </button>
      </div>

      {/* MODAL: ĐĂNG NHẬP TÀI KHOẢN MÔ HÌNH AI */}
      {authModalProvider && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  {getProviderBrand(authModalProvider).icon}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Đăng nhập tài khoản {getProviderBrand(authModalProvider).name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Kết nối phân quyền quản trị Stellar PM
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAuthModalProvider(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3.5">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Email tài khoản / Tổ chức:
                </label>
                <input
                  type="text"
                  value={accountEmailInput}
                  onChange={(e) => setAccountEmailInput(e.target.value)}
                  placeholder="huytung712@stellar.vn hoặc email cá nhân..."
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-900"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  API Key hoặc Token (Tùy chọn):
                </label>
                <input
                  type="password"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="sk-... (để trống nếu dùng gói Enterprise mặc định)"
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-600 text-slate-900 font-mono"
                />
              </div>

              <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start space-x-2 text-xs text-indigo-900">
                <ShieldCheck size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Bảo mật tài khoản doanh nghiệp</p>
                  <p className="text-[11px] text-indigo-700 mt-0.5">
                    Hệ thống đã tích hợp sẵn giấy phép Stellar Enterprise cho Quản trị viên Huy Tùng. Bạn có thể nhấn Xác nhận đăng nhập để kích hoạt ngay.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  handleToggleAuthLogout(authModalProvider);
                  setAuthModalProvider(null);
                }}
                className="text-xs font-bold text-red-600 hover:text-red-700 px-2 py-1"
              >
                {providerAuths[authModalProvider]?.isLoggedIn ? 'Đăng xuất tài khoản' : ''}
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setAuthModalProvider(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSaveAuth}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                >
                  <Check size={14} />
                  <span>Xác nhận Đăng nhập</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
