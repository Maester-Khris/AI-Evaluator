import { ArrowUp, Bot, Copy, User } from "lucide-react";
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
		<div className="flex flex-col h-full relative bg-[#3B4159] font-sans selection:bg-zinc-700/50">
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
		<ScrollArea ref={scrollRef} className="flex-1 h-full overflow-hidden">
			<div className="pt-[10vh] pb-48 px-4 md:px-0">
				<div className="max-w-3xl mx-auto space-y-12">
					{messages.length === 0 ? (
						<div className="text-center py-20">
							<h1 className="text-4xl font-bold tracking-tight text-zinc-100 opacity-80 italic">
								How can I help you today?
							</h1>
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
										className={`flex gap-3 max-w-[85%] md:max-w-[80%] ${isAssistant ? "flex-row" : "flex-row-reverse text-right"}`}
									>
										<div
											className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border mt-1 shadow-sm ${isAssistant
												? "bg-[#2D3249] border-white/10 text-zinc-300"
												: "bg-white border-white/20 text-zinc-900"
												}`}
										>
											{isAssistant ? <Bot size={16} /> : <User size={16} />}
										</div>

										<div className="flex flex-col">
											<span className="text-[10px] font-bold tracking-[0.15em] uppercase text-zinc-400/80 mb-0.5 px-1">
												{isAssistant ? "AI Evaluator" : "You"}
											</span>

											<div
												className={`prose prose-invert prose-sm max-w-none rounded-2xl p-4 shadow-lg border ${isAssistant
													? "bg-[#2D3249]/60 border-white/5 text-zinc-200 rounded-tl-none"
													: "bg-zinc-800 border-white/10 text-zinc-100 rounded-tr-none text-left"
													}`}
											>
												<ReactMarkdown
													components={{
														code({
															node,
															inline,
															className,
															children,
															...props
														}: any) {
															const match = /language-(\w+)/.exec(
																className || "",
															);
															const codeValue = String(children).replace(
																/\n$/,
																"",
															);

															return !inline && match ? (
																<div className="relative my-2 group/code">
																	<div className="absolute right-2 top-2 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
																		<button className="p-1.5 rounded-md bg-[#1e1e1e] border border-white/10 hover:bg-zinc-800 text-zinc-400">
																			<Copy size={12} />
																		</button>
																	</div>
																	<SyntaxHighlighter
																		style={vscDarkPlus}
																		language={match[1]}
																		PreTag="div"
																		className="rounded-xl border border-white/5 !bg-[#1e1e1e] !m-0 !p-4"
																		{...props}
																	>
																		{codeValue}
																	</SyntaxHighlighter>
																</div>
															) : (
																<code
																	className="bg-black/30 rounded px-1.5 py-0.5 font-mono text-zinc-300"
																	{...props}
																>
																	{children}
																</code>
															);
														},
													}}
												>
													{textToShow}
												</ReactMarkdown>
												{isAssistant && (
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
			// CALL THE PROP HERE - This fixes the TS6133 error
			onSubmit(value.trim());
			setValue("");
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		// Check if Enter was pressed without Shift
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault(); // Prevent the default behavior (new line)
			handleAction(); // Trigger your send logic
		}
	};

	return (
		/* z-20: Keeps the input on top of scrolling messages.
	   bg-gradient: Mask messages as they scroll up. 
	*/
		<div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-[#3B4159] via-[#3B4159] to-transparent pt-24 pb-6 px-4">
			<div className="max-w-3xl mx-auto flex flex-col items-center">
				{/* Floating Input Container */}
				<div className="w-full relative rounded-2xl border border-white/10 bg-[#2D3249]/90 backdrop-blur-xl shadow-2xl p-1.5 flex items-end">
					<Textarea
						value={value}
						onChange={(e) => setValue(e.target.value)}
						className="flex-1 min-h-[44px] max-h-[200px] resize-none bg-transparent border-none text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-0"
						placeholder="Message AI Evaluator..."
						onKeyDown={handleKeyDown}
					/>
					<button
						onClick={handleAction}
						className="mb-1.5 mr-1.5 w-9 h-9 rounded-xl bg-zinc-100 text-zinc-950 hover:bg-white transition-all flex items-center justify-center"
					>
						<ArrowUp size={20} />
					</button>
				</div>

				{/* AI Warning: Back in place and perfectly centered */}
				<p className="mt-3 text-[11px] text-zinc-400 font-medium tracking-tight opacity-70">
					AI-generated responses can be inaccurate. Verify critical code and
					logic.
				</p>
			</div>
		</div>
	);
};
ChatWindow.Messages = Messages;
ChatWindow.Input = Input;
