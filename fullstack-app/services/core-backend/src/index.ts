import { createApp } from "./app";
import { env } from "./env";
import { prisma } from "./lib/prisma";

async function bootstrap(): Promise<void> {
  try {
    await prisma.$connect();
    console.log(`Connected to PostgreSQL (${env.NODE_ENV})`);
  } catch (err) {
    console.error("Fatal: could not connect to the database. Check DATABASE_URL.");
    console.error(err);
    process.exit(1);
  }

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`SIH26090 core-backend listening on http://localhost:${env.PORT}`);
  });
}

void bootstrap();