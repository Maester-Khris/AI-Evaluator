import { X } from "lucide-react";
import { createPortal } from "react-dom";
import { useAuthModal } from "../hooks/useAuthModal";
import { LoginForm } from "./LoginForm";
import SignupForm from "./SignupForm";

const AuthModal = () => {
	const { modal, closeModal } = useAuthModal();

	if (!modal) return null;

	// We use a Portal to ensure the modal isn't trapped inside
	// the Sidebar's CSS (overflow-hidden or z-index)
	return createPortal(
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
			onClick={closeModal}
		>
			<div
				className="bg-zinc-900 border border-zinc-800 p-8 rounded-xl w-full max-w-md shadow-2xl relative"
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={closeModal}
					className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
				>
					<X className="w-5 h-5" />
				</button>

				<div className="mb-6">
					<h2 className="text-white text-2xl font-bold capitalize">{modal}</h2>
					<p className="text-zinc-400 text-sm mt-1">
						{modal === "login"
							? "Welcome back to AI Evaluator"
							: "Create your account to get started"}
					</p>
				</div>

				{/* Dynamic Form Content */}
				{modal === "login" ? <LoginForm /> : <SignupForm />}
			</div>
		</div>,
		document.body,
	);
};

export default AuthModal;
