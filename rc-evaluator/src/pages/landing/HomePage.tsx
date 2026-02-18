import { motion } from "framer-motion";
import {
	Cpu,
	MousePointer2,
	RefreshCw,
	Star,
	UserCheck,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Footer } from "@/features/marketing/components/Footer";
import { Button } from "../../common/ui/button";

export const HomePage = () => {
	return (
		<div className="bg-slate-950 text-white selection:bg-blue-500/30">
			{/* HERO SECTION */}
			<section className="relative min-h-screen flex items-center overflow-hidden px-6 py-20 lg:py-0">
				<div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
					<div className="z-10 text-center lg:text-left">
						<h1 className="text-4xl md:text-6xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white via-blue-100 to-slate-400 bg-clip-text text-transparent">
							Elevate AI Intelligence <br /> through Human Insight.
						</h1>
						<p className="text-slate-400 text-lg mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
							RC-Evaluator bridges the gap between raw LLM output and
							production-ready intelligence. Leverage human expertise to train
							models that truly understand your unique requirements.
						</p>
						<div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
							<Button
								size="lg"
								className="bg-blue-600 hover:bg-blue-500 shadow-xl shadow-blue-500/20"
								asChild
							>
								<Link to="/chat">Start Chatting</Link>
							</Button>
							<Button
								size="lg"
								variant="outline"
								className="border-white/10 bg-white/5 hover:bg-white/10 text-white transition-colors"
							>
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
								opacity: [0, 1, 1],
							}}
							transition={{
								duration: 4,
								repeat: Infinity,
								repeatDelay: 2,
								times: [0, 0.7, 1],
							}}
							className="absolute z-50 text-blue-500"
						>
							<MousePointer2 size={24} fill="currentColor" />
						</motion.div>

						<div className="space-y-4">
							<motion.div className="flex">
								<span className="mr-2 text-blue-400">$</span>
								<motion.p>
									{'user.prompt("run_eval")'.split("").map((char, i) => (
										<motion.span
											className="text-blue-400"
											key={i}
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											transition={{
												delay: 0.5 + i * 0.1,
												duration: 0.01,
												repeat: Infinity,
												repeatDelay: 4, // Match with total cycle
											}}
										>
											{char}
										</motion.span>
									))}
									<motion.span
										animate={{ opacity: [0, 1, 0] }}
										transition={{ duration: 0.8, repeat: Infinity }}
										className="inline-block w-1.5 h-4 bg-blue-500 ml-1 translate-y-0.5"
									/>
								</motion.p>
							</motion.div>

							<motion.div
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 1.5 }}
								className="bg-white/5 border border-white/5 p-4 rounded-lg text-slate-400 text-xs leading-relaxed"
							>
								Analyzing response pattern... <br />
								<span className="text-emerald-400">Success:</span> Alignment
								score generated.
							</motion.div>

							<div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
								{[1, 2, 3, 4, 5].map((s) => (
									<motion.div
										key={s}
										animate={
											s === 4
												? {
													scale: [1, 1.3, 1],
													color: ["#475569", "#facc15", "#facc15"],
												}
												: {}
										}
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

			<section className="py-24 px-6 relative overflow-hidden">
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-16 px-4">
						<h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4 text-white">
							How It Works
						</h2>
						<p className="text-slate-400 max-w-2xl mx-auto text-sm md:text-base">
							A closed-loop system designed to continuously refine and align
							your AI agents.
						</p>
					</div>

					<div className="grid md:grid-cols-3 gap-8">
						{[
							{
								icon: <Cpu className="text-blue-500" size={32} />,
								title: "1. Generate",
								desc: "Deploy your LLM agents through our optimized pipeline for high-performance response generation.",
							},
							{
								icon: <UserCheck className="text-blue-500" size={32} />,
								title: "2. Review",
								desc: "Human experts provide granular feedback, corrections, and behavioral commands in real-time.",
							},
							{
								icon: <RefreshCw className="text-blue-500" size={32} />,
								title: "3. Adapt",
								desc: "Our engine processes feedback to fine-tune model behavior, aligning output with human preferences.",
							},
						].map((step, i) => (
							<div
								key={i}
								className="bg-slate-900/40 border border-white/5 p-8 rounded-3xl hover:border-blue-500/30 transition-colors group"
							>
								<div className="mb-6 p-3 bg-blue-500/10 w-fit rounded-2xl group-hover:scale-110 transition-transform">
									{step.icon}
								</div>
								<h3 className="text-xl font-bold mb-3 text-white">
									{step.title}
								</h3>
								<p className="text-slate-400 text-sm leading-relaxed">
									{step.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-32 px-6 bg-slate-950">
				<div className="max-w-6xl mx-auto">
					<div className="text-center mb-20">
						<h2 className="text-4xl font-bold tracking-tight mb-4 text-white">
							Why Lead with RLHF?
						</h2>
						<p className="text-slate-500">
							The outcome of engineering-grade LLM interaction.
						</p>
					</div>

					<div className="grid md:grid-cols-2 gap-12">
						{/* Card 1: Static */}
						<div className="bg-[#030712] border border-white/10 p-8 md:p-12 rounded-3xl md:rounded-[2.5rem] transition-all hover:border-white/20">
							<h3 className="text-2xl md:text-3xl font-bold mb-8 text-white text-balance">
								Traditional <br /> Contextualization
							</h3>
							<ul className="space-y-6">
								{[
									"Basic Retrieval (RAG)",
									"Static Knowledge Bases",
									"One-time Prompt Engineering",
									"Generic Model Behavior",
								].map((item) => (
									<li
										key={item}
										className="flex items-center gap-4 text-slate-400"
									>
										<div className="w-1.5 h-1.5 rounded-full bg-slate-700" />{" "}
										{item}
									</li>
								))}
							</ul>
						</div>

						{/* Card 2: Behavior-Aware (SaaS Focus) */}
						<div className="bg-[#030712] border border-blue-500/30 p-8 md:p-10 rounded-3xl md:rounded-[2.5rem] relative overflow-hidden group shadow-[0_0_50px_-12px_rgba(59,130,246,0.2)]">
							<div className="absolute top-0 right-0 p-6">
								<span className="bg-blue-600 text-[10px] font-bold px-3 py-1 rounded-full text-white uppercase tracking-wider">
									RC-Evaluator Method
								</span>
							</div>
							<h3 className="text-2xl md:text-3xl font-bold mb-8 text-white">
								Behavior-Aware Intelligence
							</h3>
							<ul className="space-y-6">
								<li className="flex items-center gap-4 text-blue-400 font-medium whitespace-nowrap">
									<div className="w-1.5 h-1.5 rounded-full bg-blue-500" />{" "}
									Real-time Human Alignment
								</li>
								<li className="flex items-center gap-4 text-slate-300">
									<div className="w-1.5 h-1.5 rounded-full bg-slate-700" />{" "}
									Behavioral Data Capture
								</li>
								<li className="flex items-center gap-4 text-slate-300 whitespace-nowrap">
									<div className="w-1.5 h-1.5 rounded-full bg-slate-700" />{" "}
									Traceable Correction Paths
								</li>
								<li className="flex items-center gap-4 text-slate-300">
									<div className="w-1.5 h-1.5 rounded-full bg-slate-700" />{" "}
									Continuous Model RLHF
								</li>
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* <section className="py-24 px-6 bg-[#020617] border-y border-white/5">
				<div className="max-w-4xl mx-auto text-center">
					<Quote className="mx-auto text-blue-500/20 mb-8" size={64} />
					<h2 className="text-3xl font-medium text-white italic mb-10 leading-snug">
						"RC-Evaluator transformed our generic chatbot into a domain expert that actually resonates with our users' brand voice."
					</h2>
					<div className="flex items-center justify-center gap-4">
						<div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600" />
						<div className="text-left">
							<p className="font-bold text-white">Alex Chen</p>
							<p className="text-slate-500 text-sm">Head of AI, TechFlow Solutions</p>
						</div>
					</div>
				</div>
			</section> */}

			<Footer />
		</div>
	);
};
