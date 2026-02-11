import { useNotification } from '@/hooks/useNotification';
import { AlertCircle, X, CheckCircle, Info } from 'lucide-react';
import { useEffect } from 'react';

export const GlobalNotification = () => {
  const { message, type, clear } = useNotification();

  useEffect(() => {
    if (message) {
      const timer = setTimeout(clear, 5000); // Auto-hide after 5s
      return () => clearTimeout(timer);
    }
  }, [message, clear]);

  if (!message) return null;

  const styles = {
    error: "bg-red-500/10 border-red-500/50 text-red-200",
    success: "bg-emerald-500/10 border-emerald-500/50 text-emerald-200",
    info: "bg-blue-500/10 border-blue-500/50 text-blue-200",
    offline: "bg-yellow-500/10 border-yellow-500/50 text-yellow-200",
  };

  const Icon = type === 'error' ? AlertCircle : type === 'success' ? CheckCircle : type === 'offline' ? AlertCircle : Info;

  return (
    <div className="fixed bottom-6 right-6 z-[100] w-full max-w-md px-4 animate-in fade-in slide-in-from-bottom-4">
      <div className={`flex items-center gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg ${styles[type]}`}>
        <Icon size={18} className="shrink-0" />
        <p className="flex-1 text-sm font-medium">{message}</p>
        <button onClick={clear} className="p-1 hover:bg-white/10 rounded-md transition-colors">
          <X size={16} />
        </button>
      </div>
    </div>
  );
};