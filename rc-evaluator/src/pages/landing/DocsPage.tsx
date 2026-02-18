import { HelpCircle, Book, Code, Terminal } from "lucide-react";
import { SEO } from "../../common/components/SEO";
import { Footer } from "@/features/marketing/components/Footer";

export const DocsPage = () => {
    const sections = [
        {
            title: "Getting Started",
            icon: <Terminal className="text-blue-500" />,
            content: "Learn how to integrate RC-Evaluator into your LLM development workflow in less than 5 minutes.",
        },
        {
            title: "Core Concepts",
            icon: <HelpCircle className="text-blue-500" />,
            content: "Explore the philosophy behind behavioral alignment and Reinforcement Learning from Human Feedback (RLHF).",
        },
        {
            title: "API Reference",
            icon: <Code className="text-blue-500" />,
            content: "Detailed documentation for our high-throughput evaluation pipeline and data export APIs.",
        },
        {
            title: "Research Ethics",
            icon: <Book className="text-blue-500" />,
            content: "Guidelines on responsible AI evaluation and human-in-the-loop best practices.",
        },
    ];

    return (
        <div className="bg-slate-950 text-white selection:bg-blue-500/30">
            <SEO
                title="Documentation"
                description="Access the full technical documentation, API references, and core concepts for the RC-Evaluator platform."
                canonical="https://rc-evaluator.com/docs"
            />

            <section className="py-24 px-6 max-w-5xl mx-auto">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                        Documentation
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                        Everything you need to build, evaluate, and align your AI agents.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {sections.map((section, i) => (
                        <div
                            key={i}
                            className="p-8 rounded-3xl border border-slate-800 bg-slate-900/40 hover:border-blue-500/30 transition-all group"
                        >
                            <div className="mb-6 p-3 bg-blue-500/10 w-fit rounded-2xl group-hover:scale-110 transition-transform">
                                {section.icon}
                            </div>
                            <h3 className="text-xl font-bold mb-3 text-white">
                                {section.title}
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                {section.content}
                            </p>
                            <button className="mt-6 text-blue-400 text-xs font-bold uppercase tracking-widest hover:text-blue-300 transition-colors">
                                Read More &rarr;
                            </button>
                        </div>
                    ))}
                </div>
            </section>

            <Footer />
        </div>
    );
};
