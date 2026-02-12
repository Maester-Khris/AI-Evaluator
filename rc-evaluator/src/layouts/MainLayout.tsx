import type React from "react";

interface MainLayoutProps {
	children: React.ReactNode;
	sidebar?: React.ReactNode;
}

const MainLayout = ({ children, sidebar }: MainLayoutProps) => {
	return (
		<div className="flex h-screen w-full overflow-hidden bg-[#3B4159]">
			{/* Layer 1: Left Sidebar - Ensure no right border is creating a white line */}
			<aside className="w-72 hidden md:flex flex-col bg-zinc-950">
				{/* <ChatSidebar /> */}
				{sidebar} {/* Render whatever sidebar the page provides */}
			</aside>

			{/* Layer 2: Center/Main - Remove bg-white classes here */}
			<main className="flex-1 h-full relative">{children}</main>
		</div>
	);
};

export default MainLayout;
