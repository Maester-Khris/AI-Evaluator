import { defineConfig } from "@prisma/config";
import * as dotenv from "dotenv";
import path from "path";

// Manually load the .env file
dotenv.config({ path: path.resolve(process.cwd(), "src/.env") });

export default defineConfig({
	schema: path.join(__dirname, "prisma/schema.prisma"),
	migrations: {
		path: path.join(__dirname, "prisma/migrations"),
		seed: `tsx ${path.join(__dirname, "prisma/seed.ts")}`,
	},
	datasource: {
		url: process.env.DATABASE_URL!,
	},
});
