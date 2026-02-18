import {
	BrainCircuit,
	HelpCircle,
	LineChart,
	Shield,
	Target,
} from "lucide-react";
import { Button } from "@/common/ui/button";
import { Footer } from "@/features/marketing/components/Footer";

export const FeaturesPage = () => {
	const features = [
		{
			title: "Behavioral Alignment",
			desc: "Go beyond prompting. Use human feedback to align LLM responses with specific brand voices and complex behavioral patterns.",
			icon: <BrainCircuit />,
		},
		{
			title: "Evaluation Analytics",
			desc: "Track quality improvements over time with detailed dashboards showing alignment scores and common failure modes.",
			icon: <LineChart />,
		},
		{
			title: "Instruction Tuning",
			desc: "Convert human corrections directly into training data for continuous model improvement and adaptation.",
			icon: <Target />,
		},
		{
			title: "Pro Infrastructure",
			desc: "Dedicated high-throughput pipeline designed for enterprise-grade evaluation workflows and rapid scaling.",
			icon: <Shield />,
		},
	];

	const plans = [
		{
			name: "Starter",
			price: "$0",
			desc: "For individual research and guest experimentation.",
			features: [
				"In-memory Guest Sessions",
				"Standard LLM Access",
				"Basic Evaluation Loop",
				"Community Support",
			],
			cta: "Start for Free",
			variant: "outline",
		},
		{
			name: "Pro",
			price: "$__",
			desc: "Everything in Starter, plus advanced behavior tracking.",
			features: [
				"Persistent Session History",
				"Behavioral Dataset Export",
				"Priority Redis Pipeline",
				"Email Support",
			],
			cta: "Get Started",
			highlight: true,
		},
	];

	return (
		<>
			<div className="py-20 px-6 max-w-6xl mx-auto">
				<h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-white">
					Engineered for Quality
				</h2>
				<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
					{features.map((f, i) => (
						<div
							key={i}
							className="p-6 rounded-2xl border border-slate-800 bg-slate-900/50"
						>
							<div className="text-blue-500 mb-4">{f.icon}</div>
							<h3 className="font-semibold mb-2">{f.title}</h3>
							<p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
						</div>
					))}
				</div>
			</div>
			<section className="py-24 px-4 bg-[#020617]">
				<div className="max-w-7xl mx-auto">
					<div className="text-center mb-16 px-4">
						<h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4 uppercase text-white">
							Designed for Growth
						</h2>
						<p className="text-slate-500">
							Start for free. Pay only for what you evaluate.
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
						{plans.map((plan) => (
							<div
								key={plan.name}
								className={`p-8 rounded-xl border flex flex-col ${plan.highlight
										? "bg-white text-slate-950 border-white shadow-[0_0_40px_rgba(255,255,255,0.1)]"
										: "bg-[#030712] border-white/10 text-white"
									}`}
							>
								<div className="mb-8">
									<h3 className="text-xs font-bold uppercase tracking-widest mb-4 opacity-70">
										{plan.name}
									</h3>
									<div className="flex items-baseline gap-1">
										<span className="text-4xl font-black">{plan.price}</span>
										{plan.price !== "Custom" && (
											<span className="text-sm opacity-50">/mo</span>
										)}
									</div>
									<p
										className={`mt-4 text-xs leading-relaxed ${plan.highlight ? "text-slate-600" : "text-slate-400"}`}
									>
										{plan.desc}
									</p>
								</div>

								<ul className="space-y-4 mb-8 flex-grow">
									{plan.features.map((feat) => (
										<li
											key={feat}
											className="flex items-start gap-3 text-[11px] font-medium uppercase tracking-tight"
										>
											<div
												className={`mt-0.5 w-3 h-3 flex-shrink-0 flex items-center justify-center rounded-full ${plan.highlight ? "bg-emerald-500 text-white" : "bg-white/10"}`}
											>
												<span className="text-[8px]">✓</span>
											</div>
											{feat}
										</li>
									))}
								</ul>

								<Button
									className={`w-full font-bold uppercase text-[10px] tracking-widest h-12 ${plan.highlight
											? "bg-slate-950 text-white"
											: "bg-white/5 border-white/10 hover:bg-white/10"
										}`}
								>
									{plan.cta}
								</Button>
							</div>
						))}
					</div>
				</div>
			</section>
			<section className="py-24 px-4 bg-slate-950">
				<div className="max-w-3xl mx-auto">
					<div className="text-center mb-16">
						<h2 className="text-3xl font-bold mb-4">
							Frequently Asked Questions
						</h2>
						<p className="text-slate-500">
							Everything you need to know about our evaluation platform.
						</p>
					</div>

					<div className="space-y-6">
						{[
							{
								q: "How does human feedback improve the model?",
								a: "Every evaluation and correction is captured as training data. This data is then used in a Reinforcement Learning from Human Feedback (RLHF) loop to fine-tune the model's policy, making it more aligned with your specific preferences over time.",
							},
							{
								q: "Can I use my own LLM models?",
								a: "Yes, RC-Evaluator is model-agnostic. You can connect your proprietary models or use our pre-configured access to industry-leading LLMs.",
							},
							{
								q: "Is my training data secure?",
								a: "Absolutely. We employ enterprise-grade encryption and give you full control over your behavioral datasets. Your data is used exclusively to refine your specific model instances.",
							},
							{
								q: "What is 'Behavior-Aware' intelligence?",
								a: "It's the ability for an AI to not just know facts, but to understand the nuance of HOW it should respond based on previous human interactions and explicit behavioral commands.",
							},
						].map((item, i) => (
							<div
								key={i}
								className="p-6 rounded-2xl border border-white/5 bg-white/[0.02]"
							>
								<h3 className="flex items-center gap-3 font-semibold mb-3 text-white text-lg">
									<HelpCircle size={18} className="text-blue-500" />
									{item.q}
								</h3>
								<p className="text-slate-400 text-sm leading-relaxed ml-7">
									{item.a}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>
			<Footer />
		</>
	);
};
