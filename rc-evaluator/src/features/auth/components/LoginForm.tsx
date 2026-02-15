import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Button } from "../../../common/ui/button";
import { Input } from "../../../common/ui/input";
import { useAuth } from "../hooks/useAuth";
import { useAuthModal } from "../hooks/useAuthModal";

export const LoginForm = () => {
	const [email, setEmail] = useState("formationnikit@gmail.com");
	const [password, setPassword] = useState("nk1234567");
	const [showPassword, setShowPassword] = useState(false);
	const { login, isLoading } = useAuth(); // The IDENTITY hook
	const { closeModal, openModal } = useAuthModal(); // The UI hook

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			// 1. Call your Node.js backend via the Auth Context
			await login({ email, password });
			// 2. If successful, close the door
			closeModal();
		} catch (err) {
			console.error("Login failed", err);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			<Input
				className="text-white"
				type="email"
				placeholder="Email"
				value={email}
				onChange={(e) => setEmail(e.target.value)}
				required
			/>
			<div className="relative">
				<Input
					className="text-white pr-10"
					type={showPassword ? "text" : "password"}
					placeholder="Password"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
				/>
				<button
					type="button"
					onClick={() => setShowPassword(!showPassword)}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
				>
					{showPassword ? (
						<EyeOff className="h-4 w-4" />
					) : (
						<Eye className="h-4 w-4" />
					)}
				</button>
			</div>
			<Button type="submit" className="w-full" disabled={isLoading}>
				{isLoading ? "Connecting..." : "Login"}
			</Button>

			<p className="text-center text-sm text-zinc-500 mt-4">
				Don't have an account?{" "}
				<button
					type="button"
					onClick={() => openModal("signup")}
					className="text-blue-400 hover:underline"
				>
					Sign up
				</button>
			</p>
		</form>
	);
};
