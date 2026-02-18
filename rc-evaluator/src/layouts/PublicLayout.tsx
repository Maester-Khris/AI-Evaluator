import { Link, Outlet } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/common/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";

export const PublicLayout = () => {
	const { user } = useAuth();
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	return (
		<div className="flex flex-col min-h-screen bg-slate-950 text-white">
			{/* Minimal Nav */}
			<header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-6 h-20 flex items-center">
					{/* Logo - Left */}
					<div className="flex-1">
						<Link
							to="/"
							className="text-xl font-black tracking-tighter hover:opacity-80 transition-opacity flex items-center gap-2"
						>
							<div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
								<span className="text-white text-xs">RC</span>
							</div>
							<span className="bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
								RC-Evaluator
							</span>
						</Link>
					</div>

					{/* Navigation - Centered */}
					<nav className="hidden md:flex items-center gap-10 text-xs font-bold uppercase tracking-widest text-slate-400">
						<Link to="/" className="hover:text-blue-400 transition-colors">
							Index
						</Link>
						<Link
							to="/features"
							className="hover:text-blue-400 transition-colors"
						>
							Capabilities
						</Link>
						<Link
							to="/docs"
							className="hover:text-blue-400 transition-colors"
						>
							Docs
						</Link>
					</nav>

					{/* Actions - Right */}
					<div className="flex-1 flex justify-end items-center gap-4">
						<div className="hidden md:flex items-center gap-4">
							<Button
								variant="ghost"
								className="text-xs font-bold uppercase tracking-widest hover:bg-white/5"
								asChild
							>
								<Link to={user ? "/chat" : "/chat"}>
									{user ? "Console" : "Guest Mode"}
								</Link>
							</Button>
							{!user && (
								<Button
									size="sm"
									className="bg-blue-600 hover:bg-blue-500 text-xs font-bold uppercase tracking-widest rounded-full px-6"
								>
									Sign In
								</Button>
							)}
						</div>

						{/* Mobile Menu Toggle */}
						<button
							className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
							onClick={() => setIsMenuOpen(!isMenuOpen)}
						>
							{isMenuOpen ? <X size={24} /> : <Menu size={24} />}
						</button>
					</div>
				</div>

				{/* Mobile Navigation */}
				{isMenuOpen && (
					<div className="md:hidden border-t border-slate-800 bg-slate-900 px-6 py-8 space-y-6 animate-in slide-in-from-top duration-300">
						<nav className="flex flex-col gap-6 text-sm font-bold uppercase tracking-widest text-slate-400">
							<Link
								to="/"
								className="hover:text-blue-400 transition-colors"
								onClick={() => setIsMenuOpen(false)}
							>
								Index
							</Link>
							<Link
								to="/features"
								className="hover:text-blue-400 transition-colors"
								onClick={() => setIsMenuOpen(false)}
							>
								Capabilities
							</Link>
							<Link
								to="/docs"
								className="hover:text-blue-400 transition-colors"
								onClick={() => setIsMenuOpen(false)}
							>
								Docs
							</Link>
						</nav>
						<div className="pt-6 border-t border-slate-800 flex flex-col gap-4">
							<Button
								variant="ghost"
								className="w-full text-xs font-bold uppercase tracking-widest hover:bg-white/5 justify-start px-0"
								asChild
							>
								<Link
									to={user ? "/chat" : "/chat"}
									onClick={() => setIsMenuOpen(false)}
								>
									{user ? "Console" : "Guest Mode"}
								</Link>
							</Button>
							{!user && (
								<Button
									size="sm"
									className="w-full bg-blue-600 hover:bg-blue-500 text-xs font-bold uppercase tracking-widest rounded-full h-12"
								>
									Sign In
								</Button>
							)}
						</div>
					</div>
				)}
			</header>

			{/* Content Injection Point */}
			<main className="flex-grow">
				<Outlet />
			</main>

			{/* Minimal Footer */}
			<footer className="border-t border-slate-900 py-12 bg-slate-950">
				<div className="max-w-7xl mx-auto px-6 text-center text-slate-500 text-sm">
					<p>© 2026 RC-Evaluator. Built for AI Data Quality.</p>
				</div>
			</footer>
		</div>
	);
};
