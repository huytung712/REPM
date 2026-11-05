import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '@/store';
import { X, Send, Bot, Mic, MicOff, Volume2, VolumeX, Sparkles, Paperclip } from 'lucide-react';
import { usePortfolio } from '@/data/portfolioStore';

export default function AiChatOverlay() {
  const { projects: stellarProjects, metadata: portfolioMetadata } = usePortfolio();
  const { isAiChatOpen, toggleAiChat } = useStore();
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { 
      role: 'assistant', 
      content: 'Xin chào! Tôi là Trợ lý AI BĐS Stellar, đồng bộ với danh mục dự án trong hệ thống. Bạn cần tra cứu chỉ tiêu quy hoạch hay tiến độ 15 mốc nào?' 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [autoSpeak, setAutoSpeak] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingIndex, setSpeakingIndex] = useState<number | null>(null);
  const recognitionRef = useRef<any>(null);

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
        setInput(transcript);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const speakText = (text: string, idx?: number) => {
    if (!('speechSynthesis' in window)) return;
    
    if (isSpeaking && speakingIndex === idx) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingIndex(null);
      return;
    }

    window.speechSynthesis.cancel();

    const cleanText = text
      .replace(/[#*`_~]/g, '')
      .replace(/\[.*?\]/g, '')
      .replace(/•/g, ', ')
      .replace(/(\d+)\/(\d+)\/(\d{4})/g, 'ngày $1 tháng $2 năm $3')
      .replace(/1\/500/g, 'quy hoạch một phần năm trăm')
      .replace(/m2/gi, 'mét vuông')
      .replace(/m²/g, 'mét vuông')
      .replace(/ha\b/gi, 'héc-ta')
      .replace(/PCCC\b/g, 'phòng cháy chữa cháy')
      .replace(/GPXD\b/g, 'giấy phép xây dựng')
      .replace(/BĐS\b/g, 'bất động sản')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const viVoice = voices.find(v => v.lang.toLowerCase().includes('vi') || v.name.toLowerCase().includes('vietnam') || v.name.toLowerCase().includes('tiếng việt'));
    if (viVoice) utterance.voice = viVoice;

    utterance.onstart = () => {
      setIsSpeaking(true);
      if (typeof idx === 'number') setSpeakingIndex(idx);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingIndex(null);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setSpeakingIndex(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  if (!isAiChatOpen) {
    return (
      <button 
        onClick={toggleAiChat}
        className="fixed bottom-6 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-700 transition-transform hover:scale-105 z-50 group"
        title="Mở Trợ lý AI BĐS Stellar"
      >
        <Bot size={26} />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white"></span>
      </button>
    );
  }

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const contextSummary = {
        totalProjects: portfolioMetadata.totalProjects,
        kpi: portfolioMetadata.kpi,
        projects: stellarProjects.map(p => ({
          name: p.name,
          code: p.code,
          specs: p.specs,
          progress: p.progress
        }))
      };

      const response = await fetch('/api/ai/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          projectContext: contextSummary,
          provider: 'gemini',
          model: 'gemini-3.6-flash',
          level: 'balanced'
        })
      });

      if (!response.ok) throw new Error("Failed to get response");
      const data = await response.json();

      setMessages(prev => {
        const next = [...prev, { role: 'assistant' as const, content: data.reply }];
        if (autoSpeak) {
          setTimeout(() => speakText(data.reply, next.length - 1), 200);
        }
        return next;
      });
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Có lỗi khi kết nối tới máy chủ AI. Vui lòng thử lại sau.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-3xl shadow-2xl border border-slate-200 z-50 flex flex-col overflow-hidden" style={{ height: '520px', maxHeight: 'calc(100vh - 5rem)' }}>
      {/* Header */}
      <div className="bg-slate-900 px-4 py-3.5 flex items-center justify-between text-white">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot size={18} />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <span className="font-bold text-xs tracking-tight">Trợ lý AI BĐS Stellar</span>
              <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-1.5 py-0.2 rounded-full font-bold border border-emerald-500/30">
                vi-VN
              </span>
            </div>
            <p className="text-[10px] text-slate-400">
              Đọc & Phản hồi Tiếng Việt chuẩn
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setAutoSpeak(!autoSpeak)}
            className={`p-1.5 rounded-lg border text-[10px] font-bold flex items-center space-x-1 transition-colors ${
              autoSpeak 
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 ring-1 ring-amber-400' 
                : 'text-slate-400 hover:text-white border-transparent hover:bg-slate-800'
            }`}
            title={autoSpeak ? 'Đang bật tự động đọc Tiếng Việt' : 'Bật tự động đọc phản hồi Tiếng Việt'}
          >
            {autoSpeak ? <Volume2 size={14} className="text-amber-300 animate-pulse" /> : <VolumeX size={14} />}
            <span className="text-[10px] hidden sm:inline">Tự đọc</span>
          </button>
          <button onClick={toggleAiChat} className="text-slate-400 hover:text-white transition-colors p-1">
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 text-xs">
        {messages.map((msg, idx) => {
          const isThisSpeaking = isSpeaking && speakingIndex === idx;

          return (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[85%] p-3.5 rounded-2xl shadow-2xs ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-xs' 
                    : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-xs'
                }`}
              >
                <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                {msg.role === 'assistant' && (
                  <button
                    onClick={() => speakText(msg.content, idx)}
                    className={`mt-2 px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center space-x-1.5 transition-all ${
                      isThisSpeaking
                        ? 'bg-amber-500 text-white border-amber-600 ring-2 ring-amber-300 shadow-xs'
                        : 'bg-slate-50 text-indigo-700 border-indigo-200 hover:bg-indigo-50'
                    }`}
                  >
                    <Volume2 size={12} className={isThisSpeaking ? 'animate-bounce' : 'text-indigo-600'} />
                    <span>{isThisSpeaking ? 'Đang đọc Tiếng Việt (Dừng)' : '🇻🇳 Đọc Tiếng Việt'}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white text-slate-700 shadow-2xs border border-slate-200 rounded-2xl p-3 flex items-center space-x-2">
              <div className="w-3.5 h-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-[11px]">Trợ lý AI đang xử lý dữ liệu...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Box */}
      <div className="p-3 bg-white border-t border-slate-100">
        <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl px-3 py-1.5 space-x-1.5">
          <button
            onClick={toggleListening}
            title="Nói để nhập"
            className={`p-1.5 rounded-xl transition-colors ${
              isListening ? 'bg-red-500 text-white animate-pulse' : 'text-slate-400 hover:text-indigo-600'
            }`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
          </button>
          
          <input 
            type="text" 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={isListening ? 'Đang lắng nghe...' : 'Hỏi chỉ tiêu, tiến độ dự án...'}
            className="flex-1 bg-transparent border-none focus:outline-none text-xs text-slate-800 placeholder-slate-400"
          />

          <button 
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="text-white bg-indigo-600 disabled:opacity-40 p-1.5 rounded-xl hover:bg-indigo-700 transition-colors shrink-0"
          >
            <Send size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}
