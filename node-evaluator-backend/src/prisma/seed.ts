// src/prisma/seed.ts

// import {prisma} from "../config/prisma.js";
// import { PrismaClient } from '../generated/prisma/index.js'; 
// const prisma = new PrismaClient();

import { PrismaClient } from '../generated/prisma/index.js';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import * as dotenv from 'dotenv';
import path from 'path';

// 1. Force load env before anything else
dotenv.config({ path: path.resolve(process.cwd(), 'src/.env') });

// 2. Instantiate a clean client (Standard engine, no adapters)
// This avoids the "undefined" race condition in your config file
// const prisma = new PrismaClient({
//   datasources: {
//     db: { url: process.env.DATABASE_URL }
//   }
// });
const connectionString = `${process.env.DATABASE_URL}`;
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });



async function main() {
  console.log('Seeding database...');

  // Using upsert ensures that if you run the script twice, 
  // it won't crash due to "Unique Constraint" errors.
  const guestUser = await prisma.user.upsert({
    where: { email: 'guest@example.com' },
    update: {},
    create: {
      email: 'guest@example.com',
      name: 'Guest User',
      password: 'hashed_dummy_password', // In a real scenario, hash this
    },
  });

  console.log({ guestUser });
  console.log('Seed finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


  // src/prisma/seed.ts

// async function main() {
//   console.log('🌱 Seeding database...');
  
//   await prisma.user.upsert({
//     where: { email: 'guest@example.com' },
//     update: {},
//     create: {
//       id: 'guest-id',
//       email: 'guest@example.com',
//       name: 'Guest User',
//       password: 'hashed_dummy_password',
//     },
//   });

//   console.log('✅ Seed finished.');
// }

// main()
//   .catch((e) => {
//     console.error('❌ Seed failed:', e.message);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });