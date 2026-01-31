import ChatSidebar from '@/features/chat/components/ChatSidebar'
import React from 'react'

interface MainLayoutProps {
  children: React.ReactNode
}

const MainLayout = ({children}: MainLayoutProps) => {
  return (
  //   <div className="flex h-screen w-full overflow-hidden bg-[#3B4159]"> {/* Unified bg */}
  // <aside className="w-72 hidden md:flex flex-col border-r border-white/5">
  //   <ChatSidebar />
  // </aside>

  // {/* Remove the white/zinc background here so it inherits the parent or ChatWindow bg */}
  // <main className="flex-1 h-full relative">
  //   {children}
  // </main>
// </div>
<div className="flex h-screen w-full overflow-hidden bg-[#3B4159]">
  {/* Layer 1: Left Sidebar - Ensure no right border is creating a white line */}
  <aside className="w-72 hidden md:flex flex-col bg-zinc-950"> 
    <ChatSidebar />
  </aside>

  {/* Layer 2: Center/Main - Remove bg-white classes here */}
  <main className="flex-1 h-full relative">
    {children}
  </main>
</div>
  )
}

export default MainLayout