import { PrismaPg } from "@prisma/adapter-pg";
import * as dotenv from "dotenv";
import path from "path";
import pg from "pg";
import { PrismaClient } from "../generated/prisma/index.js";

// 1. Force load env before anything else
dotenv.config({ path: path.resolve(process.cwd(), "src/.env") });

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
	console.log("Seeding database...");

	console.log("clean existing tables");
	await prisma.$transaction([
		prisma.message.deleteMany(),
		prisma.conversation.deleteMany(),
		prisma.user.deleteMany(),
	]);

	// Using upsert ensures that if you run the script twice,
	// it won't crash due to "Unique Constraint" errors.
	const guestUser = await prisma.user.upsert({
		where: { email: "guest@example.com" },
		update: {},
		create: {
			email: "guest@example.com",
			name: "Guest User",
			password: "hashed_dummy_password", // In a real scenario, hash this
		},
	});

	console.log({ guestUser });
	console.log("Seed finished.");
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
