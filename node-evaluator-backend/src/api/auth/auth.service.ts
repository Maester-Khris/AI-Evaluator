// src/api/auth/auth.service.ts
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../../config/prisma.js";
import { UserDAO } from "../user/user.service.js";
import { AuthMerger } from "./auth.merger.js";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-sparing-partner";

const sanitizeUser = (user: any) => ({
	id: user.id,
	email: user.email,
	name: user.name || user.email.split('@')[0],
	tier: user.tier || 'FREE', // 'FREE' or 'PRO' from your DB
	isGuest: false
});

export const AuthService = {
	// SIGNUP: Domain logic + DAO coordination + Auto login
	async signup(userData: any) {
		const existing = await UserDAO.findByEmail(userData.email);
		if (existing) throw new Error("User already exists");

		const hashedPassword = await bcrypt.hash(userData.password, 10);
		const user = await UserDAO.createUser({
			...userData,
			password: hashedPassword,
		});

		let conversationMappings;
		if (userData.guestId) {
			conversationMappings = await AuthMerger.mergeGuestSession(user.id, userData.guestId);
		}

		const tokens = this.generateTokens(user.id);
		return {
			...tokens,
			user: sanitizeUser(user),
			conversationMappings
		};
	},

	// LOGIN: Verification logic
	async login(credentials: any) {
		const user = await UserDAO.findByEmail(credentials.email);
		if (!user) throw new Error("Invalid credentials");

		const isValid = await bcrypt.compare(credentials.password, user.password);
		if (!isValid) throw new Error("Invalid credentials");

		let conversationMappings;
		if (credentials.guestId) {
			conversationMappings = await AuthMerger.mergeGuestSession(user.id, credentials.guestId);
		}

		const tokens = this.generateTokens(user.id);
		return {
			...tokens,
			user: sanitizeUser(user),
			conversationMappings
		};
	},

	async loginGuest(name: string, id: string) {
		// We sign a token exactly like a real user, but with a 'guest' flag
		const token = jwt.sign(
			{ userId: id, role: "user", isGuest: true },
			process.env.JWT_SECRET!,
			{ expiresIn: "24h" },
		);
		return {
			accessToken: token,
			user: { id, name, email: "guest@internal", tier: "FREE", isGuest: true },
		};
	},

	// TOKEN MANAGEMENT: Pure Domain Logic
	generateTokens(userId: string, role: string = "USER") {
		const accessToken = jwt.sign({ userId, role }, JWT_SECRET, {
			expiresIn: "1h",
		});
		const refreshToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: "7d" });
		return { accessToken, refreshToken };
	},

	// REFRESH: Verifying and rotating
	async refreshToken(token: string) {
		try {
			const payload = jwt.verify(token, JWT_SECRET) as {
				userId: string;
				role: string;
			};
			return this.generateTokens(payload.userId, payload.role);
		} catch (e) {
			throw new Error("Invalid refresh token");
		}
	},

	async verifyToken(token: string) {
		// 1. Check if token is blacklisted
		const isBlacklisted = await UserDAO.findTokenB(token);
		if (isBlacklisted) throw new Error("Token is no longer valid");

		// 2. Verify JWT signature and expiration
		try {
			return jwt.verify(token, process.env.JWT_SECRET!) as {
				userId: string;
				role: string;
			};
		} catch (err) {
			throw new Error("Invalid or expired token");
		}
	},

	async logout(token: string) {
		const decoded = jwt.decode(token) as { exp: number };
		await UserDAO.blacklistToken(token, decoded.exp);
	},

	async getUserProfile(userId: string) {
		return await UserDAO.getUserById(userId);
	},
};
