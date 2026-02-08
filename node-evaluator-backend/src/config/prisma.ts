import { PrismaClient } from '../generated/prisma/index.js';
import dotenv from 'dotenv';
import path from 'path';

// Resolve the .env file relative to the project root so it works whether
// running from source or from the compiled output directory
dotenv.config({ path: path.resolve(process.cwd(), 'src/.env') });

const isTest = process.env.NODE_ENV === 'test';
let prisma: PrismaClient;

import('pg').then(({ default: pg }) => {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  import('@prisma/adapter-pg').then(({ PrismaPg }) => {
    const adapter = new PrismaPg(pool);
    prisma = new PrismaClient({ adapter });
  });
});

export { prisma };

