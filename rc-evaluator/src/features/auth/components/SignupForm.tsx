import { AlertCircle, Eye, EyeOff } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Button } from "../../../common/ui/button";
import { Input } from "../../../common/ui/input";
import { useAuth } from "../hooks/useAuth";
import { useAuthModal } from "../hooks/useAuthModal";

export const SignupForm = () => {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
	});
	const [error, setError] = useState<string | null>(null);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const { signup, isLoading } = useAuth();
	const { closeModal, openModal } = useAuthModal();

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
		if (error) setError(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		// Client-side validation (Sparing partner tip: Always validate before hitting Node)
		if (formData.password !== formData.confirmPassword) {
			return setError("Passwords do not match");
		}

		if (formData.password.length < 8) {
			return setError("Password must be at least 8 characters");
		}

		try {
			await signup({
				name: formData.name,
				email: formData.email,
				password: formData.password,
			});
			closeModal();
		} catch (err: any) {
			setError(err.message || "An error occurred during signup");
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && (
				<div className="flex items-center gap-2 p-3 rounded bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
					<AlertCircle className="w-4 h-4" />
					{error}
				</div>
			)}

			<Input
				className="text-white"
				name="name"
				placeholder="Full Name"
				value={formData.name}
				onChange={handleChange}
				required
			/>

			<Input
				className="text-white"
				name="email"
				type="email"
				placeholder="Email address"
				value={formData.email}
				onChange={handleChange}
				required
			/>

			<div className="relative">
				<Input
					className="text-white pr-10" // Fix text color
					name="password"
					type={showPassword ? "text" : "password"}
					placeholder="Password"
					value={formData.password}
					onChange={handleChange}
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

			<div className="relative">
				<Input
					className="text-white pr-10"
					name="confirmPassword"
					type={showConfirmPassword ? "text" : "password"}
					placeholder="Confirm Password"
					value={formData.confirmPassword}
					onChange={handleChange}
					required
				/>
				<button
					type="button"
					onClick={() => setShowConfirmPassword(!showConfirmPassword)}
					className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
				>
					{showConfirmPassword ? (
						<EyeOff className="h-4 w-4" />
					) : (
						<Eye className="h-4 w-4" />
					)}
				</button>
			</div>

			<Button type="submit" className="w-full mt-2" disabled={isLoading}>
				{isLoading ? "Creating account..." : "Create Account"}
			</Button>

			<p className="text-center text-sm text-zinc-500 mt-4">
				Already have an account?{" "}
				<button
					type="button"
					onClick={() => openModal("login")}
					className="text-blue-400 hover:underline font-medium"
				>
					Log in
				</button>
			</p>
		</form>
	);
};

export default SignupForm;
