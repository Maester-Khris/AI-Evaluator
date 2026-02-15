import type React from "react";

interface MainLayoutProps {
	children: React.ReactNode;
	sidebar?: React.ReactNode;
}

const MainLayout = ({ children, sidebar }: MainLayoutProps) => {
	return (
		<div className="flex h-screen w-full overflow-hidden bg-[#3B4159]">
			<aside className="w-72 hidden md:flex flex-col bg-zinc-950">
				{sidebar}
			</aside>
			<main className="flex-1 h-full relative">{children}</main>
		</div>
	);
};

export default MainLayout;
