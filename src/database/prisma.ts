import "dotenv/config";

import { PrismaClient } from "../generated/prisma";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.MYSQLHOST!,
  port: Number(process.env.MYSQLPORT),
  user: process.env.MYSQLUSER!,
  password: process.env.MYSQLPASSWORD!,
  database: process.env.MYSQLDATABASE!,
  connectionLimit: 5,
  connectTimeout: 5000,
  allowPublicKeyRetrieval: true,
});

export const prisma = new PrismaClient({
  adapter,
});
