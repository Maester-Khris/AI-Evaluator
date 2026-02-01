// import { PrismaClient } from "@prisma/client/extension";
import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';

// Resolve the .env file relative to the project root so it works whether
// running from source or from the compiled output directory
dotenv.config({ path: path.resolve(process.cwd(), 'src/.env') });
console.log('DATABASE_URL:', process.env.DATABASE_URL);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,      
  log: ['query', 'info', 'warn', 'error'],
  errorFormat: 'minimal',
});