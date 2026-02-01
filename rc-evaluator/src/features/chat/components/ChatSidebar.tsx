import React, { useState } from 'react'
import { Button } from '@/common/ui/button'
import { MessageSquare, Search, Plus } from 'lucide-react'
import type { Conversation } from '../types';

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  onNewChat: () => void;
}

const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  activeId,
  onSelect,
  onNewChat,
}) => {
  const [query, setQuery] = useState('');
  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <aside className="w-[280px] h-full bg-slate-900 text-zinc-200 p-4 flex flex-col shadow-2xl border-r border-white/5">
      <div className="space-y-3">
        {/* Corrected: Added onNewChat */}
        <Button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 shadow-sm bg-white/5 text-white hover:bg-white/10 border border-white/10"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>

        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search conversations..."
            aria-label="Search conversations"
            className="w-full pl-10 pr-3 py-2 bg-zinc-950/50 text-sm placeholder-zinc-500 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-white/20 border border-white/5 rounded-md"
          />
        </div>
      </div>

      <div className="mt-6 text-[10px] font-bold tracking-widest uppercase text-zinc-500 font-sans px-1">
        Previous Conversations
      </div>

      <nav className="mt-2 overflow-y-auto flex-1 scrollbar-hide">
        <ul className="space-y-1">
          {filteredConversations.length === 0 ? (
            <li className="text-sm text-zinc-500 p-3 italic">No conversations</li>
          ) : (
            filteredConversations.map((c) => {
              const isActive = c.id === activeId;
              return (
                <li key={c.id}>
                  <button
                    onClick={() => onSelect(c.id)} // Corrected: Uses onSelect prop
                    className={`group relative w-full text-left px-3 py-3 pl-4 rounded-md flex items-start gap-3 transition-all duration-200 ${isActive ? 'bg-white/10 shadow-inner' : 'hover:bg-white/5'
                      }`}
                  >
                    {/* Left accent bar */}
                    <span
                      aria-hidden
                      className={`absolute left-0 top-1 bottom-1 w-0.5 rounded-r-sm transition-all duration-200 ${isActive ? 'bg-indigo-400' : 'group-hover:bg-white/40 opacity-0 group-hover:opacity-100'
                        }`}
                    />

                    <div className="mt-0.5 flex-shrink-0">
                      <MessageSquare className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-zinc-500'}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-medium truncate ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                        {c.title}
                      </div>
                      {/* Note: Ensure c.messages[0] exists or add a lastMessage field to type */}
                      <div className="text-[11px] text-zinc-500 truncate mt-0.5">
                        {c.messages?.[c.messages.length - 1]?.content || "No messages yet"}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </nav>
    </aside>
  );
}

export default ChatSidebar


// const [query, setQuery] = React.useState('')
// const [activeId, setActiveId] = React.useState<string | null>(initialConversations[0]?.id ?? null)
// const [conversations] = React.useState(initialConversations)

// const filtered = React.useMemo(
//   () =>
//     conversations.filter(
//       (c) =>
//         c.title.toLowerCase().includes(query.trim().toLowerCase()) ||
//         c.last.toLowerCase().includes(query.trim().toLowerCase())
//     ),
//   [conversations, query]
// )

// return (
//   <aside className="w-[280px] h-full bg-slate-900 text-zinc-200 p-4 flex flex-col shadow-2xl border-r border-white/5">
//     <div className="space-y-3">
//       <Button
//         className="w-full flex items-center justify-center gap-2 shadow-sm bg-white/5 text-white hover:bg-white/10"
//       >
//         <Plus className="w-4 h-4" />
//         New Chat
//       </Button>

//       <div className="relative">
//         <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
//           <Search className="w-4 h-4" />
//         </span>
//         <input
//           type="text"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Search conversations..."
//           aria-label="Search conversations"
//           className="w-full pl-10 pr-3 py-2 bg-transparent text-sm placeholder-zinc-500 text-zinc-300 focus:outline-none focus:ring-0 border border-white/5"
//         />
//       </div>
//     </div>

//     <div className="mt-4 text-[10px] font-bold tracking-widest uppercase text-zinc-400 font-sans">Previous Conversations</div>

//     <nav className="mt-2 overflow-y-auto flex-1">
//       <ul className="space-y-2">
//         {filteredConversations.length === 0 ? (
//           <li className="text-sm text-zinc-500 p-3">No conversations</li>
//         ) : (
//           filteredConversations.map((c) => {
//             const isActive = c.id === activeId
//             return (
//               <li key={c.id}>
//                 <button
//                   onClick={() => setActiveId(c.id)}
//                   className={`group relative w-full text-left px-3 py-2 pl-4 rounded-md flex items-start gap-3 transition-colors duration-200 ease-in-out ${
//                     isActive ? 'bg-white/10' : 'hover:bg-white/6'
//                   }`}
//                 >
//                   {/* left accent bar */}
//                   <span
//                     aria-hidden
//                     className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-r-sm transition-all duration-200 ${
//                       isActive ? 'bg-white' : 'group-hover:bg-white/80 opacity-0 group-hover:opacity-100'
//                     }`}
//                   />
//                   <div className="mt-0.5">
//                     <MessageSquare className="w-5 h-5 text-zinc-300" />
//                   </div>
//                   <div className="flex-1">
//                     <div className="text-sm font-medium text-white font-sans">{c.title}</div>
//                     <div className="text-xs text-zinc-400 truncate">{c.last}</div>
//                   </div>
//                 </button>
//               </li>
//             )
//           })
//         )}
//       </ul>
//     </nav>
//   </aside>
// )