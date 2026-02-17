// src/features/marketing/components/Footer.tsx
export const Footer = () => {
	return (
		<footer className="bg-slate-950/50 backdrop-blur-xl border-t border-white/5 mt-20">
			<div className="max-w-7xl mx-auto px-6 py-12">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-12">
					{/* Brand Section */}
					<div className="space-y-4">
						<h5 className="text-xl font-bold tracking-tighter text-white">
							RC-Evaluator
						</h5>
						<p className="text-slate-400 text-sm leading-relaxed">
							A high-performance sanctuary for LLM evaluation and
							human-in-the-loop research. Built for engineers to bridge the gap
							between AI context and real-world behavior.
						</p>
						<div className="flex gap-4 text-slate-500">
							<span className="hover:text-blue-400 cursor-pointer transition-colors font-mono text-xs">
								GITHUB
							</span>
							<span className="hover:text-blue-400 cursor-pointer transition-colors font-mono text-xs">
								TWITTER_X
							</span>
							<span className="hover:text-blue-400 cursor-pointer transition-colors font-mono text-xs">
								LINKEDIN
							</span>
						</div>
					</div>

					{/* Ecosystem Section */}
					<div className="md:px-12">
						<h5 className="text-sm font-semibold text-slate-200 uppercase tracking-widest mb-4">
							Ecosystem
						</h5>
						<ul className="space-y-2 text-slate-400 text-sm">
							<li>
								<a href="#" className="hover:text-white transition-colors">
									Documentation
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-white transition-colors">
									Fine-tuning API
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-white transition-colors">
									Research Ethics
								</a>
							</li>
							<li>
								<a href="#" className="hover:text-white transition-colors">
									Investor Relations
								</a>
							</li>
						</ul>
					</div>

					{/* Newsletter Section */}
					<div className="space-y-4">
						<h5 className="text-sm font-semibold text-slate-200 uppercase tracking-widest mb-4">
							Stay in the Loop
						</h5>
						<p className="text-slate-400 text-sm">
							Get the weekly digest of behavioral AI research.
						</p>
						<form className="flex gap-2">
							<input
								type="email"
								placeholder="email@research.com"
								className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500/50"
							/>
							<button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg shadow-blue-500/20">
								Join
							</button>
						</form>
					</div>
				</div>

				{/* <div className="mt-12 pt-8 border-t border-white/5 text-center">
                    <p className="text-slate-600 text-xs">
                        &copy; 2026 RC-Evaluator Project. All rights reserved.
                        <span className="ml-2 text-slate-800">// Engineered for Clarity.</span>
                    </p>
                </div> */}
			</div>
		</footer>
	);
};
