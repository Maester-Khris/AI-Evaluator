import { ArrowUp, Bot, Copy, Terminal, User } from "lucide-react";
import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { ScrollArea } from "@/common/ui/scroll-area";
import { Textarea } from "@/common/ui/textarea";
import { MessageReview } from "@/features/review/components/MessageReview"; // Component
import type { MessageReview as MessageReviewType } from "@/features/review/types"; // Type



type ChatWindowComponent = React.FC<{ children: React.ReactNode }> & {
	Messages: React.FC<{
		messages: any[];
		onEvaluate: (evaluation: MessageReviewType) => void;
	}>;

	Input: React.FC<{ onSubmit: (val: string) => void }>;
};


// 1. Parent Wrapper: Now uses a darker, unified background
export const ChatWindow: ChatWindowComponent = ({ children }) => {
	return (
		// <div className="flex flex-col h-full relative bg-[#3B4159] font-sans selection:bg-zinc-700/50">
		// 	{children}
		// </div>
		<div className="flex flex-col h-full relative bg-[#020617] selection:bg-blue-500/30 overflow-hidden">
			{/* Subtle top-center glow to define the space */}
			<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[50vh] bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-500/5 via-transparent to-transparent pointer-events-none" />
			{children}
		</div>
	);
};

// 2. The Messages Display
const Messages: React.FC<{
	messages: any[];
	onEvaluate: (evaluation: MessageReviewType) => void;
}> = ({ messages, onEvaluate }) => {
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			const viewport = scrollRef.current.querySelector(
				"[data-radix-scroll-area-viewport]",
			);
			if (viewport)
				viewport.scrollTo({ top: viewport.scrollHeight, behavior: "smooth" });
		}
	}, [messages]);

	// helper to ensure we never pass an object to the renderer
	const getRenderableText = (content: any): string => {
		if (!content) return "";
		if (typeof content === "string") {
			// Check if it's a stringified JSON object by mistake
			if (content.startsWith("{")) {
				try {
					const parsed = JSON.parse(content);
					return parsed.text || content;
				} catch {
					return content;
				}
			}
			return content;
		}
		if (typeof content === "object") {
			if (typeof content.text === "string") return content.text;
			return JSON.stringify(content, null, 2);
		}

		return String(content);
	};

	return (
		// <ScrollArea ref={scrollRef} className="flex-1 h-full overflow-hidden">
		// 	<div className="pt-[10vh] pb-48 px-4 md:px-0">
		// 		<div className="max-w-3xl mx-auto space-y-12">
		// 			{messages.length === 0 ? (
		// 				<div className="text-center py-20">
		// 					<h1 className="text-4xl font-bold tracking-tight text-zinc-100 opacity-80 italic">
		// 						How can I help you today?
		// 					</h1>
		// 				</div>
		// 			) : (
		// 				messages.map((m, i) => {
		// 					const role = m.sender;
		// 					const isAssistant = role === "assistant";
		// 					const textToShow = getRenderableText(m.content);

		// 					return (
		// 						<div
		// 							key={m.id || i}
		// 							className={`flex w-full ${isAssistant ? "justify-start" : "justify-end"}`}
		// 						>
		// 							<div
		// 								className={`flex gap-3 max-w-[85%] md:max-w-[80%] ${isAssistant ? "flex-row" : "flex-row-reverse text-right"}`}
		// 							>
		// 								<div
		// 									className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border mt-1 shadow-sm ${isAssistant
		// 										? "bg-[#2D3249] border-white/10 text-zinc-300"
		// 										: "bg-white border-white/20 text-zinc-900"
		// 										}`}
		// 								>
		// 									{isAssistant ? <Bot size={16} /> : <User size={16} />}
		// 								</div>

		// 								<div className="flex flex-col">
		// 									<span className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-400/80 mb-0.5 px-1">
		// 										{isAssistant ? "AI Evaluator" : "You"}
		// 									</span>

		// 									<div
		// 										className={`prose prose-invert prose-sm max-w-none rounded-2xl p-4 shadow-lg border ${isAssistant
		// 											? "bg-[#2D3249]/60 border-white/5 text-zinc-200 rounded-tl-none"
		// 											: "bg-zinc-800 border-white/10 text-zinc-100 rounded-tr-none text-left"
		// 											}`}
		// 									>
		// 										<ReactMarkdown
		// 											components={{
		// 												code({
		// 													node,
		// 													inline,
		// 													className,
		// 													children,
		// 													...props
		// 												}: any) {
		// 													const match = /language-(\w+)/.exec(
		// 														className || "",
		// 													);
		// 													const codeValue = String(children).replace(
		// 														/\n$/,
		// 														"",
		// 													);

		// 													return !inline && match ? (
		// 														<div className="relative my-2 group/code">
		// 															<div className="absolute right-2 top-2 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
		// 																<button className="p-1.5 rounded-md bg-[#1e1e1e] border border-white/10 hover:bg-zinc-800 text-zinc-400">
		// 																	<Copy size={12} />
		// 																</button>
		// 															</div>
		// 															<SyntaxHighlighter
		// 																style={vscDarkPlus}
		// 																language={match[1]}
		// 																PreTag="div"
		// 																className="rounded-xl border border-white/5 !bg-[#1e1e1e] !m-0 !p-4"
		// 																{...props}
		// 															>
		// 																{codeValue}
		// 															</SyntaxHighlighter>
		// 														</div>
		// 													) : (
		// 														<code
		// 															className="bg-black/30 rounded px-1.5 py-0.5 font-mono text-zinc-300"
		// 															{...props}
		// 														>
		// 															{children}
		// 														</code>
		// 													);
		// 												},
		// 											}}
		// 										>
		// 											{textToShow}
		// 										</ReactMarkdown>
		// 										{isAssistant && (
		// 											<MessageReview
		// 												initialRating={m.rating}
		// 												initialComment={m.evaluationComment}
		// 												onAction={(rating, comment) =>
		// 													onEvaluate({
		// 														message_id: m.id,
		// 														rating,
		// 														comment,
		// 													})
		// 												}
		// 											/>
		// 										)}
		// 									</div>
		// 								</div>
		// 							</div>
		// 						</div>
		// 					);
		// 				})
		// 			)}
		// 		</div>
		// 	</div>
		// </ScrollArea>
		<ScrollArea ref={scrollRef} className="flex-1 h-full z-10">
			<div className="pt-[15vh] pb-48 px-4 md:px-0">
				<div className="max-w-3xl mx-auto space-y-10">
					{messages.length === 0 ? (
						<div className="text-center py-20 flex flex-col items-center">
							<div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mb-6 text-blue-400">
								<Terminal size={24} />
							</div>
							<h1 className="text-3xl font-black tracking-tighter text-white uppercase mb-2">
								Evaluation Ready
							</h1>
							<p className="text-[10px] font-bold tracking-[0.3em] text-slate-500 uppercase">
								System Status: Optimal // Behavior Loop Active
							</p>
						</div>
					) : (
						messages.map((m, i) => {
							const role = m.sender;
							const isAssistant = role === "assistant";
							const textToShow = getRenderableText(m.content);

							return (
								<div
									key={m.id || i}
									className={`flex w-full ${isAssistant ? "justify-start" : "justify-end"}`}
								>
									<div
										className={`flex gap-4 max-w-[90%] md:max-w-[85%] ${isAssistant ? "flex-row" : "flex-row-reverse"}`}
									>
										{/* Avatar: Industrial styling */}
										<div
											className={`flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center border shadow-2xl transition-all ${isAssistant
												? "bg-[#030712] border-blue-500/30 text-blue-400"
												: "bg-white border-white/20 text-slate-950"
												}`}
										>
											{isAssistant ? <Bot size={18} /> : <User size={18} />}
										</div>

										<div className={`flex flex-col ${isAssistant ? "items-start" : "items-end"}`}>
											{/* Metadata: Removed italics, added letter spacing */}
											<span className="text-[9px] font-black tracking-[0.2em] uppercase text-slate-500 mb-2 px-1">
												{isAssistant ? "AI_EVALUATOR_01" : "USER_OPERATOR"}
											</span>

											{/* Bubble: Glassmorphism refined */}
											<div
												className={`prose prose-invert prose-sm max-w-none rounded-2xl p-5 shadow-2xl border transition-all ${isAssistant
													? "bg-[#030712]/80 backdrop-blur-md border-white/10 text-slate-200 rounded-tl-none"
													: "bg-blue-600 border-blue-400/30 text-white rounded-tr-none"
													}`}
											>
												<ReactMarkdown
													components={{
														code({ node, inline, className, children, ...props }: any) {
															const match = /language-(\w+)/.exec(className || "");
															const codeValue = String(children).replace(/\n$/, "");

															return !inline && match ? (
																<div className="relative my-4 group/code rounded-xl overflow-hidden border border-white/10">
																	<div className="absolute right-3 top-3 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
																		<button className="p-2 rounded-lg bg-black/50 backdrop-blur-md border border-white/10 hover:bg-black/80 text-white">
																			<Copy size={14} />
																		</button>
																	</div>
																	<SyntaxHighlighter
																		style={vscDarkPlus}
																		language={match[1]}
																		PreTag="div"
																		className="!bg-[#010409] !m-0 !p-5 text-xs font-mono leading-relaxed"
																		{...props}
																	>
																		{codeValue}
																	</SyntaxHighlighter>
																</div>
															) : (
																<code className="bg-black/40 rounded px-1.5 py-0.5 font-mono text-blue-300 border border-white/5" {...props}>
																	{children}
																</code>
															);
														},
													}}
												>
													{textToShow}
												</ReactMarkdown>

												{isAssistant && (
													<div className="mt-6 pt-4 border-t border-white/5">
														<MessageReview
															initialRating={m.rating}
															initialComment={m.evaluationComment}
															onAction={(rating, comment) =>
																onEvaluate({
																	message_id: m.id,
																	rating,
																	comment,
																})
															}
														/>
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							);
						})
					)}
				</div>
			</div>
		</ScrollArea>
	);
};

// 3. The Input Box: Clean, single-line to multi-line floating bar
const Input: React.FC<{ onSubmit: (val: string) => void }> = ({ onSubmit }) => {
	const [value, setValue] = React.useState("");

	const handleAction = () => {
		if (value.trim()) {
			onSubmit(value.trim());
			setValue("");
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleAction();
		}
	};

	return (
		// <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#3B4159] via-[#3B4159] to-transparent pt-24 pb-6 px-4">
		// 	<div className="max-w-3xl mx-auto flex flex-col items-center">
		// 		<div className="w-full relative rounded-2xl border border-white/10 bg-[#2D3249]/90 backdrop-blur-xl shadow-2xl p-1.5 flex items-end">
		// 			<Textarea
		// 				value={value}
		// 				onChange={(e) => setValue(e.target.value)}
		// 				className="flex-1 min-h-[44px] max-h-[200px] resize-none bg-transparent border-none text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0"
		// 				placeholder="Message AI Evaluator..."
		// 				onKeyDown={handleKeyDown}
		// 			/>
		// 			<button
		// 				onClick={handleAction}
		// 				className="mb-1.5 mr-1.5 w-9 h-9 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-white transition-all flex items-center justify-center"
		// 			>
		// 				<ArrowUp size={20} />
		// 			</button>
		// 		</div>
		// 		<p className="mt-3 text-[11px] text-zinc-400 font-medium tracking-tight opacity-70">
		// 			AI-generated responses can be inaccurate. Verify critical code and
		// 			logic.
		// 		</p>
		// 	</div>
		// </div>
		<div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#020617] via-[#020617]/95 to-transparent pt-32 pb-8 px-4">
			<div className="max-w-3xl mx-auto flex flex-col items-center">
				{/* Input Wrapper with Focus Glow */}
				<div className="w-full relative group">
					{/* The "Glow" behind the box - visible on hover/focus */}
					<div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition duration-500" />

					<div className="relative w-full rounded-2xl border border-white/10 bg-[#030712]/80 backdrop-blur-xl shadow-2xl p-2 flex items-end">
						<Textarea
							value={value}
							onChange={(e) => setValue(e.target.value)}
							className="flex-1 min-h-[48px] max-h-[200px] resize-none bg-transparent border-none text-slate-200 placeholder:text-slate-600 focus-visible:ring-0 py-3 px-4 text-sm font-medium leading-relaxed"
							placeholder="Enter prompt for behavioral evaluation..."
							onKeyDown={handleKeyDown}
						/>

						<button
							onClick={handleAction}
							disabled={!value.trim()}
							className="mb-1 mr-1 w-10 h-10 rounded-xl bg-blue-600 text-white hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 transition-all flex items-center justify-center shadow-lg shadow-blue-900/20"
						>
							<ArrowUp size={20} strokeWidth={2.5} />
						</button>
					</div>
				</div>

				{/* System Disclaimer: Matching the "Engineering" vibe */}
				<p className="mt-4 text-[9px] text-slate-500 font-black tracking-[0.2em] uppercase opacity-60 flex items-center gap-2">
					<span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse" />
					Verify Logic & Behavioral Alignment // AI-Generated Output
				</p>
			</div>
		</div>
	);
};
ChatWindow.Messages = Messages;
ChatWindow.Input = Input;
