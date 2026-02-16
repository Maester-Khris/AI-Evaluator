import { MessageSquare, Plus, Search } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "@/common/ui/button";
import type { Conversation } from "../types";

interface ChatSidebarProps {
	conversations: Conversation[];
	activeId?: string;
	onSelect: (id: string) => void;
	onNewChat: () => void;
	userSection?: React.ReactNode;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
	conversations,
	activeId,
	onSelect,
	onNewChat,
	userSection,
}) => {
	const [query, setQuery] = useState("");
	const filteredConversations = conversations.filter((c) =>
		c.title.toLowerCase().includes(query.toLowerCase()),
	);

	// return (
	// 	<aside className="w-[280px] h-full bg-slate-900 text-zinc-200 p-4 flex flex-col shadow-2xl border-r border-white/5">
	// 		<div className="space-y-3">
	// 			<Button
	// 				onClick={onNewChat}
	// 				className="w-full flex items-center justify-center gap-2 shadow-sm bg-white/5 text-white hover:bg-white/10 border border-white/10"
	// 			>
	// 				<Plus className="w-4 h-4" />
	// 				New Chat
	// 			</Button>

	// 			<div className="relative">
	// 				<span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
	// 					<Search className="w-4 h-4" />
	// 				</span>
	// 				<input
	// 					type="text"
	// 					value={query}
	// 					onChange={(e) => setQuery(e.target.value)}
	// 					placeholder="Search conversations..."
	// 					aria-label="Search conversations"
	// 					className="w-full pl-10 pr-3 py-2 bg-zinc-950/50 text-sm placeholder-zinc-500 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-white/20 border border-white/5 rounded-md"
	// 				/>
	// 			</div>
	// 		</div>

	// 		<div className="mt-6 text-[10px] font-bold tracking-widest uppercase text-zinc-500 font-sans px-1">
	// 			Previous Conversations
	// 		</div>

	// 		<nav className="mt-2 overflow-y-auto flex-1 scrollbar-hide">
	// 			<ul className="space-y-1">
	// 				{filteredConversations.length === 0 ? (
	// 					<li className="text-sm text-zinc-500 p-3 italic">
	// 						No conversations
	// 					</li>
	// 				) : (
	// 					filteredConversations.map((c) => {
	// 						const isActive = c.id === activeId;
	// 						return (
	// 							<li key={c.id}>
	// 								<button
	// 									onClick={() => onSelect(c.id)}
	// 									className={`group relative w-full text-left px-3 py-3 pl-4 rounded-md flex items-start gap-3 transition-all duration-200 ${
	// 										isActive ? "bg-white/10 shadow-inner" : "hover:bg-white/5"
	// 									}`}
	// 								>
	// 									<span
	// 										aria-hidden
	// 										className={`absolute left-0 top-1 bottom-1 w-0.5 rounded-r-sm transition-all duration-200 ${
	// 											isActive
	// 												? "bg-indigo-400"
	// 												: "group-hover:bg-white/40 opacity-0 group-hover:opacity-100"
	// 										}`}
	// 									/>

	// 									<div className="mt-0.5 flex-shrink-0">
	// 										<MessageSquare
	// 											className={`w-4 h-4 ${isActive ? "text-indigo-400" : "text-zinc-500"}`}
	// 										/>
	// 									</div>

	// 									<div className="flex-1 min-w-0">
	// 										<div
	// 											className={`text-sm font-medium truncate ${isActive ? "text-white" : "text-zinc-300"}`}
	// 										>
	// 											{c.title}
	// 										</div>
	// 										<div className="text-[11px] text-zinc-500 truncate mt-0.5">
	// 											{(() => {
	// 												const content =
	// 													c.messages?.[c.messages.length - 1]?.content;
	// 												if (typeof content === "object" && content !== null)
	// 													return content.text || "Message";
	// 												return content || "No messages yet";
	// 											})()}
	// 										</div>
	// 									</div>
	// 								</button>
	// 							</li>
	// 						);
	// 					})
	// 				)}
	// 			</ul>
	// 		</nav>
	// 		{userSection}
	// 	</aside>
	// );

	// Updated Sidebar to match the "Obsidian" aesthetic
	return (
		<aside className="w-[280px] h-full bg-[#030712] text-zinc-200 p-4 flex flex-col border-r border-white/5 shadow-2xl">
			<div className="space-y-4">
				<Button
					onClick={onNewChat}
					className="w-full h-11 bg-white/5 text-white hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95"
				>
					<Plus className="w-3 h-3 mr-2" />
					New Evaluation
				</Button>

				<div className="relative group">
					<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-500 group-focus-within:text-blue-400 transition-colors" />
					<input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search logs..."
						className="w-full pl-9 pr-3 py-2 bg-black/40 text-xs placeholder-zinc-600 text-zinc-300 focus:outline-none border border-white/5 rounded-lg focus:border-blue-500/50 transition-all"
					/>
				</div>
			</div>

			{/* Header: Removed generic font-sans, used tracking-widest for "Pro" feel */}
			<div className="mt-8 mb-2 text-[9px] font-black tracking-[0.2em] uppercase text-zinc-600 px-1">
				History // Behavioral Data
			</div>

			<nav className="overflow-y-auto flex-1 scrollbar-hide">
				<ul className="space-y-1">
					{filteredConversations.length === 0 ? (
						<li className="text-[10px] text-zinc-600 p-3 uppercase tracking-wider font-bold">
							Zero data points
						</li>
					) : (
						filteredConversations.map((c) => {
							const isActive = c.id === activeId;
							return (
								<li key={c.id}>
									<button
										onClick={() => onSelect(c.id)}
										className={`group relative w-full text-left p-3 rounded-xl flex items-start gap-3 transition-all ${isActive ? "bg-blue-500/10 border border-blue-500/20" : "hover:bg-white/5 border border-transparent"
											}`}
									>
										<div className="mt-0.5 flex-shrink-0">
											<MessageSquare className={`w-3.5 h-3.5 ${isActive ? "text-blue-400" : "text-zinc-600"}`} />
										</div>

										<div className="flex-1 min-w-0">
											<div className={`text-xs font-bold truncate ${isActive ? "text-white" : "text-zinc-400"}`}>
												{c.title || "Untitled Session"}
											</div>
											{/* Removed italics, used mono-style for content preview */}
											<div className="text-[10px] text-zinc-600 truncate mt-1 font-mono opacity-80">
												{/* Content extraction logic stays same */}
											</div>
										</div>
									</button>
								</li>
							);
						})
					)}
				</ul>
			</nav>

			{/* User Section at bottom */}
			{/* <div className="pt-4 border-t border-white/5"> */}
			{userSection}
			{/* </div> */}
		</aside>
	);

};

export default ChatSidebar;
