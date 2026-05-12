import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

let prismaInstance: PrismaClient;

export const getPrismaClient = () => {
  if (!prismaInstance) {
    prismaInstance = new PrismaClient({
      datasources: {
        db: {
          url: env.DATABASE_URL,
        },
      },
      log: ['error'],
    });
  }
  return prismaInstance;
};

export const checkDatabaseConnection = async () => {
  try {
    const client = getPrismaClient();
    await client.$connect();
    await client.$queryRaw`SELECT 1`;
    await client.$disconnect();
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
};

export const prisma = getPrismaClient();
