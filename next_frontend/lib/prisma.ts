import { PrismaClient } from "./generated/prisma";

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // Ensure the prisma instance is re-used during hot-reloading
  // Prevents exhausting database connection limit.
  // @ts-expect-error - `global` is not typed correctly by default
  if (!global.prisma) {
    // @ts-expect-error - `global` is not typed correctly by default
    global.prisma = new PrismaClient();
  }
  // @ts-expect-error - `global` is not typed correctly by default
  prisma = global.prisma;
}

export default prisma;
