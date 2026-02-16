import { Link } from 'react-router-dom';
import { Button } from '../../common/ui/button';
import { Footer } from '@/features/marketing/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MousePointer2 } from 'lucide-react';


export const HomePage = () => {
  return (
    <div className="bg-slate-950 text-white selection:bg-blue-500/30">
      {/* HERO SECTION */}
      <section className="relative h-screen flex items-center overflow-hidden px-6">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="z-10">
            <h1 className="text-6xl font-bold leading-tight mb-6 bg-gradient-to-r from-white to-slate-500 bg-clip-text text-transparent">
              Engineered for <br /> AI Reliability.
            </h1>
            <p className="text-slate-400 text-lg mb-8 max-w-lg">
              RC-Evaluator bridges the gap between raw LLM output and production-ready intelligence through human-in-the-loop evaluation.
            </p>
            <div className="flex gap-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/20" asChild>
                <Link to="/chat">Start Chatting</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-slate-800 hover:bg-white/5">
                Technical Whitepaper
              </Button>
            </div>
          </div>

          <div className="relative w-full max-w-lg aspect-video bg-[#030712] rounded-2xl border border-white/10 shadow-2xl p-6 font-mono text-sm overflow-hidden">
            {/* Moving Cursor Simulation */}
            <motion.div
              initial={{ x: 400, y: 300, opacity: 0 }}
              animate={{
                x: [400, 150, 150],
                y: [300, 180, 180],
                opacity: [0, 1, 1]
              }}
              transition={{ duration: 4, repeat: Infinity, repeatDelay: 2, times: [0, 0.7, 1] }}
              className="absolute z-50 text-blue-500"
            >
              <MousePointer2 size={24} fill="currentColor" />
            </motion.div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 text-blue-400">
                <span className="opacity-50 text-xs">READY</span>
                <motion.p>
                  {/* Typing animation logic here */}
                  $ user.prompt("run_eval")
                </motion.p>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5 }}
                className="bg-white/5 border border-white/5 p-4 rounded-lg text-slate-400 text-xs leading-relaxed"
              >
                Analyzing response pattern... <br />
                <span className="text-emerald-400">Success:</span> Alignment score generated.
              </motion.div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                {[1, 2, 3, 4, 5].map((s) => (
                  <motion.div
                    key={s}
                    animate={s === 4 ? { scale: [1, 1.3, 1], color: ['#475569', '#facc15', '#facc15'] } : {}}
                    transition={{ delay: 3, duration: 0.5 }}
                  >
                    <Star size={18} fill={s === 4 ? "currentColor" : "none"} />
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold tracking-tight mb-4 text-white">Beyond Simple Context</h2>
            <p className="text-slate-500">The evolution of engineering-grade LLM interaction.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Card 1: Static */}
            <div className="bg-[#030712] border border-white/10 p-12 rounded-[2.5rem] transition-all hover:border-white/20">
              <h3 className="text-3xl font-bold mb-8 text-white">Context-Aware</h3>
              <ul className="space-y-6">
                {["Retrieval-Augmented Generation", "Static Documentation Sync", "High-speed Inference"].map(item => (
                  <li key={item} className="flex items-center gap-4 text-slate-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 2: Behavior-Aware (SaaS Focus) */}
            <div className="bg-[#030712] border border-blue-500/30 p-10 rounded-3xl relative overflow-hidden group shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)]">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-blue-500 text-[10px] font-bold px-2 py-1 rounded-full text-white uppercase tracking-tighter">Recommended</span>
              </div>
              <h3 className="text-2xl font-bold mb-6 text-white">Behavior-Aware Intelligence</h3>
              <ul className="space-y-4 text-slate-300">
                <li className="flex items-center gap-3 text-blue-400 font-medium">✓ Real-time Human Alignment</li>
                <li className="flex items-center gap-3">✓ Behavioral Data Capture</li>
                <li className="flex items-center gap-3">✓ Traceable Correction Paths</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};