import { Button } from "@/common/ui/button";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Link, Outlet } from "react-router-dom";


export const PublicLayout = () => {
    const { user } = useAuth();

    return (
        <div className="flex flex-col min-h-screen bg-slate-950 text-white">
            {/* Minimal Nav */}
            <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link to="/" className="text-xl font-bold tracking-tighter hover:opacity-80 transition-opacity">
                        RC-Evaluator
                    </Link>
                    
                    <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
                        <Link to="/" className="hover:text-white transition-colors">Home</Link>
                        <Link to="/features" className="hover:text-white transition-colors">Features</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" asChild>
                            <Link to={user ? "/chat" : "/chat"}>
                                {user ? "Go to Dashboard" : "Try as Guest"}
                            </Link>
                        </Button>
                    </div>
                </div>
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