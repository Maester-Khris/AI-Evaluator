import { Footer } from '@/features/marketing/components/Footer';
import { CheckCircle2, Zap, Database, Shield } from 'lucide-react';

export const FeaturesPage = () => {
  const features = [
    { title: "Real-time Streaming", desc: "Native WebSocket integration for zero-latency AI responses.", icon: <Zap /> },
    { title: "In-place Evaluation", desc: "Rate and comment on every AI turn to track quality.", icon: <CheckCircle2 /> },
    { title: "Session Merging", desc: "Start as a guest, keep your history when you sign up.", icon: <Database /> },
    { title: "Pro Infrastructure", desc: "Dedicated Python/Node pipeline for high-throughput tasks.", icon: <Shield /> },
  ];

  return (
    <>
      <div className="py-20 px-4 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center">Engineered for Quality</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div key={i} className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50">
              <div className="text-blue-500 mb-4">{f.icon}</div>
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </>
  );
};