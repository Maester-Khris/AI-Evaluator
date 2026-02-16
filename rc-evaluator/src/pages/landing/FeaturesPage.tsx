import { Button } from '@/common/ui/button';
import { Footer } from '@/features/marketing/components/Footer';
import { CheckCircle2, Zap, Database, Shield } from 'lucide-react';

export const FeaturesPage = () => {
  const features = [
    { title: "Real-time Streaming", desc: "Native WebSocket integration for zero-latency AI responses.", icon: <Zap /> },
    { title: "In-place Evaluation", desc: "Rate and comment on every AI turn to track quality.", icon: <CheckCircle2 /> },
    { title: "Session Merging", desc: "Start as a guest, keep your history when you sign up.", icon: <Database /> },
    { title: "Pro Infrastructure", desc: "Dedicated Python/Node pipeline for high-throughput tasks.", icon: <Shield /> },
  ];

  const plans = [
    {
      name: "Starter",
      price: "$0",
      desc: "For individual research and guest experimentation.",
      features: ["In-memory Guest Sessions", "Standard LLM Access", "Basic Evaluation Loop", "Community Support"],
      cta: "Start for Free",
      variant: "outline"
    },
    {
      name: "Pro",
      price: "$29",
      desc: "Everything in Starter, plus advanced behavior tracking.",
      features: ["Persistent Session History", "Behavioral Dataset Export", "Priority Redis Pipeline", "Email Support"],
      cta: "Get Started",
      highlight: true
    }
    // {
    //   name: "Scale",
    //   price: "$299",
    //   desc: "Build and align at production scale.",
    //   features: ["Team Collaboration", "API Access (Node/Python)", "Custom Fine-tuning Loops", "99.9% Uptime SLA"],
    //   cta: "Get Started",
    //   variant: "outline"
    // },
    // {
    //   name: "Enterprise",
    //   price: "Custom",
    //   desc: "Deep alignment and security for large organizations.",
    //   features: ["SSO & RBAC", "Dedicated GPU Compute", "On-premise Deployment", "24/7 Premium Support"],
    //   cta: "Contact Us",
    //   variant: "outline"
    // }
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
      <section className="py-24 px-4 bg-[#020617]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tighter mb-4 uppercase">Designed for Growth</h2>
            <p className="text-slate-500">Start for free. Pay only for what you evaluate.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-16">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`p-8 rounded-xl border flex flex-col ${plan.highlight
                  ? "bg-white text-slate-950 border-white shadow-[0_0_40px_rgba(255,255,255,0.1)]"
                  : "bg-[#030712] border-white/10 text-white"
                  }`}
              >
                <div className="mb-8">
                  <h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-70">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-sm opacity-50">/mo</span>}
                  </div>
                  <p className={`mt-4 text-xs leading-relaxed ${plan.highlight ? "text-slate-600" : "text-slate-400"}`}>
                    {plan.desc}
                  </p>
                </div>

                <ul className="space-y-4 mb-8 flex-grow">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-3 text-[11px] font-medium uppercase tracking-tight">
                      <div className={`mt-0.5 w-3 h-3 flex-shrink-0 flex items-center justify-center rounded-full ${plan.highlight ? "bg-emerald-500 text-white" : "bg-white/10"}`}>
                        <span className="text-[8px]">✓</span>
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full font-bold uppercase text-[10px] tracking-widest h-12 ${plan.highlight ? "bg-slate-950 text-white" : "bg-white/5 border-white/10 hover:bg-white/10"
                    }`}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};