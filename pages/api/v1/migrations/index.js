import database from "infra/database.js";
import migrationRunner from "node-pg-migrate";
import { join } from "node:path";

export default async function migrations(request, response) {
  const dbClient = await database.getNewClient();

  const defaultMigrationOptions = {
    dbClient: dbClient,
    databaseUrl: process.env.DATABASE_URL,
    dryRun: true,
    dir: join("infra", "migrations"),
    direction: "up",
    verbose: true,
    migrationTable: "pgmigrations",
  };

  if (request.method === "GET") {
    const peddingMigrations = await migrationRunner(defaultMigrationOptions);

    await dbClient.end();

    response.status(200).json(peddingMigrations);
  }

  if (request.method === "POST") {
    const migratedMigrations = await migrationRunner({
      ...defaultMigrationOptions,
      dryRun: false,
    });

    if (migratedMigrations.length > 0) {
      response.status(201).json(migratedMigrations);
    }

    await dbClient.end();

    response.status(200).json(migratedMigrations);
  }

  return response.status(405).end();
}
