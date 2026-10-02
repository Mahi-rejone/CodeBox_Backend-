import { config } from "./app/config/config";
import { app } from "./app";
import { Server } from "http";
// import seedAdmin from "./app/DB/seedAdmin.js";
import { prisma } from "./app/DB/prisma";

let server: Server;

async function main() {
  try {
    prisma.$connect();
    console.log("Database connected successfully");
    // await seedAdmin();
    server = app.listen(config.port, () => {
      console.log(`Example app listening on port ${config.port}`);
    });
  } catch (err) {
    console.log(err);
  }
}

// Only run a real listening server + seeding locally.
// On Vercel, the exported `app` is called directly per-request instead.
if (!process.env.VERCEL) {
  main();
}

process.on("unhandledRejection", () => {
  console.log(`unhandledRejection is detected, shutting down ...`);
  if (server) {
    server.close(() => process.exit(1));
  }
  process.exit(1);
});

process.on("uncaughtException", () => {
  console.log(`uncaughtException is detected, shutting down ...`);
  process.exit(1);
});

export default app;
