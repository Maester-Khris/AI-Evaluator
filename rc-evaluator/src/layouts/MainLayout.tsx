import type React from "react";

interface MainLayoutProps {
	children: React.ReactNode;
	sidebar?: React.ReactNode;
}

const MainLayout = ({ children, sidebar }: MainLayoutProps) => {
	return (
		<div className="flex h-screen w-full bg-slate-950 overflow-hidden">
			{sidebar}

			<main className="flex-1 flex flex-col relative bg-[#2b3142]">
				{children}
			</main>
		</div>
	);
};

export default MainLayout;
