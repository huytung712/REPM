import React from 'react';
import { AlertTriangle } from 'lucide-react';

/** Đánh dấu rõ các màn hình mới là giao diện mẫu, chưa kết nối dịch vụ thật */
export default function DemoNotice({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs text-amber-900 flex gap-2">
      <AlertTriangle size={16} className="shrink-0 text-amber-600 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}
