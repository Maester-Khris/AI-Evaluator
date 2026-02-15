// src/api/auth/auth.routes.ts
import { Router } from "express";
import { isNonEmptyString, validate } from "../../core/validation.js";
import { AuthService } from "./auth.service.js";

const router = Router();

// POST /api/auth/signup
router.post(
	"/signup",
	validate("body", {
		email: (v) =>
			isNonEmptyString(v) ||
			"email is required and must be a valid email address",
		password: (v) =>
			(isNonEmptyString(v) && v.length >= 6) ||
			"password is required and must be at least 6 characters",
	}),
	async (req, res) => {
		try {
			const tokens = await AuthService.signup(req.body);
			res.status(201).json(tokens);
		} catch (error: any) {
			res.status(400).json({ error: error.message });
		}
	},
);

// POST /api/auth/login
router.post(
	"/login",
	validate("body", {
		email: (v) =>
			isNonEmptyString(v) ||
			"email is required and must be a valid email address",
		password: (v) => isNonEmptyString(v) || "password is required",
	}),
	async (req, res) => {
		try {
			const tokens = await AuthService.login(req.body);
			res.json(tokens);
		} catch (error: any) {
			res.status(401).json({ error: error.message });
		}
	},
);

router.get("/me", async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader?.split(" ")[1];

		if (!token) return res.status(401).json({ error: "No token provided" });
		const decoded = await AuthService.verifyToken(token);

		if (decoded.role === "GUEST") {
			return res.json({
				id: decoded.userId,
				name: "Guest User",
				isGuest: true,
			});
		}

		const user = await AuthService.getUserProfile(decoded.userId);

		res.json(user);
	} catch (error: any) {
		res.status(401).json({ error: error.message });
	}
});

router.post("/guest", async (req, res) => {
	const { name, id } = req.body;
	const result = await AuthService.loginGuest(name, id);
	res.json(result);
});

router.post("/logout", async (req, res) => {
	try {
		const authHeader = req.headers.authorization;
		const token = authHeader?.split(" ")[1];

		if (token) {
			await AuthService.logout(token);
		}
		res.status(200).json({ message: "Logged out successfully" });
	} catch (error) {
		res.status(500).json({ error: "Logout failed" });
	}
});
export default router;
