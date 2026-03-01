process.env.NODE_ENV = "test";

import { execSync } from "child_process";
// import { type Request, type Response } from 'supertest';
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import { prisma } from "../config/prisma.js";
import { Prisma } from "../generated/prisma/edge.js";
import { app } from "../index.js";

describe("Auth Integration", () => {
	beforeAll(async () => {
		try {
			execSync("npx prisma migrate dev --config=./src/prisma.config.ts");
		} catch (error) {
			console.error("Failed to push prisma schema:", error);
			throw error;
		}
	});

	afterAll(async () => {
		prisma.$disconnect();
	});

	beforeEach(async () => {
		// Clear users and tokens to ensure a clean state for each test
		await prisma.blacklistedToken.deleteMany();
		await prisma.user.deleteMany();
	});
	const testUser = {
		email: "test@example.com",
		password: "password123",
		name: "Integration Tester",
	};

	describe("POST /api/auth/signup", () => {
		it("should successfully signup a new user and return tokens", async () => {
			const res = await request(app).post("/api/auth/signup").send(testUser);

			expect(res.status).toBe(201);
			expect(res.body).toHaveProperty("accessToken");
			expect(res.body).toHaveProperty("refreshToken");

			// Verify user was created in DB
			const user = await prisma.user.findUnique({
				where: { email: testUser.email },
			});
			expect(user).toBeTruthy();
			expect(user?.name).toBe(testUser.name);
		});

		it("should fail when signing up with an existing email", async () => {
			// Create first user
			await request(app).post("/api/auth/signup").send(testUser);

			// Attempt duplicate signup
			const res = await request(app).post("/api/auth/signup").send(testUser);

			expect(res.status).toBe(400);
			expect(res.body.error).toMatch(/User already exists/i);
		});
	});

	describe("POST /api/auth/login", () => {
		it("should login with valid credentials", async () => {
			// Setup: Create user
			await request(app).post("/api/auth/signup").send(testUser);

			const res = await request(app).post("/api/auth/login").send({
				email: testUser.email,
				password: testUser.password,
			});

			expect(res.status).toBe(200);
			expect(res.body).toHaveProperty("accessToken");
			expect(res.body).toHaveProperty("refreshToken");
		});

		it("should reject invalid credentials", async () => {
			await request(app).post("/api/auth/signup").send(testUser);

			const res = await request(app).post("/api/auth/login").send({
				email: testUser.email,
				password: "wrongpassword",
			});

			expect(res.status).toBe(401);
		});
	});

	describe("GET /api/auth/me", () => {
		it("should return user profile for authenticated request", async () => {
			// Setup: Signup to get token
			const signupRes = await request(app)
				.post("/api/auth/signup")
				.send(testUser);
			const { accessToken } = signupRes.body;

			const res = await request(app)
				.get("/api/auth/me")
				.set("Authorization", `Bearer ${accessToken}`);

			expect(res.status).toBe(200);
			expect(res.body.email).toBe(testUser.email);
			expect(res.body.name).toBe(testUser.name);
			expect(res.body).not.toHaveProperty("password"); // Ensure password is not leaked
		});

		it("should fail without token", async () => {
			const res = await request(app).get("/api/auth/me");
			expect(res.status).toBe(401);
		});
	});

	describe("POST /api/auth/logout", () => {
		it("should logout and invalidate the token", async () => {
			// Setup: Signup to get token
			const signupRes = await request(app)
				.post("/api/auth/signup")
				.send(testUser);
			const { accessToken } = signupRes.body;

			// Perform Logout
			const logoutRes = await request(app)
				.post("/api/auth/logout")
				.set("Authorization", `Bearer ${accessToken}`);

			expect(logoutRes.status).toBe(200);

			// Verify token is now invalid (blacklisted)
			const meRes = await request(app)
				.get("/api/auth/me")
				.set("Authorization", `Bearer ${accessToken}`);

			expect(meRes.status).toBe(401);
			expect(meRes.body.error).toMatch(/Token is no longer valid/i);
		});
	});
});
